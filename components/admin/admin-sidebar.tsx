import Link from 'next/link';

/** Admin module map (docs/45 §1). Utilitarian command center, not cinematic. */
const ADMIN_NAV: { group: string; items: { label: string; href: string }[] }[] = [
  {
    group: 'Genel',
    items: [{ label: 'Kontrol Paneli', href: '/admin/dashboard' }],
  },
  {
    group: 'Ticaret',
    items: [
      { label: 'Ürünler', href: '/admin/commerce/products' },
      { label: 'Siparişler', href: '/admin/commerce/orders' },
      { label: 'Ödemeler', href: '/admin/commerce/payments' },
      { label: 'İadeler', href: '/admin/commerce/refunds' },
      { label: 'Kargolar', href: '/admin/commerce/shipments' },
      { label: 'Tasarım Onayları', href: '/admin/commerce/proofs' },
      { label: 'Üretim', href: '/admin/commerce/production' },
    ],
  },
  {
    group: 'Katalog',
    items: [
      { label: 'Departmanlar', href: '/admin/catalog/departments' },
      { label: 'Kategoriler', href: '/admin/catalog/categories' },
      { label: 'Koleksiyonlar', href: '/admin/catalog/collections' },
    ],
  },
  {
    group: 'Hizmetler',
    items: [
      { label: 'Paketler', href: '/admin/services/packages' },
      { label: 'Rezervasyonlar', href: '/admin/services/reservations' },
      { label: 'Rezervasyon Takvimi', href: '/admin/services/calendar' },
      { label: 'Teklifler', href: '/admin/services/quotes' },
      { label: 'Danışmanlıklar', href: '/admin/services/consultations' },
      { label: 'Şehirler', href: '/admin/services/cities' },
    ],
  },
  {
    group: 'Müşteri & CRM',
    items: [
      { label: 'Talepler', href: '/admin/crm/leads' },
      { label: 'Müşteriler', href: '/admin/customers' },
      { label: 'Destek', href: '/admin/support' },
    ],
  },
  {
    group: 'İçerik',
    items: [
      { label: 'Sayfalar', href: '/admin/cms/pages' },
      { label: 'Rehber', href: '/admin/cms/articles' },
      { label: 'Medya', href: '/admin/media' },
      { label: 'Moderasyon', href: '/admin/moderation/queue' },
    ],
  },
  {
    group: 'Yasal & Sistem',
    items: [
      { label: 'Yasal Belgeler', href: '/admin/legal/documents' },
      { label: 'Kuponlar', href: '/admin/marketing/coupons' },
      { label: 'Ayarlar', href: '/admin/settings' },
      { label: 'Personel', href: '/admin/users' },
      { label: 'Denetim Kaydı', href: '/admin/audit-log' },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-cherie-lace bg-cherie-paper/40 md:block">
      <div className="sticky top-0 max-h-dvh overflow-y-auto p-5">
        <Link href="/admin/dashboard" className="font-display text-lg text-cherie-burgundy">
          CHERIE DAY · Yönetim
        </Link>
        <nav className="mt-6 space-y-6">
          {ADMIN_NAV.map((section) => (
            <div key={section.group}>
              <p className="mb-2 text-xs uppercase tracking-wider text-cherie-brass">
                {section.group}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-control px-2 py-1.5 text-sm text-cherie-soft-ink hover:bg-cherie-mist hover:text-cherie-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
