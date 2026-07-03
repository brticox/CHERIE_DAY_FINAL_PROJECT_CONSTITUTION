# CHERIE DAY Commerce Bible

This document defines the CHERIE DAY Turkey-only luxury commerce operating system. It replaces the earlier inquiry-only assumption: the shop must support customer accounts, cart, checkout, payment, order tracking, and support flows for Turkey.

Upgrade layer: `CHERIE_DAY_REVOLUTION_BLUEPRINT.md` raises commerce from product-grid thinking into a curated Maison boutique system where products, collections, digital, memory, and planning cross-link.

Governing rule: **CHERIE DAY is a Brand House, not a marketplace.** Commerce must never feel like Trendyol, Amazon, or a seller directory. Every product, bundle, digital item, order, proof, package, and delivery experience is presented as CHERIE DAY-designed, CHERIE DAY-produced, CHERIE DAY-curated, or CHERIE DAY-delivered.

## Current State

The existing strategy is strong for:

- Product House
- Catalog
- Categories
- Collections
- Filters
- Product detail pages
- Personalization inquiry
- Product SEO
- Admin product management
- Future commerce placeholders

The updated scope requires a professional Turkey-only store with cart, checkout, payments, shipping, tax/invoice readiness, order tracking, proof approval, support inquiries, and admin order management.

## CHERIE DAY Commerce Language

- Cart = `Seçimlerim`
- Checkout entry = `Güvenli Ödeme`
- Order summary = `Sipariş Özeti`
- Production/delivery step = `Üretim ve Teslimat`
- Bundles = `Koleksiyonunu Tamamla`
- Proof = `Tasarım Onayı`
- Production = `CHERIE DAY Atölyesi`
- Shipping = `Özenli Teslimat`

## Commerce Roadmap

### MVP 1 — Public Brand + Turkey Commerce Foundation

Required scope.

- Product House browse
- Product category pages
- Product detail pages
- Collection relationships
- Product inquiry forms
- Customer registration and login
- Customer account dashboard
- Saved addresses
- Cart / `Seçimlerim`
- Turkey-only checkout
- Turkey-only payment provider architecture: iyzico primary + PayTR secondary/fallback preferred
- Turkish domestic card support plus foreign-issued Visa/Mastercard/AMEX where enabled by iyzico/PayTR merchant settings, with TROY support for Turkey
- Bank transfer fallback if needed
- Turkey-only delivery/shipping methods
- Orders
- Order history
- Order detail and tracking
- Product/order support inquiries
- Proof approval for personalized products

### MVP 2 — Admin CMS + CRM + Orders

Current admin scope.

- CMS for products/categories/collections
- Leads and quote requests
- Contact messages
- Product inquiry handling
- Customer management
- Order management
- Payment status review
- Shipment status review
- Proof approval management

### MVP 3 — Product House Pro

Adds professional catalog depth.

- Variants
- Personalization fields
- Advanced filters
- Digital products
- Bundles
- Collection sets
- Product inquiry advanced flow
- Media management
- Bulk import/export

### MVP 4 — Commerce Core Expansion

Adds transaction structure.

- Cart
- Checkout
- Orders
- Addresses
- Shipping methods
- Payment hardening
- Order admin

### MVP 5 — Payments + Fulfillment Hardening

Adds real commerce execution.

- PayTR / iyzico
- Payment webhooks
- Refunds
- Invoices
- Shipping tracking
- Production queue
- Inventory
- Fulfillment workflow

### MVP 6 — Commerce Intelligence

Adds optimization and automation.

- Coupons
- Campaigns
- Analytics
- Abandoned cart
- Recommendations
- Upsells
- Email/SMS/WhatsApp automation

---

## 1. Product Catalog Engine

Purpose:
Create a large, structured, luxury catalog that remains curated and collection-led.

Core capabilities:

- Products
- Categories
- Subcategories
- Collections
- Tags
- Materials
- Colors
- Event types
- Themes/worlds
- Formats: physical, digital, bundle, service-linked
- Featured products
- Related products
- Matching items
- Collection sets

Public UX:
Users browse by CHERIE DAY worlds, categories, event types, and materials. The catalog should feel curated, not endless.

Admin needs:

- Category CRUD
- Product CRUD
- Tag/material/color management
- Featured products
- Related product picker
- Matching item picker
- Collection set builder
- Bulk import/export later

Data model additions:

- `product_tags`
- `materials`
- `colors`
- `event_types`
- `product_event_types`
- `product_related_items`
- `collection_sets`
- `collection_set_items`

CHERIE DAY-specific rule:
Every public product belongs to an CHERIE DAY context: a category, collection, event type, or styled world. No orphan commodity products.

---

## 2. Product Variants & Personalization

Purpose:
Support luxury custom products without making the UI feel technical.

Variant types:

- Size
- Color
- Paper type
- Print type
- Language
- Digital / printed
- Quantity
- Finish
- Foil
- Wax seal
- Ribbon
- Packaging

Personalization fields:

- Names
- Date
- Venue
- Custom text
- Monogram
- Language copy
- Guest names
- Table number
- Menu text
- QR destination
- File upload
- Proof approval

Data model additions:

- `product_variants`
- `product_options`
- `product_option_values`
- `product_personalization_fields`
- `product_files`
- `product_proofs`

Public UX:
Do not expose a dense configurator immediately. Use guided customization:

1. Choose style/collection.
2. Choose format/quantity.
3. Add names/date/text.
4. Upload files if needed.
5. Request proof or quote.

Admin needs:

- Variant builder
- Option/value builder
- Required personalization field rules
- File upload review
- Proof upload
- Proof status: draft, sent, approved, revision_requested

CHERIE DAY-specific rule:
Personalization should feel like atelier customization, not a generic SKU matrix.

---

## 3. Digital Products

Purpose:
Support digital invitations, wedding website themes, RSVP flows, QR designs, downloadable files, and animated invitation assets.

Digital product types:

- Digital invitation templates
- Wedding website themes
- Downloadable PDFs
- Editable invitation files
- QR designs
- RSVP flows
- Digital cards
- Animated invitations

Data model additions:

- `digital_products`
- `digital_assets`
- `digital_licenses`
- `download_links`
- `template_instances`
- `customer_digital_projects`

Public UX:
Digital products should be tied to CHERIE DAY Collections. A user should see that the digital invitation, wedding website, QR card, and printed materials share the same design language.

Admin needs:

- Digital asset upload
- Template metadata
- License/access rules
- Download link generation
- Customer project creation
- Expiry settings

Future client UX:

- Private link/token access
- Template preview
- RSVP data
- Download center
- Revision approval

CHERIE DAY-specific rule:
Digital products are not generic downloads. They are CHERIE DAY Digital Love Stories and collection-linked digital experiences.

---

## 4. Cart System

Purpose:
Allow users to gather physical, digital, and bundled products before checkout.

Capabilities:

- Cart
- Cart items
- Save for later
- Bundle cart
- Personalization data inside cart
- Quantity rules
- Price calculation
- Estimated production/delivery time

Data model additions:

- `carts`
- `cart_items`
- `saved_cart_items`

Cart item data:

- product_id
- variant_id
- quantity
- personalization_json
- selected_options_json
- uploaded_file_ids
- collection_id
- bundle_id nullable
- estimated_production_days
- price_snapshot

Public UX:
Cart should feel quiet and premium. Avoid aggressive cross-sell patterns. Use `Complete the Collection` and `Add matching pieces` instead.

CHERIE DAY-specific rule:
Cart language should stay elegant: `Seçimlerim`, `Koleksiyon parçaları`, `Tamamlayıcı ürünler`.

---

## 5. Checkout System

Purpose:
Convert selected products into an order with customer, delivery, billing, payment, and consent data.

Checkout steps:

1. Login/register or approved guest flow
2. Customer info
3. Delivery address in Turkey
4. Billing address in Turkey
5. Turkey shipping method
6. Payment method
7. Coupon/private code if enabled
8. Order summary
9. Terms/KVKK/distance sales consent
10. Order creation

Data model additions:

- `checkout_sessions`
- `addresses`

Public UX:
Checkout should be simple, calm, and confidence-building. Use clear delivery estimates and production timeline. Keep WhatsApp fallback visible for custom orders.

Geography rule:
MVP checkout supports Turkey only. International addresses, international shipping, international storefront operations, multi-currency storefronts, and EN/AR checkout are future-only. Foreign-issued cards may be accepted only for Turkey-only orders where the provider account allows it.

Admin needs:

- View checkout sessions
- Recover incomplete checkout
- Link checkout to lead/client/order

CHERIE DAY-specific rule:
For bespoke/custom products, checkout can require proof approval before fulfillment. Not every product must be instant-pay.

---

## 6. Orders

Purpose:
Create the source of truth for purchases and post-purchase operations.

Order fields:

- Order number
- Customer/client
- Items
- Order status
- Payment status
- Fulfillment status
- Production status
- Shipping status
- Notes
- Attachments
- Internal cost
- Public/customer notes

Data model additions:

- `orders`
- `order_items`
- `order_status_history`

Recommended statuses:

- draft
- pending_payment
- paid
- in_design
- proof_sent
- proof_approved
- in_production
- quality_check
- packed
- shipped
- delivered
- completed
- cancelled
- refunded

Admin needs:

- Order list/table
- Order detail
- Status updates
- Internal notes
- Customer-visible notes
- Attachment/proof management
- Link to client/lead

CHERIE DAY-specific rule:
Order experience should feel like a concierge production journey, not a warehouse tracker.

---

## 7. Payments

Purpose:
Support secure payment collection, callbacks, refunds, and deposits.

Payment providers:

- iyzico preferred primary
- PayTR preferred secondary/fallback
- Manual/bank transfer fallback possible
- Stripe is not primary for Turkey MVP unless business/legal constraints require it

Capabilities:

- Payment intent
- Callback/webhook
- Failed/success/cancelled states
- Refunds
- Partial payments
- Deposit payments for services

Data model additions:

- `payments`
- `payment_events`
- `refunds`

Payment statuses:

- pending
- authorized
- paid
- failed
- cancelled
- refunded
- partially_refunded

Admin needs:

- Payment history
- Webhook event log
- Manual status correction with audit log
- Refund request/record

CHERIE DAY-specific rule:
Deposits for experience packages should be supported separately from product checkout.

---

## 8. Shipping & Delivery

Purpose:
Manage physical product delivery inside Turkey. International support is future-only.

Capabilities:

- Shipping zones
- Turkey cities
- Delivery methods
- Pickup / cargo / courier
- Production time
- Delivery estimate
- Tracking number
- Shipping providers
- Shipping price rules

Data model additions:

- `shipping_methods`
- `shipping_zones`
- `shipments`
- `tracking_events`
- `shipping_price_rules`

Delivery methods:

- CHERIE DAY courier
- Cargo
- Pickup
International cargo later, outside MVP

Public UX:
Show production + delivery estimate separately. Example:
`Üretim: 7-10 iş günü. Teslimat: İstanbul içi 1-2 gün.`

CHERIE DAY-specific rule:
Delivery copy should reinforce care: packaging, safe handling, and premium presentation.

---

## 9. Inventory & Production

Purpose:
Track stock, made-to-order production, internal tasks, and fulfillment readiness.

Capabilities:

- Stock
- Made-to-order
- Low stock
- Reserved stock
- Production queue
- Supplier/internal team assignment
- Estimated ready date
- Quality check
- Packaging status

Data model additions:

- `inventory_items`
- `stock_movements`
- `production_tasks`
- `fulfillment_tasks`

Production task statuses:

- queued
- assigned
- in_progress
- proof_waiting
- ready_for_quality_check
- passed_quality_check
- needs_revision
- packed
- completed

Admin needs:

- Production board
- Task assignment
- Due dates
- Quality check checklist
- Packaging state
- Internal supplier/team linkage

CHERIE DAY-specific rule:
Internal supplier/team assignments stay private. Public-facing production updates should say `CHERIE DAY üretim ağı` or `CHERIE DAY tasarım atölyesi`.

---

## 10. Coupons & Campaigns

Purpose:
Support campaigns without cheapening the luxury brand.

Discount types:

- Percentage discount
- Fixed discount
- Free shipping
- Collection-specific
- Category-specific
- Minimum cart value
- Usage limit
- Date range
- First order
- Private coupon

Data model additions:

- `discounts`
- `discount_rules`
- `coupon_redemptions`

Admin needs:

- Create coupon
- Define scope
- Date range
- Usage limits
- Track redemptions
- Disable/expire

Public UX:
Use subtle campaign language. Avoid loud sale badges. Prefer private codes, launch gifts, or collection-event benefits.

CHERIE DAY-specific rule:
Discounting must not damage luxury positioning. Use `özel davet kodu`, `koleksiyon lansman avantajı`, or `ücretsiz teslimat` sparingly.

---

## 11. Admin Commerce Dashboard

Purpose:
Give CHERIE DAY operations a complete commerce management surface.

Modules:

- Products
- Variants
- Digital products
- Categories
- Collections
- Orders
- Payments
- Refunds
- Shipments
- Inventory
- Production
- Coupons
- Customers
- Abandoned carts
- Product SEO
- Media
- Bulk import/export
- Analytics

Admin routes:

- `/admin/commerce/products`
- `/admin/commerce/variants`
- `/admin/commerce/digital-products`
- `/admin/commerce/orders`
- `/admin/commerce/payments`
- `/admin/commerce/refunds`
- `/admin/commerce/shipments`
- `/admin/commerce/inventory`
- `/admin/commerce/production`
- `/admin/commerce/coupons`
- `/admin/commerce/abandoned-carts`
- `/admin/commerce/analytics`

Permissions:

- `admin`: full
- `operations`: orders, production, fulfillment, inventory
- `sales_crm`: customers, order notes, customer communication
- `content_editor`: products/categories/collections draft content
- `content_publisher`: publish product content

CHERIE DAY-specific rule:
Commerce admin can expose internal supplier/team data; public website cannot.

---

## 12. Luxury E-Commerce UX

Purpose:
Make commerce feel like a maison experience, not a commodity store.

UX principles:

- Collection-first browsing
- Product storytelling
- Matching pieces
- Complete the collection
- Adapt this for your event
- Digital + physical bundle
- Guided customization
- Calm checkout
- Premium packaging language
- Proof approval for personalized pieces

Product page structure:

- Gallery
- Product story
- Materials
- Personalization
- Matching collection
- Matching pieces
- Production and delivery estimate
- FAQ
- Inquiry or add-to-cart

Collection commerce structure:

- Mood/story
- Palette/materials
- Products
- Digital theme
- Event styling direction
- Bundle/set options
- Adapt this world CTA

Cart/checkout tone:

- `Seçimlerim`
- `Koleksiyonunu Tamamla`
- `Kişiselleştirme Detayları`
- `Üretim ve Teslimat`
- `Sipariş Özeti`

Avoid:

- loud sale banners
- marketplace seller labels
- star ratings per product as primary proof
- aggressive upsells
- generic “customers also bought”
- cluttered SKU tables

---

## Commerce Data Model Additions

Core catalog:

- `product_tags`
- `materials`
- `colors`
- `event_types`
- `product_event_types`
- `product_related_items`
- `collection_sets`
- `collection_set_items`

Variants/personalization:

- `product_variants`
- `product_options`
- `product_option_values`
- `product_personalization_fields`
- `product_files`
- `product_proofs`

Digital:

- `digital_products`
- `digital_assets`
- `digital_licenses`
- `download_links`
- `template_instances`
- `customer_digital_projects`

Cart/checkout:

- `carts`
- `cart_items`
- `saved_cart_items`
- `checkout_sessions`
- `addresses`

Orders/payments:

- `orders`
- `order_items`
- `order_status_history`
- `payments`
- `payment_events`
- `refunds`

Shipping/fulfillment:

- `shipping_methods`
- `shipping_zones`
- `shipping_price_rules`
- `shipments`
- `tracking_events`
- `inventory_items`
- `stock_movements`
- `production_tasks`
- `fulfillment_tasks`

Campaigns:

- `discounts`
- `discount_rules`
- `coupon_redemptions`

Analytics/automation later:

- `abandoned_carts`
- `commerce_events`
- `email_notifications`
- `sms_notifications`
- `whatsapp_notifications`

---

## RLS And Privacy Rules

Public/anon may:

- read published public product/catalog data via public views,
- insert cart/checkout/lead records according to safe policies,
- never read other users’ carts/orders/leads.

Public/anon must never:

- read internal cost,
- read supplier/team assignments,
- read internal production notes,
- read payment events,
- read other customers’ orders,
- read draft products/content.

Recommended public views:

- `products_public`
- `product_variants_public`
- `collections_public`
- `product_categories_public`

Admin-only fields:

- internal_cost
- supplier_id
- assignment_id
- internal_notes
- margin
- procurement_status
- internal_quality_notes

---

## Brand House Commerce Rules

- Product pages say CHERIE DAY designed/produced/curated the item.
- Digital products are CHERIE DAY Digital, not anonymous templates.
- Memory products are CHERIE DAY Memory, not individual creator listings.
- Production statuses mention CHERIE DAY atelier/production network.
- Supplier/team data exists only for internal operations.
- Reviews, if ever added, should be product or CHERIE DAY-level, not supplier-level.
- Bundles should be collection-led, not discount-led.
- Checkout should preserve elegance and reassurance.

## Final Assessment

Current Product House readiness as luxury catalog: **8.5/10**.

Previous readiness as full professional commerce system before the hardening lock: **4.5/10**.

After the hardening lock files `22` through `31`: **9.5/10** implementation readiness, with legal/accountant/provider sign-off still required before public launch.

The correct path is to build full Turkey-only commerce in MVP without letting it feel like a commodity marketplace. CHERIE DAY should launch with account, cart, checkout, payment, order tracking, proof approval, and support foundations, then expand into advanced commerce intelligence, automation, international storefront operations, and deeper digital/client portal tools in staged releases.
