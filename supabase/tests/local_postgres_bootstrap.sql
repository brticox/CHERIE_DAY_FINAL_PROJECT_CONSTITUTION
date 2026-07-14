-- Minimal Supabase-owned objects required to replay migrations in disposable PostgreSQL.
-- Test environments only. Never apply to a linked Supabase project.
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;

create schema if not exists auth;
create schema if not exists storage;

create or replace function auth.uid() returns uuid language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function storage.foldername(name text) returns text[] language sql immutable
as $$ select string_to_array(name, '/') $$;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb default '{}',
  created_at timestamptz default now()
);
create table if not exists storage.buckets (
  id text primary key,
  name text,
  public boolean default false
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text,
  name text,
  owner_id text,
  metadata jsonb
);
