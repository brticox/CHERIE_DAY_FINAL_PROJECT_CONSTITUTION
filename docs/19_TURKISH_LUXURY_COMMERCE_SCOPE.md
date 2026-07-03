# TURKISH LUXURY COMMERCE SCOPE

This file records the updated product decision: CHERIE DAY must be a Turkish-first luxury Maison with a complete Turkey-only commerce system, not only an inquiry catalog.

## 1. Language Rule

All public customer-facing website language is Turkish.

This includes:

- navigation,
- homepage,
- hero copy,
- product pages,
- collection pages,
- forms,
- cart,
- checkout,
- account,
- order tracking,
- payment screens,
- emails/SMS/WhatsApp templates when authored by CHERIE DAY,
- empty states,
- error messages,
- success messages,
- legal and consent pages.

EN/AR can be future localization layers, but they are not MVP source languages.

## 1.1 Public Turkish Label Map

Use these public labels in MVP:

| Concept | Public Turkish Label |
|---|---|
| Maison / brand story | `Maison` or `CHERIE DAY Maison` |
| Experiences | `Deneyimler` |
| Collections | `Koleksiyonlar` |
| Shop / Product House | `Mağaza` or `Maison Ürünleri` |
| Digital | `Dijital` |
| Memory | `Hatıra` |
| Planning | `Planlama` |
| Journal / Blog | `Rehber` |
| Contact | `İletişim` |
| Account | `Hesabım` |
| Login | `Giriş Yap` |
| Register | `Üye Ol` |
| Cart | `Seçimlerim` |
| Checkout | `Güvenli Ödeme` |
| Order summary | `Sipariş Özeti` |
| Orders | `Siparişlerim` |
| Order tracking | `Sipariş Takibi` |
| Support | `Destek` |
| Product inquiry | `Ürün Hakkında Sor` |
| Proof approval | `Tasarım Onayı` |

Avoid public English labels such as `Shop`, `Cart`, `Checkout`, `Login`, `Register`, `Journal`, `Account`, `Orders`, `Support`, `Submit`, unless they are part of an intentional collection/world name.

## 2. Voice Rule

The Turkish voice must feel:

- literary but clear,
- luxurious but not cold,
- poetic when the moment is emotional,
- spontaneous and close to the heart when the user needs warmth,
- premium without sounding artificial,
- commercially precise when the user is paying, approving, tracking, or asking for help.

The voice should never become:

- stiff corporate Turkish,
- literal English translation,
- childish,
- overly cute,
- marketplace language,
- discount-driven,
- robotic admin language.

## 3. Commerce Geography

The store, checkout, payment, shipping, tax, and order operations are **Turkey-only** for MVP commerce.

MVP commerce serves:

- Turkey billing addresses,
- Turkey delivery addresses,
- Turkey phone numbers,
- Turkey payment providers,
- Turkish legal/KVKK requirements,
- Turkish order and delivery language.

International shipping, international storefront operations, multi-currency storefronts, EN/AR storefronts, and cross-border tax flows are future-only. Foreign-issued cards may be accepted only for Turkey-only orders where the payment provider and merchant settings allow it.

## 4. Required Customer Account System

The site must include:

- register,
- login,
- logout,
- forgot password or magic-link recovery,
- account dashboard,
- profile details,
- saved addresses,
- order history,
- order detail,
- payment status,
- shipment/delivery status,
- proof approval status where relevant,
- product and order inquiries,
- support/contact messages.

Recommended routes:

- `/hesap/giris`
- `/hesap/kayit`
- `/hesap`
- `/hesap/siparisler`
- `/hesap/siparisler/[order-number]`
- `/hesap/adresler`
- `/hesap/destek`
- `/siparis-takip`

## 5. Required Commerce System

The CHERIE DAY store must support:

- product listing,
- product detail,
- variants,
- personalization fields,
- cart / `Seçimlerim`,
- customer account checkout,
- guest checkout only if legal/security review approves it,
- delivery address,
- billing address,
- Turkey shipping methods,
- production time,
- payment provider integration,
- order creation,
- order confirmation,
- order tracking,
- payment status,
- shipment status,
- inquiry/support per order,
- proof approval for personalized products,
- admin order management.

## 6. Turkey Payment Direction

Preferred provider decision must be Turkey-first:

- primary provider: iyzico if polished card checkout, 3DS, TROY/domestic card support, foreign-issued card support where enabled, and card storage are prioritized,
- secondary/fallback provider: PayTR for provider redundancy, payment links, bank transfer/EFT, and broad Turkey virtual POS options,
- bank transfer can exist as a fallback/manual method,
- Stripe is not primary for Turkey MVP unless business/legal constraints require it.

Card support must include Turkish domestic debit/credit cards, TROY, Visa, Mastercard, and American Express where the provider/merchant agreement supports it. Foreign-issued Visa/Mastercard/AMEX cards should be enabled where provider risk settings allow, while pricing, delivery, legal operation, and customer service remain Turkey-only.

Payment implementation must include:

- secure checkout session,
- webhook/callback handling,
- payment event log,
- failed payment recovery,
- refund record support,
- audit log for manual payment status changes.

## 7. UX Benchmark

The commerce flow should have the completeness users expect from major retail sites such as IKEA-style account/order flows:

- clear product pages,
- clear cart,
- clear checkout steps,
- clear delivery expectations,
- clear order status,
- easy account access,
- easy inquiry/support entry,
- reassuring payment and confirmation states.

But the feeling must remain CHERIE DAY:

- calmer,
- more editorial,
- more refined,
- warmer,
- less warehouse-like,
- never marketplace-like.

## 8. MVP Commerce Boundary

Updated MVP commerce includes:

- customer auth,
- account dashboard,
- cart,
- checkout,
- Turkey-only payment,
- Turkey-only shipping,
- orders,
- order tracking,
- payment status,
- customer inquiries,
- admin order management,
- proof approval for personalized products.

Still future-only:

- international shipping,
- international storefront operations,
- multi-currency storefronts,
- public vendor/supplier modules,
- marketplace behavior,
- self-serve wedding website builder,
- live RSVP and guest-list tools unless separately scoped,
- advanced recommendation engine,
- abandoned cart automation beyond basic admin visibility.
