import { z } from 'zod';

import { CONSENT_VERSION, consentCategoriesSchema } from './preferences';

/**
 * This cookie is issued only by the consent endpoint. Unlike the localStorage
 * preference, it is HttpOnly and is the sole identifier accepted for server
 * evidence and analytics ingestion.
 */
export const CONSENT_RECEIPT_COOKIE_KEY = 'cherie-consent-receipt';

const consentReceiptSchema = z.string().uuid();

export function readConsentReceipt(cookieHeader: string | null) {
  const value = (cookieHeader ?? '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_RECEIPT_COOKIE_KEY}=`))
    ?.slice(CONSENT_RECEIPT_COOKIE_KEY.length + 1);
  return value && consentReceiptSchema.safeParse(value).success ? value : null;
}

export function hasAnalyticsConsentEvidence(value: unknown) {
  const parsed = z
    .object({
      categories: consentCategoriesSchema,
      version: z.literal(CONSENT_VERSION),
    })
    .safeParse(value);
  return parsed.success && parsed.data.categories.analytics;
}
