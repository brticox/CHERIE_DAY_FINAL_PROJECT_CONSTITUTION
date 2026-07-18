# CHERIE DAY — Customer Experience & Account Ecosystem — Executive Summary

**Companion to:** [`customer-experience-wishlist-offers-account-audit.md`](./customer-experience-wishlist-offers-account-audit.md)
**Mode:** Read-only audit. Nothing was changed.
**Date:** 2026-07-18 · **Branch:** `perf/cookie-consent-lcp` (feature-identical to `integration/reconciled-canonical-20260716`).

---

## What exists (real & wired)

- **Account home "Bugün" ("Maison salonunuz")** — a genuine, RLS-scoped dashboard: greeting with event countdown, dominant-order spotlight + journey stepper, recent update, concierge card, unread badge, contextual tiles. `app/(site)/hesap/page.tsx` + `lib/portal/today.ts`.
- **Order history & order cockpit** — full, with elegant Turkish status→journey copy. `lib/orders/*`.
- **Cart "Seçimlerim"** + server-side price re-validation; **checkout** with TR address + `bireysel/kurumsal` invoice identity (TCKN/VKN/vergi dairesi).
- **Correct order architecture:** addresses are **snapshotted** onto orders (`delivery_address_snapshot`), so editing an address can never rewrite history.
- **Clean, reusable RLS spine** keyed on `current_customer_id()`; guest-token precedent already used for carts.
- **Database seeds present:** `favorites`, `customer_addresses`, `notifications`, `notification_preferences`, `coupons`, `campaigns`, `abandoned_carts`, `reservations`, `consent_records`.
- **Admin CRUD** for coupons, campaigns, abandoned carts, orders, proofs, production, reviews, CRM, customers.

## What is absent (or present-but-disconnected)

- **Favorites/wishlist = a table with no doors.** No save control on any product card or PDP, **no write path in code**, and `/hesap/favoriler` is a placeholder. The dashboard "Favorilerim" count is structurally always 0. → **DATABASE-ONLY.**
- **Ten of the account sub-pages are honest "coming soon" placeholders** (`AccountStaged`): adresler, favoriler, tekliflerim, rezervasyonlar, tasarım-onayları, dijital, bildirimler, değerlendirmelerim, destek, tercihler. Only **orders + auth** are real beyond the dashboard.
- **Discounts cannot reach an order.** `coupons`/`campaigns` exist and are admin-editable, but `orders` has **no discount columns**, checkout has **no code field**, and there is **no redemption ledger**. → **ADMIN/DB-ONLY.**
- **Reusable address book not customer-operable** (table exists, UI doesn't; checkout re-collects the address each time).
- **Wholly missing:** boards/multi-list, wishlist sharing, gift registry, saved configurations, recently-viewed, back-in-stock/price alerts, customer occasions (only `reservations` proxy), rich preferences, loyalty/store-credit, product-analytics event taxonomy, KVKK data-export/account-deletion.

## What must be built first (recommended MVP)

1. **Favorites save loop** — heart on cards + PDP, insert/delete server actions, guest local-store + merge-on-login, a *real* `/hesap/favoriler` list (availability/price-change/deleted-safe). *(table + RLS already exist)*
2. **Reusable address book** — `/hesap/adresler` CRUD + a few columns (label, per-type default, notes, soft-delete) + a "saved addresses" selector in checkout. *(table + RLS + order snapshot already exist)*
3. **Notification centre (read-only)** over the existing `notifications` table.
4. **KVKK completeness** — data-export + account-deletion request paths; make cookie consent actually gate analytics/marketing. *(the one genuine compliance gap)*

**Wishlist is NOT a launch blocker.** The address-book friction and the KVKK gap are the items most worth closing before launch.

## Recommended design direction

**"Maison Salonu"** — a private house of quiet rooms, continuous with the existing "Maison salonunuz" greeting and "Seçimlerim" cart language. Convert placeholders into rooms one at a time; layer an **occasion lens** (opt-in) and **saved-configuration** depth on top later. This needs the fewest net-new tables and no rebuild.

## Recommended Turkish labels

| Purpose | Label |
|---|---|
| Favorites (room + save action) | **Seçtiklerim** · "Seçtiklerime ekle" |
| Address book | **Adres Defterim** |
| Offers surface / per-offer badge | **Ayrıcalıklarım** · **Maison Ayrıcalığı** |
| Occasions (roadmap) | **Davetlerim / Anlarım** |
| Account home (keep) | **Bugün** |

Avoid "wishlist", "SALE/İNDİRİM", crossed-out prices, countdowns, fake scarcity.

## Proposed implementation order

**MVP (~14–22 eng-days):** favorites loop → address book → notification centre → KVKK export/delete + consent gating.
**30 days:** occasion profiles → reviews/reservations/proof customer views → coupon-at-checkout **with** discount ledger (`orders.discount_amount` + `order_discounts` + `coupon_redemptions`) → analytics sink + save-rate dashboard.
**90–180 days:** boards + saved configs + private notes → sharing/registry → back-in-stock → private-client offers/store credit → concierge/CRM admin.

## Owner decisions required

1. Favorites loop in launch MVP? (recommended **yes**, not a blocker)
2. Flat "Seçtiklerim" vs boards for MVP? (recommend flat)
3. Address delete: hard vs soft + per-type default?
4. Discounts before launch? If yes, the discount ledger is **mandatory** first.
5. Occasions: overload `reservations` or add `customer_occasions`? (recommend dedicated table)
6. KVKK export/deletion legal requirement + timeline?
7. Consent-gating of analytics from day one — confirm.
