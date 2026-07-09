import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  const value = resolved['order-number'];
  return (
    <PagePlaceholder
      title="Sipariş Detayı"
      eyebrow="Hesabım"
      description={`Slug: ${value}`}
    />
  );
}
