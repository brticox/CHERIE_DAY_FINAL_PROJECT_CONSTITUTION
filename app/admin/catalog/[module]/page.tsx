import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
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
        description: 'Katalog sınıflandırmasının gerçek veritabanı kayıtları.',
        ...config,
      }}
      query={(await searchParams).q}
    />
  );
}
