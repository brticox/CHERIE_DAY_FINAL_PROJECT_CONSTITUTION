# CHERIE DAY — Phase 3.5 Current Hosted State

Date: 2026-07-15
Authoritative continuation branch: `integration/phase-3-5-hosted-completion-20260715`
Draft PR: `#2` (open, unmerged)

## Safety boundary

- `EDA` (`opntjknemukwzkpyalbn`) is **PAUSED BY OWNER DECISION — PROTECTED, DO NOT MODIFY**.
- Its encrypted logical backup remains readable and has SHA-256 `505f80393394ac1a3eb24b87b5db94118530948e07ac6ba1b6904b7e38812f67`.
- The CHERIE DAY Production-candidate Supabase project (`rkvubnuwfuocoevayhcd`) remains healthy and was not migrated, configured, or deployed by this continuation.
- No Production Vercel promotion, Production environment secret, live PayTR credential, Apple credential, or real-money operation was introduced.

## Hosted resources

| Provider | Current Staging state | Resource identity |
| --- | --- | --- |
| Supabase | isolated Free/NANO project, 40 migrations, SQL/RLS suites passed | `hdafztkhkyhqziqayerz`, `eu-central-1`, `$0/month` |
| Vercel | Git Preview only, branch-bound domain, SSO protection | project `prj_NCMWdLqi0GOV4S5iKTdMRAKSIVbB` |
| Cloudflare | DNS-only A record resolves to Vercel target | zone `74e8535e39b23167e5efef60e4c3797a`, record `5471e71dc5a39f3f7626a59290660297` |
| Resend | verified domain and signed Staging webhook | domain `9ee62771-b1fc-48c4-b1b8-b128074fa460`, webhook `ffdd45ac-26b3-41d1-8c8c-65500f7a184e` |
| Sentry | Next.js project, DSN, client/server instrumentation, scrubbing | project `4511737900105808`, slug `cherie-day-web` |
| Google | provider disabled; console control unavailable | exact owner checklist in `docs/74_GOOGLE_OAUTH_HOSTED_VERIFICATION.md` |

Supabase Staging URL is `https://hdafztkhkyhqziqayerz.supabase.co`. Its provider callback is `https://hdafztkhkyhqziqayerz.supabase.co/auth/v1/callback`. Its application callback and Site URL are exactly `https://staging.cherieday.eu/auth/callback` and `https://staging.cherieday.eu`; localhost is the only additional callback and no wildcard is present.

## Hosted database proof

All prior migrations were applied in order and the hosted-only hardening migration `20260715055945_hosted_anon_grant_hardening.sql` removed broad default `anon` grants. Phase 1 legal/notifications, RLS, Phase 2 admin/permissions, Phase 3 payment-integrity, identity/email, storage, grant, deduplication, and outbox assertions passed against Staging. Anonymous access cannot select payment, refund, or audit base tables. The accepted SECURITY DEFINER public views expose sanitized public projections while base-table RLS remains enforced.

## Production isolation

The Vercel project has no Production environment values. The active Staging deployment target is Preview (`target: null`) and is created from Git, not promoted. `APP_ENV=staging`, PayTR test mode is enabled, refunds and notification delivery are fail-closed, Google and Apple are false, and every internal endpoint validates a server-only bearer secret. Public access redirects to Vercel SSO.

## Final hosted proof

Code SHA `60dab54824795e72912ff26ba5e4682ac625a0d1` was deployed as Preview `dpl_8omE1MmxBBKcDH3zK39pW94szya2`. The strict browser matrix passed 56/56 route/viewport checks with 56/56 `noindex`, 56/56 overflow-safe, 56/56 console-clean, and zero undersized interactive targets. Notification and payment workers returned 401 without credentials and repeatable 200 empty-batch results with their branch-scoped credentials. Sentry server event `f8965dcd68294a88ad83412c4850e186` flushed successfully. GitHub Quality Gate `29403273910` and Cross-phase Integration Integrity `29403273867` both passed this code SHA.
