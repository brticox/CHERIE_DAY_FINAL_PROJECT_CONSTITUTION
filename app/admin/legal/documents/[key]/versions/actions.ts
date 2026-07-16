'use server';
import { createHash } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
const path = (key: string) => `/admin/legal/documents/${key}/versions`;
export async function createLegalDraft(formData: FormData) {
  const key = String(formData.get('key'));
  const { staff } = await requireStaff(path(key));
  if (!can(staff.role, 'legal.publish')) redirect(`${path(key)}?error=permission`);
  const documentId = String(formData.get('document_id'));
  const version = String(formData.get('version') ?? '')
    .trim()
    .slice(0, 40);
  const summary = String(formData.get('summary') ?? '')
    .trim()
    .slice(0, 500);
  const raw = String(formData.get('content') ?? '').trim();
  if (!version || raw.length < 20) redirect(`${path(key)}?error=validation`);
  let body: unknown;
  try {
    body =
      raw.startsWith('{') || raw.startsWith('[')
        ? JSON.parse(raw)
        : { format: 'approved_text', content: raw };
  } catch {
    redirect(`${path(key)}?error=invalid_import`);
  }
  const hash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
  const db = createAdminClient();
  const duplicate = await db
    .from('legal_document_versions')
    .select('id')
    .eq('legal_document_id', documentId)
    .eq('version', version)
    .maybeSingle();
  if (duplicate.data) redirect(`${path(key)}?error=duplicate_version`);
  const { data, error } = await db
    .from('legal_document_versions')
    .insert({
      legal_document_id: documentId,
      version,
      summary,
      body: body as never,
      content_hash: hash,
      lifecycle_state: 'draft',
      approval_status: 'pending',
      needs_lawyer_review: true,
      source_metadata: {
        imported_by: staff.id,
        imported_at: new Date().toISOString(),
        validation: 'sha256',
      },
    })
    .select('id')
    .single();
  if (error || !data)
    redirect(
      `${path(key)}?error=${encodeURIComponent(error?.message ?? 'create_failed')}`,
    );
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'legal.version.imported',
    entity_type: 'legal_document_version',
    entity_id: data.id,
    diff: { document_id: documentId, version, content_hash: hash },
  });
  revalidatePath(path(key));
  redirect(`${path(key)}?saved=1`);
}
export async function approveLegalDraft(formData: FormData) {
  const key = String(formData.get('key'));
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(path(key));
  if (!can(staff.role, 'legal.publish')) redirect(`${path(key)}?error=permission`);
  const reviewer = String(formData.get('reviewer') ?? '')
    .trim()
    .slice(0, 160);
  const reference = String(formData.get('reference') ?? '')
    .trim()
    .slice(0, 240);
  if (!reviewer || !reference) redirect(`${path(key)}?error=approval_metadata`);
  const db = createAdminClient();
  const { error } = await db
    .from('legal_document_versions')
    .update({
      approval_status: 'approved',
      needs_lawyer_review: false,
      lifecycle_state: 'approved',
      source_metadata: {
        approved_by_name: reviewer,
        approval_reference: reference,
        approved_at: new Date().toISOString(),
        recorded_by: staff.id,
      },
    })
    .eq('id', id)
    .in('lifecycle_state', ['draft', 'awaiting_review']);
  if (error) redirect(`${path(key)}?error=${encodeURIComponent(error.message)}`);
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'legal.version.approved',
    entity_type: 'legal_document_version',
    entity_id: id,
    diff: { reviewer, reference },
  });
  revalidatePath(path(key));
}
export async function publishLegalDraft(formData: FormData) {
  const key = String(formData.get('key'));
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(path(key));
  if (!can(staff.role, 'legal.publish')) redirect(`${path(key)}?error=permission`);
  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_publish_legal_version', {
    p_version_id: id,
    p_approval_metadata: { published_from: 'admin' },
  });
  if (error) redirect(`${path(key)}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(path(key));
  redirect(`${path(key)}?saved=1`);
}
export async function archiveLegalDraft(formData: FormData) {
  const key = String(formData.get('key'));
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(path(key));
  if (!can(staff.role, 'legal.publish')) redirect(`${path(key)}?error=permission`);
  const db = createAdminClient();
  const { error } = await db
    .from('legal_document_versions')
    .update({ lifecycle_state: 'archived', is_current: false })
    .eq('id', id)
    .in('lifecycle_state', ['draft', 'awaiting_review', 'approved']);
  if (error) redirect(`${path(key)}?error=${encodeURIComponent(error.message)}`);
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'legal.version.archived',
    entity_type: 'legal_document_version',
    entity_id: id,
  });
  revalidatePath(path(key));
}
