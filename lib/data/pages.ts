import { readOnePublic } from './source';

export interface CmsPage {
  slug: string;
  title: string;
  body: unknown;
}

/**
 * CMS `pages` (docs/08). No local seed pages in Phase 3 — most public pages are
 * component-driven — so this returns null until a live DB is wired.
 */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  return readOnePublic<CmsPage>('pages_public', 'slug', slug, () => undefined);
}
