import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { findRedirect } from './lib/redirects';
let redirectCache: { until: number; rows: { data: Record<string, any> }[] } = {
  until: 0,
  rows: [],
};
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const configured =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const demo = process.env.NODE_ENV !== 'production' && process.env.XARMOURED_DEMO === 'true';
  if (configured && !demo) {
    const db = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cs) => {
            cs.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cs.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              })
            );
          },
        },
      }
    );
    const { data, error } = await db.auth.getClaims();
    if (
      request.nextUrl.pathname.startsWith('/admin') &&
      !['/admin/login', '/admin/reset'].includes(request.nextUrl.pathname) &&
      (!data?.claims || error)
    )
      return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com" +
      (process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : '') +
      "; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api/admin')
  )
    response.headers.set('Cache-Control', 'private, no-store');
  if (
    configured &&
    !demo &&
    !request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    request.method === 'GET'
  ) {
    try {
      if (redirectCache.until < Date.now()) {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/records?module=eq.redirects&status=eq.published&deleted_at=is.null&select=data`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            cache: 'no-store',
          }
        );
        if (result.ok) redirectCache = { until: Date.now() + 5000, rows: await result.json() };
      }
      const target = findRedirect(request.nextUrl.pathname, redirectCache.rows);
      if (target) return NextResponse.redirect(new URL(target.to, request.url), target.code);
    } catch {
      /* A missing optional redirect integration does not break the website. */
    }
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
