import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  hasAnalyticsConsentEvidence,
  readConsentReceipt,
} from '@/lib/consent/server-receipt';

describe('server-issued consent receipt boundary', () => {
  const receipt = '123e4567-e89b-42d3-a456-426614174000';

  it('accepts only a well-formed HttpOnly receipt identifier', () => {
    expect(readConsentReceipt(`x=1; cherie-consent-receipt=${receipt}`)).toBe(receipt);
    expect(readConsentReceipt('cherie-consent-receipt=client-controlled')).toBeNull();
  });

  it('requires a current, server-read analytics decision', () => {
    expect(
      hasAnalyticsConsentEvidence({
        version: '2026-07-18',
        categories: { necessary: true, analytics: true, marketing: false },
      }),
    ).toBe(true);
    expect(
      hasAnalyticsConsentEvidence({
        version: '2026-07-18',
        categories: { necessary: true, analytics: false, marketing: false },
      }),
    ).toBe(false);
  });

  it('keeps browser-controlled preference data out of the analytics authority path', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'app/api/analytics/events/route.ts'),
      'utf8',
    );
    expect(source).toContain('readConsentReceipt');
    expect(source).not.toContain('parseConsentPreference');
    expect(source).not.toContain('cherie-consent');
  });
});
