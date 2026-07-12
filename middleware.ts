import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ACCOUNT_PATHS = new Set([
  '/hesap/giris',
  '/hesap/kayit',
  '/hesap/sifremi-unuttum',
  '/hesap/sifreyi-yenile',
]);

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) to.cookies.set(cookie);
  return to;
}

function loginRedirect(request: NextRequest, response: NextResponse, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/hesap/giris';
  url.search = '';
  url.searchParams.set('reason', reason);
  url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return copyCookies(response, NextResponse.redirect(url));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdmin = path === '/admin' || path.startsWith('/admin/');
  const isAccount = path === '/hesap' || path.startsWith('/hesap/');
  const isPublicAccount = PUBLIC_ACCOUNT_PATHS.has(path);

  let response = NextResponse.next({ request });

  if (!configured()) {
    if ((isAdmin || (isAccount && !isPublicAccount))) {
      return loginRedirect(request, response, 'unavailable');
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if ((isAdmin || (isAccount && !isPublicAccount)) && !user) {
    return loginRedirect(request, response, 'session');
  }

  if (isAdmin && user) {
    const { data: staff } = await supabase
      .from('staff_users')
      .select('role, is_active')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!staff) {
      const url = request.nextUrl.clone();
      url.pathname = '/hesap';
      url.search = '?error=staff_required';
      return copyCookies(response, NextResponse.redirect(url));
    }
  }

  if (isPublicAccount && user && path !== '/hesap/sifreyi-yenile') {
    const next = request.nextUrl.searchParams.get('next');
    const url = request.nextUrl.clone();
    url.pathname = next?.startsWith('/') && !next.startsWith('//') ? next : '/hesap';
    url.search = '';
    return copyCookies(response, NextResponse.redirect(url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm)$).*)'],
};

