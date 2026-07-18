import { readOnePublic } from './source';
import { z } from 'zod';

export interface CmsPage {
  slug: string;
  title: string;
  body: unknown;
}

const homeSectionsSchema = z
  .object({
    hero: z.object({ visible: z.boolean().optional() }).passthrough().optional(),
    testimonials: z.object({ visible: z.boolean().optional() }).passthrough().optional(),
    faq: z.object({ visible: z.boolean().optional() }).passthrough().optional(),
    coverage: z.object({ visible: z.boolean().optional() }).passthrough().optional(),
  })
  .passthrough();

export interface HomeSectionVisibility {
  hero: boolean;
  testimonials: boolean;
  faq: boolean;
  coverage: boolean;
}

export function homeSectionVisibility(body: unknown): HomeSectionVisibility {
  const parsed = homeSectionsSchema.safeParse(body);
  return {
    hero: parsed.success ? parsed.data.hero?.visible !== false : true,
    testimonials: parsed.success ? parsed.data.testimonials?.visible !== false : true,
    faq: parsed.success ? parsed.data.faq?.visible !== false : true,
    coverage: parsed.success ? parsed.data.coverage?.visible !== false : true,
  };
}

/**
 * CMS `pages` (docs/08). No local seed pages in Phase 3 — most public pages are
 * component-driven — so this returns null until a live DB is wired.
 */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  return readOnePublic<CmsPage>('pages_public', 'slug', slug, () => undefined);
}
