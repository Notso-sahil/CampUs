# Deployment & DevOps Rules

---

## Environment Strategy

### Separate Dev, Staging, and Production Environments
PRINCIPLE: Code must progress through isolated environments before reaching production users. Each environment has its own database, secrets, and external service accounts. Local development must never connect directly to the production database.

HERE: This project currently has two explicit environments: local dev and production. There is no dedicated staging environment (gap — see action below).

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| Local dev | `npm run dev` on :8080 | `npm run dev` on :3000 | Dedicated dev branch (database (Neon)) |
| Production | Hosting provider (Firebase Hosting) | Cloud host (Azure App Service) | Production database (Neon Postgres) |

---

### Local Dev Database Strategy — Use Database Branching
PRINCIPLE: Local development must never connect to the production database. Use the database provider's branching or snapshot feature to create an isolated dev/staging copy that can be freely modified, migrated against, or corrupted without risking production data.

HERE: The database provider (Neon) supports **instant branching** — a lightweight copy-on-write replica created in seconds with zero data transfer cost. Use a dedicated Neon dev branch for local development:

1. In the Neon console, create a branch named `dev` from `main`.
2. Copy the branch's connection string.
3. Set `DATABASE_URL` in your local `CampUs-api/.env` to the **branch** connection string, not the production string.
4. Run migration scripts against the dev branch, not production.

**Benefits of branching over a separate database:**
- Instant creation — no waiting for data to copy.
- Copy-on-write — it starts identical to production so queries behave realistically.
- Isolated — accidental schema migrations, test data writes, or `DROP TABLE` mistakes do not touch production.
- Free on Neon's free tier — branches do not count as additional databases.

The production `DATABASE_URL` must never appear in any local `.env` file checked into git. Use `.env.example` to document the variable name without the value.

---

## Pre-Deploy Gates

### Nothing Deploys Without Passing These Checks
PRINCIPLE: A broken build, type error, or lint error in production is worse than a delayed deployment. Automated gates ensure this never happens. The CI pipeline is the enforcement mechanism — it is not optional.

HERE: The current GitHub Actions workflow (`master_campushub.yml`) covers the backend only, and the backend has no build or test scripts today — so the gates are effectively no-ops. The frontend has no CI pipeline at all; it is deployed manually via `firebase deploy`.

**Required gates before any production deploy — enforce manually until CI is added:**

| Check | Command | Repo |
|---|---|---|
| TypeScript type-check | `npx tsc --noEmit` | `CampUs/` |
| Lint | `npm run lint` | `CampUs/` |
| Tests | `npm run test` | `CampUs/` |
| Production build | `npm run build` | `CampUs/` |
| Dependency audit | `npm audit --audit-level=high` | both repos |

A deploy must not proceed if any of the above fails.

---

## CI/CD Pipeline

### Automate Build and Deploy on Main Branch Push
PRINCIPLE: The deployment process must be automated and repeatable. Manual deploys are error-prone and create irreproducible states. The pipeline should be the only path to production.

HERE:
- **Backend**: GitHub Actions at `CampUs-api/.github/workflows/master_campushub.yml` triggers on push to `master` → deploys to the cloud host (Azure App Service) using OIDC-based login (no long-lived credentials stored as secrets).
- **Frontend**: Deployed manually via `firebase deploy --only hosting`. No automated CI trigger exists for the frontend — this is a known gap.

---

## Rollback

### Have a Tested Rollback Path Before Every Deploy
PRINCIPLE: Every deployment must have an explicit rollback plan executable in under 5 minutes.

HERE:
- **Backend (cloud host — Azure App Service)**: Revert or force-push the commit on `master` to re-trigger GitHub Actions, which redeploys the previous artifact. Azure deployment slots can also be used to swap back instantly from the portal.
- **Frontend (hosting provider — Firebase Hosting)**: Firebase maintains a version history. Roll back via `firebase hosting:rollback` or by selecting a previous release in the Firebase Console.
- **Database (Neon)**: There is no automated rollback for applied migrations. This is why migrations must be purely additive (`ADD COLUMN IF NOT EXISTS` only) — additive changes can be rolled back at the application layer by reverting the code that references the new column. Neon's branching feature can serve as a pre-migration snapshot: branch before running a risky migration, and restore from the branch if needed.

---

## Environment Variable Management

### Manage Secrets Through the Host's Secrets System, Not Config Files
PRINCIPLE: Production secrets must never be stored in files committed to source control. They must be injected at runtime through the hosting platform's environment variable or secrets management system.

HERE:
- **Backend (cloud host — Azure App Service)**: Secrets are set in Azure App Service → Configuration → Application Settings.
- **Frontend (bundler — Vite)**: `VITE_`-prefixed variables are baked into the production bundle at build time. Set them in the CI build environment or local `.env` (gitignored). **Critical**: any `VITE_` variable is visible in the client bundle — never put secrets in `VITE_` variables.

### Required Environment Variables

**Frontend (`CampUs/`):**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_API_BASE_URL          # e.g. https://college-api-xtwb.onrender.com
```

**Backend (`CampUs-api/`):**
```
DATABASE_URL                      # Database (Neon) connection string — use branch URL for local dev
ALLOWED_ORIGINS                   # Comma-separated allowed CORS origins
NODE_ENV                          # "production"
FIREBASE_SERVICE_ACCOUNT_JSON     # Full auth provider service account JSON as a single-line string
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL                     # Object storage (Cloudflare R2) public URL prefix
```

Adding a new env var: update the relevant `.env.example` file immediately so the documentation stays in sync, then add the real value to the cloud host's settings.
