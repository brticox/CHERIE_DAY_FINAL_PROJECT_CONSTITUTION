-- Complete the launch-critical transactional notification wiring.
-- Every trigger uses the central idempotent enqueue function; no provider call
-- is made inside a database transaction.

-- Preserve the append-only timeline for direct mutations while allowing a
-- database-enforced cascade when its parent notification/account is deleted.
create or replace function public.reject_notification_timeline_mutation()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then return old; end if;
  raise exception 'notification timeline is append-only' using errcode = '42501';
end;
$$;

create or replace function public.enqueue_invoice_notification()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_email text; v_name text;
begin
  if new.einvoice_status <> 'issued'
     or new.einvoice_status is not distinct from old.einvoice_status then
    return new;
  end if;
  select email, name into v_email, v_name
  from public.customers where id = new.customer_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'invoice_issued','order',new.id,'customer',v_email,new.customer_id,new.id,
      'invoice_issued',
      jsonb_build_object(
        'order_id',new.id,'order_number',new.order_number,'customer_name',v_name,
        'einvoice_ref',new.einvoice_ref
      ),
      'invoice_issued:' || new.id::text || ':' || coalesce(new.einvoice_ref, 'issued')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enqueue_invoice_notification on public.orders;
create trigger trg_enqueue_invoice_notification
after update of einvoice_status, einvoice_ref on public.orders
for each row execute function public.enqueue_invoice_notification();

create or replace function public.enqueue_consultation_notification()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_email text; v_name text; v_template text; v_event text; v_signature text;
begin
  select coalesce(c.email,l.email), coalesce(c.name,l.name)
  into v_email,v_name
  from (select 1) x
  left join public.customers c on c.id = new.customer_id
  left join public.leads l on l.id = new.lead_id;
  if v_email is null then return new; end if;

  if tg_op = 'INSERT' then
    v_event := 'appointment_requested';
    v_template := 'appointment-requested';
  elsif new.status = 'confirmed' and old.status is distinct from new.status then
    v_event := 'appointment_confirmed';
    v_template := 'appointment-confirmed';
  elsif new.status = 'confirmed' and old.confirmed_slot is distinct from new.confirmed_slot then
    v_event := 'appointment_rescheduled';
    v_template := 'appointment-rescheduled';
  elsif new.status = 'cancelled' and old.status is distinct from new.status then
    v_event := 'appointment_cancelled';
    v_template := 'appointment-cancelled';
  else
    return new;
  end if;

  v_signature := md5(coalesce(new.confirmed_slot,new.preferred_slots,'{}'::jsonb)::text);
  perform public.enqueue_notification(
    v_event,'consultation',new.id,'customer',v_email,new.customer_id,null,
    v_template,
    jsonb_build_object(
      'consultation_id',new.id,'consultation_number',new.consultation_number,
      'customer_name',v_name,'status',new.status,'slot',new.confirmed_slot
    ),
    v_event || ':' || new.id::text || ':' || left(v_signature,24)
  );
  return new;
end;
$$;

drop trigger if exists trg_enqueue_consultation_notification on public.consultations;
create trigger trg_enqueue_consultation_notification
after insert or update of status, confirmed_slot on public.consultations
for each row execute function public.enqueue_consultation_notification();

create or replace function public.enqueue_support_thread_notification()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_email text; v_name text; v_template text; v_event text;
begin
  select email,name into v_email,v_name from public.customers where id=new.customer_id;
  if v_email is null then return new; end if;
  if tg_op = 'INSERT' then
    v_event := 'support_case_created';
    v_template := 'support-case-created';
  elsif new.status = 'closed' and old.status is distinct from new.status then
    v_event := 'support_case_resolved';
    v_template := 'support-case-resolved';
  elsif old.status is distinct from new.status then
    v_event := 'support_case_updated';
    v_template := 'support-case-updated';
  else
    return new;
  end if;
  perform public.enqueue_notification(
    v_event,'support_thread',new.id,'customer',v_email,new.customer_id,new.order_id,
    v_template,
    jsonb_build_object(
      'support_thread_id',new.id,'customer_name',v_name,'subject',new.subject,
      'status',new.status,'order_id',new.order_id
    ),
    v_event || ':' || new.id::text || ':' || new.status::text
  );
  return new;
end;
$$;

drop trigger if exists trg_enqueue_support_thread_notification on public.customer_support_threads;
create trigger trg_enqueue_support_thread_notification
after insert or update of status on public.customer_support_threads
for each row execute function public.enqueue_support_thread_notification();

create or replace function public.enqueue_support_reply_notification()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_thread public.customer_support_threads; v_email text; v_name text;
begin
  if new.sender_type <> 'staff' or new.is_internal_note then return new; end if;
  select * into v_thread from public.customer_support_threads where id=new.thread_id;
  select email,name into v_email,v_name from public.customers where id=v_thread.customer_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'support_reply_received','support_thread',new.thread_id,'customer',v_email,
      v_thread.customer_id,v_thread.order_id,'support-case-updated',
      jsonb_build_object(
        'support_thread_id',new.thread_id,'support_message_id',new.id,
        'customer_name',v_name,'subject',v_thread.subject,'order_id',v_thread.order_id
      ),
      'support_reply_received:' || new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enqueue_support_reply_notification on public.customer_support_messages;
create trigger trg_enqueue_support_reply_notification
after insert on public.customer_support_messages
for each row execute function public.enqueue_support_reply_notification();

create or replace function public.enqueue_shipment_notification()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_customer uuid; v_email text; v_name text; v_number text;
  v_template text; v_event text;
begin
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then return new; end if;
  if new.status = 'shipped' then v_event := 'shipment_dispatched'; v_template := 'shipment-dispatched';
  elsif new.status = 'in_transit' then v_event := 'shipment_in_transit'; v_template := 'shipment_in_transit';
  elsif new.status = 'delivered' then v_event := 'shipment_delivered'; v_template := 'shipment-delivered';
  elsif new.status = 'returned' then v_event := 'shipment_returned'; v_template := 'shipment_returned';
  else return new;
  end if;
  select o.customer_id,c.email,c.name,o.order_number into v_customer,v_email,v_name,v_number
  from public.orders o left join public.customers c on c.id=o.customer_id where o.id=new.order_id;
  if v_email is not null then
    perform public.enqueue_notification(
      v_event,'shipment',new.id,'customer',v_email,v_customer,new.order_id,v_template,
      jsonb_build_object(
        'shipment_id',new.id,'order_id',new.order_id,'order_number',v_number,
        'customer_name',v_name,'carrier_name',new.carrier_name,
        'tracking_number',new.tracking_number,'status',new.status
      ),
      v_event || ':' || new.id::text || ':' || new.status::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enqueue_shipment_notification on public.shipments;
create trigger trg_enqueue_shipment_notification
after insert or update of status on public.shipments
for each row execute function public.enqueue_shipment_notification();

-- The original operational transition predates the durable outbox and wrote
-- incomplete rows directly. Replace it with a single canonical event path;
-- the order_status_events trigger performs the idempotent email enqueue.
create or replace function public.transition_order_status_operational(
  p_order_id uuid,
  p_to_status public.order_status,
  p_detail text default null
) returns public.order_status
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_staff uuid := public.current_staff_id();
  v_customer uuid; v_from public.order_status; v_allowed boolean; v_title text;
begin
  if v_staff is null or not public.has_staff_role(array[
    'superadmin','admin','order_operations','commerce_manager','proof_designer','operations'
  ]) then raise exception 'staff permission required' using errcode='42501'; end if;
  select status,customer_id into v_from,v_customer from public.orders
  where id=p_order_id for update;
  if not found then raise exception 'order not found' using errcode='P0002'; end if;
  v_allowed := case v_from
    when 'pending_payment' then p_to_status in ('paid','cancelled')
    when 'paid' then p_to_status in ('in_design','cancelled','refunded')
    when 'in_design' then p_to_status in ('proof_sent','cancelled')
    when 'proof_sent' then p_to_status in ('revision_requested','proof_approved','cancelled')
    when 'revision_requested' then p_to_status='in_design'
    when 'proof_approved' then p_to_status='in_production'
    when 'in_production' then p_to_status='quality_check'
    when 'quality_check' then p_to_status in ('in_production','packed')
    when 'packed' then p_to_status='shipped'
    when 'shipped' then p_to_status='delivered'
    when 'delivered' then p_to_status='completed'
    else false end;
  if not v_allowed then
    raise exception 'invalid order transition: % -> %',v_from,p_to_status using errcode='22023';
  end if;
  if p_to_status='in_production' and exists (
    select 1 from public.order_items oi where oi.order_id=p_order_id and oi.requires_proof
      and not exists(select 1 from public.product_proofs pp where pp.order_item_id=oi.id and pp.status='approved')
  ) then raise exception 'approved proof required before production' using errcode='23514'; end if;
  if p_to_status='packed' and exists (
    select 1 from public.production_jobs pj where pj.order_id=p_order_id
      and pj.status not in ('passed','packed','completed')
  ) then raise exception 'quality check must pass before packing' using errcode='23514'; end if;
  v_title := case p_to_status
    when 'paid' then 'Ödemeniz alındı' when 'in_design' then 'Tasarım süreci başladı'
    when 'proof_sent' then 'Tasarım onayınıza hazır'
    when 'revision_requested' then 'Revizyon talebiniz alındı'
    when 'proof_approved' then 'Tasarımınız onaylandı'
    when 'in_production' then 'Üretim başladı'
    when 'quality_check' then 'Kalite kontrolünde' when 'packed' then 'Özenle paketlendi'
    when 'shipped' then 'Kargoya verildi' when 'delivered' then 'Teslim edildi'
    when 'completed' then 'Sipariş tamamlandı' when 'cancelled' then 'Sipariş iptal edildi'
    when 'refunded' then 'İade tamamlandı' else 'Siparişiniz güncellendi' end;
  update public.orders set status=p_to_status,
    fulfillment_status=case
      when p_to_status='shipped' then 'shipped'::public.fulfillment_status
      when p_to_status in ('delivered','completed') then 'delivered'::public.fulfillment_status
      when p_to_status in ('in_production','quality_check','packed') then 'preparing'::public.fulfillment_status
      else fulfillment_status end
  where id=p_order_id;
  insert into public.order_status_events(
    order_id,from_status,to_status,actor_type,actor_staff_id,title_tr,detail_tr
  ) values(p_order_id,v_from,p_to_status,'staff',v_staff,v_title,nullif(trim(coalesce(p_detail,'')),''));
  if v_customer is not null then
    insert into public.notifications(customer_id,type,title_tr,body_tr,link)
    values(v_customer,
      case when p_to_status='proof_sent' then 'proof_ready'::public.notification_type
        when p_to_status in ('shipped','delivered') then 'shipment'::public.notification_type
        else 'order_update'::public.notification_type end,
      v_title,nullif(trim(coalesce(p_detail,'')),''),
      '/hesap/siparisler/'||(select order_number from public.orders where id=p_order_id));
  end if;
  return p_to_status;
end;
$$;

revoke all on function public.transition_order_status_operational(uuid,public.order_status,text)
from public,anon,authenticated;

create or replace function public.notification_outbox_health()
returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'due_count', count(*) filter(where status in ('queued','retry_scheduled') and next_attempt_at <= now()),
    'oldest_due_seconds', coalesce(extract(epoch from now()-min(next_attempt_at)
      filter(where status in ('queued','retry_scheduled') and next_attempt_at <= now()))::bigint,0),
    'processing_count', count(*) filter(where status='processing'),
    'retrying_count', count(*) filter(where status='retry_scheduled'),
    'permanently_failed_24h', count(*) filter(where status='permanently_failed' and failed_at >= now()-interval '24 hours')
  ) from public.notification_outbox
$$;

revoke all on function public.notification_outbox_health() from public,anon,authenticated;
grant execute on function public.notification_outbox_health() to service_role;

revoke all on function public.enqueue_invoice_notification(),
  public.enqueue_consultation_notification(),public.enqueue_support_thread_notification(),
  public.enqueue_support_reply_notification(),public.enqueue_shipment_notification()
from public,anon,authenticated;
