import type { Metadata } from 'next';
import Link from 'next/link';

import { getServicePackages, getServiceCities } from '@/lib/data/services';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ServiceGrid } from '@/components/services/service-grid';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Hizmetler — Organizasyon & Konsept',
  description:
    'Düğün, nişan, doğum günü ve baby shower organizasyonundan dekor, müzik ve film ekibine; konseptten uygulamaya CHERIE DAY imzasıyla.',
  path: ROUTES.hizmetler,
});

export default async function HizmetlerPage() {
  const [services, cities] = await Promise.all([getServicePackages(), getServiceCities()]);
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Hizmetler', path: ROUTES.hizmetler }]} />
      <PageHeader
        eyebrow="Hizmet Showroom"
        title="Bahçenizi, hayalinizin sahnesine çeviriyoruz"
        lead="Konseptten uygulamaya kadar her kutlamayı tek bir estetik dilde kuruyoruz."
      />

      <div className="mt-12">
        <ServiceGrid services={services} />
      </div>

      <section className="mt-16 rounded-card border border-cherie-lace bg-cherie-paper/50 p-8">
        <h2 className="text-h3 text-cherie-ink">Şehrinizde hizmet var mı?</h2>
        <p className="mt-2 text-sm text-cherie-soft-ink">
          Şu an {cities.map((c) => c.city_name).join(', ')} şehirlerinde hizmet veriyoruz.
        </p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href={ROUTES.hizmetlerSehir}>Şehir Hizmetlerini Gör</Link>
        </Button>
      </section>
    </div>
  );
}
