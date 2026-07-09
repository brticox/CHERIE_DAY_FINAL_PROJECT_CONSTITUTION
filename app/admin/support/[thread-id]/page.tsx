import { PagePlaceholder } from '@/components/layout/page-placeholder';

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const resolved = await params;
  return (
    <PagePlaceholder
      title="Destek Görüşmesi"
      eyebrow="Yönetim"
      description={`ID: ${resolved['thread-id']}`}
      note="Yönetim modülü — iş mantığı sonraki fazda eklenecek."
    />
  );
}
