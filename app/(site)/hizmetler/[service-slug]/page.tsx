import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getServicePackages, getServicePackageBySlug } from '@/lib/data/services';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ServiceDetail } from '@/components/services/service-detail';

// `sehir` is a static sibling route; exclude it from dynamic params.
export async function generateStaticParams() {
  const services = await getServicePackages();
  return services.map((s) => ({ 'service-slug': s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'service-slug': string }>;
}): Promise<Metadata> {
  const { 'service-slug': slug } = await params;
  const service = await getServicePackageBySlug(slug);
  if (!service) return {};
  return buildMetadata({
    title: `${service.name} | CHERIE DAY Hizmetler`,
    description: service.summary ?? service.name,
    path: `${ROUTES.hizmetler}/${slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ 'service-slug': string }>;
}) {
  const { 'service-slug': slug } = await params;
  const service = await getServicePackageBySlug(slug);
  if (!service) notFound();

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hizmetler', path: ROUTES.hizmetler },
          { name: service.name, path: `${ROUTES.hizmetler}/${slug}` },
        ]}
      />
      <ServiceDetail service={service} />
    </div>
  );
}
