import type { Metadata } from 'next';

import { getProducts } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGrid } from '@/components/commerce/product-grid';
import { EmptyState } from '@/components/layout/states';

export const metadata: Metadata = buildMetadata({
  title: 'Yeni Sezon Seçkisi | CHERIE DAY Mağaza',
  description:
    'Her departmandan bir seçki: bu sezon keşfetmeye değer davetiye, hediyelik ve tören detaylarını tek bir sayfada topladık.',
  path: `${ROUTES.magaza}/yeni`,
});

export default async function YeniPage() {
  const all = await getProducts();

  // One representative piece per department — a genuine "what to explore"
  // edit. Seed carries no timestamps, so we present this as a curated season
  // selection rather than claiming individual items were just added.
  const seen = new Set<string>();
  const edit = all.filter((p) => {
    if (seen.has(p.department_slug)) return false;
    seen.add(p.department_slug);
    return true;
  });

  return (
    <div className="cherie-page-glow cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
          { name: 'Yeni Sezon', path: `${ROUTES.magaza}/yeni` },
        ]}
      />
      <PageHeader
        eyebrow="Yeni Sezon"
        title="Bu sezon keşfedilecekler"
        lead="Her departmandan bir başlangıç noktası derledik. Buradan yola çıkıp beğendiğiniz dünyanın derinine inebilirsiniz."
      />

      <div className="mt-12">
        {edit.length > 0 ? (
          <ProductGrid products={edit} />
        ) : (
          <EmptyState
            title="Seçki hazırlanıyor"
            description="Yeni sezon seçkimiz çok yakında burada. O zamana kadar tüm mağazayı gezebilirsiniz."
            ctaLabel="Mağazaya Dön"
            ctaHref={ROUTES.magaza}
          />
        )}
      </div>
    </div>
  );
}
