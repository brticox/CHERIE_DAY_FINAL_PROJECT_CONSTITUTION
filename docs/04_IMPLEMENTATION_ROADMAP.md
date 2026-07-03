# IMPLEMENTATION ROADMAP

This roadmap turns the documentation into execution phases. Do not start by building random pages. Start with foundations, assets, homepage structure, then commerce and admin.

## Phase 0 — Documentation Freeze

Goal: make one final source of truth.

Tasks:

- Treat `CHERIE_DAY_MASTER_BUILD_BRIEF.md` as the governing brief.
- Treat `03_HERO_CINEMATIC_SYSTEM.md` as the neutral opening-experience creative slot.
- Treat `CHERIE_DAY_REVOLUTION_BLUEPRINT.md` as the governing upgrade system for all public/admin sections.
- Apply `16_PRE_BUILD_FREEZE.md` before implementation.
- Ignore archive/plugin/skill files during implementation.
- Confirm Turkey payment provider, fonts, legal/KVKK requirements, shipping rules, and asset production method.

Exit criteria:

- No contradictory public strategy remains.
- CHERIE DAY naming is final.
- Opening direction is not locked until a separate creative concept is approved.
- Section direction is locked in `CHERIE_DAY_REVOLUTION_BLUEPRINT.md`.

## Phase 0.5 — Constitution Upgrade Pass

Goal: apply the revolution blueprint before writing application code.

Tasks:

- Map every public route to the five systems in `CHERIE_DAY_REVOLUTION_BLUEPRINT.md`.
- Confirm cross-links between Experiences, Collections, Shop, Digital, Memory, Planning, and Rehber.
- Convert Shop from product grid thinking into Maison boutique thinking.
- Convert Planning into the `Hayalini Tasarla` tailor flow.
- Convert Digital into collection-matched guest experience, not SaaS screens.
- Convert Memory into CHERIE DAY cinematic proof, not photographer listings.
- Confirm admin modules support CMS, CRM, products, customers, orders, payments, shipments, proofs, production, and support.

Exit criteria:

- Each route has a purpose, emotional role, conversion role, required components, and data source.
- No route can drift into marketplace/vendor behavior.
- Implementation begins from connected Maison architecture.

## Phase 1 — Project Foundation

Goal: create the technical base.

Tasks:

- Next.js App Router project.
- TypeScript strict mode.
- Tailwind design tokens for ivory, burgundy, velvet, cherry, brass, lace.
- Global typography.
- Lenis root smooth scroll provider.
- GSAP registration with ScrollTrigger.
- Supabase client/server setup.
- Environment variable structure.
- Base layout, metadata, sitemap shell.

Exit criteria:

- App boots.
- Smooth scroll can be toggled off for reduced motion.
- GSAP ScrollTrigger works on a test page.

## Phase 2 — Asset Production

Goal: prepare brand-safe production assets and the media pipeline.

Tasks:

- Prepare official brand exports.
- Prepare product/category/collection media structure.
- Add approved creative-opening assets only after concept approval.
- Export assets in optimized web formats.
- Create mobile-safe variants where needed.
- Create static fallback posters for motion assets where needed.
- Add alt text and CMS-ready metadata.

Exit criteria:

- All approved required files exist.
- Assets are visually consistent in color grade.
- No burned-in text exists.

## Phase 3 — Homepage

Goal: build the public first impression.

Tasks:

- Build approved creative opening experience.
- Real HTML Turkish text.
- Responsive and accessible layout.
- Header overlay with Maison navigation.
- Homepage sections: Maison statement, experiences, collections, shop teaser, digital, memory, planning, stories, Rehber, FAQ, final CTA.

Exit criteria:

- Desktop and mobile opening are nonblank, readable, and stable.
- No logo, wordmark, stamp, or operational asset is distorted or regenerated.
- Reduced motion fallback works.
- CTA path works.
- No layout shift from opening assets.

## Phase 4 — Public CMS-Driven Pages

Goal: build the public content architecture.

Pages:

- Maison
- How It Works
- Experiences overview/detail
- Collections overview/detail
- Digital overview/detail
- Memory overview/detail
- Planning overview
- Hayalini Tasarla
- Rehber hub/article
- FAQ
- Contact

Exit criteria:

- All routes render from seed data or CMS data.
- Draft content is not public.
- Quote/contact forms insert leads without exposing data.

## Phase 5 — Shop / Product House MVP

Goal: launch curated Turkey-only commerce, not only catalog inquiry.

Tasks:

- Shop overview.
- Category listing.
- Product detail.
- Collection-linked product rows.
- Filters: category, collection, event type, color, material, format.
- Product inquiry form.
- Cart / `Seçimlerim`.
- Customer registration and login.
- Saved addresses.
- Turkey-only checkout.
- Turkey-only delivery method selection.
- Payment provider integration, preferably iyzico or PayTR.
- Order confirmation.
- Order history and tracking.
- Order/product support inquiry.
- Proof approval flow for personalized products.

Exit criteria:

- Product pages feel editorial and curated.
- No marketplace seller/rating/comparison pattern exists.
- Product inquiry creates CRM lead.
- Customer can register, log in, add to cart, pay, and track a Turkey-only order.

## Phase 6 — Admin CMS + CRM

Goal: let the team manage content and leads.

Tasks:

- Admin auth.
- Staff roles.
- CMS CRUD for pages, experiences, collections, products, digital, memory, portfolio, articles, FAQs, testimonials.
- Media library.
- SEO fields.
- CRM lead board.
- Lead detail, notes, status history.
- Contact messages.
- Site settings.

Exit criteria:

- Editors can draft but not publish unless permitted.
- Admin can publish.
- Sales can manage leads.
- RLS blocks public access to private data.

## Phase 7 — Commerce Core Hardening

Goal: turn shop into transaction platform.

Tasks:

- Product variants.
- Personalization field builder.
- Advanced product variants.
- Advanced personalization field builder.
- Checkout sessions.
- Orders.
- Manual payment / bank transfer fallback if needed.
- Admin order management.
- Order status history.
- Customer support per order.

Exit criteria:

- Order can be created from cart.
- Custom product can require proof approval.
- Admin can track production status.

## Phase 8 — Payments, Fulfillment, Proofs

Goal: complete professional commerce operations.

Tasks:

- iyzico / PayTR integration.
- Payment webhooks.
- Refunds.
- Shipment tracking.
- Inventory.
- Production queue.
- Proof upload and approval.
- Customer order emails/WhatsApp handoff.

Exit criteria:

- Paid order lifecycle works end to end.
- Proof approval gates production where required.
- Internal costs remain private.

## Phase 9 — Client Portal And Digital Tools

Goal: add private client experience.

Tasks:

- Client login or magic link, building on the customer account system.
- Event profile.
- Timeline.
- Checklist.
- Guest list.
- RSVP.
- Digital invitation / wedding website instance.
- File delivery for memory assets.

Exit criteria:

- Client sees only their own data.
- Portal feels like a Maison concierge space, not generic SaaS.
