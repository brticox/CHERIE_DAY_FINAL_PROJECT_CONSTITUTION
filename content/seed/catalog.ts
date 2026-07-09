import type { Collection, Department, Product, ProductBehavior } from '@/lib/data/types';

/**
 * Local seed catalog. Turkish literary voice (docs/39): breath-length lines,
 * concrete imagery, one feeling per line, no filler superlatives. Used when
 * Supabase is not configured (Phase 3 fallback).
 */

export const departments: Department[] = [
  { id: 'dep-davetiye', name_tr: 'Davetiye & Basılı Ürünler', slug: 'davetiye', sort_order: 1, description: 'Kağıda dökülen ilk söz; her davet burada başlar.' },
  { id: 'dep-dijital-davetiye', name_tr: 'Dijital Davetiye', slug: 'dijital-davetiye', sort_order: 2, description: 'Işıkla yazılan davet, bir dokunuşla sevdiklerinize.' },
  { id: 'dep-hediyelik', name_tr: 'Hediyelikler & Nikah Şekeri', slug: 'hediyelik', sort_order: 3, description: 'Her misafir, bir yaprak kadar hafif bir hatıra taşısın.' },
  { id: 'dep-nisan-soz', name_tr: 'Nişan, Söz & İsteme Ürünleri', slug: 'nisan-soz', sort_order: 4, description: 'Sözünüz, kadife kadar nazik olsun.' },
  { id: 'dep-nisan-tepsisi', name_tr: 'Nişan / Söz Tepsisi', slug: 'nisan-tepsisi', sort_order: 5, description: 'İki yüzüğün buluştuğu ince zemin.' },
  { id: 'dep-yuzukler', name_tr: 'Yüzükler & Aksesuarlar', slug: 'yuzukler', sort_order: 6, description: 'Bu an, ışığını hiç kaybetmesin.' },
  { id: 'dep-kutu-paketleme', name_tr: 'Kutu & Paketleme', slug: 'kutu-paketleme', sort_order: 7, description: 'Hediyenin ilk sözünü kutusu söyler.' },
  { id: 'dep-muhur-kurdele', name_tr: 'Mühür & Kurdele', slug: 'muhur-kurdele', sort_order: 8, description: 'Bir damla mum, bir düğüm ipek; imzanız.' },
  { id: 'dep-masa-kartlari', name_tr: 'Masa Kartı & Event Stationery', slug: 'masa-kartlari', sort_order: 9, description: 'Her isim, masasında zarifçe karşılansın.' },
  { id: 'dep-menu', name_tr: 'Menü Kartları', slug: 'menu', sort_order: 10, description: 'Sofranın hikâyesi, kartın üzerinde.' },
  { id: 'dep-karsilama-panosu', name_tr: 'Karşılama Panosu', slug: 'karsilama-panosu', sort_order: 11, description: 'Kapıdaki ilk selam, sizin adınıza.' },
  { id: 'dep-qr-kart', name_tr: 'QR Kart', slug: 'qr-kart', sort_order: 12, description: 'Küçük bir kare, koca bir davet.' },
  { id: 'dep-hatira-album', name_tr: 'Hatıra & Albüm', slug: 'hatira-album', sort_order: 13, description: 'Yıllar sonra bile açılacak sayfalar.' },
  { id: 'dep-mum', name_tr: 'Mum & Kokulu Objeler', slug: 'mum', sort_order: 14, description: 'Bir alev, bir koku, bir akşamın anısı.' },
  { id: 'dep-gelin-hazirligi', name_tr: 'Gelin Hazırlığı', slug: 'gelin-hazirligi', sort_order: 15, description: 'O sabahın telaşı bile zarif olsun.' },
  { id: 'dep-setler', name_tr: 'Koleksiyon Setleri', slug: 'setler', sort_order: 16, description: 'Bir dünyayı tek seferde kurun.' },
];

export const collections: Collection[] = [
  { id: 'col-cherry-seal', name: 'Cherry Seal', slug: 'cherry-seal', is_featured: true, sort_order: 1, palette: ['#8F1D2C', '#FAF7F1', '#B08A57'], story: 'Kırmızı bir mühür, klasik bir zarafet.' },
  { id: 'col-ivory-letter', name: 'Ivory Letter', slug: 'ivory-letter', is_featured: true, sort_order: 2, palette: ['#FAF7F1', '#E8D8C7', '#4B403C'], story: 'Fildişi kağıt, ince bir tipografi.' },
  { id: 'col-maison-rouge', name: 'Maison Rouge', slug: 'maison-rouge', is_featured: false, sort_order: 3, palette: ['#4A0E17', '#B08A57', '#F3EDE3'], story: 'Bordo bir gece, altın bir dokunuş.' },
  { id: 'col-lace-memory', name: 'Lace Memory', slug: 'lace-memory', is_featured: false, sort_order: 4, palette: ['#E8D8C7', '#FAF7F1', '#8F1D2C'], story: 'Dantel bir dünya, nostaljik bir iz.' },
  { id: 'col-velvet-promise', name: 'Velvet Promise', slug: 'velvet-promise', is_featured: false, sort_order: 5, palette: ['#2B1118', '#8F1D2C', '#B08A57'], story: 'Kadife bir söz, sıcak bir vaat.' },
  { id: 'col-noir-cherie', name: 'Noir Cherie', slug: 'noir-cherie', is_featured: false, sort_order: 6, palette: ['#1F1917', '#B08A57', '#FAF7F1'], story: 'Gece teması, dramatik bir ışık.' },
  { id: 'col-pearl-ceremony', name: 'Pearl Ceremony', slug: 'pearl-ceremony', is_featured: false, sort_order: 7, palette: ['#F3EDE3', '#E8D8C7', '#B08A57'], story: 'İnci bir sabah, zarif bir nikâh.' },
];

type SeedSpec = {
  department: string;
  behavior: ProductBehavior;
  price: number | null;
  proof: boolean;
  personalizable: boolean;
  lead: number;
  items: { name: string; desc: string }[];
};

const SPECS: SeedSpec[] = [
  { department: 'davetiye', behavior: 'proof_required_cart', price: 220, proof: true, personalizable: true, lead: 10, items: [
    { name: 'Mühürlü Bahçe Davetiyesi', desc: 'Zarfın içinde, bir bahçe saklı.' },
    { name: 'İnce Zarif Kraft Davetiye', desc: 'Sade kağıt, net bir çağrı.' },
    { name: 'Altın Yaldızlı Klasik Davetiye', desc: 'Işık, kenarlardan usulca sızar.' },
  ] },
  { department: 'dijital-davetiye', behavior: 'digital_checkout', price: 260, proof: false, personalizable: true, lead: 3, items: [
    { name: 'Hareketli Dijital Davet', desc: 'Sevginiz artık ışıkla da yazılır.' },
    { name: 'Tek Sayfa Web Davet', desc: 'Bir bağlantı, koca bir davet.' },
    { name: 'Klasik Dijital Kart', desc: 'Zarafet, ekranın içinde.' },
  ] },
  { department: 'hediyelik', behavior: 'cart_enabled', price: 90, proof: false, personalizable: true, lead: 5, items: [
    { name: 'Kadife Keseli Nikah Şekeri', desc: 'Küçük bir tat, uzun bir anı.' },
    { name: 'Kişiye Özel Teşekkür Kutusu', desc: 'İsminizle mühürlenmiş bir jest.' },
    { name: 'Mum & Kurdele Hediye Seti', desc: 'Bir alev, bir düğüm, bir teşekkür.' },
  ] },
  { department: 'nisan-soz', behavior: 'cart_enabled', price: 480, proof: false, personalizable: true, lead: 7, items: [
    { name: 'Söz Hediyelik Seti', desc: 'Sözün en güzel hâli, elinizde.' },
    { name: 'İsteme Çikolatası & Kutu', desc: 'Tatlı bir başlangıç, zarif bir sunum.' },
    { name: 'Kadife Yüzük Yastığı', desc: 'İki yüzüğe nazik bir zemin.' },
  ] },
  { department: 'nisan-tepsisi', behavior: 'quote_required', price: null, proof: false, personalizable: true, lead: 14, items: [
    { name: 'El İşlemesi Nişan Tepsisi', desc: 'İki yüzüğün buluştuğu ince zemin.' },
    { name: 'Ayna Detaylı Söz Tepsisi', desc: 'Işığı ikiye katlayan bir yüzey.' },
    { name: 'Pirinç Çerçeveli Tepsi', desc: 'Sıcak metal, sakin bir tören.' },
  ] },
  { department: 'yuzukler', behavior: 'inquiry_only', price: null, proof: false, personalizable: false, lead: 21, items: [
    { name: 'Klasik Tektaş Yüzük', desc: 'Bu an, ışığını hiç kaybetmesin.' },
    { name: 'İnce Alyans Çifti', desc: 'İki halka, tek söz.' },
    { name: 'Kadife Yüzük Kutusu', desc: 'Kapağın ardında bir vaat.' },
  ] },
  { department: 'kutu-paketleme', behavior: 'cart_enabled', price: 140, proof: false, personalizable: true, lead: 5, items: [
    { name: 'Mıknatıslı Hediye Kutusu', desc: 'Hediyenin ilk sözünü kutusu söyler.' },
    { name: 'İpek Kurdeleli Karton Kutu', desc: 'Sade dış, zarif iç.' },
    { name: 'Çekmece Model Sunum Kutusu', desc: 'Usulca açılan bir sürpriz.' },
  ] },
  { department: 'muhur-kurdele', behavior: 'cart_enabled', price: 70, proof: false, personalizable: true, lead: 4, items: [
    { name: 'Balmumu Mühür Seti', desc: 'Bir damla mum, kalıcı bir imza.' },
    { name: 'İsme Özel Mühür Pulu', desc: 'İki harf, bir hane.' },
    { name: 'İpek Kurdele Topu', desc: 'Zarafet, düğümün içinde.' },
  ] },
  { department: 'masa-kartlari', behavior: 'proof_required_cart', price: 60, proof: true, personalizable: true, lead: 6, items: [
    { name: 'El Yazısı Masa Kartı', desc: 'Her isim, masasında zarifçe karşılansın.' },
    { name: 'Altın Baskılı Oturma Kartı', desc: 'İnce bir çizgi, net bir yer.' },
    { name: 'Kraft Yer Kartı', desc: 'Doğal doku, sıcak karşılama.' },
  ] },
  { department: 'menu', behavior: 'proof_required_cart', price: 55, proof: true, personalizable: true, lead: 6, items: [
    { name: 'Tek Sayfa Zarif Menü', desc: 'Sofranın hikâyesi, kartın üzerinde.' },
    { name: 'Katlamalı Akşam Menüsü', desc: 'Her tabak, sırasını bekler.' },
    { name: 'İnce Uzun Menü Kartı', desc: 'Dikey bir zarafet.' },
  ] },
  { department: 'karsilama-panosu', behavior: 'proof_required_cart', price: 900, proof: true, personalizable: true, lead: 12, items: [
    { name: 'Ayna Karşılama Panosu', desc: 'Kapıdaki ilk selam, sizin adınıza.' },
    { name: 'Akrilik İsim Panosu', desc: 'Şeffaf zemin, net isimler.' },
    { name: 'Ahşap Yön Panosu', desc: 'Misafiri nazikçe yönlendiren el.' },
  ] },
  { department: 'qr-kart', behavior: 'digital_checkout', price: 150, proof: false, personalizable: true, lead: 3, items: [
    { name: 'QR Davet Kartı', desc: 'Küçük bir kare, koca bir davet.' },
    { name: 'QR Anı Kartı', desc: 'Bir okutma, bir albüm.' },
    { name: 'QR Menü Kartı', desc: 'Masada beliren dijital sofra.' },
  ] },
  { department: 'hatira-album', behavior: 'quote_required', price: null, proof: false, personalizable: true, lead: 20, items: [
    { name: 'El Yapımı Anı Albümü', desc: 'Yıllar sonra bile açılacak sayfalar.' },
    { name: 'Kadife Kaplı Fotoğraf Kutusu', desc: 'Anılar, yumuşak bir kabukta.' },
    { name: 'Misafir Defteri', desc: 'Herkesin bıraktığı bir cümle.' },
  ] },
  { department: 'mum', behavior: 'cart_enabled', price: 120, proof: false, personalizable: true, lead: 5, items: [
    { name: 'İsimli Kokulu Mum', desc: 'Bir alev, bir koku, bir akşamın anısı.' },
    { name: 'Söz Gecesi Mum Seti', desc: 'Üç fitil, tek bir sıcaklık.' },
    { name: 'Bal Mumu Adak Mumu', desc: 'Sakin, doğal bir ışık.' },
  ] },
  { department: 'gelin-hazirligi', behavior: 'cart_enabled', price: 180, proof: false, personalizable: true, lead: 5, items: [
    { name: 'Gelin Kesesi', desc: 'O sabahın telaşı bile zarif olsun.' },
    { name: 'Saten Gelin Sabahlığı', desc: 'İlk ışığa yakışan bir kumaş.' },
    { name: 'Nedime Hediye Seti', desc: 'Yanınızdakilere küçük bir teşekkür.' },
  ] },
  { department: 'setler', behavior: 'cart_enabled', price: 1200, proof: false, personalizable: true, lead: 12, items: [
    { name: 'Nişan Başlangıç Seti', desc: 'Bir dünyayı tek seferde kurun.' },
    { name: 'Davetiye + Mühür + Kurdele Seti', desc: 'Uyum, kutunun içinde hazır.' },
    { name: 'Söz Sofrası Seti', desc: 'Tepsiden şekerine, tek imza.' },
  ] },
];

function slugify(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return input
    .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const products: Product[] = SPECS.flatMap((spec) =>
  spec.items.map((item, i): Product => {
    const collection = collections[i % collections.length]!;
    return {
      id: `${spec.department}-${i + 1}`,
      name: item.name,
      slug: slugify(item.name),
      department_slug: spec.department,
      collection_slug: collection.slug,
      description: item.desc,
      material_story: 'Doğal kağıt, ipek kurdele ve el işçiliği.',
      behavior_type: spec.behavior,
      base_price: spec.price === null ? null : spec.price + i * 30,
      currency: 'TRY',
      stock_mode: 'made_to_order',
      production_time_days: spec.lead,
      price_band: spec.price === null ? 'inquiry_only' : 'premium',
      proof_required: spec.proof,
      is_personalizable: spec.personalizable,
      return_note:
        '14 gün içinde standart ürün iadesi. Kişiselleştirilmiş ürünler için farklı koşullar geçerlidir.',
      delivery_note: 'Türkiye içi özenli teslimat.',
      media_ids: [],
    };
  }),
);
