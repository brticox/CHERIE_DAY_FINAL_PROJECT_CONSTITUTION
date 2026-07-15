-- Supabase installs pgcrypto in the trusted `extensions` schema, while the
-- disposable PostgreSQL replay installs it in `public`. Keep both execution
-- environments explicit without weakening either function's caller grants.
alter function public.record_payment_initialization(uuid, boolean, text, text)
  set search_path = public, extensions, pg_temp;

alter function public.ingest_paytr_callback(text, text, text, bigint, bigint, text, jsonb, uuid)
  set search_path = public, extensions, pg_temp;
