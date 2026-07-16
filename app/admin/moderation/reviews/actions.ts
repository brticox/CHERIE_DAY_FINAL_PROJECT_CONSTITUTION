'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { can } from '@/lib/admin/permissions';
import { requireStaff } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type ReviewStatus = Database['public']['Enums']['review_status'];
const REVIEW_LIST = '/admin/moderation/reviews';

export async function moderateReview(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const path = `${REVIEW_LIST}/${id}`;
  const { staff } = await requireStaff(path);
  if (!can(staff.role, 'content.publish')) redirect(`${path}?error=permission`);

  const status = String(formData.get('intent') ?? '') as ReviewStatus;
  if (!['approved', 'rejected', 'hidden'].includes(status))
    redirect(`${path}?error=invalid_action`);

  const note = String(formData.get('note') ?? '')
    .trim()
    .slice(0, 1000);
  if (['rejected', 'hidden'].includes(status) && note.length < 3)
    redirect(`${path}?error=note_required`);

  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: 'admin_moderate_review' | 'admin_delete_review',
    args: Record<string, unknown>,
  ) => Promise<{ error: { code: string } | null }>;
  const { error } = await rpc('admin_moderate_review', {
    p_review_id: id,
    p_status: status,
    p_note: note,
  });
  if (error) redirect(`${path}?error=${reviewErrorCode(error.code)}`);

  revalidateReviewPaths(id);
  redirect(`${path}?saved=moderated`);
}

export async function deleteReview(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const path = `${REVIEW_LIST}/${id}`;
  const { staff } = await requireStaff(path);
  if (!['admin', 'superadmin'].includes(staff.role)) redirect(`${path}?error=permission`);

  const confirmation = String(formData.get('confirmation') ?? '').trim();
  if (confirmation !== 'SIL') redirect(`${path}?error=delete_confirmation`);

  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: 'admin_moderate_review' | 'admin_delete_review',
    args: Record<string, unknown>,
  ) => Promise<{ error: { code: string } | null }>;
  const { error } = await rpc('admin_delete_review', {
    p_review_id: id,
    p_confirmation: confirmation,
  });
  if (error) redirect(`${path}?error=${reviewErrorCode(error.code)}`);

  revalidateReviewPaths(id);
  redirect(`${REVIEW_LIST}?deleted=1`);
}

function reviewErrorCode(code: string) {
  if (code === '42501') return 'permission';
  if (code === '22023') return 'invalid_input';
  if (code === '23514') return 'hide_before_delete';
  if (code === 'P0002') return 'not_found';
  return 'save_failed';
}

function revalidateReviewPaths(id: string) {
  revalidatePath(REVIEW_LIST);
  revalidatePath('/admin/moderation/queue');
  revalidatePath(`${REVIEW_LIST}/${id}`);
  revalidatePath('/', 'layout');
}
