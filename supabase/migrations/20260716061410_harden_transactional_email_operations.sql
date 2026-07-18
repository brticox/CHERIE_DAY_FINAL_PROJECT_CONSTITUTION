-- Transactional communication hardening: delivery correlation, state precedence,
-- suppression, immutable timeline and audited staff recovery operations.

alter table public.notification_outbox
  add column if not exists correlation_id uuid not null default gen_random_uuid(),
  add column if not exists environment text not null default 'unknown'
    check (environment in ('development','preview','staging','production','unknown')),
  add column if not exists sender_email text,
  add column if not exists reply_to_route text
    check (reply_to_route in ('hello','support','orders','payments','legal')),
  add column if not exists delivered_at timestamptz,
  add column if not exists suppressed_at timestamptz,
  add column if not exists review_required_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists last_provider_event_at timestamptz;

create index if not exists notification_outbox_correlation_idx
  on public.notification_outbox (correlation_id);
create index if not exists notification_outbox_provider_message_idx
  on public.notification_outbox (provider, provider_message_id)
  where provider_message_id is not null;

alter table public.notification_outbox drop constraint if exists notification_outbox_status_check;
alter table public.notification_outbox add constraint notification_outbox_status_check check (
  status in (
    'queued','processing','sent','delivered','delayed','bounced','complained','failed',
    'suppressed','retry_scheduled','permanently_failed','review_required','cancelled'
  )
);

alter table public.email_delivery_events
  add column if not exists notification_id uuid references public.notification_outbox(id) on delete set null;
create index if not exists email_delivery_events_notification_created_idx
  on public.email_delivery_events (notification_id, occurred_at desc);

create table if not exists public.email_suppressions (
  id uuid primary key default gen_random_uuid(),
  recipient_hash text not null,
  reason text not null check (reason in ('hard_bounce','complaint','provider_suppression')),
  provider text not null default 'resend',
  provider_message_id text,
  first_occurred_at timestamptz not null,
  last_occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (recipient_hash, reason)
);
alter table public.email_suppressions enable row level security;
revoke all on public.email_suppressions from anon, authenticated;
grant all on public.email_suppressions to service_role;

create table if not exists public.notification_delivery_timeline (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notification_outbox(id) on delete cascade,
  from_status text,
  to_status text not null,
  source text not null check (source in ('worker','provider_webhook','admin','database')),
  provider_event_id text,
  staff_user_id uuid references public.staff_users(id) on delete set null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists notification_delivery_timeline_message_idx
  on public.notification_delivery_timeline (notification_id, created_at desc);
alter table public.notification_delivery_timeline enable row level security;
revoke all on public.notification_delivery_timeline from anon, authenticated;
grant all on public.notification_delivery_timeline to service_role;

create or replace function public.reject_notification_timeline_mutation()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'notification timeline is append-only' using errcode = '42501';
end;
$$;
drop trigger if exists trg_notification_timeline_immutable on public.notification_delivery_timeline;
create trigger trg_notification_timeline_immutable
before update or delete on public.notification_delivery_timeline
for each row execute function public.reject_notification_timeline_mutation();

create or replace function public.record_notification_status_change()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if old.status is distinct from new.status then
    insert into public.notification_delivery_timeline (
      notification_id, from_status, to_status, source, detail
    ) values (
      new.id, old.status, new.status,
      case
        when new.last_provider_event_at is distinct from old.last_provider_event_at then 'provider_webhook'
        when new.cancelled_at is distinct from old.cancelled_at
          or new.review_required_at is distinct from old.review_required_at then 'admin'
        when new.locked_by like 'notification-worker:%'
          or old.locked_by like 'notification-worker:%' then 'worker'
        else 'database'
      end,
      jsonb_build_object('attempt', new.attempts, 'error_code', new.last_error_code)
    );
  end if;
  return new;
end;
$$;
drop trigger if exists trg_record_notification_status_change on public.notification_outbox;
create trigger trg_record_notification_status_change
after update of status on public.notification_outbox
for each row execute function public.record_notification_status_change();

create or replace function public.apply_notification_suppression()
returns trigger language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  if new.recipient_kind = 'customer' and new.recipient_email is not null and exists (
    select 1 from public.email_suppressions s
    where s.recipient_hash = encode(digest(lower(trim(new.recipient_email)), 'sha256'), 'hex')
  ) then
    new.status := 'suppressed';
    new.suppressed_at := now();
    new.last_error_code := 'recipient_suppressed';
    new.last_error := 'Alıcı kalıcı teslimat engeli nedeniyle gönderimden çıkarıldı.';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_apply_notification_suppression on public.notification_outbox;
create trigger trg_apply_notification_suppression
before insert on public.notification_outbox
for each row execute function public.apply_notification_suppression();

create or replace function public.ingest_resend_delivery_event(
  p_provider_event_id text,
  p_provider_message_id text,
  p_event_type text,
  p_occurred_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_inserted_count integer;
  v_status text;
  v_notification public.notification_outbox;
  v_rank integer;
  v_current_rank integer;
begin
  if p_event_type not in ('email.sent','email.delivered','email.delivery_delayed','email.bounced','email.complained','email.failed','email.suppressed')
    or length(p_provider_event_id) not between 1 and 200
    or length(p_provider_message_id) not between 1 and 200
    or p_occurred_at > now() + interval '5 minutes'
    or p_occurred_at < now() - interval '90 days' then
    raise exception 'invalid delivery event' using errcode = '22023';
  end if;

  select * into v_notification
  from public.notification_outbox
  where provider = 'resend' and provider_message_id = p_provider_message_id
  for update;

  insert into public.email_delivery_events (
    provider_event_id, provider_message_id, event_type, occurred_at, notification_id
  ) values (
    p_provider_event_id, p_provider_message_id, p_event_type, p_occurred_at, v_notification.id
  ) on conflict (provider_event_id) do nothing;
  get diagnostics v_inserted_count = row_count;
  if v_inserted_count = 0 then return false; end if;

  -- Unknown provider message IDs are retained for reconciliation but never mutate
  -- another outbox row by inference.
  if v_notification.id is null then return true; end if;

  v_status := case p_event_type
    when 'email.delivered' then 'delivered'
    when 'email.delivery_delayed' then 'delayed'
    when 'email.bounced' then 'bounced'
    when 'email.complained' then 'complained'
    when 'email.failed' then 'failed'
    when 'email.suppressed' then 'suppressed'
    else 'sent'
  end;
  v_rank := case v_status
    when 'sent' then 10 when 'delayed' then 20 when 'failed' then 30
    when 'delivered' then 40 when 'bounced' then 50 when 'suppressed' then 60
    when 'complained' then 70 else 0 end;
  v_current_rank := case v_notification.status
    when 'sent' then 10 when 'delayed' then 20 when 'failed' then 30
    when 'delivered' then 40 when 'bounced' then 50 when 'suppressed' then 60
    when 'complained' then 70 else 0 end;

  if v_notification.last_provider_event_at is null
    or p_occurred_at >= v_notification.last_provider_event_at
    or v_rank > v_current_rank then
    update public.notification_outbox
    set status = v_status,
        delivered_at = case when v_status = 'delivered' then p_occurred_at else delivered_at end,
        failed_at = case when v_status in ('bounced','complained','failed','suppressed') then p_occurred_at else failed_at end,
        suppressed_at = case when v_status in ('bounced','complained','suppressed') then p_occurred_at else suppressed_at end,
        last_provider_event_at = greatest(coalesce(last_provider_event_at, p_occurred_at), p_occurred_at),
        updated_at = now()
    where id = v_notification.id;

  end if;

  if v_status in ('bounced','complained','suppressed') and v_notification.recipient_email is not null then
    insert into public.email_suppressions (
      recipient_hash, reason, provider_message_id, first_occurred_at, last_occurred_at
    ) values (
      encode(digest(lower(trim(v_notification.recipient_email)), 'sha256'), 'hex'),
      case v_status when 'bounced' then 'hard_bounce' when 'complained' then 'complaint' else 'provider_suppression' end,
      p_provider_message_id, p_occurred_at, p_occurred_at
    ) on conflict (recipient_hash, reason) do update
      set last_occurred_at = greatest(public.email_suppressions.last_occurred_at, excluded.last_occurred_at),
          provider_message_id = excluded.provider_message_id;
  end if;
  return true;
end;
$$;

revoke all on function public.ingest_resend_delivery_event(text,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.ingest_resend_delivery_event(text,text,text,timestamptz) to service_role;

create or replace function public.admin_retry_notification(p_notification_id uuid)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare v_staff uuid; v_row public.notification_outbox;
begin
  if not (select public.has_staff_role(array['order_operations','commerce_manager','support_agent','service_operations','finance_viewer','operations','admin','superadmin'])) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  v_staff := public.current_staff_id();
  select * into v_row from public.notification_outbox where id = p_notification_id for update;
  if v_row.id is null then raise exception 'notification not found' using errcode = 'P0002'; end if;
  if v_row.status not in ('retry_scheduled','permanently_failed','failed','delayed','review_required') then
    raise exception 'notification is not retryable' using errcode = '23514';
  end if;
  if v_row.status in ('bounced','complained','suppressed') or v_row.suppressed_at is not null then
    raise exception 'suppressed notification cannot be retried' using errcode = '23514';
  end if;
  update public.notification_outbox set
    status='queued', available_at=now(), next_attempt_at=now(), locked_at=null,
    locked_by=null, failed_at=null, review_required_at=null, updated_at=now()
  where id=p_notification_id;
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff)
  values(v_staff,'notification.retry.requested','notification_outbox',p_notification_id,
    jsonb_build_object('previous_status',v_row.status,'attempts',v_row.attempts));
end;
$$;

create or replace function public.admin_cancel_notification(p_notification_id uuid)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare v_staff uuid; v_status text;
begin
  if not (select public.has_staff_role(array['order_operations','commerce_manager','support_agent','service_operations','finance_viewer','operations','admin','superadmin'])) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  v_staff := public.current_staff_id();
  select status into v_status from public.notification_outbox where id=p_notification_id for update;
  if v_status not in ('queued','retry_scheduled','review_required') then
    raise exception 'notification cannot be cancelled' using errcode='23514';
  end if;
  update public.notification_outbox set status='cancelled',cancelled_at=now(),locked_at=null,locked_by=null,updated_at=now()
  where id=p_notification_id;
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff)
  values(v_staff,'notification.cancelled','notification_outbox',p_notification_id,jsonb_build_object('previous_status',v_status));
end;
$$;

create or replace function public.admin_mark_notification_for_review(p_notification_id uuid)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare v_staff uuid; v_status text;
begin
  if not (select public.has_staff_role(array['order_operations','commerce_manager','support_agent','service_operations','finance_viewer','operations','admin','superadmin'])) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  v_staff := public.current_staff_id();
  select status into v_status from public.notification_outbox where id=p_notification_id for update;
  if v_status is null or v_status in ('delivered','cancelled') then
    raise exception 'notification cannot be reviewed' using errcode='23514';
  end if;
  update public.notification_outbox set status='review_required',review_required_at=now(),locked_at=null,locked_by=null,updated_at=now()
  where id=p_notification_id;
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff)
  values(v_staff,'notification.review.required','notification_outbox',p_notification_id,jsonb_build_object('previous_status',v_status));
end;
$$;

revoke all on function public.admin_retry_notification(uuid) from public, anon;
revoke all on function public.admin_cancel_notification(uuid) from public, anon;
revoke all on function public.admin_mark_notification_for_review(uuid) from public, anon;
grant execute on function public.admin_retry_notification(uuid) to authenticated;
grant execute on function public.admin_cancel_notification(uuid) to authenticated;
grant execute on function public.admin_mark_notification_for_review(uuid) to authenticated;

create or replace function public.admin_notification_detail(p_notification_id uuid)
returns jsonb language plpgsql stable security invoker set search_path = public, pg_temp as $$
declare v_result jsonb;
begin
  if not (select public.has_staff_role(array['order_operations','commerce_manager','support_agent','service_operations','finance_viewer','operations','admin','superadmin'])) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'id', o.id,
    'status', o.status,
    'event_type', o.event_type,
    'template_key', o.template_key,
    'aggregate_type', o.aggregate_type,
    'aggregate_id', o.aggregate_id,
    'recipient', case when o.recipient_email is null then 'ekip' else
      left(split_part(o.recipient_email,'@',1),2) || '***@' || split_part(o.recipient_email,'@',2) end,
    'recipient_kind', o.recipient_kind,
    'reply_to_route', o.reply_to_route,
    'provider', o.provider,
    'provider_message_id', case when o.provider_message_id is null then null else left(o.provider_message_id,8) || '…' end,
    'attempts', o.attempts,
    'max_attempts', o.max_attempts,
    'last_error_code', o.last_error_code,
    'created_at', o.created_at,
    'sent_at', o.sent_at,
    'delivered_at', o.delivered_at,
    'timeline', coalesce((
      select jsonb_agg(jsonb_build_object(
        'from_status', t.from_status,
        'to_status', t.to_status,
        'source', t.source,
        'created_at', t.created_at
      ) order by t.created_at)
      from public.notification_delivery_timeline t where t.notification_id=o.id
    ), '[]'::jsonb)
  ) into v_result
  from public.notification_outbox o where o.id=p_notification_id;
  if v_result is null then raise exception 'notification not found' using errcode='P0002'; end if;
  return v_result;
end;
$$;
revoke all on function public.admin_notification_detail(uuid) from public, anon;
grant execute on function public.admin_notification_detail(uuid) to authenticated;
