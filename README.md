# CHERIE DAY — Application

Turkey-only luxury wedding, gift & celebration **commerce + services maison**.
This is the Next.js application. The product constitution (source of truth) lives
in [`/docs`](./docs) and [`00_READ_ME_FIRST.md`](./00_READ_ME_FIRST.md) — do not
edit constitution docs or `/assets` as part of app work.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · CSS-variable design
tokens (`docs/25`) · shadcn-compatible UI (`components/ui`) · lucide-react ·
Framer Motion (UI micro-interactions) · GSAP + Lenis (installed) · Supabase
(client structure) · Zod + React Hook Form.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (docs/29)
npm run dev                  # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`.

## Architecture

```
app/                     App Router
  (site)/                public surfaces (shared header/footer) — Turkish routes
  admin/                 admin operating system shell (noindex)
  layout.tsx             root: fonts + globals
  not-found.tsx          Turkish 404
  error.tsx              Turkish 500 boundary
components/{layout,ui,commerce,services,admin}
lib/{supabase,data,payments,legal,utils.ts}
styles/globals.css       frozen design tokens (docs/25)
content/                 static/seed content (future)
public/brand/            official brand vectors (from assets/brand-source)
```

## Turkish-first routes

Public top-level URLs are Turkish. Legacy English paths (`/shop`,
`/collections`, `/experiences`, `/digital`, `/memory`, `/planning`) 301-redirect
to their Turkish equivalents (`/magaza`, `/koleksiyonlar`, `/deneyimler`,
`/dijital`, `/hatira`, `/planlama`) — see `next.config.mjs`. No duplicated live
routes.

## Phase status

Phase 1 delivers: scaffold, design tokens, full route shell, layout skeleton,
Turkish 404/500. The previous homepage/landing-page system was archived outside
the project on the Desktop; `/` is currently a clean reset page. **Not** built
yet: payment integrations, live Supabase application, admin business logic.
