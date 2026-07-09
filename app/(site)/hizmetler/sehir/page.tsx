import type { Metadata } from 'next';

import { getServiceCities, getPackagesForCity } from '@/lib/data/services';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { CityAvailabilityCard } from '@/components/services/city-availability-card';

export const metadata: Metadata = buildMetadata({
  title: 'Şehir Hizmetleri | CHERIE DAY',
  description:
    'İstanbul, Ankara, İzmir, Bursa ve Antalya’da sunduğumuz organizasyon ve konsept hizmetleri.',
  path: ROUTES.hizmetlerSehir,
});

export default async function SehirPage() {
  const cities = await getServiceCities();
  const counts = await Promise.all(cities.map((c) => getPackagesForCity(c.city_slug)));

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hizmetler', path: ROUTES.hizmetler },
          { name: 'Şehir Hizmetleri', path: ROUTES.hizmetlerSehir },
        ]}
      />
      <PageHeader
        eyebrow="Şehir Hizmetleri"
        title="Bahçemiz, sizin şehrinizde de açar"
        lead="Şehrinizi seçin; sizin için sunabileceğimiz hizmetleri birlikte görelim."
      />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city, i) => (
          <CityAvailabilityCard key={city.id} city={city} packageCount={counts[i]?.length} />
        ))}
      </div>
    </div>
  );
}
