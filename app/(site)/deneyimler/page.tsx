import type { Metadata } from 'next';
import Link from 'next/link';

import { getExperiences } from '@/lib/data/editorial';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { MediaFrame } from '@/components/commerce/media-frame';

export const metadata: Metadata = buildMetadata({
  title: 'Deneyimler — Kutlama Dünyaları',
  description:
    'Düğünden söze, doğum gününden baby shower’a; her kutlama için tek bir estetik dil.',
  path: ROUTES.deneyimler,
});

export default async function DeneyimlerPage() {
  const experiences = await getExperiences();
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Deneyimler', path: ROUTES.deneyimler }]} />
      <PageHeader
        eyebrow="Kutlama Dünyaları"
        title="Her kutlama, kendi hikâyesini fısıldar"
        lead="Deneyim sayfaları; ürünleri, koleksiyonları ve hizmetleri tek bir duygu etrafında buluşturur."
      />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {experiences.map((e) => (
          <Link
            key={e.id}
            href={`${ROUTES.deneyimler}/${e.slug}`}
            className="group rounded-card border border-cherie-lace bg-cherie-ivory p-4 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
          >
            <MediaFrame label={e.name} ratio="aspect-[16/10]" />
            <h3 className="mt-4 text-h3 text-cherie-ink group-hover:text-cherie-burgundy">{e.name}</h3>
            {e.summary && <p className="mt-1 text-sm text-cherie-soft-ink">{e.summary}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
