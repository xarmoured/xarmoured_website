import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/auth', '/*?preview='] },
    sitemap: `${await siteOrigin()}/sitemap.xml`,
  };
}
