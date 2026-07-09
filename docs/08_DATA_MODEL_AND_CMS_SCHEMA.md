# CHERIE DAY Data Model & CMS Schema (Supabase/Postgres)

Governing rule: public API/anon access must **never** be able to read `suppliers`, `teams`, `assignments`, internal notes, cost fields, or unpublished content. This is enforced via RLS policies, not just app-level filtering.

> **This file is the core, not the whole schema.** The canonical superset lives in `42_COMMERCE_DATA_MODEL_EXTENSIONS.md` (departments, event_types, materials/colors/tags, collection_sets, product_addons, price_tiers, city availability, digital_products/licenses, reviews + moderation, favorites, notifications, deposits/installments, Turkish invoice/tax, legal document versioning, search index) and the service/reservation model lives in `41_SERVICE_COMMERCE_AND_RESERVATION_SYSTEM.md` (service_packages, service_cities, availability, consultations, quotes, reservations, briefs, milestones). Build the union of `08` + `41` + `42`. RLS additions for the new tables are in `42 §10`, extending `23`.

## Roles

| Role | Description |
|---|---|
| `anon` | Public website visitor. Read-only, published content only. |
| `content_editor` | Can create/edit CMS content in draft. Cannot publish or delete. |
| `content_publisher` | Can publish/unpublish content. |
| `sales_crm` | Full access to `leads`, `clients`, `quote_requests`, `contact_messages`. No CMS access required (can be combined). |
| `operations` | Full access to `suppliers`, `teams`, `assignments`. |
| `admin` | Full access to all tables, role management, site settings, audit log. |
| `customer` | Row-scoped access to their own profile, addresses, carts, orders, support messages, and proof approvals. |
| `client` (future) | Row-scoped access to their own event profile and portal records, usually extending the customer account. |

All staff roles map to Supabase Auth users via a `staff_users` table with a `role` column. Customer accounts map via `customers.auth_user_id`. Future client portal records can extend the same customer auth identity.

---

## Core Content Tables

### `categories`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. "Davetiye" |
| slug | text unique | |
| parent_id | uuid FK → categories.id nullable | for nested product categories |
| description | text | |
| sort_order | int | |
| status | enum(draft, published) | |
| created_at / updated_at | timestamptz | |

**Visibility:** public read where `status = published`.

### `collections`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. "Cherry Seal" |
| slug | text unique | |
| story | text | mood/narrative copy |
| palette | jsonb | color tokens/hex list |
| materials | text[] | |
| hero_media_id | uuid FK → media_assets.id | |
| is_featured | boolean | |
| status | enum(draft, published) | |
| sort_order | int | |
| created_at / updated_at | timestamptz | |

**Relations (join tables):** `collection_products`, `collection_experiences`, `collection_digital_offerings`, `collection_portfolio_projects`.

**Visibility:** public read where `status = published`.

### `products`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| slug | text unique | |
| category_id | uuid FK → categories.id | |
| collection_id | uuid FK → collections.id nullable | |
| motif | text nullable | |
| material_story | text nullable | |
| packaging_notes | text nullable | |
| collection_set_id | uuid FK nullable | |
| is_personalizable | boolean | |
| proof_required | boolean | |
| gift_wrapping_available | boolean | |
| occasion_type | text nullable | |
| object_type | text nullable | |
| brand_motif_tags | text[] | |

| description | text | |
| materials | text | |
| personalization_options | jsonb | |
| base_price | numeric nullable | public if product is cart-enabled |
| currency | text default 'TRY' | MVP commerce is Turkey-only |
| commerce_status | enum(inquiry_only, cart_enabled, quote_required, hidden) | controls purchase behavior |
| stock_mode | enum(in_stock, made_to_order, preorder, unavailable) | |
| sku | text nullable | public-safe SKU only |
| production_time_days | int nullable | |
| price_band | enum(inquiry_only, starter, premium, luxury, bespoke) | never shows raw internal cost |
| internal_cost | numeric nullable | **admin-only field, excluded from any public select** |
| media_ids | uuid[] | |
| status | enum(draft, published) | |
| sort_order | int | |
| seo_metadata_id | uuid FK | |
| created_at / updated_at | timestamptz | |

**Visibility:** public read excludes `internal_cost` — enforced via a public view (`products_public`) rather than direct table grants.

### `product_variants`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK → products.id | |
| sku | text nullable | |
| title | text | e.g. size/color/paper/quantity combination |
| option_values | jsonb | |
| price | numeric nullable | TRY |
| stock_quantity | int nullable | |
| status | enum(active, inactive) | |
| sort_order | int | |

### `product_personalization_fields`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| product_id | uuid FK → products.id | |
| label | text | Turkish public label |
| field_type | enum(text, textarea, date, select, file, number, checkbox) | |
| required | boolean | |
| options | jsonb nullable | |
| helper_text | text nullable | Turkish helper copy |
| sort_order | int | |

### `experiences`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. "Düğün" |
| slug | text unique | |
| summary | text | |
| process_steps | jsonb | array of {title, description} |
| included_modules | jsonb | references to product/digital/memory categories |
| hero_media_id | uuid FK | |
| status | enum(draft, published) | |
| seo_metadata_id | uuid FK | |
| created_at / updated_at | timestamptz | |

**Relations:** `experience_collections`, `experience_products`, `experience_digital_offerings`, `experience_memory_offerings`, `experience_portfolio_projects`, `experience_faqs`.

### `services` (internal building blocks — not directly public)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | internal operational service name |
| description | text | |
| internal_cost_notes | text | admin only |
| experience_id | uuid FK nullable | |
| status | enum(active, inactive) | |

**Visibility:** admin/operations only. Public pages describe `experiences`, never raw `services`.

### `packages` (optional pricing tiers, internal-facing initially)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. "Bespoke Düğün Paketi" |
| experience_id | uuid FK | |
| price_band | enum | |
| included_service_ids | uuid[] | |
| status | enum(draft, published) | if published, can surface as a public-facing summary card without exposing internal cost breakdown |

### `digital_offerings`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| type | enum(wedding_website, digital_invitation, rsvp, qr, guest_list, countdown, location_map, couple_story, gallery) | |
| title | text | |
| description | text | |
| collection_id | uuid FK nullable | |
| preview_media_id | uuid FK nullable | |
| status | enum(draft, published) | |

### `memory_offerings`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| type | enum(photo, film, drone, reels, love_story, family_memory, event_trailer) | |
| title | text | |
| description | text | |
| delivery_timeline_days | int nullable | |
| collection_id | uuid FK nullable | |
| status | enum(draft, published) | |

### `portfolio_projects`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| slug | text unique | |
| event_type | text (references experiences.slug) | |
| city | text | |
| guest_count_band | enum(0-25,26-75,76-150,151-300,300+) | |
| collection_id | uuid FK nullable | |
| cover_media_id | uuid FK | |
| gallery_id | uuid FK nullable | |
| testimonial_id | uuid FK nullable | |
| internal_credit_notes | text | **admin-only** — internal supplier credit, never rendered publicly |
| status | enum(draft, published) | |
| seo_metadata_id | uuid FK | |

### `galleries`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| media_ids | uuid[] | ordered |
| linked_entity_type | text | polymorphic: portfolio_project / collection / memory_offering |
| linked_entity_id | uuid | |
| status | enum(draft, published) | |

### `testimonials`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| quote | text | |
| client_display_name | text | e.g. initials or first names only per privacy preference |
| event_type | text | |
| location | text | |
| collection_id | uuid FK nullable | |
| media_id | uuid FK nullable | |
| status | enum(draft, published) | |

### `faqs`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| question | text | |
| answer | text | |
| category | enum(process, products, digital, rsvp, production, location, budget, customization, language, memory) | |
| linked_entity_type | text nullable | polymorphic attach to experience/product/collection |
| linked_entity_id | uuid nullable | |
| status | enum(draft, published) | |
| sort_order | int | |

### `articles` (Rehber)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| slug | text unique | |
| excerpt | text | |
| body | jsonb / rich text blocks | |
| category | text | |
| author_display | text | defaults to "CHERIE DAY Ekibi" |
| related_experience_ids | uuid[] | |
| related_product_ids | uuid[] | |
| related_collection_ids | uuid[] | |
| cover_media_id | uuid FK | |
| status | enum(draft, published) | |
| seo_metadata_id | uuid FK | |
| published_at | timestamptz | |

### `pages` (static/brand pages: About, How CHERIE DAY Works, Worlds, FAQ hub)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | |
| title | text | |
| body | jsonb | block-based content |
| seo_metadata_id | uuid FK | |
| status | enum(draft, published) | |

---

## Lead / CRM Tables

### `leads`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| source_type | enum(hayalini_tasarla, quote_request, product_inquiry, contact_form, memory_request, whatsapp) | |
| source_entity_type | text nullable | e.g. "product", "experience" |
| source_entity_id | uuid nullable | |
| name | text | |
| email | text | |
| phone | text | |
| event_type | text nullable | |
| event_date_or_season | text nullable | |
| location | text nullable | |
| guest_count_band | text nullable | |
| style_notes | text nullable | |
| budget_band | enum(starter, premium, luxury, bespoke) nullable | |
| message | text nullable | |
| status | enum(new, contacted, qualified, proposal_sent, won, lost) default 'new' | |
| assigned_staff_id | uuid FK → staff_users.id nullable | |
| created_at / updated_at | timestamptz | |

**Visibility:** fully private. No public or anon read/select policy exists.

### `lead_notes`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| lead_id | uuid FK | |
| author_id | uuid FK → staff_users.id | |
| note | text | |
| created_at | timestamptz | |

### `lead_status_history`
| id, lead_id, from_status, to_status, changed_by, changed_at |

### `quote_requests`
Effectively a structured variant of `leads` with `source_type = quote_request` and additional fields:
| needed_modules | text[] | e.g. ["experience","digital","memory"] |
| experience_id | uuid FK nullable | |
| collection_id | uuid FK nullable | |
(Implementation option: fold directly into `leads` with a `metadata jsonb` column instead of a separate table — recommended for MVP simplicity.)

### `contact_messages`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name / email / phone | text | |
| inquiry_type | enum(general, press, partnership, other) | |
| message | text | |
| consent | boolean | |
| status | enum(new, replied, closed) | |
| created_at | timestamptz | |

### `clients`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| lead_id | uuid FK nullable | originating lead |
| name / email / phone | text | |
| auth_user_id | uuid FK → auth.users nullable | populated once client portal exists |
| status | enum(active, past, archived) | |
| created_at | timestamptz | |

---

## Customer Account And Turkey Commerce Tables

### `customers`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| auth_user_id | uuid FK → auth.users unique | |
| name | text | |
| email | text | |
| phone | text | Turkey phone format |
| kvkk_consent_at | timestamptz nullable | |
| marketing_consent_at | timestamptz nullable | |
| status | enum(active, disabled, archived) | |
| created_at / updated_at | timestamptz | |

**Visibility:** customer can read/update own profile only. Admin/sales can read for support and order operations.

### `customer_addresses`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK → customers.id | |
| type | enum(delivery, billing) | |
| full_name | text | |
| phone | text | |
| country | text default 'TR' | MVP must remain Turkey-only |
| city | text | |
| district | text | |
| neighborhood | text nullable | |
| address_line | text | |
| postal_code | text nullable | |
| is_default | boolean | |
| created_at / updated_at | timestamptz | |

### `carts`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK nullable | authenticated cart |
| anonymous_token_hash | text nullable | guest/pre-login cart if allowed |
| status | enum(active, converted, abandoned, expired) | |
| currency | text default 'TRY' | |
| created_at / updated_at | timestamptz | |

### `cart_items`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| cart_id | uuid FK → carts.id | |
| product_id | uuid FK → products.id | |
| variant_id | uuid FK nullable → product_variants.id | |
| quantity | int | |
| personalization_json | jsonb nullable | |
| uploaded_file_ids | uuid[] nullable | |
| unit_price_snapshot | numeric nullable | |
| requires_proof | boolean | |
| created_at / updated_at | timestamptz | |

### `checkout_sessions`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK → customers.id nullable | |
| cart_id | uuid FK → carts.id | |
| delivery_address_id | uuid FK nullable | |
| billing_address_id | uuid FK nullable | |
| shipping_method_id | uuid FK nullable | |
| status | enum(open, pending_payment, paid, failed, expired, converted) | |
| kvkk_consent_at | timestamptz | |
| distance_sales_consent_at | timestamptz | |
| total_amount | numeric | TRY |
| created_at / updated_at | timestamptz | |

### `orders`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_number | text unique | customer-facing |
| customer_id | uuid FK → customers.id | |
| checkout_session_id | uuid FK nullable | |
| status | enum(pending_payment, paid, in_design, proof_sent, proof_approved, in_production, quality_check, packed, shipped, delivered, completed, cancelled, refunded) | |
| payment_status | enum(pending, authorized, paid, failed, cancelled, refunded, partially_refunded) | |
| fulfillment_status | enum(not_started, preparing, shipped, delivered, returned) | |
| total_amount | numeric | TRY |
| delivery_address_snapshot | jsonb | |
| billing_address_snapshot | jsonb | |
| customer_note | text nullable | |
| internal_note | text nullable admin-only | |
| created_at / updated_at | timestamptz | |

### `order_items`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders.id | |
| product_id | uuid FK → products.id | |
| variant_id | uuid FK nullable | |
| product_snapshot | jsonb | name, SKU, options, price |
| quantity | int | |
| personalization_json | jsonb nullable | |
| requires_proof | boolean | |
| unit_price | numeric | TRY |
| total_price | numeric | TRY |

### `payments`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders.id | |
| provider | enum(iyzico, paytr, bank_transfer, manual) | |
| provider_payment_id | text nullable | |
| status | enum(pending, authorized, paid, failed, cancelled, refunded, partially_refunded) | |
| amount | numeric | TRY |
| paid_at | timestamptz nullable | |
| created_at / updated_at | timestamptz | |

### `payment_events`
| id, payment_id FK, provider, event_type, payload jsonb, received_at |

**Visibility:** admin only. Customers see safe payment summary through `orders`, never raw provider payloads.

### `shipping_methods`
| id, name, type(cargo/courier/pickup), city_scope text[] nullable, base_price numeric, status(active/inactive), sort_order |

### `shipments`
| id, order_id FK, shipping_method_id FK, carrier_name, tracking_number, status(preparing/shipped/in_transit/delivered/returned), shipped_at, delivered_at |

### `tracking_events`
| id, shipment_id FK, status, message_tr, occurred_at |

### `product_proofs`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders.id | |
| order_item_id | uuid FK nullable → order_items.id | |
| version | int | |
| media_id | uuid FK → media_assets.id | |
| status | enum(draft, sent, approved, revision_requested) | |
| customer_comment | text nullable | |
| approved_at | timestamptz nullable | |
| created_at / updated_at | timestamptz | |

### `customer_support_threads`
| id, customer_id FK, order_id FK nullable, source enum(account, order, product, contact), subject, status(open, waiting_customer, waiting_team, closed), created_at, updated_at |

### `customer_support_messages`
| id, thread_id FK, sender_type enum(customer, staff), sender_id uuid nullable, message, attachment_ids uuid[] nullable, created_at |

---

## Internal Operations Tables (never public)

### `suppliers`
| id, name, contact_info, capability_tags (text[]), internal_rating, notes, status(active/inactive), created_at |

### `teams`
| id, name, member_names (text[] or link to staff_users), capability_tags, notes |

### `assignments`
| id, supplier_id FK nullable, team_id FK nullable, lead_id FK nullable, client_id FK nullable, portfolio_project_id FK nullable, role_description, status(proposed/confirmed/completed), created_at |

**RLS:** `USING (false)` for `anon`; `USING (auth.role IN ('operations','admin'))` for authenticated operations staff. No table grant to the `anon` or default `authenticated` (client) role at all.

---

## Platform/System Tables

### `media_assets`
| id, url, storage_path, alt_text, type(image/video/document), tags(text[]), linked_entity_type, linked_entity_id, uploaded_by, created_at |

**Storage structure (Supabase Storage buckets):**
- `public-media/` — published assets served via CDN, public read policy.
- `internal-media/` — supplier docs, contracts, internal reference images. No public policy; admin/operations read only.
- `client-files/` (future) — per-client uploads, RLS scoped to `client_id`.

### `seo_metadata`
| id, entity_type, entity_id, title, description, og_image_id FK nullable, canonical_url, schema_type, noindex(boolean) |

### `site_settings`
| id (singleton row), business_name, contact_email, contact_phone, whatsapp_number, social_links(jsonb), default_seo(jsonb), service_area_text, business_hours(jsonb) |

### `staff_users`
| id, auth_user_id FK → auth.users, name, email, role, status(active/inactive), created_at |

### `audit_log`
| id, staff_user_id, action, entity_type, entity_id, diff(jsonb), created_at |

---

## CRUD Rules Summary

| Table group | anon (public) | content_editor | content_publisher | sales_crm | operations | admin |
|---|---|---|---|---|---|---|
| Public content (products, collections, experiences, digital/memory offerings, portfolio, galleries, testimonials, faqs, articles, pages) | Read (published only) | Create/Update draft | Publish/Unpublish/Delete | — | — | Full |
| `seo_metadata`, `site_settings` | Read (rendered fields only) | Update | Publish | — | — | Full |
| `leads`, `clients`, `quote_requests`, `contact_messages`, `lead_notes` | Insert only (via public forms) | — | — | Full | — | Full |
| `suppliers`, `teams`, `assignments` | No access | No access | No access | No access | Full | Full |
| `staff_users`, `audit_log` | No access | Read own | Read own | Read own | Read own | Full |
| Customer account (`customers`, `customer_addresses`, `carts`, `cart_items`, `orders`, `order_items`, `shipments`, `product_proofs`, `customer_support_*`) | Own records only when authenticated; limited insert/update by ownership | — | — | Read/support scope | Fulfillment scope | Full |
| Payments (`payments`, `payment_events`, `refunds`) | Safe status only via order summary; no raw event access | — | — | Read summary | Read operations summary | Full |

**Key RLS notes:**
- Public forms use an `insert`-only policy on `leads`/`contact_messages` with no `select` grant to `anon` — a visitor can submit a lead but can never read leads back.
- Every public-content table needs a `status = 'published'` predicate baked into its RLS `select` policy for the `anon` role; drafts are invisible outside the CMS.
- `internal_cost`, `internal_credit_notes`, and similar admin-only columns should live either in a separate admin-only table or be excluded via a public-facing Postgres `VIEW` (e.g., `products_public`) that the frontend queries instead of the base table.
- Suppliers/teams/assignments must fail closed: default `USING (false)` policy, with explicit `operations`/`admin` role exceptions — never the inverse (default open, exceptions to restrict).
- Customer commerce tables must use `customer_id = current_customer_id()`-style predicates. A customer can never read another customer's cart, address, order, shipment, proof, or support thread.
- Payment provider payloads and webhook events are admin-only. Customer UI receives only safe payment state and next-step copy in Turkish.

---

## Future Table Stubs (not built in MVP, reserved in schema thinking)

- `event_profiles`, `checklists`, `timelines`, `guest_lists`, `files`, `messages` — client portal.
- `digital_sites`, `rsvp_entries`, `guest_list_entries`, `qr_codes` — live digital tool data (distinct from the marketing-layer `digital_offerings`).
