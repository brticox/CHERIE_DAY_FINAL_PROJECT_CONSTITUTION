begin;

create or replace function pg_temp.assert(condition boolean, message text)
returns void language plpgsql as $$
begin
  if not coalesce(condition,false) then raise exception 'ASSERTION FAILED: %',message; end if;
end;
$$;

insert into auth.users(id,email) values
  ('31000000-0000-0000-0000-000000000001','customer@example.test'),
  ('31000000-0000-0000-0000-000000000002','finance@example.test'),
  ('31000000-0000-0000-0000-000000000003','viewer@example.test'),
  ('31000000-0000-0000-0000-000000000004','inactive@example.test');
delete from public.customers where auth_user_id in (
  '31000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000002',
  '31000000-0000-0000-0000-000000000003','31000000-0000-0000-0000-000000000004'
);
insert into public.customers(id,auth_user_id,name,email) values
  ('32000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','Test Customer','customer@example.test');
insert into public.staff_users(id,auth_user_id,name,email,role,is_active) values
  ('33000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000002','Finance Admin','finance@example.test','superadmin',true),
  ('33000000-0000-0000-0000-000000000002','31000000-0000-0000-0000-000000000003','Finance Viewer','viewer@example.test','finance_viewer',true),
  ('33000000-0000-0000-0000-000000000003','31000000-0000-0000-0000-000000000004','Inactive Admin','inactive@example.test','superadmin',false);
insert into public.carts(id,customer_id,status,currency) values
  ('34000000-0000-0000-0000-000000000001','32000000-0000-0000-0000-000000000001','active','TRY');
insert into public.cart_items(
  id,cart_id,quantity,unit_price_snapshot,total_price_snapshot,product_snapshot
) values (
  '35000000-0000-0000-0000-000000000001','34000000-0000-0000-0000-000000000001',
  1,100.00,100.00,'{"name":"Test Ürün"}'::jsonb
);
insert into public.checkout_sessions(
  id,customer_id,cart_id,status,total_amount,subtotal_amount,shipping_amount,
  expires_at,invoice_type,invoice_identity,legal_version_ids
) values (
  '36000000-0000-0000-0000-000000000001','32000000-0000-0000-0000-000000000001',
  '34000000-0000-0000-0000-000000000001','open',100.00,100.00,0,
  now()+interval '1 hour','bireysel','{}','{}'
);

set local role service_role;
create temporary table phase3_attempt as
select * from public.create_payment_attempt_v2(
  '36000000-0000-0000-0000-000000000001','32000000-0000-0000-0000-000000000001',
  'paytr','phase3-request-key-00000001'
);
grant select on phase3_attempt to authenticated,service_role;
select pg_temp.assert((select count(*)=1 from phase3_attempt),'first attempt created');
select pg_temp.assert((select amount_minor=10000 from phase3_attempt),'minor amount frozen');
select pg_temp.assert((select merchant_order_id ~ '^[A-Za-z0-9]+$' from phase3_attempt),'merchant id safe');
select pg_temp.assert((
  select a.payment_id=b.payment_id from phase3_attempt a,
    public.create_payment_attempt_v2(
      '36000000-0000-0000-0000-000000000001','32000000-0000-0000-0000-000000000001',
      'paytr','phase3-request-key-00000001'
    ) b
),'duplicate attempt reused');
select public.record_payment_initialization(
  (select payment_id from phase3_attempt),true,'https://www.paytr.com/odeme/guvenli/test-token',null
);

select pg_temp.assert((
  public.ingest_paytr_callback(
    (select merchant_order_id from phase3_attempt),'phase3-success-event','success',10000,10000,'TL',
    '{"status":"success"}'::jsonb,'37000000-0000-0000-0000-000000000001'
  )->>'outcome'='applied'
),'success callback applied');
select pg_temp.assert((
  public.ingest_paytr_callback(
    (select merchant_order_id from phase3_attempt),'phase3-success-event','success',10000,10000,'TL',
    '{"status":"success"}'::jsonb,'37000000-0000-0000-0000-000000000002'
  )->>'outcome'='duplicate'
),'duplicate callback acknowledged');
select pg_temp.assert((select count(*)=1 from public.payment_events where provider_event_id='phase3-success-event'),'one event for duplicate');
select pg_temp.assert((
  select count(*)=1 from public.order_status_events
  where order_id=(select order_id from phase3_attempt) and to_status='paid'
),'success callback records one paid order event');
select pg_temp.assert((
  select count(*)=1 from public.notification_outbox
  where aggregate_id=(select order_id from phase3_attempt)
    and recipient_kind='customer' and template_key='order_status_paid'
),'success callback queues one customer notification');
select pg_temp.assert((
  select count(*)=1 from public.notification_outbox
  where aggregate_id=(select order_id from phase3_attempt)
    and recipient_kind='staff' and template_key='staff_paid'
),'success callback queues one staff notification');
select pg_temp.assert((
  select count(*)=1 from public.financial_audit_log
  where payment_id=(select payment_id from phase3_attempt) and action='payment_marked_paid'
),'success callback records one immutable financial audit event');
select pg_temp.assert((
  public.ingest_paytr_callback(
    (select merchant_order_id from phase3_attempt),'phase3-conflict-event','failed',10000,10000,'TL',
    '{"status":"failed","failed_reason_code":"0"}'::jsonb,'37000000-0000-0000-0000-000000000003'
  )->>'outcome'='ignored_conflict'
),'paid precedence rejects later failure');
select pg_temp.assert((select status='paid' from public.payments where id=(select payment_id from phase3_attempt)),'paid never moves backward');
select pg_temp.assert((select count(*)=0 from public.notification_outbox where event_type='payment_failed'),'conflict sends no failure notification');
reset role;

set local role anon;
select pg_temp.assert(not has_table_privilege('anon','public.payments','select'),'anon cannot read payments');
select pg_temp.assert(not has_table_privilege('anon','public.refunds','select'),'anon cannot read refunds');
select pg_temp.assert(not has_table_privilege('anon','public.financial_audit_log','select'),'anon cannot read financial audit');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000001',true);
select pg_temp.assert(not exists(select 1 from public.payments),'customer cannot read raw payment table');
select pg_temp.assert((select count(*)=1 from public.get_customer_payment_summaries(null)),'customer reads safe payment summary');
select pg_temp.assert(not has_table_privilege('authenticated','public.payments','update'),'customer cannot mutate payments');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000003',true);
do $$ begin
  perform public.request_finance_refund(
    (select payment_id from phase3_attempt),1000,'customer_request',
    (select order_number from phase3_attempt),'phase3-viewer-denied-0001','must fail'
  );
  raise exception 'finance viewer unexpectedly refunded';
exception when sqlstate '42501' then null; end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000004',true);
do $$ begin
  perform public.request_finance_refund(
    (select payment_id from phase3_attempt),1000,'customer_request',
    (select order_number from phase3_attempt),'phase3-inactive-denied-01','must fail'
  );
  raise exception 'inactive admin unexpectedly refunded';
exception when sqlstate '42501' then null; end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000002',true);
do $$
begin
  perform public.transition_order_status((select order_id from phase3_attempt),'refunded','unsafe');
  raise exception 'manual financial transition unexpectedly accepted';
exception when sqlstate '42501' then null;
end;
$$;
create temporary table phase3_refund as
select public.request_finance_refund(
  (select payment_id from phase3_attempt),2500,'customer_request',
  (select order_number from phase3_attempt),'phase3-refund-key-00000001','test partial refund'
) as id;
grant select on phase3_refund to authenticated,service_role;
select pg_temp.assert((
  select id=public.request_finance_refund(
    (select payment_id from phase3_attempt),2500,'customer_request',
    (select order_number from phase3_attempt),'phase3-refund-key-00000001','duplicate'
  ) from phase3_refund
),'duplicate refund request is idempotent');
select public.approve_finance_refund(
  (select id from phase3_refund),'REFUND '||(select order_number from phase3_attempt)
);
reset role;

set local role service_role;
select public.mark_refund_submitted((select id from phase3_refund));
select public.record_refund_submission((select id from phase3_refund),true,'SIM-REF-1',null,false);
select pg_temp.assert((select status='partially_refunded' from public.payments where id=(select payment_id from phase3_attempt)),'partial refund status exact');
select pg_temp.assert((select payment_status='partially_refunded' from public.orders where id=(select order_id from phase3_attempt)),'order payment status exact');
select pg_temp.assert((
  select count(*)=4 from public.financial_audit_log
  where refund_id=(select id from phase3_refund)
    and action in ('refund_requested','refund_approved','refund_submitted','refund_succeeded')
),'refund lifecycle records every financial audit stage once');
select pg_temp.assert((
  select count(*)=1 from public.notification_outbox
  where aggregate_id=(select id from phase3_refund)
    and recipient_kind='customer' and template_key='refund_succeeded'
),'partial refund queues one success notification');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000002',true);
do $$
begin
  perform public.request_finance_refund(
    (select payment_id from phase3_attempt),8000,'customer_request',
    (select order_number from phase3_attempt),'phase3-refund-key-00000002','must fail'
  );
  raise exception 'over-refund unexpectedly accepted';
exception when sqlstate '22023' then null;
end;
$$;

reset role;
set local role service_role;

do $$
begin
  update public.payment_events set outcome='failed' where provider_event_id='phase3-success-event';
  raise exception 'immutable payment event unexpectedly updated';
exception when sqlstate '42501' then null;
end;
$$;

do $$
begin
  update public.financial_audit_log set metadata='{"tampered":true}'::jsonb
  where payment_id=(select payment_id from phase3_attempt) and action='payment_marked_paid';
  raise exception 'immutable financial audit unexpectedly updated';
exception when sqlstate '42501' then null;
end;
$$;

update public.payments set status='pending',created_at=now()-interval '2 hours'
where id=(select payment_id from phase3_attempt);
select public.detect_payment_discrepancies(100,45);
select pg_temp.assert(exists(
  select 1 from public.payment_reconciliation_discrepancies
  where payment_id=(select payment_id from phase3_attempt) and discrepancy_type='stuck_pending'
),'stuck pending detected');
reset role;

rollback;
