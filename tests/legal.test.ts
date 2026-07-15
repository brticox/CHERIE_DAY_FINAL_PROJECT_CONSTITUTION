import { describe, expect, it } from 'vitest';

import { hashLegalContent, validateLegalImport } from '@/lib/legal/content';

const valid = {
  doc_key: 'mesafeli_satis',
  locale: 'tr-TR',
  version: '2026-01',
  title: 'Mesafeli Satış Sözleşmesi',
  summary: 'Onaylı içerik özeti.',
  body: 'Hukuk danışmanı tarafından sağlanan içerik burada yer alır. '.repeat(3),
  effective_from: '2026-08-01',
  source: { author: 'Yetkili hukuk danışmanı' },
  lifecycle_state: 'draft' as const,
  needs_lawyer_review: true,
};

describe('legal content import', () => {
  it('produces a stable deterministic hash', () => {
    expect(hashLegalContent(valid)).toBe(hashLegalContent({ ...valid }));
    expect(hashLegalContent(valid)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects malformed or too-short content', () => {
    expect(() => validateLegalImport({ ...valid, body: 'kısa' })).toThrow();
    expect(() => validateLegalImport({ ...valid, locale: 'turkish' })).toThrow();
  });

  it('does not allow lawyer-review content to be published', () => {
    expect(() => validateLegalImport({ ...valid, lifecycle_state: 'published' })).toThrow(
      'Hukuk incelemesi gereken içerik doğrudan yayımlanamaz.',
    );
  });

  it('accepts an approved publication payload', () => {
    const result = validateLegalImport({
      ...valid,
      lifecycle_state: 'published',
      needs_lawyer_review: false,
      source: { ...valid.source, approved_at: '2026-07-14T08:00:00.000Z' },
    });
    expect(result.data.lifecycle_state).toBe('published');
  });
});
