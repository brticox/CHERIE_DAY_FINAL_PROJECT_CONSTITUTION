import {
  servicePackages as seedPackages,
  serviceCities as seedCities,
  cityAvailability,
} from '@/content/seed/services';
import { readPublic } from './source';
import type { ServiceCity, ServicePackage } from './types';

export async function getServicePackages(): Promise<ServicePackage[]> {
  return readPublic<ServicePackage>('service_packages_public', seedPackages, { order: 'name' });
}

export async function getServicePackageBySlug(slug: string): Promise<ServicePackage | null> {
  const all = await getServicePackages();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function getServiceCities(): Promise<ServiceCity[]> {
  return readPublic<ServiceCity>('service_cities_public', seedCities, { order: 'city_name' });
}

export async function getServiceCityBySlug(slug: string): Promise<ServiceCity | null> {
  const all = await getServiceCities();
  return all.find((c) => c.city_slug === slug) ?? null;
}

/**
 * Package slugs available in a city. Uses the local availability map; when a
 * live DB is wired this reads `service_city_availability`. Falls back to "all
 * packages" only for İstanbul-like full-coverage seed.
 */
export async function getPackagesForCity(citySlug: string): Promise<ServicePackage[]> {
  const [packages, availableSlugs] = await Promise.all([
    getServicePackages(),
    Promise.resolve(cityAvailability[citySlug] ?? []),
  ]);
  if (availableSlugs.length === 0) return [];
  return packages.filter((p) => availableSlugs.includes(p.slug));
}
