import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCollections, getCollectionBySlug, getProducts } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGrid } from '@/components/commerce/product-grid';

// Render products/collections created after the last build on-demand (then ISR-cache),
// so a newly published or renamed item resolves without a redeploy.
export const dynamicParams = true;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return buildMetadata({
    title: `${collection.name} Koleksiyonu | CHERIE DAY`,
    description: collection.story ?? `${collection.name} koleksiyonunu keşfedin.`,
    path: `${ROUTES.koleksiyonlar}/${slug}`,
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await getProducts({ collection: slug });

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Koleksiyonlar', path: ROUTES.koleksiyonlar },
          { name: collection.name, path: `${ROUTES.koleksiyonlar}/${slug}` },
        ]}
      />
      <div className="flex h-24 overflow-hidden rounded-card">
        {(collection.palette.length ? collection.palette : ['#F3EDE3', '#E8D8C7', '#B08A57']).map((hex, i) => (
          <span key={i} className="flex-1" style={{ backgroundColor: hex }} aria-hidden />
        ))}
      </div>
      <PageHeader className="mt-8" eyebrow="Koleksiyon" title={collection.name} lead={collection.story ?? undefined} />

      <section className="mt-12">
        <h2 className="text-h3 text-cherie-ink">Bu Dünyadan Parçalar</h2>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
