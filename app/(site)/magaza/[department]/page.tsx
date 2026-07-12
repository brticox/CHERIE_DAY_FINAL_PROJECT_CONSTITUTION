import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getCategories,
  getDepartments,
  getDepartmentBySlug,
  getProducts,
  type ProductQuery,
} from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGrid } from '@/components/commerce/product-grid';
import { CatalogToolbar } from '@/components/commerce/catalog-toolbar';

export async function generateStaticParams() {
  const departments = await getDepartments();
  return departments.map((d) => ({ department: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string }>;
}): Promise<Metadata> {
  const { department } = await params;
  const dep = await getDepartmentBySlug(department);
  if (!dep) return {};
  return buildMetadata({
    title: `${dep.name_tr} | CHERIE DAY Ürün Evi`,
    description: dep.description ?? `${dep.name_tr} koleksiyonunu keşfedin.`,
    path: `${ROUTES.magaza}/${dep.slug}`,
  });
}

export default async function DepartmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ department: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { department } = await params;
  const query = await searchParams;
  const dep = await getDepartmentBySlug(department);
  if (!dep) notFound();

  const one = (key: string) => (typeof query[key] === 'string' ? query[key] : undefined);
  const filters: ProductQuery = {
    department,
    search: one('q'),
    category: one('category'),
    stock: one('stock') as ProductQuery['stock'],
    behavior: one('behavior') as ProductQuery['behavior'],
    sort: one('sort') as ProductQuery['sort'],
  };
  const [products, categories] = await Promise.all([
    getProducts(filters),
    getCategories(department),
  ]);

  return (
    <div className="cherie-page-glow cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
          { name: dep.name_tr, path: `${ROUTES.magaza}/${dep.slug}` },
        ]}
      />
      <PageHeader
        eyebrow="Mağaza"
        title={dep.name_tr}
        lead={dep.description ?? undefined}
      />
      <div className="mt-10">
        <CatalogToolbar
          categories={categories}
          value={{
            q: filters.search,
            category: filters.category,
            stock: filters.stock,
            behavior: filters.behavior,
            sort: filters.sort,
          }}
          resultCount={products.length}
        />
      </div>
      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
