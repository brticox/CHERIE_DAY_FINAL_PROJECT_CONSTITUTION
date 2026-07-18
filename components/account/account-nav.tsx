'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

// Maison Salonu — the coherent account workspace. Every entry resolves to a
// real, working page; nothing here is a dead placeholder.
const ITEMS = [
  { label: 'Bugün', href: '/hesap' },
  { label: 'Siparişlerim', href: '/hesap/siparisler' },
  { label: 'Seçtiklerim', href: '/hesap/favoriler' },
  { label: 'Adres Defterim', href: '/hesap/adresler' },
  { label: 'Bildirimlerim', href: '/hesap/bildirimler' },
  { label: 'Ayrıcalıklarım', href: '/hesap/ayrikaliklarim' },
  { label: 'Tercihlerim', href: '/hesap/tercihler' },
] as const;

// Unauthenticated account routes should not show the workspace nav.
const HIDE_ON = ['/hesap/giris', '/hesap/kayit', '/hesap/sifremi-unuttum', '/hesap/sifreyi-yenile'];

export function AccountNav() {
  const pathname = usePathname();
  if (HIDE_ON.some((route) => pathname.startsWith(route))) return null;

  return (
    <nav aria-label="Hesap menüsü" className="border-b border-cherie-lace bg-cherie-paper/40">
      <div className="cherie-container">
        <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ITEMS.map((item) => {
            const active =
              item.href === '/hesap'
                ? pathname === '/hesap'
                : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-control px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    active
                      ? 'bg-cherie-ivory text-cherie-burgundy shadow-sm'
                      : 'text-cherie-soft-ink hover:text-cherie-burgundy',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
