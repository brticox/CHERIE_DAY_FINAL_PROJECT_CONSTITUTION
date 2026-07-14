import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
const configs = {
  gallery: {
    title: 'Galeri moderasyonu',
    table: 'galleries',
    fields: [
      { key: 'title', label: 'Galeri' },
      { key: 'linked_entity_type', label: 'Bağlam' },
      { key: 'media_ids', label: 'Medya' },
    ],
    statusKey: 'status',
    dateKey: 'created_at',
  },
  queue: {
    title: 'Moderasyon kuyruğu',
    table: 'reviews',
    fields: [
      { key: 'reviewer_name', label: 'Yazan' },
      { key: 'rating', label: 'Puan' },
      { key: 'body', label: 'Yorum' },
    ],
    statusKey: 'status',
    dateKey: 'created_at',
  },
  reviews: {
    title: 'Değerlendirmeler',
    table: 'reviews',
    fields: [
      { key: 'reviewer_name', label: 'Yazan' },
      { key: 'rating', label: 'Puan' },
      { key: 'body', label: 'Yorum' },
    ],
    statusKey: 'status',
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
        path: `/admin/moderation/${module}`,
        description: 'İnceleme gerektiren gerçek içerik kayıtları.',
        ...config,
      }}
      query={(await searchParams).q}
    />
  );
}
