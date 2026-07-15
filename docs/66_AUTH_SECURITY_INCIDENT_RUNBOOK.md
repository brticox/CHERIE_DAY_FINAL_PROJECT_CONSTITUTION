# CHERIE DAY — Authentication and Email Security Incident Runbook

For every incident: stop unsafe automation, preserve correlation/event IDs, never copy tokens or email bodies, appoint an owner, record actions and communicate only confirmed facts.

| Incident | Contain | Investigate / recover | Owner |
|---|---|---|---|
| OAuth callback spike | keep providers disabled or disable affected flag | provider/Supabase status, safe error counts, redirect allowlist | Identity + engineering |
| Suspected token/code leak | revoke sessions and rotate affected secret | scrub logs, Git history and provider audit | Security owner |
| Account collision/takeover report | disable affected customer; preserve orders | verified identities and immutable identity events; no manual DB merge | Identity + support |
| Customer provisioning failure | keep login recoverable; do not create staff | Auth user, trigger/RPC and unique customer constraint | Engineering |
| Apple secret expiry | disable Apple flag; email/Google remain | rotate from retained `.p8`, staging proof | Apple Account Holder |
| Reset-request abuse | rate limit/reset provider settings | counts only; avoid enumeration/PII | Security + support |
| Resend signature failures | reject webhook, preserve Svix ID only | secret, clock skew, endpoint and replay | Email operations |
| Bounce/complaint spike | pause affected template/sender | alignment, recipient source, suppression | Deliverability owner |
| Wrong environment secret | disable surface and rotate | Vercel scopes, build/runtime logs, affected sessions | Platform/security |

Sentry must scrub authorization headers, cookies, OAuth codes, tokens, email/phone, email bodies and payment payloads before capture. Required alerts: callback failure spike, provisioning failure, permanent email failure, webhook failure and reset abuse. Sentry is currently externally unconfigured; do not claim these alerts active.

Customer-safe callback wording: “Giriş işlemi tamamlanmadı. Hesabınızda herhangi bir değişiklik yapılmadı.” Disabled-account cases route to support without revealing internal state.
