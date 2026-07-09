import { ROUTES } from './routes';
import { getCollections, getProducts } from './catalog';
import { getServicePackages } from './services';
import { getArticles, getExperiences } from './editorial';
import type { SearchEntityType, SearchResult } from './types';

/** Turkish diacritic-insensitive normalization (docs/44 §5). */
function normalize(input: string): string {
  const map: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
  };
  return input
    .toLocaleLowerCase('tr')
    .replace(/[çğıİöşü]/g, (c) => map[c] ?? c)
    .trim();
}

function matches(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = normalize(query);
  return fields.some((f) => f && normalize(f).includes(q));
}

export type SearchFilter = SearchEntityType | 'all';

/**
 * Local search across products, services, collections, experiences and rehber.
 * Never returns suppliers/vendors/internal data (docs/44 §5). When a live DB is
 * wired this can be swapped for the `search_documents` FTS index.
 */
export async function search(query: string, filter: SearchFilter = 'all'): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const [products, services, collections, experiences, articles] = await Promise.all([
    getProducts(),
    getServicePackages(),
    getCollections(),
    getExperiences(),
    getArticles(),
  ]);

  const results: SearchResult[] = [];

  if (filter === 'all' || filter === 'product') {
    for (const p of products) {
      if (matches(trimmed, p.name, p.description, p.department_slug)) {
        results.push({
          id: p.id, type: 'product', title: p.name, excerpt: p.description,
          href: `${ROUTES.magaza}/${p.department_slug}/${p.slug}`,
        });
      }
    }
  }
  if (filter === 'all' || filter === 'service_package') {
    for (const s of services) {
      if (matches(trimmed, s.name, s.summary, s.description)) {
        results.push({
          id: s.id, type: 'service_package', title: s.name, excerpt: s.summary,
          href: `${ROUTES.hizmetler}/${s.slug}`,
        });
      }
    }
  }
  if (filter === 'all' || filter === 'collection') {
    for (const c of collections) {
      if (matches(trimmed, c.name, c.story)) {
        results.push({
          id: c.id, type: 'collection', title: c.name, excerpt: c.story,
          href: `${ROUTES.koleksiyonlar}/${c.slug}`,
        });
      }
    }
  }
  if (filter === 'all' || filter === 'experience') {
    for (const e of experiences) {
      if (matches(trimmed, e.name, e.summary)) {
        results.push({
          id: e.id, type: 'experience', title: e.name, excerpt: e.summary,
          href: `${ROUTES.deneyimler}/${e.slug}`,
        });
      }
    }
  }
  if (filter === 'all' || filter === 'article') {
    for (const a of articles) {
      if (matches(trimmed, a.title, a.excerpt)) {
        results.push({
          id: a.id, type: 'article', title: a.title, excerpt: a.excerpt,
          href: `${ROUTES.rehber}/${a.slug}`,
        });
      }
    }
  }

  return results;
}

export const SEARCH_TYPE_LABELS: Record<SearchEntityType, string> = {
  product: 'Ürün',
  service_package: 'Hizmet',
  collection: 'Koleksiyon',
  experience: 'Deneyim',
  article: 'Rehber',
};
