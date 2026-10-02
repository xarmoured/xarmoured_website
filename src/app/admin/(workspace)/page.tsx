import Link from 'next/link';
import {
  ArrowUpRight,
  Plus,
  Inbox,
  Users,
  Briefcase,
  FilePenLine,
  ArrowRight,
  Check,
  FlaskConical,
} from 'lucide-react';
import { listRecords, requireUser, siteSettings, dashboardCounts } from '@/lib/server';
import { can, type RecordData } from '@/lib/modules';
import { Status, Reveal } from '@/components/ui';
export default async function Dashboard() {
  const user = await requireUser();
  const read = async (m: string): Promise<RecordData[]> =>
    can(user.role, `${m}:read`) ? listRecords(m) : [];
  const [leads, applications, jobs, research, pages, activity, settings, services, reports] =
    await Promise.all([
      read('leads'),
      read('applications'),
      read('jobs'),
      read('research'),
      read('pages'),
      read('activity'),
      can(user.role, 'settings:read')
        ? read('settings').then((rows) => rows[0]?.data || {})
        : siteSettings(),
      read('services'),
      read('reports'),
    ]);
  const drafts = [...jobs, ...research, ...pages].filter((r) => r.status === 'draft');
  const aggregate = user.role === 'viewer' ? await dashboardCounts() : null;
  const recent = (rows: RecordData[], module: string) =>
    !can(user.role, `${module}:read`) ? (
      <div className="dashboard-empty">
        <Inbox size={23} />
        <h3>Protected record details.</h3>
        <p>
          Your role provides aggregate insights. Contact and candidate information is limited to
          authorized team members.
        </p>
      </div>
    ) : rows.length ? (
      <div className="dashboard-list">
        {rows.slice(0, 4).map((r) => (
          <Link key={r.id} href={`/admin/${module}/${r.id}`}>
            <span className="avatar record-avatar">
              {(r.data.name || r.title).slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{r.title}</strong>
              <span>{r.data.services || r.data.job_title || r.data.email}</span>
            </div>
            <Status value={r.status} />
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
    ) : (
      <div className="dashboard-empty">
        <Inbox size={23} />
        <h3>
          {module === 'leads'
            ? 'A new conversation starts here.'
            : 'Your next teammate starts here.'}
        </h3>
        <p>
          {module === 'leads'
            ? 'Assessment requests appear here automatically.'
            : 'Applications arrive when candidates apply to an open role.'}
        </p>
        <Link href={module === 'leads' ? '/assessment' : '/admin/jobs/new'}>
          {module === 'leads' ? 'View assessment form' : 'Create a job'} <ArrowUpRight size={14} />
        </Link>
      </div>
    );
  const checklist = [
    ['Add company details', !!settings.company, '/admin/settings'],
    ['Configure sales email', !!settings.sales_email, '/admin/settings'],
    ['Review email integrations', !!process.env.RESEND_API_KEY, '/admin/settings'],
    ['Configure assessment protection', !!process.env.TURNSTILE_SECRET_KEY, '/admin/settings'],
    ['Add your first service', services.some((r) => r.status === 'published'), '/admin/services'],
    [
      'Prepare security research',
      research.some((r) => r.status === 'published'),
      '/admin/research',
    ],
    ['Upload a sample report', reports.some((r) => r.status === 'published'), '/admin/reports'],
    ['Configure booking', !!settings.booking_url, '/admin/settings'],
  ];
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">YOUR COMPANY, AT A GLANCE</span>
          <h1>
            Hello, {user.name.split(' ')[0]}
            <span className="accent">.</span>
          </h1>
          <p>Here’s what needs your attention at Xarmoured.</p>
        </div>
        <span className="dashboard-date">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="metric-grid">
        {[
          [
            'New leads',
            aggregate?.new_leads ?? leads.filter((r) => r.status === 'new').length,
            'Ready for a first conversation',
            Inbox,
            '/admin/leads',
          ],
          [
            'Applications',
            aggregate?.applications ?? applications.length,
            `${aggregate?.unread_applications ?? applications.filter((r) => r.data.unread).length} unread applications`,
            Users,
            '/admin/applications',
          ],
          [
            'Open jobs',
            aggregate?.open_jobs ?? jobs.filter((r) => r.status === 'open').length,
            'Accepting new applications',
            Briefcase,
            '/admin/jobs',
          ],
          [
            'Draft content',
            aggregate?.drafts ?? drafts.length,
            'Ready for your next move',
            FilePenLine,
            '/admin/research',
          ],
        ].map(([label, value, caption, Icon, href], i) => {
          const I = Icon as typeof Inbox;
          return (
            <Reveal key={String(label)} delay={i * 0.04}>
              <Link
                href={user.role === 'viewer' ? '/admin/analytics' : String(href)}
                className={`metric-card metric-${i}`}
              >
                <div>
                  <span>{String(label)}</span>
                  <I size={18} />
                </div>
                <strong>{String(value).padStart(2, '0')}</strong>
                <p>
                  {String(caption)}
                  <ArrowUpRight size={14} />
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
      <div className="dashboard-quick">
        <span className="eyebrow">QUICK ACTIONS</span>
        {[
          ['Post a job', 'jobs'],
          ['Write research', 'research'],
          ['Add a service', 'services'],
          ['Add an FAQ', 'faqs'],
        ]
          .filter((x) => can(user.role, `${x[1]}:update`))
          .map((x) => (
            <Link href={`/admin/${x[1]}/new`} key={x[1]}>
              <Plus size={15} />
              {x[0]}
            </Link>
          ))}
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-indicator orange" />
              <h2>Recent leads</h2>
            </div>
            <Link href="/admin/leads">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {recent(leads, 'leads')}
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-indicator teal" />
              <h2>Recent applications</h2>
            </div>
            <Link href="/admin/applications">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {recent(applications, 'applications')}
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <FilePenLine size={16} />
              <h2>In the works</h2>
            </div>
            <span className="tiny-tag">{drafts.length} DRAFTS</span>
          </div>
          <div className="draft-list">
            {drafts.length ? (
              drafts.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/${jobs.includes(r) ? 'jobs' : research.includes(r) ? 'research' : 'pages'}/${r.id}`}
                >
                  <span className="draft-type">
                    {jobs.includes(r) ? <Briefcase size={18} /> : <FlaskConical size={18} />}
                  </span>
                  <div>
                    <strong>{r.title}</strong>
                    <span>{jobs.includes(r) ? 'Career opportunity' : 'Research & content'}</span>
                  </div>
                  <Status value="draft" />
                  <ArrowUpRight size={16} />
                </Link>
              ))
            ) : (
              <div className="dashboard-empty">
                <FilePenLine size={23} />
                <h3>Room for your next idea.</h3>
                <p>Saved drafts will be waiting here when you’re ready to publish.</p>
              </div>
            )}
          </div>
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-indicator neutral" />
              <h2>Workspace activity</h2>
            </div>
            <Link href="/admin/activity">
              Full history <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="activity-mini">
            {activity.length ? (
              activity.slice(0, 4).map((r) => (
                <div key={r.id}>
                  <span className="activity-mini-dot" />
                  <div>
                    <strong>{r.title || (r as any).action}</strong>
                    <p>{r.data?.actor || r.data?.entity || (r as any).entity_type}</p>
                  </div>
                  <time>
                    {new Date(r.created_at).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              ))
            ) : (
              <div className="dashboard-empty">
                <Check size={23} />
                <h3>A clear record from day one.</h3>
                <p>Publications, status changes, and updates are logged here.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      {!settings.onboarding_dismissed && can(user.role, 'settings:update') && (
        <section className="onboarding">
          <div>
            <span className="eyebrow">MAKE IT YOURS</span>
            <h2>A few steps. A stronger foundation.</h2>
            <p>Finish setting up your company workspace.</p>
            <Link className="text-link" href="/admin/settings">
              Review settings <ArrowRight size={15} />
            </Link>
          </div>
          <div className="checklist">
            {checklist.map(([label, done, href]) => (
              <Link href={String(href)} key={String(label)}>
                <span className={done ? 'checked' : ''}>{done && <Check size={12} />}</span>
                {label}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
