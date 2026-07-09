import { ROUTES } from './routes';

export type NavItem = {
  label: string;
  href: string;
};

/** Primary desktop nav (docs/40 §4.1). Turkish labels, Turkish slugs. */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Deneyimler', href: ROUTES.deneyimler },
  { label: 'Koleksiyonlar', href: ROUTES.koleksiyonlar },
  { label: 'Mağaza', href: ROUTES.magaza },
  { label: 'Hizmetler', href: ROUTES.hizmetler },
  { label: 'Dijital', href: ROUTES.dijital },
  { label: 'Hatıra', href: ROUTES.hatira },
  { label: 'Planlama', href: ROUTES.planlama },
  { label: 'Rehber', href: ROUTES.rehber },
];

/** Utility / account nav (docs/40 §4.1). */
export const UTILITY_NAV: NavItem[] = [
  { label: 'Arama', href: ROUTES.arama },
  { label: 'Hesabım', href: ROUTES.hesap },
  { label: 'Seçimlerim', href: ROUTES.secilimlerim },
];

/** Primary conversion CTA (docs/40 §4.1, docs/06). */
export const PRIMARY_CTA: NavItem = {
  label: 'Hayalini Tasarla',
  href: `${ROUTES.planlama}/hayalini-tasarla`,
};

/** Footer column groups (docs/40 §4.4). */
export const FOOTER_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Maison',
    items: [
      { label: 'Hakkımızda', href: ROUTES.maison },
      { label: 'Nasıl Çalışır', href: ROUTES.maisonNasilCalisir },
      { label: 'Dünyalar', href: ROUTES.maisonDunyalar },
      { label: 'Rehber', href: ROUTES.rehber },
    ],
  },
  {
    title: 'Alışveriş',
    items: [
      { label: 'Mağaza', href: ROUTES.magaza },
      { label: 'Koleksiyonlar', href: ROUTES.koleksiyonlar },
      { label: 'Deneyimler', href: ROUTES.deneyimler },
      { label: 'Dijital', href: ROUTES.dijital },
    ],
  },
  {
    title: 'Hizmetler',
    items: [
      { label: 'Hizmet Showroom', href: ROUTES.hizmetler },
      { label: 'Şehir Hizmetleri', href: ROUTES.hizmetlerSehir },
      { label: 'Teklif Al', href: ROUTES.teklif },
      { label: 'Randevu Al', href: ROUTES.randevu },
    ],
  },
  {
    title: 'Yardım',
    items: [
      { label: 'Yardım Merkezi', href: ROUTES.yardim },
      { label: 'Sipariş Takibi', href: ROUTES.siparisTakip },
      { label: 'İletişim', href: ROUTES.iletisim },
      { label: 'SSS', href: ROUTES.sss },
    ],
  },
  {
    title: 'Yasal',
    items: [
      { label: 'KVKK Aydınlatma Metni', href: `${ROUTES.kurumsal}/kvkk-aydinlatma` },
      { label: 'Gizlilik Politikası', href: `${ROUTES.kurumsal}/gizlilik` },
      { label: 'Mesafeli Satış Sözleşmesi', href: `${ROUTES.kurumsal}/mesafeli-satis` },
      { label: 'Çerez Tercihleri', href: `${ROUTES.kurumsal}/cerez-tercihleri` },
    ],
  },
];
