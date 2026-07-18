-- CHERIE DAY Phase 2 admin operations foundation.
-- Adds lifecycle metadata and atomic, RLS-scoped staff RPCs. No service-role grants.

alter table public.products
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.staff_users(id) on delete set null,
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid references public.staff_users(id) on delete set null;
create index if not exists products_archived_status_idx on public.products (archived_at, status, updated_at desc);

create table if not exists public.product_publication_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  actor_staff_id uuid references public.staff_users(id) on delete set null,
  action text not null check (action in ('created','published','unpublished','archived','restored')),
  readiness jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists product_publication_events_product_idx on public.product_publication_events(product_id, created_at desc);
alter table public.product_publication_events enable row level security;
create policy product_publication_staff_read on public.product_publication_events for select to authenticated
  using ((select public.has_staff_role(array['product_editor','commerce_manager','content_publisher','admin'])));
create policy product_publication_staff_insert on public.product_publication_events for insert to authenticated
  with check ((select public.has_staff_role(array['commerce_manager','content_publisher','admin'])));
grant select, insert on public.product_publication_events to authenticated;

alter table public.media_assets
  add column if not exists title text,
  add column if not exists mime_type text,
  add column if not exists size_bytes bigint,
  add column if not exists width int,
  add column if not exists height int,
  add column if not exists content_hash text,
  add column if not exists focal_x numeric(5,4) not null default 0.5,
  add column if not exists focal_y numeric(5,4) not null default 0.5,
  add column if not exists archived_at timestamptz,
  add constraint media_size_nonnegative check (size_bytes is null or size_bytes >= 0),
  add constraint media_dimensions_positive check ((width is null or width > 0) and (height is null or height > 0)),
  add constraint media_focal_range check (focal_x between 0 and 1 and focal_y between 0 and 1);
create unique index if not exists media_assets_content_hash_active_idx on public.media_assets(content_hash) where content_hash is not null and archived_at is null;
create index if not exists media_assets_orphan_scan_idx on public.media_assets(archived_at, created_at desc);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  unique(product_id, media_id)
);
create unique index if not exists one_product_cover_idx on public.product_media(product_id) where is_cover;
create index if not exists product_media_product_order_idx on public.product_media(product_id, sort_order);
alter table public.product_media enable row level security;
create policy product_media_staff_read on public.product_media for select to authenticated
  using ((select public.has_staff_role(array['product_editor','commerce_manager','content_editor','content_publisher','admin'])));
create policy product_media_staff_write on public.product_media for all to authenticated
  using ((select public.has_staff_role(array['product_editor','commerce_manager','admin'])))
  with check ((select public.has_staff_role(array['product_editor','commerce_manager','admin'])));
grant select, insert, update, delete on public.product_media to authenticated;

create table if not exists public.media_usage_refs (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete restrict,
  entity_type text not null,
  entity_id uuid not null,
  field_name text not null,
  created_at timestamptz not null default now(),
  unique(media_id, entity_type, entity_id, field_name)
);
create index if not exists media_usage_refs_media_idx on public.media_usage_refs(media_id);
alter table public.media_usage_refs enable row level security;
create policy media_usage_staff_read on public.media_usage_refs for select to authenticated
  using ((select public.has_staff_role(array['product_editor','commerce_manager','content_editor','content_publisher','admin'])));
create policy media_usage_staff_write on public.media_usage_refs for all to authenticated
  using ((select public.has_staff_role(array['product_editor','commerce_manager','content_editor','content_publisher','admin'])))
  with check ((select public.has_staff_role(array['product_editor','commerce_manager','content_editor','content_publisher','admin'])));
grant select, insert, update, delete on public.media_usage_refs to authenticated;

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  version int not null,
  snapshot jsonb not null,
  actor_staff_id uuid references public.staff_users(id) on delete set null,
  action text not null default 'saved' check (action in ('saved','published','rollback')),
  created_at timestamptz not null default now(),
  unique(entity_type, entity_id, version)
);
create index if not exists content_revisions_entity_idx on public.content_revisions(entity_type, entity_id, version desc);
alter table public.content_revisions enable row level security;
create policy content_revisions_staff_read on public.content_revisions for select to authenticated
  using ((select public.has_staff_role(array['content_editor','content_publisher','admin'])));
create policy content_revisions_staff_insert on public.content_revisions for insert to authenticated
  with check ((select public.has_staff_role(array['content_editor','content_publisher','admin'])));
grant select, insert on public.content_revisions to authenticated;

alter table public.leads
  add column if not exists priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists lost_reason text,
  add column if not exists converted_customer_id uuid references public.customers(id) on delete set null;
create index if not exists leads_pipeline_idx on public.leads(status, next_follow_up_at, priority, created_at desc);

alter table public.production_jobs
  add column if not exists material_ready boolean not null default false,
  add column if not exists blocker text,
  add column if not exists paused_at timestamptz;
alter table public.shipments
  add column if not exists package_count int not null default 1 check (package_count > 0),
  add column if not exists exception_code text,
  add column if not exists failed_delivery_at timestamptz;

alter table public.audit_log
  add column if not exists correlation_id uuid not null default gen_random_uuid(),
  add column if not exists source text not null default 'admin',
  add column if not exists context jsonb not null default '{}'::jsonb;
create index if not exists audit_log_created_action_idx on public.audit_log(created_at desc, action);
create index if not exists audit_log_entity_idx on public.audit_log(entity_type, entity_id, created_at desc);

create or replace function public.admin_publish_product(p_product_id uuid)
returns public.products
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_product public.products; v_staff uuid; v_media_count int; v_readiness jsonb;
begin
  if not (select public.has_staff_role(array['commerce_manager','content_publisher','admin'])) then raise exception 'permission denied' using errcode='42501'; end if;
  v_staff := public.current_staff_id();
  select * into v_product from public.products where id=p_product_id for update;
  if v_product.id is null or v_product.archived_at is not null then raise exception 'product unavailable' using errcode='P0002'; end if;
  select count(*) into v_media_count from public.product_media where product_id=p_product_id;
  v_readiness := jsonb_build_object('name',length(trim(v_product.name))>=3,'slug',v_product.slug~'^[a-z0-9]+(-[a-z0-9]+)*$','description',length(trim(coalesce(v_product.description,'')))>=20,'price',v_product.behavior_type not in ('cart_enabled','proof_required_cart','digital_checkout') or coalesce(v_product.base_price,0)>0,'media',v_media_count>0 or cardinality(v_product.media_ids)>0);
  if (v_readiness @> '{"name":true,"slug":true,"description":true,"price":true,"media":true}'::jsonb) is false then raise exception 'publish readiness failed: %',v_readiness using errcode='23514'; end if;
  update public.products set status='published',published_at=now(),published_by=v_staff where id=p_product_id returning * into v_product;
  insert into public.product_publication_events(product_id,actor_staff_id,action,readiness) values(p_product_id,v_staff,'published',v_readiness);
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff) values(v_staff,'product.published','product',p_product_id,jsonb_build_object('readiness',v_readiness));
  return v_product;
end $$;

create or replace function public.admin_archive_product(p_product_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_staff uuid;
begin
  if not (select public.has_staff_role(array['commerce_manager','admin'])) then raise exception 'permission denied' using errcode='42501'; end if;
  v_staff:=public.current_staff_id();
  update public.products set status='draft',archived_at=now(),archived_by=v_staff where id=p_product_id and archived_at is null;
  if not found then raise exception 'product not found or archived' using errcode='P0002'; end if;
  insert into public.product_publication_events(product_id,actor_staff_id,action) values(p_product_id,v_staff,'archived');
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id) values(v_staff,'product.archived','product',p_product_id);
end $$;

create or replace function public.admin_restore_product(p_product_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_staff uuid;
begin
  if not (select public.has_staff_role(array['commerce_manager','admin'])) then raise exception 'permission denied' using errcode='42501'; end if;
  v_staff:=public.current_staff_id();
  update public.products set archived_at=null,archived_by=null,status='draft' where id=p_product_id and archived_at is not null;
  if not found then raise exception 'product not found or active' using errcode='P0002'; end if;
  insert into public.product_publication_events(product_id,actor_staff_id,action) values(p_product_id,v_staff,'restored');
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id) values(v_staff,'product.restored','product',p_product_id);
end $$;

create or replace function public.admin_publish_legal_version(p_version_id uuid, p_approval_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_version public.legal_document_versions; v_staff uuid;
begin
  if not (select public.has_staff_role(array['admin'])) then raise exception 'permission denied' using errcode='42501'; end if;
  v_staff:=public.current_staff_id();
  select * into v_version from public.legal_document_versions where id=p_version_id for update;
  if v_version.id is null then raise exception 'version not found' using errcode='P0002'; end if;
  if v_version.needs_lawyer_review or v_version.approval_status<>'approved' or v_version.lifecycle_state<>'approved' then raise exception 'legal approval required' using errcode='23514'; end if;
  update public.legal_document_versions set lifecycle_state='superseded',is_current=false where legal_document_id=v_version.legal_document_id and locale=v_version.locale and lifecycle_state='published' and is_current=true;
  update public.legal_document_versions set lifecycle_state='published',is_current=true,published_at=now(),published_by=v_staff,source_metadata=source_metadata||jsonb_build_object('approval',p_approval_metadata) where id=p_version_id;
  update public.legal_documents set status='published' where id=v_version.legal_document_id;
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff) values(v_staff,'legal.version.published','legal_document_version',p_version_id,jsonb_build_object('document_id',v_version.legal_document_id,'approval',p_approval_metadata));
end $$;

create or replace function public.admin_archive_media(p_media_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_staff uuid; v_usage int;
begin
  if not (select public.has_staff_role(array['product_editor','commerce_manager','content_editor','content_publisher','admin'])) then raise exception 'permission denied' using errcode='42501'; end if;
  select (select count(*) from public.product_media where media_id=p_media_id)+(select count(*) from public.media_usage_refs where media_id=p_media_id)+(select count(*) from public.seo_metadata where og_image_id=p_media_id) into v_usage;
  if v_usage>0 then raise exception 'media is referenced by % records',v_usage using errcode='23503'; end if;
  v_staff:=public.current_staff_id(); update public.media_assets set archived_at=now(),is_public=false where id=p_media_id and archived_at is null;
  if not found then raise exception 'media not found or archived' using errcode='P0002'; end if;
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id) values(v_staff,'media.archived','media_asset',p_media_id);
end $$;

create or replace function public.admin_set_product_media(p_product_id uuid, p_media_ids uuid[])
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_staff uuid; v_invalid int;
begin
  if not (select public.has_staff_role(array['product_editor','commerce_manager','admin'])) then raise exception 'permission denied' using errcode='42501'; end if;
  if cardinality(p_media_ids)>24 then raise exception 'maximum 24 media items' using errcode='22023'; end if;
  if cardinality(p_media_ids)<>cardinality(array(select distinct unnest(p_media_ids))) then raise exception 'duplicate media ids' using errcode='22023'; end if;
  select count(*) into v_invalid from unnest(p_media_ids) as x(id) left join public.media_assets m on m.id=x.id and m.archived_at is null where m.id is null;
  if v_invalid>0 then raise exception 'invalid or archived media' using errcode='23503'; end if;
  v_staff:=public.current_staff_id();
  update public.products set media_ids=p_media_ids where id=p_product_id;
  if not found then raise exception 'product not found' using errcode='P0002'; end if;
  delete from public.product_media where product_id=p_product_id;
  insert into public.product_media(product_id,media_id,sort_order,is_cover)
    select p_product_id,x.id,x.ordinality-1,x.ordinality=1 from unnest(p_media_ids) with ordinality as x(id,ordinality);
  delete from public.media_usage_refs where entity_type='product' and entity_id=p_product_id and field_name='gallery';
  insert into public.media_usage_refs(media_id,entity_type,entity_id,field_name) select x.id,'product',p_product_id,'gallery' from unnest(p_media_ids) as x(id);
  insert into public.audit_log(staff_user_id,action,entity_type,entity_id,diff) values(v_staff,'product.media.updated','product',p_product_id,jsonb_build_object('media_ids',p_media_ids,'cover_id',p_media_ids[1]));
end $$;

revoke all on function public.admin_publish_product(uuid) from public, anon, authenticated;
revoke all on function public.admin_archive_product(uuid) from public, anon, authenticated;
revoke all on function public.admin_restore_product(uuid) from public, anon, authenticated;
revoke all on function public.admin_publish_legal_version(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.admin_archive_media(uuid) from public, anon, authenticated;
revoke all on function public.admin_set_product_media(uuid,uuid[]) from public, anon, authenticated;
grant execute on function public.admin_publish_product(uuid), public.admin_archive_product(uuid), public.admin_restore_product(uuid), public.admin_publish_legal_version(uuid,jsonb), public.admin_archive_media(uuid), public.admin_set_product_media(uuid,uuid[]) to authenticated;

-- Storage stays staff-scoped. No upsert: immutable object paths prevent cache races.
drop policy if exists staff_upload_public_media_phase2 on storage.objects;
create policy staff_upload_public_media_phase2 on storage.objects for insert to authenticated
with check (bucket_id='public-media' and (select public.has_staff_role(array['product_editor','commerce_manager','content_editor','content_publisher','admin'])) and (storage.foldername(name))[1]=(select auth.uid()::text));
