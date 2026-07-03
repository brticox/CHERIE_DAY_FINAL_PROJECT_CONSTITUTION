# Required Fixes Before Build

## Documentation Freeze

- [x] Remove or replace references to missing `FILES_TO_UPDATE.md`.
- [x] Remove or replace references to missing `PROJECT_AUDIT_REPORT.md`.
- [x] Remove or relocate `ui-ux-pro-max-skill/` from the final constitution folder.
- [x] If kept for historical reference, move it under an explicit archive path outside the build constitution and mark it non-authoritative.
- [x] Decide public editorial hub: `/rehber` for MVP; `/journal` future alias only.
- [x] Update every route table so the chosen editorial route is consistent.
- [x] Replace all `/Users/...`, `/Downloads/...`, and `/var/folders/...` asset references with repository-local paths.
- [x] Add a one-page `SOURCE_OF_TRUTH.md` or update `00_READ_ME_FIRST.md` with exact governing order after this audit.
- [x] Mark future-only systems explicitly: international commerce, EN/AR storefronts, live RSVP, guest lists, digital-site builder, and event client portal.

## Asset Freeze

- [x] Define canonical brand asset mapping: wordmark, monogram, stamp/wax seal, favicon, social image.
- [x] Promote production-candidate brand SVGs without altering geometry.
- [x] Produce the hero background MP4 loop in final path as production candidate.
- [ ] Produce WebM fallback.
- [x] Produce poster JPG production candidate.
- [x] Export production-candidate transparent hero foreground layers.
- [x] Confirm available promoted hero layers have transparent backgrounds where required; final lighting polish remains launch QA.
- [x] Create asset lock and media metadata requirements.
- [ ] Document image/video rights and allowed usage.

## MVP Scope Freeze

- [x] Define MVP 1 as public Maison site + full Turkey-only commerce + CMS/CRM/admin operations.
- [x] Lock paid checkout implementation with Turkey legal/payment decisions before build.
- [x] Define which admin modules are MVP and which are future.
- [x] Define seed content needed for homepage, experiences, collections, products, digital, memory, planning, FAQ, and Rehber.

## Commerce And Legal

- [x] Decide Turkey-first payment provider path: iyzico primary + PayTR secondary/fallback; bank transfer fallback if needed.
- [ ] Confirm merchant-account details externally: AMEX availability, foreign-issued card enablement for Turkey-only orders, 3DS rules, installment rules, settlement currency.
- [x] Define KVKK consent fields and retention model.
- [ ] Draft and legally review privacy policy, cookie policy, terms, distance sales agreement, return/cancellation policy, delivery policy, and proof approval terms.
- [x] Define shipping zones, production-time language, delivery methods, and return exceptions for personalized products at policy level.
- [x] Define invoice/tax requirements and order numbering at implementation level.

## CMS / CRM / Security

- [x] Convert schema into migration-ready implementation plan.
- [x] Define public views for products, collections, experiences, articles, portfolio, and media.
- [x] Write concrete RLS policy patterns for anon, staff roles, operations, and future clients.
- [x] Define Supabase Storage buckets and policies.
- [x] Define audit-log expectations for mutating admin actions.
- [x] Define form spam/rate-limit requirement in technical lock.
- [x] Define admin role assignment and staff-role helper direction.

## Design System

- [x] Choose final font stack with Turkish character support; licensing still must be checked before launch.
- [x] Convert color names into exact hex tokens.
- [x] Define component acceptance criteria for header, drawer, hero, product, checkout, forms, and mobile.
- [x] Define breakpoints and grid acceptance viewports.
- [x] Define reduced-motion behavior beyond the hero.

## Technical Foundation

- [x] Decide deployment target.
- [x] Define environment variables.
- [x] Define image/video optimization pipeline requirements.
- [x] Define analytics and consent-safe tracking.
- [x] Define SEO metadata defaults and sitemap route strategy.
- [x] Define CI checks: typecheck, lint, build, basic accessibility, and smoke tests.
