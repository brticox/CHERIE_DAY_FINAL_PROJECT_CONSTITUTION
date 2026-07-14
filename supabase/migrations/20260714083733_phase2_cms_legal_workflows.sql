-- Structured CMS revisioning and immutable legal history.
create or replace function public.admin_save_page(p_page_id uuid,p_title text,p_slug text,p_body jsonb)
returns public.pages language plpgsql security definer set search_path=public,pg_temp as $$
declare v_page public.pages;v_staff uuid;v_version int;
begin
  if not (select public.has_staff_role(array['content_editor','content_publisher','admin'])) then raise exception 'permission denied' using errcode='42501';end if;
  if length(trim(p_title))<3 or p_slug!~'^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'invalid page fields' using errcode='23514';end if;
  v_staff:=public.current_staff_id();select * into v_page from public.pages where id=p_page_id for update;if v_page.id is null then raise exception 'page not found' using errcode='P0002';end if;
  select coalesce(max(version),0)+1 into v_version from public.content_revisions where entity_type='page' and entity_id=p_page_id;
  insert into public.content_revisions(entity_type,entity_id,version,snapshot,actor_staff_id) values('page',p_page_id,v_version,to_jsonb(v_page),v_staff);
  update public.pages set title=trim(p_title),slug=p_slug,body=p_body,status='draft',updated_at=now() where id=p_page_id returning * into v_page;
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff) values(v_staff,'cms.page.saved','page',p_page_id,jsonb_build_object('revision',v_version,'before',jsonb_build_object('title',v_page.title,'slug',v_page.slug)));
  return v_page;
end$$;

create or replace function public.admin_publish_page(p_page_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_staff uuid;v_page public.pages;v_version int;
begin
  if not (select public.has_staff_role(array['content_publisher','admin'])) then raise exception 'permission denied' using errcode='42501';end if;
  v_staff:=public.current_staff_id();select * into v_page from public.pages where id=p_page_id for update;if v_page.id is null then raise exception 'page not found' using errcode='P0002';end if;
  if length(trim(v_page.title))<3 or jsonb_typeof(v_page.body)<>'object' then raise exception 'page not ready' using errcode='23514';end if;
  update public.pages set status='published',updated_at=now() where id=p_page_id;
  select coalesce(max(version),0)+1 into v_version from public.content_revisions where entity_type='page' and entity_id=p_page_id;
  insert into public.content_revisions(entity_type,entity_id,version,snapshot,actor_staff_id,action) values('page',p_page_id,v_version,to_jsonb(v_page)||'{"status":"published"}'::jsonb,v_staff,'published');
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff) values(v_staff,'cms.page.published','page',p_page_id,jsonb_build_object('revision',v_version));
end$$;

create or replace function public.admin_rollback_page(p_page_id uuid,p_revision_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_staff uuid;v_snapshot jsonb;v_version int;
begin
  if not (select public.has_staff_role(array['content_editor','content_publisher','admin'])) then raise exception 'permission denied' using errcode='42501';end if;
  select snapshot into v_snapshot from public.content_revisions where id=p_revision_id and entity_type='page' and entity_id=p_page_id;if v_snapshot is null then raise exception 'revision not found' using errcode='P0002';end if;
  v_staff:=public.current_staff_id();update public.pages set title=v_snapshot->>'title',slug=v_snapshot->>'slug',body=v_snapshot->'body',status='draft',updated_at=now() where id=p_page_id;
  select coalesce(max(version),0)+1 into v_version from public.content_revisions where entity_type='page' and entity_id=p_page_id;
  insert into public.content_revisions(entity_type,entity_id,version,snapshot,actor_staff_id,action) select 'page',p_page_id,v_version,to_jsonb(p),v_staff,'rollback' from public.pages p where id=p_page_id;
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff) values(v_staff,'cms.page.rolled_back','page',p_page_id,jsonb_build_object('revision_id',p_revision_id,'new_revision',v_version));
end$$;

create or replace function public.protect_legal_history() returns trigger language plpgsql set search_path=public as $$
begin
  if tg_op='DELETE' and (old.lifecycle_state in ('published','superseded') or exists(select 1 from public.consent_records where legal_document_version_id=old.id)) then raise exception 'referenced or historical legal versions cannot be deleted' using errcode='23503';end if;
  if tg_op='UPDATE' and old.lifecycle_state in ('published','superseded') and (new.body is distinct from old.body or new.version is distinct from old.version or new.legal_document_id is distinct from old.legal_document_id) then raise exception 'historical legal content is immutable' using errcode='55000';end if;
  return coalesce(new,old);
end$$;
drop trigger if exists protect_legal_history_trigger on public.legal_document_versions;
create trigger protect_legal_history_trigger before update or delete on public.legal_document_versions for each row execute function public.protect_legal_history();

revoke all on function public.admin_save_page(uuid,text,text,jsonb),public.admin_publish_page(uuid),public.admin_rollback_page(uuid,uuid) from public, anon, authenticated;
grant execute on function public.admin_save_page(uuid,text,text,jsonb),public.admin_publish_page(uuid),public.admin_rollback_page(uuid,uuid) to authenticated;
