import { notFound } from 'next/navigation';
import {
  requireUser,
  listRecords,
  getRecord,
  supabase,
  isDemo,
  dashboardCounts,
  siteSettings,
} from '@/lib/server';
import { modules, can } from '@/lib/modules';
import { DataTable } from '@/components/data-table';
import { Editor } from '@/components/editor';
import { MediaManager } from '@/components/media-manager';
import { Account } from '@/components/account';
import { Analytics } from '@/components/analytics';
import { JobApplications } from '@/components/job-applications';
import { History, ArrowUpRight, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
export default async function AdminPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [module, id] = path;
  const user = await requireUser();
  if (module === 'account') return <Account name={user.name} email={user.email} demo={isDemo} />;
  if (module === 'analytics') {
    await requireUser('analytics:read');
    let events: any[] = [];
    if (!isDemo) {
      const db = await supabase();
      const { data } = await db
        .from('analytics_events')
        .select('event,path,source,created_at')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20000);
      events = data || [];
    }
    const aggregate = user.role === 'viewer' ? await dashboardCounts() : null;
    return (
      <Analytics
        events={events}
        leads={aggregate?.leads ?? (await listRecords('leads')).length}
        applications={aggregate?.applications ?? (await listRecords('applications')).length}
      />
    );
  }
  const config = modules[module];
  if (!config) notFound();
  if (!can(user.role, `${module}:read`))
    return (
      <div className="empty-state">
        <LockKeyhole size={30} />
        <h1>Access is restricted.</h1>
        <p>
          Your role doesn’t include this part of the workspace. Contact your owner if you need
          access.
        </p>
      </div>
    );
  const writable = can(user.role, `${module}:update`);
  if (module === 'activity') {
    const rows = await listRecords('activity');
    return (
      <>
        <div className="admin-page-heading">
          <div>
            <span className="eyebrow">ACCOUNTABILITY, BUILT IN</span>
            <h1>Workspace activity</h1>
            <p>A durable history of the actions that shape your company.</p>
          </div>
          <span className="tiny-tag">READ ONLY</span>
        </div>
        <div className="activity-page">
          {rows.length ? (
            rows.map((r: any) => (
              <div key={r.id}>
                <span className="activity-icon">
                  <History size={18} />
                </span>
                <div>
                  <h3>{r.title || r.action}</h3>
                  <p>
                    {r.data?.actor || r.metadata?.actor_name || r.actor || 'System'} ·{' '}
                    {r.data?.entity || r.entity_type}
                  </p>
                  <small>{r.metadata?.title || r.data?.entity_id || r.entity_id}</small>
                </div>
                <time>{new Date(r.created_at).toLocaleString('en-GB')}</time>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <History size={30} />
              <h2>Your history starts with your first action.</h2>
              <p>Publishing, edits, and status updates will appear here.</p>
            </div>
          )}
        </div>
      </>
    );
  }
  const records = (await listRecords(module)).filter(
    (r) => module !== 'media' || r.status !== 'archived'
  );
  if (module === 'media' && !id) return <MediaManager records={records} writable={writable} />;
  const singleton = ['settings', 'seo'].includes(module);
  if (id || singleton) {
    const record =
      id === 'new'
        ? undefined
        : records.find((r) => r.id === (id || records[0]?.id) || r.slug === id);
    if (id && id !== 'new' && !record) notFound();
    if (id === 'new' && !writable) return <p>You don’t have permission to create this content.</p>;
    let notes: any[] = [],
      timeline: any[] = [];
    if (record && ['leads', 'applications'].includes(module)) {
      if (isDemo) {
        notes = (record.data.notes || []).map((n: any, i: number) => ({
          id: String(i),
          body: n.text,
          created_at: n.at,
        }));
        timeline = [
          { id: 'submitted', action: 'Submission received', created_at: record.created_at },
        ];
      } else {
        const db = await supabase();
        const [n, t] = await Promise.all([
          db.from('internal_notes').select('*').eq('record_id', record.id).order('created_at'),
          db
            .from('record_activity')
            .select('*')
            .eq('record_id', record.id)
            .order('created_at', { ascending: false }),
        ]);
        notes = n.data || [];
        timeline = t.data || [];
      }
    }
    const initial =
      record ||
      (singleton
        ? {
            id: '',
            title: module === 'seo' ? 'Global SEO' : 'Website settings',
            slug: module === 'seo' ? 'global' : 'site',
            status: 'published',
            data: {},
            created_at: '',
            updated_at: '',
          }
        : undefined);
    const defaults = module === 'jobs' && !record ? await siteSettings() : {};
    return (
      <>
        {module === 'settings' && (
          <div className="integration-status">
            <span>Integrations</span>
            {[
              ['Supabase', !!process.env.NEXT_PUBLIC_SUPABASE_URL],
              ['Resend', !!process.env.RESEND_API_KEY],
              ['Turnstile', !!process.env.TURNSTILE_SECRET_KEY],
            ].map(([name, on]) => (
              <span className={on ? 'connected' : 'not-connected'} key={String(name)}>
                <i />
                {name} {on ? 'configured' : 'not connected'}
              </span>
            ))}
          </div>
        )}
        {module === 'jobs' && record && (
          <JobApplications
            records={(await listRecords('applications')).filter((r) => r.data.job_id === record.id)}
          />
        )}
        <Editor
          key={record?.id || module}
          module={module}
          record={initial?.id ? initial : undefined}
          writable={writable}
          notes={notes}
          timeline={timeline}
          relatedFaqs={module === 'services' ? await listRecords('faqs') : []}
          defaultData={
            module === 'jobs'
              ? {
                  accept_applications: true,
                  remote: ['remote', 'hybrid', 'onsite'].includes(defaults.remote)
                    ? defaults.remote
                    : 'remote',
                  employment: 'Full time',
                }
              : {}
          }
        />
      </>
    );
  }
  return <DataTable module={module} records={records} writable={writable} />;
}
