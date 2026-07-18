begin;
select plan(1);

insert into public.customers(id,name,email,status) values
  ('61000000-0000-0000-0000-000000000001','Bildirim Testi','events@cherieday.example','active');

insert into public.orders(id,order_number,customer_id,total_amount,einvoice_status) values
  ('62000000-0000-0000-0000-000000000001','CD-EVENT-1',
   '61000000-0000-0000-0000-000000000001',1250,'pending');

update public.orders set einvoice_status='issued',einvoice_ref='INV-EVENT-1'
where id='62000000-0000-0000-0000-000000000001';

insert into public.order_status_events(
  id,order_id,from_status,to_status,actor_type,title_tr
) values
  ('63000000-0000-0000-0000-000000000001','62000000-0000-0000-0000-000000000001','in_design','proof_sent','system','Prova hazır'),
  ('63000000-0000-0000-0000-000000000002','62000000-0000-0000-0000-000000000001','proof_approved','in_production','system','Üretim başladı'),
  ('63000000-0000-0000-0000-000000000003','62000000-0000-0000-0000-000000000001','packed','shipped','system','Kargoya verildi');

insert into public.consultations(
  id,consultation_number,customer_id,preferred_slots,status
) values(
  '64000000-0000-0000-0000-000000000001','CNS-EVENT-1',
  '61000000-0000-0000-0000-000000000001','[{"at":"2026-08-01T10:00:00Z"}]','requested'
);
update public.consultations set status='confirmed',confirmed_slot='{"at":"2026-08-01T10:00:00Z"}'
where id='64000000-0000-0000-0000-000000000001';
update public.consultations set confirmed_slot='{"at":"2026-08-02T12:00:00Z"}'
where id='64000000-0000-0000-0000-000000000001';
update public.consultations set status='cancelled'
where id='64000000-0000-0000-0000-000000000001';

insert into public.customer_support_threads(
  id,customer_id,order_id,subject,status
) values(
  '65000000-0000-0000-0000-000000000001',
  '61000000-0000-0000-0000-000000000001',
  '62000000-0000-0000-0000-000000000001','Teslimat sorusu','open'
);
insert into public.customer_support_messages(
  id,thread_id,sender_type,sender_id,message,is_internal_note
) values(
  '65000000-0000-0000-0000-000000000002',
  '65000000-0000-0000-0000-000000000001','staff',
  '66000000-0000-0000-0000-000000000001','Yanıt verildi',false
);
update public.customer_support_threads set status='closed'
where id='65000000-0000-0000-0000-000000000001';

insert into public.shipments(
  id,order_id,carrier_name,tracking_number,status
) values(
  '67000000-0000-0000-0000-000000000001',
  '62000000-0000-0000-0000-000000000001','Test Kargo','TRACK-1','preparing'
);
update public.shipments set status='shipped'
where id='67000000-0000-0000-0000-000000000001';
update public.shipments set status='in_transit'
where id='67000000-0000-0000-0000-000000000001';
update public.shipments set status='delivered'
where id='67000000-0000-0000-0000-000000000001';

insert into auth.users(id,email,raw_user_meta_data) values(
  '68000000-0000-0000-0000-000000000001','operator@cherieday.example','{"name":"Operasyon"}'
);
insert into public.staff_users(id,auth_user_id,name,email,role,is_active) values(
  '68000000-0000-0000-0000-000000000002',
  '68000000-0000-0000-0000-000000000001','Operasyon','operator@cherieday.example',
  'order_operations',true
);
update public.orders set status='paid'
where id='62000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"68000000-0000-0000-0000-000000000001"}',true
);
select public.transition_order_status(
  '62000000-0000-0000-0000-000000000001','in_design','Kapsam testi'
);
reset role;

update public.notification_outbox
set status='sent',provider='resend',provider_message_id='re_event_coverage',sent_at=now()
where template_key='invoice_issued';
select public.ingest_resend_delivery_event(
  'svix_event_coverage','re_event_coverage','email.delivered',now()
);
-- A repeated signed provider event is accepted as already processed and does
-- not create a second timeline or delivery record.
select public.ingest_resend_delivery_event(
  'svix_event_coverage','re_event_coverage','email.delivered',now()
);
-- Repeating the same state must not enqueue a duplicate delivery.
update public.shipments set status='delivered'
where id='67000000-0000-0000-0000-000000000001';

do $$
declare v_health jsonb;
begin
  if (select count(*) from public.notification_outbox where template_key='invoice_issued') <> 1
    then raise exception 'invoice event coverage failed'; end if;
  if (select status from public.notification_outbox where template_key='invoice_issued') <> 'delivered'
    then raise exception 'provider delivery webhook did not update admin status'; end if;
  if (select count(*) from public.email_delivery_events where provider_event_id='svix_event_coverage') <> 1
    then raise exception 'provider webhook idempotency failed'; end if;
  if (select count(*) from public.notification_outbox where template_key in (
    'order_status_proof_sent','order_status_in_production','order_status_shipped'
  )) <> 3 then raise exception 'proof/production/order shipping coverage failed'; end if;
  if (select count(*) from public.notification_outbox where template_key in (
    'appointment-requested','appointment-confirmed','appointment-rescheduled','appointment-cancelled'
  )) <> 4 then raise exception 'appointment event coverage failed'; end if;
  if (select count(*) from public.notification_outbox where template_key in (
    'support-case-created','support-case-updated','support-case-resolved'
  )) <> 3 then raise exception 'support event coverage failed'; end if;
  if (select count(*) from public.notification_outbox where aggregate_type='shipment') <> 3
    then raise exception 'shipment status deduplication failed'; end if;
  if (select count(*) from public.notification_outbox where template_key='order_status_in_design') <> 1
    then raise exception 'canonical operational transition coverage failed'; end if;
  select public.notification_outbox_health() into v_health;
  if coalesce((v_health->>'due_count')::int,0) < 14
    then raise exception 'outbox health does not expose due backlog'; end if;
  if has_function_privilege('authenticated','public.notification_outbox_health()','EXECUTE')
    then raise exception 'authenticated may inspect private outbox health'; end if;
end $$;

select pass('launch-critical notification events enqueue once and expose private health');
select * from finish();

do $$
declare v_timeline uuid;
begin
  select id into v_timeline from public.notification_delivery_timeline limit 1;
  begin
    delete from public.notification_delivery_timeline where id=v_timeline;
    raise exception 'direct timeline deletion unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
delete from public.notification_outbox where template_key='invoice_issued';
do $$
begin
  if exists(
    select 1 from public.notification_delivery_timeline t
    left join public.notification_outbox o on o.id=t.notification_id
    where o.id is null
  ) then raise exception 'parent cascade left orphaned delivery timeline'; end if;
end $$;
rollback;
