# MVP PRODUCT CATALOG AND COMMERCE RULES

This file defines day-one product behavior so implementation does not guess.

## Product Behavior Types

| Type | Meaning | Checkout |
|---|---|---|
| `cart_enabled` | Standardized product with clear price, production time, return terms. | Allowed |
| `proof_required_cart` | Product can be paid online but production starts after proof approval. | Allowed with proof rules |
| `quote_required` | Bespoke/custom item needs consultation before price/payment. | No direct checkout |
| `inquiry_only` | Service, event, or high-touch offering. | No direct checkout |
| `digital_checkout` | Digital product/design can be purchased or customized online. | Allowed with digital/proof rules |
| `reservation_request` | Service/date/city based offering starts with reservation request. | No direct checkout in MVP |
| `city_dependent_service` | Availability depends on city, date, venue, and service team. | No direct checkout in MVP |

## Day-One Categories

| Category | Initial behavior |
|---|---|
| Davetiye | proof_required_cart or quote_required |
| Dijital Davetiye | proof_required_cart for simple package; quote_required for bespoke |
| Düğün Web Sitesi | inquiry_only in MVP |
| Hediyelik / Nikah Şekeri | cart_enabled for standard sets; quote_required for bespoke |
| Wax Seal / Ribbon | cart_enabled if standardized |
| Kutu / Packaging | cart_enabled or quote_required depending on personalization |
| Masa Kartı / Event Stationery | proof_required_cart |
| QR Kart | proof_required_cart |
| Hatıra / Albüm | inquiry_only or quote_required |
| Planning / Experiences | inquiry_only |
| Nişan & Söz Hediyelikleri | cart_enabled for standard sets; quote_required for bespoke |
| Nişan Tepsisi / Söz Tepsisi | cart_enabled, proof_required_cart, or quote_required depending on personalization |
| İsteme Setleri | cart_enabled or quote_required |
| Yüzükler & Aksesuarlar | inquiry_only or quote_required unless fixed price/stock/legal rules are ready |
| Evlilik Teklifi Kutuları / Gift Boxes | cart_enabled or quote_required |
| Organizasyon Hizmetleri | reservation_request, city_dependent_service, or inquiry_only |
| Doğum Günü Konseptleri | reservation_request or quote_required |
| Baby Shower / Gender Reveal | reservation_request or quote_required |
| DJ / Müzik / Band | inquiry_only or reservation_request |
| Fotoğraf Alanı / Backdrop / Dekor | quote_required or reservation_request |

## Large Catalog Requirement

The catalog must be designed to scale, not hardcoded as a small starter shop.

Expected scale:

- 200+ physical invitation designs,
- many digital invitation designs,
- dozens/hundreds of gift and favor products,
- multiple engagement/söz/isteme product families,
- rings/accessories where offered,
- many service concepts and city-based organization flows.

The implementation must support departments, subcategories, collections, event types, and service availability.

## Required Product Fields

Every product must have:

- Turkish name,
- slug,
- category,
- collection relation optional,
- product behavior type,
- price or price band,
- production time,
- personalization fields,
- proof requirement,
- delivery note,
- return/cancellation note,
- at least 3 images before launch,
- SEO title/description,
- related products.

## Checkout Eligibility

Product can be checkout-enabled only if:

- price is fixed,
- production time is stated,
- return/cancellation terms are stated,
- proof requirement is stated,
- delivery method is available in Turkey,
- legal acceptance text is ready,
- stock/made-to-order status is clear.

## Proof Rules

- Standard proof includes 1 initial design + 1 revision.
- Additional revisions require manual approval or extra fee.
- Production starts after customer approval where proof is required.
- No proof silence auto-approval in MVP.

## Price Display

Allowed:

- exact TRY price for checkout products,
- `Teklif ile` for quote-required,
- price band labels for luxury/bespoke pages.

Not allowed:

- fake discounts,
- countdown urgency,
- "from" pricing without explanation,
- marketplace-like price comparison.
