import { describe, expect, it } from 'vitest';

import { safeNextPath } from '@/lib/validation/auth';

describe('kimlik yönlendirme güvenliği', () => {
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/api/internal/notifications/process',
    '/auth/callback',
    `/hesap/${'a'.repeat(501)}`,
    '/hesap\u0000/sonraki',
  ])('güvenli olmayan sonraki adresi reddeder: %s', (value) => {
    expect(safeNextPath(value)).toBe('/hesap');
  });

  it('sorgu dizesi içeren iç rota adresini korur', () => {
    expect(safeNextPath('/hesap/siparisler?durum=hazirlaniyor')).toBe(
      '/hesap/siparisler?durum=hazirlaniyor',
    );
  });
});
