'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/guards';
import { can } from '@/lib/admin/permissions';
import { createClient } from '@/lib/supabase/server';
type Rpc = (
  name: string,
  args: Record<string, unknown>,
) => Promise<{ error: { message: string } | null }>;
export async function savePage(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(`/admin/cms/pages/${id}`);
  if (!can(staff.role, 'content.write')) redirect('/admin/cms/pages?error=permission');
  const title = value(formData, 'title', 160);
  const slug = value(formData, 'slug', 160);
  let advanced: Record<string, unknown> = {};
  try {
    const raw = String(formData.get('advanced_json') ?? '').trim();
    if (raw) advanced = JSON.parse(raw);
  } catch {
    redirect(`/admin/cms/pages/${id}?error=invalid_json`);
  }
  const body = {
    ...advanced,
    hero: {
      visible: checked(formData, 'hero_visible'),
      eyebrow: value(formData, 'hero_eyebrow', 100),
      heading: value(formData, 'hero_heading', 160),
      copy: value(formData, 'hero_copy', 600),
      primaryCta: {
        label: value(formData, 'primary_cta_label', 60),
        href: value(formData, 'primary_cta_href', 300),
      },
      secondaryCta: {
        label: value(formData, 'secondary_cta_label', 60),
        href: value(formData, 'secondary_cta_href', 300),
      },
      mediaId: nullable(formData, 'hero_media_id'),
    },
    featured: {
      products: formData.getAll('featured_products').map(String),
      collections: formData.getAll('featured_collections').map(String),
      services: formData.getAll('featured_services').map(String),
    },
    testimonials: {
      visible: checked(formData, 'testimonials_visible'),
      heading: value(formData, 'testimonials_heading', 160),
    },
    faq: {
      visible: checked(formData, 'faq_visible'),
      heading: value(formData, 'faq_heading', 160),
    },
    coverage: {
      visible: checked(formData, 'coverage_visible'),
      heading: value(formData, 'coverage_heading', 160),
      copy: value(formData, 'coverage_copy', 600),
      cities: formData.getAll('coverage_cities').map(String),
    },
    footer: {
      heading: value(formData, 'footer_heading', 160),
      copy: value(formData, 'footer_copy', 400),
    },
    navigation: {
      ctaLabel: value(formData, 'nav_cta_label', 60),
      ctaHref: value(formData, 'nav_cta_href', 300),
    },
    social: {
      instagram: value(formData, 'instagram', 300),
      pinterest: value(formData, 'pinterest', 300),
      youtube: value(formData, 'youtube', 300),
    },
  };
  if (title.length < 3 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    redirect(`/admin/cms/pages/${id}?error=validation`);
  const db = await createClient();
  const { error } = await (db.rpc.bind(db) as unknown as Rpc)('admin_save_page', {
    p_page_id: id,
    p_title: title,
    p_slug: slug,
    p_body: body,
  });
  if (error)
    redirect(`/admin/cms/pages/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/cms/pages');
  redirect(`/admin/cms/pages/${id}?saved=1`);
}
export async function publishPage(formData: FormData) {
  const id = String(formData.get('id'));
  const { staff } = await requireStaff(`/admin/cms/pages/${id}`);
  if (!can(staff.role, 'content.publish'))
    redirect(`/admin/cms/pages/${id}?error=publish_permission`);
  const db = await createClient();
  const { error } = await (db.rpc.bind(db) as unknown as Rpc)('admin_publish_page', {
    p_page_id: id,
  });
  if (error)
    redirect(`/admin/cms/pages/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/cms/pages');
  redirect(`/admin/cms/pages/${id}?saved=1`);
}
export async function rollbackPage(formData: FormData) {
  const id = String(formData.get('id'));
  const revisionId = String(formData.get('revision_id'));
  const { staff } = await requireStaff(`/admin/cms/pages/${id}`);
  if (!can(staff.role, 'content.write'))
    redirect(`/admin/cms/pages/${id}?error=permission`);
  const db = await createClient();
  const { error } = await (db.rpc.bind(db) as unknown as Rpc)('admin_rollback_page', {
    p_page_id: id,
    p_revision_id: revisionId,
  });
  if (error)
    redirect(`/admin/cms/pages/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/cms/pages/${id}`);
  redirect(`/admin/cms/pages/${id}?saved=1`);
}
const value = (fd: FormData, key: string, max: number) =>
  String(fd.get(key) ?? '')
    .trim()
    .slice(0, max);
const nullable = (fd: FormData, key: string) => value(fd, key, 100) || null;
const checked = (fd: FormData, key: string) => fd.get(key) === 'on';
