# CHERIE DAY — Phase 3.5 Environment, Callback, and DNS Matrix

## Environment scope

| Variable class | Development | Preview / protected Staging | Production |
| --- | --- | --- | --- |
| Public site/Supabase | local | Staging-only URL and anon key | not configured by this run |
| Supabase service role | local only | encrypted server-only | not configured by this run |
| OAuth gates | Google false, Apple false | Google false, Apple false | false/unmodified |
| Payment | simulator | `PAYTR_TEST_MODE=1`, refund disabled | unmodified |
| Email | capture/fail-closed | webhook secret set; send disabled pending approved key | disabled/unmodified |
| Sentry | optional | staging DSN, org, project; no upload token | unmodified |
| Workers | local secrets | branch-scoped encrypted secrets | no schedule/secret added |

No secret value is committed or documented. Public browser values are limited to the site URL, Supabase anonymous key, and Sentry DSN. Service-role, webhook, email provider, worker, payment, cron, and source-map upload credentials are server-only.

## Redirect and webhook matrix

| Purpose | Exact value | Wildcard |
| --- | --- | --- |
| Site URL | `https://staging.cherieday.eu` | none |
| App auth callback | `https://staging.cherieday.eu/auth/callback` | none |
| Local auth callback | `http://localhost:3000/auth/callback` | none |
| Google provider callback (future) | `https://hdafztkhkyhqziqayerz.supabase.co/auth/v1/callback` | none |
| Resend webhook | `https://staging.cherieday.eu/api/webhooks/resend` behind Vercel automation bypass | none |
| PayTR callback | `/api/payments/paytr/callback`; test-only configuration | none |
| Notification worker | `/api/internal/notifications/process` | bearer-protected |
| Reconciliation worker | `/api/internal/payments/reconcile` | bearer-protected |

## DNS continuity

Cloudflare account `227ae33df6eba383550e55046edbf9a4` is authoritative for zone `74e8535e39b23167e5efef60e4c3797a`. The exact Vercel-provided Staging record is DNS-only `A staging.cherieday.eu 76.76.21.21`. Public DNS resolves to that value. Existing Google Workspace MX, Google verification/DKIM, Resend DKIM, Amazon SES return-path MX, and SPF records remain present. No mail record was deleted or duplicated and no proxy/challenge/cache rule was added to callback or API paths.
