-- The July legal hardening migration rebuilt this one view as
-- security_invoker=true after the public-view compatibility migration. Because
-- anon intentionally has no base-table grants, that made the approved-only
-- projection unreadable. The view exposes only the already-filtered published
-- contract; draft/version tables remain inaccessible.
alter view public.legal_documents_public set (security_invoker = false);
revoke all on public.legal_documents, public.legal_document_versions from anon;
revoke all on public.legal_documents_public from anon;
grant select on public.legal_documents_public to anon;
