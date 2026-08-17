# Frontend Engineering Rules

---

## Component Structure

### Single-Responsibility Components
PRINCIPLE: Each component should do one thing. If a component fetches data, formats it, AND renders three different layouts, split it. A page component orchestrates; leaf components render.

HERE: Pages live in `src/pages/PascalCase.tsx` and handle data fetching + layout assembly. Reusable UI lives in `src/components/PascalCase.tsx`. Primitive building blocks (Button, Dialog, Input) live in `src/components/ui/` and are never hand-edited — they are generated and updated via `npx shadcn-ui@latest add`.

---

### Component Composition over Prop Drilling
PRINCIPLE: Avoid passing props more than two levels deep. Prefer composition (render props, children, or context) for shared state that many components need.

HERE: Auth state is read via `useAuthContext()` (from `src/contexts/AuthContext.tsx`). College selection is read via `useCollege()` (from `src/contexts/CollegeContext.tsx`). Server state (API data) is fetched with TanStack Query v5 (`@tanstack/react-query`) where caching matters; simple one-off fetches use the `api.*` helpers from `src/lib/api.ts` with `useState`/`useEffect`.

---

### File-Level Exports
PRINCIPLE: Each component file exports exactly one default export (the component). Named exports are reserved for types and utility functions from the same file.

HERE: Every `src/pages/*.tsx` and `src/components/*.tsx` file uses `export default function ComponentName()`. Types are co-located in `src/types/` or inline with the component they serve.

---

## State Management

### Server State vs. Local State
PRINCIPLE: Distinguish server state (remote, async, cached) from local/UI state (ephemeral, synchronous). Use different tools for each. Don't put API response data in a global client store if it has a natural owner.

HERE: TanStack Query v5 is installed for server state caching but is inconsistently used — many pages still use `useState` + `useEffect` + `api.get()` manually. New features that fetch data should use TanStack Query `useQuery`. Forms use `react-hook-form` + `zod` for local form state.

---

### Avoid Redundant State
PRINCIPLE: Never store derived values as state — compute them from existing state on every render. If a value can be computed from props or other state, it is not state.

HERE: When filtering or mapping API data for display (e.g., tab filters in `ChatList.tsx`), derive the filtered array inline during render rather than storing a separate `filteredItems` state variable.

---

## Styling

### Design Token System
PRINCIPLE: All colors, spacing, typography, border-radius, and shadow values must come from the design token system — never hardcode raw hex/pixel values in component styles.

HERE: Tokens are CSS custom properties defined in `src/index.css` (e.g., `--primary`, `--border`, `--radius`). Always use Tailwind utility classes that map to these tokens (e.g., `bg-primary`, `border-border`, `text-muted-foreground`, `rounded-lg`). Never write `style={{ color: '#3b82f6' }}` or `className="bg-[#3b82f6]"`.

---

### Typography
PRINCIPLE: Use a defined type scale from the design system. Never set arbitrary `font-size` values inline.

HERE: The project font is DM Sans, configured in `tailwind.config.ts` under `fontFamily.display` and `fontFamily.body`. Use `font-display` for headings and `font-body` for body copy. Use Tailwind's scale (`text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`).

---

### Dark Mode
PRINCIPLE: All new UI must support both light and dark themes using semantic color tokens, not hardcoded light/dark overrides.

HERE: Dark mode is class-based (`darkMode: ["class"]` in `tailwind.config.ts`). Use semantic Tailwind classes only — `bg-card`, `text-foreground`, `border-border`. Never use `dark:` variants for colors that have a semantic token equivalent.

---

## Accessibility

### Semantic HTML
PRINCIPLE: Use the correct HTML element for every purpose. A button that triggers an action is `<button>`. A link that navigates is `<a>`. A list is `<ul>/<li>`. Divs should never receive `onClick` without a corresponding `role` and `tabIndex`.

HERE: Interactive non-link navigation uses `<button>` with `onClick`. Navigation uses React Router `<Link>`. The shadcn/ui primitives (from `src/components/ui/`) handle ARIA attributes automatically — prefer them over rolling custom interactive elements.

---

### Keyboard Navigation
PRINCIPLE: Every interactive element must be reachable and operable via keyboard alone (Tab to focus, Enter/Space to activate, Escape to dismiss modals).

HERE: Radix UI primitives (Dialog, Select, DropdownMenu, etc.) provide keyboard navigation out of the box. Custom interactive elements must add `tabIndex={0}` and `onKeyDown` handlers if they are not native `<button>` or `<a>` elements.

---

### Color Contrast
PRINCIPLE: Text must meet WCAG AA minimum contrast: 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+).

HERE: Semantic color pairs from `index.css` are pre-validated (e.g., `text-foreground` on `bg-background`). Avoid rendering `text-muted-foreground` on `bg-muted` for anything other than supporting/secondary text — verify contrast for any new color combination.

---

## Required for Every New UI Feature

### Loading State
PRINCIPLE: Every async operation must have a visible loading state. Never leave a user staring at empty space during a fetch.

HERE: Use skeleton loaders (`animate-pulse` + `bg-secondary/40` divs) for content areas. Use `disabled` + text change (e.g., "Submitting...") for form buttons. See `ChatList.tsx` (skeleton rows) and `KnowledgeHub.tsx` (loading spinner) for existing patterns.

---

### Error State
PRINCIPLE: Every async operation must handle and display errors. Silent failures are not acceptable.

HERE: Use `useToast()` from `src/hooks/use-toast.ts` for transient error messages. Use `toast({ title, description, variant: "destructive" })` for errors. For page-level failures, show an inline error message in the content area. Always use `Promise.allSettled` (not `Promise.all`) on multi-endpoint fetches so one failure doesn't blank all other sections.

---

### Empty State
PRINCIPLE: Every data list must have a designed empty state — not a blank space or raw "No items" text.

HERE: Empty states include: an icon (from `lucide-react`), a bold title, a short explanatory description, and a CTA button pointing to the relevant action. See `ChatList.tsx` `TAB_CONFIG` for the established pattern.

---

### Responsive / Mobile-First
PRINCIPLE: Design for the smallest viewport first, then add complexity for wider screens. Never use `hidden sm:block` as the default pattern — that means you designed desktop first and hid it.

HERE: The app has a persistent `BottomNav` on mobile (hidden on `md:`). Use Tailwind mobile-first breakpoints (`sm:`, `md:`, `lg:`). Container max-width is `max-w-2xl` or `max-w-4xl` for content pages. Test all new UI at 375px viewport width before considering it complete.
