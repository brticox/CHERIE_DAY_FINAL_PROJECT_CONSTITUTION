-- CHERIE DAY · Commercial catalog read model
-- Public projections expose only published products and active sellable data.

create or replace view public.product_personalization_fields_public as
  select f.id, f.product_id, f.label, f.field_type, f.required,
         f.options, f.helper_text, f.sort_order
  from public.product_personalization_fields f
  join public.products p on p.id = f.product_id
  where p.status = 'published';

create or replace view public.product_addons_public as
  select a.id, a.product_id, a.name_tr, a.addon_type, a.price,
         a.price_type, a.is_optional, a.sort_order
  from public.product_addons a
  where a.status = 'published'
    and (a.product_id is null or exists (
      select 1 from public.products p where p.id = a.product_id and p.status = 'published'
    ));

create or replace view public.product_price_tiers_public as
  select t.id, t.product_id, t.variant_id, t.min_qty, t.unit_price
  from public.product_price_tiers t
  join public.products p on p.id = t.product_id
  left join public.product_variants v on v.id = t.variant_id
  where p.status = 'published'
    and (t.variant_id is null or v.status = 'active');

create or replace view public.product_colors_public as
  select pc.product_id, c.id, c.name_tr, c.slug, c.hex, c.sort_order
  from public.product_colors pc
  join public.colors c on c.id = pc.color_id
  join public.products p on p.id = pc.product_id
  where p.status = 'published';

create or replace view public.product_materials_public as
  select pm.product_id, m.id, m.name_tr, m.slug, m.sort_order
  from public.product_materials pm
  join public.materials m on m.id = pm.material_id
  join public.products p on p.id = pm.product_id
  where p.status = 'published';

create or replace view public.product_media_public as
  select p.id as product_id, m.id, m.url, m.storage_path, m.alt_text,
         array_position(p.media_ids, m.id) as sort_order
  from public.products p
  cross join lateral unnest(p.media_ids) as media(media_id)
  join public.media_assets m on m.id = media.media_id
  where p.status = 'published' and m.is_public = true and m.type = 'image';

grant select on
  public.product_personalization_fields_public,
  public.product_addons_public,
  public.product_price_tiers_public,
  public.product_colors_public,
  public.product_materials_public,
  public.product_media_public
to anon, authenticated;
