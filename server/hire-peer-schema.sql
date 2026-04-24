-- ══════════════════════════════════════════════════════════════════════════════
-- Hire a Peer — Neon PostgreSQL Schema
-- Run this once against your Neon DB.
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Expert Profiles (Trust Protocol)
CREATE TABLE IF NOT EXISTS expert_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT NOT NULL UNIQUE,           -- Clerk user ID
  display_name        TEXT NOT NULL,
  bio                 TEXT,
  college_name        TEXT NOT NULL,
  skills              JSONB DEFAULT '[]',             -- e.g. ["AutoCAD", "Python"]
  availability        TEXT DEFAULT 'Available',       -- 'Available' | 'Busy' | 'On Break'
  sample_work_urls    JSONB DEFAULT '[]',             -- image URLs for Trust Protocol check
  contact_whatsapp    TEXT,                           -- hidden until order confirmed
  contact_phone       TEXT,                           -- hidden until order confirmed
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  admin_note          TEXT,                           -- admin's reason for rejection
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expert_profiles_college_idx ON expert_profiles (college_name);
CREATE INDEX IF NOT EXISTS expert_profiles_status_idx  ON expert_profiles (verification_status);

-- 2. Peer Services (Marketplace Listings)
CREATE TABLE IF NOT EXISTS peer_services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_user_id    TEXT NOT NULL REFERENCES expert_profiles(user_id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,   -- 'Engineering Graphics' | 'Python/Coding' | 'Hardware/Circuit' | 'Viva Prep' | 'Lab Files'
  price_basic       NUMERIC(10, 2) NOT NULL,
  price_standard    NUMERIC(10, 2),
  price_premium     NUMERIC(10, 2),
  delivery_days     INTEGER DEFAULT 3,
  delivery_method   TEXT DEFAULT 'On-Campus Handover', -- 'On-Campus Handover' | 'Digital PDF' | 'WhatsApp'
  portfolio_urls    JSONB DEFAULT '[]',  -- high-res image URLs of expert's work
  tags              JSONB DEFAULT '[]',
  college_name      TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'approved' | 'rejected'
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS peer_services_category_idx   ON peer_services (category);
CREATE INDEX IF NOT EXISTS peer_services_college_idx    ON peer_services (college_name);
CREATE INDEX IF NOT EXISTS peer_services_status_idx     ON peer_services (status);
CREATE INDEX IF NOT EXISTS peer_services_expert_idx     ON peer_services (expert_user_id);

-- 3. Peer Orders
CREATE TABLE IF NOT EXISTS peer_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_user_id    TEXT NOT NULL,           -- Clerk user ID of the buyer
  service_id        UUID NOT NULL REFERENCES peer_services(id) ON DELETE CASCADE,
  pricing_tier      TEXT NOT NULL,           -- 'basic' | 'standard' | 'premium'
  amount            NUMERIC(10, 2) NOT NULL,
  requirements      TEXT,                   -- custom notes from seeker
  handover_location TEXT,                   -- 'Library' | 'Cafeteria' | 'Hostel Gate' etc.
  status            TEXT NOT NULL DEFAULT 'pending',
                                            -- 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  rating            SMALLINT CHECK (rating >= 1 AND rating <= 5),
  review_text       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS peer_orders_seeker_idx  ON peer_orders (seeker_user_id);
CREATE INDEX IF NOT EXISTS peer_orders_service_idx ON peer_orders (service_id);
CREATE INDEX IF NOT EXISTS peer_orders_status_idx  ON peer_orders (status);

-- ══════════════════════════════════════════════════════════════════════════════
-- Seed Data — 8 high-quality mock approved services
-- (Replace 'user_placeholder_X' with real Clerk user IDs in production)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO expert_profiles (user_id, display_name, bio, college_name, skills, availability, sample_work_urls, verification_status)
VALUES
  ('seed_expert_1','Rahul Sharma','3rd yr Mech Eng. Specialises in precise EG sheets with zero tolerance for error.','VIPS',
   '["Engineering Graphics","AutoCAD","SolidWorks"]','Available',
   '["https://images.unsplash.com/photo-1503387762-592dea58ef23?w=800","https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800"]',
   'approved'),
  ('seed_expert_2','Priya Verma','Final yr CS. Python specialist; documented 40+ lab files with 5-star reviews.','VIPS',
   '["Python","Jupyter Notebook","Documentation"]','Available',
   '["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800","https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800"]',
   'approved'),
  ('seed_expert_3','Arjun Mehta','ECE 4th yr. Hardware wizard — soldering, PCB, Arduino, STM32.','VIPS',
   '["Circuit Assembly","Soldering","Arduino","PCB Design"]','Available',
   '["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800","https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800"]',
   'approved'),
  ('seed_expert_4','Sanya Gupta','Toppper, 9.4 CGPA. Created viva prep notes used by 200+ students.','VIPS',
   '["Viva Prep","Technical Writing","Subject Notes"]','Available',
   '["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800"]',
   'approved')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO peer_services (expert_user_id, title, description, category, price_basic, price_standard, price_premium, delivery_days, delivery_method, portfolio_urls, tags, college_name, status)
VALUES
  ('seed_expert_1',
   'Precision EG Sheets — First & Third Angle Projection',
   'Mathematically precise engineering drawing sheets. Includes: orthographic projections, section planes, isometric views, and surface development. Every line is drawn with 0.1mm precision. I use proper pencil grades (2H/4H/HB) for linework. Comes with dimensioning per IS:696 standards.',
   'Engineering Graphics', 299, 499, 799, 3, 'On-Campus Handover',
   '["https://images.unsplash.com/photo-1503387762-592dea58ef23?w=1600","https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600","https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600"]',
   '["IS:696","Orthographic","Isometric","Section Planes"]', 'VIPS', 'approved'),

  ('seed_expert_1',
   'Complete EG Portfolio — All 10 Sheets (Semester Bundle)',
   'Full semester EG sheet package — all 10 standard sheets for B.Tech 1st year. First Angle Projection, Curves of Intersection, Development of Surfaces, Perspective Projections. Guaranteed to match professor expectations. Contact me after ordering for your professors specific preferences.',
   'Engineering Graphics', 1999, 2499, null, 7, 'On-Campus Handover',
   '["https://images.unsplash.com/photo-1503387762-592dea58ef23?w=1600","https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600"]',
   '["Bundle","Full Semester","10 Sheets","B.Tech 1st Year"]', 'VIPS', 'approved'),

  ('seed_expert_2',
   'Python Lab File (BCA/B.Tech) — 15+ Programs with Output',
   'Full Python practical file with clean, well-documented code. Includes: basic programs, OOP, file handling, NumPy/Pandas, Matplotlib graphs, MySQL connectivity. Each program has comments, algorithm steps, and screenshot outputs formatted perfectly for submission.',
   'Python/Coding', 450, 650, null, 2, 'Digital PDF',
   '["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600","https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1600"]',
   '["Python","Lab File","Documentation","NumPy","Pandas"]', 'VIPS', 'approved'),

  ('seed_expert_2',
   'Full-Stack Mini Project (Django/React) with Report',
   'Complete mini project with source code + documentation report. Includes SRS, ER diagram, system design, complete codebase, and a formatted report. Past projects: Library Mgmt, Hostel Portal, Inventory System.',
   'Python/Coding', 2500, 3500, 5000, 14, 'Digital PDF',
   '["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600"]',
   '["Mini Project","Django","React","Documentation","SRS"]', 'VIPS', 'approved'),

  ('seed_expert_3',
   'Hardware Circuit Assembly — Arduino/Raspberry Pi Projects',
   'Custom hardware projects assembled and tested. Includes: sensor interfacing, motor control, LED matrix, IoT prototypes. I source all components at wholesale price. Comes with a wiring diagram and basic code. Delivery at lab or hostel.',
   'Hardware/Circuit', 800, 1500, 3000, 5, 'On-Campus Handover',
   '["https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600","https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600"]',
   '["Arduino","Raspberry Pi","IoT","Circuit","Hardware"]', 'VIPS', 'approved'),

  ('seed_expert_3',
   'PCB Design + Soldering — Custom Circuits for Lab Exams',
   'Custom PCB designed on EasyEDA/KiCad and assembled in-house. Precision soldering for through-hole and SMD components. Ideal for Minor/Major lab exams, project expo, and final year projects.',
   'Hardware/Circuit', 1200, 2000, null, 7, 'On-Campus Handover',
   '["https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600"]',
   '["PCB","EasyEDA","Soldering","Lab Exam","Circuit"]', 'VIPS', 'approved'),

  ('seed_expert_4',
   'Viva-Voce Preparation Notes — Engineering Physics & Chemistry',
   'Concise, high-yield viva Q&A covering all units. Physics: optics, waves, quantum, semiconductors. Chemistry: polymers, electrochemistry, nanomaterials. Formatted for quick revision with diagrams and key formulas highlighted.',
   'Viva Prep', 149, 249, null, 1, 'Digital PDF',
   '["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600"]',
   '["Viva","Engineering Physics","Engineering Chemistry","Quick Revision","Notes"]', 'VIPS', 'approved'),

  ('seed_expert_4',
   'Full Semester Lab Manual Writing — Any Subject',
   'Professionally written lab manuals with aim, theory, apparatus, procedure, observations, result, and precautions. Written in the format preferred by examiners. Subjects handled: Physics, Chemistry, Basic EE, Basic EC.',
   'Lab Files', 599, 899, 1299, 4, 'Digital PDF',
   '["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600"]',
   '["Lab Manual","Lab File","Physics Lab","Chemistry Lab","Complete"]', 'VIPS', 'approved')
ON CONFLICT DO NOTHING;
