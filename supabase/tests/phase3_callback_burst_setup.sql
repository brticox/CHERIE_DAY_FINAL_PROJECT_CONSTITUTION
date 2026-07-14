insert into auth.users(id,email) values
  ('41000000-0000-0000-0000-000000000001','burst@example.test')
on conflict(id) do nothing;
delete from public.customers where auth_user_id='41000000-0000-0000-0000-000000000001';
insert into public.customers(id,auth_user_id,name,email) values
  ('42000000-0000-0000-0000-000000000001','41000000-0000-0000-0000-000000000001','Burst Customer','burst@example.test');
insert into public.orders(
  id,order_number,customer_id,status,payment_status,total_amount,currency
) values (
  '43000000-0000-0000-0000-000000000001','CD-BURST-0001',
  '42000000-0000-0000-0000-000000000001','pending_payment','pending',100.00,'TRY'
);
insert into public.payments(
  id,order_id,provider,provider_conversation_id,status,amount,amount_minor,currency,
  idempotency_key,attempt_number,correlation_id
) values (
  '44000000-0000-0000-0000-000000000001','43000000-0000-0000-0000-000000000001',
  'paytr','PHASE3BURSTA1','pending',100.00,10000,'TRY','phase3-burst-payment-key',1,
  '45000000-0000-0000-0000-000000000001'
);
