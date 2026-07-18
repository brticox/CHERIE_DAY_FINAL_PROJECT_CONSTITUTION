import { z } from 'zod';

export const CONSENT_STORAGE_KEY = 'cherie-cookie-consent';
export const CONSENT_VERSION = '2026-07-18';
export const CONSENT_CHANGED_EVENT = 'cherie:consent-changed';

export const consentCategoriesSchema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export const consentActionSchema = z.enum([
  'accept_all',
  'reject_optional',
  'configure',
]);

export const consentPreferenceSchema = z.object({
  version: z.literal(CONSENT_VERSION),
  sessionRef: z.string().uuid(),
  action: consentActionSchema,
  categories: consentCategoriesSchema,
  updatedAt: z.string().datetime(),
});

export type ConsentCategory = keyof z.infer<typeof consentCategoriesSchema>;
export type ConsentPreference = z.infer<typeof consentPreferenceSchema>;
export type ConsentAction = z.infer<typeof consentActionSchema>;

export function parseConsentPreference(value: string | null): ConsentPreference | null {
  if (!value) return null;
  try {
    const parsed = consentPreferenceSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function readConsentPreference(): ConsentPreference | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseConsentPreference(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function hasConsent(category: Exclude<ConsentCategory, 'necessary'>) {
  return readConsentPreference()?.categories[category] === true;
}

export function createConsentPreference(
  action: ConsentAction,
  categories: { analytics: boolean; marketing: boolean },
  existingSessionRef?: string,
): ConsentPreference {
  return {
    version: CONSENT_VERSION,
    sessionRef: existingSessionRef ?? crypto.randomUUID(),
    action,
    categories: { necessary: true, ...categories },
    updatedAt: new Date().toISOString(),
  };
}

export async function persistConsentPreference(preference: ConsentPreference) {
  const validated = consentPreferenceSchema.parse(preference);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(validated));
  window.dispatchEvent(
    new CustomEvent<ConsentPreference>(CONSENT_CHANGED_EVENT, { detail: validated }),
  );

  void fetch('/api/consent', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(validated),
    keepalive: true,
  }).catch(() => {
    // The local choice still gates optional code. Evidence delivery is retried
    // when the visitor changes preferences; it must never block withdrawal.
  });
}
