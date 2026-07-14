-- =============================================================================
-- CHERIE DAY — Seed data (docs/46 §4). Credible non-empty launch scaffold.
-- Runs after migrations via `supabase db reset`. Placeholder content only —
-- real Turkish copy, imagery, and lawyer-reviewed legal text land later.
-- Staff/customer AUTH users are NOT seeded here (created via Supabase Auth);
-- staff_users rows carry auth_user_id = NULL for role/permission testing.
-- =============================================================================

-- A catalog migration also ships production-safe baseline rows. Local reset
-- intentionally replaces that baseline with the richer QA fixture below so
-- this seed remains deterministic and replay-safe.
truncate table
  public.site_settings,
  public.staff_users,
  public.departments,
  public.event_types,
  public.collections,
  public.service_cities,
  public.service_packages,
  public.digital_products,
  public.articles,
  public.legal_documents,
  public.faqs,
  public.testimonials,
  public.portfolio_projects,
  public.coupons,
  public.shipping_methods
restart identity cascade;

-- ---- Site settings (singleton) ---------------------------------------------
insert into public.site_settings (business_name, contact_email, contact_phone, whatsapp_number, service_area_text)
values ('CHERIE DAY', 'merhaba@cherieday.example', '+90 000 000 00 00', '+900000000000', 'Türkiye geneli');

-- ---- Staff: one per role (docs/46 §4) --------------------------------------
insert into public.staff_users (name, email, role) values
  ('Superadmin',            'superadmin@cherieday.example',        'superadmin'),
  ('Admin',                 'admin@cherieday.example',             'admin'),
  ('Ticaret Müdürü',        'commerce@cherieday.example',          'commerce_manager'),
  ('Ürün Editörü',          'product@cherieday.example',           'product_editor'),
  ('Sipariş Operasyon',     'orders@cherieday.example',            'order_operations'),
  ('Hizmet Operasyon',      'service@cherieday.example',           'service_operations'),
  ('Tasarım (Proof)',       'proof@cherieday.example',             'proof_designer'),
  ('Destek',                'support@cherieday.example',           'support_agent'),
  ('Finans (Görüntüleme)',  'finance@cherieday.example',           'finance_viewer'),
  ('İçerik Editörü',        'content@cherieday.example',           'content_editor'),
  ('İçerik Yayıncı',        'publisher@cherieday.example',         'content_publisher'),
  ('Satış / CRM',           'sales@cherieday.example',             'sales_crm'),
  ('Operasyon',             'ops@cherieday.example',               'operations');

-- ---- A. Departments (all day-one departments, docs/40 §3.3) ----------------
insert into public.departments (name_tr, slug, sort_order, status) values
  ('Davetiye & Basılı Ürünler','davetiye',1,'published'),
  ('Dijital Davetiye','dijital-davetiye',2,'published'),
  ('Hediyelikler & Nikah Şekeri','hediyelik',3,'published'),
  ('Nişan, Söz & İsteme Ürünleri','nisan-soz',4,'published'),
  ('Nişan / Söz Tepsisi','nisan-tepsisi',5,'published'),
  ('Yüzükler & Aksesuarlar','yuzukler',6,'published'),
  ('Kutu & Paketleme','kutu-paketleme',7,'published'),
  ('Mühür & Kurdele','muhur-kurdele',8,'published'),
  ('Masa Kartı & Event Stationery','masa-kartlari',9,'published'),
  ('Menü Kartları','menu',10,'published'),
  ('Karşılama Panosu','karsilama-panosu',11,'published'),
  ('QR Kart','qr-kart',12,'published'),
  ('Hatıra & Albüm','hatira-album',13,'published'),
  ('Mum & Kokulu Objeler','mum',14,'published'),
  ('Gelin Hazırlığı','gelin-hazirligi',15,'published'),
  ('Koleksiyon Setleri','setler',16,'published');

-- One primary category per department (subcategories added later).
insert into public.categories (department_id, name, slug, sort_order, status)
select id, name_tr, slug || '-kategori', sort_order, 'published'
from public.departments;

-- ---- Event types ------------------------------------------------------------
insert into public.event_types (name_tr, slug, sort_order) values
  ('Düğün','dugun',1),('Nişan','nisan',2),('Söz','soz',3),('İsteme','isteme',4),
  ('Nikah','nikah',5),('Kına','kina',6),('Doğum Günü','dogum-gunu',7),
  ('Baby Shower','baby-shower',8),('Gender Reveal','gender-reveal',9),
  ('Kurumsal','kurumsal',10);

-- ---- Collections (the 7 named worlds, docs/02 §7) --------------------------
insert into public.collections (name, slug, story, is_featured, sort_order, status) values
  ('Cherry Seal','cherry-seal','Kırmızı mühür ve klasik zarafet.',true,1,'published'),
  ('Ivory Letter','ivory-letter','Fildişi kağıt ve ince tipografi.',true,2,'published'),
  ('Maison Rouge','maison-rouge','Bordo ve altın dokunuşlar.',false,3,'published'),
  ('Lace Memory','lace-memory','Dantel ve nostaljik detaylar.',false,4,'published'),
  ('Velvet Promise','velvet-promise','Kadife dokular, söz gecesi.',false,5,'published'),
  ('Noir Cherie','noir-cherie','Gece teması, dramatik ışık.',false,6,'published'),
  ('Pearl Ceremony','pearl-ceremony','İnci ve zarif nikah dünyası.',false,7,'published');

-- ---- B. Products: ~48 placeholders across all 16 departments ---------------
insert into public.products
  (name, slug, category_id, collection_id, description, behavior_type, base_price,
   stock_mode, production_time_days, price_band, proof_required, is_personalizable,
   return_note, delivery_note, sort_order, status)
select
  d.name_tr || ' — Model ' || g.n,
  d.slug || '-model-' || g.n,
  c.id,
  (select id from public.collections order by sort_order limit 1 offset (g.n - 1)),
  'Örnek ürün açıklaması (yer tutucu).',
  case
    when d.slug in ('davetiye','masa-kartlari','menu','karsilama-panosu','qr-kart') then 'proof_required_cart'
    when d.slug = 'dijital-davetiye' then 'digital_checkout'
    when d.slug = 'yuzukler' then 'inquiry_only'
    when d.slug in ('nisan-tepsisi','hatira-album') then 'quote_required'
    else 'cart_enabled'
  end::public.product_behavior,
  case when d.slug = 'yuzukler' then null else 150 + (d.sort_order * 20) + (g.n * 25) end,
  'made_to_order'::public.stock_mode,
  case when d.slug in ('davetiye','nisan-tepsisi') then 10 else 5 end,
  'premium'::public.price_band,
  d.slug in ('davetiye','masa-kartlari','menu','karsilama-panosu','qr-kart'),
  d.slug <> 'yuzukler',
  '14 gün içinde standart ürün iadesi; kişiselleştirilmiş ürünler hariç.',
  'Türkiye içi özenli teslimat.',
  g.n,
  'published'
from public.departments d
join public.categories c on c.department_id = d.id
cross join generate_series(1, 3) as g(n);

-- ---- D. Service cities (initial served list) -------------------------------
insert into public.service_cities (city_name, city_slug, is_active, travel_fee_model) values
  ('İstanbul','istanbul',true,'none'),
  ('Ankara','ankara',true,'fixed'),
  ('İzmir','izmir',true,'fixed'),
  ('Bursa','bursa',true,'quote'),
  ('Antalya','antalya',true,'quote');

-- ---- D. Service packages (≥8, docs/46 §4) ----------------------------------
insert into public.service_packages
  (name, slug, service_category, summary, behavior_type, price_display, price_band,
   deposit_model, deposit_value, requires_event_date, requires_venue, min_lead_time_days, status)
values
  ('Düğün Organizasyonu','dugun-organizasyonu','organizasyon','Uçtan uca düğün kurgusu.','reservation_request','price_band','luxury','percentage',30,true,true,45,'published'),
  ('Nişan & Söz Organizasyonu','nisan-soz-organizasyonu','nisan_soz_setup','Nişan/söz kurulumu.','reservation_request','price_band','premium','percentage',30,true,true,21,'published'),
  ('Doğum Günü Konsepti','dogum-gunu-konsepti','dogum_gunu','Temalı doğum günü.','reservation_request','from_price','starter','fixed',1500,true,false,14,'published'),
  ('Baby Shower Konsepti','baby-shower-konsepti','baby_shower','Baby shower kurulumu.','reservation_request','from_price','premium','fixed',2000,true,false,14,'published'),
  ('Gender Reveal','gender-reveal-konsepti','gender_reveal','Cinsiyet açıklama konsepti.','reservation_request','from_price','premium','fixed',2000,true,false,14,'published'),
  ('Dekor & Konsept','dekor-konsept','dekor_konsept','Backdrop, masa, karşılama.','quote_required','quote_only','luxury','none',null,true,true,21,'published'),
  ('Müzik & DJ','muzik-dj','muzik_dj','DJ / canlı müzik.','inquiry_only','quote_only','premium','none',null,true,false,14,'published'),
  ('Fotoğraf & Film','foto-video','foto_video','CHERIE DAY film ekibi.','quote_required','from_price','luxury','percentage',25,true,false,21,'published');

-- City availability: make each package available in İstanbul.
insert into public.service_city_availability (service_package_id, city_id, is_available)
select sp.id, sc.id, true
from public.service_packages sp
cross join (select id from public.service_cities where city_slug = 'istanbul') sc;

-- ---- C. Digital products (6 designs) ---------------------------------------
insert into public.digital_products (name_tr, slug, digital_type, behavior, base_price, delivery_mode, status) values
  ('Dijital Davetiye — Klasik','dijital-davetiye-klasik','dijital_davetiye','digital_checkout',250,'hosted_page','published'),
  ('Dijital Davetiye — Animasyonlu','dijital-davetiye-animasyonlu','animasyonlu_davetiye','proof_required',450,'hosted_page','published'),
  ('Web Davetiye — Tek Sayfa','web-davetiye-tek-sayfa','web_davetiye','proof_required',900,'hosted_page','published'),
  ('QR Davet Kartı','qr-davet-karti','qr_kart','digital_checkout',150,'link','published'),
  ('Dijital Albüm','dijital-album','dijital_album','quote_required',null,'download','published'),
  ('İndirilebilir Davetiye Şablonu','indirilebilir-davetiye-sablonu','indirilebilir','digital_checkout',120,'download','published');

-- ---- Rehber articles (12 seed, docs/27) ------------------------------------
insert into public.articles (title, slug, excerpt, author_display, status, published_at)
select
  'Rehber Yazısı ' || g.n,
  'rehber-yazisi-' || g.n,
  'Örnek rehber özeti (yer tutucu).',
  'CHERIE DAY Ekibi',
  'published',
  now()
from generate_series(1, 12) as g(n);

-- ---- Legal documents: all 12 keys with a v1 (placeholder) ------------------
insert into public.legal_documents (doc_key, title_tr, slug, status) values
  ('kvkk_aydinlatma','KVKK Aydınlatma Metni','kvkk-aydinlatma','published'),
  ('gizlilik','Gizlilik Politikası','gizlilik','published'),
  ('cerez','Çerez Politikası','cerez-politikasi','published'),
  ('acik_riza','Açık Rıza Metni','acik-riza','published'),
  ('kullanim_kosullari','Kullanım Koşulları','kullanim-kosullari','published'),
  ('on_bilgilendirme','Ön Bilgilendirme Formu','on-bilgilendirme','published'),
  ('mesafeli_satis','Mesafeli Satış Sözleşmesi','mesafeli-satis','published'),
  ('iade_iptal','İade ve İptal Politikası','iade-iptal','published'),
  ('teslimat','Teslimat Politikası','teslimat','published'),
  ('kisisellestirilmis_urun','Kişiselleştirilmiş Ürün ve Tasarım Onayı Şartları','kisisellestirilmis-urun-sartlari','published'),
  ('hizmet_rezervasyon','Hizmet ve Rezervasyon Şartları','hizmet-rezervasyon-sartlari','published'),
  ('satici_bilgileri','Satıcı Bilgileri','satici-bilgileri','published');

insert into public.legal_document_versions (legal_document_id, version, body, effective_from, is_current)
select id, 'v1',
  jsonb_build_object('placeholder', true, 'text', 'Yer tutucu hukuki metin — avukat onayı bekleniyor.'),
  current_date, true
from public.legal_documents;

-- ---- FAQs -------------------------------------------------------------------
insert into public.faqs (question, answer, category, sort_order, status) values
  ('Siparişim ne zaman teslim edilir?','Üretim süresi ürün sayfasında belirtilir; kargo Türkiye geneli yapılır.','process',1,'published'),
  ('Tasarım onayı nasıl çalışır?','Kişiselleştirilmiş ürünlerde onayınızdan sonra üretim başlar.','production',2,'published'),
  ('Hangi şehirlerde hizmet veriyorsunuz?','Başlangıç olarak İstanbul, Ankara, İzmir, Bursa ve Antalya.','location',3,'published'),
  ('İade koşulları nelerdir?','Standart ürünlerde 14 gün; kişiselleştirilmiş ürünlerde farklı kurallar geçerlidir.','budget',4,'published');

-- ---- Testimonials ----------------------------------------------------------
insert into public.testimonials (quote, client_display_name, event_type, location, status) values
  ('Her detay kusursuzdu.','A. & M.','Düğün','İstanbul','published'),
  ('Nişanımız masal gibiydi.','E. & K.','Nişan','Ankara','published'),
  ('Ekibe minnettarız.','S. & B.','Söz','İzmir','published');

-- ---- Portfolio samples -----------------------------------------------------
insert into public.portfolio_projects (title, slug, event_type, city, guest_count_band, status) values
  ('Bahçe Düğünü','bahce-dugunu','dugun','İstanbul','151-300','published'),
  ('Şehir Nişanı','sehir-nisani','nisan','Ankara','76-150','published'),
  ('Yalı Söz Gecesi','yali-soz-gecesi','soz','İzmir','26-75','published');

-- ---- Coupon (1 test) -------------------------------------------------------
insert into public.coupons (code, description, discount_type, discount_value, min_order_amount, usage_limit, is_active)
values ('CHERIE10','Hoş geldiniz — %10 indirim','percentage',10,500,100,true);

-- ---- Shipping methods ------------------------------------------------------
insert into public.shipping_methods (name, type, base_price, status, sort_order) values
  ('Standart Kargo','cargo',0,'published',1),
  ('Hızlı Kurye (şehir içi)','courier',150,'published',2);
