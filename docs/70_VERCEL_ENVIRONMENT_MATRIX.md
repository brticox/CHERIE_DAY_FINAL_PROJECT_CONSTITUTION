# CHERIE DAY — Vercel Environment Matrix

Vercel project `cherie-day-web` (`prj_NCMWdLqi0GOV4S5iKTdMRAKSIVbB`) now exists in team `brticoxs-projects` (`team_t9hkoLttwqGnT6OrdiqgcZxv`). The continuation branch deploys as protected Preview (`target: null`) and owns `staging.cherieday.eu`; no Production environment values or promotion were created.

| Environment | URL | Supabase | Email | OAuth | Payments | Indexing |
| --- | --- | --- | --- | --- | --- | --- |
| Local | `http://localhost:3000` | local stack | capture | local only | simulator | noindex |
| Preview | generated Vercel URL | isolated branch/test project | capture/override | disabled | no live credentials | noindex |
| Staging | `https://staging.cherieday.eu` | separate project | single approved recipient | Google only after setup | test only | noindex + protection |
| Production | `https://cherieday.eu` | `rkvubnuwfuocoevayhcd` after alignment | verified Resend | disabled pending approval | disabled | indexable |

`vercel.json` contains no cron schedule. Vercel cron invokes Production deployments and is therefore unsuitable for this protected Preview. Protected manual invocation is the single Staging scheduling source; both routes require their dedicated bearer secret and remain absent from Production scheduling.

Secrets are server-only: service role, Resend, worker, payment, and Sentry tokens. Public values are limited to site URL, Supabase URL/publishable key, Sentry DSN, and the two false-by-default OAuth gates.
