# TECHNICAL FOUNDATION AND QA LOCK

## Stack Lock

- Next.js App Router
- TypeScript strict
- Tailwind
- Supabase/Postgres/Auth/Storage
- Zod
- React Hook Form
- GSAP ScrollTrigger
- Lenis
- Framer Motion only for small UI transitions

## Deployment Decision

Preferred:

- Vercel for Next.js,
- Supabase hosted project,
- separate development/staging/production environments.

## Environment Variables

Required:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `IYZICO_BASE_URL`
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYMENT_WEBHOOK_SECRET`
- `RESEND_API_KEY` or chosen email provider
- `WHATSAPP_CONTACT_URL`
- `COOKIE_CONSENT_VERSION`

## CI Checks

Required before merge:

- typecheck,
- lint,
- build,
- unit tests for utilities,
- RLS policy tests where possible,
- Playwright smoke tests,
- accessibility smoke test,
- route render test,
- no exposed env secret scan.

## Performance Budgets

- Landing LCP target: under 2.5s on good 4G.
- CLS under 0.1.
- INP under 200ms target.
- Hero mobile should use simplified layer set.
- Background video must have poster.
- All images need width/height or reserved aspect ratio.
- Below-fold media lazy loads.

## Accessibility

- visible labels on forms,
- keyboard navigable drawer/cart/account,
- focus ring visible,
- reduced motion,
- alt text required for CMS media,
- payment errors announced clearly,
- color contrast WCAG AA.
- optional audio interactions are off by default and require explicit user enablement.
- audio/canvas decorative effects must have visual-only and reduced-motion fallbacks.

## Smoke Tests

Minimum:

- homepage renders,
- mobile menu opens/closes,
- product listing renders,
- product detail renders,
- cart add/remove works for eligible product,
- checkout guard rejects non-Turkey delivery,
- account login/register routes render,
- proof page permission is scoped,
- anon cannot access admin,
- Rehber article renders with schema.
- optional sound toggle does not autoplay audio and does not block navigation.
