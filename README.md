# CampUs — College Lifestyle & Campus Utility Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.8-FF4154?style=flat-square&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Firebase](https://img.shields.io/badge/Firebase_Auth-12.16-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Private-lightgrey?style=flat-square)]()

**CampUs** is a modern, multi-tenant web application tailored for college students in India. It replaces fragmented WhatsApp groups, Discord servers, and notice boards with a unified, verified campus utility ecosystem for peer commerce, lost & found, academic resources, freelance gigs, team recruitment, and accommodation.

---

## 🚀 Key Modules & Features

- **🛒 Trade (Marketplace)**: Buy, sell, and exchange second-hand textbooks, electronics, bicycles, lab equipment, and hostel essentials with condition tags, pricing filters, college-scoping, and direct buyer-to-seller chat.
- **🔍 Recover (Lost & Found)**: Post lost or found items with images, campus location, date, category, and resolution status to connect owners with finders securely.
- **📚 Knowledge Hub**: Peer-to-peer academic repository for previous year exam papers (PYQs), lecture notes, lab manuals, and reference sheets. Features client-side image compression and deduplicated SHA-256 file uploads.
- **💼 Peer Services**: Campus freelancing marketplace where students offer skills such as tutoring, graphic design, web development, video editing, assignment formatting, and resume reviews.
- **👥 Find Teammates**: Form teams for hackathons, college projects, case competitions, sports, and cultural events with role requirements, request approvals, and dedicated team group chats.
- **🏠 Find Roommates**: Discover flatmates and PG accommodations matching student lifestyles (budget, diet preferences, smoking/drinking, sleep cycles) with integrated roommate group chats.
- **💬 Real-Time Messaging**: Built-in messaging layer for 1-to-1 marketplace conversations, team chats, and roommate discussions.
- **📅 Events & Featured Hub**: Discover upcoming campus fests, workshops, hackathons, and spotlighted student achievements.
- **🏛️ Multi-Campus Scoping**: Filter listings and activities by specific college or toggle cross-campus exploration.
- **🛡️ Admin Suite (`/admin`)**: Role-based access control panel to moderate listings, approve academic uploads, manage colleges, audit services, and review user feedback.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework & Runtime** | [React 18](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 5](https://vitejs.dev/) with `@vitejs/plugin-react-swc` |
| **Styling & Components** | [Tailwind CSS 3](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/) (Radix UI) · [Lucide React](https://lucide.dev/) |
| **Server State & Caching**| [TanStack Query v5](https://tanstack.com/query) (`@tanstack/react-query`) |
| **Authentication** | [Firebase v12](https://firebase.google.com/) (Email/Password & Google Sign-In) |
| **Routing** | [React Router DOM v6](https://reactrouter.com/) |
| **SEO & Head Management**| [react-helmet-async](https://github.com/staylor/react-helmet-async) |
| **File Processing** | [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) + Web Worker SHA-256 hashing |
| **Testing** | [Vitest](https://vitest.dev/) · [React Testing Library](https://testing-library.com/) · [jsdom](https://github.com/jsdom/jsdom) |
| **Linting** | [ESLint 9](https://eslint.org/) (Flat config with typescript-eslint) |

---

## 📂 Project Structure

```
CampUs/
├── public/                 # Static assets, logos, icons, and worker scripts
├── rules/                  # Stack-agnostic and project-specific engineering standards
│   ├── backend-database.md # DB query conventions, migrations, and indexing
│   ├── deployment-devops.md# Environment strategy, branching, and CI/CD
│   ├── frontend.md         # Component design, TanStack Query mandate, a11y
│   ├── performance.md      # Code splitting, asset optimization, Core Web Vitals
│   ├── security.md         # OWASP Top 10:2025 compliance and auth rules
│   └── seo-and-a11y.md     # Metadata, semantic HTML, WCAG 2.1 AA standards
├── src/
│   ├── components/         # Reusable application components (Navbar, Modals, Cards)
│   │   └── ui/             # Radix + shadcn/ui primitives (managed via CLI)
│   ├── contexts/           # AuthContext (Firebase auth) and CollegeContext
│   ├── hooks/              # Custom React hooks (useToast, useMobile)
│   ├── lib/                # API client, Firebase init, upload helpers, utilities
│   ├── pages/              # Top-level route views (PascalCase.tsx)
│   │   ├── admin/          # Admin panel views (Overview, Listings, Users, etc.)
│   │   ├── Index.tsx       # Campus homepage & module aggregator
│   │   ├── Trade.tsx       # Marketplace listing feed
│   │   ├── Recover.tsx     # Lost & found feed
│   │   ├── KnowledgeHub.tsx# Academic notes and PYQ library
│   │   ├── FindTeammates.tsx # Team finder & request management
│   │   └── FindRoommate.tsx  # Accommodation & flatmate finder
│   ├── test/               # Vitest setup and unit/integration tests
│   ├── types/              # Shared TypeScript definitions
│   ├── App.tsx             # Route configuration and global providers
│   ├── main.tsx            # Application entry point with HelmetProvider
│   └── index.css           # Design tokens, Tailwind directives, theme variables
├── AGENTS.md               # Permanent engineering standards and architecture summary
├── firebase.json           # Firebase Hosting and Auth configuration
├── vite.config.ts          # Vite build, plugins, alias (@/*), and dev server config
└── package.json            # Project dependencies and scripts
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: v18.x or v20.x+ installed
- **npm**: v9.x+ (or bun / pnpm)
- Running instance of **CampUs API** (local or deployed)

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd CampUs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying the sample:

```bash
cp .env.example .env
```

Fill in the required variables:

| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the running CampUs backend API | `http://localhost:3000` |
| `VITE_FIREBASE_API_KEY` | Firebase Web Client API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Web Auth domain | `campus-504010.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `campus-504010` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage bucket | `campus-504010.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID | `1234567890` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | `1:1234567890:web:...` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID (optional) | `G-XXXXXXXXXX` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (fallback image hosting) | `your_cloud_name` |
| `VITE_CLOUDINARY_UPLOAD_PRESET`| Cloudinary unsigned upload preset | `your_preset` |

### 4. Run the Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:8080`.

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `npm run dev` | Launches Vite local development server on port 8080 with HMR |
| `build` | `npm run build` | Compiles and builds production-ready bundle into `dist/` |
| `preview` | `npm run preview` | Serves the production build locally for verification |
| `lint` | `npm run lint` | Runs ESLint 9 checks across TypeScript and React code |
| `test` | `npm run test` | Runs the Vitest test suite once in jsdom environment |
| `test:watch` | `npm run test:watch` | Runs Vitest in interactive watch mode |
| `typecheck` | `npx tsc --noEmit` | Runs TypeScript compiler checks without emitting JS |

---

## 🏗️ Architecture & Engineering Rules

This repository enforces strict engineering guidelines to maintain production stability and code quality. Key rules (documented in detail in [`/AGENTS.md`](./AGENTS.md) and [`/rules/`](./rules/)):

1. **Server State via TanStack Query**: All new data fetching must use `useQuery` / `useMutation`. Raw `useState + useEffect` fetch patterns are deprecated.
2. **Resilient Data Loading**: Shared and aggregated pages (such as the Home dashboard) must use `Promise.allSettled` to prevent one failing service from crashing the entire page.
3. **Client-Side Asset Optimization**: Images must be compressed before upload (`browser-image-compression`). Document uploads compute SHA-256 in a Web Worker before initiating presigned uploads.
4. **Strict SEO & Accessibility**: Every page route must manage `<title>` and `<meta>` tags using `react-helmet-async` with semantic HTML5 elements and WCAG 2.1 AA accessible form controls.
5. **Component Hygiene**: Reusable UI primitives in `src/components/ui/` are managed via shadcn/ui. Application-specific UI lives in `src/components/`.

---

## 🚢 Deployment

### Firebase Hosting

The project is pre-configured with `firebase.json` for single-page app hosting on Firebase:

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting (requires firebase-tools)
firebase deploy --only hosting
```

### Vercel / Cloudflare Pages

The repository includes `vercel.json` with SPA catch-all rewrites (`/index.html`). Set the build command to `npm run build` and the output directory to `dist`.
