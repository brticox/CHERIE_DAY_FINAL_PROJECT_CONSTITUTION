'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
export async function saveSettings(fd: FormData) {
  const { staff } = await requireStaff('/admin/settings');
  if (!['admin', 'superadmin'].includes(staff.role))
    redirect('/admin/settings?error=permission');
  const db = createAdminClient();
  const existing = (await db.from('site_settings').select('id').limit(1).maybeSingle())
    .data;
  const site = {
    business_name: String(fd.get('business_name') ?? '')
      .trim()
      .slice(0, 160),
    contact_email:
      String(fd.get('contact_email') ?? '')
        .trim()
        .slice(0, 240) || null,
    contact_phone:
      String(fd.get('contact_phone') ?? '')
        .trim()
        .slice(0, 80) || null,
    whatsapp_number:
      String(fd.get('whatsapp_number') ?? '')
        .trim()
        .slice(0, 80) || null,
    service_area_text:
      String(fd.get('service_area_text') ?? '')
        .trim()
        .slice(0, 1000) || null,
    social_links: {
      instagram: String(fd.get('instagram') ?? ''),
      pinterest: String(fd.get('pinterest') ?? ''),
      youtube: String(fd.get('youtube') ?? ''),
    },
    default_seo: {
      title: String(fd.get('seo_title') ?? ''),
      description: String(fd.get('seo_description') ?? ''),
    },
  };
  const result = existing
    ? await db.from('site_settings').update(site).eq('id', existing.id)
    : await db.from('site_settings').insert(site);
  if (result.error) redirect('/admin/settings?error=save');
  const settings = [
    [
      'company.tax',
      {
        tax_office: String(fd.get('tax_office') ?? ''),
        tax_number: String(fd.get('tax_number') ?? ''),
      },
    ],
    ['notification.sender', { name: String(fd.get('sender_name') ?? '') }],
    [
      'features',
      {
        services: fd.get('feature_services') === 'on',
        digital: fd.get('feature_digital') === 'on',
      },
    ],
    [
      'shipping',
      {
        free_threshold: Number(fd.get('free_threshold') || 0),
        city_note: String(fd.get('shipping_city_note') ?? ''),
      },
    ],
  ] as const;
  for (const [key, value] of settings)
    await db
      .from('system_settings')
      .upsert({ key, value, updated_by: staff.id }, { onConflict: 'key' });
  await db.from('audit_log').insert({
    staff_user_id: staff.id,
    action: 'settings.updated',
    entity_type: 'system_settings',
    diff: { keys: settings.map((x) => x[0]) },
  });
  revalidatePath('/admin/settings');
}
