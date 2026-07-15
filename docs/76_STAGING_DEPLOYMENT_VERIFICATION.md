# CHERIE DAY — Staging Deployment Verification

> Current-state correction (2026-07-15): protected branch-bound Vercel Preview and `staging.cherieday.eu` now exist. See `docs/90_PHASE_3_5_CURRENT_HOSTED_STATE.md` and `docs/93_PHASE_3_5_WORKERS_CI_E2E_AND_ROLLBACK.md`.

Status: blocked; no CHERIE DAY Vercel project, DNS target, or separate Supabase project exists. Cloudflare is authoritative, but `staging.cherieday.eu` intentionally has no record until Vercel supplies an exact target.

Required proof before deployment: protected `https://staging.cherieday.eu`, noindex behavior, separate Supabase public/service keys, test-only payments, a single approved email recipient, OAuth disabled unless explicitly configured, Sentry environment `staging`, exact callbacks/webhooks, and no production data.

The application now emits noindex directives for every non-production `APP_ENV` and uses no-store cache headers for `/auth/**` and `/api/**`.
