'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
type Rpc = (
  name: string,
  args: Record<string, unknown>,
) => Promise<{ error: { message: string } | null }>;
export async function updateLead(formData: FormData) {
  const { staff } = await requireStaff('/admin/crm/leads');
  if (!can(staff.role, 'crm.write')) redirect('/admin/crm/leads?error=permission');
  const id = String(formData.get('id'));
  const status = String(
    formData.get('status'),
  ) as Database['public']['Enums']['lead_status'];
  const db = await createClient();
  const { error } = await (db.rpc as unknown as Rpc)('admin_update_lead', {
    p_lead_id: id,
    p_status: status,
    p_priority: String(formData.get('priority') || 'normal'),
    p_assigned_staff_id: String(formData.get('assigned_staff_id') || '') || null,
    p_next_follow_up_at: String(formData.get('next_follow_up_at') || '') || null,
    p_note: String(formData.get('note') ?? '').slice(0, 4000),
    p_lost_reason: String(formData.get('lost_reason') ?? '').slice(0, 500),
  });
  if (error) redirect(`/admin/crm/leads?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/crm/leads');
}
export async function convertLead(formData: FormData) {
  const { staff } = await requireStaff('/admin/crm/leads');
  if (!can(staff.role, 'crm.write')) redirect('/admin/crm/leads?error=permission');
  const db = await createClient();
  const { error } = await (db.rpc as unknown as Rpc)('admin_convert_lead', {
    p_lead_id: String(formData.get('id')),
    p_target: String(formData.get('target')),
  });
  if (error) redirect(`/admin/crm/leads?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/crm/leads');
  revalidatePath('/admin/customers');
}
