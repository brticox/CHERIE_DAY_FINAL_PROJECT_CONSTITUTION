# CHERIE DAY — Phase 3.5 Observability, Email, and OAuth

## Sentry

Project `cherie-day-web` (`4511737900105808`) uses the Next.js platform. Client, Node.js server, Edge, request-error, route-error, and global-error instrumentation are installed. Releases use the Git SHA where supplied by the deployment. Only Staging is enabled; default PII is disabled, Replay sampling is zero, traces sample at 5%, query strings are stripped, user context is removed, and request/extra/context/breadcrumb structures are recursively scrubbed.

Application and Sentry-side controls cover Authorization, cookies, OAuth/access/refresh codes and tokens, passwords, reset links, email/phone/body fields, raw provider/payment payloads, and customer PII. Sentry default scrubbers and server-side scrubbing are enabled, IP storage is disabled, allowed browser origins are `staging.cherieday.eu` and `localhost`, spike protection is enabled, and TLS verification is enabled. Source-map upload remains disabled because no approved `SENTRY_AUTH_TOKEN` exists.

One default high-priority issue alert exists. The seven named email-notification rules requested for Phase 3.5 require action-time owner confirmation before subscription creation; they are not claimed as created. Safe client and server smoke routes exist only in `APP_ENV=staging` and are protected by Vercel SSO, with the server route additionally bearer-protected.

## Resend

Domain `cherieday.eu` is verified and send-enabled. Webhook `ffdd45ac-26b3-41d1-8c8c-65500f7a184e` subscribes to sent, delivered, delayed, bounced, complained, failed, and suppressed events. Its signing secret is stored only in Vercel Preview. A public GET reaches the protected application only through the automation bypass and returns the expected 405, proving the route is not intercepted by SSO.

`NOTIFICATION_SEND_ENABLED=false` remains the safe setting. A new persistent Resend API key and one owner-controlled Staging message require explicit action-time confirmation. Until that confirmation, no provider submission or delivery is claimed and Production email stays disabled.

## OAuth

Google Cloud console control is unavailable, so no client or secret was created. `AUTH_GOOGLE_ENABLED=false` remains set in Staging and Production was not changed. The owner activation checklist is: create/select Cloud project `CHERIE DAY`; configure consent for `cherieday.eu`; create a dedicated Staging Web client; authorize only `https://hdafztkhkyhqziqayerz.supabase.co/auth/v1/callback`; store the ID/secret only in Supabase Staging; enable Google only in Vercel Preview; then execute new/returning/cancel/invalid-next/replay/disabled-user/cart-merge/profile/no-staff tests before considering activation. Production Google remains prohibited.

Apple remains `false`; no Team ID, Key ID, `.p8`, or client secret was requested or stored.
