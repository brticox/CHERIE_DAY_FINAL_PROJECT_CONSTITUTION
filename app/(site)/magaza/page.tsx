import type { Metadata } from 'next';

import { getDepartments, getProducts } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { DepartmentGrid } from '@/components/commerce/department-grid';
import { ProductGrid } from '@/components/commerce/product-grid';

export const metadata: Metadata = buildMetadata({
  title: 'Mağaza — Davetiyeden Hediyeye',
  description:
    'Davetiye, dijital davetiye, hediyelik, nişan & söz ürünleri ve daha fazlası. CHERIE DAY Ürün Evi’ni keşfedin.',
  path: ROUTES.magaza,
});

export default async function MagazaPage() {
  const [departments, featured] = await Promise.all([
    getDepartments(),
    getProducts({ limit: 8 }),
  ]);

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'Mağaza', path: ROUTES.magaza }]} />
      <PageHeader
        eyebrow="Ürün Evi"
        title="Her kapı, ayrı bir hikâyeye açılır"
        lead="Kağıda dökülen ilk sözden, misafirinize kalan hatıraya kadar; departmanlarımızda gezinin."
      />

      <section className="mt-12">
        <DepartmentGrid departments={departments} />
      </section>

      <section className="mt-20">
        <h2 className="text-h2 text-cherie-ink">Öne Çıkan Seçimler</h2>
        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </section>
    </div>
  );
}
