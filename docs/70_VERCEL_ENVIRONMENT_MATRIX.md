# CHERIE DAY — Vercel Environment Matrix

No CHERIE DAY Vercel project exists in team `brticoxs-projects` (`team_t9hkoLttwqGnT6OrdiqgcZxv`). Create one project named `cherie-day-web` only after the Supabase Staging target exists.

| Environment | URL | Supabase | Email | OAuth | Payments | Indexing |
| --- | --- | --- | --- | --- | --- | --- |
| Local | `http://localhost:3000` | local stack | capture | local only | simulator | noindex |
| Preview | generated Vercel URL | isolated branch/test project | capture/override | disabled | no live credentials | noindex |
| Staging | `https://staging.cherieday.eu` | separate project | single approved recipient | Google only after setup | test only | noindex + protection |
| Production | `https://cherieday.eu` | `rkvubnuwfuocoevayhcd` after alignment | verified Resend | disabled pending approval | disabled | indexable |

`vercel.json` schedules notification processing at minute 15 and payment reconciliation at minute 45 of each hour. Vercel cron invokes only Production deployments, so the schedule remains inactive until a deliberate Production deployment. Both routes require `CRON_SECRET` or their dedicated worker secret.

Secrets are server-only: service role, Resend, worker, payment, and Sentry tokens. Public values are limited to site URL, Supabase URL/publishable key, Sentry DSN, and the two false-by-default OAuth gates.
