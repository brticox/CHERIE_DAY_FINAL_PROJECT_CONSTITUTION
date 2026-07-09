import type { Metadata } from 'next';

import { getCollections } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { CollectionGrid } from '@/components/commerce/collection-grid';

export const metadata: Metadata = buildMetadata({
  title: 'Koleksiyonlar — Kutlama Dünyaları',
  description:
    'Cherry Seal’den Pearl Ceremony’ye; her koleksiyon davetiyeden hediyeye uzanan bütün bir dünya.',
  path: ROUTES.koleksiyonlar,
});

export default async function KoleksiyonlarPage() {
  const collections = await getCollections();
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Koleksiyonlar', path: ROUTES.koleksiyonlar }]} />
      <PageHeader
        eyebrow="Koleksiyon Dünyaları"
        title="Bir renk, bir doku, bir bütün dünya"
        lead="Koleksiyonlarımız yalnızca birer palet değil; davetiyeden dekora uzanan bir estetik dildir."
      />
      <div className="mt-12">
        <CollectionGrid collections={collections} />
      </div>
    </div>
  );
}
