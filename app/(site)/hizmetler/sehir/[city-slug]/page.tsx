import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getServiceCities, getServiceCityBySlug, getPackagesForCity } from '@/lib/data/services';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ServiceGrid } from '@/components/services/service-grid';
import { EmptyState } from '@/components/layout/states';

export async function generateStaticParams() {
  const cities = await getServiceCities();
  return cities.map((c) => ({ 'city-slug': c.city_slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'city-slug': string }>;
}): Promise<Metadata> {
  const { 'city-slug': slug } = await params;
  const city = await getServiceCityBySlug(slug);
  if (!city) return {};
  return buildMetadata({
    title: `${city.city_name} Hizmetleri | CHERIE DAY`,
    description: `${city.city_name}’da sunduğumuz organizasyon ve konsept hizmetleri.`,
    path: `${ROUTES.hizmetlerSehir}/${slug}`,
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ 'city-slug': string }>;
}) {
  const { 'city-slug': slug } = await params;
  const city = await getServiceCityBySlug(slug);
  if (!city) notFound();

  const packages = await getPackagesForCity(slug);

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hizmetler', path: ROUTES.hizmetler },
          { name: 'Şehir', path: ROUTES.hizmetlerSehir },
          { name: city.city_name, path: `${ROUTES.hizmetlerSehir}/${slug}` },
        ]}
      />
      <PageHeader
        eyebrow="Şehir Hizmetleri"
        title={`${city.city_name} için hizmetlerimiz`}
        lead={city.notes_tr ?? undefined}
      />
      <div className="mt-12">
        {packages.length > 0 ? (
          <ServiceGrid services={packages} />
        ) : (
          <EmptyState
            title={`Bu hizmeti henüz ${city.city_name} için sunmuyoruz`}
            description="İlgilenirseniz sizi bekleme listemize ekleyelim."
            ctaLabel="Bize Danışın"
            ctaHref={ROUTES.iletisim}
          />
        )}
      </div>
    </div>
  );
}
