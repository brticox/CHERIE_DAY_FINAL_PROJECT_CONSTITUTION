'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { trackEvent } from '@/lib/analytics/client';
import { CONSENT_CHANGED_EVENT } from '@/lib/consent/preferences';

export function AnalyticsPageView() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const track = () => {
      if (lastTrackedPath.current === pathname) return;
      if (trackEvent('page_view', { route: pathname })) {
        lastTrackedPath.current = pathname;
      }
    };

    track();
    window.addEventListener(CONSENT_CHANGED_EVENT, track);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, track);
  }, [pathname]);

  return null;
}
