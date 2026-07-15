import { NextResponse } from 'next/server';
import { can } from '@/lib/admin/permissions';
import { requireStaff } from '@/lib/auth/guards';
import { validateMediaFile } from '@/lib/media/validation';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const { supabase, user, staff } = await requireStaff('/admin/commerce/proofs');
  if (!can(staff.role, 'proofs.write'))
    return NextResponse.json(
      { error: 'Tasarım onayı yükleme yetkiniz yok.' },
      { status: 403 },
    );
  const form = await request.formData();
  const file = form.get('file');
  const orderItemId = String(form.get('order_item_id') ?? '');
  const message = String(form.get('message') ?? '')
    .trim()
    .slice(0, 1000);
  if (!(file instanceof File) || !orderItemId)
    return NextResponse.json(
      { error: 'Dosya ve sipariş kalemi zorunludur.' },
      { status: 400 },
    );
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const checked = validateMediaFile(file.name, file.type, bytes);
    const path = `${user.id}/${orderItemId}/${crypto.randomUUID()}.${checked.extension}`;
    const upload = await supabase.storage
      .from('proof-files')
      .upload(path, bytes, { contentType: checked.mime, upsert: false });
    if (upload.error)
      return NextResponse.json(
        { error: 'Dosya güvenli prova alanına yüklenemedi.' },
        { status: 502 },
      );
    const rpc = supabase.rpc as unknown as (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: string | null; error: { message: string } | null }>;
    const result = await rpc('publish_product_proof', {
      p_order_item_id: orderItemId,
      p_storage_path: path,
      p_file_name: file.name.slice(0, 240),
      p_mime_type: checked.mime,
      p_file_size_bytes: checked.size,
      p_message: message,
    });
    if (result.error) {
      await supabase.storage.from('proof-files').remove([path]);
      return NextResponse.json({ error: result.error.message }, { status: 409 });
    }
    return NextResponse.json({ id: result.data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Dosya doğrulanamadı.' },
      { status: 400 },
    );
  }
}
