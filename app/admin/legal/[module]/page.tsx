import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
const configs = {
  'consent-log': {
    title: 'Onay kayıtları',
    table: 'consent_records',
    fields: [
      { key: 'consent_type', label: 'Tür' },
      { key: 'source_route', label: 'Kaynak' },
      { key: 'legal_document_version_id', label: 'Yasal sürüm' },
    ],
    dateKey: 'created_at',
  },
  'cookie-log': {
    title: 'Çerez tercih kayıtları',
    table: 'cookie_consent_logs',
    fields: [
      { key: 'action', label: 'İşlem' },
      { key: 'consent_version', label: 'Sürüm' },
      { key: 'categories_json', label: 'Kategoriler' },
    ],
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
        path: `/admin/legal/${module}`,
        description:
          'Gizlilik ve onay kanıtlarının salt-okunur, denetlenebilir kayıtları.',
        ...config,
      }}
      query={(await searchParams).q}
    />
  );
}
