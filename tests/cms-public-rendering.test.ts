import { describe, expect, it } from 'vitest';

import { homeSectionVisibility } from '@/lib/data/pages';

describe('published homepage CMS projection', () => {
  it('keeps the current homepage intact when no valid CMS record exists', () => {
    expect(homeSectionVisibility(null)).toEqual({
      hero: true,
      testimonials: true,
      faq: true,
      coverage: true,
    });
  });

  it('honors only explicit published section visibility values', () => {
    expect(
      homeSectionVisibility({
        hero: { visible: true, heading: 'CMS copy remains data' },
        testimonials: { visible: false },
        faq: { visible: false },
        coverage: { visible: true },
      }),
    ).toEqual({ hero: true, testimonials: false, faq: false, coverage: true });
  });
});
