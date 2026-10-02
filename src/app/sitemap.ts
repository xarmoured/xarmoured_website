import type { MetadataRoute } from 'next';
import { listRecords } from '@/lib/server';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://xarmoured.com';
  const groups = await Promise.all(
    ['services', 'research', 'jobs', 'pages'].map(async (module) => ({
      module,
      rows: await listRecords(module, true),
    }))
  );
  return [
    ...[
      '',
      'services',
      'methodology',
      'about',
      'research',
      'careers',
      'assessment',
      'sample-report',
      'privacy',
      'terms',
    ].map((p) => ({ url: `${base}/${p}` })),
    ...groups.flatMap((g) =>
      g.rows
        .filter((r) => g.module !== 'pages' || r.slug !== 'home')
        .map((r) => ({
          url: `${base}/${g.module === 'jobs' ? 'careers' : g.module === 'pages' ? '' : g.module + '/'}${g.module === 'jobs' ? '/' : ''}${r.slug}`,
          lastModified: new Date(r.updated_at),
        }))
    ),
  ];
}
