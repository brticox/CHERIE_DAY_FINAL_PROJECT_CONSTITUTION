-- =============================================================================
-- CHERIE DAY — 0011 · Public views (published-safe projections)
-- docs/23. Each view: only safe columns, status='published' (or approved),
-- internal cost / supplier / moderation / draft fields excluded. Base tables
-- keep RLS with NO anon policy; anon reads happen ONLY through these views.
-- Views are SECURITY DEFINER (owner=postgres) by default — the documented
-- Supabase public-view pattern.
-- =============================================================================

create view public.departments_public as
  select id, name_tr, slug, description, icon_media_id, sort_order
  from public.departments where status = 'published';

create view public.categories_public as
  select id, department_id, name, slug, parent_id, description, sort_order
  from public.categories where status = 'published';

create view public.collections_public as
  select id, name, slug, story, palette, materials, hero_media_id, is_featured,
         sort_order, seo_metadata_id
  from public.collections where status = 'published';

create view public.collection_sets_public as
  select id, name_tr, slug, collection_id, story, bundle_price, bundle_discount_pct
  from public.collection_sets where status = 'published';

-- internal_cost intentionally excluded (docs/08, docs/23).
create view public.products_public as
  select id, name, slug, category_id, collection_id, collection_set_id,
         description, motif, material_story, materials, packaging_notes,
         occasion_type, object_type, brand_motif_tags, is_personalizable,
         proof_required, gift_wrapping_available, personalization_options,
         behavior_type, base_price, currency, sku, stock_mode,
         production_time_days, price_band, return_note, delivery_note,
         media_ids, seo_metadata_id, sort_order
  from public.products where status = 'published';

-- Active variants of published products only.
create view public.product_variants_public as
  select v.id, v.product_id, v.sku, v.title, v.option_values, v.price,
         v.stock_quantity, v.sort_order
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where v.status = 'active' and p.status = 'published';

create view public.digital_products_public as
  select id, name_tr, slug, collection_id, digital_type, behavior, base_price,
         preview_media_ids, delivery_mode, seo_metadata_id
  from public.digital_products where status = 'published';

-- internal_cost_notes excluded.
create view public.service_packages_public as
  select id, name, slug, service_category, summary, description, behavior_type,
         price_display, base_from_price, price_band, deposit_model, deposit_value,
         requires_event_date, requires_venue, requires_guest_count,
         min_lead_time_days, collection_id, experience_ids, gallery_id,
         hero_media_id, seo_metadata_id
  from public.service_packages where status = 'published';

create view public.service_cities_public as
  select id, city_name, city_slug, travel_fee_model, notes_tr
  from public.service_cities where is_active = true;

create view public.experiences_public as
  select id, name, slug, summary, process_steps, included_modules,
         hero_media_id, seo_metadata_id
  from public.experiences where status = 'published';

-- Approved only; moderation fields excluded; photos hidden unless consented.
create view public.reviews_public as
  select id, subject_type, subject_id, rating, title, body,
         case when photo_consent then photo_media_ids else '{}'::uuid[] end as photo_media_ids,
         is_verified_purchase, created_at
  from public.reviews where status = 'approved';

create view public.galleries_public as
  select id, title, media_ids, linked_entity_type, linked_entity_id
  from public.galleries where status = 'published';

create view public.testimonials_public as
  select id, quote, client_display_name, event_type, location, collection_id, media_id
  from public.testimonials where status = 'published';

-- internal_credit_notes excluded.
create view public.portfolio_projects_public as
  select id, title, slug, event_type, city, guest_count_band, collection_id,
         cover_media_id, gallery_id, testimonial_id, seo_metadata_id
  from public.portfolio_projects where status = 'published';

-- Only current published legal versions (docs/45 §5).
create view public.legal_documents_public as
  select d.id as document_id, d.doc_key, d.title_tr, d.slug,
         v.id as version_id, v.version, v.body, v.effective_from
  from public.legal_documents d
  join public.legal_document_versions v
    on v.legal_document_id = d.id and v.is_current = true
  where d.status = 'published';

create view public.articles_public as
  select id, title, slug, excerpt, body, category, author_display,
         related_experience_ids, related_product_ids, related_collection_ids,
         cover_media_id, seo_metadata_id, published_at
  from public.articles where status = 'published';

create view public.faqs_public as
  select id, question, answer, category, linked_entity_type, linked_entity_id, sort_order
  from public.faqs where status = 'published';

create view public.pages_public as
  select id, slug, title, body, seo_metadata_id
  from public.pages where status = 'published';

create view public.seo_metadata_public as
  select id, entity_type, entity_id, title, description, og_image_id,
         canonical_url, schema_type, noindex
  from public.seo_metadata;

create view public.digital_offerings_public as
  select id, type, title, description, collection_id, preview_media_id
  from public.digital_offerings where status = 'published';

create view public.memory_offerings_public as
  select id, type, title, description, delivery_timeline_days, collection_id
  from public.memory_offerings where status = 'published';

-- ---- Grants: expose views to the API roles ---------------------------------
grant select on
  public.departments_public, public.categories_public, public.collections_public,
  public.collection_sets_public, public.products_public, public.product_variants_public,
  public.digital_products_public, public.service_packages_public, public.service_cities_public,
  public.experiences_public, public.reviews_public, public.galleries_public,
  public.testimonials_public, public.portfolio_projects_public, public.legal_documents_public,
  public.articles_public, public.faqs_public, public.pages_public, public.seo_metadata_public,
  public.digital_offerings_public, public.memory_offerings_public
to anon, authenticated;
