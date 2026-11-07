/**
 * Public route validity, used by the proxy to return a real HTTP 404.
 *
 * Next.js streams dynamic responses, so a notFound() thrown while rendering is delivered as
 * HTTP 200 plus <meta name="robots" content="noindex"> (a "soft 404"). The documented fix is
 * to decide existence before rendering. This mirrors the routing rules of
 * src/app/(public)/[...path]/page.tsx and must be kept in step with them.
 *
 * It only ever returns 'missing' when the path cannot resolve; if in doubt it returns 'ok'
 * and the page itself decides.
 */
export type RouteIndex = {
  /** Slugs (and ids) of published CMS pages. */
  pages: string[];
  /** Published detail records per URL section, by slug and id. */
  details: Record<string, string[]>;
  /** `from` paths of published CMS redirects. */
  redirects: string[];
};

export const DETAIL_SECTIONS = [
  'services',
  'research',
  'careers',
  'resources',
  'case-studies',
  'industries',
  'sample-report',
];

/** Top-level routes that the application renders itself, with or without CMS records. */
const CODE_ROUTES = new Set([
  'contact',
  'protocol',
  'partners',
  'assessment',
  'industries',
  'resources',
  'case-studies',
  'security',
  'services',
  'research',
  'careers',
  'methodology',
  'about',
  'sample-report',
  'privacy',
  'terms',
  'labs',
]);

const SKIP = ['/admin', '/api', '/auth', '/_next', '/.well-known'];

export function classifyPath(
  pathname: string,
  index: RouteIndex,
  opts: { preview?: boolean } = {}
): 'ok' | 'missing' {
  if (opts.preview) return 'ok';
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return 'ok';
  if (SKIP.some((p) => path === p || path.startsWith(p + '/'))) return 'ok';
  const raw = path.split('/').filter(Boolean);
  // Static assets and files (robots.txt, sitemap.xml, images) are not page routes.
  if (raw[raw.length - 1].includes('.')) return 'ok';
  if (index.redirects.includes(path)) return 'ok';
  if (raw.length > 2) return 'missing';
  let segments: string[];
  try {
    segments = raw.map(decodeURIComponent);
  } catch {
    return 'missing';
  }
  const [section, slug] = segments;
  if (segments.length === 1)
    return CODE_ROUTES.has(section) || index.pages.includes(section) ? 'ok' : 'missing';
  if (!DETAIL_SECTIONS.includes(section)) return 'missing';
  // Sample-report details are preview-only.
  if (section === 'sample-report') return 'missing';
  if (section === 'careers' && slug === 'general') return 'ok';
  return index.details[section]?.includes(slug) ? 'ok' : 'missing';
}
