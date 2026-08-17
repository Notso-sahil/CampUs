# Performance Rules

---

## Bundle Size and Code Splitting

### Split by Route and Vendor Domain
PRINCIPLE: Ship only the JavaScript a user needs for the page they're currently viewing. The initial bundle should contain only the shell (routing, auth, layout). Heavy page-specific code should load lazily when the route is first visited.

HERE: Vite is the bundler. `vite.config.ts` defines three manual chunks:
- `vendor`: `react`, `react-dom`, `react-router-dom`
- `firebase`: `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`
- `ui`: `lucide-react`, `clsx`, `tailwind-merge`

React Router lazy imports (`React.lazy` + `Suspense`) are **not yet used** — every page is eagerly imported in `App.tsx`. This means the initial bundle includes all 25 pages. New pages added to the router should be lazy-loaded:
```tsx
const FindTeammates = React.lazy(() => import('./pages/FindTeammates'));
// wrap with <Suspense fallback={<PageSpinner />}>
```
Never import a page component statically in `App.tsx` unless it is always rendered on first load (e.g., `Index`, `Auth`, `Navbar`).

---

### Tree-Shake Imports
PRINCIPLE: Import only what you use from large libraries. Barrel imports (`import * as X`) or top-level library imports can pull in the entire library even when only one function is needed.

HERE: Lucide React supports named imports — always use `import { Upload, ShoppingBag } from 'lucide-react'` not `import * from 'lucide-react'`. Firebase is modular (v9+) — always use the modular import form: `import { getAuth } from 'firebase/auth'`, never `import firebase from 'firebase/app'`.

---

## Caching Strategy

### Cache Immutable Assets Indefinitely
PRINCIPLE: Static assets whose content is determined by their hash-based filename (JS chunks, CSS, images processed by the build tool) should be served with `Cache-Control: public, max-age=31536000, immutable`. The browser can then skip all re-validation for a full year.

HERE: Vite builds all JS/CSS chunks with content-hash filenames (e.g., `index-CAdG1bBJ.js`). Firebase Hosting and the frontend's Azure CDN layer should be configured with long-lived cache headers for `dist/assets/**`. The `firebase.json` hosting config does not currently set explicit cache headers — this is a gap. Add a `headers` config block for `assets/**` if performance audits show unnecessary revalidation.

---

### Use Promise.allSettled for Multi-Fetch Pages
PRINCIPLE: If a page loads data from multiple independent endpoints, their fetches should run in parallel and be isolated — a failure in one should not prevent the others from rendering.

HERE: `Index.tsx` (the homepage) uses `Promise.allSettled` for its five parallel API calls. All other multi-fetch pages must follow this pattern. Never use `Promise.all` for fan-out fetches on shared pages where partial results are still useful.

---

### TanStack Query Stale-While-Revalidate
PRINCIPLE: For frequently accessed, slow-to-fetch data that doesn't change every second, serve the cached version immediately while revalidating in the background. This eliminates perceived load time for repeat visits.

HERE: TanStack Query v5 is installed and provides stale-while-revalidate out of the box via `staleTime`. New features that fetch data the user will revisit frequently (e.g., product lists, service listings) should use `useQuery` with a `staleTime` of at least 60 seconds. The college/profile context data loaded on mount is a good candidate.

---

## Image and Asset Optimization

### Compress Before Upload
PRINCIPLE: Never upload uncompressed user-provided images or documents to permanent storage. Compression should happen client-side before the upload to minimize storage cost and serving bandwidth.

HERE: `src/lib/uploadToStorage.ts` runs `browser-image-compression` (max 5 MB, max 2000px) on images before upload. PDFs larger than 1 MB are compressed via Ghostscript WASM in a Web Worker (`src/lib/pdfWorker.ts`) before upload. This pipeline must remain in place for all uploads; never bypass it by uploading the raw `File` object directly to R2.

---

### File Size Limits Must Be Enforced Client-Side AND Server-Side
PRINCIPLE: Client-side size checks are UX — they give instant feedback. Server-side size checks are security — they prevent abuse of the storage quota. Both must be present.

HERE:
- Client-side: `KnowledgeHub.tsx` and `RequestUploadModal.tsx` validate `file.size > 25 * 1024 * 1024` before starting the upload.
- Server-side: `api/get-upload-url.js` enforces the same limit (`25 MB` for `folder === 'knowledge'`, `5 MB` for everything else) and returns `400` if exceeded.
- Scan worker: `campus-scan-worker/src/index.ts` rejects files `> 25 MB` as a defense-in-depth backstop.

---

## Core Web Vitals Targets

### Largest Contentful Paint (LCP) — Target: ≤ 2.5s
PRINCIPLE: LCP measures when the largest visible content element finishes rendering. The primary causes are slow server response times, render-blocking resources, and unoptimized images.

HERE: In this SPA, LCP is dominated by the API response time for the homepage (`Promise.allSettled` of five calls). The Render.com (previously Azure, now also on Render for some deployments) free-tier API has a cold-start delay of up to 30 seconds after inactivity — this is the single biggest LCP risk. Mitigation: add a lightweight health-ping call on app mount so the API stays warm, or upgrade to a paid tier with always-on instances.

---

### Cumulative Layout Shift (CLS) — Target: ≤ 0.1
PRINCIPLE: CLS measures unexpected layout movement. The primary cause is content loading in asynchronously and displacing already-rendered content.

HERE: Reserve space for loading content with skeleton loaders that match the dimensions of the real content. The `animate-pulse` skeleton in `ChatList.tsx` (four `h-20` divs) is the correct pattern. Never render a component that starts at `height: 0` and expands when data arrives without reserved space.

---

### Interaction to Next Paint (INP) — Target: ≤ 200ms
PRINCIPLE: INP measures responsiveness to user input. Long JavaScript tasks (> 50ms) on the main thread delay all user interactions.

HERE: PDF compression (Ghostscript WASM) runs in a dedicated Web Worker (`pdfWorker.ts`) to avoid blocking the main thread. SHA-256 hashing runs in `hashWorker.ts`. Any future computationally intensive operation (parsing, crypto, image processing) must similarly be offloaded to a Worker. Never perform heavy synchronous work (loops over large arrays, complex transforms) in an event handler or render function.
