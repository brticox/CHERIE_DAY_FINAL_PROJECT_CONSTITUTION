# CHERIE DAY — Phase 3.5 Workers, CI, E2E, and Rollback

## Worker source of truth

There is no Vercel Cron configuration because Hobby cron cannot safely target a protected Preview and Vercel Cron executes Production deployments. Protected manual invocation is the sole Staging scheduling source, preventing duplicate schedules. Notification processing is capped at 20 records per call; payment reconciliation checks at most 100 pending records. Notification sending and refunds remain disabled, and no live-money mutation is permitted.

The first hosted worker probe correctly returned 401 for every call and exposed that the Preview variable names existed with empty values. The empty values were replaced with random, encrypted, branch-scoped Preview secrets. The final hosted proof must show missing-secret 401, valid-secret 200, repeated empty-batch idempotency, and zero reconciliation discrepancies after the replacement deployment.

## Browser evidence

Automated Playwright coverage uses Chromium with reduced motion and the dedicated Vercel automation bypass. It covers seven representative routes at 1440, 1280, 1024, 768, 430, 390, 375, and 320 pixels: 56 route/viewport checks. The discovery pass found no HTTP, console, page, hydration, overlay, language, or horizontal-overflow failure. It detected child-page SEO metadata overriding the parent noindex meta on some routes; the fix adds a non-Production `X-Robots-Tag: noindex, nofollow, noarchive` response header for all paths. Home screenshots and machine-readable matrices live in `docs/evidence/phase-3-5-hosted-e2e/`.

The touch-target audit identified legacy compact marquee/footer/carousel links. Staging-specific remediation raises the main compact controls and footer links to a 44px minimum without changing the hero composition. The final rerun is authoritative.

## CI

Both hosted workflows cover lint, TypeScript, unit tests, build, migration replay, database lint, Phase 1/2/3 and identity/email SQL, callback concurrency, and the high-severity dependency gate. Run `29394977156` passed integration for code SHA `dbbc550`; Quality run `29394977162` caught a strict test fixture type mismatch. The fixture is corrected before the final SHA; no failing run is presented as final evidence.

## Rollback order

1. Set Google, Apple, notification sending, refunds, and worker execution gates false.
2. Remove only the branch association/domain from Vercel; never promote or modify Production.
3. Remove only Cloudflare record `5471e71dc5a39f3f7626a59290660297`; preserve all mail records.
4. Delete only Resend webhook `ffdd45ac-26b3-41d1-8c8c-65500f7a184e` and a dedicated Staging key if one is later approved.
5. Disable the Sentry project/DSN; archive/delete only with explicit owner approval.
6. Pause or delete Supabase Staging `hdafztkhkyhqziqayerz` only with explicit owner approval.
7. Never modify, resume, delete, or repurpose EDA, and never roll Staging changes into `rkvubnuwfuocoevayhcd`.
