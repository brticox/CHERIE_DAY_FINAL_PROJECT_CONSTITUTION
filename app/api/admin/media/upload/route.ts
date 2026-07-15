import { NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { requireStaff } from '@/lib/auth/guards';
import { validateMediaFile } from '@/lib/media/validation';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { supabase, user, staff } = await requireStaff('/admin/media');
  if (!can(staff.role, 'catalog.write') && !can(staff.role, 'content.write')) return NextResponse.json({ error: 'Medya yükleme yetkiniz yok.' }, { status: 403 });
  const form = await request.formData(); const file = form.get('file'); const alt = String(form.get('alt') ?? '').trim(); const title = String(form.get('title') ?? '').trim();
  if (!(file instanceof File)) return NextResponse.json({ error: 'Yüklenecek dosya bulunamadı.' }, { status: 400 });
  if (file.type.startsWith('image/') && alt.length < 3) return NextResponse.json({ error: 'Görseller için açıklayıcı alternatif metin zorunludur.' }, { status: 400 });
  try {
    const bytes = new Uint8Array(await file.arrayBuffer()); const checked = validateMediaFile(file.name, file.type, bytes); const db = createAdminClient();
    const duplicate = await db.from('media_assets').select('id,alt_text,storage_path').eq('content_hash', checked.hash).is('archived_at', null).maybeSingle();
    if (duplicate.data) return NextResponse.json({ error: 'Bu dosya daha önce yüklenmiş.', duplicate: duplicate.data }, { status: 409 });
    const path = `${user.id}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${checked.extension}`;
    const upload = await supabase.storage.from('public-media').upload(path, bytes, { contentType: checked.mime, upsert: false, cacheControl: '31536000' });
    if (upload.error) return NextResponse.json({ error: 'Dosya depolamaya yüklenemedi. Storage yetkilerini kontrol edin.' }, { status: 502 });
    const { data: publicUrl } = supabase.storage.from('public-media').getPublicUrl(path);
    const created = await db.from('media_assets').insert({ bucket:'public-media',storage_path:path,url:publicUrl.publicUrl,alt_text:alt,title:title||file.name,type:checked.mime==='application/pdf'?'document':'image',mime_type:checked.mime,size_bytes:checked.size,width:checked.width,height:checked.height,content_hash:checked.hash,is_public:true,uploaded_by:staff.id }).select('id').single();
    if (created.error) { await supabase.storage.from('public-media').remove([path]); return NextResponse.json({ error: 'Medya kaydı oluşturulamadı; yükleme geri alındı.' }, { status: 500 }); }
    await db.from('audit_log').insert({ staff_user_id:staff.id,action:'media.uploaded',entity_type:'media_asset',entity_id:created.data.id,diff:{mime:checked.mime,size:checked.size,width:checked.width,height:checked.height,hash:checked.hash} });
    return NextResponse.json({ id: created.data.id });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Dosya doğrulanamadı.' }, { status: 400 }); }
}
