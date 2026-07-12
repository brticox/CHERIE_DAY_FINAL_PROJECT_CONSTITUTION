-- CHERIE DAY commerce catalog v1.
-- Idempotent operational seed synchronized with content/seed/catalog.ts.

insert into public.departments (name_tr, slug, description, sort_order, status)
values
  ('Davetiye & Basılı Ürünler','davetiye','Kağıda dökülen ilk söz; her davet burada başlar.',1,'published'),
  ('Dijital Davetiye','dijital-davetiye','Işıkla yazılan davet, bir dokunuşla sevdiklerinize.',2,'published'),
  ('Hediyelikler & Nikah Şekeri','hediyelik','Her misafir, bir yaprak kadar hafif bir hatıra taşısın.',3,'published'),
  ('Nişan, Söz & İsteme Ürünleri','nisan-soz','Sözünüz, kadife kadar nazik olsun.',4,'published'),
  ('Nişan / Söz Tepsisi','nisan-tepsisi','İki yüzüğün buluştuğu ince zemin.',5,'published'),
  ('Yüzükler & Aksesuarlar','yuzukler','Bu an, ışığını hiç kaybetmesin.',6,'published'),
  ('Kutu & Paketleme','kutu-paketleme','Hediyenin ilk sözünü kutusu söyler.',7,'published'),
  ('Mühür & Kurdele','muhur-kurdele','Bir damla mum, bir düğüm ipek; imzanız.',8,'published'),
  ('Masa Kartı & Event Stationery','masa-kartlari','Her isim, masasında zarifçe karşılansın.',9,'published'),
  ('Menü Kartları','menu','Sofranın hikâyesi, kartın üzerinde.',10,'published'),
  ('Karşılama Panosu','karsilama-panosu','Kapıdaki ilk selam, sizin adınıza.',11,'published'),
  ('QR Kart','qr-kart','Küçük bir kare, koca bir davet.',12,'published'),
  ('Hatıra & Albüm','hatira-album','Yıllar sonra bile açılacak sayfalar.',13,'published'),
  ('Mum & Kokulu Objeler','mum','Bir alev, bir koku, bir akşamın anısı.',14,'published'),
  ('Gelin Hazırlığı','gelin-hazirligi','O sabahın telaşı bile zarif olsun.',15,'published'),
  ('Koleksiyon Setleri','setler','Bir dünyayı tek seferde kurun.',16,'published')
on conflict (slug) do update set
  name_tr=excluded.name_tr, description=excluded.description,
  sort_order=excluded.sort_order, status=excluded.status;

insert into public.categories (department_id, name, slug, description, sort_order, status)
select id, name_tr, slug || '-kategori', description, sort_order, 'published'
from public.departments
where slug in ('davetiye','dijital-davetiye','hediyelik','nisan-soz','nisan-tepsisi','yuzukler','kutu-paketleme','muhur-kurdele','masa-kartlari','menu','karsilama-panosu','qr-kart','hatira-album','mum','gelin-hazirligi','setler')
on conflict (slug) do update set department_id=excluded.department_id,
  name=excluded.name, description=excluded.description, sort_order=excluded.sort_order,
  status=excluded.status;

insert into public.collections (name,slug,story,palette,is_featured,sort_order,status)
values
 ('Cherry Seal','cherry-seal','Kırmızı bir mühür, klasik bir zarafet.','["#8F1D2C","#FAF7F1","#B08A57"]',true,1,'published'),
 ('Ivory Letter','ivory-letter','Fildişi kağıt, ince bir tipografi.','["#FAF7F1","#E8D8C7","#4B403C"]',true,2,'published'),
 ('Maison Rouge','maison-rouge','Bordo bir gece, altın bir dokunuş.','["#4A0E17","#B08A57","#F3EDE3"]',false,3,'published'),
 ('Lace Memory','lace-memory','Dantel bir dünya, nostaljik bir iz.','["#E8D8C7","#FAF7F1","#8F1D2C"]',false,4,'published'),
 ('Velvet Promise','velvet-promise','Kadife bir söz, sıcak bir vaat.','["#2B1118","#8F1D2C","#B08A57"]',false,5,'published'),
 ('Noir Cherie','noir-cherie','Gece teması, dramatik bir ışık.','["#1F1917","#B08A57","#FAF7F1"]',false,6,'published'),
 ('Pearl Ceremony','pearl-ceremony','İnci bir sabah, zarif bir nikâh.','["#F3EDE3","#E8D8C7","#B08A57"]',false,7,'published')
on conflict (slug) do update set name=excluded.name,story=excluded.story,
 palette=excluded.palette,is_featured=excluded.is_featured,sort_order=excluded.sort_order,status=excluded.status;

with catalog(department_slug,collection_slug,name,slug,description,behavior,price,proof,personalizable,lead,sort_order) as (values
 ('davetiye','cherry-seal','Mühürlü Bahçe Davetiyesi','muhurlu-bahce-davetiyesi','Zarfın içinde, bir bahçe saklı.','proof_required_cart',220,true,true,10,1),
 ('davetiye','ivory-letter','İnce Zarif Kraft Davetiye','ince-zarif-kraft-davetiye','Sade kağıt, net bir çağrı.','proof_required_cart',250,true,true,10,2),
 ('davetiye','maison-rouge','Altın Yaldızlı Klasik Davetiye','altin-yaldizli-klasik-davetiye','Işık, kenarlardan usulca sızar.','proof_required_cart',280,true,true,10,3),
 ('dijital-davetiye','cherry-seal','Hareketli Dijital Davet','hareketli-dijital-davet','Sevginiz artık ışıkla da yazılır.','digital_checkout',260,false,true,3,1),
 ('dijital-davetiye','ivory-letter','Tek Sayfa Web Davet','tek-sayfa-web-davet','Bir bağlantı, koca bir davet.','digital_checkout',290,false,true,3,2),
 ('dijital-davetiye','maison-rouge','Klasik Dijital Kart','klasik-dijital-kart','Zarafet, ekranın içinde.','digital_checkout',320,false,true,3,3),
 ('hediyelik','cherry-seal','Kadife Keseli Nikah Şekeri','kadife-keseli-nikah-sekeri','Küçük bir tat, uzun bir anı.','cart_enabled',90,false,true,5,1),
 ('hediyelik','ivory-letter','Kişiye Özel Teşekkür Kutusu','kisiye-ozel-tesekkur-kutusu','İsminizle mühürlenmiş bir jest.','cart_enabled',120,false,true,5,2),
 ('hediyelik','maison-rouge','Mum & Kurdele Hediye Seti','mum-kurdele-hediye-seti','Bir alev, bir düğüm, bir teşekkür.','cart_enabled',150,false,true,5,3),
 ('nisan-soz','cherry-seal','Söz Hediyelik Seti','soz-hediyelik-seti','Sözün en güzel hâli, elinizde.','cart_enabled',480,false,true,7,1),
 ('nisan-soz','ivory-letter','İsteme Çikolatası & Kutu','isteme-cikolatasi-kutu','Tatlı bir başlangıç, zarif bir sunum.','cart_enabled',510,false,true,7,2),
 ('nisan-soz','maison-rouge','Kadife Yüzük Yastığı','kadife-yuzuk-yastigi','İki yüzüğe nazik bir zemin.','cart_enabled',540,false,true,7,3),
 ('nisan-tepsisi','cherry-seal','El İşlemesi Nişan Tepsisi','el-islemesi-nisan-tepsisi','İki yüzüğün buluştuğu ince zemin.','quote_required',null,false,true,14,1),
 ('nisan-tepsisi','ivory-letter','Ayna Detaylı Söz Tepsisi','ayna-detayli-soz-tepsisi','Işığı ikiye katlayan bir yüzey.','quote_required',null,false,true,14,2),
 ('nisan-tepsisi','maison-rouge','Pirinç Çerçeveli Tepsi','pirinc-cerceveli-tepsi','Sıcak metal, sakin bir tören.','quote_required',null,false,true,14,3),
 ('yuzukler','cherry-seal','Klasik Tektaş Yüzük','klasik-tektas-yuzuk','Bu an, ışığını hiç kaybetmesin.','inquiry_only',null,false,false,21,1),
 ('yuzukler','ivory-letter','İnce Alyans Çifti','ince-alyans-cifti','İki halka, tek söz.','inquiry_only',null,false,false,21,2),
 ('yuzukler','maison-rouge','Kadife Yüzük Kutusu','kadife-yuzuk-kutusu','Kapağın ardında bir vaat.','inquiry_only',null,false,false,21,3),
 ('kutu-paketleme','cherry-seal','Mıknatıslı Hediye Kutusu','miknatisli-hediye-kutusu','Hediyenin ilk sözünü kutusu söyler.','cart_enabled',140,false,true,5,1),
 ('kutu-paketleme','ivory-letter','İpek Kurdeleli Karton Kutu','ipek-kurdeleli-karton-kutu','Sade dış, zarif iç.','cart_enabled',170,false,true,5,2),
 ('kutu-paketleme','maison-rouge','Çekmece Model Sunum Kutusu','cekmece-model-sunum-kutusu','Usulca açılan bir sürpriz.','cart_enabled',200,false,true,5,3),
 ('muhur-kurdele','cherry-seal','Balmumu Mühür Seti','balmumu-muhur-seti','Bir damla mum, kalıcı bir imza.','cart_enabled',70,false,true,4,1),
 ('muhur-kurdele','ivory-letter','İsme Özel Mühür Pulu','isme-ozel-muhur-pulu','İki harf, bir hane.','cart_enabled',100,false,true,4,2),
 ('muhur-kurdele','maison-rouge','İpek Kurdele Topu','ipek-kurdele-topu','Zarafet, düğümün içinde.','cart_enabled',130,false,true,4,3),
 ('masa-kartlari','cherry-seal','El Yazısı Masa Kartı','el-yazisi-masa-karti','Her isim, masasında zarifçe karşılansın.','proof_required_cart',60,true,true,6,1),
 ('masa-kartlari','ivory-letter','Altın Baskılı Oturma Kartı','altin-baskili-oturma-karti','İnce bir çizgi, net bir yer.','proof_required_cart',90,true,true,6,2),
 ('masa-kartlari','maison-rouge','Kraft Yer Kartı','kraft-yer-karti','Doğal doku, sıcak karşılama.','proof_required_cart',120,true,true,6,3),
 ('menu','cherry-seal','Tek Sayfa Zarif Menü','tek-sayfa-zarif-menu','Sofranın hikâyesi, kartın üzerinde.','proof_required_cart',55,true,true,6,1),
 ('menu','ivory-letter','Katlamalı Akşam Menüsü','katlamali-aksam-menusu','Her tabak, sırasını bekler.','proof_required_cart',85,true,true,6,2),
 ('menu','maison-rouge','İnce Uzun Menü Kartı','ince-uzun-menu-karti','Dikey bir zarafet.','proof_required_cart',115,true,true,6,3),
 ('karsilama-panosu','cherry-seal','Ayna Karşılama Panosu','ayna-karsilama-panosu','Kapıdaki ilk selam, sizin adınıza.','proof_required_cart',900,true,true,12,1),
 ('karsilama-panosu','ivory-letter','Akrilik İsim Panosu','akrilik-isim-panosu','Şeffaf zemin, net isimler.','proof_required_cart',930,true,true,12,2),
 ('karsilama-panosu','maison-rouge','Ahşap Yön Panosu','ahsap-yon-panosu','Misafiri nazikçe yönlendiren el.','proof_required_cart',960,true,true,12,3),
 ('qr-kart','cherry-seal','QR Davet Kartı','qr-davet-karti','Küçük bir kare, koca bir davet.','digital_checkout',150,false,true,3,1),
 ('qr-kart','ivory-letter','QR Anı Kartı','qr-ani-karti','Bir okutma, bir albüm.','digital_checkout',180,false,true,3,2),
 ('qr-kart','maison-rouge','QR Menü Kartı','qr-menu-karti','Masada beliren dijital sofra.','digital_checkout',210,false,true,3,3),
 ('hatira-album','cherry-seal','El Yapımı Anı Albümü','el-yapimi-ani-albumu','Yıllar sonra bile açılacak sayfalar.','quote_required',null,false,true,20,1),
 ('hatira-album','ivory-letter','Kadife Kaplı Fotoğraf Kutusu','kadife-kapli-fotograf-kutusu','Anılar, yumuşak bir kabukta.','quote_required',null,false,true,20,2),
 ('hatira-album','maison-rouge','Misafir Defteri','misafir-defteri','Herkesin bıraktığı bir cümle.','quote_required',null,false,true,20,3),
 ('mum','cherry-seal','İsimli Kokulu Mum','isimli-kokulu-mum','Bir alev, bir koku, bir akşamın anısı.','cart_enabled',120,false,true,5,1),
 ('mum','ivory-letter','Söz Gecesi Mum Seti','soz-gecesi-mum-seti','Üç fitil, tek bir sıcaklık.','cart_enabled',150,false,true,5,2),
 ('mum','maison-rouge','Bal Mumu Adak Mumu','bal-mumu-adak-mumu','Sakin, doğal bir ışık.','cart_enabled',180,false,true,5,3),
 ('gelin-hazirligi','cherry-seal','Gelin Kesesi','gelin-kesesi','O sabahın telaşı bile zarif olsun.','cart_enabled',180,false,true,5,1),
 ('gelin-hazirligi','ivory-letter','Saten Gelin Sabahlığı','saten-gelin-sabahligi','İlk ışığa yakışan bir kumaş.','cart_enabled',210,false,true,5,2),
 ('gelin-hazirligi','maison-rouge','Nedime Hediye Seti','nedime-hediye-seti','Yanınızdakilere küçük bir teşekkür.','cart_enabled',240,false,true,5,3),
 ('setler','cherry-seal','Nişan Başlangıç Seti','nisan-baslangic-seti','Bir dünyayı tek seferde kurun.','cart_enabled',1200,false,true,12,1),
 ('setler','ivory-letter','Davetiye + Mühür + Kurdele Seti','davetiye-muhur-kurdele-seti','Uyum, kutunun içinde hazır.','cart_enabled',1230,false,true,12,2),
 ('setler','maison-rouge','Söz Sofrası Seti','soz-sofrasi-seti','Tepsiden şekerine, tek imza.','cart_enabled',1260,false,true,12,3)
)
insert into public.products
 (name,slug,category_id,collection_id,description,material_story,behavior_type,base_price,
  stock_mode,production_time_days,price_band,proof_required,is_personalizable,
  return_note,delivery_note,sort_order,status)
select x.name,x.slug,cat.id,col.id,x.description,'Doğal kağıt, ipek kurdele ve el işçiliği.',
 x.behavior::public.product_behavior,x.price,'made_to_order',x.lead,
 case when x.price is null then 'inquiry_only' else 'premium' end::public.price_band,
 x.proof,x.personalizable,
 '14 gün içinde standart ürün iadesi. Kişiselleştirilmiş ürünler için farklı koşullar geçerlidir.',
 'Türkiye içi özenli teslimat.',x.sort_order,'published'
from catalog x
join public.departments d on d.slug=x.department_slug
join public.categories cat on cat.department_id=d.id and cat.slug=d.slug||'-kategori'
join public.collections col on col.slug=x.collection_slug
on conflict (slug) do update set name=excluded.name,category_id=excluded.category_id,
 collection_id=excluded.collection_id,description=excluded.description,
 material_story=excluded.material_story,behavior_type=excluded.behavior_type,
 base_price=excluded.base_price,stock_mode=excluded.stock_mode,
 production_time_days=excluded.production_time_days,price_band=excluded.price_band,
 proof_required=excluded.proof_required,is_personalizable=excluded.is_personalizable,
 return_note=excluded.return_note,delivery_note=excluded.delivery_note,
 sort_order=excluded.sort_order,status=excluded.status;

-- Checkout requires at least one published method. Keep city courier scoped.
insert into public.shipping_methods (name,type,city_scope,base_price,status,sort_order)
select 'Standart Kargo','cargo',null,0,'published',1
where not exists (select 1 from public.shipping_methods where name='Standart Kargo');
insert into public.shipping_methods (name,type,city_scope,base_price,status,sort_order)
select 'İstanbul Hızlı Kurye','courier',array['İstanbul'],150,'published',2
where not exists (select 1 from public.shipping_methods where name='İstanbul Hızlı Kurye');
