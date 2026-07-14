'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
export async function updateProofAssignment(formData: FormData) {
  const { staff } = await requireStaff('/admin/commerce/proofs');
  if (!can(staff.role, 'proofs.write'))
    redirect('/admin/commerce/proofs?error=permission');
  const id = String(formData.get('id'));
  const patch = {
    assigned_staff_id: String(formData.get('assigned_staff_id') || '') || null,
    due_at: String(formData.get('due_at') || '') || null,
  };
  const db = createAdminClient();
  const { error } = await db.from('product_proofs').update(patch).eq('id', id);
  if (error) redirect('/admin/commerce/proofs?error=save');
  await db
    .from('audit_log')
    .insert({
      staff_user_id: staff.id,
      action: 'proof.assignment.updated',
      entity_type: 'product_proof',
      entity_id: id,
      diff: patch,
    });
  revalidatePath('/admin/commerce/proofs');
}
