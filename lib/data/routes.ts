/**
 * Canonical Turkish-first route map (docs/40 + Phase 0 Turkish-URL correction).
 * URL segments are stable ASCII slugs; UI labels are Turkish. English top-level
 * paths (/shop, /collections, /experiences, /digital, /memory, /planning) exist
 * ONLY as 301 redirects in next.config.mjs — never as live routes.
 */

export const ROUTES = {
  home: '/',

  // Brand / Maison
  maison: '/maison',
  maisonNasilCalisir: '/maison/nasil-calisir',
  maisonDunyalar: '/maison/dunyalar',
  iletisim: '/iletisim',
  sss: '/sss',

  // Deneyimler (was /experiences)
  deneyimler: '/deneyimler',

  // Mağaza / Product House (was /shop)
  magaza: '/magaza',

  // Hizmetler / Service House
  hizmetler: '/hizmetler',
  hizmetlerSehir: '/hizmetler/sehir',

  // Dijital (was /digital)
  dijital: '/dijital',

  // Hatıra (was /memory)
  hatira: '/hatira',

  // Planlama (was /planning)
  planlama: '/planlama',
  teklif: '/teklif',
  randevu: '/randevu',

  // Koleksiyonlar (was /collections)
  koleksiyonlar: '/koleksiyonlar',

  // Rehber (unchanged)
  rehber: '/rehber',

  // Arama
  arama: '/arama',

  // Hesabım
  hesap: '/hesap',
  hesapGiris: '/hesap/giris',
  hesapKayit: '/hesap/kayit',
  hesapSifremiUnuttum: '/hesap/sifremi-unuttum',
  siparisTakip: '/siparis-takip',

  // Sepet / Ödeme
  secilimlerim: '/secilimlerim',
  odeme: '/odeme',

  // Kurumsal / Yasal
  kurumsal: '/kurumsal',

  // Yardım
  yardim: '/yardim',

  // Admin
  admin: '/admin',
} as const;

/** Locked day-one Mağaza department slugs (docs/40 §3.3). */
export const MAGAZA_DEPARTMENTS = [
  'davetiye',
  'dijital-davetiye',
  'hediyelik',
  'nisan-soz',
  'nisan-tepsisi',
  'yuzukler',
  'kutu-paketleme',
  'muhur-kurdele',
  'masa-kartlari',
  'menu',
  'karsilama-panosu',
  'qr-kart',
  'hatira-album',
  'mum',
  'gelin-hazirligi',
  'setler',
] as const;

/** Deneyimler (celebration world) slugs (docs/40 §3.2). */
export const DENEYIM_SLUGS = [
  'dugun',
  'nisan-soz',
  'isteme',
  'kina',
  'nikah',
  'dogum-gunu',
  'baby-shower',
  'gender-reveal',
  'kurumsal',
  'ozel-davetler',
] as const;

/** Hizmetler service package slugs surfaced at day one (docs/40 §3.4). */
export const HIZMET_SLUGS = [
  'organizasyon',
  'nisan-organizasyon',
  'dogum-gunu-organizasyon',
  'baby-shower-organizasyon',
  'dekor-konsept',
  'muzik-dj',
  'foto-video',
] as const;

/** Legal document routes (docs/40 §3.13, docs/24, docs/42 §7). */
export const KURUMSAL_DOCS = [
  'kvkk-aydinlatma',
  'gizlilik',
  'cerez-politikasi',
  'cerez-tercihleri',
  'acik-riza',
  'kullanim-kosullari',
  'on-bilgilendirme',
  'mesafeli-satis',
  'iade-iptal',
  'teslimat',
  'kisisellestirilmis-urun-sartlari',
  'hizmet-rezervasyon-sartlari',
  'satici-bilgileri',
] as const;
