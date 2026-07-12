import type { Product } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { EmptyState } from '@/components/layout/states';
import { ProductCard } from './product-card';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Bu bölüm yakında zarif seçimlerle dolacak"
        description="O zamana kadar koleksiyonlarımıza göz atabilirsiniz."
        ctaLabel="Koleksiyonları Keşfet"
        ctaHref={ROUTES.koleksiyonlar}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-14">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
