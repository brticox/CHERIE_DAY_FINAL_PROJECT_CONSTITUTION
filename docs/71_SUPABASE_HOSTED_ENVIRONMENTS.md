# CHERIE DAY — Supabase Hosted Environments

Production candidate: `CHERIE DAY`, ref `rkvubnuwfuocoevayhcd`, region `eu-central-1`, status `ACTIVE_HEALTHY`.

It contains seed catalog data and no customer/staff rows were observed. It is not yet a verified production target: its hosted migrations stop before the reviewed Phase 2, Phase 3, and identity/email migrations in this branch. Security advisor findings also require review before deployment.

No separate Staging project or Supabase branch exists. Do not reuse this project for Staging. On 2026-07-14 the connector reported a $0 monthly project cost and accepted its cost confirmation, but creation of `CHERIE DAY Staging` in `eu-central-1` was rejected because owner `brticox` has reached the two-active-free-project limit. Active projects are `EDA` and `CHERIE DAY`; an inactive unrelated project also exists. No existing project was paused, deleted, or repurposed.

Owner decision required: upgrade the organization, or explicitly identify an unrelated project that may be paused/deleted. A Supabase development branch is not an acceptable substitute for the required isolated Staging project in this mission.

After creation, apply the reviewed migration chain through normal migration history, use `https://staging.cherieday.eu` as Site URL, and allow exactly:

- `https://staging.cherieday.eu/auth/callback`
- `https://cherieday.eu/auth/callback` only on Production

No wildcard redirect is permitted. Provider callbacks are project-specific `/auth/v1/callback` URLs.
