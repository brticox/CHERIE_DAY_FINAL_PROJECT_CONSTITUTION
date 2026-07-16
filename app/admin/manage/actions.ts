'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { can } from '@/lib/admin/permissions';
import { canWriteManagedResource, getManagedResource } from '@/lib/admin/managed-resources';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';

type MutationResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};
type TableMutation = {
  insert(payload: Record<string, unknown>): { select(columns: 'id'): { single(): Promise<MutationResult> } };
  update(payload: Record<string, unknown>): { eq(column: 'id', id: string): { select(columns: 'id'): { single(): Promise<MutationResult> } } };
  delete(): { eq(column: 'id', id: string): Promise<{ error: { message: string } | null }> };
  select(columns: string): { eq(column: 'id', id: string): { maybeSingle(): Promise<{ data: { id: string; status?: string } | null; error: { message: string } | null }> } };
};

function table(name: string) {
  const db = createAdminClient();
  const from = db.from.bind(db) as unknown as (tableName: string) => TableMutation;
  return { db, query: from(name) };
}

export async function saveManagedResource(fd: FormData) {
  const resourceKey = String(fd.get('resource') ?? '');
  const resource = getManagedResource(resourceKey);
  if (!resource) redirect('/admin?error=unknown_resource');
  const id = String(fd.get('id') ?? '').trim();
  const path = id ? `/admin/manage/${resource.key}/${id}` : `/admin/manage/${resource.key}/new`;
  const { staff } = await requireStaff(path);
  if (!canWriteManagedResource(staff.role, resource)) redirect(`${resource.listPath}?error=permission`);

  let payload: Record<string, unknown>;
  try {
    payload = parsePayload(resource.fields, fd);
    validateBusinessRules(resource.key, payload);
  } catch (error) {
    redirect(`${path}?error=${encodeURIComponent(error instanceof Error ? error.message : 'validation')}`);
  }

  if ('status' in payload && payload.status === 'published' && !can(staff.role, 'content.publish')) {
    redirect(`${path}?error=publish_permission`);
  }
  if (resource.key === 'coupons' && typeof payload.code === 'string') payload.code = payload.code.toUpperCase();
  if (resource.key === 'articles') {
    payload.published_at = payload.status === 'published' ? new Date().toISOString() : null;
  }

  const { db, query } = table(resource.table);
  const result = id
    ? await query.update(payload).eq('id', id).select('id').single()
    : await query.insert(payload).select('id').single();
  if (result.error || !result.data) {
    redirect(`${path}?error=${encodeURIComponent(result.error?.message ?? 'save_failed')}`);
  }

  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: id ? `${resource.key}.updated` : `${resource.key}.created`,
    entity_type: resource.table,
    entity_id: result.data.id,
    diff: payload as Json,
  });
  revalidatePath(resource.listPath);
  redirect(`/admin/manage/${resource.key}/${result.data.id}?saved=1`);
}

export async function deleteManagedResource(fd: FormData) {
  const resourceKey = String(fd.get('resource') ?? '');
  const resource = getManagedResource(resourceKey);
  if (!resource || !resource.deleteAllowed) redirect('/admin?error=delete_not_allowed');
  const id = String(fd.get('id') ?? '');
  const path = `/admin/manage/${resource.key}/${id}`;
  const { staff } = await requireStaff(path);
  if (!canWriteManagedResource(staff.role, resource)) redirect(`${resource.listPath}?error=permission`);
  if (String(fd.get('confirmation') ?? '').trim().toUpperCase() !== 'SIL') {
    redirect(`${path}?error=delete_confirmation`);
  }

  const { db, query } = table(resource.table);
  const current = await query
    .select(resource.fields.some((field) => field.key === 'status') ? 'id,status' : 'id')
    .eq('id', id)
    .maybeSingle();
  if (current.error || !current.data) redirect(`${resource.listPath}?error=not_found`);
  if (current.data.status === 'published') redirect(`${path}?error=unpublish_before_delete`);
  const deleted = await query.delete().eq('id', id);
  if (deleted.error) redirect(`${path}?error=${encodeURIComponent(deleted.error.message)}`);

  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: `${resource.key}.deleted`,
    entity_type: resource.table,
    entity_id: id,
    diff: { deleted: true },
  });
  revalidatePath(resource.listPath);
  redirect(`${resource.listPath}?deleted=1`);
}

function parsePayload(fields: readonly { key: string; label: string; type: string; required?: boolean; maxLength?: number; min?: number; max?: number }[], fd: FormData) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = String(fd.get(field.key) ?? '').trim();
    if (field.type === 'boolean') {
      payload[field.key] = fd.get(field.key) === 'on';
      continue;
    }
    if (!raw) {
      if (field.required) throw new Error(`${field.label} zorunludur.`);
      payload[field.key] = field.type === 'tags' ? [] : null;
      continue;
    }
    if (field.maxLength && raw.length > field.maxLength) throw new Error(`${field.label} çok uzun.`);
    if (field.type === 'number') {
      const number = Number(raw);
      if (!Number.isFinite(number)) throw new Error(`${field.label} geçerli bir sayı olmalıdır.`);
      if (field.min != null && number < field.min) throw new Error(`${field.label} en az ${field.min} olmalıdır.`);
      if (field.max != null && number > field.max) throw new Error(`${field.label} en fazla ${field.max} olmalıdır.`);
      payload[field.key] = number;
    } else if (field.type === 'json') {
      try { payload[field.key] = JSON.parse(raw) as Json; }
      catch { throw new Error(`${field.label} geçerli JSON olmalıdır.`); }
    } else if (field.type === 'tags') {
      payload[field.key] = raw.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
    } else if (field.type === 'datetime') {
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) throw new Error(`${field.label} geçerli bir tarih olmalıdır.`);
      payload[field.key] = date.toISOString();
    } else {
      payload[field.key] = raw;
    }
  }
  return payload;
}

function validateBusinessRules(resource: string, payload: Record<string, unknown>) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const key of ['scope_id', 'linked_entity_id']) {
    if (typeof payload[key] === 'string' && !uuid.test(payload[key])) throw new Error(`${key} geçerli bir UUID olmalıdır.`);
  }
  if (resource === 'articles' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(payload.slug ?? ''))) {
    throw new Error('Adres kısa adı küçük harf, sayı ve tire içermelidir.');
  }
  if (resource === 'coupons') {
    if (payload.discount_type === 'percentage' && Number(payload.discount_value) > 100) {
      throw new Error('Yüzde indirimi 100 değerini aşamaz.');
    }
    if (payload.starts_at && payload.ends_at && new Date(String(payload.starts_at)) >= new Date(String(payload.ends_at))) {
      throw new Error('Bitiş tarihi başlangıçtan sonra olmalıdır.');
    }
  }
  if (resource === 'campaigns' && payload.starts_at && payload.ends_at && new Date(String(payload.starts_at)) >= new Date(String(payload.ends_at))) {
    throw new Error('Bitiş tarihi başlangıçtan sonra olmalıdır.');
  }
}
