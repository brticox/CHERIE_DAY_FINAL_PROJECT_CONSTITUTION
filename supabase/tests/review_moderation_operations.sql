-- Review moderation verification. Run only on a disposable/local database.
-- Every fixture and mutation rolls back.
begin;

create function pg_temp.assert_true(condition boolean, label text)
returns void language plpgsql as $$
begin
  if not condition then raise exception 'REVIEW CHECK FAILED: %', label; end if;
  raise notice 'ok: %', label;
end
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('ca000000-0000-0000-0000-000000000001', 'review-editor@test.local', '{}'),
  ('ca000000-0000-0000-0000-000000000002', 'review-publisher@test.local', '{}'),
  ('ca000000-0000-0000-0000-000000000003', 'review-admin@test.local', '{}'),
  ('ca000000-0000-0000-0000-000000000004', 'review-customer@test.local', '{}');

insert into public.staff_users (id, auth_user_id, name, role) values
  ('da000000-0000-0000-0000-000000000001', 'ca000000-0000-0000-0000-000000000001', 'Review Editor', 'content_editor'),
  ('da000000-0000-0000-0000-000000000002', 'ca000000-0000-0000-0000-000000000002', 'Review Publisher', 'content_publisher'),
  ('da000000-0000-0000-0000-000000000003', 'ca000000-0000-0000-0000-000000000003', 'Review Admin', 'admin');

insert into public.reviews (
  id, customer_id, subject_type, rating, title, body, status
)
select
  'ea000000-0000-0000-0000-000000000001', id, 'brand', 5,
  'Test review', 'Moderation workflow test review', 'pending'
from public.customers where auth_user_id = 'ca000000-0000-0000-0000-000000000004';

select pg_temp.assert_true(
  not has_function_privilege('anon', 'public.admin_moderate_review(uuid,public.review_status,text)', 'execute'),
  'anon cannot execute review moderation'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'ca000000-0000-0000-0000-000000000001', true);
do $$
begin
  begin
    perform public.admin_moderate_review(
      'ea000000-0000-0000-0000-000000000001', 'approved', ''
    );
  exception when insufficient_privilege then return;
  end;
  raise exception 'REVIEW CHECK FAILED: content editor moderated a review';
end
$$;

select set_config('request.jwt.claim.sub', 'ca000000-0000-0000-0000-000000000002', true);
select public.admin_moderate_review(
  'ea000000-0000-0000-0000-000000000001', 'approved', ''
);
select pg_temp.assert_true(
  (select status = 'approved' and moderated_by = 'da000000-0000-0000-0000-000000000002'
   from public.reviews where id = 'ea000000-0000-0000-0000-000000000001'),
  'publisher approves and stamps the review'
);

do $$
begin
  begin
    perform public.admin_moderate_review(
      'ea000000-0000-0000-0000-000000000001', 'hidden', ''
    );
  exception when invalid_parameter_value then return;
  end;
  raise exception 'REVIEW CHECK FAILED: hidden review accepted without a note';
end
$$;

select public.admin_moderate_review(
  'ea000000-0000-0000-0000-000000000001', 'hidden', 'Uygunsuz kişisel bilgi'
);
select pg_temp.assert_true(
  (select status = 'hidden' and moderation_note = 'Uygunsuz kişisel bilgi'
   from public.reviews where id = 'ea000000-0000-0000-0000-000000000001'),
  'publisher hides a review with a reason'
);

select set_config('request.jwt.claim.sub', 'ca000000-0000-0000-0000-000000000003', true);
select public.admin_delete_review(
  'ea000000-0000-0000-0000-000000000001', 'SIL'
);
select pg_temp.assert_true(
  not exists (select 1 from public.reviews where id = 'ea000000-0000-0000-0000-000000000001'),
  'admin deletes only after a moderated terminal state'
);
select pg_temp.assert_true(
  (select count(*) = 3 from public.audit_log
   where entity_type = 'review' and entity_id = 'ea000000-0000-0000-0000-000000000001'),
  'moderation and deletion keep an audit trail'
);

rollback;
