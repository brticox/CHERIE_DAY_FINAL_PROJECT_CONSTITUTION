import Link from 'next/link';

import { FOOTER_GROUPS } from '@/lib/data/navigation';
import { ROUTES } from '@/lib/data/routes';

/** Public site footer (docs/40 §4.4) with Yasal + Yardım + Hizmetler columns.
 *  Çerez Tercihleri must be reachable from every page (docs/44 §7). */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-cherie-lace bg-cherie-paper">
      <div className="cherie-container grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-2xl text-cherie-burgundy">CHERIE DAY</p>
          <p className="mt-3 max-w-xs text-sm text-cherie-soft-ink">
            Türkiye’ye özel lüks düğün, hediye ve kutlama maison’u.
          </p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="mb-4 text-sm font-medium text-cherie-ink">{group.title}</p>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cherie-soft-ink transition-colors duration-control ease-cherie hover:text-cherie-burgundy"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-cherie-lace">
        <div className="cherie-container flex flex-col gap-2 py-6 text-xs text-cherie-soft-ink sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} CHERIE DAY. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`${ROUTES.kurumsal}/cerez-tercihleri`} className="hover:text-cherie-burgundy">
              Çerez Tercihleri
            </Link>
            <Link href={`${ROUTES.kurumsal}/kvkk-aydinlatma`} className="hover:text-cherie-burgundy">
              KVKK Aydınlatma Metni
            </Link>
            <Link href={`${ROUTES.kurumsal}/satici-bilgileri`} className="hover:text-cherie-burgundy">
              Satıcı Bilgileri
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
