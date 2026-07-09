# COMMERCE DATA MODEL EXTENSIONS

This file is the **canonical superset** of the data model. `08_DATA_MODEL_AND_CMS_SCHEMA.md` defines the core; `09_COMMERCE_BIBLE.md` and `37_MEGA_STORE_AND_SERVICE_ATLAS.md` named many tables that never landed in `08`. This file defines them concretely so the schema is buildable without guessing. Service/reservation tables live in `41`.

All tables follow the security posture in `23`: fail closed, public reads only via `*_public` views on `status='published'`, customers scoped to own rows, internal cost/supplier fields never public.

---

## 1. Catalog Taxonomy Tables (referenced in `09`, missing in `08`)

### `departments` — NEW top grouping above `categories`
| id, name_tr, slug, sort_order, icon_media_id nullable, status |
Maps to the `/shop/[department]` routes in `40`. `categories.department_id → departments.id` (add this FK to `categories`).

### `event_types`
| id, name_tr, slug, sort_order, status | e.g. dugun, nisan, soz, isteme, dogum_gunu, baby_shower, gender_reveal, kina, nikah, kurumsal.

### `product_event_types` (M:N)
| product_id FK, event_type_id FK | powers `/shop/etkinlik/[event-slug]` filtered views.

### `materials`, `colors`, `product_tags`
| id, name_tr, slug, (hex for colors), sort_order | + join tables `product_materials`, `product_colors`, `product_product_tags`. Power filters in `33`/`40`.

### `collection_sets`, `collection_set_items` (bundles)
- `collection_sets`: | id, name_tr, slug, collection_id FK nullable, story, bundle_price numeric nullable, bundle_discount_pct nullable, status |
- `collection_set_items`: | id, set_id FK, product_id FK, default_quantity int, is_required bool, sort_order |
Powers `Koleksiyonunu Tamamla`. Bundle price may be explicit or computed; luxury rule: bundles are collection-led, not discount-led (`09`).

### `product_addons` — NEW (gift wrap, rush, extra revision, foil upgrade)
| id, product_id FK nullable (null = global addon), name_tr, addon_type enum(gift_wrap, rush, extra_revision, upgrade, other), price numeric, price_type enum(fixed, percentage), is_optional bool, sort_order, status |
Selected addons are captured in `cart_items.selected_addons_json` and snapshotted into `order_items`.

### `product_price_tiers` — NEW (quantity-based pricing)
| id, product_id FK, variant_id FK nullable, min_qty int, unit_price numeric | e.g. davetiye 100 adet vs 250 adet. Pricing engine resolves the applicable tier at add-to-cart and snapshots it.

### `product_city_availability` — NEW (physical products with city delivery limits)
| id, product_id FK, city_id FK, is_available bool, extra_lead_time_days int nullable | most products ship Turkey-wide; this table only constrains exceptions.

---

## 2. Digital Products (named in `09`, absent in `08`)

`digital_offerings` in `08` is a **marketing** layer. Actual sellable/deliverable digital products need:

### `digital_products`
| id, name_tr, slug, collection_id FK nullable, digital_type enum(dijital_davetiye, web_davetiye, animasyonlu_davetiye, qr_kart, dijital_album, indirilebilir), behavior enum(digital_checkout, proof_required, quote_required), base_price numeric nullable, personalization_fields (reuses `product_personalization_fields`), preview_media_ids uuid[], delivery_mode enum(link, download, hosted_page), status | 
### `digital_assets`
| id, digital_product_id FK, storage_path, asset_type, is_source bool | source files in `internal-media`/`proof-files`, never public.
### `customer_digital_projects` (per-purchase instance)
| id, customer_id FK, order_item_id FK, digital_product_id FK, project_data jsonb (names, date, venue, text), status enum(draft, in_design, proof_sent, approved, delivered, expired), delivered_url text nullable, access_token_hash text, expires_at timestamptz nullable, created_at |
### `digital_download_links`
| id, customer_digital_project_id FK, url_signed_ref, download_count int, max_downloads int nullable, expires_at |

**Digital delivery legal:** performance/delivery start point and withdrawal exception must be shown before purchase (`42 §Legal`, `20 §6`). Access is token/owner-scoped, never public-searchable (`23`).

---

## 3. Reviews & Ratings (customer UGC) — NEW, brand-safe

The business wants reviews (`37`, task), but the brand rule forbids marketplace/per-supplier ratings (`01`, `09`). Model reviews as **CHERIE DAY-level and product/experience-level, moderated, never per-supplier.**

### `reviews`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK | must be authenticated |
| subject_type | enum(product, service_package, order, experience, brand) | never `supplier` |
| subject_id | uuid nullable | |
| order_id / reservation_id | uuid FK nullable | verified-purchase link |
| rating | int (1–5) nullable | optional; not shown as loud marketplace stars |
| title | text nullable | |
| body | text | |
| photo_media_ids | uuid[] nullable | requires `photo_consent` |
| photo_consent | boolean | KVKK explicit consent to publish uploaded photos |
| is_verified_purchase | boolean | derived from order/reservation link |
| status | enum(pending, approved, rejected, hidden) | **default pending — nothing public until moderated** |
| moderation_note | text nullable | admin-only |
| moderated_by / moderated_at | | |
| created_at / updated_at | | |

- Public view `reviews_public` = `status='approved'` only, excludes moderation fields, excludes photos where `photo_consent=false`.
- Display: aggregate quietly (e.g. "23 değerlendirme") and use editorial testimonial styling, not aggressive star blocks (`09` tone).
- Customer manages own reviews at `/hesap/degerlendirmelerim`.
- Only customers with a matching delivered `order`/completed `reservation` may review that subject (verified). Brand/experience reviews may allow authenticated non-verified with a clear label, admin-gated.

---

## 4. Favorites / Saved (distinct from cart) — NEW

`Seçimlerim` = cart. Favorites is a separate wishlist so users can save without intent to buy now.

### `favorites`
| id, customer_id FK, item_type enum(product, service_package, collection, digital_product), item_id, created_at | unique(customer_id, item_type, item_id). Guest favorites may live in localStorage and merge on login. Surfaced at `/hesap/favoriler`. Public label: `Favorilerim` (or `Beğendiklerim`). Never a public shareable vendor list.

---

## 5. Notifications — NEW

### `notifications`
| id, customer_id FK, type enum(order_update, proof_ready, payment, shipment, reservation_update, quote_ready, support_reply, digital_delivery, marketing), title_tr, body_tr, link, is_read bool, created_at |
### `notification_preferences`
| id, customer_id FK, channel enum(email, sms, whatsapp, onsite), category, opted_in bool, updated_at |
- Transactional notifications (order/proof/payment/shipment/reservation) are always on (legitimate interest / contract). Marketing requires opt-in consent (`20 §5`).
- Surfaced at `/hesap/bildirimler`; preferences at `/hesap/tercihler`.

---

## 6. Deposits, Installments & Invoice/Tax (Turkey specifics)

Extend the commerce/payment model (`08`) with fields the Turkish market and law require (`24`).

### Additions to `orders`
| Field | Type | Notes |
|---|---|---|
| payable_type | enum(order, reservation_deposit, reservation_balance, quote) | unifies `orders` with service payables via `43` |
| installment_count | int default 1 | taksit; only where provider/legal allows (`20 §3`) |
| deposit_amount / balance_amount | numeric nullable | for partial-payment orders |
| invoice_type | enum(bireysel, kurumsal) | |
| invoice_identity | jsonb | bireysel: {ad_soyad, tckn?}; kurumsal: {unvan, vkn, vergi_dairesi} |
| einvoice_status | enum(not_required, pending, issued, failed) | e-Arşiv/e-Fatura readiness (issuance may be external/manual in MVP) |
| einvoice_ref | text nullable | provider/accounting reference |

### `installment_options` (display/config)
| id, provider, min_amount numeric, card_family, count int, is_active | shown at checkout only where the provider/BIN supports it; never fabricate installment offers.

### `refunds` (was named, define concretely)
| id, order_id FK nullable, reservation_id FK nullable, payment_id FK, amount numeric, reason enum(customer_request, defect, cancellation, duplicate, goodwill, other), type enum(full, partial), status enum(requested, approved, processing, completed, rejected), notes_internal, created_by, created_at, completed_at |

**Personalized/service exception:** refund eligibility differs for standard vs personalized products vs date-specific services — enforced by policy text + admin rules, lawyer-reviewed (`42 §Legal`, `24 §Personalized`).

---

## 7. Legal Documents & Consent Versioning — NEW

Legal text must be versioned so consent evidence references the exact version accepted (`24 §Consent Evidence`).

### `legal_documents`
| id, doc_key enum(kvkk_aydinlatma, gizlilik, cerez, acik_riza, kullanim_kosullari, on_bilgilendirme, mesafeli_satis, iade_iptal, teslimat, kisisellestirilmis_urun, hizmet_rezervasyon, satici_bilgileri), title_tr, slug, status |
### `legal_document_versions`
| id, legal_document_id FK, version text, body (rich text/jsonb), effective_from date, is_current bool, published_by, published_at |
### `consent_records`
| id, customer_id FK nullable, session_ref nullable, consent_type enum(kvkk, distance_sales, pre_info, cookie, marketing, explicit, photo_publish), legal_document_version_id FK nullable, checkbox_label_snapshot text, order_id/reservation_id FK nullable, ip inet nullable, user_agent text nullable, source_route text, created_at |
### `cookie_consent_logs`
| id, session_ref, customer_id nullable, categories_json (necessary/analytics/marketing booleans), action enum(accept_all, reject_optional, configure), consent_version, ip nullable, created_at |

**Rule:** `Ön Bilgilendirme` and `Mesafeli Satış` are rendered per-order/per-reservation from the current version and the exact rendered copy + version id is snapshotted onto the order/reservation and into `consent_records`. Never bundle explicit consent with the privacy notice (`20 §5`).

---

## 8. Search Index Support — NEW

### `search_documents` (denormalized index, or use Postgres FTS / provider)
| id, entity_type enum(product, service_package, collection, experience, digital_product, article), entity_id, title_tr, body_tokens tsvector, tags text[], department, event_types text[], status |
- Turkish FTS config; strip/normalize Turkish diacritics for tolerance (`ç/c, ş/s, ı/i, ğ/g, ö/o, ü/u`).
- Only `published` entities indexed. Never index suppliers/teams/leads/orders. Behavior + no-result UX in `44 §Search`.

---

## 9. Abandoned Cart / Recovery (admin visibility MVP)

### `abandoned_carts`
| id, cart_id FK, customer_id/email nullable, last_step enum(cart, address, payment), value numeric, recovered bool, created_at | MVP = admin visibility only; automated recovery emails are Phase 3 (`46`), gated by marketing consent.

---

## 10. RLS Additions (extends `23`)

New public views: `service_packages_public`, `digital_products_public`, `reviews_public`, `legal_documents_public` (current versions), `search_documents` filtered to published.
New owner-scoped tables (customer reads own only): `favorites`, `notifications`, `notification_preferences`, `customer_digital_projects`, `digital_download_links`, `reviews` (own, any status), `consent_records` (own), plus all `41` reservation tables.
Admin/staff-only: `service_checklists`, `refunds` internal fields, `moderation_note`, `legal_document_versions` publishing, `abandoned_carts`, all `*_internal`/cost fields.
Required test additions to `23 §Required Tests`: anon cannot read reviews with `status!=approved`; anon cannot read another customer's favorites/notifications/digital projects; unapproved review photos never render; consent records are never publicly selectable.
