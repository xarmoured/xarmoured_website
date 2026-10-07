import type { MetadataRoute } from 'next';
import { listRecords, siteSettings } from '@/lib/server';
import { siteOrigin } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [base, settings] = await Promise.all([siteOrigin(), siteSettings()]);
  const groups = await Promise.all(
    ['services', 'research', 'jobs', 'pages', 'resources', 'case_studies', 'industries'].map(
      async (module) => ({ module, rows: await listRecords(module, true) })
    )
  );
  const paths = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (path: string, updated?: string) => {
    paths.set(path, {
      url: new URL(path, base).toString(),
      ...(updated ? { lastModified: new Date(updated) } : {}),
    });
  };
  [
    '/',
    '/services',
    '/methodology',
    '/about',
    '/resources',
    '/assessment',
    '/privacy',
    '/terms',
    '/security',
  ].forEach((p) => add(p));
  if (settings.research_enabled !== false) add('/research');
  if (settings.careers_enabled !== false) add('/careers');
  if (settings.sample_report_enabled !== false) add('/sample-report');
  const reserved = new Set([
    'home',
    'services',
    'research',
    'careers',
    'resources',
    'case-studies',
    'industries',
    'assessment',
    'contact',
    'sample-report',
    'labs',
    'admin',
    'api',
    'auth',
    'security',
  ]);
  for (const g of groups) {
    if (
      (g.module === 'research' && settings.research_enabled === false) ||
      (g.module === 'jobs' && settings.careers_enabled === false)
    )
      continue;
    if (g.module === 'case_studies' && g.rows.length) add('/case-studies');
    if (g.module === 'industries' && g.rows.length) add('/industries');
    for (const r of g.rows) {
      if (g.module === 'pages') {
        if (reserved.has(r.slug)) continue;
        add(`/${r.slug}`, r.updated_at);
      } else
        add(
          `/${g.module === 'jobs' ? 'careers' : g.module === 'case_studies' ? 'case-studies' : g.module}/${r.slug}`,
          r.updated_at
        );
    }
  }
  if (settings.labs_enabled) add('/labs');
  return [...paths.values()];
}
