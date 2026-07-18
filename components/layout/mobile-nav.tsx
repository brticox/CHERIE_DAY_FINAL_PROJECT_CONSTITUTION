'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { PRIMARY_NAV, UTILITY_NAV, PRIMARY_CTA } from '@/lib/data/navigation';
import { ROUTES } from '@/lib/data/routes';
import { Button } from '@/components/ui/button';
import { BrandLogo } from './brand-logo';
import { cn } from '@/lib/utils';

/** Mobile drawer nav (docs/40 §4.3). Framer Motion is used for the small
 *  open/close transition only — the cinematic homepage is out of scope here. */
export function MobileNav({ overSky = false }: { overSky?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute('hidden'));
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('button')?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Menüyü kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-cherie-velvet/55 backdrop-blur-sm"
          />
          <motion.nav
            id={dialogId}
            ref={drawerRef}
            key="mobile-drawer"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,24rem)] flex-col overflow-y-auto border-r border-cherie-lace bg-cherie-ivory px-5 pb-8 pt-5 shadow-lift"
            aria-label="Mobil menü"
            aria-modal="true"
            role="dialog"
          >
            <div className="mb-7 flex items-center justify-between border-b border-cherie-lace pb-5">
              <BrandLogo />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menüyü kapat"
                onClick={() => setOpen(false)}
              >
                <X />
              </Button>
            </div>
            <ul className="flex flex-col gap-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center rounded-control px-3 py-3 text-cherie-ink hover:bg-cherie-paper',
                      pathname === item.href &&
                        'bg-cherie-paper font-semibold text-cherie-burgundy',
                    )}
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
              {[
                ...UTILITY_NAV,
                { label: 'Sipariş Takibi', href: ROUTES.siparisTakip },
                { label: 'Yardım', href: ROUTES.yardim },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-control px-2 py-3 text-cherie-soft-ink hover:bg-cherie-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-4 w-full">
              <Link href={PRIMARY_CTA.href} onClick={() => setOpen(false)}>
                {PRIMARY_CTA.label}
              </Link>
            </Button>
            <p className="mt-auto pt-8 text-center text-xs leading-5 text-cherie-soft-ink">
              Türkiye’ye özel düğün, hediye ve kutlama maison’u.
            </p>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="lg:hidden">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          overSky &&
            !open &&
            'text-cherie-ivory hover:bg-cherie-ivory/15 hover:text-cherie-ivory',
        )}
      >
        {open ? <X /> : <Menu />}
      </Button>
      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
