# Information Architecture

This is the final CHERIE DAY IA for a Brand House / End-to-End Celebration Experience Brand.

> **Canonical route source:** `40_MASTER_IA_AND_ROUTE_MAP.md` is the authoritative, complete route map — it adds the mega-store departments (Nişan & Söz, Yüzükler, Organizasyon, etc.), the `/hizmetler` service tree, `/kurumsal` legal pages, `/yardim` help center, `/arama` search, and account favorites/reservations/notifications that this file predates. Where this file and `40` differ, `40` wins. The three-way public separation (Experiences vs Hizmetler vs Mağaza) is defined in `40 §2`.

## Public Navigation

- CHERIE DAY
  - Dünyalar
  - Maison Ürünleri
  - Süreç
  - Rehber
  - Gününü Tasarla
- Deneyimler
  - Düğün
  - Nişan & Söz
  - Kına
  - Nikah
  - Doğum Günü
  - Baby Shower
  - Kurumsal
- Özel Davetler
- Maison Ürünleri
  - Davetiye
  - Dijital Davetiye
  - Hediyelik
  - Mum
  - Magnet
  - Nişan Tepsisi
  - Kutu & Paketleme
  - Gelin Hazırlığı
  - Masa Kartları
  - Menü
  - Karşılama Panosu
  - Anı Defteri
  - QR Kartları
  - Teşekkür Kartları
- Koleksiyonlar
- Dijital
- Hatıra
- Planlama
- Rehber
- Teklif Al
- Hesabım
- Seçimlerim
- Sipariş Takibi

## Footer Navigation

- Maison: Hakkımızda, CHERIE DAY Nasıl Çalışır, SSS, İletişim
- Experiences: Düğün, Nişan & Söz, Kına, Nikah, Baby Shower, Kurumsal
- Mağaza / Maison Ürünleri: Davetiye, Hediyelik, Mum, Masa Kartları, QR Kartları
- Collections: Cherry Seal, Silk Garden, Pearl Ceremony, Ivory Letter, Lace Memory, Noir Chérie, Maison Rouge
- Dijital: Düğün Web Sitesi, Dijital Davetiye, RSVP, QR, Misafir Listesi
- Hatıra: Fotoğraf, Film, Drone, Reels, Etkinlik Fragmanı
- Planlama: Hayalini Tasarla, Kontrol Listesi, Bütçe Rehberi, Zaman Akışı, Teklif Talebi
- Rehber: key guide categories
- İletişim: WhatsApp, e-posta, Instagram, konum/hizmet alanı

## URL Structure

Brand:
- `/`
- `/maison`
- `/maison/how-it-works`
- `/maison/worlds`
- `/contact`
- `/faq`

Experiences:
- `/experiences`
- `/experiences/dugun`
- `/experiences/nisan-soz`
- `/experiences/kina`
- `/experiences/nikah`
- `/experiences/dogum-gunu`
- `/experiences/baby-shower`
- `/experiences/kurumsal`
- `/experiences/private-events`

Mağaza / Maison Ürünleri:
- `/shop`
- `/shop/davetiye`
- `/shop/dijital-davetiye`
- `/shop/hediyelik`
- `/shop/mum`
- `/shop/magnet`
- `/shop/nisan-tepsisi`
- `/shop/kutu-paketleme`
- `/shop/masa-kartlari`
- `/shop/menu`
- `/shop/welcome-sign`
- `/shop/guest-book`
- `/shop/qr-cards`
- `/shop/thank-you-cards`
- `/shop/[category]/[product-slug]`
- `/secilimlerim`
- `/odeme`
- `/odeme/basarili`
- `/odeme/basarisiz`

Hesabım:
- `/hesap/giris`
- `/hesap/kayit`
- `/hesap`
- `/hesap/siparisler`
- `/hesap/siparisler/[order-number]`
- `/hesap/adresler`
- `/hesap/destek`
- `/siparis-takip`

Collections:
- `/collections`
- `/collections/cherry-seal`
- `/collections/ivory-letter`
- `/collections/maison-rouge`
- `/collections/lace-memory`
- `/collections/velvet-promise`
- `/collections/noir-cherie`
- `/collections/pearl-ceremony`

Digital:
- `/digital`
- `/digital/wedding-website`
- `/digital/digital-invitation`
- `/digital/rsvp`
- `/digital/qr`
- `/digital/guest-list`

Memory:
- `/memory`
- `/memory/photo`
- `/memory/film`
- `/memory/drone`
- `/memory/reels`
- `/memory/love-story`
- `/memory/event-trailer`

Planning:
- `/planning`
- `/planning/hayalini-tasarla`
- `/planning/checklist`
- `/planning/budget-guide`
- `/planning/timeline`
- `/quote-request`

Rehber:
- `/rehber`
- `/rehber/evde-soz-fikirleri`
- `/rehber/nisan-masasi-trendleri`
- `/rehber/davetiye-modelleri`
- `/rehber/dugun-web-sitesi-rehberi`
- `/rehber/hediyelik-fikirleri`
- `/rehber/kina-gecesi-hazirligi`
- `/rehber/dugun-butcesi`
- `/rehber/turkiyede-dugun-planlama-rehberi`
- `/rehber/[article-slug]`

## Service Hierarchy

Public hierarchy:
Experiences are the public service layer. Each experience can connect to Product House, Collections, Digital, Memory, and Planning.

Internal hierarchy:
Services, packages, teams, suppliers, and production tasks are admin concepts only.

## Maison Ürünleri Hierarchy

- Product House
  - Category
  - Product
  - Variant
  - Personalization options
  - Cart / Seçimlerim
  - Checkout
  - Order
  - Proof approval
  - Shipment / delivery status
  - Matching collection
  - Related experience

## Collection Hierarchy

- Collection
  - Story/mood
  - Palette/materials
  - Products
  - Digital theme
  - Styling direction
  - Applicable experiences
  - Portfolio examples

## Digital Tools Hierarchy

- Digital
  - Wedding Website
  - Digital Invitation
  - RSVP
  - QR
  - Guest List
  - Countdown
  - Location Map
  - Couple Story
  - Gallery

## Blog / Rehber Hierarchy

- Rehber home
- Topic hub
- Article
- Related CHERIE DAY modules
- FAQ block
- CTA

## Admin Hierarchy

- Dashboard
- Products
- Collections
- Customers
- Orders
- Payments
- Shipments
- Proof Approvals
- Support Threads
- Services
- Experiences
- Packages
- Quote Requests
- Portfolio
- Gallery
- Articles
- FAQ
- Testimonials
- Site Settings
- Suppliers internal only
- Teams internal only
- Clients
- Leads
- CRM

## Future Client Portal Hierarchy

The customer account exists in MVP. The future client portal extends it for event-specific planning.

- Client dashboard
- Event profile
- Quote/proposal
- Timeline
- Checklist
- Files
- Guest list
- RSVP status
- Digital invitation/site preview
- Product approvals
- Payment/order history from the customer account
- Messages or notes

Client portal should still feel like CHERIE DAY, not a marketplace dashboard.
