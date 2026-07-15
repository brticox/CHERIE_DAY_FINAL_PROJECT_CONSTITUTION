# CHERIE DAY — Connected Services Environment Matrix

> Current-state correction (2026-07-15): the “no Staging/Vercel/webhook/Sentry project” statements below are historical. The authoritative continuation is `docs/90_PHASE_3_5_CURRENT_HOSTED_STATE.md` through `docs/94_PHASE_3_5_FINAL_READINESS_DECISION.md`.

Authoritative domain: **verified on Cloudflare**. Zone `cherieday.eu` (`74e8535e39b23167e5efef60e4c3797a`) is active and delegated to Cloudflare. Supabase project `CHERIE DAY` (`rkvubnuwfuocoevayhcd`) is connected and healthy. Resend domain `9ee62771-b1fc-48c4-b1b8-b128074fa460` is verified and send-enabled. No CHERIE DAY Vercel project, Supabase Staging project, Resend webhook, or Sentry project is currently available.

| Field | Local | Preview | Staging | Production |
|---|---|---|---|---|
| App URL | `http://localhost:3000` | Unassigned | `staging.cherieday.eu` reserved but unresolved | Existing Squarespace site preserved |
| Supabase | local project | Unassigned | Unassigned | connected project, deployment unverified |
| Public key | present locally | unverified | unverified | unverified |
| Service role | present locally, server only | unverified | unverified | unverified |
| App callback | local exact path | exact URL required | exact URL required | domain blocked |
| Google/Apple provider callback | Supabase local/provider test | project-specific | project-specific | `https://rkvubnuwfuocoevayhcd.supabase.co/auth/v1/callback` |
| Vercel project | not linked | absent | absent | absent; Production not promoted |
| Cloudflare zone | authoritative | authoritative | authoritative; no `staging` record yet | authoritative; apex/`www` preserved |
| Resend sender | capture | capture only | blocked until protected Staging exists | domain verified; Production sending disabled by policy |
| Sentry env/release | not configured | not configured | not configured | not configured |
| Payment callback origin | localhost simulator only | live forbidden | test-only required | domain blocked |
| Cookie behavior | host-only; HTTP local | secure required | secure required | secure + host-only preferred |

## Variable scope

Public: `NEXT_PUBLIC_SITE_URL`, Supabase URL/public key, optional Sentry public DSN. Server-only: service role, provider secrets held by Supabase, Resend key/webhook secret, notification/cron/payment worker secrets, Sentry auth token, PayTR credentials. `AUTH_GOOGLE_ENABLED` and `AUTH_APPLE_ENABLED` are non-secret readiness gates.

Production fails closed for HTTP/localhost identity origins, recipient override, enabled sending without Resend/webhook configuration, and provider flags left false. Preview must not receive production service role, unrestricted email, live PayTR or wildcard redirect permission.

## Exact owner sequence

1. Domain owner identifies registrar and authoritative DNS zone.
2. Vercel owner creates/links separate preview, staging and production configuration.
3. Supabase owner defines separate non-production project(s) and exact redirect allowlists.
4. Google/Apple owners configure provider callbacks.
5. Resend/Workspace owners verify coexistence records.
6. Sentry owner creates project, environments, alerts and read-only inspection token locally.
7. Only after staging proof may production flags be enabled.
