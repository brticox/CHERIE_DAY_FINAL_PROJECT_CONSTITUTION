-- Run only against a disposable/local Supabase database after all migrations.
begin;

do $$
declare first_id uuid; second_id uuid; aggregate uuid := gen_random_uuid();
begin
  select public.enqueue_notification(
    'test_event','test',aggregate,'staff',null,null,null,'staff_new_contact',
    '{}'::jsonb,'phase1-test:' || aggregate::text,'operational','tr-TR'
  ) into first_id;
  select public.enqueue_notification(
    'test_event','test',aggregate,'staff',null,null,null,'staff_new_contact',
    '{}'::jsonb,'phase1-test:' || aggregate::text,'operational','tr-TR'
  ) into second_id;
  if first_id is distinct from second_id then raise exception 'duplicate enqueue was not idempotent'; end if;
  if (select count(*) from public.notification_outbox where idempotency_key = 'phase1-test:' || aggregate::text) <> 1
    then raise exception 'duplicate outbox row created'; end if;
end $$;

do $$
begin
  if exists (
    select 1 from public.legal_documents_public
    where coalesce((body ->> 'placeholder')::boolean, false) = true
  ) then raise exception 'placeholder legal content leaked through public view'; end if;
end $$;

rollback;
