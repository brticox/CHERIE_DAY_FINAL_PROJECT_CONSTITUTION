# CHERIE DAY — Pre-Production Activation Decision

Decision: **not approved**.

Production deployment, Google/Apple activation, transactional email, real-money payments, and Phase 4 must remain disabled. Preconditions missing are live registrar delegation to Cloudflare, Vercel project/domain configuration, a separate Staging Supabase project, deployed/migrated Staging validation, Resend webhook proof, Sentry project/alerts, and Google provider-console access. Supabase Staging creation is presently blocked by the two-active-free-project limit for owner `brticox`.

Exact next step: either upgrade `brticox's Org` or explicitly approve pausing/deleting a named unrelated Supabase project, then create `CHERIE DAY Staging` in `eu-central-1`. Separately, change registrar delegation from Squarespace nameservers to Cloudflare's assigned nameservers before treating Cloudflare DNS as live.
