# Phase 3.5 Hosted E2E Evidence

- Recorded: 2026-07-15
- Protected host: `https://staging.cherieday.eu`
- Code deployment: `dpl_8omE1MmxBBKcDH3zK39pW94szya2`
- Code SHA: `60dab54824795e72912ff26ba5e4682ac625a0d1`

## Browser matrix

Chromium exercised `/`, `/magaza`, a representative product, `/hizmetler`, `/kurumsal/gizlilik`, `/yardim`, and `/hesap/giris` at 1440, 1280, 1024, 768, 430, 390, 375, and 320 pixels.

| Gate | Result |
| --- | ---: |
| Route/viewport checks | 56/56 passed |
| HTTP `noindex` checks | 56/56 passed |
| Horizontal-overflow checks | 56/56 passed |
| Console/page-error checks | 56/56 passed |
| Checks with all targets at least 44px | 56/56 passed |
| Maximum undersized targets | 0 |

`browser-summary.json` is the compact machine-readable result. `browser-matrix.json` contains every route/viewport observation. `screenshots/` contains full-page home captures for all eight widths. No automation credential or application secret is stored in these artifacts.

## Hosted service probes

| Surface | Unauthorized | Authorized first | Authorized repeat | Safe outcome |
| --- | ---: | ---: | ---: | --- |
| Notification worker | 401 | 200 | 200 | zero claimed/sent/retried/permanently failed |
| Payment reconciliation | 401 | 200 | 200 | zero discrepancies |
| Sentry telemetry | 401 | 200 | not needed | event `f8965dcd68294a88ad83412c4850e186`, flushed |
| Public protected host | 302 | n/a | n/a | redirected to Vercel SSO |

The Resend webhook independently rejected an invalid signature with 400, accepted a valid synthetic event with 200, and accepted an exact replay of the same event ID with 200. This proves signature enforcement and idempotent replay handling without creating a persistent provider API key or sending a real message.

## Hosted CI

- Quality Gate `29403273910`: passed for the code SHA above.
- Cross-phase Integration Integrity `29403273867`: passed for the code SHA above.

## Isolation statement

EDA `opntjknemukwzkpyalbn` remained paused and protected. CHERIE DAY Production-candidate `rkvubnuwfuocoevayhcd`, Vercel Production values, live PayTR, Apple, Google, refunds, and Production email were not activated or mutated.
