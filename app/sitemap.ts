import type { MetadataRoute } from 'next';

import { ROUTES } from '@/lib/data/routes';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Phase 1: static top-level surfaces only. Dynamic entries (products, services,
 * collections, rehber) are added from the DB in later phases (docs/13).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ROUTES.home,
    ROUTES.maison,
    ROUTES.deneyimler,
    ROUTES.koleksiyonlar,
    ROUTES.magaza,
    ROUTES.hizmetler,
    ROUTES.dijital,
    ROUTES.hatira,
    ROUTES.planlama,
    ROUTES.rehber,
    ROUTES.iletisim,
    ROUTES.sss,
    ROUTES.yardim,
    ROUTES.kurumsal,
  ];

  const now = new Date();
  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === ROUTES.home ? 1 : 0.7,
  }));
}
