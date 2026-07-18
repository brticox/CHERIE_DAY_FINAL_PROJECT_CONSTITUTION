'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/guards';
import { revalidateCatalog } from '@/lib/data/catalog-cache';
import { createClient } from '@/lib/supabase/server';

type Rpc = (name: 'admin_adjust_inventory', args: {
  p_variant_id: string;
  p_delta: number;
  p_reason: string;
  p_note: string;
}) => Promise<{ error: { message: string } | null }>;

export async function adjustInventory(fd: FormData) {
  const path = '/admin/commerce/inventory';
  const { staff } = await requireStaff(path);
  if (!['superadmin', 'admin', 'commerce_manager'].includes(staff.role)) {
    redirect(`${path}?error=permission`);
  }
  const variantId = String(fd.get('variant_id') ?? '');
  const delta = Number(fd.get('delta'));
  const reason = String(fd.get('reason') ?? '');
  const note = String(fd.get('note') ?? '').trim();
  const allowedReasons = ['restock', 'sale_correction', 'damage', 'count', 'return', 'other'];
  if (!/^[0-9a-f-]{36}$/i.test(variantId) || !Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 100000 || !allowedReasons.includes(reason) || note.length > 1000) {
    redirect(`${path}?error=validation`);
  }
  const db = await createClient();
  const { error } = await (db.rpc.bind(db) as unknown as Rpc)('admin_adjust_inventory', {
    p_variant_id: variantId,
    p_delta: delta,
    p_reason: reason,
    p_note: note,
  });
  if (error) redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(path);
  revalidateCatalog();
  redirect(`${path}?saved=1`);
}
