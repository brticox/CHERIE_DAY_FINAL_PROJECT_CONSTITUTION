import { notFound } from 'next/navigation';
import { DataWorkspace } from '@/components/admin/data-workspace';
import type { AdminCapability } from '@/lib/admin/permissions';

// Read-side capability per module (fail-closed to the most restrictive).
const CAPS: Record<string, AdminCapability> = {
  'consent-log': 'legal.read',
  'cookie-log': 'legal.read',
};
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
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { module } = await params;
  const config = configs[module as keyof typeof configs];
  if (!config) notFound();
  const query = await searchParams;
  return (
    <DataWorkspace
      config={{
        path: `/admin/legal/${module}`,
        capability: CAPS[module] ?? 'system.read',
        description:
          'Gizlilik ve onay kanıtlarının salt-okunur, denetlenebilir kayıtları.',
        ...config,
      }}
      query={query.q}
      page={Number(query.page ?? 1)}
    />
  );
}
