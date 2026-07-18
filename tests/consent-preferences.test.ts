import { describe, expect, it } from 'vitest';

import {
  CONSENT_VERSION,
  createConsentPreference,
  parseConsentPreference,
} from '@/lib/consent/preferences';

describe('versioned consent preferences', () => {
  it('keeps necessary storage enabled while preserving granular choices', () => {
    const preference = createConsentPreference(
      'configure',
      { analytics: true, marketing: false },
      '123e4567-e89b-42d3-a456-426614174000',
    );
    expect(preference).toMatchObject({
      version: CONSENT_VERSION,
      action: 'configure',
      categories: { necessary: true, analytics: true, marketing: false },
    });
  });

  it.each(['accept_all', 'legacy_unknown_value_v1', '{bad json}', 'null'])(
    'rejects unversioned or malformed legacy evidence: %s',
    (value) => expect(parseConsentPreference(value)).toBeNull(),
  );

  it('rejects a record that tries to disable necessary storage', () => {
    expect(
      parseConsentPreference(
        JSON.stringify({
          version: CONSENT_VERSION,
          sessionRef: '123e4567-e89b-42d3-a456-426614174000',
          action: 'configure',
          categories: { necessary: false, analytics: true, marketing: false },
          updatedAt: new Date().toISOString(),
        }),
      ),
    ).toBeNull();
  });
});
