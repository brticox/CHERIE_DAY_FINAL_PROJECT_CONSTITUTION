'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
const transitions: Record<string, string[]> = {
  blocked: ['ready'],
  ready: ['in_production', 'blocked'],
  in_production: ['quality_check', 'blocked'],
  quality_check: ['passed', 'rework'],
  rework: ['in_production'],
  passed: ['packed'],
  packed: ['completed'],
  completed: [],
};
export async function transitionProduction(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/production');
  if (!can(staff.role, 'orders.transition'))
    redirect('/admin/commerce/production?error=permission');
  const id = String(formData.get('id'));
  const next = String(formData.get('status'));
  const db = createAdminClient();
  const { data: row } = await db
    .from('production_jobs')
    .select('status')
    .eq('id', id)
    .single();
  if (!row || !transitions[row.status]?.includes(next))
    redirect('/admin/commerce/production?error=transition');
  const patch: { status: string; started_at?: string; completed_at?: string } = {
    status: next,
  };
  if (next === 'in_production') patch.started_at = new Date().toISOString();
  if (next === 'completed') patch.completed_at = new Date().toISOString();
  const { error } = await db.from('production_jobs').update(patch).eq('id', id);
  if (error) redirect('/admin/commerce/production?error=save');
  await db
    .from('audit_log')
    .insert({
      staff_user_id: staff.id,
      action: 'production.transitioned',
      entity_type: 'production_job',
      entity_id: id,
      diff: { from: row.status, to: next },
    });
  revalidatePath('/admin/commerce/production');
}
export async function updateProductionJob(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/production');
  if (!can(staff.role, 'orders.transition'))
    redirect('/admin/commerce/production?error=permission');
  const id = String(formData.get('id'));
  const db = createAdminClient();
  const patch = {
    assigned_staff_id: String(formData.get('assigned_staff_id') || '') || null,
    due_at: String(formData.get('due_at') || '') || null,
    priority: Number(formData.get('priority') || 0),
    material_ready: formData.get('material_ready') === 'on',
    blocker: String(formData.get('blocker') ?? '').trim() || null,
    internal_note: String(formData.get('internal_note') ?? '').trim() || null,
  };
  const { error } = await db.from('production_jobs').update(patch).eq('id', id);
  if (error) redirect('/admin/commerce/production?error=save');
  await db
    .from('audit_log')
    .insert({
      staff_user_id: staff.id,
      action: 'production.updated',
      entity_type: 'production_job',
      entity_id: id,
      diff: patch,
    });
  revalidatePath('/admin/commerce/production');
}
export async function completeQualityCheck(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/production');
  if (!can(staff.role, 'orders.transition'))
    redirect('/admin/commerce/production?error=permission');
  const id = String(formData.get('id'));
  const labels: [string,string][] = [
    ['print', 'Baskı ve renk'],
    ['personalization', 'Kişiselleştirme doğruluğu'],
    ['packaging', 'Paketleme hazırlığı'],
  ];
  const items = labels.map(([key, label]) => ({
    key,
    label,
    required: true,
    passed: formData.get(key) === 'pass',
    note: String(formData.get(`${key}_note`) ?? '').slice(0, 500),
  }));
  const db = await import('@/lib/supabase/server').then((x) => x.createClient());
  const rpc = db.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_complete_quality_check', {
    p_job_id: id,
    p_items: items,
    p_note: String(formData.get('note') ?? '').slice(0, 1000),
  });
  if (error)
    redirect(`/admin/commerce/production?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/commerce/production');
}
