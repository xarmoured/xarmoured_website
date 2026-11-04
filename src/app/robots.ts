import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/seo';
export const dynamic = 'force-dynamic';
const blocked = ['/admin', '/api', '/auth', '/*?preview='];
// Search and AI assistants that are explicitly welcome. A bot-specific group replaces the
// default group for that bot, so the private paths are repeated for every group.
const aiBots = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
];
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: blocked },
      ...aiBots.map((userAgent) => ({ userAgent, allow: '/', disallow: blocked })),
    ],
    sitemap: `${await siteOrigin()}/sitemap.xml`,
  };
}
