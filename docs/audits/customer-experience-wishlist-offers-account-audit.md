# CHERIE DAY — Customer Experience, Wishlist, Offers & Account Ecosystem Audit

**Mode:** Read-only forensic audit + architecture report. No code, schema, or infrastructure was modified.
**Audited branch:** `perf/cookie-consent-lcp` — verified identical in feature surface to `integration/reconciled-canonical-20260716` (the only delta between them is `components/layout/cookie-consent.tsx` and consent e2e tests; the canonical head `3f01d3d` is the merge-base of the current branch).
**Date:** 2026-07-18
**Scope reviewed:** app routes, components, server actions, API routes, `lib/**`, all 47 Supabase migrations, generated DB types, RLS policies, admin surface, navigation, product cards, PDP, cart/checkout, notification infrastructure.

> Evidence convention: every "implemented" claim cites `path:line` or a migration/table name. Where a capability is claimed by a route that exists but renders a placeholder, it is graded accordingly and **not** counted as implemented.

---

## 1. Executive verdict

CHERIE DAY has an **unusually mature commerce and identity spine** (catalog, cart, checkout, orders, payments, reservations, RLS, admin) and a **deliberately deferred customer self-service layer**. The customer account is a real, wired *dashboard* wrapped around **ten placeholder sub-pages**. The database contains the seeds of favorites, addresses, coupons, campaigns and notifications, but almost none of these seeds are connected to a customer-facing surface.

Three headline truths:

1. **Favorites/wishlist is a table with no doors.** `public.favorites` exists with clean RLS, and the account home reads a *count* from it — but there is **no save control anywhere on any product card or PDP**, **no server action that inserts or deletes a favorite**, and the `/hesap/favoriler` destination is an honest "coming soon" placeholder. The feature is DATABASE-ONLY. The favorites count on the dashboard is structurally always `0`.

2. **Discounts cannot reach an order.** `public.coupons` and `public.campaigns` exist and are editable in admin, but the `orders` table has **no coupon/discount/campaign columns**, the checkout form has **no code field or discount line**, and there is **no redemption table**. The entire promotions capability is DB + admin-CRUD only, with no path to the customer or to money.

3. **Reusable addresses exist in the schema but not in the customer's hands.** `public.customer_addresses` is a real, RLS-scoped table with delivery/billing typing and `is_default` — but `/hesap/adresler` is a placeholder, and checkout collects a **fresh address every time** and snapshots it onto the order (`orders.delivery_address_snapshot`). Order snapshotting is correct and already in place; the *address book* is not.

**Bottom line:** This is not a "build from zero" situation. It is a **"connect and elevate"** situation. The luxury opportunity is large precisely because the foundation is clean and the placeholders are honest. Wishlist is **not** a launch blocker. The realistic pre-launch must-haves are a **working favorites loop** and a **reusable address book** — both high-leverage, both low-risk on top of the existing RLS spine.

---

## 2. Exact current-state inventory

### Customer account routes (`app/(site)/hesap/**`)

| Route | Turkish label | State | Evidence |
|---|---|---|---|
| `/hesap` | Bugün (account home) | **FULLY IMPLEMENTED** | `app/(site)/hesap/page.tsx` (376 ln) + `lib/portal/today.ts` reads orders, reservations, quotes, favorites count, digital projects, unread notifications via RLS SSR client |
| `/hesap/siparisler` | Siparişlerim | **FULLY IMPLEMENTED** | `siparisler/page.tsx` (92 ln), `[order-number]/page.tsx` (301 ln), `lib/orders/customer.ts`, journey stepper |
| `/hesap/siparisler/[n]/yasal/[v]` | Yasal belge | **FULLY IMPLEMENTED** | order legal-version viewer (71 ln) |
| `/hesap/giris` `/kayit` `/sifremi-unuttum` `/sifreyi-yenile` | Auth | **FULLY IMPLEMENTED** | Supabase SSR auth, `app/api/auth/password/*`, `app/auth/callback` |
| `/hesap/adresler` | Adreslerim | **PLACEHOLDER** | `AccountStaged`, statusNote "Adres defteriniz hesabınıza bağlandığında burada görünecek" |
| `/hesap/favoriler` | Favorilerim | **PLACEHOLDER** | `AccountStaged`, "Favori listeniz hesabınıza bağlandığında…" |
| `/hesap/tekliflerim` | Tekliflerim | **PLACEHOLDER** | `AccountStaged` |
| `/hesap/rezervasyonlar` (+`[n]`) | Rezervasyonlarım | **PLACEHOLDER** | `AccountStaged` |
| `/hesap/tasarim-onaylari` | Provalarım / Tasarım onayları | **PLACEHOLDER** | `AccountStaged` |
| `/hesap/dijital` | Dijital projelerim | **PLACEHOLDER** | `AccountStaged` |
| `/hesap/bildirimler` | Bildirimler | **PLACEHOLDER** | `AccountStaged` |
| `/hesap/degerlendirmelerim` | Değerlendirmelerim | **PLACEHOLDER** | `AccountStaged` |
| `/hesap/destek` (+`[thread]`) | Destek | **PLACEHOLDER** | `AccountStaged` |
| `/hesap/tercihler` | Hesap ve tercihler | **PLACEHOLDER** | `AccountStaged` |

The placeholder component `components/content/account-staged.tsx` is explicit about intent (line 11-16): *"Honest, useful 'staged' state for a customer-account workspace whose live data binding is owned by the identity/DB agent (docs Phase 4H). It never pretends to be finished."*

### Relevant database tables (present)

| Table | Migration | Notes |
|---|---|---|
| `public.favorites` | `0007` | `(customer_id, item_type, item_id)` unique; `favorite_item_type` enum = `product \| service_package \| collection \| digital_product` |
| `public.customer_addresses` | `0006` | delivery/billing, TR-locked, `is_default`; **no** title/tax/company/national-id/notes fields |
| `public.notifications` | `0007` | in-app notifications, `is_read`, `notification_type` enum |
| `public.notification_preferences` | `0007` | `(customer_id, channel, category)`, `opted_in` |
| `public.coupons` | `0009` | code, discount_type/value, scope, min_order, usage_limit, per_customer_limit, dates, is_active; **no redemptions table** |
| `public.campaigns` | `0009` | thin: name/description/channel/scope/dates; "Admin-visibility only in MVP" |
| `public.abandoned_carts` | `0009` | admin-visibility only |
| `public.reservations` | `0005` | serves as the de-facto "occasion" record (event_date, location, guest_count) |
| `public.customers` | `0002` | minimal: name, email, phone, kvkk_consent_at, marketing_consent_at, status |
| `public.consent_records` | `0008` | consent history |
| `public.tracking_events` | — | **shipment carrier tracking**, not product analytics |

### Relevant tables that do **not** exist (probed, all ABSENT)

`wishlists`, `wishlist_items`, `wishlist_shares`, `saved_configurations`, `recently_viewed_products`, `product_subscriptions` (back-in-stock), `customer_offers`, `customer_occasions`, `customer_preferences`, `gift_registries`, `gift_registry_items`, `store_credits`, `loyalty_accounts`, `promotion_rules`, `promotion_campaigns`, `promotion_redemptions`, `coupon_redemptions`.

---

## 3. Existing-feature evidence matrix

| Capability | Grade | Evidence |
|---|---|---|
| Account home dashboard | FULLY IMPLEMENTED | `app/(site)/hesap/page.tsx`, `lib/portal/today.ts:104-267` |
| Order history + order cockpit | FULLY IMPLEMENTED | `lib/orders/customer.ts`, `siparisler/[order-number]/page.tsx`, `lib/orders/journey.ts` |
| Order status → customer copy mapping | FULLY IMPLEMENTED | `lib/orders/presentation.ts`, `lib/orders/journey.ts` (JourneyStepper) |
| Auth (email + Google provider) | FULLY IMPLEMENTED | `app/auth/callback/route.ts`, guards `lib/auth/guards.ts` |
| Cart ("Seçimlerim") + server-side pricing | FULLY IMPLEMENTED | `app/(site)/secilimlerim/page.tsx`, `lib/cart/server.ts`, `components/commerce/cart-view.tsx`, API `app/api/cart/**` |
| Checkout w/ address + TR invoice identity | FULLY IMPLEMENTED | `components/checkout/checkout-form.tsx`, `app/(site)/odeme/actions.ts` |
| Address snapshot onto order | FULLY IMPLEMENTED | `orders.delivery_address_snapshot` / `billing_address_snapshot` (`0006:100-101`) |
| Reusable address book | DATABASE-ONLY | `customer_addresses` table + RLS exist; `/hesap/adresler` placeholder; checkout does not read saved addresses |
| Favorites store | DATABASE-ONLY | `favorites` table + RLS; only reference in code is a count read (`lib/portal/today.ts:181`); no write path; no UI control |
| In-app notifications | DATABASE-ONLY / PARTIAL | `notifications` table read for unread count; `/hesap/bildirimler` placeholder; no list UI |
| Notification preferences | DATABASE-ONLY | `notification_preferences` table + RLS; `/hesap/tercihler` placeholder |
| Coupons | ADMIN-ONLY | `lib/admin/managed-resources.ts:43`, `/admin/marketing/coupons`; not applied at checkout |
| Campaigns | ADMIN-ONLY / PLACEHOLDER | `campaigns` table; admin CRUD; no customer surface |
| Abandoned carts | ADMIN-ONLY | `abandoned_carts` table; admin view |
| Reservations (as occasions) | PARTIAL | wired into dashboard greeting (`today.ts` occasion), but `/hesap/rezervasyonlar` placeholder |
| Quotes / offers ("Tekliflerim") | PARTIAL | `quotes` table + count on dashboard; `/hesap/tekliflerim` placeholder; public `/teklif` intake exists |
| Reviews | PARTIAL | `reviews` table + RLS + admin moderation; `/hesap/degerlendirmelerim` placeholder |
| Recently viewed | NOT IMPLEMENTED | no table, no code |
| Back-in-stock / price alerts | NOT IMPLEMENTED | no `product_subscriptions` table, no code |
| Saved configurations / variants | NOT IMPLEMENTED | personalization is captured only at order time (`order_items.personalization_json`) |
| Boards / multi-list wishlist | NOT IMPLEMENTED | `favorites` is a single flat list |
| Wishlist sharing / registry | NOT IMPLEMENTED | no tables |
| Store credit / loyalty / gift cards | NOT IMPLEMENTED | no tables |
| Product analytics event taxonomy | NOT IMPLEMENTED | no PostHog/Plausible/custom product events; `tracking_events` is shipment tracking |

---

## 4. Missing-feature matrix

| Missing capability | Customer impact | Nearest existing seed |
|---|---|---|
| Product-card / PDP save control | High — no way to express intent | `favorites` table ready |
| Favorites list page (real) | High | `favoriler` placeholder + table |
| Guest → account favorites merge | Medium | `carts.anonymous_token_hash` precedent (`0006:41`) shows the pattern already exists for carts |
| Reusable address book UI + checkout selector | High (repeat friction) | `customer_addresses` + snapshot both exist |
| Coupon field at checkout + order discount columns | High (commercial) | `coupons` table exists; `orders` lacks discount columns |
| Redemption/audit ledger for offers | High (fraud/finance) | none |
| Occasion profiles (structured) | Medium–High (brand-defining) | `reservations` proxy only |
| Notification centre (list + read state UI) | Medium | `notifications` table + unread count |
| Back-in-stock subscription | Medium | none |
| Recently viewed | Low–Medium | none |
| Saved configurations | Medium (bespoke fit) | `order_items.personalization_json` shape reusable |
| Wishlist boards / sharing / registry | Medium (retention/virality) | none |
| Customer preferences (palette/paper/monogram) | Medium (concierge depth) | none |

---

## 5. Product-card & PDP findings

**Product card — `components/commerce/product-card.tsx` (47 ln):**

1. **Visible save/heart action?** No. The card contains image, behavior badge, title, price, production-time — nothing else.
2. **Auth-gated?** N/A (control absent).
3. **Guest behavior?** N/A.
4. **Optimistic UI?** N/A.
5. **Persistence / cross-device sync?** N/A.
6. **Keyboard accessible card?** Yes — the entire card is a single `<Link>` with `focus-visible` ring (line 13-15).
7. **Accessible name on a save control?** N/A (no control).
8. **Accidental navigation risk?** **This is the key structural constraint:** the whole card is one `<Link>`. Any future heart button must `stopPropagation`/`preventDefault` and sit in its own stacking/hit layer, or a save tap will navigate to the PDP.
9. **Save count / social proof?** None.
10. **Unpublished/deleted products?** Card only renders for published catalog reads (`stock_mode === 'unavailable'` shows "Şu an sunulmuyor"); a future favorites list must independently tolerate deleted/unpublished items.
11. **Variants / configured saves?** Not savable anywhere.

**Surfaces that render `ProductCard`:** `product-grid.tsx`, `collection-grid.tsx`, department pages (`magaza/[department]`), collections, featured (`magaza/one-cikanlar`), new (`magaza/yeni`), search results (own `search-result-card.tsx`), event/collection storefronts. A single change to `ProductCard` propagates the save control everywhere except search, which needs a parallel edit.

**PDP — `components/commerce/product-detail.tsx` / `product-options.tsx`:** no heart, save, "kaydet", or wishlist control (grep: zero matches). Personalization/variant selection exists (`product-options.tsx`) but its state is only ever consumed by add-to-cart, never persisted as a saved configuration.

**Distinction between "love / save for later / add to project / add to cart":** Only **add-to-cart ("Seçimlerim")** exists. There is no "love", no "save for later", no project/occasion assignment, no registry.

---

## 6. Customer-account findings

**Wired:** greeting w/ occasion awareness, dominant-order spotlight + journey stepper, recent update, concierge card, contextual access grid (only shows tiles whose count > 0), unread badge, logout. All reads are RLS-scoped by `current_customer_id()`.

**Staged (placeholder) despite dashboard linking to them:** addresses, favorites, offers, reservations, design approvals, digital projects, notifications, my reviews, support, preferences. The dashboard's contextual tiles for these (`app/(site)/hesap/page.tsx:261-312`) route to shells.

**Personal profile depth:** `customers` holds only `name, email, phone, kvkk_consent_at, marketing_consent_at, status`. **Absent:** preferred/display name distinct from legal name, verified-phone flag, connected-providers view, consent history UI (data in `consent_records`), DOB/birthday, occasion dates, recipient profiles, palette/paper/typography/monogram preferences, data export, account deletion.

**Order lifecycle language:** already elegantly mapped — `lib/orders/journey.ts` + `presentation.ts` translate internal `order_status` into a customer journey with Turkish labels and a stepper. This is a strength to extend, not rebuild.

---

## 7. Addresses findings

**Reusable customer addresses exist as a table but are not customer-operable.**

- Table `public.customer_addresses` (`0006:8-23`): `type (delivery|billing)`, `full_name`, `phone`, `country` (TR-locked), `city`, `district`, `neighborhood`, `address_line`, `postal_code`, `is_default`.
- RLS (`0012:132-162`): customer `select/insert/update own` via `current_customer_id()`. **No customer `delete` policy** for addresses (delete is not in the `del`/generated list) — so soft-delete/edit is the intended lifecycle, but no UI exercises it.
- Trigger `trg_customer_addresses_updated` maintains `updated_at` (`0006:223`).

**Turkish address-requirement coverage (schema vs. spec):**

| Field | In `customer_addresses`? | Notes |
|---|---|---|
| address title (ev/iş) | ❌ | not modeled |
| full name | ✅ | |
| phone | ✅ | |
| country | ✅ (TR) | |
| il / province | ✅ (`city`) | |
| ilçe / district | ✅ | |
| mahalle / neighborhood | ✅ | |
| street / açık adres | ✅ (`address_line`) | single free-text line |
| building / apartment no | ❌ | folded into `address_line` |
| postal code | ✅ | |
| delivery notes | ❌ | |
| billing type individual/company | ⚠️ | lives on `orders.invoice_type`, not on address |
| company name / tax office / tax no | ❌ | captured on `orders.invoice_identity` (jsonb) at checkout only |
| national ID (TCKN) | ❌ | optional at checkout only |
| default shipping / billing | ⚠️ | single `is_default` bool, not per-type default |
| soft deletion | ❌ | no `deleted_at`; no delete policy |
| snapshot into orders | ✅ | `orders.delivery_address_snapshot` / `billing_address_snapshot` |
| edit-safe history | ✅ (by snapshot) | editing an address can't rewrite past orders because orders hold JSON snapshots |

**Verdict:** the *order-side* address architecture (snapshotting, edit-safe history, TR invoice identity) is correct and already live. The *account-side* address book (title, per-type default, notes, reusable billing identity, soft-delete, checkout selector) is missing UI and a few columns.

---

## 8. Favorites / wishlist findings

- **Store:** `public.favorites` — flat, polymorphic over `favorite_item_type` (product/service_package/collection/digital_product), unique per `(customer, type, item)`. Rows are **immutable** by policy design (`0015:106-107`: "Favorites are immutable rows: insert or delete, never reassigned"; the `cust_update_own` policy was explicitly dropped).
- **RLS:** customer `select`/`insert`/`delete own` present; correct isolation.
- **Write path:** **none.** No server action, route handler, or client mutation inserts/deletes a favorite. Grep of `app/` + `lib/` for `from('favorites')` / `addFavorite` / `toggleFavorite` returns only the count read.
- **UI:** none on cards or PDP; `/hesap/favoriler` is a placeholder.
- **Consequence:** the dashboard "Favorilerim — N kayıtlı parça" tile can never show N > 0 in the current build. It is presentationally live but functionally inert.
- **No boards, notes, variant/config saves, sharing, or registry.** The schema supports only "product X is favorited by customer Y."

---

## 9. Discounts / offers findings

- **`coupons`** (`0009:106-122`): genuinely capable — `discount_type` (percentage/fixed via `price_type`), `discount_value`, `scope` (collection/category/product/service/global) + `scope_id`, `min_order_amount`, `usage_limit`, `used_count`, `per_customer_limit`, `starts_at`/`ends_at`, `is_active`.
- **Admin:** editable via generic managed-resource CRUD (`lib/admin/managed-resources.ts:43-60`, `/admin/marketing/coupons`), with a guard that percentage > 100 is rejected (`app/admin/manage/actions.ts:149-151`) and codes are upper-cased (`:48`).
- **Customer path: none.**
  - Checkout form (`components/checkout/checkout-form.tsx`) has **no code input** and the order summary shows only "Ara toplam" — no discount line.
  - `orders` has **no** `coupon_id`, `discount_amount`, or `campaign_id` columns (`0006:81-107`) — a discount literally has nowhere to land.
  - **No redemption ledger** — only a bare `used_count` integer on the coupon, which is not decremented/enforced by any code path and cannot support per-customer limits without a redemptions table.
- **`campaigns`** is a thin scheduling stub, admin-visibility only.
- **No** automatic discounts, tiers, bundles, BXGY, first-order, birthday/occasion, abandoned-cart, private-client, gift-with-purchase, stacking policy, or eligibility engine. None of these exist in schema or code.

**No dedicated customer "discounts" page or nav entry exists** (PRIMARY_NAV = Deneyimler, Koleksiyonlar, Mağaza, …). This is an *opportunity*, not a gap to fill with a generic SALE tab (see §13/§8-offers).

---

## 10. Database readiness

**Strong, reusable foundation:**
- Clean customer-ownership RLS generator (`0012:132-162`) keyed on `current_customer_id()` — new customer-owned tables slot into the same pattern trivially.
- Order/address snapshotting already correct (edit-safe history).
- Guest-token precedent for carts (`carts.anonymous_token_hash`) is the exact pattern needed for **guest favorites merge**.
- Server-side price re-validation is a stated, enforced principle (checkout copy + `lib/cart/server.ts`).

**Gaps to close for the proposed ecosystem:**
- Favorites needs either enrichment (notes/board_id/saved-config ref) or a companion `wishlist_boards` table if multi-list is adopted.
- `customer_addresses` needs `label`, per-type default, `notes`, soft-delete, and reusable billing identity if the address book is to be first-class.
- Promotions need `orders.discount_amount` + `order_discounts`/`coupon_redemptions` ledger before any customer-facing discount is safe.
- Occasions need a real `customer_occasions` table if the "Occasion Atelier" direction is pursued (today reservations are overloaded to fill this role).
- Back-in-stock needs `product_subscriptions`.

---

## 11. Admin readiness

**Exists:** generic managed-resource CRUD covers coupons, campaigns, abandoned carts, notifications templates; order operations, proofs, production, shipments, refunds, reconciliation; review moderation; CRM (clients/leads/quote-requests); customers list + detail (`/admin/customers/[id]`); audit log; role-gated navigation (`lib/admin/navigation.ts`) with permission keys (e.g. `catalog.read`, `finance.read`).

**Missing for the proposed features:** wishlist analytics (most-saved, save→purchase), private-offer issuance, per-customer eligibility, occasion/concierge notes surface (there is `customer_notes` table but no dedicated CRM concierge view), offer performance dashboards, back-in-stock subscription management, promotion rule builder, redemption/fraud monitoring.

**Roles:** permission-key model already present and granular — the proposed CRM/concierge/marketing/commerce/support/analyst split maps onto it without a redesign.

---

## 12. Security & privacy risks

1. **Discount trust (future risk, pre-empt now):** because prices are server-recalculated, any coupon engine must compute discount server-side and persist it in an `order_discounts` ledger — never accept a client-supplied discounted price. The current no-discount state is *safe by omission*; the risk appears the moment offers ship.
2. **Guest favorites merge idempotency (future):** must key on `(customer, item_type, item_id)` unique (already the constraint) and upsert-on-conflict-do-nothing to be idempotent; reuse the cart anon-token pattern; expire anonymous rows.
3. **Wishlist sharing (future):** if boards become shareable, expose only a locked-down projection (no prices unless intended, no PII, revocable token, optional expiry/PIN). No such surface exists yet, so no current exposure.
4. **Favorites immutability is a deliberate hardening** (`0015`) — good; keep it.
5. **`customer_addresses` has no customer delete policy** — acceptable if the UI does soft-delete, but today there is neither UI nor `deleted_at`; decide the lifecycle before shipping the address book.
6. **KVKK/consent:** `consent_records`, `kvkk_consent_at`, `marketing_consent_at`, `cookie_consent_logs` all exist, but there is **no customer-facing data-export or account-deletion flow**, and cookie consent does not yet gate analytics/marketing scripts (`components/layout/cookie-consent.tsx:29` comment). This is the most concrete near-term privacy gap.
7. **No SECURITY DEFINER sprawl observed** in the customer-owned surface; the RLS generator uses plain policies.

---

## 13. Three luxury UX concepts

### Concept A — "Maison Salonu" (My Maison, room model)  ★ recommended base
- **Emotional idea:** the customer already has a private *salon* in the Maison; the dashboard greeting literally says "Maison salonunuz". Lean into the house metaphor with quiet rooms.
- **IA:** Salonum (home/Bugün) · Seçtiklerim (favorites) · Davetlerim/Anlarım (occasions) · Siparişlerim · Tasarım Onaylarım · Adres Defterim · Ayrıcalıklarım (offers) · Hesabım.
- **Interaction language:** entering a room, not opening a tab; soft cross-fades; the concierge card is a constant.
- **Motion:** restrained (150–250ms ease), no bounce; save = a slow ink-fill of the mark.
- **Benefits:** continuous with existing copy ("Maison salonunuz", "Seçimlerim"), minimal reinvention, extends the working dashboard.
- **Risks:** room metaphor can over-decorate if every section demands an illustration.
- **Complexity:** Low–Medium. **Use:** default spine.

### Concept B — "Client Cabinet" (archival cabinet)
- **Emotional idea:** an atelier's client drawer — saved pieces, materials, colors, monograms, proofs, orders filed like an archive.
- **IA:** drawers rather than rooms; heavy emphasis on *saved configurations* and *materials*.
- **Interaction:** drawer-pull metaphor; compare-materials view is the hero.
- **Benefits:** strongest for bespoke/personalization depth; differentiates hard from Shopify.
- **Risks:** archival framing under-serves the transactional majority (order tracking, addresses); can feel cold; higher build (saved-config engine required to feel real).
- **Complexity:** High. **Use:** a *feature within* A (the "Seçtiklerim" and proofs rooms), not the whole shell.

### Concept C — "Occasion Atelier" (occasion-first)
- **Emotional idea:** everything organizes around the event — düğün, nişan, doğum günü, kurumsal.
- **IA:** occasion is the top-level object; favorites, orders, proofs, consultation nest under an occasion.
- **Interaction:** create-occasion → the account reshapes around its date/palette/guest count.
- **Benefits:** matches CHERIE DAY's wedding/event DNA; makes the countdown greeting central; natural home for registry later.
- **Risks:** forces occasion creation on customers who just want to buy one gift; today occasions are only `reservations`, so this needs a real `customer_occasions` table (net-new).
- **Complexity:** High. **Use:** as an *optional lens* layered on A, promoted only when the customer has an event.

---

## 14. Final recommended concept

**"Maison Salonu" (Concept A) as the spine, with Concept C's occasion lens as an opt-in overlay and Concept B's saved-configuration idea confined to the Seçtiklerim room.**

Rationale: it is the *only* direction that is continuous with what already ships (the "Maison salonunuz" greeting, "Seçimlerim" cart, order journey copy, working dashboard). It converts placeholders into rooms one at a time, needs the fewest net-new tables for MVP (favorites already exists; address book needs a few columns), and leaves clean seams to grow occasions, saved configs, and offers without a rebuild. Naming stays Turkish-first and comprehensible: **Seçtiklerim** (not "wishlist"), **Adres Defterim**, **Ayrıcalıklarım**.

---

## 15. Exact Turkish information architecture (recommended)

**Account root:** `Hesabım` → landing = **Bugün** (keep current dashboard).

```
Hesabım
├─ Bugün                     (/hesap)                      [live — keep]
├─ Seçtiklerim               (/hesap/favoriler)            [favorites — MVP]
├─ Siparişlerim              (/hesap/siparisler)           [live — keep]
├─ Tasarım Onaylarım         (/hesap/tasarim-onaylari)     [post-launch]
├─ Rezervasyonlarım          (/hesap/rezervasyonlar)       [post-launch]
├─ Adres Defterim            (/hesap/adresler)             [address book — MVP]
├─ Ayrıcalıklarım            (/hesap/ayrikaliklarim)       [offers — roadmap]
├─ Bildirimler               (/hesap/bildirimler)          [post-launch]
└─ Hesap ve Tercihler        (/hesap/tercihler)            [profile/consent/export — post-launch]
```

- **Save-control microcopy on cards/PDP:** `Seçtiklerime ekle` / saved: `Seçtiklerimde`.
- **Guest prompt on save:** `Beğendiklerinizi saklamak için giriş yapın` (with merge-on-login).
- **Offers naming (final recommendation for §8-offers):** **"Ayrıcalıklarım"** for the private/account surface and **"Maison Ayrıcalığı"** as the per-offer badge — avoids "SALE/İNDİRİM", reads as recognition not markdown. Reserve "Son Parçalar" only for genuine end-of-line, in-context on the product, never a loud tab.

---

## 16. Textual wireframes

**Product card (save control added):**
```
┌───────────────────────────┐
│ [image]        ♥  ← 44px hit, top-right, own button,     │
│ [brass badge]     stopPropagation; aria-label            │
│                   "Seçtiklerime ekle: {ürün}"            │
│                   default: outline mark, ink on ivory    │
│                   saved: ink-filled, 200ms fill          │
├───────────────────────────┤
│ Ürün adı                                                 │
│ ₺ fiyat            ⏱ üretim süresi                        │
└───────────────────────────┘
Guest tap → toast "Giriş yapın" + local save, merge on login.
```

**PDP save interaction:**
```
[Gallery] ......... [Ad, fiyat]
                    [Kişiselleştirme / varyant seçimi]
                    [ Seçimlerime Ekle ]  ← primary (cart)
                    [ ♥ Seçtiklerime ekle ]  ← secondary
                        └ if variant/config chosen:
                          "Seçtiğiniz haliyle sakla" (roadmap: saved_config)
                          + optional private note (roadmap)
```

**Seçtiklerim page (real):**
```
Seçtiklerim — Beğenip bir kenara ayırdıklarınız
[grid | liste]   [filtre: departman ▾]   [durum: hazır / tükendi]
┌ card ┐ ┌ card ┐ ┌ card ┐
│ ♥×   │ … each: remove (♥ filled→toggle), "Seçimlerime taşı",
│      │        availability + price-change badge if changed,
└──────┘        graceful "artık sunulmuyor" for unpublished.
Empty: "Henüz bir şey seçmediniz — Mağazayı gezin."
```

**Account homepage (Bugün) — keep, minor additions:**
```
Maison salonunuz · {Günaydın}, {ad}.
[Occasion countdown | first-step]      [Son güncelleme]
[Order spotlight + JourneyStepper]     [Concierge card + unread]
Size ait alanlar: [Siparişler][Seçtiklerim*][Rezervasyonlar][Tekliflerim]…
Hesap: [Adres Defterim][Bildirimler][Destek][Tercihler]
(*Seçtiklerim tile becomes real once save loop ships)
```

**Address book (Adres Defterim):**
```
Adres Defterim                                   [+ Yeni adres]
┌ Ev · Varsayılan teslimat ┐  ┌ İş ┐
│ Ad Soyad, telefon        │  │ …  │   card actions: Düzenle · Sil
│ Mah/İlçe/İl, Posta kodu  │  └────┘   (soft-delete confirm)
│ [Varsayılan] [Düzenle]   │
└──────────────────────────┘
Add/Edit = drawer: başlık, ad soyad, tel, il/ilçe/mahalle,
açık adres, posta kodu, [teslimat|fatura], varsayılan yap.
Checkout: "Kayıtlı adreslerimden seç ▾" above the manual fields.
```

**Occasion profile (roadmap):**
```
Davetim / Anım — Düğün · 12 Eylül 2026 · İzmir · ~180 kişi
Palet: [ivory][brass][burgundy]   Stil: klasik
[İlgili seçtiklerim]  [Siparişler]  [Danışmanlık]  [Notlar]
```

**Offers (Ayrıcalıklarım, roadmap):**
```
Ayrıcalıklarım — size özel
┌ Maison Ayrıcalığı ┐   Her ayrıcalık: kapsam, geçerlilik,
│ İlk siparişinize  │   "Seçimlerime uygula" (server-computed),
│ özel jest         │   net yasal ibare, kupon yerine tanıma dili.
└───────────────────┘   No countdown spam, no crossed-out prices.
```

---

## 17. Recommended entities & relationships

Only propose net-new where a seed is absent. **No migrations written** — shapes only.

**MVP:**
- **Extend `customer_addresses`** — add `label text`, `is_default_billing bool`, `is_default_shipping bool` (or keep `is_default` per `type`), `notes text`, `deleted_at timestamptz`. Add a customer `delete`/soft-delete policy decision.
- **Favorites (keep as-is for MVP)** — the existing flat table + immutable-row model is enough for a single "Seçtiklerim" list. No new table needed to ship the save loop.
- **`favorite_events`** *(optional analytics, MVP-lite)* — append-only `(customer_id, item_type, item_id, action, created_at)` for save/unsave analytics if product analytics is wanted before a full event pipeline.

**Post-launch / roadmap:**
- **`wishlist_boards`** `(id, customer_id, name, occasion_id?, visibility, created_at)` + `favorites.board_id` — only if multi-list ("Düğünüm", "Hediye Fikirleri") is adopted.
- **`saved_configurations`** `(id, customer_id, product_id, variant_id?, personalization_json, note, created_at)` — reuses `order_items.personalization_json` shape; version-safe by storing a product snapshot.
- **`customer_occasions`** `(id, customer_id, type, date, location_json, guest_estimate, palette_json, notes, reservation_id?)` — de-overloads `reservations`.
- **`product_subscriptions`** `(id, customer_id?, anon_token?, product_id, variant_id?, kind[back_in_stock|price_drop], created_at, notified_at?)`.
- **Offers ledger (before any customer discount):** `orders.discount_amount numeric` + `order_discounts (order_id, coupon_id?, code, type, amount, meta)` + `coupon_redemptions (coupon_id, customer_id, order_id, redeemed_at)`; enforce `per_customer_limit`/`usage_limit` here, not on a bare counter.
- **`customer_preferences`** `(customer_id, key, value_json)` EAV or typed columns for palette/paper/typography/monogram.
- **`recently_viewed`** — or derive from a lightweight event table; low priority.

**Relationships:** all customer-owned tables FK `customer_id → customers.id on delete cascade` and inherit the `current_customer_id()` RLS pattern. Wishlist items reference catalog by id but must render defensively when the product is unpublished/deleted.

---

## 18. RLS strategy

- **Reuse the existing generator** (`0012:132-162`): add each new customer-owned table to the `sel`/`ins`/`upd` arrays; add explicit `delete` only where the customer should hard-delete (favorites already does; addresses should soft-delete).
- **Immutability where semantically right** — favorites rows stay insert/delete-only (keep the `0015` hardening).
- **Offers/redemptions:** customer may `select` own redemptions; **insert only via server-side/service-role** during checkout (never client insert) so limits can't be bypassed.
- **Shared boards (roadmap):** expose via a dedicated read-only projection (view or RPC) filtered to `visibility='public'` + valid token; never open the base table to `anon`.
- **Guest favorites:** stored client-side (first-party) pre-auth; server rows only ever created for an authenticated `customer_id`; merge is a server action that upserts on the existing unique key.
- **Avoid SECURITY DEFINER** except for the merge and redemption RPCs, which must be `search_path`-pinned and argument-validated (the repo already fixes `search_path` on crypto functions in `20260714201000`).

---

## 19. Analytics taxonomy

No product-analytics pipeline exists today (`tracking_events` is shipment carrier tracking). Proposed events (emit server-side or via a first-party, consent-gated client sink — cookie consent categories already exist in `lib/legal`):

| Event | Trigger | Key properties (no PII) | KPI |
|---|---|---|---|
| `product_saved` | save on card/PDP | product_id, surface, is_guest | Save rate |
| `product_unsaved` | remove | product_id, surface | Save churn |
| `saved_item_added_to_cart` | move to Seçimlerim | product_id | Save→cart |
| `wishlist_viewed` | open Seçtiklerim | item_count | Engagement |
| `guest_wishlist_merged` | merge on login | merged_count, deduped_count | Guest capture |
| `address_created` / `address_selected` | address book / checkout | address_id (hashed), type | Checkout completion |
| `occasion_created` | create occasion | type, days_until | Occasion adoption |
| `offer_viewed` / `offer_applied` / `offer_rejected` | offers/checkout | offer_id, reason | Offer conversion |
| `coupon_attempted` / `coupon_applied` | checkout code | code_hash, result | Coupon efficacy |
| `back_in_stock_subscribed` | subscribe | product_id, is_guest | Demand signal |

**PII rules:** never send email/phone/name/address text; use hashed ids; respect `marketing`/`analytics` consent categories; anonymous identity via first-party token reconciled server-side on login.

**Dashboards:** save rate, save→cart, save→purchase, most-desired collections, campaign margin impact, private-offer conversion, repeat-order rate, address/checkout completion.

---

## 20. MVP / 30-day / roadmap plan

### MVP (before launch)
- **Favorites save loop:** heart on `ProductCard` + PDP; server actions insert/delete; guest local-store + merge-on-login; real `/hesap/favoriler` list rendering with availability/price-change/deleted handling; wire the dashboard tile to reality. *(favorites table + RLS already exist)*
- **Address book:** `/hesap/adresler` CRUD (drawer), a few new columns, soft-delete, and a "kayıtlı adreslerim" selector in checkout. *(table + RLS + order snapshot already exist)*
- **Notification centre (read-only list):** turn `/hesap/bildirimler` into a real list over `notifications` (data + unread count already flow).
- **KVKK completeness:** data-export request + account-deletion request path; make cookie consent gate analytics/marketing.

### Post-launch (30 days)
- Occasion profiles (`customer_occasions`) + occasion lens on Bugün.
- Reviews surface (`/hesap/degerlendirmelerim`) over existing `reviews`.
- Reservations + design-approvals customer views (data exists).
- Coupon-at-checkout **with** the discount ledger (do not ship discounts without §17 ledger).
- Product-analytics event sink + save-rate dashboard.

### Premium roadmap (90–180 days)
- Wishlist boards ("Düğünüm", "Hediye Fikirleri") + saved configurations + private notes.
- Wishlist sharing / gift registry (read-only projection, revocable, price-hide).
- Back-in-stock / production-slot / limited-release subscriptions.
- Private-client offers ("Ayrıcalıklarım"), occasion-triggered gestures, store credit.
- Concierge/CRM admin surface (occasion notes, offer issuance, wishlist analytics).

---

## 21. Effort estimate (indicative, engineering-days)

| Item | Effort | Blocker? |
|---|---|---|
| Favorites save loop (cards+PDP+actions+guest merge+list) | 5–8 d | No |
| Address book (UI + columns + checkout selector) | 4–6 d | No |
| Notification centre (read-only) | 2–3 d | No |
| KVKK export/delete + consent gating | 3–5 d | **Yes (compliance)** |
| Occasion profiles | 5–8 d | No |
| Coupon-at-checkout + discount ledger | 8–12 d | No (but do-it-once-safely) |
| Product-analytics sink + dashboard | 4–6 d | No |
| Boards + saved configs | 8–12 d | No |
| Sharing / registry | 8–14 d | No |
| Back-in-stock | 4–6 d | No |

**MVP band (favorites + address book + notifications + KVKK):** ~14–22 engineering-days.

---

## 22. Risks & unresolved owner decisions

1. **Is a working favorites loop in the launch MVP?** Recommended **yes** (high leverage, low risk), but it is *not* a hard blocker — the placeholder is honest.
2. **Multi-list now or later?** Recommend flat "Seçtiklerim" for MVP; boards on the roadmap.
3. **Address delete semantics:** hard-delete vs soft-delete + per-type default — decide before shipping the book.
4. **Discounts before or after launch?** If before, the discount ledger (`order_discounts`/`coupon_redemptions`/`orders.discount_amount`) is mandatory — do not ship a checkout code field against the current schema.
5. **Occasions: overload `reservations` or introduce `customer_occasions`?** Recommend the dedicated table when the occasion lens ships.
6. **KVKK export/deletion is the one genuine compliance risk** in the current customer surface — owner should confirm the legal requirement and timeline.
7. **Analytics consent:** cookie consent currently does not gate scripts; product analytics must be consent-aware from day one.

---

## 23. Final recommendation

Ship **"Maison Salonu"** by *connecting what already exists*, in this order: **(1) favorites save loop, (2) reusable address book, (3) notification centre, (4) KVKK export/deletion + consent gating.** These four convert the most valuable placeholders into real, distinctly-CHERIE-DAY rooms with the least net-new schema and the lowest risk, all on top of a clean RLS spine and correct order-snapshot architecture. Treat discounts as a *deliberate, ledgered* post-launch build under the "Ayrıcalıklarım / Maison Ayrıcalığı" language — never a generic SALE tab, and never a client-trusted price. Everything else (boards, sharing, registry, saved configs, occasions, back-in-stock, private offers) is genuine premium roadmap that the current foundation can grow into without a rebuild.

Wishlist is **not** a launch blocker. The address book's friction and the KVKK gap are the items most worth resolving before launch.
