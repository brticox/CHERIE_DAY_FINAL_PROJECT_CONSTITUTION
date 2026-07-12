# PHASE ZERO — STABILIZATION GATE

Phase Zero makes the current CHERIE DAY implementation reproducible and safe to extend. It does not change the creative direction or broaden product scope.

## Local quality gate

Run before every merge:

```bash
npm ci
npm run check
npm run security:audit
```

`npm run check` runs lint, TypeScript, and the production build. GitHub Actions runs the same checks for pull requests and `main`.

`npm run format:check` remains available as a migration report. It is not yet a merge gate because the inherited baseline contains many pre-existing formatting differences; formatting those files must be isolated in a dedicated mechanical change rather than mixed into commerce or creative work.

## Database verification gate

Database types must be regenerated after migrations are applied, never hand-maintained:

```bash
npm run db:types:local
```

For a linked non-production Supabase project:

```bash
npm run db:types:linked
```

RLS verification requires a disposable/local database connection and must never target production:

```bash
DATABASE_URL='postgresql://...' npm run db:test:rls
```

The generated type file may only be replaced after the command exits successfully. Docker or a linked Supabase project is therefore an explicit prerequisite for type regeneration and RLS execution.

## Environment promotion

- Development: local credentials, PayTR test mode, no real customer data.
- Staging: separate Supabase project and payment sandbox; production-like seed and full QA.
- Production: isolated credentials, approved legal documents, merchant activation, backups and monitoring.

Never reuse service-role keys, payment secrets, customer data, or storage buckets between these environments.

## Merge discipline

1. Keep commits scoped: foundation, database, commerce, creative, or content.
2. Do not mix generated database types with unrelated visual work.
3. Never commit `.env*`, build output, tool state, logs, or TypeScript build caches.
4. A route existing is not evidence that its feature is complete; placeholders remain tracked as unfinished work.
5. Public payment readiness requires signed callback tests, duplicate-event tests, amount mismatch tests, and reconciliation checks.

## Current external blockers

- Docker is not available in the current workstation environment, so the local Supabase stack and RLS suite cannot yet run.
- Type regeneration requires either Docker or an authenticated linked Supabase project.
- Legal, tax/invoice, and merchant-provider approvals remain launch gates.

## Accepted toolchain advisory

`npm audit` currently reports a moderate PostCSS advisory through Next.js' internal dependency tree. The automatic recommendation incorrectly proposes a major downgrade to Next.js 9, so it must not be applied. The CI gate fails on high or critical production advisories while this moderate upstream path is monitored and rechecked during framework upgrades.
