-- Phase 1: additive legal publication hardening. Existing consent rows and
-- version ids are preserved. Placeholder v1 rows remain review-only.
alter table public.legal_document_versions
  add column if not exists locale text not null default 'tr-TR',
  add column if not exists lifecycle_state text not null default 'draft'
    check (lifecycle_state in ('draft','awaiting_legal_review','approved','published','superseded','archived')),
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected')),
  add column if not exists needs_lawyer_review boolean not null default true,
  add column if not exists content_hash text,
  add column if not exists summary text,
  add column if not exists source_metadata jsonb not null default '{}'::jsonb,
  add column if not exists supersedes_version_id uuid references public.legal_document_versions(id) on delete restrict,
  add column if not exists updated_at timestamptz not null default now();

update public.legal_document_versions
set lifecycle_state = 'awaiting_legal_review',
    approval_status = 'pending',
    needs_lawyer_review = true,
    is_current = false,
    published_at = null
where coalesce((body ->> 'placeholder')::boolean, false) = true;

update public.legal_documents d
set status = 'draft'
where exists (
  select 1 from public.legal_document_versions v
  where v.legal_document_id = d.id
    and coalesce((v.body ->> 'placeholder')::boolean, false) = true
)
and not exists (
  select 1 from public.legal_document_versions v
  where v.legal_document_id = d.id
    and v.lifecycle_state = 'published'
    and v.approval_status = 'approved'
    and v.needs_lawyer_review = false
);

create unique index if not exists legal_version_identifier_unique
  on public.legal_document_versions (legal_document_id, locale, version);
create unique index if not exists one_published_legal_version_per_locale
  on public.legal_document_versions (legal_document_id, locale)
  where lifecycle_state = 'published' and is_current = true;
create index if not exists legal_version_hash_idx
  on public.legal_document_versions (content_hash);

alter table public.legal_document_versions
  add constraint published_legal_version_ready check (
    lifecycle_state <> 'published' or (
      approval_status = 'approved'
      and needs_lawyer_review = false
      and content_hash is not null
      and coalesce((body ->> 'placeholder')::boolean, false) = false
      and published_at is not null
      and effective_from is not null
    )
  ) not valid;
alter table public.legal_document_versions
  validate constraint published_legal_version_ready;

create or replace function public.guard_legal_version_history()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if old.lifecycle_state in ('published','superseded','archived') and (
    new.body is distinct from old.body or
    new.version is distinct from old.version or
    new.locale is distinct from old.locale or
    new.content_hash is distinct from old.content_hash or
    new.legal_document_id is distinct from old.legal_document_id
  ) then
    raise exception 'published legal versions are immutable' using errcode = '23514';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_guard_legal_version_history on public.legal_document_versions;
create trigger trg_guard_legal_version_history
before update on public.legal_document_versions
for each row execute function public.guard_legal_version_history();

create or replace view public.legal_documents_public
with (security_invoker = true) as
  select d.id as document_id, d.doc_key, d.title_tr, d.slug,
         v.id as version_id, v.version, v.locale, v.body, v.summary,
         v.effective_from, v.published_at, v.content_hash
  from public.legal_documents d
  join public.legal_document_versions v on v.legal_document_id = d.id
  where d.status = 'published'
    and v.is_current = true
    and v.lifecycle_state = 'published'
    and v.approval_status = 'approved'
    and v.needs_lawyer_review = false
    and coalesce((v.body ->> 'placeholder')::boolean, false) = false;

grant select on public.legal_documents_public to anon, authenticated;
