import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
import type { AdminCapability } from '@/lib/admin/permissions';

// Read-side capability per module (fail-closed to the most restrictive).
const CAPS: Record<string, AdminCapability> = {
  assignments: 'system.read',
  suppliers: 'system.read',
  teams: 'system.read',
};
const configs = {
  assignments: {
    title: 'Atamalar',
    table: 'assignments',
    fields: [
      { key: 'role', label: 'Rol' },
      { key: 'status', label: 'Durum' },
      { key: 'reservation_id', label: 'Rezervasyon' },
    ],
    dateKey: 'created_at',
  },
  suppliers: {
    title: 'Tedarikçiler',
    table: 'suppliers',
    fields: [
      { key: 'name', label: 'Ad' },
      { key: 'category', label: 'Kategori' },
      { key: 'contact_name', label: 'İletişim' },
    ],
    statusKey: 'is_active',
    dateKey: 'created_at',
  },
  teams: {
    title: 'Ekipler',
    table: 'teams',
    fields: [
      { key: 'name', label: 'Ekip' },
      { key: 'description', label: 'Açıklama' },
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
        path: `/admin/operations/${module}`,
        capability: CAPS[module] ?? 'system.read',
        description: 'Operasyon kaynaklarının gerçek veritabanı görünümü.',
        ...config,
      }}
      query={(await searchParams).q}
    />
  );
}
