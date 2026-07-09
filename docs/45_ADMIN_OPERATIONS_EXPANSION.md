# ADMIN OPERATIONS EXPANSION

`33` defined an excellent product/order admin. This file **extends admin to the full mega-store + service scope**: reservations, quotes, service packages, city availability, reviews/gallery moderation, legal versioning, notifications/campaigns, refunds/deposits, and a complete role×module permission matrix + audit event list. Admin is the command center, utilitarian not cinematic (`33 §15`).

Admin root: `/admin`. Every mutating action writes `audit_log`. Every module is `noindex`, never in sitemap, gated by `has_staff_role` (`23`).

---

## 1. Full Admin Module Map (routes)

### Commerce (from `33`, retained)
`/admin/dashboard`, `/admin/commerce/products`, `/admin/commerce/variants`, `/admin/commerce/digital-products`, `/admin/commerce/addons`, `/admin/commerce/price-tiers`, `/admin/commerce/orders`, `/admin/commerce/payments`, `/admin/commerce/refunds`, `/admin/commerce/shipments`, `/admin/commerce/inventory`, `/admin/commerce/production`, `/admin/commerce/proofs`, `/admin/commerce/coupons`, `/admin/commerce/abandoned-carts`, `/admin/commerce/analytics`.

### Catalog structure — NEW
`/admin/catalog/departments`, `/admin/catalog/categories`, `/admin/catalog/collections`, `/admin/catalog/collection-sets`, `/admin/catalog/event-types`, `/admin/catalog/materials-colors-tags`.

### Services & Reservations — NEW (the missing half)
| Route | Purpose |
|---|---|
| `/admin/services/packages` | Service package + addon CRUD (`41`). |
| `/admin/services/cities` | City coverage, travel fees, availability. |
| `/admin/services/availability` | Capacity/blackout calendar per city/category. |
| `/admin/services/reservations` | Reservation list + board (status pipeline). |
| `/admin/services/reservations/[id]` | Reservation detail: brief, milestones, checklist, assignment, status, cancel/reschedule. |
| `/admin/services/calendar` | **Reservation Calendar** — month/week view of events by city/date/status. |
| `/admin/services/quotes` | Quote builder + pipeline (draft→sent→accepted). |
| `/admin/services/consultations` | Consultation requests + slot confirmation. |

### CRM & Customers (from `07`, retained + extended)
`/admin/crm/leads`, `/admin/crm/quote-requests`, `/admin/crm/clients`, `/admin/customers`, `/admin/customers/[id]` (profile, orders, reservations, quotes, proofs, support, consent evidence).

### Support / Ticketing — NEW consolidated
`/admin/support` (queue), `/admin/support/[thread-id]`. Threads link to customer/order/reservation/product/proof/payment (`33 §14`). Actions: reply, assign, tag, priority, status, internal note, convert to task, WhatsApp handoff log.

### Content / CMS (from `07`, retained)
`/admin/cms/pages|experiences|digital|memory|portfolio|galleries|articles|faqs|testimonials|seo|settings`, `/admin/media`.

### Reviews & Moderation — NEW
`/admin/moderation/reviews` (approve/reject/hide, photo-consent check), `/admin/moderation/gallery` (customer photos → portfolio/gallery), `/admin/moderation/queue` (all pending UGC).

### Legal & Consent — NEW
`/admin/legal/documents` (per `doc_key`), `/admin/legal/documents/[key]/versions` (create/publish versions, set current), `/admin/legal/consent-log` (read-only consent evidence export), `/admin/legal/cookie-log`.

### Marketing / Campaigns — NEW
`/admin/marketing/coupons`, `/admin/marketing/campaigns`, `/admin/marketing/notifications` (transactional templates + broadcast to opted-in), `/admin/marketing/abandoned-carts`.

### System
`/admin/settings`, `/admin/settings/seo`, `/admin/settings/shipping`, `/admin/settings/payment`, `/admin/users` (staff), `/admin/roles`, `/admin/audit-log`, `/admin/operations/suppliers|teams|assignments` (internal-only, `23`).

---

## 2. Reservation Calendar (spec)

- Views: month, week, day; filter by city, service_category, status, assigned staff.
- Each event cell shows: package, city, guest band, status color, deposit paid ✓/✗.
- Capacity awareness: shows `booked_count/capacity` per date/category; blackout dates marked.
- Drag to reschedule updates `reservations.status → rescheduled` + writes history + prompts customer notification + policy check (`41 §5-6`).
- Conflict warning when capacity exceeded; overbooking blocked by default.

## 3. Quote Builder (spec)

- Compose line items from `service_packages` + `service_addons` + optional products; set event fields, travel fee, discount, deposit.
- Live total; set `valid_until`; generate customer-facing quote (`/hesap/tekliflerim`).
- Send (email/WhatsApp), track viewed/accepted/declined; accepted quote can auto-create reservation + deposit checkout link (`41 §3`).
- Snapshot `terms_version`.

## 4. Reviews / Gallery Moderation (spec)

- Default all customer reviews/photos `pending`; nothing public until approved (`42 §3`).
- Moderator sees: content, verified-purchase flag, photo-consent flag. Reject/hide with internal reason.
- Approved photos can be promoted to `galleries`/`portfolio_projects`/`testimonials`, **only** where `photo_consent=true`.
- Brand rule enforced: reviews are product/service/experience/brand level, never per-supplier; no vendor identity ever surfaced.

## 5. Legal Versioning (spec)

- Each `legal_document` has versioned bodies; publishing a new version sets it `is_current` with `effective_from`.
- Checkout/reservation always render the **current** version and snapshot version id into the order/reservation + `consent_records` (`42 §7`).
- Consent log is exportable (accountant/lawyer/audit); never editable after write.
- Only `admin` may publish legal versions (`33 §17`).

## 6. Notifications & Campaigns (spec)

- Transactional templates (order/proof/payment/shipment/reservation/quote/digital delivery) — always sent, editable Turkish templates, per-channel (email/SMS/WhatsApp).
- Broadcast/marketing — only to `notification_preferences.opted_in=true` for that channel/category; unsubscribe honored; consent evidence respected (`20 §5`).
- Coupons/campaigns: create, scope (collection/category/product/service), date range, usage limit, min order, per-customer code; luxury restraint (`09 §10`, `33 §10`). Track redemptions.

## 7. Role × Module Permission Matrix

Roles (superset of `08`/`33 §17`): `superadmin`, `admin`, `commerce_manager`, `product_editor`, `order_operations`, `service_operations`, `proof_designer`, `support_agent`, `finance_viewer`, `content_editor`, `content_publisher`, `sales_crm`.

| Module | Read | Write | Notes |
|---|---|---|---|
| Products/catalog | product_editor, content_editor, commerce_manager, admin | same (publish: content_publisher/commerce_manager/admin) | |
| Orders | order_operations, commerce_manager, support_agent(scope), admin | order_operations, commerce_manager, admin | |
| Payments (summary) | finance_viewer, commerce_manager, admin | admin | |
| Payment events (raw) | admin, finance_viewer | — | never customer/other staff (`23`) |
| Refunds | finance_viewer(request), admin | admin | |
| Reservations/quotes/consultations | service_operations, sales_crm, admin | service_operations, admin | |
| Service packages/cities/availability | service_operations, commerce_manager, admin | admin, commerce_manager | |
| Proofs | proof_designer, order_operations, admin | proof_designer, admin | |
| Reviews/gallery moderation | content_editor, support_agent, admin | content_publisher, admin | |
| Legal documents/versions | admin | admin (publish only) | |
| Consent/cookie logs | admin, finance_viewer | — (append-only) | |
| CRM leads/clients | sales_crm, admin | sales_crm, admin | |
| Support | support_agent, sales_crm, admin | support_agent, admin | |
| Customers PII | need-to-know (support/sales/order/admin) | admin | |
| Suppliers/teams/assignments | operations, admin | operations, admin | never public/customer (`23`) |
| Staff/roles | admin, superadmin | superadmin | |
| Audit log | admin | — (append-only) | |
| Site/shipping/payment settings | admin | admin | |

Sensitive access reaffirmed: payment events, refunds → admin/finance only; supplier/internal cost → operations/admin; legal publish → admin (`33 §17`).

## 8. Audit Log — required events

Write `audit_log(staff_user_id, action, entity_type, entity_id, diff, created_at)` for at minimum: product/price/variant change; order status/payment/refund change; proof send/approve; reservation status/reschedule/cancel; quote send/accept; review approve/reject; legal version publish; coupon create/disable; role/staff change; settings change; manual payment status correction; any customer PII export.

## 9. Admin UX Standard (from `33 §15`, retained)

Persistent sidebar, command search, saved views/boards, bulk actions, filters, empty states, inline validation, autosave drafts where safe, role-based visibility, no raw provider errors without explanation, preview mode, relation pickers. Mobile: at least leads/orders/reservations/support usable on phone.

## 10. Admin Saved Views (operational queues)

Orders: `Yeni Siparişler`, `Ödeme Bekleyen`, `Tasarım Bekleyen`, `Onay Bekleyen`, `Üretimde`, `Paketlenecek`, `Kargoda`, `Destek Gerekiyor`, `İade/İptal` (`33 §11`).
Services: `Yeni Rezervasyon Talepleri`, `Teklif Bekleyen`, `Ön Ödeme Bekleyen`, `Planlamada`, `Bu Hafta Etkinlik`, `Tamamlanan (Değerlendirme Bekleyen)`, `İptal/Erteleme`.
Moderation: `Onay Bekleyen Değerlendirmeler`, `Onay Bekleyen Fotoğraflar`.

## 11. Admin Acceptance (extends `33 §18`)

Admin passes only if a team can run products, prices, orders, proofs, shipping, payments, refunds, **reservations, quotes, consultations, service packages, city availability, reviews moderation, legal versions, notifications**, customers, support, SEO, and settings from one place; every public commerce/service state has an admin control; every customer issue is traceable; every payment/order/proof/reservation/legal action is audited; role permissions prevent leaks.
