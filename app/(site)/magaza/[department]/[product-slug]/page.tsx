import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getDepartmentBySlug,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from '@/lib/data/catalog';
import { buildMetadata, productLd } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { JsonLd } from '@/components/layout/json-ld';
import { ProductDetail } from '@/components/commerce/product-detail';
import { ProductGrid } from '@/components/commerce/product-grid';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ department: p.department_slug, 'product-slug': p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string; 'product-slug': string }>;
}): Promise<Metadata> {
  const { department, 'product-slug': slug } = await params;
  const product = await getProductBySlug(department, slug);
  if (!product) return {};
  const collection = product.collection_slug ? ` | ${product.collection_slug}` : '';
  return buildMetadata({
    title: `${product.name}${collection} | CHERIE DAY Ürün Evi`,
    description: product.description ?? product.name,
    path: `${ROUTES.magaza}/${department}/${slug}`,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ department: string; 'product-slug': string }>;
}) {
  const { department, 'product-slug': slug } = await params;
  const [product, dep] = await Promise.all([
    getProductBySlug(department, slug),
    getDepartmentBySlug(department),
  ]);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const path = `${ROUTES.magaza}/${department}/${slug}`;

  return (
    <div className="cherie-page-glow cherie-container py-10 md:py-16">
      <JsonLd data={productLd(product, path)} />
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Mağaza', path: ROUTES.magaza },
          { name: dep?.name_tr ?? department, path: `${ROUTES.magaza}/${department}` },
          { name: product.name, path },
        ]}
      />

      <ProductDetail product={product} department={dep} />

      {related.length > 0 && (
        <section className="mt-24 border-t border-cherie-lace pt-16">
          <p className="cherie-kicker">Birlikte güzel</p>
          <h2 className="text-h2 mt-3 text-cherie-ink">Bunları da beğenebilirsiniz</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
