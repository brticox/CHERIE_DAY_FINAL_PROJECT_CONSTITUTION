# CHERIE DAY — Google OAuth Hosted Verification

Google Cloud and Workspace Admin tooling are not connected. Google OAuth remains disabled in every hosted environment.

Owner actions: verify `cherieday.eu` in Google Cloud, create separate Staging and Production web OAuth clients, and add each project’s exact Supabase callback (`https://<project-ref>.supabase.co/auth/v1/callback`). Put client credentials only in the corresponding Supabase provider configuration. Set `AUTH_GOOGLE_ENABLED=true` in Staging only after real new/returning-user verification, safe callback rejection, customer provisioning, guest-cart merge, Turkish UX, and no-token-log checks pass.
