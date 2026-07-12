import type { Metadata } from 'next';

import { CartView, type Cart } from '@/components/commerce/cart-view';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { cartConfigured, getCart } from '@/lib/cart/server';
import { ROUTES } from '@/lib/data/routes';

export const metadata: Metadata = {
  title: 'Seçimlerim',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const configured = cartConfigured();
  const initialCart = configured ? ((await getCart().catch(() => null)) as Cart | null) : null;
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Seçimlerim', path: '/secilimlerim' },
        ]}
      />
      <PageHeader
        eyebrow="Seçimlerim"
        title="Kutlamanız için ayırdıklarınız"
        lead="Ürünlerinizi, kişiselleştirme notlarınızı ve adetlerinizi ödeme öncesinde burada birlikte tutun."
      />
      <div className="mt-10">
        <CartView initialCart={initialCart} configured={configured} />
      </div>
    </div>
  );
}
