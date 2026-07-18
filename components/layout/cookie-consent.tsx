'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { Button } from '@/components/ui/button';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  createConsentPreference,
  persistConsentPreference,
  readConsentPreference,
  type ConsentAction,
} from '@/lib/consent/preferences';

const ELEMENT_ID = 'cherie-cookie-consent';

// Visibility depends on localStorage, which SSR can't see, so the banner used to stay
// unmounted until a React effect resolved it on the client. Under heavy client JS,
// hydration itself can take seconds, and no effect — passive or layout — can run
// before hydration reaches this component; that pushed the banner's first paint out
// far enough for Lighthouse to flag its text as a late, inflated mobile LCP element.
// The plain inline script below resolves visibility synchronously as the browser
// parses the HTML, before the hydration bundle even runs — the same technique used
// by no-flash dark-mode toggles. React always renders the same "hidden" markup on
// the server and on its first client pass (so hydration matches); suppressHydration-
// Warning tells React not to fight the script's own DOM mutation on that one element.
const RESOLVE_SCRIPT = `try{var e=document.getElementById(${JSON.stringify(
  ELEMENT_ID,
)}),v=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}),p=v?JSON.parse(v):null;if(e&&(!p||p.version!==${JSON.stringify(CONSENT_VERSION)}||!p.categories||p.categories.necessary!==true))e.hidden=false;}catch(x){var e=document.getElementById(${JSON.stringify(ELEMENT_ID)});if(e)e.hidden=false;}`;

/**
 * Consent is versioned, category-specific, locally enforceable before optional
 * code runs, and mirrored to the append-only consent evidence endpoint.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const current = readConsentPreference();
    if (!current) setVisible(true);
    else {
      setAnalytics(current.categories.analytics);
      setMarketing(current.categories.marketing);
    }
  }, []);

  async function choose(
    action: ConsentAction,
    categories: { analytics: boolean; marketing: boolean },
  ) {
    const current = readConsentPreference();
    try {
      await persistConsentPreference(
        createConsentPreference(action, categories, current?.sessionRef),
      );
    } catch {
      // Optional code remains blocked when storage is unavailable.
    }
    setVisible(false);
  }

  return (
    <>
      <div
        id={ELEMENT_ID}
        role="dialog"
        aria-live="polite"
        aria-label="Çerez tercihleri"
        hidden={!visible}
        suppressHydrationWarning
        className="fixed inset-x-0 bottom-0 z-50 border-t border-cherie-lace bg-cherie-ivory/95 backdrop-blur-[12px]"
      >
        <div className="cherie-container py-4 sm:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
            <Button
              className="min-h-11"
              size="sm"
              onClick={() => choose('accept_all', { analytics: true, marketing: true })}
            >
              Tümünü Kabul Et
            </Button>
            <Button
              className="min-h-11"
              size="sm"
              variant="secondary"
              onClick={() =>
                choose('reject_optional', { analytics: false, marketing: false })
              }
            >
              Yalnızca Gerekli
            </Button>
            <Button
              className="min-h-11"
              size="sm"
              variant="ghost"
              aria-expanded={configuring}
              onClick={() => setConfiguring((value) => !value)}
            >
              Tercihleri Yönet
            </Button>
            </div>
          </div>
          {configuring && (
            <div className="mt-4 grid gap-3 border-t border-cherie-lace pt-4 sm:grid-cols-2">
              <CategoryChoice
                label="Analitik"
                checked={analytics}
                onChange={setAnalytics}
              />
              <CategoryChoice
                label="Pazarlama"
                checked={marketing}
                onChange={setMarketing}
              />
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button
                  size="sm"
                  onClick={() => choose('configure', { analytics, marketing })}
                >
                  Seçimi Kaydet
                </Button>
                <Link
                  href={`${ROUTES.kurumsal}/cerez-tercihleri`}
                  className="inline-flex min-h-11 items-center text-sm text-cherie-burgundy underline"
                >
                  Ayrıntılı tercih sayfası
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* eslint-disable-next-line react/no-danger -- static, non-user-derived resolver script */}
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: RESOLVE_SCRIPT }} />
    </>
  );
}

function CategoryChoice({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-control border border-cherie-lace px-3 text-sm text-cherie-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="cherie-check"
      />
      {label}
    </label>
  );
}
