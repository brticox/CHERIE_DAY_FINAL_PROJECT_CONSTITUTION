# CHERIE DAY — Database (Supabase / Postgres)

Phase 2 database foundation. Schema = union of `docs/08` + `docs/41` + `docs/42`.
Security posture = `docs/23` (fail closed). **No frontend, no payment providers,
no real secrets** in this phase.

## Migrations (apply in order)

| File | Contents |
|---|---|
| `0001_init_extensions_enums.sql` | pgcrypto/pg_trgm/unaccent, `set_updated_at()`, all enums |
| `0002_identity_system_helpers.sql` | staff_users, customers, media_assets, seo_metadata, site_settings, audit_log; RLS helpers |
| `0003_catalog_products.sql` | A + B: taxonomy, products, variants, personalization, addons, tiers, joins |
| `0004_digital_products.sql` | C: digital_products, assets, customer projects, download links |
| `0005_services_lifecycle.sql` | D + E: packages, cities, availability, consultations, quotes, reservations, briefs, milestones, checklists |
| `0006_commerce_core.sql` | I(addr) + F + G + H: addresses, cart, checkout, orders, payments, refunds, shipments, proofs |
| `0007_account_reviews_ugc.sql` | I + J: favorites, notifications, prefs, galleries, testimonials, portfolio, reviews |
| `0008_support_crm_legal.sql` | K + L: support, leads, quote_requests, contact, clients, legal docs/versions, consent, cookies |
| `0009_content_search_marketing.sql` | M + N + O: experiences, offerings, faqs, articles, pages, search_documents, coupons, campaigns, abandoned_carts |
| `0010_internal_ops.sql` | P: suppliers, teams, assignments, internal services/packages |
| `0011_public_views.sql` | 21 `*_public` views + grants to anon/authenticated |
| `0012_rls_policies.sql` | Enable RLS on every table + owner/staff/anon policies |
| `0013_storage.sql` | 5 buckets + storage.objects policies |

Seed: `seed.sql` (departments, 7 collections, ~48 products, 8 services, 5 cities,
6 digital designs, 12 articles, 12 legal docs + v1, faqs, testimonials, portfolio,
1 coupon, one staff user per role). RLS test: `tests/rls_verification.sql`.

## Applying (Supabase CLI required — not installed in this environment)

```bash
# Local stack (needs Docker):
supabase start
supabase db reset            # runs all migrations + seed.sql

# Or against a linked hosted project:
supabase link --project-ref <ref>
supabase db push             # applies migrations
psql "$DATABASE_URL" -f supabase/seed.sql

# Generate TypeScript types after applying:
supabase gen types typescript --local > lib/supabase/database.types.ts
```

## Verifying RLS without the CLI

Apply the migrations + seed to any Postgres 15 with the Supabase `auth`/`storage`
schemas, then:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_verification.sql
```

The script is self-asserting (RAISEs on failure) and rolls back. It proves: anon
cannot read leads/orders/payments/payment_events/suppliers/consent/reviews/base
products; anon *can* read the `*_public` views and insert intake leads without
reading them back; customer A sees only their own order; customer B cannot see
customer A's data.

## Security invariants (docs/23, docs/42 §10)

- Anon reads **only** `*_public` views (base content tables have no anon policy).
- `internal_cost`, `*_internal`, supplier/team/assignment, `payment_events`,
  `consent_records`, `moderation_note`, `service_checklists` never reach anon.
- Customers are row-scoped via `current_customer_id()`; no cross-tenant reads.
- Reviews public only when `status='approved'`; photos hidden unless `photo_consent`.
- Legal current versions public; consent evidence private + append-only.
- Turkey-only: `country` defaults `TR`, `currency` defaults `TRY`.
