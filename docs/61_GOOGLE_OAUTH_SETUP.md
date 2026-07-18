# CHERIE DAY — Google OAuth Setup

Live status: **blocked; no Google client or authoritative production domain was available.** Code remains disabled with `AUTH_GOOGLE_ENABLED=false`.

## Owner actions

Owner: CHERIE DAY identity owner. Consoles: Google Auth Platform and Supabase project `CHERIE DAY` (`rkvubnuwfuocoevayhcd`).

1. Confirm the authoritative domain from the registrar/Cloudflare zone and the CHERIE DAY Vercel project. Do not use `cherieday.du` without that evidence.
2. Configure Google branding, audience and consent-screen contacts for the confirmed business.
3. Create a Web application client. Store the client secret only in Google/Supabase secret stores.
4. Add the exact Google redirect URI `https://rkvubnuwfuocoevayhcd.supabase.co/auth/v1/callback`.
5. Enable Google in Supabase Auth and enter the client ID/secret.
6. Add exact Supabase Auth redirect allowlist entries:
   - `http://localhost:3000/auth/callback`
   - the approved staging callback
   - `https://<PRIMARY_DOMAIN>/auth/callback`
7. Set environment-specific `NEXT_PUBLIC_SITE_URL` and `AUTH_REDIRECT_ORIGINS`; only then set `AUTH_GOOGLE_ENABLED=true` in that environment.
8. Run new, returning, same-verified-email, cancellation, expired-code, replay, blocked-customer and guest-cart scenarios in staging.

Google requires exact scheme, host, path and trailing-slash matching. Production uses HTTPS; localhost is the development exception. Standard CI uses simulated callbacks and needs no real Google secret.

Evidence required for “ready”: sanitized consent screen, completed staging session, resulting Supabase user/identity, one customer row, preserved cart, no staff row, and callback logs without codes/tokens.
