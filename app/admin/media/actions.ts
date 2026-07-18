'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { revalidateCatalog } from '@/lib/data/catalog-cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function updateMediaMetadata(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff('/admin/media');
  if (!can(staff.role, 'catalog.write') && !can(staff.role, 'content.write'))
    redirect('/admin/media?error=permission');
  const alt = String(formData.get('alt_text') ?? '')
    .trim()
    .slice(0, 500);
  const title = String(formData.get('title') ?? '')
    .trim()
    .slice(0, 200);
  const focal_x = Number(formData.get('focal_x'));
  const focal_y = Number(formData.get('focal_y'));
  if (
    !Number.isFinite(focal_x) ||
    !Number.isFinite(focal_y) ||
    focal_x < 0 ||
    focal_x > 1 ||
    focal_y < 0 ||
    focal_y > 1
  )
    redirect('/admin/media?error=focal');
  const db = createAdminClient();
  const { data: before } = await db
    .from('media_assets')
    .select('title,alt_text,focal_x,focal_y')
    .eq('id', id)
    .single();
  const { error } = await db
    .from('media_assets')
    .update({ title: title || null, alt_text: alt || null, focal_x, focal_y })
    .eq('id', id);
  if (error) redirect(`/admin/media?error=${encodeURIComponent(error.message)}`);
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'media.metadata.updated',
    entity_type: 'media_asset',
    entity_id: id,
    diff: { before, after: { title, alt_text: alt, focal_x, focal_y } },
  });
  revalidatePath('/admin/media');
  revalidateCatalog();
}

export async function archiveMedia(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff('/admin/media');
  if (!can(staff.role, 'catalog.write') && !can(staff.role, 'content.write'))
    redirect('/admin/media?error=permission');
  const db = await createClient();
  const rpc = db.rpc.bind(db) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ error: { message: string } | null }>;
  const { error } = await rpc('admin_archive_media', { p_media_id: id });
  if (error) redirect(`/admin/media?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/media');
  revalidateCatalog();
}
