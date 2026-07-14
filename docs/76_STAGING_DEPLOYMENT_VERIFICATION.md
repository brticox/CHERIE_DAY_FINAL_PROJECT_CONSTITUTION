# CHERIE DAY — Staging Deployment Verification

Status: blocked; no Vercel project, DNS target, or separate Supabase project exists.

Required proof before deployment: protected `https://staging.cherieday.eu`, noindex behavior, separate Supabase public/service keys, test-only payments, a single approved email recipient, OAuth disabled unless explicitly configured, Sentry environment `staging`, exact callbacks/webhooks, and no production data.

The application now emits noindex directives for every non-production `APP_ENV` and uses no-store cache headers for `/auth/**` and `/api/**`.
