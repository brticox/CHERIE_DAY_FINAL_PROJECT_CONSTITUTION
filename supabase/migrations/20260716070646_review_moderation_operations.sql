-- Review moderation is an explicit, authenticated operation with an immutable
-- audit trail. Reads may use the service-role admin client after a server-side
-- capability check; writes stay on the operator's authenticated RLS session.

create or replace function public.admin_moderate_review(
  p_review_id uuid,
  p_status public.review_status,
  p_note text
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_staff uuid;
  v_review public.reviews;
  v_note text := nullif(trim(p_note), '');
begin
  if not (select public.has_staff_role(array['content_publisher','admin'])) then
    raise exception 'review moderation permission required' using errcode = '42501';
  end if;
  if p_status not in ('approved'::public.review_status, 'rejected'::public.review_status, 'hidden'::public.review_status) then
    raise exception 'invalid review moderation status' using errcode = '22023';
  end if;
  if length(coalesce(v_note, '')) > 1000 then
    raise exception 'moderation note is too long' using errcode = '22023';
  end if;
  if p_status in ('rejected'::public.review_status, 'hidden'::public.review_status)
    and length(coalesce(v_note, '')) < 3 then
    raise exception 'moderation note is required' using errcode = '22023';
  end if;

  v_staff := public.current_staff_id();
  select * into v_review from public.reviews where id = p_review_id for update;
  if v_review.id is null then
    raise exception 'review not found' using errcode = 'P0002';
  end if;

  update public.reviews
  set status = p_status,
      moderation_note = v_note,
      moderated_by = v_staff,
      moderated_at = now(),
      updated_at = now()
  where id = p_review_id;

  insert into public.audit_log (staff_user_id, action, entity_type, entity_id, diff)
  values (
    v_staff,
    'review.moderated',
    'review',
    p_review_id,
    jsonb_build_object(
      'from_status', v_review.status,
      'to_status', p_status,
      'note_recorded', v_note is not null
    )
  );
end;
$$;

create or replace function public.admin_delete_review(
  p_review_id uuid,
  p_confirmation text
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_staff uuid;
  v_review public.reviews;
begin
  if not (select public.has_staff_role(array['admin'])) then
    raise exception 'review deletion permission required' using errcode = '42501';
  end if;
  if p_confirmation <> 'SIL' then
    raise exception 'review deletion confirmation required' using errcode = '22023';
  end if;

  v_staff := public.current_staff_id();
  select * into v_review from public.reviews where id = p_review_id for update;
  if v_review.id is null then
    raise exception 'review not found' using errcode = 'P0002';
  end if;
  if v_review.status not in ('rejected'::public.review_status, 'hidden'::public.review_status) then
    raise exception 'review must be rejected or hidden before deletion' using errcode = '23514';
  end if;

  insert into public.audit_log (staff_user_id, action, entity_type, entity_id, diff)
  values (
    v_staff,
    'review.deleted',
    'review',
    p_review_id,
    jsonb_build_object(
      'previous_status', v_review.status,
      'subject_type', v_review.subject_type,
      'verified_purchase', v_review.is_verified_purchase,
      'rating', v_review.rating
    )
  );

  delete from public.reviews where id = p_review_id;
end;
$$;

revoke all on function public.admin_moderate_review(uuid, public.review_status, text) from public, anon;
revoke all on function public.admin_delete_review(uuid, text) from public, anon;
grant execute on function public.admin_moderate_review(uuid, public.review_status, text) to authenticated;
grant execute on function public.admin_delete_review(uuid, text) to authenticated;
