import { describe, expect, it } from 'vitest';
import { classifyPath, type RouteIndex } from '../src/lib/route-index';

const index: RouteIndex = {
  pages: ['pricing', 'faq', 'how-we-work', 'home', 'id-1'],
  details: {
    services: ['web-application-penetration-testing', 's-id'],
    research: ['unopim-rce'],
    careers: ['security-engineer'],
    industries: ['saas', 'startups', 'ecommerce'],
    resources: [],
    'case-studies': [],
  },
  redirects: ['/old-page'],
};
const c = (p: string, preview = false) => classifyPath(p, index, { preview });

describe('classifyPath (real 404 decisions)', () => {
  it('accepts every code-rendered and CMS page route', () => {
    for (const p of [
      '/',
      '/services',
      '/industries',
      '/protocol',
      '/partners',
      '/about',
      '/methodology',
      '/security',
      '/assessment',
      '/research',
      '/pricing',
      '/faq',
      '/how-we-work',
      '/contact',
      '/privacy/',
      '/sample-report',
    ])
      expect(c(p), p).toBe('ok');
  });
  it('accepts published detail records and the general application', () => {
    expect(c('/services/web-application-penetration-testing')).toBe('ok');
    expect(c('/industries/ecommerce')).toBe('ok');
    expect(c('/research/unopim-rce')).toBe('ok');
    expect(c('/careers/security-engineer')).toBe('ok');
    expect(c('/careers/general')).toBe('ok');
  });
  it('never blocks admin, api, auth, well-known, static files or previews', () => {
    for (const p of [
      '/admin/login',
      '/api/submit',
      '/auth/callback',
      '/.well-known/security.txt',
      '/robots.txt',
      '/sitemap.xml',
      '/llms.txt',
      '/logo.png',
    ])
      expect(c(p), p).toBe('ok');
    expect(c('/unpublished-draft', true)).toBe('ok');
  });
  it('honors published CMS redirects', () => {
    expect(c('/old-page')).toBe('ok');
  });
  it('returns missing for routes that cannot resolve', () => {
    for (const p of [
      '/nonexistent',
      '/services/does-not-exist',
      '/protocol/attack',
      '/about/team',
      '/a/b/c',
      '/industries/nope',
      '/sample-report/anything',
      '/%E0%A4%A',
    ])
      expect(c(p), p).toBe('missing');
  });
});
