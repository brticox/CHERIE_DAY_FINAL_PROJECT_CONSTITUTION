# Phase 1 — Launch Blockers Implementation Report

## Repository stabilization

Baseline was `ab33c3c`, equal to `origin/main`, on `phase/01-launch-blockers-20260714`. A 234MB timestamped backup was created at `../CHERIE_DAY_PHASE1_BACKUP_20260714-092945.tar.gz` with SHA-256 `d27cb0b1d2f0caf62a9ff772c31cce55ef702b5c6c9708f8c7494f9942006868`.

Original dirt groups: homepage sections plus Turkey map/testimonials; hero light/video/tilt/store icon and media; service detail/intake routing/city seed; global styles; brand mark duplicate; design-system notes; two production-lab drafts. There was no legal/notification dirt. Homepage, hero and services were verified and committed separately. Design-system notes and lab drafts remain intentionally untracked local work.

## Canonical CSS

`app/layout.tsx` imports only `styles/globals.css`. `app/globals.css` does not exist. The appended homepage section is scoped, retains Tailwind layers/tokens and reduced-motion rules. No duplicate global entry remains.

## New/uncommitted asset manifest at stabilization

| Asset group | Reference | Size/status | Action |
|---|---|---|---|
| `CARD.png`, `PHOTO2.png`, `Photo1.png` | `ProductWorlds` and CSS mask | 2.26–2.46MB each, used | committed with homepage |
| `hero-video.mp4` | `HeroVideoScrub` | 2.60MB, used desktop only | committed with hero |
| `hero-source.png`, `hero-mobile-source.png` | `HeroOverture` | 3.23/3.29MB, LCP sources | committed with verified hero |
| `hero-store-icon.png` | `HeroStoreIcon` | 3.23MB, used desktop | committed with hero |
| `object-seal.png/.webp` | no references | obsolete tracked assets | deleted in hero commit |
| `hero-video-clean.mp4` | no reference | 6.76MB | excluded after backup |
| six `poster-hands-mobile-garden-*` | no reference | 135–329KB | excluded after backup |
| `public/brand/logo-mark.svg` | byte-identical to `CDD.svg` | duplicate | excluded after backup |
| two `_assets/.../draft-*` files | production-lab scratch | visibly named drafts | retained local, uncommitted |

## Legal engineering

The migration adds version lifecycle, approval, review flag, locale, deterministic content hash, summary/source metadata, supersession, immutable published content and a public view that cannot expose placeholders. Checkout filters strictly for approved published lawyer-reviewed versions. Historical order version IDs are linked from order details and served only after customer/order ownership verification. Zod import validation and a lawyer handoff are included.

## Notification engineering

The outbox now supports domain/aggregate identity, recipient kind/email, category, locale, database idempotency, bounded attempts, due time, locks, provider IDs and redacted errors. Intake, order creation, verified payment failure and order/proof/production/shipment transitions enqueue transactionally. A protected worker, Resend adapter, capture adapter, Turkish template catalog, retries, stale lock recovery and protected operations view are included.

## External dependencies not claimed complete

- Lawyer-approved Turkish corpus and verified seller/company/tax details.
- Live Resend account/key, verified sender domain and SPF/DKIM/DMARC.
- Production cron invocation and alert routing.
- Deployment of migrations and disposable database integration run.
- PayTR sandbox/live callback verification (later phase).

## Commands

- `npm test`
- `npm run typecheck && npm run lint`
- Stop dev server, then `npm run build`
- `npm run security:audit`
- `npm run email:preview`
- Local/staging DB: `DATABASE_URL=... npm run test:phase1:db`
