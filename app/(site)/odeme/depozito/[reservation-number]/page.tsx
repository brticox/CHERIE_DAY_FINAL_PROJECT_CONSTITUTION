import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  const value = resolved['reservation-number'];
  return (
    <PagePlaceholder
      title="Ön Ödeme"
      eyebrow="Ödeme"
      description={`Slug: ${value}`}
    />
  );
}
