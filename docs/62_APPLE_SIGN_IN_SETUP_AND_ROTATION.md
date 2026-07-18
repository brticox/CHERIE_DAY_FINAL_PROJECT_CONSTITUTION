# CHERIE DAY — Sign in with Apple Setup and Rotation

Live status: **externally blocked.** No Apple Developer organization, Services ID, Team ID, Key ID or private key was available. Code remains disabled with `AUTH_APPLE_ENABLED=false`.

## Owner actions

Owner: Apple Developer Account Holder with the CHERIE DAY identity owner.

1. Confirm the authoritative domain.
2. Confirm Apple Developer membership and an eligible primary App ID with Sign in with Apple capability.
3. Create/associate a Services ID for the website.
4. Register and verify the confirmed domain and exact return URL `https://rkvubnuwfuocoevayhcd.supabase.co/auth/v1/callback`.
5. Create a Sign in with Apple key; record Team ID and Key ID. Store the `.p8` outside source control and evidence.
6. Generate the Apple client secret and configure the Supabase Apple provider.
7. Register the verified Resend sending domain/address with Apple Private Email Relay after SPF/DKIM are valid.
8. Add exact app callback URLs to Supabase, then enable `AUTH_APPLE_ENABLED` only in the verified environment.

## Name and relay policy

The Supabase web OAuth flow does not provide a reliable full name. The customer may complete a separate profile field after first login. Returning login never overwrites an existing name with null. `@privaterelay.appleid.com` remains a valid masked address and is shown masked in the account.

## Rotation

Apple web OAuth client secrets require rotation at least every six months. The Account Holder owns a 30-day and 7-day reminder, creates the replacement from the retained `.p8`, updates Supabase, verifies staging, records expiry without the secret, then removes the expired value. A lost or compromised `.p8` is revoked immediately and treated as a security incident.

Risk if skipped: all Apple web sign-ins fail when the secret expires. Readiness evidence must include new, returning, private-relay, cancellation, revoked access and expired-secret staging cases.
