/**
 * Hire a Peer — Express Routes
 * Add these to your main Railway Express server.
 *
 * SETUP:
 *  1. Run the SQL in hire-peer-schema.sql against your Neon Postgres DB.
 *  2. Import this file in your main server.js:
 *       const hirePeerRoutes = require('./hire-peer-routes');
 *       app.use(hirePeerRoutes);
 *
 * SECURITY MODEL:
 *  - user_id is passed in request body/query from the authenticated frontend (Clerk user.id)
 *  - Admin check: ADMIN_USER_IDS env var is a comma-separated list of Clerk user IDs
 *  - Mutation routes validate ownership before allowing changes
 *  - Contact info (whatsapp, phone) is hidden unless an order exists between seeker & expert
 */

const express = require('express');
const router = express.Router();

// ─── Helper: get DB pool from your existing setup ─────────────────────────────
// This expects `pool` to be available via require('../db') or similar.
// Adjust the path to match your server's DB connection export.
let pool;
try {
  pool = require('./db'); // adjust path as needed
} catch (e) {
  console.warn('[HirePeer] Could not load DB pool. Make sure ./db.js exports the pool.');
}

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

function isAdmin(userId) {
  return ADMIN_USER_IDS.includes(userId);
}

async function query(sql, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERT PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/expert-profiles
 * Returns all APPROVED expert profiles, optionally filtered by college.
 */
router.get('/api/expert-profiles', async (req, res) => {
  try {
    const { college_name, user_id } = req.query;
    let sql = `
      SELECT ep.*, 
             COUNT(DISTINCT ps.id) AS service_count,
             COALESCE(AVG(po.rating), 0) AS avg_rating,
             COUNT(DISTINCT po.id) AS total_orders
      FROM expert_profiles ep
      LEFT JOIN peer_services ps ON ps.expert_user_id = ep.user_id AND ps.status = 'approved'
      LEFT JOIN peer_orders po ON po.service_id = ps.id AND po.rating IS NOT NULL
      WHERE ep.verification_status = 'approved'
    `;
    const params = [];
    if (college_name) {
      params.push(college_name);
      sql += ` AND ep.college_name = $${params.length}`;
    }
    sql += ' GROUP BY ep.id ORDER BY avg_rating DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /api/expert-profiles]', err.message);
    res.status(500).json({ error: 'Failed to fetch expert profiles' });
  }
});

/**
 * GET /api/expert-profiles/:user_id
 * Returns a single expert profile (public data only).
 */
router.get('/api/expert-profiles/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { requester_id } = req.query; // the logged-in user's ID

    const result = await query(`
      SELECT ep.*,
             COALESCE(AVG(po.rating), 0) AS avg_rating,
             COUNT(DISTINCT po.id) AS total_orders
      FROM expert_profiles ep
      LEFT JOIN peer_services ps ON ps.expert_user_id = ep.user_id
      LEFT JOIN peer_orders po ON po.service_id = ps.id AND po.rating IS NOT NULL
      WHERE ep.user_id = $1
      GROUP BY ep.id
    `, [user_id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Expert not found' });

    const profile = { ...result.rows[0] };

    // Hide contact info unless requester has an active/completed order with this expert
    if (requester_id && requester_id !== user_id) {
      const orderCheck = await query(`
        SELECT 1 FROM peer_orders po
        JOIN peer_services ps ON po.service_id = ps.id
        WHERE po.seeker_user_id = $1 AND ps.expert_user_id = $2
          AND po.status IN ('confirmed', 'in_progress', 'completed')
        LIMIT 1
      `, [requester_id, user_id]);
      if (orderCheck.rows.length === 0) {
        profile.contact_whatsapp = null;
        profile.contact_phone = null;
      }
    } else if (!requester_id) {
      profile.contact_whatsapp = null;
      profile.contact_phone = null;
    }

    res.json(profile);
  } catch (err) {
    console.error('[GET /api/expert-profiles/:user_id]', err.message);
    res.status(500).json({ error: 'Failed to fetch expert profile' });
  }
});

/**
 * POST /api/expert-profiles
 * Create or update the calling user's expert profile.
 * Body: { user_id, display_name, bio, college_name, skills[], availability, sample_work_urls[] }
 */
router.post('/api/expert-profiles', async (req, res) => {
  try {
    const {
      user_id, display_name, bio, college_name,
      skills, availability, sample_work_urls, contact_whatsapp
    } = req.body;

    if (!user_id || !display_name || !college_name) {
      return res.status(400).json({ error: 'user_id, display_name, and college_name are required' });
    }
    if (!sample_work_urls || !Array.isArray(sample_work_urls) || sample_work_urls.length === 0) {
      return res.status(400).json({ error: 'At least one sample work image is required for the Trust Protocol' });
    }

    // Upsert: if profile exists, update it (reset to pending for re-verification if samples changed)
    const existing = await query('SELECT id, verification_status FROM expert_profiles WHERE user_id = $1', [user_id]);

    if (existing.rows.length > 0) {
      const prev = existing.rows[0];
      const newStatus = prev.verification_status === 'approved' ? 'approved' : 'pending';
      await query(`
        UPDATE expert_profiles SET
          display_name = $1, bio = $2, college_name = $3,
          skills = $4, availability = $5, sample_work_urls = $6,
          contact_whatsapp = $7, verification_status = $8, updated_at = NOW()
        WHERE user_id = $9
      `, [display_name, bio, college_name, JSON.stringify(skills || []), availability, JSON.stringify(sample_work_urls), contact_whatsapp, newStatus, user_id]);
      return res.json({ message: 'Profile updated', status: newStatus });
    } else {
      await query(`
        INSERT INTO expert_profiles
          (user_id, display_name, bio, college_name, skills, availability, sample_work_urls, contact_whatsapp, verification_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      `, [user_id, display_name, bio, college_name, JSON.stringify(skills || []), availability, JSON.stringify(sample_work_urls), contact_whatsapp]);
      return res.status(201).json({ message: 'Expert profile created, pending verification' });
    }
  } catch (err) {
    console.error('[POST /api/expert-profiles]', err.message);
    res.status(500).json({ error: 'Failed to create expert profile' });
  }
});

/**
 * PUT /api/expert-profiles/:user_id/verify
 * Admin only: approve or reject an expert.
 * Body: { admin_user_id, verification_status: 'approved'|'rejected', admin_note }
 */
router.put('/api/expert-profiles/:user_id/verify', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { admin_user_id, verification_status, admin_note } = req.body;

    if (!isAdmin(admin_user_id)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    if (!['approved', 'rejected'].includes(verification_status)) {
      return res.status(400).json({ error: 'Invalid verification_status' });
    }

    await query(`
      UPDATE expert_profiles SET verification_status = $1, admin_note = $2, updated_at = NOW()
      WHERE user_id = $3
    `, [verification_status, admin_note || null, user_id]);

    res.json({ message: `Expert profile ${verification_status}` });
  } catch (err) {
    console.error('[PUT /api/expert-profiles/:user_id/verify]', err.message);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PEER SERVICES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/peer-services
 * Public: list approved services. Filter by category, college, search.
 */
router.get('/api/peer-services', async (req, res) => {
  try {
    const { category, college_name, search, expert_user_id, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT ps.*,
             ep.display_name AS expert_name,
             ep.verification_status AS expert_verified,
             ep.availability,
             COALESCE(AVG(po.rating), 0) AS avg_rating,
             COUNT(DISTINCT po.id) AS review_count
      FROM peer_services ps
      JOIN expert_profiles ep ON ep.user_id = ps.expert_user_id
      LEFT JOIN peer_orders po ON po.service_id = ps.id AND po.rating IS NOT NULL
      WHERE ps.status = 'approved' AND ep.verification_status = 'approved'
    `;
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND ps.category = $${params.length}`;
    }
    if (college_name) {
      params.push(college_name);
      sql += ` AND ps.college_name = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (ps.title ILIKE $${params.length} OR ps.description ILIKE $${params.length})`;
    }
    if (expert_user_id) {
      params.push(expert_user_id);
      sql += ` AND ps.expert_user_id = $${params.length}`;
    }

    sql += ` GROUP BY ps.id, ep.display_name, ep.verification_status, ep.availability ORDER BY avg_rating DESC, ps.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /api/peer-services]', err.message);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

/**
 * GET /api/peer-services/:id
 * Public: single service detail including full portfolio.
 */
router.get('/api/peer-services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT ps.*,
             ep.display_name AS expert_name,
             ep.bio AS expert_bio,
             ep.skills AS expert_skills,
             ep.verification_status AS expert_verified,
             ep.availability,
             ep.college_name AS expert_college,
             COALESCE(AVG(po.rating), 0) AS avg_rating,
             COUNT(DISTINCT po.id) AS review_count
      FROM peer_services ps
      JOIN expert_profiles ep ON ep.user_id = ps.expert_user_id
      LEFT JOIN peer_orders po ON po.service_id = ps.id AND po.rating IS NOT NULL
      WHERE ps.id = $1
      GROUP BY ps.id, ep.display_name, ep.bio, ep.skills, ep.verification_status, ep.availability, ep.college_name
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    // Also get recent reviews
    const reviews = await query(`
      SELECT po.rating, po.review_text, po.created_at,
             po.seeker_user_id
      FROM peer_orders po
      WHERE po.service_id = $1 AND po.rating IS NOT NULL
      ORDER BY po.created_at DESC LIMIT 5
    `, [id]);

    res.json({ ...result.rows[0], reviews: reviews.rows });
  } catch (err) {
    console.error('[GET /api/peer-services/:id]', err.message);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

/**
 * POST /api/peer-services
 * Create a new service listing (auto-status: pending admin approval).
 * Expert must have an approved expert profile first.
 */
router.post('/api/peer-services', async (req, res) => {
  try {
    const {
      expert_user_id, title, description, category,
      price_basic, price_standard, price_premium,
      delivery_days, delivery_method, portfolio_urls, tags, college_name
    } = req.body;

    if (!expert_user_id || !title || !category || !price_basic || !college_name) {
      return res.status(400).json({ error: 'expert_user_id, title, category, price_basic, college_name are required' });
    }

    // Security: verify the expert profile is approved
    const expertCheck = await query(
      'SELECT verification_status FROM expert_profiles WHERE user_id = $1',
      [expert_user_id]
    );
    if (expertCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You must create and get your Expert Profile verified first.' });
    }
    if (expertCheck.rows[0].verification_status !== 'approved') {
      return res.status(403).json({ error: 'Your Expert Profile is pending approval. Please wait for admin verification.' });
    }

    const result = await query(`
      INSERT INTO peer_services
        (expert_user_id, title, description, category, price_basic, price_standard, price_premium,
         delivery_days, delivery_method, portfolio_urls, tags, college_name, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending')
      RETURNING id
    `, [expert_user_id, title, description, category, price_basic,
        price_standard || null, price_premium || null,
        delivery_days || 3, delivery_method || 'On-Campus Handover',
        JSON.stringify(portfolio_urls || []), JSON.stringify(tags || []), college_name]);

    res.status(201).json({ message: 'Service listed, pending admin approval', id: result.rows[0].id });
  } catch (err) {
    console.error('[POST /api/peer-services]', err.message);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

/**
 * PUT /api/peer-services/:id
 * Update a service. Owner or admin only.
 * Body: { requesting_user_id, ...fields }
 */
router.put('/api/peer-services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { requesting_user_id, title, description, price_basic, price_standard, price_premium,
            delivery_days, delivery_method, portfolio_urls, tags, status } = req.body;

    const existing = await query('SELECT expert_user_id FROM peer_services WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    const isOwner = existing.rows[0].expert_user_id === requesting_user_id;
    const admin = isAdmin(requesting_user_id);

    if (!isOwner && !admin) return res.status(403).json({ error: 'Forbidden' });

    // Admin can change status; owner cannot directly approve their own
    const newStatus = admin && status ? status : (isOwner ? 'pending' : undefined);

    await query(`
      UPDATE peer_services SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price_basic = COALESCE($3, price_basic),
        price_standard = COALESCE($4, price_standard),
        price_premium = COALESCE($5, price_premium),
        delivery_days = COALESCE($6, delivery_days),
        delivery_method = COALESCE($7, delivery_method),
        portfolio_urls = COALESCE($8, portfolio_urls),
        tags = COALESCE($9, tags),
        status = COALESCE($10, status),
        updated_at = NOW()
      WHERE id = $11
    `, [title, description, price_basic, price_standard, price_premium,
        delivery_days, delivery_method,
        portfolio_urls ? JSON.stringify(portfolio_urls) : null,
        tags ? JSON.stringify(tags) : null,
        newStatus, id]);

    res.json({ message: 'Service updated' });
  } catch (err) {
    console.error('[PUT /api/peer-services/:id]', err.message);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

/**
 * DELETE /api/peer-services/:id
 * Owner or admin only.
 */
router.delete('/api/peer-services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { requesting_user_id } = req.body;

    const existing = await query('SELECT expert_user_id FROM peer_services WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    if (existing.rows[0].expert_user_id !== requesting_user_id && !isAdmin(requesting_user_id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await query('DELETE FROM peer_services WHERE id = $1', [id]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('[DELETE /api/peer-services/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PEER ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/peer-orders
 * Get orders for the requesting user (either as seeker or expert).
 */
router.get('/api/peer-orders', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    const result = await query(`
      SELECT po.*,
             ps.title AS service_title, ps.category, ps.delivery_method, ps.price_basic,
             ep.display_name AS expert_name,
             ep.contact_whatsapp AS expert_contact
      FROM peer_orders po
      JOIN peer_services ps ON po.service_id = ps.id
      JOIN expert_profiles ep ON ep.user_id = ps.expert_user_id
      WHERE po.seeker_user_id = $1 OR ps.expert_user_id = $1
      ORDER BY po.created_at DESC
    `, [user_id]);

    // Hide expert contact if order is not yet confirmed
    const sanitized = result.rows.map(row => {
      if (!['confirmed', 'in_progress', 'completed'].includes(row.status)) {
        return { ...row, expert_contact: null };
      }
      return row;
    });

    res.json(sanitized);
  } catch (err) {
    console.error('[GET /api/peer-orders]', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * POST /api/peer-orders
 * Seeker places an order. Body: { seeker_user_id, service_id, pricing_tier, requirements, handover_location }
 */
router.post('/api/peer-orders', async (req, res) => {
  try {
    const { seeker_user_id, service_id, pricing_tier, requirements, handover_location } = req.body;
    if (!seeker_user_id || !service_id || !pricing_tier) {
      return res.status(400).json({ error: 'seeker_user_id, service_id, and pricing_tier are required' });
    }

    // Security: prevent hiring yourself
    const serviceCheck = await query('SELECT expert_user_id, price_basic, price_standard, price_premium, status FROM peer_services WHERE id = $1', [service_id]);
    if (serviceCheck.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    const svc = serviceCheck.rows[0];
    if (svc.status !== 'approved') return res.status(400).json({ error: 'Service is not available' });
    if (svc.expert_user_id === seeker_user_id) return res.status(400).json({ error: 'You cannot hire yourself' });

    const priceMap = { basic: svc.price_basic, standard: svc.price_standard, premium: svc.price_premium };
    const amount = priceMap[pricing_tier];
    if (!amount) return res.status(400).json({ error: 'Invalid pricing tier' });

    const result = await query(`
      INSERT INTO peer_orders (seeker_user_id, service_id, pricing_tier, amount, requirements, handover_location, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id
    `, [seeker_user_id, service_id, pricing_tier, amount, requirements || null, handover_location || null]);

    res.status(201).json({ message: 'Order placed successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('[POST /api/peer-orders]', err.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

/**
 * PUT /api/peer-orders/:id/status
 * Update order status. Expert can confirm/complete; seeker can cancel; admin can do anything.
 * Body: { requesting_user_id, status, rating, review_text }
 */
router.put('/api/peer-orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { requesting_user_id, status, rating, review_text } = req.body;

    const orderResult = await query(`
      SELECT po.*, ps.expert_user_id FROM peer_orders po
      JOIN peer_services ps ON po.service_id = ps.id
      WHERE po.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orderResult.rows[0];

    const isExpert = order.expert_user_id === requesting_user_id;
    const isSeeker = order.seeker_user_id === requesting_user_id;
    const admin = isAdmin(requesting_user_id);

    if (!isExpert && !isSeeker && !admin) return res.status(403).json({ error: 'Forbidden' });

    // Status transition rules
    const allowed = {
      expert: ['confirmed', 'in_progress', 'completed'],
      seeker: ['cancelled'],
      admin: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'],
    };
    const role = admin ? 'admin' : isExpert ? 'expert' : 'seeker';
    if (!allowed[role].includes(status)) {
      return res.status(400).json({ error: `Role '${role}' cannot set status to '${status}'` });
    }

    await query(`
      UPDATE peer_orders SET
        status = $1,
        rating = COALESCE($2, rating),
        review_text = COALESCE($3, review_text),
        updated_at = NOW()
      WHERE id = $4
    `, [status, rating || null, review_text || null, id]);

    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('[PUT /api/peer-orders/:id/status]', err.message);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
