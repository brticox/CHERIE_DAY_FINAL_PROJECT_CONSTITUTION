import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
import type { AdminCapability } from '@/lib/admin/permissions';

// Read-side capability per module (fail-closed to the most restrictive).
const CAPS: Record<string, AdminCapability> = {
  'collection-sets': 'catalog.read',
  'event-types': 'catalog.read',
  'materials-colors-tags': 'catalog.read',
};
const configs = {
  'collection-sets': {
    title: 'Koleksiyon setleri',
    table: 'collection_sets',
    fields: [
      { key: 'name', label: 'Ad' },
      { key: 'slug', label: 'Slug' },
    ],
    statusKey: 'status',
    dateKey: 'updated_at',
  },
  'event-types': {
    title: 'Etkinlik türleri',
    table: 'event_types',
    fields: [
      { key: 'name_tr', label: 'Ad' },
      { key: 'slug', label: 'Slug' },
    ],
    statusKey: 'status',
  },
  'materials-colors-tags': {
    title: 'Malzeme, renk ve etiketler',
    table: 'materials',
    fields: [
      { key: 'name_tr', label: 'Malzeme' },
      { key: 'slug', label: 'Slug' },
      { key: 'sort_order', label: 'Sıra' },
    ],
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
        path: `/admin/catalog/${module}`,
        capability: CAPS[module] ?? 'system.read',
        description: 'Katalog sınıflandırmasının gerçek veritabanı kayıtları.',
        ...config,
      }}
      query={(await searchParams).q}
    />
  );
}
