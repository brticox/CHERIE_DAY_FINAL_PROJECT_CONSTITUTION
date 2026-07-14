begin;

insert into auth.users (id, email, raw_user_meta_data)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'identity-test@cherieday.example',
  '{"name":"Kimlik Testi"}'::jsonb
);

do $$
declare v_count integer;
begin
  select count(*) into v_count from public.customers
  where auth_user_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  if v_count <> 1 then raise exception 'customer provisioning is not idempotent'; end if;
  if not exists (select 1 from pg_class c where c.relname = 'customer_identity_events' and c.relrowsecurity)
    then raise exception 'identity event RLS is not enabled'; end if;
  if has_table_privilege('authenticated', 'public.email_delivery_events', 'INSERT')
    then raise exception 'authenticated may insert delivery events'; end if;
  if has_function_privilege('authenticated', 'public.ingest_resend_delivery_event(text,text,text,timestamptz)', 'EXECUTE')
    then raise exception 'authenticated may ingest Resend events'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"}', true);

do $$
declare v_customer public.customers;
begin
  select * into v_customer from public.ensure_current_customer_profile();
  if v_customer.status <> 'active' then raise exception 'customer is not active'; end if;
end $$;

reset role;
rollback;
