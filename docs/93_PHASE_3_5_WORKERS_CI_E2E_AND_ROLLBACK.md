# CHERIE DAY — Phase 3.5 Workers, CI, E2E, and Rollback

## Worker source of truth

There is no Vercel Cron configuration because Hobby cron cannot safely target a protected Preview and Vercel Cron executes Production deployments. Protected manual invocation is the sole Staging scheduling source, preventing duplicate schedules. Notification processing is capped at 20 records per call; payment reconciliation checks at most 100 pending records. Notification sending and refunds remain disabled, and no live-money mutation is permitted.

The first hosted worker probe correctly returned 401 for every call and exposed that the Preview variable names existed with empty values. The empty values were replaced with random, encrypted, branch-scoped Preview secrets. On final code deployment `dpl_8omE1MmxBBKcDH3zK39pW94szya2`, the notification worker returned 401 without authorization, then returned 200 twice with identical `{claimed: 0, sent: 0, retried: 0, permanentlyFailed: 0}` results. Payment reconciliation returned 401 without authorization, then returned 200 twice with `{checked: true, records: 0}`. The telemetry route returned 401 without authorization and 200 with the payment-worker credential. Public access without the Vercel bypass returned 302 to SSO. These results prove fail-closed authentication, empty-batch idempotency, and zero hosted discrepancies without sending mail, issuing refunds, or touching live money.

## Browser evidence

Automated Playwright coverage uses Chromium and the dedicated Vercel automation bypass. It covers seven representative routes at 1440, 1280, 1024, 768, 430, 390, 375, and 320 pixels: 56 route/viewport checks. On code SHA `60dab54824795e72912ff26ba5e4682ac625a0d1`, the authoritative rerun passed 56/56 with HTTP 200, 56/56 `noindex`, 56/56 overflow-safe, 56/56 console/page-error clean, zero bad overlays, and zero targets below 44px. The response-level `X-Robots-Tag: noindex, nofollow, noarchive` protects every route even when child metadata omits a robots meta tag. Home screenshots and machine-readable matrices live in `docs/evidence/phase-3-5-hosted-e2e/`.

## CI

Both hosted workflows cover lint, TypeScript, 130 unit tests, build, migration replay, database lint, Phase 1/2/3 and identity/email SQL, callback concurrency, and the high-severity dependency gate. For final code SHA `60dab54824795e72912ff26ba5e4682ac625a0d1`, Quality Gate run `29403273910` passed and Cross-phase Integration Integrity run `29403273867` passed. The dependency gate reported no high-severity vulnerability; three moderate transitive advisories remain documented and were not force-upgraded.

## Rollback order

1. Set Google, Apple, notification sending, refunds, and worker execution gates false.
2. Remove only the branch association/domain from Vercel; never promote or modify Production.
3. Remove only Cloudflare record `5471e71dc5a39f3f7626a59290660297`; preserve all mail records.
4. Delete only Resend webhook `ffdd45ac-26b3-41d1-8c8c-65500f7a184e` and a dedicated Staging key if one is later approved.
5. Disable the Sentry project/DSN; archive/delete only with explicit owner approval.
6. Pause or delete Supabase Staging `hdafztkhkyhqziqayerz` only with explicit owner approval.
7. Never modify, resume, delete, or repurpose EDA, and never roll Staging changes into `rkvubnuwfuocoevayhcd`.

## Deployment incident and recovery record

During the initial CLI bootstrap, three direct deployments were incorrectly classified by Vercel as Production: `dpl_2khoJzrdwhkFa5d93XWn7sod7MGL`, `dpl_2Gy83thtfrwPgwbSSDSagapNfJyj`, and `dpl_HGSsvJVWm1ysCD7KSMUSxGoPzCWx`. They were deleted immediately. Failed Git deployment `dpl_BqvvbwWPGmCAQX6HkfQAjFpfDyLn` was also removed. None received Production environment values, Production Supabase data, live PayTR credentials, or a Production promotion. All subsequent deployments are Git-created Preview deployments on the isolated branch, and the branch-bound Staging alias resolves only to the latest protected Preview.
