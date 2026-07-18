'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database, Json } from '@/lib/supabase/database.types';
async function guard(path: string) {
  const { staff } = await requireStaff(path);
  if (!can(staff.role, 'services.write')) redirect(`${path}?error=permission`);
  return staff;
}
async function log(
  staffId: string,
  action: string,
  type: string,
  id: string,
  diff: Record<string, unknown> = {},
) {
  await createAdminClient()
    .from('audit_log')
    .insert({
      staff_user_id: staffId,
      action,
      entity_type: type,
      entity_id: id,
      diff: diff as Json,
    });
}
export async function saveServicePackage(fd: FormData) {
  const staff = await guard('/admin/services/packages');
  const id = String(fd.get('id') || '');
  const payload = {
    name: req(fd, 'name', 160),
    slug: req(fd, 'slug', 160),
    summary: text(fd, 'summary', 500),
    description: text(fd, 'description', 4000),
    service_category: String(
      fd.get('service_category') || 'organizasyon',
    ) as Database['public']['Enums']['service_category'],
    behavior_type: String(
      fd.get('behavior_type') || 'quote_required',
    ) as Database['public']['Enums']['service_behavior'],
    price_display: String(
      fd.get('price_display') || 'quote_only',
    ) as Database['public']['Enums']['price_display'],
    deposit_model: String(
      fd.get('deposit_model') || 'none',
    ) as Database['public']['Enums']['deposit_model'],
    deposit_value: num(fd, 'deposit_value'),
    base_from_price: num(fd, 'base_from_price'),
    min_lead_time_days: num(fd, 'min_lead_time_days') ?? 0,
    requires_event_date: fd.get('requires_event_date') === 'on',
    requires_guest_count: fd.get('requires_guest_count') === 'on',
    requires_venue: fd.get('requires_venue') === 'on',
    status: String(fd.get('status') || 'draft') as 'draft' | 'published',
  };
  const db = createAdminClient();
  const result = id
    ? await db.from('service_packages').update(payload).eq('id', id).select('id').single()
    : await db.from('service_packages').insert(payload).select('id').single();
  if (result.error || !result.data)
    redirect(
      `/admin/services/packages?error=${encodeURIComponent(result.error?.message ?? 'save')}`,
    );
  const seoPayload = {
    title: text(fd, 'seo_title', 160),
    description: text(fd, 'seo_description', 320),
    schema_type: 'Service',
    entity_type: 'service_package',
    entity_id: result.data.id,
    noindex: fd.get('seo_noindex') === 'on',
  };
  const current = id
    ? (await db.from('service_packages').select('seo_metadata_id').eq('id', id).single())
        .data
    : null;
  const seo = current?.seo_metadata_id
    ? await db
        .from('seo_metadata')
        .update(seoPayload)
        .eq('id', current.seo_metadata_id)
        .select('id')
        .single()
    : await db.from('seo_metadata').insert(seoPayload).select('id').single();
  if (seo.data && !current?.seo_metadata_id)
    await db
      .from('service_packages')
      .update({ seo_metadata_id: seo.data.id })
      .eq('id', result.data.id);
  await log(
    staff.id,
    id ? 'service.package.updated' : 'service.package.created',
    'service_package',
    result.data.id,
    payload,
  );
  revalidatePath('/admin/services/packages');
}
export async function saveServiceCity(fd: FormData) {
  const staff = await guard('/admin/services/cities');
  const id = String(fd.get('id') || '');
  const payload = {
    city_name: req(fd, 'city_name', 120),
    city_slug: req(fd, 'city_slug', 120),
    is_active: fd.get('is_active') === 'on',
    travel_fee_model: String(fd.get('travel_fee_model') || 'none') as
      'none' | 'fixed' | 'per_km' | 'quote',
    travel_fee_value: num(fd, 'travel_fee_value'),
    notes_tr: text(fd, 'notes_tr', 1000),
  };
  const db = createAdminClient();
  const result = id
    ? await db.from('service_cities').update(payload).eq('id', id).select('id').single()
    : await db.from('service_cities').insert(payload).select('id').single();
  if (result.error || !result.data) redirect('/admin/services/cities?error=save');
  await log(
    staff.id,
    id ? 'service.city.updated' : 'service.city.created',
    'service_city',
    result.data.id,
    payload,
  );
  revalidatePath('/admin/services/cities');
}
export async function saveAvailability(fd: FormData) {
  const staff = await guard('/admin/services/availability');
  const db = createAdminClient();
  const payload = {
    date: req(fd, 'date', 10),
    city_id: String(fd.get('city_id') || '') || null,
    service_category: (String(fd.get('service_category') || '') || null) as
      Database['public']['Enums']['service_category'] | null,
    capacity: num(fd, 'capacity') ?? 0,
    is_blackout: fd.get('is_blackout') === 'on',
    note: text(fd, 'note', 500),
  };
  const { data, error } = await db
    .from('service_availability_blocks')
    .insert(payload)
    .select('id')
    .single();
  if (error || !data) redirect('/admin/services/availability?error=save');
  await log(
    staff.id,
    'service.availability.created',
    'service_availability',
    data.id,
    payload,
  );
  revalidatePath('/admin/services/availability');
  revalidatePath('/admin/services/calendar');
}
export async function updateConsultation(fd: FormData) {
  const staff = await guard('/admin/services/consultations');
  const id = String(fd.get('id'));
  const payload = {
    status: String(
      fd.get('status'),
    ) as Database['public']['Enums']['consultation_status'],
    assigned_staff_id: String(fd.get('assigned_staff_id') || '') || null,
    channel: String(fd.get('channel') || 'online') as
      'online' | 'phone' | 'whatsapp' | 'in_person',
    confirmed_slot: {
      date: String(fd.get('date') || ''),
      time: String(fd.get('time') || ''),
      duration_minutes: num(fd, 'duration_minutes') ?? 60,
    },
    note: text(fd, 'note', 2000),
  };
  const db = createAdminClient();
  const { error } = await db.from('consultations').update(payload).eq('id', id);
  if (error) redirect('/admin/services/consultations?error=save');
  await log(staff.id, 'consultation.updated', 'consultation', id, payload);
  revalidatePath('/admin/services/consultations');
}
export async function updateReservation(fd: FormData) {
  const staff = await guard('/admin/services/reservations');
  const id = String(fd.get('id'));
  const payload = {
    status: String(fd.get('status')) as Database['public']['Enums']['reservation_status'],
    assigned_staff_id: String(fd.get('assigned_staff_id') || '') || null,
    event_date: String(fd.get('event_date') || '') || null,
    event_time: String(fd.get('event_time') || '') || null,
    guest_count: num(fd, 'guest_count'),
    total_amount: num(fd, 'total_amount'),
    deposit_amount: num(fd, 'deposit_amount'),
    balance_due_date: String(fd.get('balance_due_date') || '') || null,
    cancellation_reason: text(fd, 'cancellation_reason', 500),
  };
  const db = createAdminClient();
  const { error } = await db.from('reservations').update(payload).eq('id', id);
  if (error) redirect(`/admin/services/reservations/${id}?error=save`);
  await log(staff.id, 'reservation.updated', 'reservation', id, payload);
  revalidatePath('/admin/services/reservations');
  revalidatePath(`/admin/services/reservations/${id}`);
}
export async function addReservationTask(fd: FormData) {
  const staff = await guard('/admin/services/reservations');
  const id = String(fd.get('reservation_id'));
  const db = createAdminClient();
  const { data, error } = await db
    .from('service_checklists')
    .insert({
      reservation_id: id,
      item_tr: req(fd, 'item_tr', 300),
      due_date: String(fd.get('due_date') || '') || null,
      owner_staff_id: String(fd.get('owner_staff_id') || '') || null,
    })
    .select('id')
    .single();
  if (error || !data) redirect(`/admin/services/reservations/${id}?error=task`);
  await log(staff.id, 'reservation.task.created', 'service_checklist', data.id, {
    reservation_id: id,
  });
  revalidatePath(`/admin/services/reservations/${id}`);
}
export async function toggleReservationTask(fd: FormData) {
  const staff = await guard('/admin/services/reservations');
  const reservationId = String(fd.get('reservation_id'));
  const id = String(fd.get('id'));
  const done = fd.get('done') === 'true';
  const db = createAdminClient();
  await db.from('service_checklists').update({ is_done: done }).eq('id', id);
  await log(staff.id, 'reservation.task.updated', 'service_checklist', id, { done });
  revalidatePath(`/admin/services/reservations/${reservationId}`);
}
const text = (fd: FormData, key: string, max: number) =>
  String(fd.get(key) ?? '')
    .trim()
    .slice(0, max) || null;
const req = (fd: FormData, key: string, max: number) => {
  const x = text(fd, key, max);
  if (!x) throw new Error(`${key} required`);
  return x;
};
const num = (fd: FormData, key: string) => {
  const raw = String(fd.get(key) ?? '');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};
