# CHERIE DAY - AI Open First General Build Order

This is the first file any AI builder must open.

It is a general constitution for the product, business, commerce, language, brand, and implementation system.
It is intentionally not a hero art-direction file.

## 1. What CHERIE DAY Is

CHERIE DAY is a Turkey-only luxury wedding, invitation, gift, digital memory, organization, and celebration commerce maison.

It must function as a serious modern ecommerce and service platform with:

- public website,
- store,
- product detail pages,
- cart,
- checkout,
- login/register,
- customer account,
- order tracking,
- proof approval,
- support/inquiry,
- admin system,
- legal pages,
- payment provider integration surfaces.

It must be understood as a large store and service showroom, not a small invitation shop.
It includes printed products, digital products, gifts, accessories, engagement/söz/isteme products, rings, organization services, city-based service flows, galleries, reviews, and quote/reservation journeys.

## 2. What This File Must Not Do

This file must not prescribe a specific hero concept, scene, animation, video, object sequence, or art direction.

The opening experience will be separately directed by the creative agent using approved brand assets, skills, and references.

Do not infer that any previous hero idea is mandatory.
Do not copy any old prototype.
Do not use rejected Kimi output as design direction.

## 3. Language Rule

All public customer-facing UI and website copy must be Turkish.

The Turkish voice must be:

- refined,
- warm,
- elegant,
- clear,
- commercially useful,
- sometimes poetic when appropriate,
- never cold, robotic, or machine-like.

Admin/internal developer labels may use English where practical, but admin user-facing labels may also be Turkish.

## 4. Brand Rule

Use the provided CHERIE DAY logo, monogram, stamp, and identity assets exactly.

Do not redraw, distort, stretch, recolor carelessly, blur, morph, regenerate, or reinterpret official brand marks.

Canonical brand sources are in:

- `assets/brand-source/logo.svg`
- `assets/brand-source/logooo.svg`
- `assets/brand-source/CDD.svg`
- `assets/brand-source/stamp.svg`

## 5. Creative Freedom Rule

The creative director/AI is free to propose the opening experience, visual world, motion system, scene concept, 2D/3D approach, generated assets, and interaction language.

That creative work must be delivered as a separate concept/storyboard/spec before implementation.

The constitution only requires that the result:

- belongs to CHERIE DAY,
- supports luxury commerce,
- uses the brand correctly,
- performs well,
- works on mobile,
- remains accessible,
- does not block shopping or service conversion.

## 6. Store Structure

The public store must include:

- homepage commerce highlights,
- collection pages,
- category pages,
- product listing pages,
- product detail pages,
- quick view,
- cart drawer/page,
- checkout,
- account,
- login/register,
- order tracking,
- proof approval,
- support/inquiry,
- legal consent checkpoints.

Core commerce categories:

- Davetiye,
- Dijital Davetiye,
- Hediyelik & Nikah Sekeri,
- Mühür & Kurdele,
- Kutu & Packaging,
- Masa Kartı & Event Stationery,
- QR Kart,
- Hatıra & Albüm,
- Nişan & Söz,
- İsteme,
- Nişan Tepsisi,
- Yüzükler & Aksesuarlar,
- Organizasyon,
- Doğum Günü,
- Baby Shower,
- Müzik & DJ,
- Şehir Hizmetleri,
- Planlama / Özel Teklif.

Product behavior types:

- normal cart product,
- proof-required custom product,
- digital delivery product,
- quote-required service,
- inquiry-only premium item,
- reservation-request service,
- city-dependent service.

## 7. Checkout And Payments

Service and commerce are Turkey-only.

Checkout must support:

- account or guest flow,
- Turkish address,
- delivery method,
- invoice details,
- proof/customization details where needed,
- payment provider selection,
- KVKK consent,
- Mesafeli Satış Sözleşmesi consent,
- Ön Bilgilendirme Formu consent,
- order confirmation,
- payment status page.

Payment planning must support:

- Turkish domestic cards,
- TROY where available,
- international Visa/Mastercard/AMEX where enabled by merchant settings,
- iyzico,
- PayTR.

## 8. Admin System

The admin must be a real operating system, not a cosmetic dashboard.

Required admin modules:

- dashboard,
- products,
- categories,
- collections,
- pricing,
- stock,
- media/assets,
- homepage/content management,
- orders,
- order statuses,
- payments,
- refunds/cancellations,
- proof approval workflow,
- customers,
- inquiries,
- support messages,
- coupons/campaigns,
- legal pages,
- SEO,
- settings,
- audit logs.

The admin must allow changing prices, products, images, stock, legal text, product behavior, payment status, order status, and homepage content.

## 9. Legal Pages

Build Turkish legal page structure for:

- KVKK Aydınlatma Metni,
- Mesafeli Satış Sözleşmesi,
- Ön Bilgilendirme Formu,
- İade ve İptal Politikası,
- Gizlilik Politikası,
- Çerez Politikası,
- Teslimat ve Kargo,
- Kullanıcı Sözleşmesi if account system requires it.

Legal text may start as structured placeholder text, but routes and consent placement must exist.

## 10. Preferred Stack

Preferred production stack:

- Next.js,
- TypeScript,
- Supabase/Postgres,
- Supabase Auth,
- Supabase Storage,
- RLS,
- server routes for payments,
- webhook handlers,
- Tailwind,
- motion library selected by implementation needs.

If a different stack is used, it must still deliver the same production capabilities.

## 11. Implementation Order

Build in this order:

1. App shell and route map.
2. Design tokens and brand-safe typography system.
3. Content model and database schema.
4. Storefront data model.
5. Product listing/detail/cart.
6. Account/auth.
7. Checkout skeleton with legal consent.
8. Admin shell.
9. Product/order/admin CRUD.
10. Payment provider integration surfaces.
11. Creative opening experience after separate concept approval.
12. QA across desktop/tablet/mobile.

## 12. Absolute Rejection Tests

Reject the build immediately if:

- it is only a visual landing page,
- store products are hardcoded only,
- cart does not connect to product actions,
- no login/register exists,
- no checkout exists,
- no admin exists,
- legal pages are only footer placeholders,
- public language is not Turkish,
- brand marks are distorted,
- design is copied from rejected old prototypes,
- the creative opening blocks performance, accessibility, or commerce.

## 13. Final Goal

The final platform must make the user feel they entered a refined Turkish luxury maison and can easily buy, customize, approve, track, or request beautiful CHERIE DAY products and services.
