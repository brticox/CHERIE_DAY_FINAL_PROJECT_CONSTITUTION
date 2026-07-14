import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
import type { AdminCapability } from '@/lib/admin/permissions';

// Read-side capability per module (fail-closed to the most restrictive).
const CAPS: Record<string, AdminCapability> = {
  'abandoned-carts': 'crm.read',
  campaigns: 'content.read',
  coupons: 'content.read',
};
const configs = {
  'abandoned-carts': {
    title: 'Terk edilen sepetler',
    table: 'abandoned_carts',
    fields: [
      { key: 'cart_id', label: 'Sepet' },
      { key: 'recovery_status', label: 'Kurtarma' },
      { key: 'recovered_at', label: 'Dönüş' },
    ],
    dateKey: 'created_at',
  },
  campaigns: {
    title: 'Kampanyalar',
    table: 'campaigns',
    fields: [
      { key: 'name', label: 'Ad' },
      { key: 'channel', label: 'Kanal' },
      { key: 'scope', label: 'Kapsam' },
    ],
    statusKey: 'is_active',
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
} as const;
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { module } = await params;
  const config = configs[module as keyof typeof configs];
  if (!config) notFound();
  return (
    <DataWorkspace
      config={{
        path: `/admin/marketing/${module}`,
        capability: CAPS[module] ?? 'system.read',
        description: 'Pazarlama kayıtlarının izinli ve gerçek veritabanı görünümü.',
        ...config,
      }}
      query={(await searchParams).q}
    />
  );
}
