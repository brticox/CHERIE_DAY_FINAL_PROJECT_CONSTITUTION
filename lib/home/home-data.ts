import { getFaqs } from '@/lib/data/editorial';
import { getServiceCities, getServicePackages } from '@/lib/data/services';
import { ROUTES } from '@/lib/data/routes';
import { departments, collections } from '@/content/seed/catalog';
import { experiences, testimonials } from '@/content/seed/editorial';
import type {
  Collection,
  Department,
  Faq,
  ServiceCity,
  ServicePackage,
  Testimonial,
} from '@/lib/data/types';

/**
 * Homepage data assembly (Phase 2A — cinematic foundation).
 *
 * Wraps existing seeds/getters; introduces no new backend. Every list keeps
 * the seed-fallback philosophy of `readPublic` so the homepage renders fully
 * even before Supabase is live.
 */

/** Occasion tiles (Söz/Nişan → Düğün arc) sourced from the experiences seed. */
const OCCASION_SLUGS = ['isteme', 'nisan-soz', 'nikah', 'dugun'] as const;

/** Department slugs featured as "Dünyalar" on the homepage. */
const WORLD_SLUGS = [
  'davetiye',
  'hediyelik',
  'nisan-tepsisi',
  'yuzukler',
  'muhur-kurdele',
  'kutu-paketleme',
] as const;

/** Service packages surfaced on the homepage strip. */
const SERVICE_SLUGS = [
  'dugun-organizasyonu',
  'nisan-soz-organizasyonu',
  'foto-video',
] as const;

export interface OccasionTile {
  slug: string;
  name: string;
  summary: string;
  href: string;
}

export interface HomeData {
  occasions: OccasionTile[];
  worlds: Department[];
  featuredCollections: Collection[];
  services: ServicePackage[];
  cities: ServiceCity[];
  testimonials: Testimonial[];
  faqs: Faq[];
}

export async function getHomeData(): Promise<HomeData> {
  const [allServices, cities, faqs] = await Promise.all([
    getServicePackages(),
    getServiceCities(),
    getFaqs(),
  ]);

  const occasions: OccasionTile[] = OCCASION_SLUGS.map((slug) => {
    const exp = experiences.find((e) => e.slug === slug);
    return {
      slug,
      name: exp?.name ?? slug,
      summary: exp?.summary ?? '',
      href: `${ROUTES.deneyimler}/${slug}`,
    };
  });

  const worlds = WORLD_SLUGS.map((slug) =>
    departments.find((d) => d.slug === slug),
  ).filter((d): d is Department => Boolean(d));

  const featuredCollections = collections
    .filter((c) => c.is_featured)
    .concat(collections.filter((c) => !c.is_featured))
    .slice(0, 3);

  const services = SERVICE_SLUGS.map((slug) =>
    allServices.find((s) => s.slug === slug),
  ).filter((s): s is ServicePackage => Boolean(s));

  return {
    occasions,
    worlds,
    featuredCollections,
    services,
    cities,
    testimonials: testimonials.slice(0, 3),
    faqs: faqs.slice(0, 4),
  };
}
