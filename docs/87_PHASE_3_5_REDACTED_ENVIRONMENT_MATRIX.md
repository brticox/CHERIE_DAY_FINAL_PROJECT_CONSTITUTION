# Phase 3.5 Redacted Environment Matrix

> Superseded environment state: use `docs/91_PHASE_3_5_ENVIRONMENT_CALLBACK_AND_DNS_MATRIX.md`. Secret values remain intentionally absent from both documents.

Date: 2026-07-15 (Europe/Istanbul)

No values are recorded in this file.

| Scope | Public variable names | Server-only variable names | Current hosted state |
| --- | --- | --- | --- |
| Local | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `SUPABASE_SERVICE_ROLE_KEY`, notification/payment simulator variables | local only |
| Preview | same public names; optional `NEXT_PUBLIC_SENTRY_DSN` | isolated non-Production Supabase, capture-only email, worker secrets | not configured |
| Staging | `APP_ENV`, `NEXT_PUBLIC_SITE_URL`, Supabase public URL/key, optional public Sentry DSN, OAuth feature gates | Supabase service role, Resend key/webhook secret, notification/payment/cron secrets, Sentry token | blocked; no project/deployment |
| Production | names reserved only | Production values prohibited in this mission | not configured or deployed |

Security rules:

- `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, worker secrets, cron secrets, payment credentials, and `SENTRY_AUTH_TOKEN` are server-only.
- No server secret may use a `NEXT_PUBLIC_` prefix.
- Preview and Staging must not use Production-candidate Supabase keys.
- `AUTH_GOOGLE_ENABLED=false` until real Staging OAuth proof.
- `AUTH_APPLE_ENABLED=false` throughout this mission.
- live PayTR credentials and real-money mutations remain prohibited.
- Staging delivery must use a single owner-controlled recipient and `[STAGING]` subjects.
- repository and GitHub environment secret counts were zero at audit time.
