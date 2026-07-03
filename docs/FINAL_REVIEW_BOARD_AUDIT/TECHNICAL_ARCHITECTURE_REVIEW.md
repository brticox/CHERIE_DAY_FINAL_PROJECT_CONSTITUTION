# Technical Architecture Review

## Verdict

**Architecture readiness: 7.5 / 10**

The proposed stack is appropriate:

- Next.js App Router
- TypeScript
- Tailwind
- GSAP ScrollTrigger
- Lenis
- Supabase/Postgres/Auth/Storage
- Zod + React Hook Form
- Framer Motion for small UI

The risk is not the stack. The risk is unresolved operational detail.

## Strengths

- App Router is suitable for CMS-driven public pages, SEO, route metadata, and future admin.
- TypeScript and Zod are correct for form-heavy CRM/commerce flows.
- Supabase fits the CMS/CRM/product data model if RLS is designed before implementation.
- GSAP + Lenis is the right pairing for the cinematic hero.
- Framer Motion is correctly limited to small interface transitions.
- The docs repeatedly require reduced motion, performance, and accessibility.

## Architecture Risks

## Repository Hygiene

The root folder contains `ui-ux-pro-max-skill/`, a complete external plugin repository with its own `.git`, CLI package, workflows, skill files, datasets, demos, and screenshots. It is not part of the CHERIE DAY implementation architecture.

This creates risk for:

- build tooling discovery,
- dependency confusion,
- accidental copying of generic UI rules into the Maison design system,
- noisy search results,
- source-of-truth ambiguity,
- inflated project size,
- future commits that mix CHERIE DAY with unrelated plugin maintenance.

Required action: remove or relocate this folder before implementation. If the team wants to keep it as inspiration, store it outside this constitution folder and cite only the specific lessons in CHERIE DAY docs.

## Supabase RLS

The docs state the right security model, but the implementation still needs concrete policies. This is the highest technical risk.

Required before build:

- public views for published content,
- insert-only policies for public lead/contact forms,
- no anon select on leads,
- no anon access to suppliers, teams, assignments, internal costs, payment events, drafts, or notes,
- storage bucket policies,
- role bootstrap process,
- audit log strategy.

## Media Pipeline

Hero video and transparent layers require disciplined optimization. Without it, the hero will jank on mobile and damage the luxury impression.

Required:

- MP4/WebM compression,
- poster fallback,
- preload policy,
- responsive images,
- cache headers,
- Safari/mobile testing.

## Deployment Undefined

The docs do not lock deployment target, environment variable structure, preview strategy, backups, or monitoring.

Required:

- production host,
- Supabase project separation,
- env var naming,
- migration workflow,
- error monitoring,
- analytics and consent-safe tracking,
- database backup policy.

## Admin Complexity

Admin CMS + CRM + Turkey commerce + operations + future portal is a large system. The MVP admin must include the commerce operations needed for customer orders without drifting into unfinished future event-portal tooling.

Recommended MVP admin:

- auth and staff roles,
- CMS CRUD for core public entities,
- media library,
- SEO fields,
- leads/contact/product inquiry board,
- customer list,
- order management,
- payment status review,
- shipment/delivery status,
- proof approval queue,
- customer support threads,
- notes/status history,
- site settings.

Defer:

- inventory,
- production task board,
- client portal,
- live RSVP tools.

## SEO And Rendering

The architecture supports SEO, but the route conflict must be fixed. The metadata model is good; it needs canonical route rules, sitemap generation, robots rules, and structured data mapping per entity.

## Technical Decision

Proceed only after a foundation specification is frozen:

- exact MVP scope,
- exact routes,
- exact Supabase schema/migrations,
- exact RLS policies,
- exact media pipeline,
- exact deployment path.
