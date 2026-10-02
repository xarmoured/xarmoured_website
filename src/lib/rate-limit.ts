import 'server-only';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { isDemo, privileged } from './server';
const local = new Map<string, { count: number; until: number }>();
export async function rateLimit(scope: string, limit = 8) {
  const h = await headers();
  const ip = h.get('x-vercel-forwarded-for') || h.get('x-forwarded-for') || 'unknown';
  const key = createHash('sha256')
    .update(`${scope}:${ip.split(',')[0].trim()}`)
    .digest('hex');
  if (isDemo) {
    const now = Date.now();
    const entry = local.get(key);
    if (!entry || entry.until < now) {
      local.set(key, { count: 1, until: now + 600000 });
      return;
    }
    if (++entry.count > limit)
      throw new Error('Too many attempts. Please try again in ten minutes.');
    return;
  }
  const { data, error } = await privileged().rpc('check_rate_limit', {
    bucket_key: key,
    max_attempts: limit,
  });
  if (error || !data)
    throw new Error('Too many attempts or protection unavailable. Please try again later.');
}
