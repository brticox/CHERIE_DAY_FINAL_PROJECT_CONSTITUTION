import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { updatePasswordSchema } from '@/lib/validation/auth';
import { enqueueAccountNotification } from '@/lib/notifications/account';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { status: 'error', message: 'İstek doğrulanamadı.' },
      { status: 403 },
    );
  }

  const parsed = updatePasswordSchema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Şifre koşullarını kontrol edin.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { status: 'error', message: 'Hesap sistemi şu anda kullanılamıyor.' },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Bağlantının süresi dolmuş. Yeni bir bağlantı isteyin.',
      },
      { status: 401 },
    );
  }

  const { data: updateData, error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return NextResponse.json(
      { status: 'error', message: 'Şifreniz güncellenemedi. Lütfen tekrar deneyin.' },
      { status: 400 },
    );
  }

  await enqueueAccountNotification(
    userData.user.id,
    'password_changed',
    updateData.user.updated_at,
  );
  await supabase.auth.signOut({ scope: 'global' });
  return NextResponse.json({
    status: 'success',
    message: 'Şifreniz güvenle güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
  });
}
