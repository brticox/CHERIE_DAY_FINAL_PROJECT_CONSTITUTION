# Client Portal & Personalization Engine — Phase 0 Audit + Wave 1 Evidence

**Date:** 2026-07-15
**Branch:** `phase/client-portal-personalization-engine-20260715`
**Base:** `phase/04-public-commerce-completion-20260714` @ `b905017`
**Safety refs:** tag `backup/pre-client-portal-20260715`; bundle `../CHERIE_DAY_backup_pre-client-portal_20260715.bundle` (full history)

This is a multi-session transformation. This document covers the completed
**Phase 0 forensic audit** and the fully-delivered **Wave 1 — Bugün home +
order journey cockpit**. Later waves (personalization engine, proof
collaboration, event hub, etc.) continue on this branch.

---

## 1. Phase 0 — Forensic audit

### What already existed (verified, not shell)
A working customer portal under `app/(site)/hesap`: orders + order detail,
proof approval, reservations, quotes, favorites, addresses, notifications,
support threads, reviews, preferences, and full auth (login/register/reset).
Order status already had a **centralized Turkish presentation vocabulary**
(`lib/orders/presentation.ts`) and an RLS-backed customer data layer
(`lib/orders/customer.ts`).

### Security baseline (sound)
`requireUser` (`lib/auth/guards.ts`) reads customer data through the **RLS-backed
SSR client** keyed on `customer_id`; the service-role client is admin-only,
gated by `requireCapability`. Cross-customer isolation is enforced at the DB by
RLS, not in application code. Verified live: seeded customer "Elif" only ever
read her own orders/reservations/events.

### Defect register (grounded in code)
| # | Sev | Defect | Evidence | Status |
|---|-----|--------|----------|--------|
| 1 | High | Portal home was a generic "Hoş geldiniz + equal card grid" — no *Bugün*, no single next-action, no occasion context | `hesap/page.tsx` (old) | **Fixed (W1)** |
| 2 | High | Raw enum leaked to customer: proof badge rendered `proof.status` ("sent") verbatim | `siparisler/[order-number]/page.tsx:154` (old) | **Fixed (W1)** |
| 3 | High | `ORDER_LABELS` was **out of sync with the real `order_status` enum** — missing `in_design`, `revision_requested`, `packed`, `completed`; several real statuses leaked raw | `lib/orders/presentation.ts` (old) | **Fixed (W1)** |
| 4 | High | **Pre-existing crash**: order detail sorted `order_items` by non-existent `created_at` → `ORDER_DETAIL_READ_FAILED` error boundary. Never surfaced before because no order had ever reached the detail page with data | `lib/orders/customer.ts` | **Fixed (W1)** |
| 5 | High | Personalization engine fully greenfield — no `customer_preferences / style_profiles / event_profiles / preference_signals / recommendation_*` tables | migrations audit | Planned (W4) |
| 6 | Med | Cockpit omitted production/quality/packaging truth | order detail | **Fixed (W1)** via journey stepper |
| 7 | Med | Nav modules shown unconditionally regardless of ownership | `hesap/page.tsx` (old) | **Fixed (W1)** adaptive access |
| 8 | Med | Proof review minimal — no zoom/compare/history/structured revision | order detail | Planned (W3) |
| 9 | Med | No Event Hub; orders/reservations/quotes not linked to an occasion | route audit | Planned (W_event) |

### Raw material that de-risks later waves
`product_event_types`, `product_colors`, `product_materials`,
`product_city_availability`, `collections/collection_sets`, `favorites`,
`notification_preferences`, `consent_records`, `cookie_consent_logs` already
exist — the recommendation engine and consent surface can build on real tables.

---

## 2. Wave 1 — delivered

### 2.1 Presentation & logic
- **`lib/orders/presentation.ts`** — `ORDER_LABELS` rewritten to match the
  canonical `order_status` enum exactly (defect #3). `orderTone` extended for
  `completed`/`authorized` while keeping its 3-value contract stable for the
  existing admin + customer status chips.
- **`lib/orders/journey.ts`** (new, pure/unit-testable) — the customer-facing
  8-stage milestone pipeline (Ödeme → Tasarım → Prova → Üretim → Kalite →
  Paketleme → Kargo → Teslim), derived **only** from the `order_status` enum
  (never from internal `production_jobs`/`quality_checks`, so nothing
  operational leaks). Exports `orderJourney`, `orderNextAction`, `actionPriority`,
  `isActionable`, `isActiveOrder`.
- **`lib/portal/today.ts`** (new, server-only) — builds the Bugün model:
  dominant order (by `actionPriority`), single next action, occasion context
  from the nearest upcoming reservation, recent update from the latest
  customer-visible `order_status_event`, and adaptive counts. All reads run
  through the RLS SSR client keyed on `customer.id`.

### 2.2 Components
- **`components/portal/journey-stepper.tsx`** — accessible stepper. State is
  conveyed by icon + shape + text (an `aria-current="step"` marker and an
  "Aşama n/8" summary), **never colour alone**. Compact dots + current-stage
  hint on mobile; full stage labels from `lg` up.
- **`components/portal/next-action-card.tsx`** — the single dominant surface.
  `action` tone is visually loudest (velvet, solid CTA); progress/success/halted
  are calm. Keyboard focus ring, no duplicate-`id` (labelled via `aria-label`).

### 2.3 Pages
- **`app/(site)/hesap/page.tsx`** — rebuilt as the *Bugün* salon: time-aware
  greeting, occasion context, dominant next-action card, spotlight order journey,
  recent update, concierge card, and **adaptive access** (only owned modules
  shown). Honest first-purchase state when no orders.
- **`app/(site)/hesap/siparisler/[order-number]/page.tsx`** — order cockpit:
  next-action card + İlerleme journey stepper added; proof badge now uses
  `proofStatusLabel` (defect #2 fixed); shipments use `shipmentStatusLabel`;
  `#prova` / `#teslimat` anchors added so Bugün CTAs land on the right section;
  "Bu onaydan sonra üretim hazırlığı başlar." shown before proof approval.
- **`lib/orders/customer.ts`** — `order_items` now sorted by the stable primary
  key instead of the non-existent `created_at` (defect #4 fixed).

### 2.4 Tests
- **`tests/order-journey.test.ts`** (13 tests) — asserts every `order_status`
  enum member has a non-raw label and a defined journey/next-action (guards
  defects #2/#3 from regressing via `Constants.public.Enums.order_status`),
  plus stage-derivation, next-action tone, and dominant-order ranking.

---

## 3. Verification

### Gates (all pass)
| Gate | Result |
|------|--------|
| Unit tests | **83 passed** (7 files); new suite 13/13 |
| Typecheck (`tsc --noEmit`) | clean |
| Lint (`eslint --max-warnings=0`) | clean |
| Production build (`next build`) | **✓ Compiled successfully**; all `/hesap` routes dynamic |

### Live browser QA (local Supabase + seeded customer "Elif Yıldız")
Seed: 3 orders (proof-awaiting `CD-2026-0041`, shipped `CD-2026-0033`, delivered
`CD-2025-0912`), 1 proof (`sent`), 3 visible status events, 1 future reservation
(İstanbul, +42 days). Logged in through the real UI.

- **Bugün home** — greeting "İyi günler, Elif Yıldız."; occasion "İstanbul'daki
  etkinliğinize 42 gün kaldı."; velvet next-action "Provanız sizi bekliyor →
  Provayı görüntüleyin"; recent update "Provanız hazır · CD-2026-0041";
  spotlight stepper "Aşama 3/8 · Prova onayı"; adaptive access showed only
  **Siparişlerim, Provalarım, Rezervasyonlarım** (quotes/digital/favorites
  correctly hidden). Console: no errors.
- **Order cockpit `CD-2026-0041`** — header "Provanız hazır · Ödendi" (no raw
  enum); next-action card; stepper "Aşama 3/8 · Prova onayı" with
  `aria-current` on step 3; items render; journey timeline newest-first; proof
  reads **"Müşteriye gönderildi"** (not raw "sent") with the approval-consequence
  note. DOM scan: `hasRawSent=false`, `hasRawProofSent=false`.
- **Order cockpit `CD-2026-0033`** (shipped) — stepper "Aşama 7/8 · Kargo";
  next-action "Siparişiniz yola çıktı"; shipment shows **"Yolda"** (label, not
  raw `in_transit`).
- **Mobile (375×812)** — no horizontal overflow (`scrollWidth == clientWidth`);
  stepper labels collapse to dots + current-stage hint + "Aşama n/8" summary;
  CTAs are ≥44px touch targets.

---

## 4. Accessibility & motion notes
- Journey state never relies on colour alone (icon + shape + `aria-current` +
  text summary). Headings use a logical hierarchy; icon-only decorative glyphs
  are `aria-hidden`; interactive elements have visible focus rings
  (`ring-focus`). Next-action card labelled via `aria-label`.
- Motion is limited to existing token-based hover transforms
  (`duration-control`/`duration-card`, `ease-cherie`); no new autonomous motion
  introduced.

## 5. Known limitations / remaining scope
- Waves not yet built: personalization engine + Maison Profile (schema + RLS +
  consent/opt-out + explainable recommendations), proof collaboration
  (zoom/compare/history/structured revision), event hub, communication centre,
  post-purchase/return journey.
- Occasion context currently sources the nearest upcoming **reservation** only;
  quote-based occasions and multi-event handling arrive with the Event Hub.
- No production deploy, no merge to main, no live-money changes. Protected areas
  untouched.

## 6. Exact next step
Wave 4 — Personalization Engine foundation: migrations for
`customer_preferences / style_profiles / event_profiles / preference_signals`
with RLS + cross-customer isolation tests, then the "Maison Profilim" surface
with consent and opt-out, then explainable recommendations.
