# PAYMENT AND TURKISH LEGAL RESEARCH

This file records the current payment/legal direction for CHERIE DAY. It is an implementation brief, not final legal advice. Final policies and contracts must be reviewed by a Turkish lawyer/accountant before launch.

## 1. Payment Decision

CHERIE DAY commerce is Turkey-only for shipping, customer service, legal operations, pricing, and launch scope. Payment should support Turkish domestic cards and foreign-issued cards where the Turkish payment provider and merchant account allow it. Accepting a foreign-issued card does **not** make the MVP an international store.

Required payment support:

- Turkish domestic debit/credit cards
- TROY for Turkey
- Visa and Mastercard where supported by the chosen provider and merchant agreement
- American Express where supported by the chosen provider and merchant agreement
- foreign-issued Visa/Mastercard/AMEX cards where provider and fraud settings allow
- 3D Secure / 3DS
- payment webhooks/callbacks
- refund records
- payment event logs
- bank transfer fallback if needed

MVP boundary:

- delivery address: Turkey only,
- billing/customer contact model: Turkey-first,
- storefront language: Turkish only,
- legal documents: Turkish law/KVKK oriented,
- default display currency: TRY,
- no international shipping promise,
- no international storefront/e-export promise.

## 2. Provider Direction

### Recommended Architecture

Build a provider abstraction that can support both iyzico and PayTR:

- `payment_provider = iyzico | paytr | bank_transfer | manual`
- provider-specific payment id,
- normalized status,
- raw webhook payload stored admin-only,
- customer sees only safe payment status.

### Primary Recommendation

Use **iyzico as primary** if the business wants a polished card checkout, card storage potential, and strong support for Visa/Mastercard/AMEX/TROY in one payment architecture.

Use **PayTR as secondary/fallback** if the business wants broad Turkey virtual POS options, payment link/manual collection flexibility, bank transfer/EFT support, or provider redundancy.

### Why

iyzico documentation states card payments support TROY, Mastercard, Visa, and AMEX, including 3DS flows. iyzico also documents sandbox foreign-card test cases and card storage.

PayTR documentation describes secure online payment collection, foreign card/payment scenarios, Visa/Mastercard/AMEX card compatibility in relevant product contexts, and bank transfer/EFT options. PayTR also supports card storage APIs and payment links.

## 3. Domestic And Foreign Card Rule

Public UI should say:

`Türkiye içi siparişlerde TROY, Visa, Mastercard ve desteklenen American Express kartlarıyla güvenli ödeme`

Short checkout variant:

`Türkiye içinde güvenli ödeme`

But implementation must verify:

- AMEX availability in the merchant agreement,
- foreign-issued card enablement for Turkey-only orders,
- TRY display/settlement rules,
- fraud/3DS settings,
- installment availability only where legally/provider-supported,
- whether foreign-issued cards pay in TRY and how issuer-side conversion is communicated.

MVP store remains:

- Turkey delivery only,
- TRY pricing,
- Turkish legal documents,
- Turkish checkout language.

The public site must not imply:

- international shipping,
- e-export operations,
- global delivery,
- foreign-language checkout,
- cross-border tax handling,
- multi-currency storefront pricing.

## 4. Required Legal Pages And Documents

Before launch, prepare Turkish legal pages:

- `Gizlilik Politikası`
- `KVKK Aydınlatma Metni`
- `Açık Rıza Metni` where optional processing requires consent
- `Çerez Politikası`
- `Çerez Tercihleri`
- `Kullanım Koşulları`
- `Ön Bilgilendirme Formu`
- `Mesafeli Satış Sözleşmesi`
- `İade ve İptal Politikası`
- `Teslimat Politikası`
- `Tasarım Onayı ve Kişiselleştirilmiş Ürün Şartları`
- `İletişim ve Satıcı Bilgileri`

Legal language must be drafted in polished Turkish, but it must not become poetic where precision is required. Checkout and policy pages can carry warm CHERIE DAY microcopy around the legal text; the actual legal clauses must stay clear, complete, and lawyer-reviewable.

## 5. KVKK Requirements To Model

The site must separate:

- required processing for account/order/contract performance,
- legal obligation processing,
- optional marketing consent,
- optional cookie/analytics consent,
- optional explicit consent where required.

Data flows to document:

- customer account,
- orders,
- addresses,
- payments,
- support messages,
- uploaded personalization files,
- proof approval,
- marketing/newsletter,
- analytics/cookies,
- provider transfers: payment provider, cargo company, email/SMS/WhatsApp provider, hosting/Supabase.

Implementation requirements:

- store consent timestamps,
- store policy version accepted,
- do not bundle explicit consent with privacy notice,
- allow cookie accept/reject/configure,
- allow marketing consent to be optional,
- publish data controller identity and contact.

## 6. Distance Sales And Return/Cancellation

For online sales in Turkey, the checkout must show pre-contract information and distance sales terms before payment confirmation.

Required checkout steps:

- show product/service identity and total price,
- show delivery/production timing,
- show seller details,
- show payment method,
- show cancellation/return rules,
- require acceptance of `Ön Bilgilendirme Formu`,
- require acceptance of `Mesafeli Satış Sözleşmesi`,
- store timestamp, order id, IP/user agent where appropriate.

Important legal direction:

- Standard distance-sales withdrawal right is generally 14 days.
- Seller refund timing and customer return obligations must follow current Turkish consumer rules.
- Personalized/made-to-order products may need special return/withdrawal wording and lawyer review.
- Digital services/assets must state when performance/delivery starts and whether withdrawal exceptions apply.

## 7. Cookie Consent

Cookie implementation must:

- distinguish strictly necessary cookies from analytics/marketing cookies,
- avoid firing optional cookies before consent,
- provide accept/reject/configure actions,
- link to `Çerez Politikası`,
- store user preference logs,
- allow preference changes later.

## 8. Design Integration

Legal/payment UX must stay CHERIE DAY:

- no cold legal dump in checkout,
- clear Turkish labels,
- concise explanatory microcopy,
- full documents available in expandable panels or links,
- acceptance checkboxes near payment confirmation,
- payment failure recovery written warmly and precisely.

Example:

`Ödemenizi güvenle tamamlamadan önce ön bilgilendirme ve mesafeli satış şartlarını sizin için açıkça sunuyoruz.`

## 9. Sources Used

- KVKK official site and legislation pages.
- KVKK cookie guide and cookie-related board decision summaries.
- KVKK explicit consent guidance.
- Turkish Ministry of Trade consumer guidance on distance contracts.
- Consolidated distance contracts regulation references.
- iyzico official docs for cards, 3DS, test cards, logo/card association, card storage.
- PayTR developer and product docs for virtual POS, foreign-issued cards, payment links, bank transfer/EFT, and card storage.

Primary source links used during research:

- KVKK official site: https://www.kvkk.gov.tr/
- KVKK Personal Data Protection Law page: https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law
- KVKK cookie guide PDF: https://www.kvkk.gov.tr/SharedFolderServer/CMSFiles/fb193dbb-b159-4221-8a7b-3addc083d33f.pdf
- KVKK explicit consent guidance: https://www.kvkk.gov.tr/Icerik/2037/Acik-Riza-Alirken-Dikkat-Edilecek-Hususlar
- KVKK cookie decision summary: https://www.kvkk.gov.tr/Icerik/7595/2022-1358
- Turkish Ministry of Trade distance contracts guide: https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/mesafeli-sozlesmeler-hakkinda-bilgilendirme
- Mesafeli Sözleşmeler Yönetmeliği reference: https://www.lexpera.com.tr/mevzuat/yonetmelikler/mesafeli-sozlesmeler-yonetmeligi
- iyzico card payment docs: https://docs.iyzico.com/odeme-metotlari/api/non-3ds/non-3ds-entegrasyonu/odeme-olusturma
- iyzico 3DS docs: https://docs.iyzico.com/odeme-metotlari/api/3ds/3ds-entegrasyonu/3ds-baslatma
- iyzico test cards: https://docs.iyzico.com/ek-bilgiler/test-kartlari
- iyzico card storage: https://docs.iyzico.com/on-hazirliklar/api-reference-beta/kart-saklama
- PayTR developer center: https://dev.paytr.com/
- PayTR bank transfer/EFT API: https://dev.paytr.com/havale-eft-iframe-api
- PayTR card storage API: https://dev.paytr.com/direkt-api/kart-saklama-api/yeni-kart-ekleme
- PayTR BIN/test card docs: https://dev.paytr.com/direkt-api/bin-sorgulama-servisi
