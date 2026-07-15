import type { MetadataRoute } from 'next';

import { ROUTES, KURUMSAL_DOCS } from '@/lib/data/routes';
import { getDepartments, getCollections, getProducts } from '@/lib/data/catalog';
import { getExperiences, getArticles } from '@/lib/data/editorial';
import { getServicePackages, getServiceCities } from '@/lib/data/services';
import { getHelpTopics } from '@/lib/data/help';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

type Entry = MetadataRoute.Sitemap[number];

/**
 * Dynamic Turkish-first sitemap (docs/13). Combines the static top-level IA with
 * every public data-driven route: departments, products, collections (editorial
 * + shop), experiences (editorial + shop), services, cities, articles and help
 * topics. Private/noindex surfaces (hesap, ödeme, arama) are intentionally
 * excluded. Reads flow through the seed→DB fallback, so this never throws.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entry = (path: string, priority = 0.6, changeFrequency: Entry['changeFrequency'] = 'weekly'): Entry => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const staticPaths: Entry[] = [
    entry(ROUTES.home, 1, 'daily'),
    entry(ROUTES.maison, 0.6),
    entry(ROUTES.maisonNasilCalisir, 0.5),
    entry(ROUTES.maisonDunyalar, 0.5),
    entry(ROUTES.deneyimler, 0.8),
    entry(ROUTES.koleksiyonlar, 0.8),
    entry(ROUTES.magaza, 0.9, 'daily'),
    entry(`${ROUTES.magaza}/one-cikanlar`, 0.7),
    entry(`${ROUTES.magaza}/yeni`, 0.7),
    entry(ROUTES.hizmetler, 0.8),
    entry(ROUTES.hizmetlerSehir, 0.7),
    entry(ROUTES.dijital, 0.8),
    entry(ROUTES.hatira, 0.6),
    entry(ROUTES.planlama, 0.6),
    entry(`${ROUTES.planlama}/hayalini-tasarla`, 0.7),
    entry(`${ROUTES.planlama}/kontrol-listesi`, 0.5),
    entry(`${ROUTES.planlama}/butce-rehberi`, 0.5),
    entry(`${ROUTES.planlama}/zaman-akisi`, 0.5),
    entry(ROUTES.rehber, 0.7),
    entry(ROUTES.teklif, 0.8),
    entry(ROUTES.randevu, 0.7),
    entry(ROUTES.iletisim, 0.6),
    entry(ROUTES.sss, 0.6),
    entry(ROUTES.yardim, 0.6),
    entry(`${ROUTES.yardim}/siparisim`, 0.4),
    entry(ROUTES.kurumsal, 0.3, 'monthly'),
  ];

  const legal: Entry[] = KURUMSAL_DOCS.map((doc) =>
    entry(`${ROUTES.kurumsal}/${doc}`, 0.3, 'monthly'),
  );

  const [departments, collections, products, experiences, services, cities, articles] =
    await Promise.all([
      getDepartments(),
      getCollections(),
      getProducts(),
      getExperiences(),
      getServicePackages(),
      getServiceCities(),
      getArticles(),
    ]);

  const departmentEntries = departments.map((d) => entry(`${ROUTES.magaza}/${d.slug}`, 0.7));
  const productEntries = products.map((p) =>
    entry(`${ROUTES.magaza}/${p.department_slug}/${p.slug}`, 0.6),
  );
  const collectionEntries = collections.flatMap((c) => [
    entry(`${ROUTES.koleksiyonlar}/${c.slug}`, 0.6),
    entry(`${ROUTES.magaza}/koleksiyon/${c.slug}`, 0.6),
  ]);
  const experienceEntries = experiences.flatMap((e) => [
    entry(`${ROUTES.deneyimler}/${e.slug}`, 0.7),
    entry(`${ROUTES.magaza}/etkinlik/${e.slug}`, 0.6),
  ]);
  const serviceEntries = services.map((s) => entry(`${ROUTES.hizmetler}/${s.slug}`, 0.7));
  const cityEntries = cities.map((c) => entry(`${ROUTES.hizmetlerSehir}/${c.city_slug}`, 0.6));
  const articleEntries = articles.map((a) => entry(`${ROUTES.rehber}/${a.slug}`, 0.5));
  const helpEntries = getHelpTopics().map((t) => entry(`${ROUTES.yardim}/${t.slug}`, 0.4));

  return [
    ...staticPaths,
    ...legal,
    ...departmentEntries,
    ...productEntries,
    ...collectionEntries,
    ...experienceEntries,
    ...serviceEntries,
    ...cityEntries,
    ...articleEntries,
    ...helpEntries,
  ];
}
