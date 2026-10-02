import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import {
  listRecords,
  getRecord,
  siteSettings,
  isDemo,
  requireUser,
  configured,
} from '@/lib/server';
import { defaultServices } from '@/lib/demo';
import { ButtonLink, Reveal, ServiceIcon, Status } from '@/components/ui';
import { Markdown } from '@/components/markdown';
import { SubmissionForm } from '@/components/submission-form';
export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const module = (
    { careers: 'jobs', research: 'research', services: 'services' } as Record<string, string>
  )[path[0]];
  const r =
    module && path[1]
      ? await getRecord(module, path[1], true)
      : !module
        ? await getRecord('pages', path[0], true)
        : undefined;
  const seo = (await listRecords('seo', true))[0]?.data || {};
  return {
    title: {
      absolute: (seo.title_template || '%s — Xarmoured').replace(
        '%s',
        r?.data.seo_title || r?.title || path[0].replaceAll('-', ' ')
      ),
    },
    description: r?.data.seo_description || r?.data.summary || seo.description,
    openGraph: {
      images: r?.data.og_image ? [r.data.og_image] : seo.og_image ? [seo.og_image] : [],
    },
  };
}
export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { path } = await params;
  const query = await searchParams;
  const settings = await siteSettings();
  const [section, slug] = path;
  const previewPage =
    query.preview === 'true' &&
    !['services', 'research', 'careers', 'assessment'].includes(section);
  if (previewPage) await requireUser(`${section === 'sample-report' ? 'reports' : 'pages'}:read`);
  const previewBanner = previewPage ? (
    <div className="preview-banner">
      PRIVATE PREVIEW · Unpublished content. <Link href="/admin/pages">Return to admin →</Link>
    </div>
  ) : null;
  const redirects = await listRecords('redirects', true);
  const redir = redirects.find((r) => r.data.from === `/${path.join('/')}`);
  if (redir) redirect(redir.data.to);
  const intro = (eyebrow: string, title: string, description: string) => (
    <Reveal className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </Reveal>
  );
  if (section === 'assessment')
    return (
      <div className="wrap section form-page">
        <div>
          {intro(
            'LET’S TALK SECURITY',
            'Your next step toward certainty.',
            'Tell us what you’re building and what you need tested. A practitioner will help you find the right scope.'
          )}
          <div className="form-trust">
            <ShieldCheck />
            <h3>Scoped by people. Tested by people.</h3>
            <p>Your enquiry stays private. No automated sales pitch.</p>
            {settings.sales_email && (
              <a href={`mailto:${settings.sales_email}`}>{settings.sales_email} ↗</a>
            )}
          </div>
          {settings.booking_url && (
            <ButtonLink href={settings.booking_url} secondary event="booking_click">
              Book a scoping call
            </ButtonLink>
          )}
        </div>
        <div>
          {settings.assessment_enabled === false ? (
            <p>
              Assessment requests are currently paused. Contact {settings.sales_email || 'our team'}
              .
            </p>
          ) : (
            <SubmissionForm type="assessment" demo={isDemo} />
          )}
        </div>
      </div>
    );
  if (['services', 'research', 'careers'].includes(section)) {
    const module = section === 'careers' ? 'jobs' : section;
    if (
      (section === 'careers' && settings.careers_enabled === false) ||
      (section === 'research' && settings.research_enabled === false)
    )
      notFound();
    const rows = await listRecords(module, true);
    const data = section === 'services' && !rows.length && !configured ? defaultServices : rows;
    if (slug) {
      let record = data.find((r) => r.slug === slug || r.id === slug);
      if (query.preview === 'true') {
        await requireUser(`${module}:read`);
        record = await getRecord(module, slug);
      }
      if (slug === 'general' && section === 'careers' && settings.general_applications)
        return (
          <div className="wrap section form-page">
            <div>
              {intro(
                'CAREERS',
                'General application',
                'Show us how you think. We’re interested in offensive security, security engineering, and vulnerability research.'
              )}
            </div>
            <SubmissionForm type="application" jobId="general" demo={isDemo} />
          </div>
        );
      if (!record) notFound();
      const r = record;
      const selectedFaqs =
        section === 'services'
          ? (await listRecords('faqs', true)).filter((f) =>
              String(r.data.faq_ids || '')
                .split('\n')
                .includes(f.id)
            )
          : [];
      const open =
        r.status === 'open' &&
        r.data.accept_applications !== false &&
        (!r.data.deadline || r.data.deadline >= new Date().toISOString().slice(0, 10));
      return (
        <article className="wrap section detail-page">
          {query.preview === 'true' && (
            <div className="preview-banner">
              PRIVATE PREVIEW · This content may not be published.{' '}
              <Link href={`/admin/${module}/${r.id}`}>Return to editor →</Link>
            </div>
          )}
          <Link className="text-link" href={`/${section}`}>
            ← {section}
          </Link>
          {intro(
            section === 'research'
              ? r.data.cve || 'ORIGINAL RESEARCH'
              : section === 'careers'
                ? `${r.data.department || 'CAREERS'} / ${r.data.location || 'Remote'}`
                : 'OFFENSIVE SECURITY',
            r.title,
            r.data.summary || ''
          )}
          {section === 'careers' ? (
            <div className="job-detail-grid">
              <div>
                <div className="tag-row">
                  <Status value={r.status} />
                  <span>{r.data.employment}</span>
                  <span>{r.data.remote}</span>
                  <span>{r.data.experience}</span>
                </div>
                {[
                  'description',
                  'responsibilities',
                  'requirements',
                  'nice_to_have',
                  'hiring_process',
                ].map(
                  (k) =>
                    r.data[k] && (
                      <section key={k}>
                        <h2>
                          {
                            (
                              {
                                description: 'The role',
                                responsibilities: 'What you’ll do',
                                requirements: 'What you bring',
                                nice_to_have: 'Nice to have',
                                hiring_process: 'Hiring process',
                              } as Record<string, string>
                            )[k]
                          }
                        </h2>
                        <Markdown>{r.data[k]}</Markdown>
                      </section>
                    )
                )}
                {r.data.salary && <p>Salary: {r.data.salary}</p>}
              </div>
              <aside className="job-apply">
                <h3>{open ? 'Make your next move.' : 'Applications are closed.'}</h3>
                <p>
                  {open
                    ? 'Bring your curiosity. Show us your work.'
                    : r.status === 'paused'
                      ? 'Applications for this role are temporarily paused.'
                      : 'Applications for this role are now closed.'}
                </p>
                {open && (
                  <a className="button" href="#apply">
                    Apply for this role <ArrowUpRight size={16} />
                  </a>
                )}
              </aside>
              {open && (
                <div id="apply" className="application-section">
                  <h2>Apply for {r.title}</h2>
                  <SubmissionForm type="application" jobId={r.id} role={r.title} demo={isDemo} />
                </div>
              )}
            </div>
          ) : section === 'research' ? (
            <>
              <div className="research-meta">
                {[
                  'cve',
                  'vendor',
                  'product',
                  'severity',
                  'cvss',
                  'cwe',
                  'researcher',
                  'disclosed_at',
                ].map(
                  (k) =>
                    r.data[k] && (
                      <div key={k}>
                        <span className="eyebrow">{k.replaceAll('_', ' ')}</span>
                        <strong>{r.data[k]}</strong>
                      </div>
                    )
                )}
              </div>
              <Markdown>{r.data.content || ''}</Markdown>
              {r.data.references && (
                <div className="references">
                  <h2>References</h2>
                  {String(r.data.references)
                    .split('\n')
                    .filter(Boolean)
                    .map((url, i) => (
                      <a
                        href={/^https?:\/\//.test(url) ? url : undefined}
                        key={i}
                        rel="noopener noreferrer"
                      >
                        {url}
                      </a>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="service-detail">
              <Markdown>{r.data.description || ''}</Markdown>
              <h2>What we test</h2>
              <div className="testing-list">
                {String(r.data.testing_areas || '')
                  .split('\n')
                  .filter(Boolean)
                  .map((a) => (
                    <div key={a}>
                      <Check size={17} />
                      {a}
                    </div>
                  ))}
              </div>
              <Markdown>{r.data.deliverables || ''}</Markdown>
              {r.data.timeline && <p>Timeline: {r.data.timeline}</p>}
              <ButtonLink href="/assessment">Scope this assessment</ButtonLink>
              {selectedFaqs.length > 0 && (
                <section className="service-faqs">
                  <h2>Before we begin</h2>
                  {selectedFaqs.map((f) => (
                    <details key={f.id}>
                      <summary>
                        {f.title}
                        <span>+</span>
                      </summary>
                      <Markdown>{f.data.answer || ''}</Markdown>
                    </details>
                  ))}
                </section>
              )}
            </div>
          )}
        </article>
      );
    }
    return (
      <div className="wrap section">
        {intro(
          section === 'services'
            ? 'OUR SERVICES'
            : section === 'research'
              ? 'XARMOURED RESEARCH'
              : 'WORK WITH US',
          section === 'services'
            ? 'Depth, across your\nentire attack surface.'
            : section === 'research'
              ? 'Curiosity with\nconsequences.'
              : 'Think differently.\nBuild something that matters.',
          section === 'services'
            ? 'Manual-first offensive security, built around your systems and business context.'
            : section === 'research'
              ? 'Original research, responsible disclosure, and the lessons that make systems stronger.'
              : 'An early-stage security company for practitioners who care about the details. No inflated titles. Just meaningful work.'
        )}
        {data.length ? (
          <div className={section === 'services' ? 'service-grid' : 'listing-rows'}>
            {data.map((r) => (
              <Link
                key={r.id}
                href={`/${section}/${r.slug}`}
                className={section === 'services' ? 'service-item' : 'listing-row'}
              >
                {section === 'services' && <ServiceIcon name={r.data.icon} />}
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.data.summary}</p>
                  {section === 'careers' && (
                    <span className="mono">
                      {r.data.department} · {r.data.location} · {r.data.employment}
                    </span>
                  )}
                </div>
                {section === 'careers' && <Status value={r.status} />}
                <ArrowUpRight size={21} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="public-empty">
            <span className="eyebrow">
              {section === 'careers' ? 'NO OPEN ROLES' : 'PUBLICATIONS IN PROGRESS'}
            </span>
            <h2>
              {section === 'careers'
                ? 'Good people. At the right time.'
                : 'Good research takes time.'}
            </h2>
            <p>
              {section === 'careers'
                ? 'We don’t have an open role right now. Future opportunities will appear here.'
                : 'We publish original findings after responsible disclosure. Check back for our latest work.'}
            </p>
          </div>
        )}
        {section === 'careers' && settings.general_applications && (
          <div className="general-application">
            <h2>Don’t see the right role?</h2>
            <p>
              If your work aligns with offensive security, security engineering, or vulnerability
              research, we’d still like to hear from you.
            </p>
            <ButtonLink href="/careers/general">General application</ButtonLink>
          </div>
        )}
      </div>
    );
  }
  if (section === 'methodology')
    return (
      <div className="wrap section">
        {intro(
          'OUR APPROACH',
          'Follow the evidence.\nFinish the work.',
          'Security testing should leave your team with clarity, not a longer list of questions.'
        )}
        <div className="methodology-details">
          {[
            [
              '01',
              'Scope & threat model',
              'We map your environment, identify trust boundaries, agree on rules of engagement, and define success before testing starts.',
            ],
            [
              '02',
              'Active testing',
              'Manual exploration, business logic testing, and focused tooling reveal paths a scanner alone cannot validate.',
            ],
            [
              '03',
              'Validate the impact',
              'We reproduce each finding and explain what an attacker could achieve within the agreed scope.',
            ],
            [
              '04',
              'Report & debrief',
              'Your team receives technical reproduction steps, business impact, and remediation guidance, followed by a focused debrief.',
            ],
            [
              '05',
              'Retest & verify',
              'We test the remediated finding and document the result. A fix is complete when it withstands testing.',
            ],
          ].map((x) => (
            <Reveal className="methodology-detail" key={x[0]}>
              <span>{x[0]}</span>
              <h2>{x[1]}</h2>
              <p>{x[2]}</p>
            </Reveal>
          ))}
        </div>
        <ButtonLink href="/assessment">Plan your assessment</ButtonLink>
      </div>
    );
  if (section === 'about') {
    const team = await listRecords('team', true);
    const page = await getRecord('pages', 'about', !previewPage);
    return (
      <div className="wrap section">
        {previewBanner}
        {intro(
          'THE PRACTICE',
          page?.data.headline ||
            page?.title ||
            'Built by practitioners.\nFor people building things.',
          page?.data.summary ||
            settings.description ||
            'Xarmoured is an early-stage security company focused on penetration testing, vulnerability research, and security engineering.'
        )}
        {page?.data.content && <Markdown>{page.data.content}</Markdown>}
        <div className="about-statement">
          <h2>
            Small by design.
            <br />
            Thorough by default.
          </h2>
          <p>
            We care about the work behind the report. Understanding a system. Challenging its
            assumptions. Turning a finding into something an engineer can fix.
          </p>
        </div>
        {team.length > 0 && (
          <div className="team-grid">
            {team.map((r) => (
              <div key={r.id}>
                {r.data.photo && <img src={r.data.photo} alt={r.title} width="160" height="160" />}
                <h3>{r.title}</h3>
                <span className="eyebrow">{r.data.role}</span>
                <Markdown>{r.data.bio || ''}</Markdown>
                {['linkedin', 'github', 'website'].map(
                  (k) =>
                    r.data[k] && (
                      <a key={k} href={r.data[k]}>
                        {k} ↗
                      </a>
                    )
                )}
              </div>
            ))}
          </div>
        )}
        <ButtonLink href="/assessment">Work with us</ButtonLink>
      </div>
    );
  }
  if (section === 'sample-report') {
    if (settings.sample_report_enabled === false) notFound();
    const reports = await listRecords('reports', true);
    const r =
      previewPage && slug
        ? await getRecord('reports', slug)
        : reports.sort(
            (a, b) =>
              Date.parse(b.published_at || b.updated_at) -
              Date.parse(a.published_at || a.updated_at)
          )[0];
    return (
      <div className="wrap section">
        {previewBanner}
        {intro(
          'OUR DELIVERABLES',
          'Evidence you can act on.',
          'A report should connect technical findings to business decisions, and give engineers a practical path to remediation.'
        )}
        {r ? (
          <div className="report-download">
            <h2>{r.title}</h2>
            <p>{r.data.description}</p>
            <span className="mono">
              VERSION {r.data.version} · Updated{' '}
              {new Date(r.updated_at).toLocaleDateString('en-GB')}
            </span>
            {r.data.file && <ButtonLink href={r.data.file}>Download sample report</ButtonLink>}
          </div>
        ) : (
          <div className="public-empty">
            <h2>Request a sample report.</h2>
            <p>
              Our public sample isn’t available yet. Contact us to discuss the reporting format for
              your engagement.
            </p>
            <ButtonLink href="/assessment">Talk about deliverables</ButtonLink>
          </div>
        )}
      </div>
    );
  }
  if (['privacy', 'terms', 'labs'].includes(section)) {
    if (section === 'labs' && !settings.labs_enabled) notFound();
    const page = await getRecord('pages', section, !previewPage);
    return (
      <div className="wrap section narrow">
        {previewBanner}
        {intro(
          section.toUpperCase(),
          page?.title || section[0].toUpperCase() + section.slice(1),
          page?.data.summary || ''
        )}
        {page ? (
          <Markdown>{page.data.content || ''}</Markdown>
        ) : (
          <p>
            {section === 'privacy'
              ? 'Assessment and career forms collect the information you choose to submit so Xarmoured can review your request or application. Resumes and internal business records are restricted to authorized administrators. Contact the company to request access or deletion. A complete retention and privacy policy must be reviewed before production launch.'
              : section === 'terms'
                ? 'Engagement scope, authorization, confidentiality, and commercial terms are agreed separately before testing begins. Website information does not authorize security testing. Contact Xarmoured to discuss an engagement.'
                : 'Our tooling grows from the problems we encounter during real security work.'}
          </p>
        )}
      </div>
    );
  }
  const page = await getRecord('pages', section, !previewPage);
  if (page)
    return (
      <div className="wrap section narrow">
        {previewBanner}
        {intro('XARMOURED', page.data.headline || page.title, page.data.summary || '')}
        <Markdown>{page.data.content || ''}</Markdown>
      </div>
    );
  notFound();
}
