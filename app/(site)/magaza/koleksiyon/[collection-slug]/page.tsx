import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  const value = resolved['collection-slug'];
  return (
    <PagePlaceholder
      title="Koleksiyon Seçkisi"
      eyebrow="Mağaza"
      description={`Slug: ${value}`}
    />
  );
}
