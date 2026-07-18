-- Phase 2 admin RPC/RLS verification. Run only on a disposable database after
-- every migration. All fixtures and mutations roll back.
begin;

create function pg_temp.assert_true(condition boolean, label text)
returns void language plpgsql as $$
begin
  if not condition then
    raise exception 'PHASE 2 CHECK FAILED: %', label;
  end if;
  raise notice 'ok: %', label;
end
$$;

insert into auth.users (id,email,raw_user_meta_data) values
  ('c0000000-0000-0000-0000-000000000001','commerce@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000002','editor@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000003','publisher@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000004','admin@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000005','sales@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000006','operations@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000007','support@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000008','superadmin@test.local','{}'),
  ('c0000000-0000-0000-0000-000000000009','customer@test.local','{}');

insert into public.staff_users (id,auth_user_id,name,email,role) values
  ('d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Commerce','commerce@test.local','commerce_manager'),
  ('d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','Editor','editor@test.local','content_editor'),
  ('d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003','Publisher','publisher@test.local','content_publisher'),
  ('d0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004','Admin','admin@test.local','admin'),
  ('d0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005','Sales','sales@test.local','sales_crm'),
  ('d0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006','Operations','operations@test.local','operations'),
  ('d0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007','Support','support@test.local','support_agent'),
  ('d0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008','Superadmin','superadmin@test.local','superadmin');

insert into public.products (
  id,name,slug,description,behavior_type,base_price,status
) values (
  'e0000000-0000-0000-0000-000000000001','Phase Two Product',
  'phase-two-product','A complete publishable product description for testing.',
  'cart_enabled',1250,'draft'
);
insert into public.media_assets (
  id,bucket,storage_path,alt_text,type,is_public,mime_type,size_bytes,width,height,content_hash
) values (
  'e0000000-0000-0000-0000-000000000002','public-media',
  'c0000000-0000-0000-0000-000000000001/product.webp',
  'Phase two product','image',true,'image/webp',1024,1200,1200,'phase2-test-hash'
);
insert into public.pages (id,slug,title,body,status) values (
  'e0000000-0000-0000-0000-000000000003','phase-two-page',
  'Phase Two Page','{"hero":{"heading":"Draft"}}','draft'
);
insert into public.legal_documents (id,doc_key,title_tr,slug,status) values
  ('f0000000-0000-0000-0000-000000000001','kvkk_aydinlatma','KVKK Test','phase2-kvkk-test','draft'),
  ('f0000000-0000-0000-0000-000000000002','gizlilik','Gizlilik Test','phase2-gizlilik-test','draft')
on conflict (doc_key) do nothing;
insert into public.legal_document_versions (
  id,legal_document_id,version,body,effective_from,lifecycle_state,
  approval_status,needs_lawyer_review,content_hash,summary
)
select
  'e0000000-0000-0000-0000-000000000004',id,'phase2-approved',
  '{"sections":[{"title":"Test","body":"Approved legal content"}]}',
  current_date,'approved','approved',false,'phase2-approved-hash','Approved test'
from public.legal_documents where doc_key='kvkk_aydinlatma';
insert into public.legal_document_versions (
  id,legal_document_id,version,body,effective_from,lifecycle_state,
  approval_status,needs_lawyer_review,content_hash,summary
)
select
  'e0000000-0000-0000-0000-000000000005',id,'phase2-review',
  '{"sections":[{"title":"Review","body":"Requires lawyer review"}]}',
  current_date,'awaiting_legal_review','pending',true,'phase2-review-hash','Review test'
from public.legal_documents where doc_key='gizlilik';
insert into public.leads (
  id,source_type,name,email,phone,message,status,priority
) values (
  'e0000000-0000-0000-0000-000000000006','contact_form','CRM Test',
  'crm-test@example.com','+905551112233','Phase 2 CRM test','new','normal'
);

insert into public.orders (id,order_number,customer_id,total_amount) select
  'e0000000-0000-0000-0000-000000000007','CD-PHASE2-TEST',id,2500
from public.customers where auth_user_id='c0000000-0000-0000-0000-000000000009';
insert into public.order_items (
  id,order_id,product_id,product_snapshot,quantity,unit_price,total_price
) values (
  'e0000000-0000-0000-0000-000000000008',
  'e0000000-0000-0000-0000-000000000007',
  'e0000000-0000-0000-0000-000000000001','{"name":"Phase Two Product"}',1,2500,2500
);
insert into public.production_jobs (
  id,order_id,order_item_id,status,material_ready
) values (
  'e0000000-0000-0000-0000-000000000009',
  'e0000000-0000-0000-0000-000000000007',
  'e0000000-0000-0000-0000-000000000008','quality_check',true
);
insert into public.notification_outbox (
  id,channel,template_key,payload,status,event_type,aggregate_type,
  aggregate_id,recipient_kind,category,idempotency_key,last_error
) values (
  'e0000000-0000-0000-0000-000000000010','email','phase2_retry','{}',
  'retry_scheduled','phase2_test','order',
  'e0000000-0000-0000-0000-000000000007','staff','operational',
  'phase2-retry-test','temporary provider error'
);

select pg_temp.assert_true(
  not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'admin\_%' escape '\'
      and has_function_privilege('anon',p.oid,'execute')
  ),
  'anon cannot execute any admin RPC'
);

create function pg_temp.assert_customer_admin_denied()
returns void language plpgsql security invoker as $$
begin
  begin
    perform public.admin_publish_product('e0000000-0000-0000-0000-000000000001');
  exception when insufficient_privilege then return;
  end;
  raise exception 'PHASE 2 CHECK FAILED: ordinary customer reached admin RPC';
end
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000009',true);
select pg_temp.assert_customer_admin_denied();
reset role;

-- Commerce: ordered media assignment, publish, archive, and restore are atomic.
set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000001',true);
select public.admin_set_product_media(
  'e0000000-0000-0000-0000-000000000001',
  array['e0000000-0000-0000-0000-000000000002'::uuid]
);
select (public.admin_publish_product('e0000000-0000-0000-0000-000000000001')).id;
select public.admin_archive_product('e0000000-0000-0000-0000-000000000001');
select public.admin_restore_product('e0000000-0000-0000-0000-000000000001');
reset role;
select pg_temp.assert_true(
  (select status='draft' and archived_at is null and cardinality(media_ids)=1
   from public.products where id='e0000000-0000-0000-0000-000000000001'),
  'commerce lifecycle and media ordering succeed'
);
select pg_temp.assert_true(
  (select count(*)=3 from public.product_publication_events
   where product_id='e0000000-0000-0000-0000-000000000001'
     and action in ('published','archived','restored')),
  'product lifecycle history is complete'
);

-- CMS: editor saves revisions; publisher owns publication.
set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000002',true);
select (public.admin_save_page(
  'e0000000-0000-0000-0000-000000000003','Phase Two Updated',
  'phase-two-updated','{"hero":{"heading":"Structured content"}}'
)).id;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000003',true);
select public.admin_publish_page('e0000000-0000-0000-0000-000000000003');
reset role;
select pg_temp.assert_true(
  (select status='published' from public.pages
   where id='e0000000-0000-0000-0000-000000000003'),
  'CMS save and publish role split succeeds'
);
select pg_temp.assert_true(
  (select count(*)=2 from public.content_revisions
   where entity_type='page' and entity_id='e0000000-0000-0000-0000-000000000003'),
  'CMS revision history records save and publish'
);

create function pg_temp.assert_legal_review_blocked()
returns void language plpgsql security invoker as $$
begin
  begin
    perform public.admin_publish_legal_version(
      'e0000000-0000-0000-0000-000000000005','{}'
    );
  exception when check_violation then return;
  end;
  raise exception 'PHASE 2 CHECK FAILED: lawyer review gate did not block publish';
end
$$;
create function pg_temp.assert_legal_immutable()
returns void language plpgsql security invoker as $$
begin
  begin
    update public.legal_document_versions
    set body='{"tampered":true}'
    where id='e0000000-0000-0000-0000-000000000004';
  exception when check_violation or integrity_constraint_violation
    or object_not_in_prerequisite_state then return;
  end;
  raise exception 'PHASE 2 CHECK FAILED: published legal body was mutable';
end
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000004',true);
select pg_temp.assert_legal_review_blocked();
select public.admin_publish_legal_version(
  'e0000000-0000-0000-0000-000000000004','{"lawyer":"Test Counsel"}'
);
select pg_temp.assert_legal_immutable();
reset role;
select pg_temp.assert_true(
  (select lifecycle_state='published' and is_current
   from public.legal_document_versions
   where id='e0000000-0000-0000-0000-000000000004'),
  'approved legal publication is atomic'
);

-- CRM: role-scoped update, history, note, conversion, and audit.
set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000005',true);
select public.admin_update_lead(
  'e0000000-0000-0000-0000-000000000006','negotiation','high',
  'd0000000-0000-0000-0000-000000000005',now() + interval '1 day',
  'Follow-up recorded',null
);
select public.admin_convert_lead('e0000000-0000-0000-0000-000000000006','customer');
reset role;
select pg_temp.assert_true(
  (select status='won' and converted_customer_id is not null
   from public.leads where id='e0000000-0000-0000-0000-000000000006'),
  'CRM update and customer conversion succeed'
);

-- Operations: quality and shipment workflows execute for the declared role.
set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000006',true);
select public.admin_complete_quality_check(
  'e0000000-0000-0000-0000-000000000009',
  '[{"key":"finish","label":"Finish","required":true,"passed":true}]',
  'Quality passed'
);
select public.admin_create_shipment(
  'e0000000-0000-0000-0000-000000000007','Test Carrier','TRACK-P2-001',2,
  'Two packages'
);
reset role;
select pg_temp.assert_true(
  (select status='passed' from public.production_jobs
   where id='e0000000-0000-0000-0000-000000000009'),
  'operations role completes quality check'
);
select pg_temp.assert_true(
  exists(select 1 from public.shipments
    where order_id='e0000000-0000-0000-0000-000000000007'
      and package_count=2 and tracking_number='TRACK-P2-001'),
  'operations role creates shipment and package metadata'
);

-- Support retry and superadmin staff mutation are audited and constrained.
set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000007',true);
select public.admin_retry_notification('e0000000-0000-0000-0000-000000000010');
reset role;
select pg_temp.assert_true(
  (select status='queued' and locked_at is null
   from public.notification_outbox
   where id='e0000000-0000-0000-0000-000000000010'),
  'support role performs safe notification retry'
);

set local role authenticated;
select set_config('request.jwt.claim.sub','c0000000-0000-0000-0000-000000000008',true);
select public.admin_update_staff(
  'd0000000-0000-0000-0000-000000000007','support_agent',false
);
reset role;
select pg_temp.assert_true(
  not (select is_active from public.staff_users
       where id='d0000000-0000-0000-0000-000000000007'),
  'superadmin can deactivate another staff account'
);
select pg_temp.assert_true(
  (select count(*) >= 12 from public.audit_log
   where staff_user_id in (
     'd0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000002',
     'd0000000-0000-0000-0000-000000000003',
     'd0000000-0000-0000-0000-000000000004',
     'd0000000-0000-0000-0000-000000000005',
     'd0000000-0000-0000-0000-000000000006',
     'd0000000-0000-0000-0000-000000000007',
     'd0000000-0000-0000-0000-000000000008'
   )),
  'Phase 2 mutations produce a complete audit trail'
);

rollback;
