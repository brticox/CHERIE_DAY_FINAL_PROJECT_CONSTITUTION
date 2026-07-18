-- Environment-scoped background worker scheduling via pg_cron + pg_net.
--
-- Why: Vercel Cron on the Hobby plan caps job frequency at once/day; this
-- project's notification worker needs a 5-minute cadence and payment
-- reconciliation needs an hourly cadence. Scheduling moves into Postgres
-- instead, decoupled from the hosting plan's Cron tier.
--
-- Safety: jobs are scheduled unconditionally by this migration (so replaying
-- it produces the same state everywhere it's applied), but ops.invoke_worker
-- is a deliberate no-op until BOTH ops.scheduler_config.worker_base_url and
-- the named Vault secret exist for that project. Nothing fires until someone
-- explicitly configures a project (per-project, per-environment: Staging and
-- Production are separate Supabase projects, so configuring Staging never
-- activates Production). Secrets are read from Vault by name at call time —
-- never stored in this migration, a cron job definition, or a log line.

create extension if not exists pg_cron;
create extension if not exists pg_net;

create schema if not exists ops;
revoke all on schema ops from public, anon, authenticated;

create table if not exists ops.scheduler_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
revoke all on ops.scheduler_config from public, anon, authenticated;
grant all on ops.scheduler_config to service_role;

comment on table ops.scheduler_config is
  'Per-project runtime config for pg_cron-driven worker dispatch (e.g. worker_base_url). Not replicated between Staging and Production projects.';

create or replace function ops.invoke_worker(p_secret_name text, p_worker_path text)
returns void
language plpgsql
security definer
set search_path = ops, vault, net, public, pg_temp
as $$
declare
  v_base_url text;
  v_secret text;
begin
  select value into v_base_url from ops.scheduler_config where key = 'worker_base_url';
  if v_base_url is null or length(trim(v_base_url)) = 0 then
    raise warning 'ops.invoke_worker: worker_base_url not configured, skipping %', p_worker_path;
    return;
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = p_secret_name;
  if v_secret is null or length(trim(v_secret)) = 0 then
    raise warning 'ops.invoke_worker: vault secret "%" not configured, skipping %', p_secret_name, p_worker_path;
    return;
  end if;

  perform net.http_post(
    url := rtrim(v_base_url, '/') || p_worker_path,
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_secret, 'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 25000
  );
end;
$$;

revoke all on function ops.invoke_worker(text, text) from public, anon, authenticated;
-- No grant to service_role needed for execution: pg_cron jobs run as the
-- scheduling role (postgres), not through PostgREST, so no API-facing grant
-- is required or desired here.

select cron.schedule(
  'notification-worker-tick',
  '*/5 * * * *',
  $$select ops.invoke_worker('notification_worker_secret', '/api/internal/notifications/process');$$
);

select cron.schedule(
  'payment-reconciliation-tick',
  '45 * * * *',
  $$select ops.invoke_worker('payment_worker_secret', '/api/internal/payments/reconcile');$$
);
