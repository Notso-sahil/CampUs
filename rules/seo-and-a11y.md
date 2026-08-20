# SEO & Accessibility Rules

This is a public-facing web application targeting Indian college students — SEO and accessibility are both relevant and required.

---

## Metadata

### Every Page Needs a Unique, Descriptive Title and Meta Description
PRINCIPLE: The `<title>` tag and `<meta name="description">` are the primary signals search engines and social platforms use to understand and display a page. Each page should have a title that includes both the page-specific context and the brand name (format: `[Page Name] | [Brand]`). Meta descriptions should be 120–160 characters describing the page's value in plain language.

HERE: The global title and meta description are set in `CampUs/index.html`. Because this is a single-page application with client-side routing, each route sets its own title using the head management library (`react-helmet-async`). Wrap the app root with `<HelmetProvider>` in `src/main.tsx`. Every new page component must include a `<Helmet>` block at the top:
```tsx
import { Helmet } from 'react-helmet-async';
<Helmet>
  <title>Knowledge Hub | CampUs</title>
  <meta name="description" content="Browse and share study notes, lab manuals, and course documents with your college." />
</Helmet>
```
Existing pages without `<Helmet>` blocks should be updated when touched.

---

### Open Graph and Twitter Card Tags
PRINCIPLE: Social sharing metadata (`og:title`, `og:description`, `og:image`, `twitter:card`) controls how links appear when shared on WhatsApp, Twitter/X, LinkedIn, and other platforms. These should be present on every public page.

HERE: `index.html` includes global OG and Twitter card tags. The `og:url` tag is currently missing — add `<meta property="og:url" content="https://campus91.web.app" />` to `index.html`. The OG image at `/CampUs.png` should be at least 1200×630px for best cross-platform display. Per-route OG tags can be set via the head management library (`react-helmet-async`) on detail pages (e.g., product detail pages).

---

## Semantic HTML Structure

### Use One `<h1>` Per Page, Hierarchical Headings Below It
PRINCIPLE: Each page should have exactly one `<h1>` stating the page's primary topic. Sub-sections use `<h2>`, sub-sub-sections use `<h3>`. Never skip heading levels. Screen readers and search engines use heading hierarchy to understand page structure.

HERE: New pages in `src/pages/` must include exactly one `<h1>` containing the page's primary heading. Use semantic heading tags (`<h1>`–`<h3>`) for structural headings, and `<p>` for body text. Never use a `<div>` with a large font class as a substitute for a heading element.

---

### Landmark Regions
PRINCIPLE: Use HTML5 landmark elements (`<main>`, `<nav>`, `<header>`, `<footer>`) to give screen reader users a navigable page structure. Every page must have exactly one `<main>` element.

HERE: Each page's content area must be wrapped in `<main>`. The `Navbar` component should use `<nav>`. The `Footer` component must be a `<footer>` element. The `BottomNav` mobile navigation should also use `<nav>` with `aria-label="Bottom navigation"` to distinguish it from the top navigation.

---

## Accessibility (WCAG 2.2 AA Baseline)

### All Interactive Elements Must Have Accessible Names
PRINCIPLE: Every button, link, and form input must have a human-readable label that a screen reader can announce. Icon-only buttons are inaccessible without a label.

HERE: Icon-only buttons in `Navbar.tsx` and `BottomNav.tsx` must include `aria-label`:
```tsx
<button aria-label="Open search">
  <Search className="h-5 w-5" />
</button>
```
UI library (shadcn/ui) form inputs use `<Label>` with `htmlFor` linked to the input's `id` — always pair them. Never render a form input without a visible or visually-hidden label.

---

### Focus Indicators Must Be Visible
PRINCIPLE: Keyboard users navigate using Tab. The currently focused element must always have a visible focus ring. `outline: none` on `:focus` without a replacement is a WCAG 2.2 failure.

HERE: UI library (shadcn/ui) components apply `ring-2 ring-offset-2` focus styles automatically. Custom focusable elements must include `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`. Never add `outline-none` alone to a custom focusable element.

---

### Images Require Alt Text
PRINCIPLE: All `<img>` elements must have an `alt` attribute. If decorative, use `alt=""`. If informative, describe the content.

HERE: User-uploaded product/service images should have descriptive alt text using the item title: `alt={product.title}`. Never use `<img>` without an `alt` attribute — even `alt=""` is better than omitting it.

---

### Color Must Not Be the Only Conveyor of Information
PRINCIPLE: Never rely solely on color to convey status or state — color-blind users will miss the signal. Always pair color with a shape, icon, or text label.

HERE: Scan status badges use color (green/yellow/red) paired with text labels ("Clean", "Scanning…", "Infected") and icons. Ensure no future status indicator is color-only.

---

## Performance and Accessibility Intersection

### Core Web Vitals Affect Both SEO Rankings and Usability
PRINCIPLE: Google uses Core Web Vitals (LCP, CLS, INP) as ranking signals. Poor CLS is also an accessibility failure — it disorients users with cognitive disabilities and moves interactive elements unexpectedly under keyboard or switch focus.

HERE: See `/rules/performance.md` for CWV targets. The skeleton loading pattern (fixed-height placeholder divs via `animate-pulse`) is the primary CLS mitigation. Always reserve space for loading content.

---

## Mobile Usability

### Minimum Tap Target Size
PRINCIPLE: On touch devices, interactive elements must have a minimum tap target of 44×44px (Apple HIG) or 48×48dp (Material) to prevent mis-taps.

HERE: Interactive elements use CSS framework (Tailwind) `p-2` or `p-3` padding. The `BottomNav` icons meet this minimum. New modal triggers, FABs, and list action buttons must be verified to meet the 44px minimum in mobile DevTools before shipping.
