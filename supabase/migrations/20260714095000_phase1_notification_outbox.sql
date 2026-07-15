-- Phase 1: durable, idempotent transactional notification outbox.
alter table public.notification_outbox alter column customer_id drop not null;
alter table public.notification_outbox
  add column if not exists event_type text,
  add column if not exists aggregate_type text,
  add column if not exists aggregate_id uuid,
  add column if not exists recipient_email text,
  add column if not exists recipient_kind text not null default 'customer'
    check (recipient_kind in ('customer','staff')),
  add column if not exists category text not null default 'transactional'
    check (category in ('transactional','operational','security','marketing')),
  add column if not exists locale text not null default 'tr-TR',
  add column if not exists idempotency_key text,
  add column if not exists max_attempts int not null default 5 check (max_attempts between 1 and 10),
  add column if not exists next_attempt_at timestamptz,
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by text,
  add column if not exists provider text,
  add column if not exists provider_message_id text,
  add column if not exists last_error_code text,
  add column if not exists failed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.notification_outbox
set status = case status when 'pending' then 'queued' when 'failed' then 'retry_scheduled' else status end,
    next_attempt_at = coalesce(next_attempt_at, available_at),
    event_type = coalesce(event_type, template_key),
    aggregate_type = coalesce(aggregate_type, case when order_id is null then 'customer' else 'order' end),
    aggregate_id = coalesce(aggregate_id, order_id, customer_id),
    idempotency_key = coalesce(idempotency_key, 'legacy:' || id::text);

alter table public.notification_outbox drop constraint if exists notification_outbox_status_check;
alter table public.notification_outbox
  add constraint notification_outbox_status_check check (
    status in ('queued','processing','sent','retry_scheduled','permanently_failed','cancelled')
  ),
  add constraint notification_outbox_recipient_check check (
    recipient_kind = 'staff' or recipient_email is not null or customer_id is not null
  );
alter table public.notification_outbox alter column event_type set not null;
alter table public.notification_outbox alter column aggregate_type set not null;
alter table public.notification_outbox alter column idempotency_key set not null;
alter table public.notification_outbox alter column next_attempt_at set default now();
update public.notification_outbox set next_attempt_at = available_at where next_attempt_at is null;
alter table public.notification_outbox alter column next_attempt_at set not null;

create unique index if not exists notification_outbox_idempotency_uidx
  on public.notification_outbox (idempotency_key);
drop index if exists public.notification_outbox_pending_idx;
create index if not exists notification_outbox_due_idx
  on public.notification_outbox (next_attempt_at, created_at)
  where status in ('queued','retry_scheduled','processing');

create or replace function public.enqueue_notification(
  p_event_type text,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_recipient_kind text,
  p_recipient_email text,
  p_customer_id uuid,
  p_order_id uuid,
  p_template_key text,
  p_payload jsonb,
  p_idempotency_key text,
  p_category text default 'transactional',
  p_locale text default 'tr-TR'
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if char_length(coalesce(p_idempotency_key,'')) not between 8 and 240 then
    raise exception 'invalid notification idempotency key' using errcode = '22023';
  end if;
  insert into public.notification_outbox (
    event_type, aggregate_type, aggregate_id, recipient_kind, recipient_email,
    customer_id, order_id, channel, template_key, payload, category, locale,
    status, idempotency_key, next_attempt_at
  ) values (
    p_event_type, p_aggregate_type, p_aggregate_id, p_recipient_kind,
    nullif(lower(trim(coalesce(p_recipient_email,''))),''), p_customer_id, p_order_id,
    'email', p_template_key, coalesce(p_payload,'{}'::jsonb), p_category, p_locale,
    'queued', p_idempotency_key, now()
  ) on conflict (idempotency_key) do nothing returning id into v_id;
  if v_id is null then
    select id into v_id from public.notification_outbox where idempotency_key = p_idempotency_key;
  end if;
  return v_id;
end;
$$;

create or replace function public.claim_notification_outbox(
  p_worker_id text, p_batch_size int default 20, p_stale_after_seconds int default 900
) returns setof public.notification_outbox
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if char_length(coalesce(p_worker_id,'')) < 3 then raise exception 'worker id required'; end if;
  return query
  with candidates as (
    select id from public.notification_outbox
    where attempts < max_attempts and (
      (status in ('queued','retry_scheduled') and next_attempt_at <= now()) or
      (status = 'processing' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    )
    order by next_attempt_at, created_at
    for update skip locked
    limit greatest(1, least(p_batch_size, 100))
  )
  update public.notification_outbox o set
    status = 'processing', attempts = o.attempts + 1, locked_at = now(),
    locked_by = p_worker_id, updated_at = now()
  from candidates c where o.id = c.id returning o.*;
end;
$$;

revoke all on function public.enqueue_notification(text,text,uuid,text,text,uuid,uuid,text,jsonb,text,text,text) from public, anon, authenticated;
revoke all on function public.claim_notification_outbox(text,int,int) from public, anon, authenticated;
grant execute on function public.enqueue_notification(text,text,uuid,text,text,uuid,uuid,text,jsonb,text,text,text) to service_role;
grant execute on function public.claim_notification_outbox(text,int,int) to service_role;

create or replace function public.enqueue_lead_notifications() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_type text := coalesce(new.metadata ->> 'intake_type', 'contact');
begin
  if new.email is not null then
    perform public.enqueue_notification(
      'intake_received', 'lead', new.id, 'customer', new.email, null, null,
      'intake_' || v_type || '_received',
      jsonb_build_object('lead_id',new.id,'customer_name',new.name,'intake_type',v_type),
      'intake_received:' || new.id::text || ':customer'
    );
  end if;
  perform public.enqueue_notification(
    'new_intake', 'lead', new.id, 'staff', null, null, null,
    'staff_new_' || v_type,
    jsonb_build_object('lead_id',new.id,'customer_name',new.name,'intake_type',v_type),
    'intake_received:' || new.id::text || ':staff', 'operational'
  );
  return new;
end;
$$;
drop trigger if exists trg_enqueue_lead_notifications on public.leads;
create trigger trg_enqueue_lead_notifications after insert on public.leads
for each row execute function public.enqueue_lead_notifications();

create or replace function public.enqueue_order_created_notification() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_email text; v_name text;
begin
  select email, name into v_email, v_name from public.customers where id = new.customer_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'order_received','order',new.id,'customer',v_email,new.customer_id,new.id,
      case when new.status = 'pending_payment' then 'payment_pending' else 'order_received' end,
      jsonb_build_object('order_id',new.id,'order_number',new.order_number,'customer_name',v_name,'total',new.total_amount),
      'order_received:' || new.id::text || ':customer'
    );
  end if;
  return new;
end;
$$;
drop trigger if exists trg_enqueue_order_created_notification on public.orders;
create trigger trg_enqueue_order_created_notification after insert on public.orders
for each row execute function public.enqueue_order_created_notification();

create or replace function public.enqueue_order_event_notifications() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_customer uuid; v_email text; v_name text; v_number text; v_template text;
begin
  select o.customer_id, c.email, c.name, o.order_number
  into v_customer, v_email, v_name, v_number
  from public.orders o left join public.customers c on c.id = o.customer_id where o.id = new.order_id;
  v_template := 'order_status_' || new.to_status::text;
  if v_email is not null then
    perform public.enqueue_notification(
      'order_status_changed','order',new.order_id,'customer',v_email,v_customer,new.order_id,
      v_template,
      jsonb_build_object('order_id',new.order_id,'order_number',v_number,'customer_name',v_name,'status',new.to_status,'title',new.title_tr),
      'order_status:' || new.order_id::text || ':' || new.to_status::text || ':' || new.id::text
    );
  end if;
  if new.to_status in ('paid','revision_requested','proof_approved') then
    perform public.enqueue_notification(
      'order_status_changed','order',new.order_id,'staff',null,null,new.order_id,
      'staff_' || new.to_status::text,
      jsonb_build_object('order_id',new.order_id,'order_number',v_number,'status',new.to_status),
      'order_status:' || new.order_id::text || ':' || new.to_status::text || ':' || new.id::text || ':staff',
      'operational'
    );
  end if;
  return new;
end;
$$;
drop trigger if exists trg_enqueue_order_event_notifications on public.order_status_events;
create trigger trg_enqueue_order_event_notifications after insert on public.order_status_events
for each row execute function public.enqueue_order_event_notifications();

create or replace function public.enqueue_payment_failure_notifications() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_order uuid; v_customer uuid; v_email text; v_name text; v_number text;
begin
  if new.event_type not ilike '%failed%' or new.signature_valid is not true then return new; end if;
  select o.id, o.customer_id, c.email, c.name, o.order_number
  into v_order, v_customer, v_email, v_name, v_number
  from public.payments p join public.orders o on o.id = p.order_id
  left join public.customers c on c.id = o.customer_id where p.id = new.payment_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'payment_failed','payment',new.payment_id,'customer',v_email,v_customer,v_order,
      'order_status_failed',
      jsonb_build_object('payment_event_id',new.id,'order_id',v_order,'order_number',v_number,'customer_name',v_name),
      'payment_failed:' || new.payment_id::text || ':' || coalesce(new.provider_event_id,new.id::text)
    );
  end if;
  perform public.enqueue_notification(
    'payment_failed','payment',new.payment_id,'staff',null,null,v_order,
    'staff_payment_failed',
    jsonb_build_object('payment_event_id',new.id,'order_id',v_order,'order_number',v_number),
    'payment_failed:' || new.payment_id::text || ':' || coalesce(new.provider_event_id,new.id::text) || ':staff',
    'operational'
  );
  return new;
end;
$$;
drop trigger if exists trg_enqueue_payment_failure_notifications on public.payment_events;
create trigger trg_enqueue_payment_failure_notifications after insert on public.payment_events
for each row execute function public.enqueue_payment_failure_notifications();
