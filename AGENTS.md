# CampUs — Agent Engineering Standards

CampUs is a multi-tenant college-lifestyle platform for Indian students covering: a buy/sell marketplace (Trade), lost & found (Recover), knowledge document hub, peer services marketplace, team finder, roommate finder, and a real-time messaging layer. Auth is Firebase, the DB is Neon Postgres, and files are stored in Cloudflare R2 with SHA-256 content-addressing for deduplication.

---

## Repositories

| Repo | Path | Stack | Deployed on |
|---|---|---|---|
| **CampUs** (SPA) | `CampUs/` | React 18 · TS 5.8 · Vite 5 · Tailwind 3 · shadcn/ui · React Router 6 · TanStack Query 5 · Firebase 12 | Firebase Hosting |
| **CampUs-api** (API) | `CampUs-api/` | Express 5 · plain ESM JS · `@neondatabase/serverless` 1.x · Firebase Admin 14 · AWS SDK v3 | Azure App Service (via GitHub Actions) |
| **campus-scan-worker** | `campus-scan-worker/` | Cloudflare Workers · Wrangler · TypeScript | Cloudflare |

---

## Exact Commands (verified from package.json)

### Frontend (`CampUs/`)
```bash
npm run dev          # Vite dev server on port 8080
npm run build        # Production build → dist/
npm run lint         # ESLint flat config (TS + react-hooks + react-refresh)
npm run test         # Vitest one-shot (jsdom environment)
npm run test:watch   # Vitest watch
npx tsc --noEmit     # Type-check only (no emit)
```

### Backend (`CampUs-api/`)
```bash
npm run dev   # node --watch server.js
npm start     # node server.js (production)
```
> No lint, test, or type-check scripts exist on the backend today.

### Scan Worker (`campus-scan-worker/`)
```bash
npx wrangler dev     # local dev
npx wrangler deploy  # deploy to Cloudflare
```

---

## Directory Map

### Frontend `CampUs/src/`
```
components/         Reusable UI (Navbar, cards, modals)
  └── ui/           shadcn/ui primitives — never hand-edit, use CLI
contexts/           AuthContext, CollegeContext (React context providers)
hooks/              Custom hooks (use-toast, use-mobile)
lib/                Utilities: api.ts, firebase.ts, uploadToStorage.ts, workers
pages/              Route-level page components (PascalCase.tsx)
  └── admin/        Admin panel sub-pages
test/               Vitest setup + spec files
types/              Shared TypeScript type definitions
```

### Backend `CampUs-api/`
```
api/                One handler file per endpoint (kebab-case.js)
controllers/        Complex business logic (admin.controller.js)
middleware/         auth.js (Firebase token), rbac.js (admin role check)
lib/                firebase-admin.js singleton
routes/             admin.routes.js (Express Router for /api/admin/*)
*.js (root)         Migration scripts — ALREADY APPLIED, do not re-run
```

---

## Naming Conventions (observed)

| Thing | Convention | Example |
|---|---|---|
| Frontend pages | `PascalCase.tsx` | `KnowledgeHub.tsx` |
| Frontend components | `PascalCase.tsx` | `RequestUploadModal.tsx` |
| Frontend utilities | `camelCase.ts` | `uploadToStorage.ts` |
| Backend handlers | `kebab-case.js` | `get-upload-url.js` |
| DB tables | `snake_case` | `knowledge_hub`, `file_hashes` |
| DB columns | `snake_case` | `pending_deletion`, `reference_count` |
| Env vars (frontend) | `VITE_` prefix | `VITE_API_BASE_URL` |
| Env vars (backend) | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `R2_BUCKET_NAME` |

---

## Files the Agent Must Never Auto-Modify

| Path | Reason |
|---|---|
| `CampUs/src/components/ui/*` | shadcn/ui generated — update only via `npx shadcn-ui@latest add` |
| `CampUs-api/migrate*.js`, `init-db.js`, `db-constraints.js`, `admin-migrate.js` | Already-applied DDL migrations — re-running could corrupt data |
| `CampUs-api/campus-504010-firebase-adminsdk-*.json` | Service account key — never log, read value into code, or commit |
| `.env` / `.env.local` files | Secrets — never log, never commit |
| `CampUs-api/.github/workflows/master_campushub.yml` | Production Azure deploy pipeline |

---

## Critical Architectural Rules (Quick Ref)

1. **Neon SQL**: tagged template literals ONLY — `` sql`...${param}` ``. Never `sql(string, args)`.
2. **File deletion**: decrement `file_hashes.reference_count`; only call R2 `DeleteObjectCommand` when it reaches 0.
3. **Auth**: every mutating route requires `verifyFirebaseToken` → `req.uid`; admin routes additionally call `requireAdmin`.
4. **Upload pipeline**: compress → hash (Web Worker) → dedup check (`get-upload-url`) → presigned PUT to R2 → `finalize-upload`.
5. **Size limits**: 25 MB max for knowledge docs; 5 MB for images in all other contexts.
6. **Homepage resilience**: use `Promise.allSettled`, never `Promise.all`, for multi-endpoint fetches on shared pages.

---

## Rules Index

| Domain | File |
|---|---|
| Frontend components, state, a11y, responsiveness | [`/rules/frontend.md`](rules/frontend.md) |
| Schema, queries, validation, transactions | [`/rules/backend-database.md`](rules/backend-database.md) |
| OWASP Top 10:2025, secrets, auth | [`/rules/security.md`](rules/security.md) |
| Bundle size, caching, CWV | [`/rules/performance.md`](rules/performance.md) |
| Environments, CI/CD, rollback | [`/rules/deployment-devops.md`](rules/deployment-devops.md) |
| SEO metadata, WCAG, semantic HTML | [`/rules/seo-and-a11y.md`](rules/seo-and-a11y.md) |

---

## Reusing These Rules in a New Project

The `/rules/` folder is a portable starter kit. To apply it to a new codebase:

1. Copy the entire `/rules/` folder into the new repo root.
2. Create a fresh `/AGENTS.md` for the new project (do not copy this file).
3. Inspect the new codebase (stack, commands, conventions, secrets pattern).
4. In each `/rules/*.md` file, **keep all `PRINCIPLE:` lines untouched** — they are stack-agnostic and always valid.
5. **Regenerate only the `HERE:` lines** for each rule based on the new codebase's actual libraries and patterns.
6. If a principle is genuinely inapplicable to the new project's domain (e.g., "no public-facing pages" for an internal tool), note why it's skipped rather than silently deleting it.
