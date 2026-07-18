# CHERIE DAY — Pre-Production Activation Decision

Decision: **not approved**.

Production deployment, Google/Apple activation, transactional email, and real-money payments must remain disabled. Cloudflare delegation and Resend domain verification are complete. Preconditions still missing are Vercel project/domain configuration, a separate Staging Supabase project, deployed/migrated Staging validation, Resend webhook proof, Sentry project/alerts, and Google provider-console access. Supabase Staging creation remains blocked by the two-active-free-project limit.

Exact next step: upgrade `brticox's Org`, or first migrate the live EDA website database to another recoverable target and verify that migration before pausing EDA. EDA must not be deleted or paused in its current dependent state. Then create `CHERIE DAY Staging` in `eu-central-1` and resume Vercel, DNS, webhook, Sentry, OAuth, CI, deployment, and E2E activation.
