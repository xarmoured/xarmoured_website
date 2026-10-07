import { siteSettings } from '@/lib/server';
import { securityTxt } from '@/lib/security-txt';
export const dynamic = 'force-dynamic';
export async function GET() {
  const text = securityTxt(await siteSettings());
  return new Response(
    text ||
      '# Security reporting configuration is not published or has expired.\n# See /security for contact information.\n',
    {
      status: text ? 200 : 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
        ...(text ? {} : { 'Retry-After': '86400' }),
      },
    }
  );
}
