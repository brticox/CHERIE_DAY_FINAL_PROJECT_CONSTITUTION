import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  const value = resolved['topic-slug'];
  return (
    <PagePlaceholder
      title="Yardım Konusu"
      eyebrow="Yardım"
      description={`Slug: ${value}`}
    />
  );
}
