import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  return (
    <PagePlaceholder
      title="Müşteri Profili"
      eyebrow="Yönetim"
      description={`ID: ${resolved['id']}`}
      note="Yönetim modülü — iş mantığı sonraki fazda eklenecek."
    />
  );
}
