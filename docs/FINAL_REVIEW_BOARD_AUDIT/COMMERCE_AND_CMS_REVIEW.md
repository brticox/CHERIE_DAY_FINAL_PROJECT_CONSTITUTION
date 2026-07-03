# Commerce And CMS Review

## Verdict

**Commerce strategy is strong. Commerce build readiness is partial.**

`09_COMMERCE_BIBLE.md` is strategically mature because it defines full Turkey-only commerce without turning CHERIE DAY into Trendyol, Amazon, or a wedding marketplace.

The full commerce system is now in MVP scope, but implementation must wait until Turkey-specific legal, payment, tax, proof, delivery, and privacy decisions are finalized.

## Commerce Readiness

Required for MVP:

- Product House as curated commerce.
- Collection-led browsing.
- Product detail pages with personalization, cart eligibility, and inquiry support.
- Customer registration/login.
- Account dashboard.
- `Seçimlerim` cart.
- Turkey-only checkout.
- iyzico primary + PayTR secondary/fallback payment integration.
- Visa, Mastercard, TROY, and AMEX where supported.
- Bank transfer fallback if needed.
- Order history and tracking.
- Proof approval for personalized products.
- Order/product support inquiries.
- Production and delivery tone.

Still needs final decision before commerce launch:

- provider account details and card-network enablement,
- webhook model,
- refunds,
- invoices,
- tax/VAT logic,
- shipping rates,
- delivery providers,
- distance sales agreement,
- return/cancellation policy,
- KVKK consent storage,
- proof approval legal wording,
- personalized-product cancellation exceptions.

## CMS Readiness

Strong entities:

- pages,
- products,
- categories,
- collections,
- experiences,
- digital offerings,
- memory offerings,
- portfolio projects,
- galleries,
- testimonials,
- FAQs,
- articles,
- media assets,
- SEO metadata.

Needs implementation detail:

- Rehber schema and sitemap wiring,
- block editor structure,
- draft/publish workflow,
- preview mode,
- localized content strategy,
- media rights fields,
- audit-log triggers,
- content versioning.

## CRM Readiness

Good foundation:

- leads,
- quote requests,
- contact messages,
- product inquiries,
- clients,
- lead notes,
- lead status history,
- assignment to staff.

Needs definition:

- duplicate lead handling,
- WhatsApp handoff logging,
- lead source attribution,
- consent evidence,
- file upload handling,
- spam/rate limiting,
- email notification rules,
- SLA/status aging.

## Proof Approval

The concept is correct and brand-aligned. It is not yet operationally complete.

Required for commerce:

- proof versions,
- revision requests,
- approval timestamp,
- approver identity,
- approved file snapshot,
- terms accepted at approval,
- production lock after approval,
- audit log.

## Data Security

The RLS intent is correct. Implementation must be exact. Public users must never read:

- leads,
- clients,
- quote requests,
- contact messages,
- internal costs,
- supplier/team assignments,
- payment events,
- draft content,
- internal notes.

## Final Commerce/CMS Recommendation

Build MVP as full Turkey-only commerce with account, cart, checkout, payment, order tracking, proof approval, and support. Do not launch commerce until legal/payment/fiscal decisions and RLS policies are complete.
