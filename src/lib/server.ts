import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { can, type Role, type RecordData } from './modules';
import { demoSeed } from './demo';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
export const isDemo =
  process.env.NODE_ENV !== 'production' && process.env.XARMOURED_DEMO === 'true';
export const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export async function supabase() {
  if (!configured) throw new Error('Supabase is not configured. Follow the setup guide.');
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (cs) => {
          try {
            cs.forEach(({ name, value, options }) =>
              store.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              })
            );
          } catch {
            /* Server component cannot refresh cookies; proxy handles refresh. */
          }
        },
      },
    }
  );
}
export function privileged() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Server integration is not configured.');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
export const currentUser = cache(async () => {
  if (isDemo)
    return {
      id: 'demo-owner',
      name: 'Demo owner',
      email: 'demo@example.com',
      role: 'owner' as Role,
    };
  if (!configured) return null;
  const db = await supabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await db
    .from('profiles')
    .select('id,name,role,disabled')
    .eq('id', user.id)
    .single();
  if (!profile || profile.disabled) return null;
  return { ...profile, email: user.email || '', role: profile.role as Role };
});
export async function requireUser(permission?: string) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  if (permission && !can(user.role, permission))
    throw new Error('You do not have permission to perform this action.');
  return user;
}
const demoPath = path.join(
  process.cwd(),
  '.demo-data',
  process.env.XARMOURED_DEMO_NAMESPACE === 'e2e' ? 'e2e-records.json' : 'records.json'
);
let queue = Promise.resolve();
async function demoRead(): Promise<Record<string, RecordData[]>> {
  try {
    return JSON.parse(await readFile(demoPath, 'utf8'));
  } catch {
    return structuredClone(demoSeed);
  }
}
export async function demoChange<T>(fn: (data: Record<string, RecordData[]>) => T): Promise<T> {
  let result: T;
  const next = queue.then(async () => {
    const data = await demoRead();
    result = fn(data);
    await mkdir(path.dirname(demoPath), { recursive: true });
    await writeFile(demoPath, JSON.stringify(data, null, 2));
  });
  queue = next.catch(() => {});
  await next;
  return result!;
}
const table = (module: string) => (module === 'activity' ? 'audit_logs' : 'records');
function ordered(module: string, rows: RecordData[]) {
  return ['services', 'faqs', 'team', 'navigation', 'service_categories', 'industries'].includes(
    module
  )
    ? rows.sort((a, b) => Number(a.data.order || 0) - Number(b.data.order || 0))
    : rows;
}
export async function listRecords(module: string, publicOnly = false): Promise<RecordData[]> {
  if (isDemo) {
    const rows = (await demoRead())[module] || [];
    return ordered(
      module,
      rows.filter((r) => !r.deleted_at && (!publicOnly || publicVisible(module, r)))
    );
  }
  if (!configured) return [];
  if (!publicOnly) await requireUser(`${module}:read`);
  const db = await supabase();
  let query = db
    .from(table(module))
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (module !== 'activity') query = query.eq('module', module).is('deleted_at', null);
  if (publicOnly)
    query = query.in('status', module === 'jobs' ? ['open', 'paused', 'closed'] : ['published']);
  const { data, error } = await query;
  if (error) throw new Error('Unable to load records. Check database setup and your permissions.');
  const rows = (data || []) as RecordData[];
  return ordered(module, publicOnly ? rows.filter((r) => publicVisible(module, r)) : rows);
}
export function publicVisible(module: string, r: RecordData) {
  return (
    !r.deleted_at &&
    (module === 'jobs'
      ? ['open', 'paused', 'closed'].includes(r.status)
      : r.status === 'published') &&
    (module !== 'research' || r.data.disclosure === 'public') &&
    (module !== 'case_studies' || r.data.visibility === 'public') &&
    (module !== 'services' ||
      ['summary', 'description', 'testing_areas'].every((k) => String(r.data[k] || '').trim()))
  );
}
export async function getRecord(module: string, id: string, publicOnly = false) {
  return (await listRecords(module, publicOnly)).find((r) => r.id === id || r.slug === id);
}
export async function dashboardCounts() {
  await requireUser('dashboard:read');
  if (isDemo) {
    const data = await demoRead();
    return {
      leads: (data.leads || []).length,
      new_leads: (data.leads || []).filter((r) => r.status === 'new').length,
      applications: (data.applications || []).length,
      unread_applications: (data.applications || []).filter((r) => r.data.unread).length,
      open_jobs: (data.jobs || []).filter((r) => r.status === 'open').length,
      drafts: ['jobs', 'research', 'pages']
        .flatMap((m) => data[m] || [])
        .filter((r) => r.status === 'draft').length,
    };
  }
  const db = await supabase();
  const { data, error } = await db.rpc('dashboard_counts');
  if (error) throw new Error('Unable to load aggregate dashboard data.');
  return data as {
    leads: number;
    new_leads: number;
    applications: number;
    unread_applications: number;
    open_jobs: number;
    drafts: number;
  };
}
export const siteSettings = cache(async () => {
  if (isDemo) return (await listRecords('settings', true))[0]?.data || {};
  if (!configured) return {};
  const db = await supabase();
  const { data, error } = await db.rpc('public_site_settings');
  if (error) throw new Error('Unable to load company settings. Apply the database migrations.');
  return (data || {}) as Record<string, any>;
});
export async function internalEmailTemplates() {
  if (isDemo) return (await listRecords('settings', true))[0]?.data || {};
  const { data, error } = await privileged()
    .from('records')
    .select('data')
    .eq('module', 'settings')
    .eq('status', 'published')
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error('Unable to load configured email templates.');
  return (data?.data || {}) as Record<string, any>;
}
export async function audit(
  action: string,
  module: string,
  id: string,
  metadata: Record<string, unknown> = {}
) {
  const user = await requireUser();
  if (isDemo) {
    await demoChange((data) => {
      (data.activity ??= []).unshift({
        id: crypto.randomUUID(),
        title: action,
        slug: id,
        status: 'recorded',
        data: { actor: user.name, entity: module, entity_id: id, ...metadata },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
    return;
  }
  const db = await supabase();
  const { error } = await db
    .from('audit_logs')
    .insert({ actor: user.id, action, entity_type: module, entity_id: id, metadata });
  if (error) throw new Error('Unable to record activity.');
}
