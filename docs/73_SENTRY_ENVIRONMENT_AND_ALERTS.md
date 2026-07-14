# CHERIE DAY — Sentry Environment and Alerts

No Sentry project, DSN, or read token is available through the connected services. The available Sentry integration is read-only and needs a user-configured token; it cannot create projects or alerts.

Required owner setup: create `cherie-day-web`, add `development`, `preview`, `staging`, and `production`, configure commit-SHA releases, and add server/client DSNs through Vercel scopes. Enable scrubbing for cookies, authorization headers, OAuth codes/tokens, email bodies, reset links, password fields, provider payloads, payment data, and PII.

Create Staging alerts first for OAuth callback/provisioning failures, Resend webhook failures, permanent email failures, auth spikes, payment callback failures, and critical reconciliation cases. Send one safe Staging event only after DSN and scrubber verification.
