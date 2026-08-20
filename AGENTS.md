# CampUs — Agent Engineering Standards

CampUs is a multi-tenant college-lifestyle platform for Indian students covering: a buy/sell marketplace (Trade), lost & found (Recover), knowledge document hub, peer services marketplace, team finder, roommate finder, and a real-time messaging layer. Auth is handled by an auth provider (Firebase), the DB is a relational database (Neon Postgres), and files are stored in object storage (Cloudflare R2) with SHA-256 content-addressing for deduplication.

---

## Repositories

| Repo | Path | Stack | Deployed on |
|---|---|---|---|
| **CampUs** (SPA) | `CampUs/` | React 18 · TS 5.8 · Bundler (Vite 5) · CSS framework (Tailwind 3) · UI library (shadcn/ui) · Router (React Router 6) · Server state library (TanStack Query 5) · Auth provider (Firebase 12) | Hosting provider (Firebase Hosting) |
| **CampUs-api** (API) | `CampUs-api/` | Web framework (Express 5) · Plain ESM JS · Database client (`@neondatabase/serverless` 1.x) · Auth admin SDK (Firebase Admin 14) · Cloud SDK (AWS SDK v3 for R2) | Cloud host (Azure App Service via GitHub Actions) |
| **campus-scan-worker** | `campus-scan-worker/` | Edge runtime (Cloudflare Workers) · Wrangler · TypeScript | Cloudflare |

---

## Exact Commands (verified from package.json)

### Frontend (`CampUs/`)
```bash
npm run dev          # Dev server on port 8080
npm run build        # Production build → dist/
npm run lint         # ESLint flat config (TS + react-hooks + react-refresh)
npm run test         # Vitest one-shot (jsdom environment)
npm run test:watch   # Vitest watch
npx tsc --noEmit     # Type-check only
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
  └── ui/           UI library primitives — never hand-edit, use CLI
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
middleware/         auth.js (token verification), rbac.js (admin role check)
lib/                Auth admin singleton (firebase-admin.js)
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
| `CampUs/src/components/ui/*` | UI library generated — update only via `npx shadcn-ui@latest add` |
| `CampUs-api/migrate*.js`, `init-db.js`, `db-constraints.js`, `admin-migrate.js` | Already-applied DDL migrations — re-running could corrupt data |
| `CampUs-api/campus-504010-firebase-adminsdk-*.json` | Service account key — never log, read into code, or commit |
| `.env` / `.env.local` files | Secrets — never log, never commit |
| `CampUs-api/.github/workflows/master_campushub.yml` | Production deploy pipeline |

---

## Critical Architectural Rules (Quick Ref)

1. **Database queries**: Tagged template literals ONLY — `` sql`...${param}` ``. Never `sql(string, args)`.
2. **File deletion**: Decrement `file_hashes.reference_count`; only call object storage `DeleteObjectCommand` when it reaches 0.
3. **Auth**: Every mutating route requires token verification middleware → `req.uid`; admin routes additionally call `requireAdmin`.
4. **Upload pipeline**: compress → hash (Web Worker) → dedup check (`get-upload-url`) → presigned PUT to object storage → `finalize-upload`.
5. **Size limits**: 25 MB max for knowledge docs; 5 MB for images in all other contexts.
6. **Homepage resilience**: Use `Promise.allSettled`, never `Promise.all`, for multi-endpoint fetches on shared pages.
7. **Data fetching**: All new data-fetching must use `useQuery`/`useMutation` from the server state library (TanStack Query). Raw `useState + useEffect` fetch patterns are deprecated for new code.

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
5. **Regenerate only the `HERE:` lines** based on the new codebase's actual libraries and patterns. The general-term format (`database (ToolName)`, `auth provider (ToolName)`, `bundler (ToolName)`) makes it clear which parts are stack-specific.
6. If a principle is genuinely inapplicable to the new project's domain, note why it is skipped rather than silently deleting it.
