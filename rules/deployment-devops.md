# Deployment & DevOps Rules

---

## Environment Strategy

### Separate Dev, Staging, and Production Environments
PRINCIPLE: Code must progress through isolated environments before reaching production users. Each environment has its own database, secrets, and external service accounts. Never share a database between environments.

HERE: **This project currently has only two environments: local dev and production.** There is no staging environment.

| Environment | Frontend | Backend | DB |
|---|---|---|---|
| Local dev | `npm run dev` on :8080 | `npm run dev` on :3000 | Same Neon DB as production (risk — see action required) |
| Production | Firebase Hosting | Azure App Service | Neon Postgres (production) |

**Action required**: The local dev environment shares the production Neon DB because there is only one `DATABASE_URL`. A separate Neon branch or database should be used for local development to prevent developers from accidentally reading or writing production user data.

---

## Pre-Deploy Gates

### Nothing Deploys Without Passing These Checks
PRINCIPLE: A broken build, type error, or lint error in production is worse than a delayed deployment. Automated gates ensure this never happens. The CI pipeline is the enforcement mechanism — it is not optional.

HERE: The current GitHub Actions workflow (`master_campushub.yml`) runs:
```
npm install
npm run build --if-present
npm run test --if-present
```
This covers the **backend only** (which has no build step and no tests today, so both are effectively no-ops). The **frontend has no CI pipeline at all** — it is deployed manually via `firebase deploy`.

**Required gates before any production deploy — enforce these manually until CI is set up:**

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
- **Backend**: GitHub Actions at `CampUs-api/.github/workflows/master_campushub.yml` triggers on push to `master` and deploys to Azure App Service. Uses OIDC-based Azure login (no long-lived credentials stored as secrets).
- **Frontend**: Deployed manually via `firebase deploy` from the `CampUs/` directory. **No automated CI trigger exists for the frontend.** This is a gap — a GitHub Actions workflow should be added to `CampUs/.github/workflows/` that runs on push to `main` and calls `firebase deploy --only hosting`.

---

## Rollback

### Have a Tested Rollback Path Before Every Deploy
PRINCIPLE: Every deployment must have an explicit rollback plan. "Re-deploy the previous version" is acceptable only if it can be done in under 5 minutes and is tested.

HERE:
- **Backend (Azure)**: Azure App Service deployment slots allow swapping back to the previous version in the Azure portal. Alternatively, force-push or revert the commit on `master` to trigger a re-deploy via GitHub Actions.
- **Frontend (Firebase Hosting)**: Firebase Hosting maintains a version history. Roll back via: `firebase hosting:rollback` or by selecting a previous release in the Firebase Console.
- **Database**: There is no automated rollback for Neon DB. Schema changes (via migration scripts) are one-way. This is why migrations must be purely additive (`ADD COLUMN IF NOT EXISTS` only) — additive changes can be rolled back at the application layer by simply reverting the code that uses the new column.

---

## Environment Variable Management

### Manage Secrets Through the Host's Secret Store, Not Config Files
PRINCIPLE: Production secrets must never be stored in files committed to source control. They must be injected at runtime through the host platform's environment variable or secrets management system.

HERE:
- **Backend (Azure App Service)**: Secrets (`DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `ALLOWED_ORIGINS`, etc.) are set in Azure App Service → Configuration → Application Settings.
- **Frontend (Firebase Hosting + Vite)**: `VITE_`-prefixed variables are baked into the production bundle at build time. They are set in the build environment (CI or local) via `.env` files, which are gitignored. **Note**: Any `VITE_` variable is visible in the client bundle — never put secrets in `VITE_` variables. Only public identifiers (Firebase config, API base URL) belong there.
- Adding a new env var: update `.env.example` in the relevant repo so the documentation stays in sync. Then add the real value to Azure App Service settings (backend) or the build environment (frontend).

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
DATABASE_URL                      # Neon Postgres connection string
ALLOWED_ORIGINS                   # Comma-separated list of allowed CORS origins
NODE_ENV                          # "production"
FIREBASE_SERVICE_ACCOUNT_JSON     # Full service account JSON as a single-line string
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL                     # Cloudflare R2 public URL prefix
```
