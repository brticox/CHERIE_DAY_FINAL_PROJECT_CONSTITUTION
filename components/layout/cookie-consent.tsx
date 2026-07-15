'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cherie-cookie-consent';

/**
 * Cookie consent banner — PLACEHOLDER (docs/44 §7, docs/24 §Cookie Lock).
 * Shows the required three choices on first visit. Phase 1 only records the
 * choice locally so the banner can be dismissed; it does NOT yet gate analytics/
 * marketing scripts or write consent evidence — that lands with the consent
 * pipeline in a later phase. No optional scripts run before a choice is made.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // storage unavailable — fail safe by not showing (no scripts fire anyway)
    }
  }, []);

  function choose(choice: 'accept_all' | 'reject_optional' | 'configure') {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez tercihleri"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-cherie-lace bg-cherie-ivory/95 backdrop-blur-[12px]"
    >
      <div className="cherie-container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm text-cherie-soft-ink">
          Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Ayrıntılar için{' '}
          <Link
            href={`${ROUTES.kurumsal}/cerez-politikasi`}
            className="inline-flex min-h-11 items-center underline hover:text-cherie-burgundy"
          >
            Çerez Politikası
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-11" size="sm" onClick={() => choose('accept_all')}>
            Tümünü Kabul Et
          </Button>
          <Button
            className="min-h-11"
            size="sm"
            variant="secondary"
            onClick={() => choose('reject_optional')}
          >
            Yalnızca Gerekli
          </Button>
          <Button className="min-h-11" size="sm" variant="ghost" asChild>
            <Link
              href={`${ROUTES.kurumsal}/cerez-tercihleri`}
              onClick={() => choose('configure')}
            >
              Tercihleri Yönet
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
