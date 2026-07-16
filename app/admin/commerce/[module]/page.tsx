import { notFound, redirect } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
import type { AdminCapability } from '@/lib/admin/permissions';

// Read-side capability per module (fail-closed to the most restrictive).
const CAPS: Record<string, AdminCapability> = {
  'abandoned-carts': 'crm.read',
  analytics: 'finance.read',
  coupons: 'catalog.read',
  'digital-products': 'catalog.read',
  inventory: 'catalog.read',
};
const configs = {
  'abandoned-carts': {
    title: 'Terk edilen sepetler',
    table: 'abandoned_carts',
    fields: [
      { key: 'cart_id', label: 'Sepet' },
      { key: 'customer_id', label: 'Müşteri' },
      { key: 'recovery_status', label: 'Kurtarma' },
    ],
    dateKey: 'created_at',
  },
  analytics: {
    title: 'Ticaret analitiği',
    table: 'orders',
    fields: [
      { key: 'order_number', label: 'Sipariş' },
      { key: 'total_amount', label: 'Tutar' },
      { key: 'payment_status', label: 'Ödeme' },
    ],
    statusKey: 'status',
    dateKey: 'created_at',
  },
  coupons: {
    title: 'Kuponlar',
    table: 'coupons',
    fields: [
      { key: 'code', label: 'Kod' },
      { key: 'discount_type', label: 'Tür' },
      { key: 'discount_value', label: 'Değer' },
    ],
    statusKey: 'is_active',
    dateKey: 'created_at',
  },
  'digital-products': {
    title: 'Dijital ürünler',
    table: 'digital_products',
    fields: [
      { key: 'name_tr', label: 'Ad' },
      { key: 'digital_type', label: 'Tür' },
      { key: 'base_price', label: 'Fiyat' },
    ],
    statusKey: 'status',
    dateKey: 'updated_at',
  },
  inventory: {
    title: 'Stok görünümü',
    table: 'product_variants',
    fields: [
      { key: 'title', label: 'Varyant' },
      { key: 'sku', label: 'SKU' },
      { key: 'stock_quantity', label: 'Stok' },
    ],
    statusKey: 'status',
  },
} as const;
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { module } = await params;
  const query = await searchParams;
  if (module === 'refunds') redirect('/admin/finance/refunds');
  if (module === 'coupons') redirect('/admin/marketing/coupons');
  const config = configs[module as keyof typeof configs];
  if (!config) notFound();
  return (
    <DataWorkspace
      config={{
        path: `/admin/commerce/${module}`,
        capability: CAPS[module] ?? 'system.read',
        description: 'Durum değişikliği sunmadan gerçek operasyon kayıtlarının görünümü.',
        ...config,
      }}
      query={query.q}
      page={Number(query.page ?? 1)}
    />
  );
}
