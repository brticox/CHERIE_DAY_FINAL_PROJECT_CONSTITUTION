# MVP PRODUCT CATALOG AND COMMERCE RULES

This file defines day-one product behavior so implementation does not guess.

## Product Behavior Types

| Type | Meaning | Checkout |
|---|---|---|
| `cart_enabled` | Standardized product with clear price, production time, return terms. | Allowed |
| `proof_required_cart` | Product can be paid online but production starts after proof approval. | Allowed with proof rules |
| `quote_required` | Bespoke/custom item needs consultation before price/payment. | No direct checkout |
| `inquiry_only` | Service, event, or high-touch offering. | No direct checkout |

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

