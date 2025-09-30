# Carb Cycling Planner

An open-source carb cycling planner that generates a personalized 3–7 day macro plan with drag-and-drop, CSV/Markdown export, and PNG sharing. No login required.

Built with React, TypeScript, Vite, Tailwind CSS, and lightweight state via hooks. SEO meta is applied at runtime from environment variables.

**Live Usage**: Run locally with the quick start below, or deploy using the guide in `DEPLOYMENT.md`.

**Features**

- 3–7 day plan based on body type and macros (carb/protein/fat coefficients)
- Metabolic math: Mifflin–St Jeor BMR and TDEE via activity factor
- Drag-and-drop day arrangement; per‑day workout assignment
- Export: copy results as Markdown or CSV; export PNG image
- Persistence: saves form, settings, and training config in `localStorage`
- i18n: Chinese and English, with language detector and a UI switcher
- Units: metric/imperial toggle (kg ↔ lb, cm ↔ ft′in″)
- Theming: light/dark/system with Tailwind v4 design tokens and particle background
- SEO: canonical, Open Graph, and Twitter tags from env; default image at `/og.png`

**Tech Stack**

- React 19, TypeScript 5, Vite 7
- Tailwind CSS v4
- Radix UI primitives and shadcn‑style components
- Drag‑and‑drop: Atlaskit pragmatic DnD (desktop) + dnd-kit (mobile grid)
- i18next + browser detector
- posthog-js (optional, env‑gated)
- zod + react-hook-form
- html-to-image (for PNG export)

**Quick Start**

- Prerequisites: Node.js 18+ and npm
- Install: `npm install`
- Dev server: `npm run dev` then open the printed URL
- Build: `npm run build` (outputs to `dist/`)
- Preview prod build: `npm run preview`

**Scripts**

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check and build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run format` / `npm run format:check` — Prettier write/check
- `npm run test` | `npm run test:run` | `npm run test:ui` — Vitest watch/CI/UI
- `npm run cli` — run the CLI utility at `src/cli.ts`

**CLI Examples**

- `npm run cli -- 70 mesomorph experienced 7`
- `npm run cli -- 80 endomorph custom 1.8 5`
- `npm run cli -- 60 ectomorph beginner 3`

**Environment Variables**

- Copy `.env.example` to `.env.local` and fill as needed.
- Supported keys:
  - `VITE_SITE_URL` — absolute site URL for canonical/og:url (e.g., `https://carb-cycling.pages.dev`)
  - `VITE_SITE_NAME` — site title (default: `Carb Cycling Planner`)
  - `VITE_META_DESCRIPTION` — default meta description
  - `VITE_OG_IMAGE` — absolute URL or path to social image (default: `/og.png`)
  - `VITE_TWITTER_HANDLE` — optional Twitter handle (e.g., `@yourhandle`)
  - `VITE_PUBLIC_GITHUB_REPO` — override the repo link in the header
  - PostHog (optional): `VITE_PUBLIC_POSTHOG_KEY` or `VITE_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST` or `VITE_POSTHOG_HOST`, `VITE_POSTHOG_ENABLE_DEV`

**SEO & Social Image**

- Recommended: place a file at `public/og.png` (1200×630). The app falls back to `/og.png` when no env is set.
- Alternatively set `VITE_OG_IMAGE` to an absolute URL in `.env.local` or your hosting provider’s env settings.

**Project Structure**

- `src/` — app code
  - `components/{ui,core,layout,shared}` — UI components (PascalCase in core/layout/shared, kebab-case in `ui/`)
  - `lib/` — domain logic and contexts (e.g., `calculator.ts`, persistence, i18n, SEO)
  - `main.tsx` / `App.tsx` — entry and root component
  - `index.css` — Tailwind v4 with theme tokens
- `public/` — static assets (e.g., `og.png`)
- `docs/` — product and technical docs (`prd.md`, plans, notes)
- `dist/` — production build output

**Testing**

- Frameworks: Vitest (+ jsdom) and Testing Library
- Setup: `src/test/setup.ts`
- Run tests: `npm run test` (watch) or `npm run test:run` (CI)

**Development Notes**

- State is managed with lightweight contexts/hooks in `src/lib/*-context.tsx`
- i18n is initialized in `src/lib/i18n.ts`
- Drag‑and‑drop uses `@atlaskit/pragmatic-drag-and-drop`
- Persistence is handled via `use-local-storage.ts` and `use-app-persistence.ts`

**Deployment**

- See `DEPLOYMENT.md` for Cloudflare Pages (recommended), Vercel, and Netlify instructions

**Contributing**

- Follow Conventional Commits (e.g., `feat: ...`, `fix: ...`)
- Branch naming: `feat/<slug>` or `fix/<issue-id>`
- Run `npm run lint`, `npm run test`, and `npm run build` before opening a PR

—

This repository is provided without an explicit license. If you plan to use or distribute it, please contact the repository owner.
