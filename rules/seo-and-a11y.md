# SEO & Accessibility Rules

This is a public-facing web application targeting Indian college students — SEO and accessibility are relevant.

---

## Metadata

### Every Page Needs a Unique, Descriptive Title and Meta Description
PRINCIPLE: The `<title>` tag and `<meta name="description">` are the primary signals search engines and social platforms use to understand and display a page. Each page should have a title that includes both the page-specific context and the brand name (format: `[Page Context] | [Brand]`). Meta descriptions should be 120–160 characters and describe the page's value proposition in plain language.

HERE: The global title and meta description are set in `CampUs/index.html` — they apply to every route since this is a single-page application:
```html
<title>CampUs | Your One-Stop Campus Platform</title>
<meta name="description" content="CampUs: The ultimate all-in-one ecosystem for college students..." />
```
Because this is a React SPA with client-side routing, route-level titles are **not currently set** — every page shares the same title. This means search engines and social link previews always show the homepage title regardless of which page is shared.

**Gap to close**: Install `react-helmet-async` or Vite's `vite-plugin-ssr-meta` to set per-route `<title>` and `<meta name="description">` tags. Until then, ensure the global description is accurate and the most important keywords are present.

---

### Open Graph and Twitter Card Tags
PRINCIPLE: Social sharing metadata (`og:title`, `og:description`, `og:image`, `twitter:card`) controls how links appear when shared on WhatsApp, Twitter/X, LinkedIn, and other platforms. These should be present on every public page.

HERE: `index.html` includes OG and Twitter card tags globally:
```html
<meta property="og:title" content="CampUs | Your One-Stop Campus Platform" />
<meta property="og:image" content="/CampUs.png" />
<meta name="twitter:card" content="summary_large_image" />
```
The `og:url` tag is missing — add `<meta property="og:url" content="https://campus91.web.app" />`. The OG image at `/CampUs.png` should be at least 1200×630px for best display across platforms.

---

## Semantic HTML Structure

### Use One `<h1>` Per Page, Hierarchical Headings Below It
PRINCIPLE: Each page should have exactly one `<h1>` that states the page's primary topic. Sub-sections use `<h2>`, sub-sub-sections use `<h3>`, etc. Never skip levels. Screen readers and search engines use heading hierarchy to understand page structure.

HERE: Pages in `src/pages/` use headings inconsistently — some use `<h1>` for the page title, others use `<div>` with Tailwind text classes. New pages must always include exactly one `<h1>` containing the page's primary heading. Existing pages should be audited and corrected. Use semantic heading tags (`<h1>`–`<h3>`) for structural headings, and `<p>` for body text.

---

### Landmark Regions
PRINCIPLE: Use HTML5 landmark elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`) to give screen reader users a navigable page structure. Every page must have exactly one `<main>` element.

HERE: The `Navbar` component renders `<nav>` (verify — currently uses a `<div>` wrapping). The `Footer` component should be a `<footer>` element. Each page's content area should be wrapped in `<main>`. The SPA root `<div id="root">` is not itself a landmark — the landmark structure must come from the page components.

---

## Accessibility (WCAG 2.2 AA Baseline)

### All Interactive Elements Must Have Accessible Names
PRINCIPLE: Every button, link, and form input must have a human-readable label that a screen reader can announce. Buttons with only icons are inaccessible without a label.

HERE: Icon-only buttons (common in `Navbar.tsx` and `BottomNav.tsx`) must include an `aria-label` attribute:
```tsx
<button aria-label="Open search">
  <Search className="h-5 w-5" />
</button>
```
Shadcn/ui form inputs use `<Label>` with `htmlFor` linked to the input's `id` — always pair them. Never render a form input without a visible or visually-hidden label.

---

### Focus Indicators Must Be Visible
PRINCIPLE: Keyboard users navigate using Tab. The currently focused element must always have a visible focus ring — this is a WCAG 2.2 AA requirement. `outline: none` on `:focus` without a replacement is an accessibility failure.

HERE: Tailwind's default focus styles (`ring-2 ring-offset-2`) are applied by shadcn/ui components automatically. When creating custom interactive elements (e.g., raw `<button>` or `<div tabIndex={0}>`), ensure they include `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2` or the equivalent. Never add `outline-none` alone to a custom focusable element.

---

### Images Require Alt Text
PRINCIPLE: All `<img>` elements must have an `alt` attribute. If the image is decorative, use `alt=""`. If the image conveys information, describe it in `alt`. Empty alt on informative images and missing alt on decorative images are both violations.

HERE: User-uploaded product images in `ProductCard.tsx` and listing images across the app should have descriptive alt text using the item title: `alt={product.title}`. Background images via Tailwind (`bg-image`) and CSS are invisible to screen readers by default — this is acceptable for decorative images. Never use `<img>` without an `alt` attribute.

---

### Color Must Not Be the Only Conveyor of Information
PRINCIPLE: Never rely solely on color to convey status or state — users with color vision deficiencies will miss the signal. Always pair color with a shape, icon, or text label.

HERE: The VirusTotal scan status badges in `KnowledgeHub.tsx` use color (green for clean, yellow for scanning, red for infected) — each must also have a text label ("Clean", "Scanning…", "Infected") and ideally an icon. This is already implemented via text labels; ensure no future status indicator is color-only.

---

## Performance and Accessibility Intersection

### Core Web Vitals Affect Both SEO and A11y
PRINCIPLE: Google uses Core Web Vitals (LCP, CLS, INP) as ranking signals. Poor CLS (unexpected layout shift) is also an accessibility failure — it disorients users with cognitive disabilities and makes interactive elements move unexpectedly under focus.

HERE: See `/rules/performance.md` for CWV targets and mitigation strategies. The skeleton loading pattern (fixed-height placeholder divs) is the primary CLS mitigation in this codebase.

---

## Mobile and PWA Considerations

### The App Must Be Fully Operable on Mobile Without a Mouse
PRINCIPLE: On touch devices, hover states are not available and small tap targets cause usability failures. Minimum tap target size is 44×44px (Apple HIG) or 48×48dp (Material).

HERE: The `BottomNav` provides persistent mobile navigation. Interactive elements in the app use Tailwind's `p-2` or `p-3` padding to meet minimum tap-target size. New bottom-sheet or modal triggers must have a touch target of at least 44px height — verify with mobile DevTools before shipping.
