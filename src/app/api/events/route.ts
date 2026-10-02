import { NextResponse } from 'next/server';
import { privileged, isDemo } from '@/lib/server';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin)
    return new Response(null, { status: 403 });
  try {
    await rateLimit('events', 120);
    const b = await req.json();
    if (
      ![
        'page_view',
        'service_view',
        'assessment_start',
        'booking_click',
        'research_view',
        'careers_view',
      ].includes(b.event) ||
      typeof b.path !== 'string' ||
      !b.path.startsWith('/') ||
      b.path.length > 500
    )
      return new Response(null, { status: 400 });
    if (!isDemo)
      await privileged()
        .from('analytics_events')
        .insert({ event: b.event, path: b.path.split('?')[0], source: 'Website' });
    return NextResponse.json({ ok: true });
  } catch {
    return new Response(null, { status: 204 });
  }
}
