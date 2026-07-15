# CHERIE DAY — Supabase Hosted Environments

Production candidate: `CHERIE DAY`, ref `rkvubnuwfuocoevayhcd`, region `eu-central-1`, status `ACTIVE_HEALTHY`.

It contains seed catalog data and no customer/staff rows were observed. It is not yet a verified production target: its hosted migrations stop before the reviewed Phase 2, Phase 3, and identity/email migrations in this branch. Security advisor findings also require review before deployment.

No separate Staging project or Supabase branch exists. Do not reuse this project for Staging. On 2026-07-15 the organization is still on the Free plan and the active projects remain `EDA` and `CHERIE DAY`; an unrelated third project is already inactive. EDA cannot safely be paused: it backs the live `eda-anaokulu-website` Vercel production project and stores six parent/child application records, the latest dated 2026-06-22. It was backed up and left `ACTIVE_HEALTHY`.

Owner action required: upgrade the organization or migrate EDA to another recoverable project before pausing it. Deletion remains prohibited. A Supabase development branch is not an acceptable substitute for the required isolated Staging project in this mission.

After creation, apply the reviewed migration chain through normal migration history, use `https://staging.cherieday.eu` as Site URL, and allow exactly:

- `https://staging.cherieday.eu/auth/callback`
- `https://cherieday.eu/auth/callback` only on Production

No wildcard redirect is permitted. Provider callbacks are project-specific `/auth/v1/callback` URLs.
