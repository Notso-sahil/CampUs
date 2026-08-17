# Security Rules

Based on OWASP Top 10:2025. For each category: what the principle is, and how this codebase currently satisfies (or must satisfy) it.

---

## A01 — Broken Access Control

### Every Route Requires Explicit Authorization
PRINCIPLE: Access control must be enforced server-side on every request. Default to deny — a route that doesn't explicitly check authorization is open to everyone. Authorization (can this user do this action on this resource?) is a separate check from authentication (who is this user?).

HERE: Three middleware tiers exist in `CampUs-api/middleware/`:
- `verifyFirebaseToken` — confirms a valid Firebase ID token; sets `req.uid`. Used on all private routes.
- `requireAuthForMutations` — public GETs, authenticated POST/PUT/DELETE. Used on user-owned resources.
- `requireAdminForMutations` — public GETs, admin-only POST/PUT/DELETE. Used on `events`, `knowledge-hub`, `featured`.

Every new route added to `server.js` must choose one of these three middleware. Calling `app.all('/api/new-route', handler)` without middleware is a bug.

Ownership checks (e.g., "this user can only delete their own listing") must be done inside the handler by comparing `req.uid` to the DB owner field — the middleware does not do this.

---

## A02 — Cryptographic Failures / Sensitive Data Exposure

### Never Transmit or Log Sensitive Data
PRINCIPLE: Sensitive values (tokens, passwords, private keys, PII) must never appear in logs, error responses, or client-facing API responses. Data in transit must be encrypted (HTTPS). Sensitive data at rest must be encrypted or appropriately access-controlled.

HERE:
- All traffic is HTTPS (Firebase Hosting enforces it; Azure App Service enforces it for the API).
- Firebase tokens are short-lived JWTs (1-hour TTL) — never log `req.headers.authorization` or `req.uid` in production log statements.
- The Firebase service account JSON (`campus-504010-firebase-adminsdk-*.json`) is gitignored. In production, the credential is passed as the `FIREBASE_SERVICE_ACCOUNT_JSON` env var (JSON string), not a file.
- API error responses must never include raw database error messages or stack traces in production. The global error handler in `server.js` already gates `err.message` behind `NODE_ENV !== 'production'`.
- Never log `process.env.DATABASE_URL`, `R2_SECRET_ACCESS_KEY`, or any other secret, even in debug branches.

---

## A03 — Injection

### Parameterize All Database Queries
PRINCIPLE: User-controlled data must never be interpolated into a SQL string. Use the database driver's parameterization mechanism, which separates SQL structure from data values.

HERE: The Neon client uses **tagged template literals** which auto-parameterize:
```js
// CORRECT — safe
await sql`SELECT * FROM products WHERE college_name = ${collegeNameFromQuery}`;

// WRONG — SQL injection
await sql(`SELECT * FROM products WHERE college_name = '${collegeNameFromQuery}'`);
```
The `sql.unsafe()` function exists and bypasses parameterization — it is currently only used in `db-constraints.js` for table/column identifier interpolation in migration scripts (not in any request-handling code). Never use `sql.unsafe()` in API handlers.

---

## A04 — Insecure Design / Missing Rate Limiting

### Rate-Limit Abuse-Prone Endpoints
PRINCIPLE: Endpoints that accept user-generated content, send notifications, or consume third-party API quota must have rate limiting to prevent abuse. Auth endpoints are the highest-priority targets.

HERE: No Express-level rate limiting middleware (e.g., `express-rate-limit`) is currently installed on `CampUs-api`. Firebase Auth handles auth-endpoint rate limiting on the client side.

The upload pipeline has an implicit rate limit: `get-upload-url.js` enforces a maximum uploads count per user based on DB records. Any new endpoint that calls VirusTotal, sends emails, or generates presigned URLs must add quota checks in the handler before issuing the external call.

**Action required**: Install `express-rate-limit` on `CampUs-api` and apply a global limiter at the top of `server.js` before adding any further endpoints.

---

## A05 — Security Misconfiguration

### CORS Must Be Explicitly Allowlisted
PRINCIPLE: APIs must not allow wildcard CORS (`Access-Control-Allow-Origin: *`) when they handle authenticated requests. The origin allowlist must be managed via configuration, not hardcoded to a broad pattern.

HERE: `server.js` reads allowed origins from the `ALLOWED_ORIGINS` environment variable (comma-separated list) and rejects all others with a CORS error. In local dev, `localhost:5173`, `localhost:3000`, and `localhost:8080` are added automatically. In production, only the production Firebase Hosting domain should be in `ALLOWED_ORIGINS`.

Never add `*` to `ALLOWED_ORIGINS`. If a new deploy target is added (e.g., a preview URL), it must be explicitly added to the env var.

---

## A06 — Vulnerable and Outdated Components / Supply Chain Risk

### Audit Dependencies Regularly
PRINCIPLE: Third-party dependencies expand your attack surface. Any package can introduce vulnerabilities. Outdated packages with known CVEs must be updated promptly. The CI pipeline should fail on critical severity vulnerabilities.

HERE: No automated `npm audit` step exists in the current GitHub Actions workflow. Before any feature deployment, run `npm audit --audit-level=high` in both `CampUs/` and `CampUs-api/`. If critical or high issues are found, resolve them before merging. The scan worker uses Cloudflare's own runtime — keep Wrangler updated separately.

---

## A07 — Authentication and Session Management Failures

### Verify Tokens Server-Side; Never Trust Client-Side Claims
PRINCIPLE: Authentication tokens must be verified cryptographically on every request by the server. Client-side claims (decoded JWT payload, user object from local storage) must never be used to make authorization decisions.

HERE: `verifyFirebaseToken` calls `auth.verifyIdToken(token)` from the Firebase Admin SDK on every request. This performs full cryptographic signature verification against Google's public keys. The `req.uid` set by this middleware is the only trusted identity source in the backend. The frontend's `user.id` from `AuthContext` is for UI purposes only — it is never trusted as-is on the backend.

The Firebase ID token has a 1-hour TTL. The client's `auth.currentUser.getIdToken()` call in `src/lib/api.ts` automatically refreshes it if expired.

---

## A08 — Software and Data Integrity Failures

### Validate File Content, Not Just MIME Type
PRINCIPLE: Client-provided content-type headers and file extensions can be spoofed. File type validation must inspect actual file content (magic bytes).

HERE: The `campus-scan-worker` Cloudflare Worker reads the first bytes of every file uploaded to R2 and validates magic bytes against the declared MIME type. Files failing magic-byte validation are flagged as `infected` and excluded from serving. Never bypass this check by allowing unscanned files to surface in the UI.

---

## A09 — Security Logging and Monitoring Failures

### Log Security-Relevant Events
PRINCIPLE: Authentication failures, authorization failures, and anomalous inputs (oversized payloads, unexpected content types) should be logged at `warn` or `error` level with enough context to reconstruct what happened — but without logging the sensitive values themselves.

HERE: `verifyFirebaseToken` calls `console.error('Error verifying Firebase token:', error)` on token verification failure. The `requireAdmin` middleware calls `console.error('Error checking admin role:', error)`. These are the current logging points.

New routes should log (at `console.warn`): any 401/403 response issued, and any input validation rejection with the rejection reason (not the rejected value). Structured JSON logging would be an improvement — log `{ event: 'auth_failure', path: req.path, uid: req.uid || 'anonymous' }` rather than plain strings.

---

## A10 — SSRF (Server-Side Request Forgery)

### Never Fetch a User-Supplied URL from the Server
PRINCIPLE: If the server fetches a URL, that URL must come from a trusted internal allowlist, not from a user-controlled value. SSRF allows attackers to probe internal infrastructure or exfiltrate cloud metadata.

HERE: The backend does not currently accept user-supplied URLs to fetch. The only outbound HTTP calls are:
1. Firebase Admin SDK → Google's token verification endpoints (trusted).
2. AWS SDK v3 → Cloudflare R2 endpoint (configured via env vars, not user input).
3. VirusTotal API → `virus.total.com` (fixed host in the scan worker).

If any future feature allows users to provide a URL for the backend to fetch (e.g., an import-from-URL feature), that URL must be validated against an explicit allowlist of permitted domains before the server-side fetch is issued.

---

## Secrets and Environment Variables

### Never Hardcode Secrets
PRINCIPLE: Secrets (API keys, database credentials, private keys, tokens) must never appear in source code, committed files, or logs — regardless of whether the repository is public or private. Use environment variables loaded at runtime.

HERE:
- Frontend: secrets are injected by Vite at build time via `VITE_` prefixed variables in `.env` (gitignored). Only values that are safe to be public should be `VITE_`-prefixed — they are compiled into the client bundle and are visible to users.
- Backend: secrets are loaded via `dotenv` from `.env` (gitignored in production; provided via host environment variables on Azure App Service).
- The `.env.example` files in both repos document all required variables without real values. Keep these in sync when adding new env vars.
- The Firebase service account JSON must **never** be committed. Use `FIREBASE_SERVICE_ACCOUNT_JSON` env var in production (the entire JSON as a single-line string).
