import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getDepartments, getDepartmentBySlug, getProducts } from '@/lib/data/catalog';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGrid } from '@/components/commerce/product-grid';

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
}: {
  params: Promise<{ department: string }>;
}) {
  const { department } = await params;
  const dep = await getDepartmentBySlug(department);
  if (!dep) notFound();

  const products = await getProducts({ department });

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
          { name: dep.name_tr, path: `${ROUTES.magaza}/${dep.slug}` },
        ]}
      />
      <PageHeader eyebrow="Mağaza" title={dep.name_tr} lead={dep.description ?? undefined} />
      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
