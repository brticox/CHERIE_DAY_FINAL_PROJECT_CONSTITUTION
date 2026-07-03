# PRE-BUILD FREEZE

This file resolves the executive audit gaps that can be fixed before asset production. It is now part of the governing source of truth.

## 1. Final MVP Boundary

MVP 1 is:

- cinematic public Maison website,
- Turkish-first public content,
- homepage with layered hero once final hero assets are produced,
- Maison, Experiences, Collections, Shop, Digital, Memory, Planning, Rehber, Contact,
- full Turkey-only Product House commerce,
- customer registration and login,
- customer account dashboard,
- saved addresses,
- cart / `Seçimlerim`,
- checkout,
- Turkey-only payment integration,
- Turkey-only delivery/shipping,
- order history,
- order tracking,
- payment and shipment status,
- order/product inquiry and support flows,
- proof approval for personalized products,
- product inquiry forms,
- `Hayalini Tasarla`,
- quote request,
- contact and WhatsApp handoff,
- CMS for public content,
- CRM for leads and inquiries,
- admin order management,
- media library,
- SEO metadata and sitemap structure.

MVP 1 is not:

- live RSVP system,
- guest list management,
- self-serve wedding website builder,
- full digital product download/license system.
- international shipping,
- international payment/currency flows,
- EN/AR storefronts.

Those remain future phases unless explicitly re-scoped.

## 2. Final Public Editorial Route

The Turkish-first editorial hub is:

- `/rehber`
- `/rehber/[article-slug]`

Do not use `/journal` in MVP routes. If English content is added later, `/journal` may become an English alias or redirect strategy, but it is not the MVP canonical path.

## 3. Repository-Local Asset Rule

All implementation references must use repository-local files.

Use:

- `assets/hero-source/wedding-garden-background-source.mp4`
- `assets/hero-source/*.png`
- `assets/brand-source/*.svg`

Do not use:

- `/Users/.../Downloads/...`
- `/Users/.../Desktop/...`
- `/var/folders/...`
- clipboard temp paths,
- non-repository asset paths.

## 4. Asset Production Status

The current `/assets` files are source/reference assets.

They are not yet the final production hero kit. Before hero implementation, produce:

- final compressed MP4 loop,
- WebM fallback,
- poster image,
- transparent WebP/PNG foreground layers,
- mobile-safe layer art direction,
- optimized SVG brand exports,
- favicon and social share image.

## 5. Commerce And Legal Status

Paid checkout is now part of MVP commerce, but it is Turkey-only. Before implementation, lock:

- payment provider: iyzico primary + PayTR secondary/fallback is preferred; bank transfer can be fallback,
- Turkish domestic card support plus foreign-issued Visa/Mastercard/AMEX where enabled by iyzico/PayTR merchant settings, with TROY support for Turkey,
- KVKK consent model,
- privacy policy,
- cookie policy,
- terms,
- distance sales agreement,
- return/cancellation policy,
- proof approval terms,
- shipping zones and delivery methods,
- invoice/tax process.

Commerce must not launch until these decisions are complete. The product experience can be designed now as full Turkey-only commerce, not inquiry-only catalog.

## 6. Plugin / Archive Boundary

External plugin, skill, archive, or agent folders are not part of this constitution.

If such folders exist beside this package, they are inspiration/archive only and must not be treated as implementation source, dependency source, design system source, or CHERIE DAY documentation.

## 7. Developer Handoff

Use `docs/FINAL_REVIEW_BOARD_AUDIT/FINAL_DEVELOPER_HANDOFF_PROMPT.md` as the corrected implementation handoff prompt after completing the remaining asset/legal/security decisions.
