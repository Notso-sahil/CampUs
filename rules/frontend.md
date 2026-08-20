# Frontend Engineering Rules

---

## Component Structure

### Single-Responsibility Components
PRINCIPLE: Each component should do one thing. If a component fetches data, formats it, AND renders three different layouts, split it. A page component orchestrates; leaf components render.

HERE: Pages live in `src/pages/PascalCase.tsx` and handle data fetching + layout assembly. Reusable UI lives in `src/components/PascalCase.tsx`. Primitive building blocks (Button, Dialog, Input) live in `src/components/ui/` via the UI component library (shadcn/ui) — never hand-edit these files; update them via `npx shadcn-ui@latest add`.

---

### Component Composition over Prop Drilling
PRINCIPLE: Avoid passing props more than two levels deep. Prefer composition (render props, children, or context) for shared state that many components need.

HERE: Auth state is read via `useAuthContext()` from `src/contexts/AuthContext.tsx`. College selection is read via `useCollege()` from `src/contexts/CollegeContext.tsx`. Server state (API data) must be fetched with the server state library (TanStack Query) — see the Data Fetching rules below.

---

### File-Level Exports
PRINCIPLE: Each component file exports exactly one default export (the component). Named exports are reserved for types and utility functions from the same file.

HERE: Every `src/pages/*.tsx` and `src/components/*.tsx` file uses `export default function ComponentName()`. Types are co-located in `src/types/` or inline with the component they serve.

---

## State Management

### Server State vs. Local State
PRINCIPLE: Distinguish server state (remote, async, cached) from local/UI state (ephemeral, synchronous). Use different tools for each. Do not put API response data in a local `useState` variable if it requires caching, deduplication, or background re-fetching.

HERE: All new data-fetching must use the server state library (TanStack Query v5) — `useQuery` for reads, `useMutation` for writes. Raw `useState + useEffect` fetch patterns are deprecated for new code. The reasons:
- **Built-in lifecycle management**: caching, request deduplication, background re-fetching, stale-time invalidation, garbage collection.
- **No race conditions**: `useEffect`-based fetching frequently causes race conditions and memory leaks on unmounted components.
- **Consistent loading/error states**: `useQuery` provides `isLoading`, `isError`, and `data` without manual state variables.

Existing pages that use `useState + useEffect + api.get()` do not need to be migrated immediately, but all new features must use `useQuery`.

```tsx
// CORRECT — new pattern
const { data: products, isLoading, isError } = useQuery({
  queryKey: ['products', collegeId],
  queryFn: () => api.get(`/api/products?college_name=${collegeId}`),
  staleTime: 60_000,
});

// DEPRECATED — do not use for new features
const [products, setProducts] = useState([]);
useEffect(() => { api.get('/api/products').then(setProducts); }, []);
```

---

### Form State
PRINCIPLE: Form state (field values, validation errors, submission state) is local, synchronous, and ephemeral — it does not belong in a global store or a server-state cache.

HERE: Use `react-hook-form` + `zod` for all forms. `react-hook-form` manages field values and validation state; `zod` provides the schema. On submit, call a TanStack Query `useMutation` to send data to the API.

---

### Avoid Redundant State
PRINCIPLE: Never store derived values as state — compute them from existing state on every render.

HERE: When filtering or mapping API data for display (e.g., tab filters in `ChatList.tsx`), derive the filtered array inline during render rather than storing a separate `filteredItems` state variable.

---

## Styling

### Design Token System
PRINCIPLE: All colors, spacing, typography, border-radius, and shadow values must come from the design token system — never hardcode raw hex/pixel values in component styles.

HERE: Tokens are CSS custom properties in `src/index.css` (e.g., `--primary`, `--border`, `--radius`). Use the CSS framework (Tailwind) utility classes that map to these tokens: `bg-primary`, `border-border`, `text-muted-foreground`, `rounded-lg`. Never write `style={{ color: '#3b82f6' }}` or `className="bg-[#3b82f6]"`.

---

### Typography
PRINCIPLE: Use a defined type scale from the design system. Never set arbitrary `font-size` values inline.

HERE: The project font is DM Sans, configured in `tailwind.config.ts` under `fontFamily.display` and `fontFamily.body`. Use `font-display` for headings, `font-body` for body copy. Use the CSS framework (Tailwind) scale: `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`.

---

### Dark Mode
PRINCIPLE: All new UI must support both light and dark themes using semantic color tokens, not hardcoded light/dark overrides.

HERE: Dark mode is class-based (`darkMode: ["class"]` in `tailwind.config.ts`). Use semantic classes only — `bg-card`, `text-foreground`, `border-border`. Never use `dark:` variants for colors that have a semantic token equivalent.

---

## Accessibility

### Semantic HTML
PRINCIPLE: Use the correct HTML element for every purpose. A button that triggers an action is `<button>`. A link that navigates is `<a>`. Divs should never receive `onClick` without a corresponding `role` and `tabIndex`.

HERE: Interactive non-link navigation uses `<button>` with `onClick`. Navigation uses the router (React Router) `<Link>`. The UI component library (shadcn/ui) handles ARIA attributes automatically — prefer its primitives over rolling custom interactive elements.

---

### Keyboard Navigation
PRINCIPLE: Every interactive element must be reachable and operable via keyboard alone (Tab to focus, Enter/Space to activate, Escape to dismiss modals).

HERE: Radix UI primitives (Dialog, Select, DropdownMenu) provide keyboard navigation out of the box. Custom interactive elements must add `tabIndex={0}` and `onKeyDown` handlers if they are not native `<button>` or `<a>` elements.

---

### Color Contrast
PRINCIPLE: Text must meet WCAG AA minimum contrast: 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+).

HERE: Semantic color pairs from `index.css` are pre-validated. Avoid rendering `text-muted-foreground` on `bg-muted` for anything other than supporting/secondary text — verify contrast for any new color combination.

---

## Required for Every New UI Feature

### Loading State
PRINCIPLE: Every async operation must have a visible loading state. Never leave a user staring at empty space during a fetch.

HERE: TanStack Query's `isLoading` flag drives skeleton loaders (`animate-pulse` + `bg-secondary/40` divs) for content areas. Form submit buttons show `disabled` + text change (e.g., "Submitting…") during submission. See `ChatList.tsx` (skeleton rows) for the established skeleton pattern.

---

### Error State
PRINCIPLE: Every async operation must handle and display errors. Silent failures are not acceptable.

HERE: TanStack Query's `isError` + `error` flags drive error UI. Use `useToast()` from `src/hooks/use-toast.ts` for transient errors: `toast({ title, description, variant: "destructive" })`. For page-level failures, show inline error UI in the content area. Always use `Promise.allSettled` (not `Promise.all`) on multi-endpoint fetches so one failure does not blank all other sections.

---

### Empty State
PRINCIPLE: Every data list must have a designed empty state — not a blank space or raw "No items" text.

HERE: Empty states include: an icon (from `lucide-react`), a bold title, a short description, and a CTA button. See `ChatList.tsx` `TAB_CONFIG` for the established pattern.

---

### Per-Route Metadata
PRINCIPLE: Every page must set its own `<title>` and `<meta name="description">` so that search engines, browser tabs, and social sharing links show meaningful, page-specific content.

HERE: Use `react-helmet-async`'s `<Helmet>` component at the top of every page component. Wrap the app root with `<HelmetProvider>` in `src/main.tsx`. Format:
```tsx
import { Helmet } from 'react-helmet-async';

export default function KnowledgeHub() {
  return (
    <>
      <Helmet>
        <title>Knowledge Hub | CampUs</title>
        <meta name="description" content="Browse and share study notes, lab manuals, and course documents with your college." />
      </Helmet>
      {/* page content */}
    </>
  );
}
```
Every new page must include a `<Helmet>` block. The title format is `[Page Name] | CampUs`.

---

### Responsive / Mobile-First
PRINCIPLE: Design for the smallest viewport first, then add complexity for wider screens.

HERE: The app has a persistent `BottomNav` on mobile (hidden on `md:`). Use CSS framework (Tailwind) mobile-first breakpoints (`sm:`, `md:`, `lg:`). Container max-width is `max-w-2xl` or `max-w-4xl` for content pages. Test all new UI at 375px viewport width before considering it complete.
