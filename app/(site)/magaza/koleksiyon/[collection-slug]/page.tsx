import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  getCollections,
  getCollectionBySlug,
  getProducts,
  type ProductSort,
} from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGrid } from '@/components/commerce/product-grid';
import { SortBar } from '@/components/commerce/sort-bar';

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ 'collection-slug': c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'collection-slug': string }>;
}): Promise<Metadata> {
  const { 'collection-slug': slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: 'Koleksiyon Bulunamadı' };
  return buildMetadata({
    title: `${collection.name} — Alışveriş | CHERIE DAY Mağaza`,
    description:
      collection.story ??
      `${collection.name} koleksiyonunun tüm ürünlerini keşfedin ve doğrudan sipariş verin.`,
    path: `${ROUTES.magaza}/koleksiyon/${slug}`,
  });
}

export default async function CollectionShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ 'collection-slug': string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { 'collection-slug': slug } = await params;
  const query = await searchParams;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const sort =
    typeof query.sort === 'string' ? (query.sort as ProductSort) : undefined;
  const products = await getProducts({ collection: slug, sort });

  return (
    <div className="cherie-page-glow cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
          { name: `${collection.name} Koleksiyonu`, path: `${ROUTES.magaza}/koleksiyon/${slug}` },
        ]}
      />

      <div
        className="mt-2 flex h-24 overflow-hidden rounded-card"
        aria-hidden
      >
        {(collection.palette.length
          ? collection.palette
          : ['#F3EDE3', '#E8D8C7', '#B08A57']
        ).map((hex, i) => (
          <span key={i} className="flex-1" style={{ backgroundColor: hex }} />
        ))}
      </div>

      <PageHeader
        className="mt-8"
        eyebrow="Koleksiyondan Alışveriş"
        title={collection.name}
        lead={collection.story ?? undefined}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-cherie-soft-ink">
          {products.length} ürün · bu koleksiyona ait tüm parçalar
        </p>
        <SortBar
          basePath={`${ROUTES.magaza}/koleksiyon/${slug}`}
          value={sort ?? 'featured'}
        />
      </div>

      <div className="mt-10">
        <ProductGrid products={products} />
      </div>

      <p className="mt-12 text-sm text-cherie-soft-ink">
        Bu koleksiyonun hikâyesini{' '}
        <Link
          href={`${ROUTES.koleksiyonlar}/${slug}`}
          className="text-cherie-burgundy hover:underline"
        >
          Koleksiyonlar
        </Link>{' '}
        sayfasında okuyabilir, diğer dünyalar için{' '}
        <Link href={ROUTES.maisonDunyalar} className="text-cherie-burgundy hover:underline">
          Dünyalar
        </Link>
        ’a göz atabilirsiniz.
      </p>
    </div>
  );
}
