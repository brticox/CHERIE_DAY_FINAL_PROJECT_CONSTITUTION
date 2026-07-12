import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { requireUser } from '@/lib/auth/guards';
import { cartConfigured, getCart } from '@/lib/cart/server';
import { ROUTES } from '@/lib/data/routes';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPaymentProviderReadiness } from '@/lib/payments';

export const metadata: Metadata = {
  title: 'Güvenli Ödeme',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireUser('/odeme');
  if (!cartConfigured()) redirect('/secilimlerim');
  const cart = await getCart();
  const active = cart.items.filter((item) => !item.removed_at);
  if (!active.length) redirect('/secilimlerim');
  const admin = createAdminClient();
  const { data } = await admin
    .from('shipping_methods')
    .select('id, name, type, base_price')
    .eq('status', 'published')
    .order('sort_order');
  const methods = (data ?? []) as unknown as {
    id: string;
    name: string;
    type: string;
    base_price: number;
  }[];
  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Seçimlerim', path: ROUTES.secilimlerim },
          { name: 'Güvenli Ödeme', path: ROUTES.odeme },
        ]}
      />
      <PageHeader
        eyebrow="Türkiye içi güvenli ödeme"
        title="Siparişinizi sakin ve güvenli biçimde tamamlayın"
        lead="Teslimat, fatura ve yasal onaylar tek akışta. Kart bilgileriniz ödeme sağlayıcısı açılmadan CHERIE DAY tarafından alınmaz."
      />
      <div className="mt-10">
        <CheckoutForm
          shippingMethods={methods}
          paymentProviders={getPaymentProviderReadiness()}
          summary={{
            count: cart.count,
            total: cart.total,
            proofRequired: active.some((item) => Boolean(item.requires_proof)),
          }}
        />
      </div>
    </div>
  );
}
