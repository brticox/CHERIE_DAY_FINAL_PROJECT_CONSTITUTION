'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { PRIMARY_NAV, UTILITY_NAV, PRIMARY_CTA } from '@/lib/data/navigation';
import { ROUTES } from '@/lib/data/routes';
import { Button } from '@/components/ui/button';

/** Mobile drawer nav (docs/40 §4.3). Framer Motion is used for the small
 *  open/close transition only — the cinematic homepage is out of scope here. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full z-50 border-b border-cherie-lace bg-cherie-ivory px-5 py-6 shadow-card"
            aria-label="Mobil menü"
          >
            <ul className="flex flex-col gap-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-control px-2 py-3 text-cherie-ink hover:bg-cherie-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-cherie-lace pt-3">
                <Link
                  href={ROUTES.hizmetlerSehir}
                  onClick={() => setOpen(false)}
                  className="block rounded-control px-2 py-3 text-cherie-soft-ink hover:bg-cherie-paper"
                >
                  Şehir Hizmetleri
                </Link>
              </li>
              {[...UTILITY_NAV, { label: 'Sipariş Takibi', href: ROUTES.siparisTakip }, { label: 'Yardım', href: ROUTES.yardim }].map(
                (item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-control px-2 py-3 text-cherie-soft-ink hover:bg-cherie-paper"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <Button asChild className="mt-4 w-full">
              <Link href={PRIMARY_CTA.href} onClick={() => setOpen(false)}>
                {PRIMARY_CTA.label}
              </Link>
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
