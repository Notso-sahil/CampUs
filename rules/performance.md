# Performance Rules

---

## Bundle Size and Code Splitting

### Split by Route and Vendor Domain
PRINCIPLE: Ship only the JavaScript a user needs for the page they are currently viewing. The initial bundle should contain only the shell (routing, auth, layout). Heavy page-specific code should load lazily when the route is first visited.

HERE: The bundler (Vite) defines three manual vendor chunks in `vite.config.ts`:
- `vendor`: `react`, `react-dom`, `react-router-dom`
- `firebase`: `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`
- `ui`: `lucide-react`, `clsx`, `tailwind-merge`

Route-level lazy loading (`React.lazy` + `Suspense`) is **not yet implemented** — every page is eagerly imported in `App.tsx`, bundling all 25 pages into the initial load. New pages added to the router must be lazy-loaded:
```tsx
const FindTeammates = React.lazy(() => import('./pages/FindTeammates'));
// wrap route with <Suspense fallback={<PageSpinner />}>
```
Never import a page statically in `App.tsx` unless it renders on first load (e.g., `Index`, `Auth`, layout components).

---

### Tree-Shake Imports
PRINCIPLE: Import only what you use from large libraries. Top-level or barrel imports can pull in an entire library when only one function is needed.

HERE: The icon library (`lucide-react`) supports named imports — always use `import { Upload, ShoppingBag } from 'lucide-react'`. The auth provider SDK (Firebase v9+) is modular — always use `import { getAuth } from 'firebase/auth'`, never `import firebase from 'firebase/app'`.

---

## Caching Strategy

### Cache Immutable Assets Indefinitely
PRINCIPLE: Static assets whose content is determined by their hash-based filename (JS chunks, CSS, images processed by the build tool) should be served with `Cache-Control: public, max-age=31536000, immutable`.

HERE: The bundler (Vite) produces content-hashed filenames (e.g., `index-CAdG1bBJ.js`). The hosting provider (Firebase Hosting) should be configured with long-lived cache headers for `dist/assets/**`. The current `firebase.json` does not set explicit cache headers — this is a gap. Add a `headers` config block for `assets/**` if performance audits show unnecessary revalidation.

---

### Use TanStack Query for Stale-While-Revalidate
PRINCIPLE: For frequently accessed, slow-to-fetch data that does not change every second, serve the cached version immediately while revalidating in the background. This eliminates perceived load time for repeat visits.

HERE: The server state library (TanStack Query v5) provides stale-while-revalidate via `staleTime`. All new data fetching must use `useQuery` — see `/rules/frontend.md`. Set `staleTime` of at least 60 seconds for data the user will revisit frequently (e.g., product lists, service listings, profiles). The college/profile data loaded on mount is a good candidate for aggressive caching.

---

### Use Promise.allSettled for Multi-Fetch Pages
PRINCIPLE: If a page loads data from multiple independent endpoints, their fetches should run in parallel and be isolated — a failure in one should not prevent the others from rendering.

HERE: `Index.tsx` (the homepage) uses `Promise.allSettled` for five parallel API calls. All multi-fetch pages must follow this pattern. Never use `Promise.all` for fan-out fetches on shared pages where partial results are still useful.

---

## Image and Asset Optimization

### Compress Before Upload
PRINCIPLE: Never upload uncompressed user-provided images or documents to permanent storage. Compression should happen client-side before upload to minimize storage cost and serving bandwidth.

HERE: `src/lib/uploadToStorage.ts` runs `browser-image-compression` (max 5 MB, max 2000px) on images before upload. PDFs larger than 1 MB are compressed via Ghostscript WASM in a Web Worker (`src/lib/pdfWorker.ts`) before upload. This pipeline must remain in place for all uploads; never bypass it by uploading the raw `File` object directly to object storage (Cloudflare R2).

---

### File Size Limits — Both Client and Server
PRINCIPLE: Client-side size checks are UX (instant feedback). Server-side size checks are security (prevent quota abuse). Both must be present.

HERE:
- **Client-side**: `KnowledgeHub.tsx` and `RequestUploadModal.tsx` validate `file.size > 25 * 1024 * 1024` before starting the upload.
- **Server-side**: `api/get-upload-url.js` enforces the same limit (25 MB for knowledge docs, 5 MB for other uploads) and returns `400` if exceeded.
- **Edge worker**: `campus-scan-worker/src/index.ts` rejects files > 25 MB as a defense-in-depth backstop.

---

## Core Web Vitals Targets

### Largest Contentful Paint (LCP) — Target: ≤ 2.5s
PRINCIPLE: LCP measures when the largest visible content element finishes rendering. Primary causes: slow server response, render-blocking resources, unoptimized images.

HERE: In this SPA, LCP is dominated by the API response time for the homepage (five parallel calls). The cloud host (Render/Azure) free-tier API has a cold-start delay of up to 30 seconds after inactivity — the single biggest LCP risk. Mitigation: add a lightweight health-ping on app mount to keep the API warm, or upgrade to an always-on paid tier.

---

### Cumulative Layout Shift (CLS) — Target: ≤ 0.1
PRINCIPLE: CLS measures unexpected layout movement. Primary cause: async content loading in and displacing already-rendered content.

HERE: Reserve space for loading content with skeleton loaders that match the dimensions of real content. The `animate-pulse` skeletons in `ChatList.tsx` are the correct pattern. Never render a component that starts at `height: 0` and expands when data arrives without a reserved space placeholder.

---

### Interaction to Next Paint (INP) — Target: ≤ 200ms
PRINCIPLE: INP measures responsiveness to user input. Long JavaScript tasks (> 50ms) on the main thread delay all user interactions.

HERE: PDF compression (Ghostscript WASM) runs in a dedicated Web Worker (`pdfWorker.ts`). SHA-256 hashing runs in `hashWorker.ts`. Any future computationally intensive operation (parsing, crypto, image processing) must be offloaded to a Worker. Never perform heavy synchronous work in an event handler or render function.
