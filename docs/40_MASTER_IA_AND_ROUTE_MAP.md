# MASTER INFORMATION ARCHITECTURE AND ROUTE MAP

This file is the **single canonical route map** for CHERIE DAY. It supersedes and completes the route fragments in `07_PLATFORM_ARCHITECTURE.md`, `15_INFORMATION_ARCHITECTURE.md`, and `13_SEO_BIBLE.md`. Where those files list fewer routes, this file wins. It exists because the mega-store/service scope in `37_MEGA_STORE_AND_SERVICE_ATLAS.md` was never fully expressed as routes.

This file does **not** touch the creative opening, hero, or homepage choreography. Homepage section order stays governed by `02`, `38`, and the frozen creative docs.

---

## 1. Locked Slug And Language Rule

- **URL path segments are stable ASCII, SEO-oriented slugs.** They do not change per campaign and are never localized at runtime.
- **All visible UI labels are Turkish-first** (per `19` label map). Slugs and labels are decoupled.
- Established top-level route keys are **locked** and must not be renamed: `shop`, `collections`, `experiences`, `digital`, `memory`, `planning`, `rehber`. Account/commerce routes stay Turkish: `hesap`, `secilimlerim`, `odeme`, `siparis-takip`.
- New service and legal trees introduced here (`hizmetler`, `kurumsal`, `yardim`) use Turkish slugs because they have no legacy English route.
- Turkish characters are transliterated in slugs (`nişan` → `nisan`, `düğün` → `dugun`, `şehir` → `sehir`).

## 2. Three-Way Public Separation (reconciles doc 15 vs doc 37)

Earlier docs blurred "Experiences" (service layer) with mega-store "Organizasyon Hizmetleri." They are now three distinct surfaces:

| Surface | Route base | Nature | Primary behavior | Example |
|---|---|---|---|---|
| **Deneyimler** (celebration worlds) | `/experiences/[event]` | Editorial, emotional, cross-linking hub per event type | Routes to products, collections, services, quote | `/experiences/dugun` |
| **Hizmetler** (service packages) | `/hizmetler/[service]`, `/hizmetler/sehir/[city]` | Concrete quotable/bookable services | `quote_required`, `reservation_request`, `city_dependent_service` | `/hizmetler/organizasyon` |
| **Mağaza** (products) | `/shop/[department]` | Purchasable/quotable objects | `cart_enabled`, `proof_required_cart`, `quote_required`, `inquiry_only` | `/shop/davetiye` |

Rule: a celebration `Experience` page aggregates and links to the matching `Hizmetler` and `Shop` items. It never becomes a checkout surface itself. Reservation and quote logic lives in `41_SERVICE_COMMERCE_AND_RESERVATION_SYSTEM.md`.

---

## 3. Canonical Route Table

### 3.1 Brand / Maison
| Route | Purpose | Data source |
|---|---|---|
| `/` | Brand entry + primary conversion hub (creative opening frozen in `38`). | homepage CMS blocks |
| `/maison` | Brand story, values, design philosophy. | `pages` |
| `/maison/nasil-calisir` | Process: keşfet → tasarla → üret → koordine et → teslim et. | `pages` |
| `/maison/dunyalar` | Worlds/collections overview entry. | `collections` |
| `/iletisim` | Contact + WhatsApp handoff. | `site_settings`, `contact_messages` |
| `/sss` | Public FAQ hub (label `SSS`). | `faqs` |

> Legacy `/contact` and `/faq` remain as **301 redirects** to `/iletisim` and `/sss` to keep the codebase consistent with the Turkish label rule. Builders may instead standardize on `/contact` + `/faq` slugs with Turkish labels — pick one and apply repo-wide; do not ship both live.

### 3.2 Experiences (celebration worlds)
| Route | Purpose |
|---|---|
| `/experiences` | All celebration types. |
| `/experiences/dugun` | Düğün. |
| `/experiences/nisan-soz` | Nişan & Söz. |
| `/experiences/isteme` | İsteme. |
| `/experiences/kina` | Kına. |
| `/experiences/nikah` | Nikah. |
| `/experiences/dogum-gunu` | Doğum Günü. |
| `/experiences/baby-shower` | Baby Shower. |
| `/experiences/gender-reveal` | Gender Reveal / Bebek Kutlaması. |
| `/experiences/kurumsal` | Kurumsal / Özel Etkinlik (where approved). |
| `/experiences/ozel-davetler` | Özel Davetler. |

### 3.3 Mağaza / Product House (all mega-store departments)
Top level: `/shop`. Departments below are the locked day-one department slugs. Each maps to a `category` with `department`-level grouping (see `42`).

| Route | Department (public label) |
|---|---|
| `/shop/davetiye` | Davetiye & Basılı Ürünler |
| `/shop/dijital-davetiye` | Dijital Davetiye |
| `/shop/hediyelik` | Hediyelikler & Nikah Şekeri |
| `/shop/nisan-soz` | Nişan, Söz & İsteme Ürünleri |
| `/shop/nisan-tepsisi` | Nişan / Söz Tepsisi |
| `/shop/yuzukler` | Yüzükler & Aksesuarlar |
| `/shop/kutu-paketleme` | Kutu & Paketleme |
| `/shop/muhur-kurdele` | Mühür & Kurdele |
| `/shop/masa-kartlari` | Masa Kartı & Event Stationery |
| `/shop/menu` | Menü Kartları |
| `/shop/karsilama-panosu` | Karşılama Panosu |
| `/shop/qr-kart` | QR Kart |
| `/shop/hatira-album` | Hatıra & Albüm |
| `/shop/mum` | Mum & Kokulu Objeler |
| `/shop/gelin-hazirligi` | Gelin Hazırlığı |
| `/shop/setler` | Koleksiyon Setleri |
| `/shop/[department]/[product-slug]` | Product detail. |

Cross-cutting shopping entries (not new departments, they are filtered views):
| Route | Purpose |
|---|---|
| `/shop/koleksiyon/[collection-slug]` | Shop filtered to one collection world. |
| `/shop/etkinlik/[event-slug]` | Shop filtered by celebration need (`Düğünüm için`, `Nişan & Söz için`, …). |
| `/shop/yeni` | Yeni Eklenenler. |
| `/shop/one-cikanlar` | Öne Çıkan Seçimler. |

### 3.4 Hizmetler (service packages + city services)
| Route | Purpose | Behavior |
|---|---|---|
| `/hizmetler` | Service showroom overview. | — |
| `/hizmetler/organizasyon` | Event organization concepts. | quote/reservation |
| `/hizmetler/nisan-organizasyon` | Nişan/söz/isteme setup. | quote/reservation |
| `/hizmetler/dogum-gunu-organizasyon` | Birthday concepts. | reservation |
| `/hizmetler/baby-shower-organizasyon` | Baby shower / gender reveal. | reservation |
| `/hizmetler/dekor-konsept` | Decor, backdrop, welcome table, table styling. | quote |
| `/hizmetler/muzik-dj` | DJ / live band / music. | inquiry/reservation |
| `/hizmetler/foto-video` | Photo / film / drone / reels (public = CHERIE DAY film ekibi). | quote |
| `/hizmetler/[service-slug]` | Service package detail. | per package |
| `/hizmetler/sehir` | City coverage overview + city picker. | — |
| `/hizmetler/sehir/[city-slug]` | Services available in a city. | city_dependent_service |

`/memory/*` (film/photo marketing narrative) remains as the editorial memory house per `02`/`07`; `/hizmetler/foto-video` is its bookable/quotable commercial counterpart. Both link to each other.

### 3.5 Digital
| Route | Purpose |
|---|---|
| `/digital` | Digital Love Stories overview. |
| `/digital/dijital-davetiye` | Digital invitation. |
| `/digital/dugun-web-sitesi` | Wedding website (inquiry-only in MVP). |
| `/digital/rsvp` | RSVP (marketing in MVP). |
| `/digital/qr` | QR guest cards. |
| `/digital/misafir-listesi` | Guest list (marketing in MVP). |

### 3.6 Memory
`/memory`, `/memory/photo`, `/memory/film`, `/memory/drone`, `/memory/reels`, `/memory/love-story`, `/memory/event-trailer`.

### 3.7 Planning / Concierge
| Route | Purpose |
|---|---|
| `/planning` | Planning suite overview. |
| `/planning/hayalini-tasarla` | Tailor/quiz brief flow (main conversion engine). |
| `/planning/kontrol-listesi` | Checklist preview. |
| `/planning/butce-rehberi` | Budget guide. |
| `/planning/zaman-akisi` | Timeline. |
| `/teklif` | Full quote request (replaces `/quote-request`; keep `/quote-request` as redirect). |
| `/randevu` | Consultation booking entry (see `41`). |

### 3.8 Koleksiyonlar
`/collections`, `/collections/[slug]` (cherry-seal, ivory-letter, maison-rouge, lace-memory, velvet-promise, noir-cherie, pearl-ceremony).

### 3.9 Rehber (SEO editorial)
`/rehber`, `/rehber/[article-slug]`. Seed slugs in `27`. Never build city/vendor directory pages (`13`).

### 3.10 Arama (Search) — NEW
| Route | Purpose |
|---|---|
| `/arama` | Global search results (products, services, collections, experiences, rehber). |
| `/arama?q=...&tur=urun|hizmet|koleksiyon|rehber&...filters` | Query + facet params. |

Search behavior, tokenization, Turkish-character tolerance, and the no-result state are specified in `44_UX_STATE_AND_MICROCOPY_MATRIX_TR.md §Search`.

### 3.11 Hesabım (customer account)
`/hesap/giris`, `/hesap/kayit`, `/hesap/sifremi-unuttum`, `/hesap`, `/hesap/siparisler`, `/hesap/siparisler/[order-number]`, `/hesap/rezervasyonlar`, `/hesap/rezervasyonlar/[reservation-number]`, `/hesap/tekliflerim`, `/hesap/dijital`, `/hesap/tasarim-onaylari`, `/hesap/adresler`, `/hesap/favoriler`, `/hesap/degerlendirmelerim`, `/hesap/destek`, `/hesap/destek/[thread-id]`, `/hesap/bildirimler`, `/hesap/tercihler` (consent/marketing), `/siparis-takip` (public order tracking).

New vs legacy: `rezervasyonlar`, `tekliflerim`, `dijital`, `favoriler`, `degerlendirmelerim`, `bildirimler`, `tercihler` are added for the mega-store/service scope.

### 3.12 Sepet / Ödeme (cart + checkout)
`/secilimlerim` (cart), `/odeme` (checkout), `/odeme/basarili`, `/odeme/basarisiz`, `/odeme/beklemede` (3DS/bank-transfer pending). Service deposit checkout: `/odeme/depozito/[reservation-number]` (see `43`).

### 3.13 Kurumsal / Yasal (legal) — NEW route tree
All legal pages get real routes with consent placement. Content model + versioning in `42 §Legal Documents`.

| Route | Document |
|---|---|
| `/kurumsal/kvkk-aydinlatma` | KVKK Aydınlatma Metni |
| `/kurumsal/gizlilik` | Gizlilik Politikası |
| `/kurumsal/cerez-politikasi` | Çerez Politikası |
| `/kurumsal/cerez-tercihleri` | Çerez Tercihleri (also a modal) |
| `/kurumsal/acik-riza` | Açık Rıza Metni |
| `/kurumsal/kullanim-kosullari` | Kullanım Koşulları |
| `/kurumsal/on-bilgilendirme` | Ön Bilgilendirme Formu (template; per-order rendered copy stored on order) |
| `/kurumsal/mesafeli-satis` | Mesafeli Satış Sözleşmesi (template; per-order copy stored) |
| `/kurumsal/iade-iptal` | İade ve İptal Politikası |
| `/kurumsal/teslimat` | Teslimat Politikası |
| `/kurumsal/kisisellestirilmis-urun-sartlari` | Kişiselleştirilmiş Ürün ve Tasarım Onayı Şartları |
| `/kurumsal/hizmet-rezervasyon-sartlari` | Hizmet ve Rezervasyon Şartları (deposit/cancellation for services) |
| `/kurumsal/satici-bilgileri` | Satıcı Bilgileri |

### 3.14 Yardım / Help Center (public, pre-login) — NEW
| Route | Purpose |
|---|---|
| `/yardim` | Help center hub: shipping, proof, returns, payment, digital delivery, services. |
| `/yardim/[topic-slug]` | Help topic article (distinct from Rehber SEO content: operational help). |
| `/yardim/siparisim` | Guided order-help entry (routes to `/siparis-takip` or support). |

### 3.15 Admin
Root `/admin`. Full module route list in `45_ADMIN_OPERATIONS_EXPANSION.md`. Admin is never in `sitemap.xml` and is `noindex`.

### 3.16 System routes
`/sitemap.xml` (+ per-module sitemaps in `13`), `/robots.txt`, `/api/*` (server routes: payment webhooks, cart, checkout, leads, reservations, proof actions), `/not-found` (404, Turkish), `/hata` (500 fallback, Turkish).

---

## 4. Navigation Surfaces

### 4.1 Primary desktop nav (restrained; per `02`)
`Deneyimler` · `Koleksiyonlar` · `Mağaza` · `Hizmetler` · `Dijital` · `Hatıra` · `Planlama` · `Rehber`
Utility: `Arama` · `Hesabım` · `Seçimlerim` · WhatsApp. Primary CTA: `Hayalini Tasarla`.

> `Hizmetler` is added to primary nav because the service business is ~half the platform and previously had no clear entry.

### 4.2 Mega-menu columns
Deneyimler | Mağaza (by department) | Hizmetler (by service + city) | Dijital & Hatıra | Planlama. Featured callout: `Hayalini Tasarla`. No vendor/provider language.

### 4.3 Mobile drawer (extends `31` labels)
`Deneyimler`, `Koleksiyonlar`, `Mağaza`, `Hizmetler`, `Dijital`, `Hatıra`, `Planlama`, `Rehber`, `Şehir Hizmetleri`, `İletişim`, `Hesabım`, `Seçimlerim`, `Sipariş Takibi`, `Yardım`. WhatsApp action pinned.

### 4.4 Footer groups (extends `15`)
Add a **Yasal** column (all `/kurumsal/*`), a **Yardım** column, and a **Hizmetler** column to the existing footer groups. Cookie-preferences link (`Çerez Tercihleri`) must be reachable from the footer on every page.

---

## 5. Breadcrumbs

Every non-home page renders `BreadcrumbList` schema. Patterns:
- Product: `Mağaza / [Departman] / [Ürün]`
- Service: `Hizmetler / [Hizmet]` or `Hizmetler / Şehir / [Şehir] / [Hizmet]`
- Collection: `Koleksiyonlar / [Koleksiyon]`
- Rehber: `Rehber / [Başlık]`

## 6. Redirect / Canonical Rules

- `/quote-request` → `/teklif`, `/contact` → `/iletisim`, `/faq` → `/sss` (301, or standardize the other direction — one decision, repo-wide).
- Collection- and event-filtered shop views set `rel=canonical` to the primary department/collection page; filter permutations are `noindex` (`13` sitemap rule).
- City service pages are real indexable pages only where CHERIE DAY genuinely serves that city; do not autogenerate thin city pages (`13`).

## 7. Route → System → Data Cross-Check (builder acceptance)

Every route above must resolve to: (1) one of the five systems in `02`, (2) a data source in `08`/`42`, and (3) a defined empty/loading/error state in `44`. A route with no data source or no defined states is not build-ready.
