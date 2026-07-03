# Technical Architecture, Security, And Performance Audit

## Technical Verdict

The stack is appropriate:

- Next.js App Router,
- TypeScript,
- Tailwind,
- GSAP ScrollTrigger,
- Lenis,
- Supabase/Postgres/Auth/Storage,
- Zod + React Hook Form,
- Framer Motion for small UI.

The architecture is not yet implementation-complete.

## Security/RLS Risk

The project includes private leads, customers, orders, payments, proofs, internal suppliers, teams, assignments, costs, and future client portal data. RLS cannot remain directional.

Required before public forms:

- SQL migrations,
- role helper functions,
- public views for products/content,
- insert-only anon lead policies,
- no direct public table grants for sensitive data,
- customer ownership policies,
- admin/operations policies,
- storage bucket policies,
- policy tests.

## Performance Risk

The hero is the primary performance risk. The docs mention optimization but lack measurable budgets.

Set budgets:

- LCP target under 2.5s on good 4G for landing page.
- Background video poster immediately available.
- Mobile hero simplified to fewer layers.
- No autoplay dependency for first meaningful content.
- Lazy-load below-fold media.
- Image dimensions reserved to avoid CLS.

## Missing Technical Decisions

- deployment platform,
- env variable names,
- Supabase project separation,
- CI checks,
- analytics provider,
- consent-safe tracking,
- error monitoring,
- email/SMS provider,
- cargo/tracking integration,
- payment webhook security.

## Required Correction

Write a technical foundation spec before coding:

1. migrations,
2. RLS,
3. storage,
4. env vars,
5. CI,
6. deployment,
7. analytics/cookies,
8. performance budgets,
9. accessibility checks,
10. smoke tests.

