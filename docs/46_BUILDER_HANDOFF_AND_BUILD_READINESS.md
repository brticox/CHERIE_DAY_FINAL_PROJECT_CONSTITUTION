# BUILDER HANDOFF AND BUILD READINESS

This is the **single builder-handoff layer**. It replaces the missing `FINAL_REVIEW_BOARD_AUDIT/FINAL_DEVELOPER_HANDOFF_PROMPT.md` referenced by `06` and `16`. It sequences the whole constitution into phases, a feature matrix, data seed requirements, a QA acceptance checklist, a risk register, and the integration/dependency list. Read after `00_READ_ME_FIRST.md` and the hardening lock (`22`).

The previous homepage/landing-page creative system was archived outside this project on 2026-07-05. The `/` route is currently a plain reset page. A new homepage brief must be written and approved before any new landing-page design or cinematic implementation begins.

---

## 1. Governing Priority (updated)

On conflict, follow: `00_READ_ME_FIRST` → `22` → `23` → `24` → `40` (routes) → `41` (services) → `42` (data extensions) → `43` (checkout/state) → `26` → `44` (UX states) → `45` (admin) → `28` → `29` → `31` → `25`/`30` → `01`–`21` → `27` → `33`/`37` → `46` (this file for sequencing) → audit folders (reference only). Homepage/opening has no active creative authority after the reset; `39` still governs all public copy.

## 2. Feature Matrix — MVP vs Phase 2 vs Phase 3

### MVP (must-have before public launch)
- App shell, route map (`40`), tokens (`25`), Supabase schema incl. `08` + `41` + `42` core tables, RLS (`23`).
- Public: home (new brief pending), Maison, Experiences, Collections, Shop (all departments), Hizmetler showroom, Digital (marketing), Memory, Planning, Rehber, İletişim, SSS, Yardım, Yasal pages, Arama.
- Commerce: product catalog (physical + proof-required + digital-checkout), variants, personalization, price tiers, addons, cart, Turkey-only checkout, iyzico primary + PayTR fallback + bank transfer, order creation, order/proof/shipment tracking, refunds (admin), customer account (orders, addresses, favorites, proofs, digital projects, support, notifications, consent prefs).
- Services: service packages, city coverage, consultation, quote request + quote acceptance, reservation-request with deposit checkout, brief collection, reservation tracking in account.
- Reviews (moderated), post-event review request.
- Admin: catalog, orders, payments, refunds, shipments, proofs, production, reservations/quotes/consultations, reservation calendar, service packages/cities/availability, customers, support, reviews/gallery moderation, legal versioning + consent log, coupons, CMS, media, SEO, settings, roles, audit log.
- Legal/consent: all `/kurumsal/*` pages, consent evidence, cookie consent (3-choice).
- SEO: metadata, schema, sitemaps, Rehber seed (`27`).
- QA: performance budgets (`29`), mobile acceptance (`31`), accessibility (`44 §8`), RLS tests (`23`).

### Phase 2 (premium, shortly after launch)
- Installments UX polish; service milestone/interim-payment automation; staff auto-assignment; real-time-ish availability calendar; advanced filters/sort; wishlist share; digital download center; abandoned-cart admin → basic recovery (consented); analytics dashboards (`33 §16`); saved admin views expansion.

### Phase 3 (future)
- Self-serve wedding-website builder, live RSVP + guest list tooling, client portal (`07 §15`), gift cards/store credit, recommendations/upsell engine, marketing automation (email/SMS/WhatsApp sequences), supplier portal (internal), cohort/A-B/forecasting. International shipping / multi-currency / EN-AR storefronts remain out of scope until explicitly re-scoped (`19`).

## 3. Build Order (supersedes `04` where more specific)

1. Foundation: Next.js App Router, TS strict, Tailwind tokens (`25`), Supabase clients, env (`29`), route shell for `40`.
2. Schema + RLS migrations: `08` + `41` + `42`; public views; helper fns (`23`). RLS tests green before any public form ships.
3. CMS + media + seed data (`§4`).
4. Public CMS-driven pages + Shop catalog (read).
5. Account/auth + cart + Turkey checkout skeleton with consent (`43`), before live payments.
6. Payment providers + webhooks (idempotent) + order state machine (`43`).
7. Proof approval + fulfillment + support.
8. Services: packages/cities/availability + consultation/quote/reservation + deposit checkout (`41`).
9. Reviews + moderation + notifications.
10. Admin operating system (`45`) in parallel from step 3 onward.
11. New homepage brief and implementation after explicit approval.
12. Full QA across viewports (`31`, `34`).

## 4. Data Seed Requirements (for a credible non-empty launch)

- **Departments/categories:** all `40 §3.3` departments + subcategories.
- **Products:** ≥ the catalog can scale to 200+ invitations; seed ≥ 40–60 real products across ≥6 departments, each with ≥3 images, price/behavior, personalization, production time, return note, SEO (`26`).
- **Collections:** the 7 named collections (`02 §7`) fully populated (story, palette, media, linked products/digital).
- **Service packages:** ≥8 across organizasyon/dekor/muzik/foto/city, each with behavior, deposit model, lead time, gallery.
- **Cities:** initial served city list + availability rows.
- **Digital products:** ≥6 digital invitation designs.
- **Rehber:** the 12 seed articles (`27`).
- **Legal:** all `doc_key` docs with a v1 (placeholder acceptable pre-lawyer, but routes + consent wired).
- **FAQs, testimonials, portfolio:** enough to populate trust sections.
- **Coupons:** ≥1 test coupon. **Staff roles:** one of each role for permission testing.

## 5. QA Acceptance Checklist (launch gate)

**Security/data**
- [ ] anon cannot select leads/contact/quote/customers/orders/payments/proofs/reservations/reviews(pending)/favorites/notifications (`23`, `42 §10`).
- [ ] customer A cannot read customer B data (orders, reservations, digital projects, support).
- [ ] payment_events + supplier/team + internal cost never public.
- [ ] draft products/articles/services invisible; public views exclude internal fields.
- [ ] storage private buckets forbidden without owner/staff.

**Commerce**
- [ ] checkout rejects non-TR delivery; totals server-validated; proof gate enforced.
- [ ] payment success/failure/pending all reachable + Turkish; webhook idempotent; no raw provider error leaks.
- [ ] service deposit checkout works end-to-end; reservation status advances.
- [ ] digital delivery gated by ownership token.
- [ ] consent stored with version + timestamp for every order/reservation.

**UX/A11y/Perf**
- [ ] every data view has loading/empty/error states (`44`); search no-result offers a path.
- [ ] LCP <2.5s (4G), CLS <0.1, INP <200ms target (`29`).
- [ ] viewports 390×844, 430×932, 768×1024, 1440×900, 1920×1080: no overlap, no horizontal scroll, CTA visible (`31`, `34`).
- [ ] reduced-motion respected; keyboard nav + focus ring; WCAG AA contrast.
- [ ] all public copy Turkish; no marketplace/vendor leakage; brand marks undistorted.

**Admin**
- [ ] every public commerce/service state has an admin control; audit log records mutations; role matrix enforced (`45`).

## 6. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Legal text not lawyer-reviewed at launch | Compliance/consumer-law exposure | Wire routes + versioning now; block go-live on legal sign-off (`22`). |
| iyzico/PayTR merchant approval / AMEX / foreign-card / installment availability unconfirmed | Payment gaps | Provider abstraction (`20`); confirm merchant agreement before enabling each capability; graceful bank-transfer fallback. |
| e-Arşiv/e-Fatura + order numbering not accountant-approved | Tax/invoice risk | Support fields + export now; accountant review before launch (`24 §Invoice`). |
| Service availability is manual in MVP | Overbooking / slow response | Capacity + blackout + soft-hold TTL + SLA (`41 §4`, `28`); Phase 2 automation. |
| UGC photos published without valid KVKK consent | Privacy breach | `photo_consent` gate + moderation; never publish without consent (`42 §3`). |
| Personalized/service refund disputes | Consumer complaints | Clear pre-purchase policy text + admin rules, lawyer-reviewed (`24`, `43 §4`). |
| Mega-store scope → shallow build | Misses business reality | Enforce `37` + this matrix; reject invitation-shop-only builds (`00_AI_OPEN_FIRST §12`). |
| Creative opening hurts performance/commerce | Conversion loss | Reduced-motion + poster + mobile-simplified + no scroll trap (`38`, `29`, `31`). |
| Brand marks regenerated by AI | Identity damage | Vector-only rule; never AI-regenerate logo/CDD/stamp (`00_AI_OPEN_FIRST §4`, `05`, `17`, `30`). |

## 7. External Dependencies & Integrations

- **Payments:** iyzico (primary), PayTR (fallback), bank transfer/manual. 3DS, webhooks, refunds, card storage optional (`20`).
- **Infra:** Supabase (Postgres/Auth/Storage/RLS), Vercel (Next.js), dev/staging/prod envs (`29`).
- **Comms:** email provider (Resend or chosen), WhatsApp handoff URL, optional SMS (`29`).
- **Shipping/cargo:** Turkey cargo/courier + tracking (`09 §8`).
- **Invoicing:** e-Arşiv/e-Fatura provider or accountant-managed export (Phase-flexible).
- **Search:** Postgres FTS MVP; external search provider optional Phase 2 (`42 §8`).
- **Analytics/cookies:** consent-gated; no optional scripts pre-consent (`24`).
- **Env vars:** per `29` (Supabase, iyzico, PayTR, webhook secret, email, WhatsApp, cookie version) — add `SERVICE_DEPOSIT_ENABLED`, `SEARCH_PROVIDER` if used.

## 8. Definition of Done (launch)

Ship only when: §5 QA checklist green; §6 launch-blocking risks (legal, payment merchant, invoice) cleared or explicitly accepted by the owner; seed data present; approved opening integrated with fallbacks; and the platform demonstrably functions as a **Turkey-only luxury celebration commerce + services maison**, not an invitation landing page.
