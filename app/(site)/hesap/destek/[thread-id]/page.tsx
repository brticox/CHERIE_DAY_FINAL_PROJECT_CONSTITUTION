import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  const value = resolved['thread-id'];
  return (
    <PagePlaceholder
      title="Destek Görüşmesi"
      eyebrow="Hesabım"
      description={`Slug: ${value}`}
    />
  );
}
