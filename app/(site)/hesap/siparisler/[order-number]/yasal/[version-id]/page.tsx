import { notFound } from 'next/navigation';

import { requireUser } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function Page({
  params,
}: {
  params: Promise<{ 'order-number': string; 'version-id': string }>;
}) {
  const { 'order-number': orderNumber, 'version-id': versionId } = await params;
  const { customer } = await requireUser(
    `/hesap/siparisler/${orderNumber}/yasal/${versionId}`,
  );
  if (!customer) notFound();

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('legal_snapshot')
    .eq('order_number', orderNumber)
    .eq('customer_id', customer.id)
    .maybeSingle();
  if (!order || !containsVersion(order.legal_snapshot, versionId)) notFound();

  const { data: version } = await admin
    .from('legal_document_versions')
    .select('version, body, effective_from, legal_documents!inner(title_tr)')
    .eq('id', versionId)
    .maybeSingle();
  if (!version) notFound();
  const body = legalBodyText(version.body);
  const title = (version.legal_documents as { title_tr: string }).title_tr;

  return (
    <article className="cherie-container max-w-3xl py-16">
      <p className="cherie-kicker">Sipariş anındaki kayıt</p>
      <h1 className="text-h2 mt-3 text-cherie-ink">{title}</h1>
      <p className="mt-3 text-sm text-cherie-soft-ink">
        Sürüm {version.version}
        {version.effective_from ? ` · ${version.effective_from}` : ''}
      </p>
      <div className="prose-cherie mt-8 space-y-4 text-cherie-soft-ink">
        {body.split('\n\n').map((paragraph, index) => (
          <p key={index} className="leading-relaxed">{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

function containsVersion(value: unknown, versionId: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).some(
    (entry) =>
      Boolean(entry) &&
      typeof entry === 'object' &&
      !Array.isArray(entry) &&
      (entry as { id?: unknown }).id === versionId,
  );
}

function legalBodyText(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const body = value as { text?: unknown; content?: unknown };
    if (typeof body.text === 'string') return body.text;
    if (typeof body.content === 'string') return body.content;
  }
  return 'Bu sürümün görüntülenebilir metni bulunamadı.';
}
