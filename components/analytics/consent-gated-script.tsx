'use client';

import Script, { type ScriptProps } from 'next/script';
import { useEffect, useState } from 'react';

import {
  CONSENT_CHANGED_EVENT,
  hasConsent,
  type ConsentPreference,
} from '@/lib/consent/preferences';

export function ConsentGatedScript({
  category,
  ...props
}: ScriptProps & { category: 'analytics' | 'marketing' }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(hasConsent(category));
    const onChange = (event: Event) => {
      const preference = (event as CustomEvent<ConsentPreference>).detail;
      setAllowed(preference.categories[category]);
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
  }, [category]);

  return allowed ? <Script {...props} /> : null;
}
