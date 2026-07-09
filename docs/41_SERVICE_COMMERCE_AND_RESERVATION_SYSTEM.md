# SERVICE COMMERCE AND RESERVATION SYSTEM

This file specifies the **service side** of CHERIE DAY: organization services, city-based services, consultations, quotes, reservations, deposits, briefs, milestones, and post-event review. The product side (`09`, `26`, `33`) was well defined; the service side existed only as scope notes in `37`. This file closes that gap.

Governing rule unchanged: public "who executes this?" is always **CHERIE DAY** (`CHERIE DAY ekibi / üretim ağı / film ekibi / müzik & sahne ekibi`). Internal suppliers/teams/assignments stay admin-only (`08`, `23`).

---

## 1. Service Object Model

A **Service** is a CHERIE DAY-designed offering that is not shipped as a product but delivered as work on a date/place. Services are presented as curated packages, never as vendor listings.

### `service_packages` (public)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | Turkish public name |
| slug | text unique | |
| service_category | enum(organizasyon, nisan_soz_setup, dogum_gunu, baby_shower, gender_reveal, dekor_konsept, muzik_dj, foto_video, sehir_hizmeti, ozel) | |
| summary | text | |
| description | text | |
| behavior_type | enum(quote_required, reservation_request, city_dependent_service, inquiry_only) | |
| price_display | enum(from_price, price_band, quote_only) | luxury: `Teklif ile` allowed |
| base_from_price | numeric nullable | TRY, only if `from_price` |
| price_band | enum(starter, premium, luxury, bespoke) nullable | |
| deposit_model | enum(none, fixed, percentage) | see §6 |
| deposit_value | numeric nullable | fixed TRY or percent |
| requires_event_date | boolean | |
| requires_venue | boolean | |
| requires_guest_count | boolean | |
| min_lead_time_days | int | earliest bookable relative to today |
| collection_id | uuid FK nullable | ties service to a collection world |
| experience_ids | uuid[] | which celebration types it belongs to |
| gallery_id | uuid FK nullable | past work |
| hero_media_id | uuid FK nullable | |
| status | enum(draft, published) | |
| seo_metadata_id | uuid FK | |

**Visibility:** public read where `status=published` via `service_packages_public` view (excludes internal cost, supplier notes).

### `service_addons`
| id, service_package_id FK, name, description, price numeric nullable, price_band nullable, is_optional bool, sort_order |
Examples: ekstra masa styling, ilave saat, drone çekimi, canlı müzik ilavesi.

### `service_cities` (city coverage)
| id, city_name, city_slug, is_active bool, travel_fee_model enum(none, fixed, per_km, quote), travel_fee_value numeric nullable, notes_tr text |

### `service_city_availability` (which package in which city)
| id, service_package_id FK, city_id FK, is_available bool, city_specific_lead_time_days int nullable, city_note_tr text nullable |

**City rule:** a `city_dependent_service` is bookable/quotable only where a matching `service_city_availability(is_available=true)` row exists. Otherwise the page shows the "not yet in your city" inquiry state (`44`).

---

## 2. Public Service Flows (behavior-typed)

Every service page states its behavior badge in Turkish so the user knows the path before acting:
`Teklif ile` · `Rezervasyon ile` · `Şehre bağlı` · `Danışmanlıkla`.

### 2.1 Consultation booking (`Randevu Al`)
Low-commitment entry for high-touch services. Route `/randevu` or in-page.
1. Hizmet / konu seç.
2. Şehir seç (if relevant).
3. Tercih edilen tarih/saat aralığı (2–3 seçenek).
4. İletişim + kısa not.
5. Onay → creates `consultation` (see `consultations`), sends confirmation, offers WhatsApp.
No payment. CHERIE DAY confirms a concrete slot back.

### 2.2 Quote request (`Teklif Al`)
For `quote_required` services and bespoke products.
1. Ne planlıyorsunuz? (event type)
2. Hangi hizmet(ler)? (multi-select service packages + addons)
3. Tarih / sezon.
4. Şehir / mekan tipi (ev / mekan / otel / dış mekan).
5. Tahmini davetli sayısı.
6. Konsept / koleksiyon ilhamı.
7. Bütçe aralığı (band).
8. Not + dosya/ilham yükleme (optional).
9. İletişim.
Output: `quote_request` (structured lead), internal brief summary, WhatsApp handoff. CHERIE DAY responds with a `quote` (priced proposal) the customer can accept.

### 2.3 Reservation request (`Rezervasyon Başlat`)
For `reservation_request` / `city_dependent_service`. This is the date-holding flow.
1. Hizmet paketi seç (+ addons).
2. Şehir + mekan bilgisi.
3. Etkinlik tarihi (availability-checked, §4).
4. Davetli sayısı.
5. Konsept/koleksiyon.
6. İletişim + brief notu.
7. Özet + `Hizmet ve Rezervasyon Şartları` onayı.
8. Gönder → creates `reservation` in `requested` status (date soft-held).
Depending on `deposit_model`, CHERIE DAY confirms and requests a deposit to move `requested → confirmed` (§6).

### 2.4 "Şehrimde hizmet var mı?" (city check)
City picker → if available, show packages + reservation/quote path; if not, capture demand as an `inquiry_only` lead (`source_type = city_waitlist`).

---

## 3. Service Data Model — Requests, Quotes, Reservations

### `consultations`
| id, consultation_number text unique, customer_id FK nullable, lead_id FK nullable, service_category, city_id FK nullable, preferred_slots jsonb (array of {date,time_range}), confirmed_slot jsonb nullable, channel enum(online, phone, whatsapp, in_person), status enum(requested, confirmed, completed, no_show, cancelled), note text, assigned_staff_id FK nullable, created_at |

### `quotes` (priced proposal issued by CHERIE DAY)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| quote_number | text unique | customer-facing |
| customer_id / lead_id | uuid FK | one required |
| quote_request_id | uuid FK nullable | originating request |
| items | jsonb | array of {service_package_id?, product_id?, addon_ids[], qty, description, unit_price, total} |
| event_type / event_date / city / venue / guest_count | fields | |
| subtotal / discount / travel_fee / total | numeric | TRY |
| deposit_required | numeric nullable | |
| valid_until | date | quote expiry |
| status | enum(draft, sent, viewed, accepted, declined, expired, converted) | |
| terms_version | text | which `Hizmet ve Rezervasyon Şartları` version |
| notes_customer / notes_internal | text | internal admin-only |
| created_by (staff) / created_at / updated_at | | |

Customer views accepted/sent quotes at `/hesap/tekliflerim`. Accepting a quote can create a `reservation` and/or a deposit `checkout_session`.

### `reservations`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| reservation_number | text unique | |
| customer_id | uuid FK | |
| service_package_id | uuid FK | |
| addon_ids | uuid[] | |
| quote_id | uuid FK nullable | if came from a quote |
| event_date | date | |
| event_time | text nullable | |
| city_id | uuid FK | |
| event_location | jsonb | {venue_name, address, type: ev/mekan/otel/dis_mekan, notes} — **service location, distinct from delivery address** |
| guest_count | int nullable | |
| collection_id | uuid FK nullable | |
| total_amount | numeric nullable | TRY, may be null until quoted |
| deposit_amount | numeric nullable | |
| deposit_paid_at | timestamptz nullable | |
| balance_due_date | date nullable | |
| status | enum(requested, quote_pending, confirmed, deposit_paid, in_planning, ready, in_progress, completed, cancelled, rescheduled, no_show) | §5 |
| cancellation_reason | text nullable | |
| assigned_staff_id | uuid FK nullable | internal |
| created_at / updated_at | | |

### `reservation_status_history`
| id, reservation_id FK, from_status, to_status, changed_by, note, changed_at |

### `service_briefs` (customer-supplied event brief)
| id, reservation_id FK, brief_json jsonb (theme, colors, must-haves, guest notes, music prefs, timeline wishes), uploaded_file_ids uuid[], updated_at |

### `service_milestones` (payment + delivery milestones)
| id, reservation_id FK, title_tr, type enum(deposit, interim_payment, final_payment, delivery_step, approval_step), amount numeric nullable, due_date date nullable, status enum(pending, paid, done, waived, overdue), payment_id FK nullable, sort_order |

### `service_checklists` (internal ops checklist per reservation)
| id, reservation_id FK, item_tr, is_done bool, owner_staff_id FK nullable, due_date nullable, sort_order | — admin-only.

**RLS:** customer reads own `consultations`, `quotes`, `reservations`, `service_briefs`, `service_milestones` (safe fields), never `service_checklists`, never internal notes, never assignments. Staff scoped by `sales_crm`/`operations`/`admin` (`23`).

---

## 4. Event-Date Availability

MVP availability is **capacity-based, admin-controlled**, not a real-time public calendar.
- `service_availability_blocks`: | id, service_category nullable, city_id nullable, date, capacity int, booked_count int, is_blackout bool, note | maintained by admin.
- Public reservation form checks: `min_lead_time_days` respected AND no matching `is_blackout=true` AND `booked_count < capacity` for that date/city/category.
- If uncertain, the date is offered as **"talep üzerine"** (request-based) rather than instant-confirmed; final confirmation is manual in MVP.
- No overbooking: a `requested` reservation soft-holds a slot for a configurable TTL (default 48h) before it expires back to capacity.

Admin surface = the **Reservation Calendar** (`45 §Reservations`).

---

## 5. Service Status Lifecycle (inquiry → completion)

```
requested → quote_pending → confirmed → deposit_paid → in_planning → ready → in_progress → completed
                                   ↘ cancelled   ↘ rescheduled   ↘ no_show
```

- `requested`: form submitted, date soft-held.
- `quote_pending`: needs a priced quote before confirming.
- `confirmed`: CHERIE DAY accepted the date; terms shown.
- `deposit_paid`: deposit milestone settled (§6).
- `in_planning`: brief collected, checklist active, milestones scheduled.
- `ready`: everything prepared for event date.
- `in_progress`: event day.
- `completed`: delivered; triggers post-event review + gallery request (§7).
- `cancelled` / `rescheduled` / `no_show`: with reason + policy applied.

Public customer-facing labels (Turkish): `Talep Alındı`, `Teklif Hazırlanıyor`, `Onaylandı`, `Ön Ödeme Alındı`, `Planlama Sürecinde`, `Hazır`, `Etkinlik Günü`, `Tamamlandı`, `İptal Edildi`, `Ertelendi`.

---

## 6. Deposits And Payment Milestones (services)

Services are usually **not** pay-in-full-upfront. Model:
- `deposit_model = none | fixed | percentage`. A percentage deposit computes off the quoted total.
- Deposit is paid via a dedicated deposit checkout (`/odeme/depozito/[reservation-number]`, see `43`) using the same payment providers.
- Remaining balance handled by `service_milestones` (interim/final), with `balance_due_date` typically N days before the event.
- Every deposit/milestone payment creates a `payments` row linked to the reservation (not an order); `orders` and `reservations` are sibling payables (`43 §Mixed payables`).
- **Refund/cancellation of deposits** follows `Hizmet ve Rezervasyon Şartları` (`42 §Legal`, lawyer-reviewed). Personalized/date-specific services may have non-refundable deposit windows — must be stated before the customer pays.

---

## 7. Post-Event Review And Gallery

On `completed`:
1. Customer gets a Turkish request to leave a `review` (see `42 §Reviews`) about the CHERIE DAY experience (never per-supplier).
2. Optional customer photo upload with **explicit KVKK consent** to publish (`42 §Legal`, consent stored). Without consent, photos are used internally only.
3. Approved reviews/photos may feed public `galleries` / `testimonials` / `portfolio_projects` after moderation (`45 §Moderation`).

---

## 8. Mixed Cart / Cross-Sell Rule

- A `reservation`/`quote` and a product `cart` can coexist for one customer but are **separate payables**; MVP does not merge a service deposit and a product order into one payment. Checkout rules in `43 §Mixed payables`.
- Service pages cross-sell matching products (`Koleksiyonunu Tamamla`: invitation + gift + tepsi) and matching digital items; product pages can surface `Bu ürünü bir organizasyon hizmetiyle tamamlayın` where relevant.

## 9. Admin Requirements (summary; full in `45`)

Reservation calendar, quote builder, service package + addon CRUD, city availability manager, deposit/milestone tracking, service brief viewer, internal checklist, status board, cancel/reschedule with policy + refund, post-event review/gallery moderation.

## 10. MVP Boundary For Services

- MVP ships: service showroom, city coverage, consultation, quote, reservation-request with deposit, brief collection, status tracking in account, post-event review request.
- MVP may keep **final date confirmation manual** (no public real-time calendar). Automated availability, staff auto-assignment, and supplier scheduling are Phase 2+ (`46`).
