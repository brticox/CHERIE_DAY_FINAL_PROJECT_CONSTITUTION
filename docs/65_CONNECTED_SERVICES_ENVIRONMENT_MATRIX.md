# CHERIE DAY — Connected Services Environment Matrix

Authoritative domain: **UNVERIFIED / launch blocker**. Supabase project `CHERIE DAY` (`rkvubnuwfuocoevayhcd`) is connected and healthy. No CHERIE DAY Vercel project, Cloudflare zone, Resend domain or Sentry project was visible.

| Field | Local | Preview | Staging | Production |
|---|---|---|---|---|
| App URL | `http://localhost:3000` | Unassigned | Unassigned | Blocked by domain |
| Supabase | local project | Unassigned | Unassigned | connected project, deployment unverified |
| Public key | present locally | unverified | unverified | unverified |
| Service role | present locally, server only | unverified | unverified | unverified |
| App callback | local exact path | exact URL required | exact URL required | domain blocked |
| Google/Apple provider callback | Supabase local/provider test | project-specific | project-specific | `https://rkvubnuwfuocoevayhcd.supabase.co/auth/v1/callback` |
| Vercel project | not linked | absent | absent | absent |
| Cloudflare zone | none | none | none | none |
| Resend sender | capture | capture only | test/capture | no domain |
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
