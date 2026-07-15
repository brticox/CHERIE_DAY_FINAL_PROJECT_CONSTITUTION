import type { Metadata } from 'next';
import Link from 'next/link';

import { getCollections, getProducts } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGrid } from '@/components/commerce/product-grid';
import { EmptyState } from '@/components/layout/states';

export const metadata: Metadata = buildMetadata({
  title: 'Öne Çıkan Seçimler | CHERIE DAY Mağaza',
  description:
    'Öne çıkan koleksiyonlarımızdan derlenen seçki. Maison’un bu dönem en çok sevilen davetiye, hediyelik ve tören detayları bir arada.',
  path: `${ROUTES.magaza}/one-cikanlar`,
});

export default async function OneCikanlarPage() {
  const [collections, all] = await Promise.all([getCollections(), getProducts()]);
  const featuredSlugs = new Set(
    collections.filter((c) => c.is_featured).map((c) => c.slug),
  );
  const featured = all
    .filter((p) => p.collection_slug && featuredSlugs.has(p.collection_slug))
    .slice(0, 12);
  const featuredCollections = collections.filter((c) => c.is_featured);

  return (
    <div className="cherie-page-glow cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
          { name: 'Öne Çıkanlar', path: `${ROUTES.magaza}/one-cikanlar` },
        ]}
      />
      <PageHeader
        eyebrow="Maison Seçkisi"
        title="Bu dönem en çok sevilenler"
        lead="Öne çıkan koleksiyonlarımızdan bir araya getirdiğimiz seçki. Uyumlu bir dil arıyorsanız, başlamak için en güzel yer."
      />

      {/* Featured worlds shortcut */}
      {featuredCollections.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {featuredCollections.map((c) => (
            <Link
              key={c.id}
              href={`${ROUTES.magaza}/koleksiyon/${c.slug}`}
              className="inline-flex items-center rounded-full border border-cherie-lace bg-cherie-ivory px-4 py-1.5 text-sm text-cherie-soft-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        {featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          <EmptyState
            title="Seçki hazırlanıyor"
            description="Öne çıkan ürünler çok yakında burada olacak. O zamana kadar tüm mağazayı gezebilirsiniz."
            ctaLabel="Mağazaya Dön"
            ctaHref={ROUTES.magaza}
          />
        )}
      </div>
    </div>
  );
}
