# DEVELOPER PROMPT

You are building **CHERIE DAY — Wedding, Gift & Celebration Maison**.

Read these files first and treat them as the final source of truth:

1. `00_READ_ME_FIRST.md`
2. `docs/16_PRE_BUILD_FREEZE.md`
3. `docs/01_CHERIE_DAY_MASTER_BUILD_BRIEF.md`
4. `docs/02_CHERIE_DAY_REVOLUTION_BLUEPRINT.md`
5. `docs/04_IMPLEMENTATION_ROADMAP.md`
6. `docs/05_ASSET_MANIFEST.md`
7. `docs/07_PLATFORM_ARCHITECTURE.md`
8. `docs/08_DATA_MODEL_AND_CMS_SCHEMA.md`
9. `docs/09_COMMERCE_BIBLE.md`
10. `docs/10_DESIGN_LANGUAGE_BIBLE.md`
11. `docs/11_COMPONENT_BIBLE.md`
12. `docs/12_CONTENT_STRATEGY.md`
13. `docs/13_SEO_BIBLE.md`
14. `docs/14_CONVERSION_ANALYSIS.md`
15. `docs/15_INFORMATION_ARCHITECTURE.md`
16. `docs/19_TURKISH_LUXURY_COMMERCE_SCOPE.md`
17. `docs/46_BUILDER_HANDOFF_AND_BUILD_READINESS.md` (this is the corrected handoff layer; the old `FINAL_REVIEW_BOARD_AUDIT/FINAL_DEVELOPER_HANDOFF_PROMPT.md` was removed)
18. `docs/22_PRE_BUILD_HARDENING_LOCK.md`
19. `docs/23_SUPABASE_RLS_SECURITY_IMPLEMENTATION_PLAN.md`
20. `docs/24_TURKEY_LEGAL_PAYMENT_POLICY_LOCK.md`
21. `docs/25_DESIGN_TOKENS_AND_TYPE_LOCK.md`
22. `docs/26_MVP_PRODUCT_CATALOG_AND_COMMERCE_RULES.md`
23. `docs/27_CONTENT_SEO_SEED_PLAN_TR.md`
24. `docs/28_OPERATIONS_FULFILLMENT_SLA_LOCK.md`
25. `docs/29_TECHNICAL_FOUNDATION_AND_QA_LOCK.md`
26. `docs/30_PRODUCTION_ASSET_LOCK.md`
27. `docs/31_MOBILE_UX_ACCEPTANCE_LOCK.md`
28. `docs/32_LUXURY_DESIGN_REVOLUTION_SYSTEM.md`
29. `docs/33_NEXT_GEN_COMMERCE_AND_ADMIN_EXPERIENCE.md`
30. `docs/37_MEGA_STORE_AND_SERVICE_ATLAS.md`
31. `docs/40_MASTER_IA_AND_ROUTE_MAP.md`
32. `docs/41_SERVICE_COMMERCE_AND_RESERVATION_SYSTEM.md`
33. `docs/42_COMMERCE_DATA_MODEL_EXTENSIONS.md`
34. `docs/43_CHECKOUT_PAYMENT_AND_ORDER_STATE_MACHINE.md`
35. `docs/44_UX_STATE_AND_MICROCOPY_MATRIX_TR.md`
36. `docs/45_ADMIN_OPERATIONS_EXPANSION.md`

The previous opening/homepage creative layer has been archived outside this project. Do not use any old homepage concept unless the owner explicitly restores it from the Desktop archive.

## Absolute Direction

CHERIE DAY is not a marketplace and not a vendor directory. It is a luxury Brand House / Maison for weddings, engagements, celebrations, gifts, invitations, digital experiences, and memories.

Public users must never see:

- vendor profiles,
- supplier profiles,
- supplier search,
- vendor comparison,
- saved vendors,
- vendor ratings,
- per-vendor reviews,
- seller labels.

Behind-the-scenes suppliers and teams may exist only in admin/CRM with strict RLS.

All public customer-facing copy must be Turkish: navigation, forms, cart, checkout, account, payment states, order tracking, support, legal, and emails/messages authored by CHERIE DAY.

## Build Goal

Build a luxury cinematic website and commerce platform that combines:

- Maison storytelling,
- curated product commerce,
- collection worlds,
- wedding/celebration experiences,
- digital invitations and wedding websites,
- memory/film offerings,
- planning and tailor/quiz flow,
- Turkey-only cart, checkout, payment, account, and order tracking,
- admin CMS,
- CRM,
- commerce operations.

Follow `CHERIE_DAY_REVOLUTION_BLUEPRINT.md` for every section-level decision. The site must be built as a connected Maison system, not as isolated pages.

## Homepage Reset

The `/` route is currently a plain reset page.

Do not implement any old hero idea as mandatory.
Do not copy the rejected Kimi prototype.
Do not assume a specific video, object list, scene, or scroll animation.

Before coding a new homepage or opening, produce a separate creative concept package and obtain approval.

Fixed requirements:

- public text is Turkish HTML/CMS text,
- brand marks are used exactly,
- performance and accessibility are protected,
- reduced-motion fallback exists,
- store/account/inquiry paths remain clear.

## Technical Stack

Use:

- Next.js App Router,
- TypeScript,
- Tailwind CSS,
- motion tooling selected by the approved concept,
- Supabase/Postgres/Auth/Storage,
- Zod and React Hook Form for forms,
- Framer Motion only for smaller UI transitions if useful.

## UX Reference Boundary

The site may study external luxury commerce references in terms of:

- luxury editorial commerce,
- service-commerce blend,
- product storytelling,
- curated shop structure,
- premium drawer/header rhythm,
- quiz/tailor flow,
- smooth scroll feeling.

Do not copy:

- visual identity,
- opening-experience composition,
- text,
- logo,
- salon structure,
- exact layouts,
- brand assets.

## Public IA

Primary nav:

- Maison
- Deneyimler
- Koleksiyonlar
- Mağaza
- Dijital
- Hatıra
- Planlama
- Rehber
- İletişim
- Hesabım
- Seçimlerim
- Sipariş Takibi

Primary CTAs:

- `Hayalini Tasarla`
- `Teklif Al`
- `Koleksiyonları Keşfet`

## Commerce Rules

Commerce language:

- `Seçimlerim` for cart.
- `Güvenli Ödeme` for checkout entry.
- `Sipariş Özeti` for order summary.
- `Koleksiyonunu Tamamla` for bundles.
- `Tasarım Onayı` for proof approval.
- `CHERIE DAY Atölyesi` for production.
- `Özenli Teslimat` for shipping.

Never use marketplace language.

Commerce scope:

- Turkey-only store.
- Customer registration and login.
- Account dashboard.
- Saved addresses.
- Cart / `Seçimlerim`.
- Turkey-only checkout.
- iyzico primary + PayTR secondary/fallback preferred.
- Turkish domestic debit/credit cards.
- TROY for Turkey.
- Foreign-issued Visa/Mastercard/AMEX where enabled by iyzico/PayTR merchant settings.
- Accepting foreign-issued cards must not introduce international shipping, international storefront operations, or multi-currency storefront pricing.
- Bank transfer fallback if needed.
- Order history and tracking.
- Payment status.
- Shipment/delivery status.
- Product/order support inquiries.
- Proof approval for personalized products.

## Admin / Data Rules

Supabase RLS must enforce:

- public reads only `published` content,
- public inserts leads/contact/product inquiries only,
- no public select on leads,
- no public access to suppliers/teams/assignments,
- no public access to internal costs or internal notes,
- customers can access only their own profile, addresses, carts, orders, proofs, and support threads,
- raw payment events/provider payloads are admin-only,
- staff roles control CMS publishing and CRM operations.

## First Build Order

1. Foundation: Next.js, Tailwind tokens, data model, and route shell.
2. Brand-safe asset pipeline and CMS/media structure.
3. Public homepage with approved creative opening.
4. Public CMS-driven pages.
5. Shop/Product House MVP.
6. Admin CMS + CRM.
7. Turkey commerce core: account, cart, checkout, orders, payments, tracking.
8. Fulfillment, proof approvals, support flows.
9. Future client portal and live digital tools.

## Acceptance Test

The implementation is wrong if it feels like:

- a vendor directory,
- a wedding marketplace,
- a generic Shopify theme,
- a shallow visual-only landing page,
- a SaaS dashboard,
- a commodity product catalog.

The implementation is right if it feels like:

- a luxury Maison,
- an editorial wedding/gift commerce house,
- a curated celebration system,
- one accountable brand with one aesthetic language.
