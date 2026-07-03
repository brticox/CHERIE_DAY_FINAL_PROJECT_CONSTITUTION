# Final Developer Handoff Prompt

You are building **CHERIE DAY — Wedding, Gift & Celebration Maison**.

Use this prompt for implementation foundation. The required pre-build fixes have been converted into hardening locks in docs `22` through `31`.

## Source Of Truth

Read in this order:

1. `00_READ_ME_FIRST.md`
2. `docs/01_CHERIE_DAY_MASTER_BUILD_BRIEF.md`
3. `docs/02_CHERIE_DAY_REVOLUTION_BLUEPRINT.md`
4. `docs/03_HERO_CINEMATIC_SYSTEM.md`
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
16. `docs/16_PRE_BUILD_FREEZE.md`
17. `docs/17_BRAND_ASSET_MAP.md`
18. `docs/18_HERO_ASSET_PRODUCTION_CHECKLIST.md`
19. `docs/19_TURKISH_LUXURY_COMMERCE_SCOPE.md`
20. `docs/20_PAYMENT_AND_LEGAL_RESEARCH.md`
21. `docs/21_GIELLY_GREEN_INSPIRATION_SYSTEM.md`
22. `docs/22_PRE_BUILD_HARDENING_LOCK.md`
23. `docs/23_SUPABASE_RLS_SECURITY_IMPLEMENTATION_PLAN.md`
24. `docs/24_TURKEY_LEGAL_PAYMENT_POLICY_LOCK.md`
25. `docs/25_DESIGN_TOKENS_AND_TYPE_LOCK.md`
26. `docs/26_MVP_PRODUCT_CATALOG_AND_COMMERCE_RULES.md`
27. `docs/27_CONTENT_SEO_SEED_PLAN_TR.md`
28. `docs/28_OPERATIONS_FULFILLMENT_SLA_LOCK.md`
29. `docs/29_TECHNICAL_FOUNDATION_AND_QA_LOCK.md`
30. `docs/30_PRODUCTION_ASSET_LOCK.md`
31. `docs/31_MOBILE_UX_ACCEPTANCE_LOCK.md`
32. `docs/32_LUXURY_DESIGN_REVOLUTION_SYSTEM.md`
33. `docs/33_NEXT_GEN_COMMERCE_AND_ADMIN_EXPERIENCE.md`
34. `docs/34_FINAL_COUNCIL_POLISH_AND_EXECUTION_MANDATE.md`
35. `docs/35_KIMI_MASTER_BUILD_PROMPT.md`
36. `docs/FINAL_REVIEW_BOARD_AUDIT/*`
37. `docs/FINAL_GIANTS_OBJECTIVE_AUDIT/*`

Do not rely on missing historical files. Do not chase local paths outside the repository.

Ignore `ui-ux-pro-max-skill/` if it is still present. It is an external plugin/reference repository, not CHERIE DAY implementation source, not a design system source of truth, and not a dependency to install.

## Product Rule

CHERIE DAY is not a marketplace, vendor directory, supplier search engine, or generic ecommerce shop.

Public users must never see:

- vendor profiles,
- supplier profiles,
- supplier search,
- vendor comparisons,
- saved vendors,
- vendor ratings,
- per-vendor reviews,
- seller labels.

Every public answer to "who made this?" must be **CHERIE DAY**.

## MVP Scope

Build the first release as:

- cinematic public Maison site,
- CMS-driven pages,
- Experiences,
- Collections,
- Shop/Product House with Turkey-only commerce,
- customer registration and login,
- account dashboard,
- cart / `Seçimlerim`,
- Turkey-only checkout,
- iyzico primary + PayTR secondary/fallback payment integration,
- Turkish domestic debit/credit cards,
- TROY for Turkey,
- foreign-issued Visa/Mastercard/AMEX where enabled by iyzico/PayTR merchant settings,
- no international shipping/storefront/multi-currency promise from foreign-issued card acceptance,
- bank transfer fallback if needed,
- order history and tracking,
- proof approval for personalized products,
- product/order support inquiries,
- Digital marketing pages,
- Memory marketing pages,
- Planning and `Hayalini Tasarla`,
- Rehber editorial hub,
- quote/contact/product inquiry forms,
- admin CMS,
- CRM lead management,
- admin customer/order/payment/shipment/proof/support management,
- media library,
- SEO metadata.

Do not build international commerce, EN/AR storefronts, live RSVP, guest-list tools, or wedding website builder unless explicitly moved into scope.

All public customer-facing copy must be Turkish: navigation, forms, cart, checkout, account, payment states, order tracking, support, legal, and CHERIE DAY-authored messages.

Public navigation labels must use Turkish: `Deneyimler`, `Koleksiyonlar`, `Mağaza`, `Dijital`, `Hatıra`, `Planlama`, `Rehber`, `İletişim`, `Hesabım`, `Seçimlerim`, `Sipariş Takibi`.

## Stack

Use:

- Next.js App Router,
- TypeScript strict mode,
- Tailwind,
- GSAP ScrollTrigger,
- Lenis,
- Supabase/Postgres/Auth/Storage,
- Zod + React Hook Form,
- Framer Motion only for small UI transitions.

## Hero

`03_HERO_CINEMATIC_SYSTEM.md` governs the homepage hero.

Build:

- background video as ambience only,
- transparent DOM foreground layers,
- one GSAP ScrollTrigger pinned timeline,
- Lenis smooth scroll integration,
- real HTML/CSS Turkish copy,
- responsive layer variables,
- reduced-motion fallback,
- accessible CTAs.

Never:

- use a flat AI video as the whole hero,
- burn text into images/video,
- distort logos, QR, stamp, wordmark, or ribbon branding,
- add giant veil/shawl/ghost cloth,
- trap users in scroll-jacking.

## Security

Supabase RLS must be designed before public forms go live.

Required:

- public reads only published public content,
- public inserts leads/contact/product inquiries only,
- no public select on leads,
- no public access to suppliers, teams, assignments, internal costs, drafts, payment events, or internal notes,
- customers can access only their own profile, addresses, carts, orders, shipments, proofs, and support threads,
- raw payment provider payloads and webhook events are admin-only,
- admin roles control publishing and CRM access,
- storage buckets separate public media, internal media, and future client files.

## Build Order

1. Foundation.
2. Design tokens and layout shell.
3. Asset pipeline and hero production assets.
4. Cinematic homepage.
5. CMS-driven public routes.
6. Product House and Turkey-only commerce: account, cart, checkout, orders, payments, tracking.
7. Planning, quote, proof approval, and support flows.
8. Admin CMS + CRM + commerce operations.
9. SEO, accessibility, performance, and QA.

## Acceptance

The build is wrong if it feels like:

- a vendor directory,
- a wedding marketplace,
- a generic Shopify theme,
- a flat AI video landing page,
- a SaaS dashboard,
- a cheap product catalog.

The build is right if it feels like:

- a luxury Maison,
- a Turkish-first editorial celebration house,
- a curated product and service world,
- a cinematic wedding/gift platform,
- one accountable brand with one aesthetic language.
