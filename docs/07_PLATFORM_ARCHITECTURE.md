# CHERIE DAY Platform Architecture

Governing rule: **CHERIE DAY is a Brand House, not a marketplace.** Every module below is designed so the public surface presents one accountable brand — CHERIE DAY — while internal operations (suppliers, teams, production) stay entirely inside admin/CRM. Where any earlier document implied a public vendor-style pattern, this document overrides it in favor of the Brand House model.

The platform is one Next.js (or equivalent) application with two faces:

- **Public Website + Commerce** — brand, experiences, product house, collections, digital, memory, planning, rehber, contact, customer account, cart, checkout, order tracking, and support.
- **Admin Console** — CMS, CRM, leads, internal suppliers/teams, site settings.

Both faces read from and write to the same Supabase/Postgres backend, gated by role-based permissions and Row Level Security (RLS).

---

## 1. Public Website

**Purpose:** Present CHERIE DAY as a single luxury celebration house; convert inspiration into leads, inquiries, and Turkey-only commerce orders.

**Routes:**
`/`, `/maison`, `/maison/how-it-works`, `/contact`, `/faq`, `/experiences/*`, `/shop/*`, `/collections/*`, `/digital/*`, `/memory/*`, `/planning/*`, `/rehber/*`, `/quote-request`, `/secilimlerim`, `/odeme`, `/hesap/*`, `/siparis-takip`

**Data entities read:** `pages`, `experiences`, `products`, `product_variants`, `categories`, `collections`, `digital_offerings`, `memory_offerings`, `portfolio_projects`, `galleries`, `testimonials`, `faqs`, `articles`, `seo_metadata`, `site_settings`, customer-owned `carts`, `orders`, `order_items`, `payments` summary status, `shipments` summary status, and `product_proofs`.

**Admin needs:** None directly — it is a read surface. All content is authored in CMS.

**API needs:** Public read endpoints (or server-side rendering with direct Supabase reads using anon/public role); write endpoints for `quote_requests`, `contact_messages`, `leads`, newsletter signups, cart actions, checkout sessions, payment callbacks, order support messages, and proof approval actions.

**Relations:** Every public page links back to its parent module (Experience ↔ Collections ↔ Products ↔ Digital ↔ Memory) and to `Quote Request`/`Contact`.

**Permissions:** Public/anonymous read access to published content only (`status = published`). Authenticated customers can read and manage only their own carts, profile, addresses, orders, support messages, and proof approvals. No visibility into `suppliers`, `teams`, internal notes, or draft content.

**Future extensions:** Localization (EN/AR), gift-registry-style curated flow (private, CHERIE DAY-curated only), international commerce, live RSVP, and wedding website builder.

---

## 1.1 Hesabım And Turkey Commerce

**Purpose:** Provide the complete customer experience expected from a serious Turkey-only commerce site: registration, login, cart, checkout, payment, order tracking, proof approval, and support.

**Routes:** `/hesap/giris`, `/hesap/kayit`, `/hesap`, `/hesap/siparisler`, `/hesap/siparisler/[order-number]`, `/hesap/adresler`, `/hesap/destek`, `/secilimlerim`, `/odeme`, `/siparis-takip`

**Data entities:** `customers`, `customer_addresses`, `carts`, `cart_items`, `checkout_sessions`, `orders`, `order_items`, `payments`, `payment_events`, `shipments`, `tracking_events`, `product_proofs`, `customer_support_threads`, `customer_support_messages`.

**UX requirements:** All labels, errors, empty states, confirmations, payment states, and order statuses are Turkish. Forms use visible labels, correct input types, autocomplete, mobile keyboards, inline validation, loading feedback, and clear recovery paths.

**Commerce geography:** MVP commerce is Turkey-only: Turkey addresses, Turkey phone formats, Turkey delivery methods, Turkish KVKK/legal consent, and Turkey payment providers.

**Payment:** iyzico primary + PayTR secondary/fallback is preferred. Visa, Mastercard, TROY, and AMEX where supported should be accepted through the provider configuration. Bank transfer can exist as a fallback/manual method. Stripe is not primary for Turkey MVP unless business/legal constraints require it.

**Permissions:** Customers can only read and mutate their own profile, addresses, carts, checkout sessions, orders, support messages, and proof approvals. Payment events are never directly exposed to customers; customers see safe payment summary/status only.

**Admin relations:** Orders and support threads surface inside admin commerce/CRM. Internal costs, supplier/team assignments, and production notes remain private.

---

## 2. CMS (Content Management)

**Purpose:** Central authoring layer for everything customer-facing: pages, experiences, products, collections, digital/memory offerings, portfolio, rehber articles, FAQs, testimonials, SEO metadata, site settings.

**Routes (admin):** `/admin/cms/pages`, `/admin/cms/experiences`, `/admin/cms/products`, `/admin/cms/collections`, `/admin/cms/digital`, `/admin/cms/memory`, `/admin/cms/portfolio`, `/admin/cms/galleries`, `/admin/cms/articles`, `/admin/cms/faqs`, `/admin/cms/testimonials`, `/admin/cms/seo`, `/admin/cms/settings`

**Data entities:** All public-facing tables (see data-model doc), plus `media_assets`, `seo_metadata`, `site_settings`.

**Admin needs:** Draft/publish workflow, media picker, SEO fields per entity, slug management, relation pickers (e.g., attach Products to a Collection), preview mode.

**API needs:** Authenticated CRUD endpoints per entity; media upload endpoint (signed URLs to storage bucket); revalidation/webhook trigger on publish (for static regeneration if applicable).

**Relations:** CMS entities are the source for all public routes; every entity supports `related_collection_id`, `related_experience_ids`, `tags`.

**Permissions:** `content_editor` role can create/edit/draft; `content_publisher` or `admin` role required to flip `status` to `published`. No CMS role can create or expose supplier/team public profiles — that capability does not exist in the schema.

**Future extensions:** Multi-language fields, scheduled publishing, content versioning/rollback, AI-assisted copy drafts reviewed by editors.

---

## 3. Admin Console (Operations)

**Purpose:** Internal operating system for the CHERIE DAY team — dashboard, settings, and the umbrella under which CMS, CRM, and internal supplier/team modules live.

**Routes:** `/admin`, `/admin/dashboard`, `/admin/settings`, `/admin/users` (staff accounts), `/admin/audit-log`

**Data entities:** `staff_users`, `roles`, `site_settings`, `audit_log`.

**Admin needs:** Role assignment, activity/audit visibility, global settings (contact info, WhatsApp number, social links, default SEO, business hours, service area text).

**API needs:** Auth (Supabase Auth), role-check middleware on every admin route, audit logging on all mutating actions.

**Relations:** Umbrella over all other admin modules.

**Permissions:** Only `admin`/`superadmin` roles can manage staff users and roles. All other staff roles are scoped (editor, sales/CRM, viewer).

**Future extensions:** SSO, granular per-module permission matrix, activity notifications.

---

## 4. CRM (Leads & Clients)

**Purpose:** Track every inbound inquiry (quote requests, contact messages, product inquiries, Hayalini Tasarla briefs, order support messages) from first touch to proposal or order resolution, without ever exposing this data publicly.

**Routes:** `/admin/crm/leads`, `/admin/crm/leads/[id]`, `/admin/crm/clients`, `/admin/crm/clients/[id]`

**Data entities:** `leads`, `clients`, `quote_requests`, `contact_messages`, `lead_notes`, `lead_status_history`.

**Admin needs:** Kanban or status-list view (New → Contacted → Qualified → Proposal Sent → Won/Lost), assignment to staff, internal notes, linked source (which form/page generated the lead), WhatsApp deep-link, email templates.

**API needs:** CRUD on `leads`/`clients`, status transition endpoint, note creation, optional integration webhook (e.g., to WhatsApp Business API or email).

**Relations:** A `lead` can convert into a `client`/`customer`; a customer can link to `quote_requests`, `orders`, `support_threads`, and later `portfolio_projects` or portal records.

**Permissions:** Sales/CRM role and admin only for CRM internals. Customer-facing order/support views exist in MVP but expose only the authenticated customer's own records.

**Future extensions:** Automated follow-up sequences, proposal generation tied to `packages`, advanced client portal self-service.

---

## 5. Products (Maison Products / Product House)

**Purpose:** Curated, CHERIE DAY-designed physical/digital product catalog (davetiye, hediyelik, mum, magnet, table pieces, etc.), always framed as CHERIE DAY-made, never as third-party listings.

**Routes:** `/shop`, `/shop/[category]`, `/shop/[category]/[product-slug]`

**Data entities:** `products`, `product_variants`, `product_options`, `product_personalization_fields`, `categories`, `collections` (relation), `media_assets`.

**Admin needs:** CRUD for products/categories, personalization option builder, price/price-band, stock or made-to-order setting, production-time field, collection assignment.

**API needs:** Public read (published only), cart add/update, inquiry-submission endpoint (writes to `leads`/`quote_requests` with `type = product_inquiry`), checkout eligibility check.

**Relations:** `product.collection_id → collections`, `product.category_id → categories`, `product.related_experience_ids → experiences`.

**Permissions:** Public read for published; internal-only fields (cost, supplier reference) hidden from any public/API response via RLS and field-level exclusion.

**Commerce requirement:** Products can be inquiry-only, cart-enabled, or quote-required depending on personalization/proof complexity. Cart and checkout are MVP requirements for eligible products.

---

## 6. Collections

**Purpose:** Present branded aesthetic "worlds" (Cherry Seal, Silk Garden, etc.) spanning invitations, digital themes, products, and styling — the core luxury differentiator.

**Routes:** `/collections`, `/collections/[slug]`

**Data entities:** `collections`, with relations to `products`, `digital_offerings`, `experiences`, `portfolio_projects`, `galleries`.

**Admin needs:** CRUD, palette/material fields, hero media, ordering/featured flag, relation pickers to products/digital/experiences.

**API needs:** Public read only.

**Relations:** Hub entity — nearly every module (products, digital, experiences, portfolio) can reference a `collection_id`.

**Permissions:** Public read for published collections.

**Future extensions:** Seasonal/limited collections, collection-based bundle pricing, AR/3D preview.

---

## 7. Experiences

**Purpose:** The public service layer — Düğün, Nişan & Söz, Kına, Nikah, Doğum Günü, Baby Shower, Kurumsal, Özel Davetler — each described as something CHERIE DAY designs, produces, coordinates, and delivers end-to-end.

**Routes:** `/experiences`, `/experiences/[slug]`

**Data entities:** `experiences`, `services` (internal building blocks), `packages` (optional pricing tiers), relations to `products`, `collections`, `digital_offerings`, `memory_offerings`, `portfolio_projects`.

**Admin needs:** CRUD for experience content; ability to attach included modules (Maison Products / Product House items, Digital, Memory), process-step editor, FAQ attachment, portfolio attachment.

**API needs:** Public read; quote-request submission scoped to `experience_id`.

**Relations:** `experience.related_collection_ids`, `experience.related_product_ids`, `experience.related_digital_ids`, `experience.related_memory_ids`, `experience.portfolio_project_ids`.

**Permissions:** Public read for published; `services`/`packages` internal cost fields hidden from public API.

**Future extensions:** Regional/city-specific experience variants, seasonal packages, multi-day event builder.

---

## 8. Digital Tools (Digital Love Stories)

**Purpose:** Wedding Website, Digital Invitation, RSVP, QR, Guest List, Countdown, Location Map, Couple Story, Gallery — presented as "Digital Love Stories," tied to Collections for aesthetic consistency.

**Routes:** `/digital`, `/digital/wedding-website`, `/digital/digital-invitation`, `/digital/rsvp`, `/digital/qr`, `/digital/guest-list`

**Data entities:** `digital_offerings` (marketing/description layer for MVP1); future: `digital_sites`, `rsvp_entries`, `guest_list_entries`, `qr_codes` (actual tool data, per-client, once built).

**Admin needs (MVP1):** CRUD on marketing content and preview themes only. Actual per-couple digital site builder is a future module, admin-managed per client record.

**API needs:** Public read for marketing pages; future: authenticated per-client CRUD for site content, RSVP submission endpoint (public, scoped by unique site token).

**Relations:** `digital_offerings.collection_id → collections`; future `digital_sites.client_id → clients`.

**Permissions:** Public read on marketing pages. Per-client digital sites (future) are access-controlled by unique link/token, not public search.

**Future extensions:** Full self-serve wedding-website builder, RSVP dashboard, guest messaging, multilingual site content.

---

## 9. Memory

**Purpose:** Photo, Film, Drone, Reels, Love Story, Family Memory, Event Trailer — presented as "Memory & Keepsakes" / "CHERIE DAY film ekibi," never as individual creator profiles.

**Routes:** `/memory`, `/memory/[type]`

**Data entities:** `memory_offerings`, `galleries` (sample work), relation to `portfolio_projects`.

**Admin needs:** CRUD for offering descriptions, sample gallery attachment, delivery-timeline field.

**API needs:** Public read; memory-request submission (writes to `leads`/`quote_requests` with `type = memory_request`).

**Relations:** `memory_offerings.collection_id`, `memory_offerings.portfolio_project_ids`.

**Permissions:** Public read for published; no public attribution of individual photographers/videographers (internal `teams`/`suppliers` stay private).

**Future extensions:** Client-facing delivery portal for final photo/film assets, watermarked preview galleries.

---

## 10. Portfolio

**Purpose:** Proof of CHERIE DAY's execution across real celebrations — the trust engine of the site.

**Routes:** `/portfolio` (optionally folded into Experiences/Collections rather than a standalone top-level nav item per IA), `/portfolio/[slug]`

**Data entities:** `portfolio_projects`, `galleries`, relations to `experiences`, `collections`, `testimonials`.

**Admin needs:** CRUD, cover image, gallery attachment, event metadata (type, city, guest count band, collection), featured flag.

**API needs:** Public read for published projects only.

**Relations:** `portfolio_projects.experience_id`, `portfolio_projects.collection_id`, `portfolio_projects.testimonial_id`.

**Permissions:** Public read; no per-supplier credit exposed publicly (internal credit can exist in admin-only fields).

**Future extensions:** Video case studies, before/after styling reveals, client-permissioned real-name stories.

---

## 11. Rehber (SEO Content Hub)

**Purpose:** Turkish-language editorial content capturing search intent (evde söz, davetiye modelleri, düğün bütçesi, etc.) and routing readers into commercial modules.

**Routes:** `/rehber`, `/rehber/[article-slug]`

**Data entities:** `articles`, relations to `faqs`, `related_module_links` (experiences/products/collections/digital/planning).

**Admin needs:** Rich-text/blocks editor, SEO fields (title, description, OG image), internal link picker, category tagging, author field (defaults to "CHERIE DAY Ekibi").

**API needs:** Public read for published articles.

**Relations:** `articles.related_experience_ids`, `articles.related_product_ids`, `articles.related_collection_ids`.

**Permissions:** Public read; draft articles hidden.

**Future extensions:** Multi-author internal bylines (still published as CHERIE DAY voice), content calendar, performance analytics dashboard.

---

## 12. Media Library

**Purpose:** Centralized storage and management of all images, video, and documents used across CMS entities.

**Routes:** `/admin/media`

**Data entities:** `media_assets` (id, url, alt_text, type, tags, linked_entity_type, linked_entity_id, uploaded_by, created_at).

**Admin needs:** Upload, tag, search, bulk-attach to entities, alt-text enforcement for SEO/accessibility.

**API needs:** Signed upload URLs to Supabase Storage (or equivalent), CDN-served public URLs for published assets.

**Relations:** Polymorphic relation to any content entity (`products`, `collections`, `experiences`, `portfolio_projects`, `articles`, etc.).

**Permissions:** Upload/manage restricted to editor/admin roles; public read only for assets attached to published entities.

**Future extensions:** Auto image optimization/resizing pipeline, video transcoding, DAM-style version history.

---

## 13. SEO Engine

**Purpose:** Ensure every public entity carries structured, controllable metadata and schema without creating marketplace-style directory pages.

**Routes:** Not a standalone public route; surfaces inside CMS as a field group (`/admin/cms/seo`) plus global `/admin/settings/seo`.

**Data entities:** `seo_metadata` (entity_type, entity_id, title, description, og_image, canonical_url, schema_type, noindex_flag), `site_settings` (default schema org data).

**Admin needs:** Per-entity SEO field editor, sitemap preview, schema type selector (Organization, Product, CollectionPage, Service, Article, FAQPage, BreadcrumbList).

**API needs:** Sitemap generation endpoint (`/sitemap.xml` and per-module sitemaps), structured data injection at render time.

**Relations:** Polymorphic — one `seo_metadata` row per public entity.

**Permissions:** Editor/admin only; never publicly writable.

**Future extensions:** Automated internal-link suggestions, multilingual hreflang management, Core Web Vitals monitoring hook.

---

## 14. Turkey Commerce

**Purpose:** Enable direct Turkey-only purchase of Maison Products / Product House items while preserving CHERIE DAY's calm, curated Maison experience.

**Routes:** `/secilimlerim`, `/odeme`, `/hesap/siparisler`, `/hesap/siparisler/[order-number]`, `/siparis-takip`

**Data entities:** `carts`, `cart_items`, `checkout_sessions`, `orders`, `order_items`, `payments`, `payment_events`, `refunds`, `customer_addresses`, `shipping_methods`, `shipments`, `tracking_events`, `discounts`.

**Admin needs:** Order management, fulfillment status, payment status review, refunds, proof approval review, support thread visibility, inventory/stock or made-to-order status.

**API needs:** Payment gateway integration (iyzico or PayTR), tax/invoice readiness, webhook/callback handling for payment status, order creation, status updates, customer notification hooks.

**Relations:** `order.client_id → clients`, `order_items.product_id → products`.

**Permissions:** Authenticated checkout; order data visible only to the owning client and admin/CRM.

**Future extensions:** International shipping, international storefront operations, multi-currency storefronts, subscription/retainer billing for full-experience packages, split payments/deposits. Foreign-issued card acceptance may exist in MVP only for Turkey-only orders.

---

## 15. Future Client Portal

**Purpose:** Extend the MVP customer account into a private, CHERIE DAY-branded event space — still feeling like a maison concierge experience, not a SaaS dashboard.

**Routes (future):** `/portal/dashboard`, `/portal/timeline`, `/portal/checklist`, `/portal/guest-list`, `/portal/files`

**Data entities (future):** `client_portal_sessions`, `event_profiles`, `checklists`, `timelines`, `guest_lists`, `files`, `messages`.

**Admin needs (future):** Ability to provision portal access per client, monitor portal activity, upload files/approvals.

**API needs (future):** Use the existing customer auth foundation, scoped RLS so a client sees only their own `event_profile` and linked records.

**Relations:** `event_profile.client_id → clients`, `event_profile.quote_request_id → quote_requests`.

**Permissions:** Strict row-level isolation — a client can only ever see their own event data.

**Future extensions:** In-portal payments, digital invitation/site live preview, product proof approvals, direct messaging with CHERIE DAY team.

---

## 16. Internal Suppliers/Teams

**Purpose:** Operational record-keeping only. Suppliers and internal team members who actually execute the work (photographers, florists, printers, stage crews) exist purely as admin data — never as public profiles, never searchable, never comparable.

**Routes:** `/admin/operations/suppliers`, `/admin/operations/teams`, `/admin/operations/assignments`

**Data entities:** `suppliers` (name, contact, capability_tags, notes, internal rating), `teams` (internal staff/crew groupings), `assignments` (links a supplier/team to a `lead`/`client`/`portfolio_project` for internal tracking only).

**Admin needs:** CRUD, capability tagging, availability/capacity notes, internal rating, assignment history per project.

**API needs:** Fully authenticated, admin-role-only endpoints. No public API surface exists for these tables at all.

**Relations:** `assignments.supplier_id → suppliers`, `assignments.lead_id/client_id/portfolio_project_id`.

**Permissions:** Admin/operations role only. RLS must guarantee zero anonymous or public-role access — not just "hidden from nav," but structurally unreachable from the public API/anon key.

**Future extensions:** Supplier portal for internal task confirmation (still not public), automated capacity/availability calendar, performance scoring feeding into internal assignment recommendations.

---

---

## 17. Packaging & Proof System

**Purpose:** Crucial for CHERIE DAY's bespoke gifting and invitations. Ensure clients approve designs and understand packaging presentation.

**Routes:** `/admin/proofs`, `/portal/proofs`
**Data entities:** `product_proofs`, `packaging_options`
**Admin needs:** Upload proof, request approval, track revision requests, assign packaging style.
**Future extensions:** Client portal proof approval with markup tool.

## Cross-Module Principle

Any module that could tempt a marketplace pattern (Products, Digital, Memory, Portfolio) must always resolve its public "who did this" answer to **CHERIE DAY**, with internal execution details (`suppliers`, `teams`, `assignments`) sealed behind admin-only, non-public API access. This is enforced structurally in the data model (see `data-model-and-cms-schema.md`), not just through UI copy choices.
