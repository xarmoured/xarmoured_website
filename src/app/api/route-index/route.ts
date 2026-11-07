import { listRecords } from '@/lib/server';
import type { RouteIndex } from '@/lib/route-index';
export const dynamic = 'force-dynamic';

/**
 * Internal index of published public routes, consumed by src/proxy.ts to return real 404s.
 * Contains only slugs and ids of content that is already public (the sitemap lists the same).
 */
export async function GET() {
  const keys = (rows: { slug: string; id: string }[]) => rows.flatMap((r) => [r.slug, r.id]);
  const [pages, services, research, jobs, resources, cases, industries, redirects] =
    await Promise.all(
      [
        'pages',
        'services',
        'research',
        'jobs',
        'resources',
        'case_studies',
        'industries',
        'redirects',
      ].map((m) => listRecords(m, true))
    );
  const body: RouteIndex = {
    pages: keys(pages),
    details: {
      services: keys(services),
      research: keys(research),
      careers: keys(jobs),
      resources: keys(resources),
      'case-studies': keys(cases),
      industries: keys(industries),
    },
    redirects: redirects.map((r) => String(r.data.from || '')).filter(Boolean),
  };
  return Response.json(body, {
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
