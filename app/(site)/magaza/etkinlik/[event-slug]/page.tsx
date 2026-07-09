import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  const value = resolved['event-slug'];
  return (
    <PagePlaceholder
      title="Etkinliğe Göre"
      eyebrow="Mağaza"
      description={`Slug: ${value}`}
    />
  );
}
