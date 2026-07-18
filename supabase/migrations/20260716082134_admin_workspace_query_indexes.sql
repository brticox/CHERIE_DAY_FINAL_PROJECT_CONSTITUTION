-- Index the exact search and ordering paths used by the paginated admin workspaces.
create index if not exists campaigns_name_trgm_idx on public.campaigns using gin (name gin_trgm_ops);
create index if not exists campaigns_created_idx on public.campaigns (created_at desc);
create index if not exists coupons_code_trgm_idx on public.coupons using gin (code gin_trgm_ops);
create index if not exists coupons_created_idx on public.coupons (created_at desc);
create index if not exists articles_title_trgm_idx on public.articles using gin (title gin_trgm_ops);
create index if not exists articles_updated_idx on public.articles (updated_at desc);
create index if not exists faqs_question_trgm_idx on public.faqs using gin (question gin_trgm_ops);
create index if not exists galleries_title_trgm_idx on public.galleries using gin (title gin_trgm_ops) where title is not null;
create index if not exists galleries_created_idx on public.galleries (created_at desc);
create index if not exists testimonials_client_trgm_idx on public.testimonials using gin (client_display_name gin_trgm_ops) where client_display_name is not null;
create index if not exists testimonials_created_idx on public.testimonials (created_at desc);
create index if not exists suppliers_name_trgm_idx on public.suppliers using gin (name gin_trgm_ops);
create index if not exists suppliers_created_idx on public.suppliers (created_at desc);
create index if not exists teams_name_trgm_idx on public.teams using gin (name gin_trgm_ops);
create index if not exists teams_created_idx on public.teams (created_at desc);
