# Security Rules

Based on OWASP Top 10:2025. For each category: what the principle is, and how this codebase currently satisfies (or must satisfy) it.

---

## A01 — Broken Access Control

### Every Route Requires Explicit Authorization
PRINCIPLE: Access control must be enforced server-side on every request. Default to deny — a route that does not explicitly check authorization is open to everyone. Authorization (can this user do this action on this resource?) is a separate check from authentication (who is this user?).

HERE: Three middleware tiers exist in `CampUs-api/middleware/`:
- `verifyFirebaseToken` — confirms a valid token from the auth provider (Firebase); sets `req.uid`. Used on all private routes.
- `requireAuthForMutations` — public GETs, authenticated POST/PUT/DELETE. Used on user-owned resources.
- `requireAdminForMutations` — public GETs, admin-only POST/PUT/DELETE. Used on `events`, `knowledge-hub`, `featured`.

Every new route registered in `server.js` must use one of these three middleware. Calling `app.all('/api/new-route', handler)` without middleware is a bug.

Ownership checks (e.g., "this user can only delete their own listing") must be done inside the handler by comparing `req.uid` to the DB owner field — the middleware does not do this.

---

## A02 — Cryptographic Failures / Sensitive Data Exposure

### Never Transmit or Log Sensitive Data
PRINCIPLE: Sensitive values (tokens, passwords, private keys, PII) must never appear in logs, error responses, or client-facing API responses. Data in transit must be encrypted (HTTPS). Sensitive data at rest must be encrypted or appropriately access-controlled.

HERE:
- All traffic is HTTPS — the hosting provider (Firebase Hosting) and the cloud host (Azure App Service) both enforce it.
- Auth provider (Firebase) tokens are short-lived JWTs (1-hour TTL) — never log `req.headers.authorization` or `req.uid` in production log statements.
- The auth provider service account JSON (`campus-504010-firebase-adminsdk-*.json`) is gitignored. In production, credentials are passed as the `FIREBASE_SERVICE_ACCOUNT_JSON` env var (JSON string), never as a committed file.
- API error responses must never include raw database error messages or stack traces in production. The global error handler in `server.js` gates `err.message` behind `NODE_ENV !== 'production'`.
- Never log `process.env.DATABASE_URL`, `R2_SECRET_ACCESS_KEY`, or any other secret, even in debug branches.

---

## A03 — Injection

### Parameterize All Database Queries
PRINCIPLE: User-controlled data must never be interpolated into a SQL string. Use the database driver's parameterization mechanism, which separates SQL structure from data values.

HERE: The database client (`@neondatabase/serverless`) uses tagged template literals which auto-parameterize:
```js
// CORRECT — safe
await sql`SELECT * FROM products WHERE college_name = ${collegeNameFromQuery}`;

// WRONG — SQL injection risk
await sql(`SELECT * FROM products WHERE college_name = '${collegeNameFromQuery}'`);
```
`sql.unsafe()` bypasses parameterization — it is only used in migration scripts for table/column identifier interpolation. Never use `sql.unsafe()` in API handlers.

---

## A04 — Insecure Design / Missing Rate Limiting

### Rate-Limit Abuse-Prone Endpoints
PRINCIPLE: Endpoints that accept user-generated content, send notifications, or consume third-party API quota must have rate limiting to prevent abuse and quota exhaustion.

HERE: A global rate limiter using `express-rate-limit` is applied in `server.js` before all route registrations:
```js
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use(limiter);
```
Any new endpoint that calls a paid third-party API (VirusTotal, Cloudflare, etc.) or generates presigned URLs must add a tighter per-route limiter on top of the global one.

---

## A05 — Security Misconfiguration

### CORS Must Be Explicitly Allowlisted
PRINCIPLE: APIs must not allow wildcard CORS (`Access-Control-Allow-Origin: *`) when they handle authenticated requests. The origin allowlist must be managed via configuration, not hardcoded.

HERE: `server.js` reads allowed origins from the `ALLOWED_ORIGINS` environment variable (comma-separated). In production, only the production hosting domain should be in `ALLOWED_ORIGINS`. Never add `*` to `ALLOWED_ORIGINS`. New deploy targets (e.g., a preview URL) must be explicitly added to the env var.

---

## A06 — Vulnerable and Outdated Components / Supply Chain Risk

### Audit Dependencies Regularly
PRINCIPLE: Third-party dependencies expand your attack surface. Outdated packages with known CVEs must be updated promptly. The CI pipeline should fail on critical severity vulnerabilities.

HERE: No automated `npm audit` step currently exists in the GitHub Actions workflow. Before any production deploy, run `npm audit --audit-level=high` in both `CampUs/` and `CampUs-api/`. If critical or high issues are found, resolve them before merging. The edge worker runtime (Cloudflare Workers) — keep Wrangler updated separately.

---

## A07 — Authentication and Session Management Failures

### Verify Tokens Server-Side; Never Trust Client-Side Claims
PRINCIPLE: Authentication tokens must be verified cryptographically on every request by the server. Client-side decoded JWT claims or local storage user objects must never be used to make authorization decisions.

HERE: `verifyFirebaseToken` calls `auth.verifyIdToken(token)` from the auth provider admin SDK on every request. This performs full cryptographic signature verification against the provider's public keys. The `req.uid` set by this middleware is the only trusted identity source in the backend. The frontend's `user.id` from `AuthContext` is for UI purposes only — it is never trusted as-is on the backend.

Auth tokens have a 1-hour TTL. The client's `auth.currentUser.getIdToken()` call in `src/lib/api.ts` automatically refreshes them if expired.

---

## A08 — Software and Data Integrity Failures

### Validate File Content, Not Just MIME Type
PRINCIPLE: Client-provided content-type headers and file extensions can be spoofed. File type validation must inspect actual file content (magic bytes).

HERE: The edge worker (campus-scan-worker) reads the first bytes of every file uploaded to object storage (Cloudflare R2) and validates magic bytes against the declared MIME type. Files failing magic-byte validation are flagged as `infected` and excluded from serving. Never bypass this by allowing unscanned files to surface in the UI.

---

## A09 — Security Logging and Monitoring Failures

### Log Security-Relevant Events Without Logging Sensitive Values
PRINCIPLE: Authentication failures, authorization failures, and anomalous inputs should be logged at `warn` or `error` level with enough context to reconstruct what happened — but without logging the sensitive values themselves.

HERE: `verifyFirebaseToken` calls `console.error('Error verifying Firebase token:', error)` on failure. `requireAdmin` calls `console.error('Error checking admin role:', error)`. New routes should log (at `console.warn`) any 401/403 response issued, including `{ event: 'auth_failure', path: req.path, uid: req.uid || 'anonymous' }` — never log the token or the rejected input value.

---

## A10 — Server-Side Request Forgery (SSRF)

### Never Fetch a User-Supplied URL from the Server
PRINCIPLE: If the server fetches a URL, that URL must come from a trusted internal allowlist, not from a user-controlled value. SSRF allows attackers to probe internal infrastructure or exfiltrate cloud metadata.

HERE: The backend does not currently accept user-supplied URLs to fetch. Outbound HTTP calls are limited to:
1. Auth provider admin SDK → Google's token verification endpoints (trusted, fixed host).
2. Cloud SDK (AWS SDK v3) → object storage endpoint (configured via env vars, not user input).
3. VirusTotal API → `www.virustotal.com` (fixed host in the edge worker).

If any future feature allows users to provide a URL for server-side fetching, validate that URL against an explicit allowlist of permitted domains before issuing the request.

---

## Secrets and Environment Variables

### Never Hardcode Secrets
PRINCIPLE: Secrets (API keys, DB credentials, private keys, tokens) must never appear in source code, committed files, or logs — regardless of whether the repository is public or private. Use environment variables loaded at runtime.

HERE:
- **Frontend**: Secrets are injected by the bundler (Vite) at build time via `VITE_`-prefixed variables in `.env` (gitignored). Only values safe to be public should use the `VITE_` prefix — they are compiled into the client bundle and visible to users.
- **Backend**: Secrets are loaded via `dotenv` from `.env` (gitignored). In production, they are provided via the cloud host's (Azure App Service) application settings.
- The auth provider service account JSON must never be committed. Use `FIREBASE_SERVICE_ACCOUNT_JSON` env var in production.
- The `.env.example` files document all required variables without real values. Keep them in sync when adding new env vars.
