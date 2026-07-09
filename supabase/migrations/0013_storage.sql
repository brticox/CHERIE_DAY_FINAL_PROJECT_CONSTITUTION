-- =============================================================================
-- CHERIE DAY — 0013 · Storage buckets + policies (docs/23 §Storage)
-- public-media (public CDN), legal-documents (public), internal-media (private),
-- customer-uploads (owner + staff), proof-files (owner read / staff write).
-- =============================================================================

insert into storage.buckets (id, name, public) values
  ('public-media',     'public-media',     true),
  ('legal-documents',  'legal-documents',  true),
  ('internal-media',   'internal-media',   false),
  ('customer-uploads', 'customer-uploads', false),
  ('proof-files',      'proof-files',      false)
on conflict (id) do nothing;

-- --- public-media: public read, staff write ---------------------------------
create policy "public-media public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-media');
create policy "public-media staff write"
  on storage.objects for all to authenticated
  using (bucket_id = 'public-media'
         and public.has_staff_role(array['admin','content_editor','content_publisher','commerce_manager']))
  with check (bucket_id = 'public-media'
         and public.has_staff_role(array['admin','content_editor','content_publisher','commerce_manager']));

-- --- legal-documents: public read, admin write ------------------------------
create policy "legal-documents public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'legal-documents');
create policy "legal-documents admin write"
  on storage.objects for all to authenticated
  using (bucket_id = 'legal-documents' and public.has_staff_role(array['admin']))
  with check (bucket_id = 'legal-documents' and public.has_staff_role(array['admin']));

-- --- internal-media: operations/admin/content only, no anon -----------------
create policy "internal-media staff only"
  on storage.objects for all to authenticated
  using (bucket_id = 'internal-media'
         and public.has_staff_role(array['admin','operations','content_editor','content_publisher']))
  with check (bucket_id = 'internal-media'
         and public.has_staff_role(array['admin','operations','content_editor','content_publisher']));

-- --- customer-uploads: owner (path prefix = auth uid) + staff ---------------
-- Convention: object path begins with the uploader's auth uid, e.g.
-- customer-uploads/<auth_uid>/<file>. Enforced via storage.foldername.
create policy "customer-uploads owner rw"
  on storage.objects for all to authenticated
  using (bucket_id = 'customer-uploads'
         and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'customer-uploads'
         and (storage.foldername(name))[1] = auth.uid()::text);
create policy "customer-uploads staff read"
  on storage.objects for select to authenticated
  using (bucket_id = 'customer-uploads'
         and public.has_staff_role(array['admin','order_operations','support_agent','proof_designer','operations']));

-- --- proof-files: staff write, owner read via path prefix -------------------
create policy "proof-files staff write"
  on storage.objects for all to authenticated
  using (bucket_id = 'proof-files'
         and public.has_staff_role(array['admin','proof_designer','order_operations','operations']))
  with check (bucket_id = 'proof-files'
         and public.has_staff_role(array['admin','proof_designer','order_operations','operations']));
create policy "proof-files owner read"
  on storage.objects for select to authenticated
  using (bucket_id = 'proof-files'
         and (storage.foldername(name))[1] = auth.uid()::text);
