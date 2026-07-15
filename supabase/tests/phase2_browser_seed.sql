-- Safe operational fixtures for authenticated Phase 2 browser QA.
-- Run only after a local/disposable Supabase reset.

insert into public.customers (id,name,email,phone,status,kvkk_consent_at)
values (
  '91000000-0000-0000-0000-000000000001','Elif Yılmaz',
  'elif.qa@example.com','+90 555 111 22 33','active',now()
);

insert into public.leads (
  id,source_type,name,email,phone,event_type,event_date_or_season,location,
  message,status,priority,next_follow_up_at
) values
  ('91000000-0000-0000-0000-000000000002','hayalini_tasarla','Derya Kaya',
   'derya.qa@example.com','+90 555 222 33 44','Düğün','2026 Sonbahar','İstanbul',
   'Bahçe düğünü ve kişiselleştirilmiş davetiye talebi.','new','urgent',now()-interval '1 day'),
  ('91000000-0000-0000-0000-000000000003','quote_request','Mert Aydın',
   'mert.qa@example.com','+90 555 333 44 55','Nişan','2026-09-12','Ankara',
   'Nişan paketi ve fotoğraf teklifi.','negotiation','high',now()+interval '2 days');

insert into public.pages (id,slug,title,body,status) values (
  '91000000-0000-0000-0000-000000000004','home','Ana Sayfa',
  '{
    "hero":{"eyebrow":"CHERIE DAY","heading":"Kutlamanızın imza dünyası","copy":"Ürün, hizmet ve hatıra tek bir zarif akışta.","primaryCta":{"label":"Dünyaları keşfet","href":"/magaza"}},
    "sections":[
      {"key":"featuredProducts","visible":true,"heading":"Seçili tasarımlar"},
      {"key":"services","visible":true,"heading":"Kutlamanın her anı"},
      {"key":"testimonials","visible":true,"heading":"CHERIE çiftleri"}
    ],
    "footer":{"supportEmail":"merhaba@cherieday.example"}
  }'::jsonb,'draft'
);

insert into public.orders (
  id,order_number,customer_id,status,payment_status,total_amount,currency,
  internal_note,customer_note,legal_snapshot
) values (
  '92000000-0000-0000-0000-000000000001','CD-QA-20260714-001',
  '91000000-0000-0000-0000-000000000001','quality_check','paid',4250,'TRY',
  'Kalite kontrolü bugün tamamlanmalı.','Paket kartına Elif & Can yazılacak.',
  '{"kvkk":"qa-v1","distance_sales":"qa-v1"}'
);

insert into public.order_items (
  id,order_id,product_id,product_snapshot,quantity,requires_proof,unit_price,total_price
)
select
  '92000000-0000-0000-0000-000000000002',
  '92000000-0000-0000-0000-000000000001',id,
  jsonb_build_object('name',name,'slug',slug),1,true,4250,4250
from public.products order by sort_order,id limit 1;

insert into public.product_proofs (
  id,order_id,order_item_id,version,status,customer_comment,sent_at,
  assigned_staff_id,due_at,file_name,mime_type,file_size_bytes
) values (
  '92000000-0000-0000-0000-000000000003',
  '92000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000002',2,'revision_requested',
  'Tarih satırını biraz büyütebilir miyiz?',now()-interval '4 hours',
  (select id from public.staff_users where role='proof_designer' limit 1),
  now()+interval '20 hours','davetiye-proof-v2.pdf','application/pdf',245760
);

insert into public.production_jobs (
  id,order_id,order_item_id,approved_proof_id,status,priority,due_at,
  assigned_staff_id,material_ready,internal_note
) values (
  '92000000-0000-0000-0000-000000000004',
  '92000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000002',null,'quality_check',9,
  now()+interval '1 day',(select id from public.staff_users where role='order_operations' limit 1),
  true,'Baskı ve kurdele hazır.'
);

insert into public.shipments (
  id,order_id,carrier_name,tracking_number,status,package_count,internal_note
) values (
  '92000000-0000-0000-0000-000000000005',
  '92000000-0000-0000-0000-000000000001','Yurtiçi Kargo','QA-TRACK-260714',
  'preparing',2,'İki ayrı korumalı kutu.'
);
insert into public.tracking_events (shipment_id,status,message_tr)
values ('92000000-0000-0000-0000-000000000005','preparing','Gönderi kaydı hazırlandı.');

insert into public.payments (
  id,order_id,provider,status,amount,amount_minor,captured_total_minor,currency,
  provider_payment_id,provider_conversation_id,idempotency_key,correlation_id,paid_at
) values (
  '92000000-0000-0000-0000-000000000006',
  '92000000-0000-0000-0000-000000000001','iyzico','paid',4250,425000,425000,'TRY',
  'qa-provider-payment','QA20260714PAID','qa-payment-20260714-0001',
  '96000000-0000-0000-0000-000000000001',now()-interval '2 days'
);
insert into public.payment_events (
  payment_id,provider,event_type,provider_event_id,signature_valid,processing_status,
  payload,correlation_id,outcome,payload_digest
) values (
  '92000000-0000-0000-0000-000000000006','iyzico','payment.succeeded',
  'qa-provider-event-1',true,'applied','{"source":"integration_browser_qa"}',
  '96000000-0000-0000-0000-000000000001','applied',repeat('a',64)
);

-- Phase 3 finance records intentionally extend the Phase 2 operational
-- fixture so the integrated admin can be reviewed without fake UI metrics.
insert into public.payments (
  id,order_id,provider,status,amount,amount_minor,currency,provider_conversation_id,
  idempotency_key,attempt_number,correlation_id,last_error_code,created_at
) values (
  '92000000-0000-0000-0000-000000000007',
  '92000000-0000-0000-0000-000000000001','paytr','failed',4250,425000,'TRY',
  'QA20260714FAILED','qa-payment-20260714-0002',2,
  '96000000-0000-0000-0000-000000000002','provider_declined',now()-interval '3 hours'
);
insert into public.payment_events (
  id,payment_id,provider,event_type,provider_event_id,signature_valid,
  processing_status,payload,correlation_id,outcome,payload_digest
) values (
  '92000000-0000-0000-0000-000000000008',
  '92000000-0000-0000-0000-000000000007','paytr','paytr.failed',
  'qa-provider-event-2',true,'applied','{"failed_reason_code":"provider_declined"}',
  '96000000-0000-0000-0000-000000000002','applied',repeat('b',64)
);
insert into public.refunds (
  id,order_id,payment_id,amount,amount_minor,reason,type,status,notes_internal,
  created_by,requested_by,idempotency_key,correlation_id
) values (
  '92000000-0000-0000-0000-000000000009',
  '92000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000006',750,75000,'customer_request','partial',
  'requested','Müşteri talebi finans onayı bekliyor.',
  (select id from public.staff_users where role='admin' limit 1),
  (select id from public.staff_users where role='admin' limit 1),
  'qa-refund-20260714-0001','96000000-0000-0000-0000-000000000003'
);
insert into public.payment_reconciliation_discrepancies (
  id,fingerprint,discrepancy_type,severity,status,order_id,payment_id,payment_event_id,
  expected_amount_minor,provider_amount_minor,provider_reference,evidence,recommended_action
) values (
  '92000000-0000-0000-0000-000000000010','qa:amount-mismatch:20260714',
  'amount_mismatch','critical','open','92000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000007','92000000-0000-0000-0000-000000000008',
  425000,420000,'QA20260714FAILED','{"source":"integration_browser_qa"}',
  'Sağlayıcı tutarını sipariş kanıtıyla karşılaştırın; otomatik düzeltme yapmayın.'
);
insert into public.financial_audit_log (
  action,severity,actor_type,order_id,payment_id,payment_event_id,refund_id,
  correlation_id,provider_event_id,metadata,created_at
) values
  ('payment_marked_paid','info','provider','92000000-0000-0000-0000-000000000001',
   '92000000-0000-0000-0000-000000000006',null,null,
   '96000000-0000-0000-0000-000000000001','qa-provider-event-1',
   '{"amount_minor":425000}',now()-interval '2 days'),
  ('payment_marked_failed','warning','provider','92000000-0000-0000-0000-000000000001',
   '92000000-0000-0000-0000-000000000007','92000000-0000-0000-0000-000000000008',null,
   '96000000-0000-0000-0000-000000000002','qa-provider-event-2',
   '{"amount_minor":425000}',now()-interval '3 hours'),
  ('refund_requested','info','staff','92000000-0000-0000-0000-000000000001',
   '92000000-0000-0000-0000-000000000006',null,'92000000-0000-0000-0000-000000000009',
   '96000000-0000-0000-0000-000000000003',null,
   '{"amount_minor":75000}',now()-interval '1 hour');

insert into public.consultations (
  id,consultation_number,customer_id,service_category,preferred_slots,
  confirmed_slot,channel,status,note,assigned_staff_id
) values (
  '93000000-0000-0000-0000-000000000001','CNS-QA-001',
  '91000000-0000-0000-0000-000000000001','organizasyon',
  '["2026-07-16T11:00:00+03:00"]','{"start":"2026-07-16T11:00:00+03:00","duration":45}',
  'online','confirmed','Konsept ve bütçe görüşmesi.',
  (select id from public.staff_users where role='service_operations' limit 1)
);

insert into public.quotes (
  id,quote_number,customer_id,items,event_type,event_date,city,total,
  deposit_required,valid_until,status,notes_customer,created_by
) values (
  '93000000-0000-0000-0000-000000000002','QT-QA-001',
  '91000000-0000-0000-0000-000000000001',
  '[{"label":"Nişan & Söz Organizasyonu","quantity":1,"amount":32000}]',
  'Nişan',current_date+60,'İstanbul',32000,9600,current_date+10,'accepted',
  'Teklif 30% depozito ile kesinleşir.',
  (select id from public.staff_users where role='sales_crm' limit 1)
);

insert into public.reservations (
  id,reservation_number,customer_id,service_package_id,quote_id,event_date,event_time,
  city_id,event_location,guest_count,total_amount,deposit_amount,deposit_paid_at,
  balance_due_date,status,assigned_staff_id
)
select
  '93000000-0000-0000-0000-000000000003','RSV-QA-001',
  '91000000-0000-0000-0000-000000000001',sp.id,
  '93000000-0000-0000-0000-000000000002',current_date+60,'19:00',sc.id,
  '{"venue":"QA Bahçe","district":"Sarıyer"}',120,32000,9600,now()-interval '1 day',
  current_date+45,'in_planning',
  (select id from public.staff_users where role='service_operations' limit 1)
from public.service_packages sp
cross join public.service_cities sc
where sp.slug='nisan-soz-organizasyonu' and sc.city_slug='istanbul';

insert into public.service_briefs (reservation_id,brief_json)
values (
  '93000000-0000-0000-0000-000000000003',
  '{"palette":["ivory","cherry"],"style":"romantic editorial","mustHave":["welcome sign","photo corner"]}'
);
insert into public.service_milestones (
  reservation_id,title_tr,type,amount,due_date,status,sort_order
) values
  ('93000000-0000-0000-0000-000000000003','Depozito','deposit',9600,current_date-1,'paid',1),
  ('93000000-0000-0000-0000-000000000003','Konsept onayı','approval_step',null,current_date+14,'pending',2),
  ('93000000-0000-0000-0000-000000000003','Kalan ödeme','final_payment',22400,current_date+45,'pending',3);

insert into public.customer_support_threads (
  id,customer_id,order_id,source,subject,status,assigned_staff_id
) values (
  '94000000-0000-0000-0000-000000000001',
  '91000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000001','order',
  'Teslimat adresi teyidi','waiting_team',
  (select id from public.staff_users where role='support_agent' limit 1)
);
insert into public.customer_support_messages (
  thread_id,sender_type,message,is_internal_note
) values
  ('94000000-0000-0000-0000-000000000001','customer','Teslimat adresini teyit eder misiniz?',false),
  ('94000000-0000-0000-0000-000000000001','staff','Adres sipariş kaydıyla eşleşiyor.',true);

insert into public.notification_outbox (
  id,customer_id,order_id,channel,template_key,payload,status,event_type,
  aggregate_type,aggregate_id,recipient_email,recipient_kind,category,
  idempotency_key,next_attempt_at,last_error,last_error_code
) values (
  '95000000-0000-0000-0000-000000000001',
  '91000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000001','email','proof_ready',
  '{"order_number":"CD-QA-20260714-001"}','retry_scheduled','proof.ready',
  'order','92000000-0000-0000-0000-000000000001','elif.qa@example.com','customer',
  'transactional','qa-proof-ready-1',now(),'Provider timeout','provider_timeout'
);
