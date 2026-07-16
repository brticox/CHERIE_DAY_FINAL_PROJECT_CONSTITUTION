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
      { key: 'capability_tags', label: 'Yetenekler' },
      { key: 'internal_rating', label: 'İç puan' },
    ],
    statusKey: 'status',
    dateKey: 'created_at',
    manageResource: 'suppliers',
  },
  teams: {
    title: 'Ekipler',
    table: 'teams',
    fields: [
      { key: 'name', label: 'Ekip' },
      { key: 'member_names', label: 'Üyeler' },
      { key: 'capability_tags', label: 'Yetenekler' },
    ],
    dateKey: 'created_at',
    manageResource: 'teams',
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
  const config = configs[module as keyof typeof configs];
  if (!config) notFound();
  const query = await searchParams;
  return (
    <DataWorkspace
      config={{
        path: `/admin/operations/${module}`,
        capability: CAPS[module] ?? 'system.read',
        description: 'Operasyon kaynaklarının gerçek veritabanı görünümü.',
        ...config,
      }}
      query={query.q}
      page={Number(query.page ?? 1)}
    />
  );
}
