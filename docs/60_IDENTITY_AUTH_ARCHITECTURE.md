# CHERIE DAY — Identity and Authentication Architecture

Status: local implementation verified; live providers externally blocked.

## Authority and lifecycle

Supabase Auth is the only customer identity authority. `auth.users` owns credentials and provider identities; `public.customers` owns the recoverable Maison profile and remains unique by `auth_user_id`. Customer metadata never grants staff access. Active staff membership is revalidated from `public.staff_users` at every privileged server boundary.

Email/password and OAuth converge on `/auth/callback`, `ensure_current_customer_profile()`, the customer-status gate, identity audit, and the atomic guest-cart merge. Middleware refreshes sessions and improves navigation, but Server Components, Actions, Routes, RLS and capability checks remain authoritative.

## Redirect policy

- Application redirects accept only relative internal paths.
- `//`, backslashes, control characters, `/api/**`, `/auth/**`, and values over 500 characters are rejected.
- `NEXT_PUBLIC_SITE_URL` creates the callback origin; request headers never choose it.
- `AUTH_REDIRECT_ORIGINS` is an exact-origin inventory, never a wildcard.
- Production rejects HTTP and localhost.

## Linking policy

Supabase automatic linking may link the same verified email according to its current Auth policy. The application never merges by a user-supplied or unverified string. Manual linking remains disabled until the owner explicitly enables Supabase manual linking, approves the support workflow, and completes live collision tests.

Apple private-relay addresses are separate verified identities. They are never merged with a real-email account merely because a customer claims ownership. Order, proof, address, favorite and cart ownership stays attached to the single `customers.auth_user_id` history.

Identity events store provider, event type, time and a one-way hash of the provider identity reference. Provider tokens, OAuth codes and raw claims are not stored.

## Account state

`active` customers may continue. `disabled` and `archived` customers are signed out and denied in the callback and server guard. OAuth cannot create `staff_users`; inactive staff are denied independently.

## Recovery and rollback

Profile provisioning is idempotent and callback-retry safe. Cart merge is serialized per customer in one database transaction. If cart merge alone fails, the authenticated session remains valid and the customer receives a recoverable warning. Rollback is the single migration plus the auth/UI files listed in `67_IDENTITY_EMAIL_SERVICES_VERIFICATION.md`; do not delete Auth users to roll back application code.

Current references: [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google), [Apple login](https://supabase.com/docs/guides/auth/social-login/auth-apple), [identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking).
