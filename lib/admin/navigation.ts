import type { AdminCapability } from './permissions';

export type AdminNavItem = { label: string; href: string; keywords?: string[] };
export type AdminNavGroup = {
  label: string;
  capability: AdminCapability;
  items: AdminNavItem[];
};

export const ADMIN_NAVIGATION: AdminNavGroup[] = [
  {
    label: 'Genel Bakış',
    capability: 'dashboard.read',
    items: [
      { label: 'Kontrol Merkezi', href: '/admin/dashboard' },
      { label: 'Bugün', href: '/admin/dashboard?view=today' },
      { label: 'Sistem Sağlığı', href: '/admin/dashboard?view=health' },
    ],
  },
  {
    label: 'Siparişler',
    capability: 'orders.read',
    items: [
      { label: 'Tüm Siparişler', href: '/admin/commerce/orders' },
      { label: 'Ödeme Bekleyen', href: '/admin/commerce/orders?status=payment_pending' },
      { label: 'Tasarım', href: '/admin/commerce/proofs' },
      { label: 'Üretim', href: '/admin/commerce/production' },
      { label: 'Kalite Kontrol', href: '/admin/commerce/production?view=quality' },
      { label: 'Kargo', href: '/admin/commerce/shipments' },
      { label: 'İptal / İade', href: '/admin/commerce/refunds' },
    ],
  },
  {
    label: 'Katalog',
    capability: 'catalog.read',
    items: [
      { label: 'Ürünler', href: '/admin/commerce/products' },
      { label: 'Departmanlar', href: '/admin/catalog/departments' },
      { label: 'Kategoriler', href: '/admin/catalog/categories' },
      { label: 'Koleksiyonlar', href: '/admin/catalog/collections' },
      { label: 'Varyantlar', href: '/admin/commerce/variants' },
      { label: 'Eklentiler', href: '/admin/commerce/addons' },
      { label: 'Fiyat Katmanları', href: '/admin/commerce/price-tiers' },
      { label: 'Stok', href: '/admin/commerce/inventory' },
      { label: 'Medya', href: '/admin/media' },
    ],
  },
  {
    label: 'Hizmetler',
    capability: 'services.read',
    items: [
      { label: 'Paketler', href: '/admin/services/packages' },
      { label: 'Randevular', href: '/admin/services/consultations' },
      { label: 'Teklifler', href: '/admin/services/quotes' },
      { label: 'Rezervasyonlar', href: '/admin/services/reservations' },
      { label: 'Takvim', href: '/admin/services/calendar' },
      { label: 'Şehirler', href: '/admin/services/cities' },
      { label: 'Müsaitlik', href: '/admin/services/availability' },
    ],
  },
  {
    label: 'Müşteriler ve İlişkiler',
    capability: 'crm.read',
    items: [
      { label: 'Müşteriler', href: '/admin/customers' },
      { label: 'Talepler', href: '/admin/crm/leads' },
      { label: 'Fırsat Akışı', href: '/admin/crm/leads?view=pipeline' },
      { label: 'Teklif Talepleri', href: '/admin/crm/quote-requests' },
      { label: 'Destek Talepleri', href: '/admin/support' },
    ],
  },
  {
    label: 'İçerik',
    capability: 'content.read',
    items: [
      { label: 'Ana Sayfa', href: '/admin/cms/pages?slug=home' },
      { label: 'Sayfalar', href: '/admin/cms/pages' },
      { label: 'Rehber', href: '/admin/cms/articles' },
      { label: 'SSS', href: '/admin/cms/faqs' },
      { label: 'Yorumlar', href: '/admin/moderation/reviews' },
      { label: 'Galeriler', href: '/admin/cms/galleries' },
      { label: 'Arama Görünümü', href: '/admin/cms/seo' },
    ],
  },
  {
    label: 'Ödemeler ve Finans',
    capability: 'finance.read',
    items: [
      { label: 'Ödemeler', href: '/admin/commerce/payments' },
      { label: 'Başarısız Ödemeler', href: '/admin/commerce/payments?status=failed' },
      { label: 'İadeler', href: '/admin/commerce/refunds' },
    ],
  },
  {
    label: 'Hukuk',
    capability: 'legal.read',
    items: [
      { label: 'Belgeler', href: '/admin/legal/documents' },
      { label: 'Onay Bekleyenler', href: '/admin/legal/documents?status=review' },
      { label: 'Rıza Kayıtları', href: '/admin/legal/consent-log' },
    ],
  },
  {
    label: 'Pazarlama',
    capability: 'content.read',
    items: [
      { label: 'Kuponlar', href: '/admin/marketing/coupons' },
      { label: 'Kampanyalar', href: '/admin/marketing/campaigns' },
      { label: 'Terk Edilen Sepetler', href: '/admin/marketing/abandoned-carts' },
      { label: 'Bildirimler', href: '/admin/marketing/notifications' },
    ],
  },
  {
    label: 'Sistem',
    capability: 'system.read',
    items: [
      { label: 'Ekip', href: '/admin/users' },
      { label: 'Roller', href: '/admin/roles' },
      { label: 'Denetim Günlüğü', href: '/admin/audit-log' },
      { label: 'Ayarlar', href: '/admin/settings' },
      { label: 'Ortam Durumu', href: '/admin/dashboard?view=health' },
    ],
  },
];
