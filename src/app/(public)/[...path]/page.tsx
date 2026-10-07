import { headers } from 'next/headers';
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
import { ButtonLink, Reveal, ServiceIcon, Status } from '@/components/ui';
import { Markdown } from '@/components/markdown';
import { SubmissionForm } from '@/components/submission-form';
import { ProcessTimeline, ReportPreview, PublicationList } from '@/components/public-experiences';
import { lifecycle } from '@/lib/lifecycle';
import { Breadcrumbs, DetailSchema, pageMetadata } from '@/lib/seo';
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { path } = await params;
  const query = await searchParams;
  const module = (
    {
      careers: 'jobs',
      research: 'research',
      services: 'services',
      resources: 'resources',
      'case-studies': 'case_studies',
      industries: 'industries',
    } as Record<string, string>
  )[path[0]];
  const r =
    module && path[1]
      ? await getRecord(module, path[1], true)
      : !module
        ? await getRecord('pages', path[0], true)
        : undefined;
  const labels: Record<string, string> = {
    methodology: 'Our approach',
    about: 'Company',
    assessment: 'Request an assessment',
    research: 'Research',
    resources: 'Resources',
    services: 'Services',
    careers: 'Careers',
    security: 'Responsible disclosure',
    'sample-report': 'Sample report',
    'case-studies': 'Case studies',
  };
  return pageMetadata(
    '/' + path.join('/'),
    r?.data.seo_title || r?.title || labels[path[0]] || path[0].replaceAll('-', ' '),
    r?.data.seo_description || r?.data.summary,
    query.preview === 'true',
    r?.data.og_image
  );
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
  const nonce = (await headers()).get('x-nonce') || undefined;
  const [section, slug] = path;
  const detailSections = [
    'services',
    'research',
    'careers',
    'resources',
    'case-studies',
    'industries',
    'sample-report',
  ];
  if (
    path.length > 2 ||
    (path.length > 1 && !detailSections.includes(section)) ||
    (section === 'sample-report' && slug && query.preview !== 'true')
  )
    notFound();
  if (section === 'contact') redirect('/assessment');
  const previewPage =
    query.preview === 'true' &&
    ![
      'services',
      'research',
      'careers',
      'assessment',
      'resources',
      'case-studies',
      'industries',
    ].includes(section);
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
            <h2>Scoped by people. Tested by people.</h2>
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
            <SubmissionForm
              type="assessment"
              demo={isDemo}
              nonce={nonce}
              services={(await listRecords('services', true)).map((r) => r.title)}
            />
          )}
        </div>
      </div>
    );
  if (['resources', 'case-studies', 'industries'].includes(section)) {
    const module = section === 'case-studies' ? 'case_studies' : section;
    const rows = await listRecords(module, true);
    let r = rows.find((r) => r.slug === slug);
    if (slug && query.preview === 'true') {
      await requireUser(`${module}:read`);
      r = await getRecord(module, slug);
    }
    if (slug) {
      if (!r) notFound();
      const related = (await listRecords('services', true)).filter((x) =>
        String(r!.data.related_services || '')
          .split('\n')
          .includes(x.slug)
      );
      return (
        <article className="wrap section detail-page">
          <Breadcrumbs
            items={[
              { label: section.replaceAll('-', ' '), href: `/${section}` },
              { label: r.title, href: `/${section}/${r.slug}` },
            ]}
          />
          {query.preview === 'true' && (
            <div className="preview-banner">PRIVATE PREVIEW · Unpublished content</div>
          )}
          {intro(r.data.category || section.toUpperCase(), r.title, r.data.summary || '')}
          {query.preview !== 'true' && (
            <DetailSchema record={r} section={section} settings={settings} />
          )}
          {section === 'case-studies' ? (
            <>
              <div className="tag-row">
                {r.data.customer && <span>{r.data.customer}</span>}
                {r.data.anonymized && <span className="tiny-tag">ANONYMIZED</span>}
                {r.data.industry && <span>{r.data.industry}</span>}
              </div>
              {[
                'problem',
                'scope',
                'approach',
                'findings_summary',
                'business_outcome',
                'testimonial',
              ].map(
                (key) =>
                  r!.data[key] && (
                    <section className="xa-service-section" key={key}>
                      <h2>{key.replaceAll('_', ' ')}</h2>
                      <Markdown>{r!.data[key]}</Markdown>
                    </section>
                  )
              )}
            </>
          ) : (
            <Markdown>{r.data.content || ''}</Markdown>
          )}
          {r.data.download && <ButtonLink href={r.data.download}>Download resource</ButtonLink>}
          {related.length > 0 && (
            <div className="xa-related">
              <h2>Related services</h2>
              {related.map((x) => (
                <Link key={x.id} href={`/services/${x.slug}`} className="text-link">
                  {x.title} ↗
                </Link>
              ))}
            </div>
          )}
        </article>
      );
    }
    if (section !== 'resources' && !rows.length) notFound();
    return (
      <div className="wrap section">
        {intro(
          section === 'resources' ? 'THE RESOURCE LIBRARY' : 'FROM THE PRACTICE',
          section === 'resources'
            ? 'Knowledge you can\nput to work.'
            : section === 'case-studies'
              ? 'The work. The outcome.'
              : 'Systems in context.',
          section === 'resources'
            ? 'Technical articles, guides and resources. Published when there is something useful to share.'
            : 'Real contexts, clear scope and documented outcomes.'
        )}
        <h2 className="sr-only">Published entries</h2>
        <PublicationList records={rows} section={section} />
      </div>
    );
  }
  if (section === 'security') {
    const policy = settings.disclosure_policy_enabled
      ? await getRecord('pages', 'security', true)
      : undefined;
    return (
      <div className="wrap section narrow">
        {intro(
          'RESPONSIBLE DISCLOSURE',
          'Found a security issue?',
          'This page concerns suspected vulnerabilities in systems owned and operated by Xarmoured.'
        )}
        <div className="xa-service-section">
          <h2>Report it privately.</h2>
          {settings.security_email ? (
            <>
              <p>
                Send a concise description of the affected system, the behavior you observed and
                minimal reproduction steps. Please redact personal data and credentials.
              </p>
              <a className="text-link" href={`mailto:${settings.security_email}`}>
                {settings.security_email} ↗
              </a>
            </>
          ) : (
            <p>
              A dedicated security reporting contact has not been published yet. Use the configured{' '}
              <Link href="/contact" className="text-link">
                contact route
              </Link>{' '}
              to request a private reporting channel. Do not send sensitive evidence through the
              assessment form.
            </p>
          )}
        </div>
        <div className="xa-service-section">
          <h2>Respect the boundary.</h2>
          <p>
            This page does not authorize testing. Avoid accessing other people's data, service
            disruption, social engineering or testing third-party systems. Do not include secrets in
            an initial message.
          </p>
        </div>
        {policy?.data.content && <Markdown>{policy.data.content}</Markdown>}
        <p>No bounty, response deadline or testing authorization is offered by this page.</p>
      </div>
    );
  }
  if (['services', 'research', 'careers'].includes(section)) {
    const module = section === 'careers' ? 'jobs' : section;
    if (
      (section === 'careers' && settings.careers_enabled === false) ||
      (section === 'research' && settings.research_enabled === false)
    )
      notFound();
    const rows = await listRecords(module, true);
    const data = rows;
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
            <SubmissionForm type="application" jobId="general" demo={isDemo} nonce={nonce} />
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
          <Breadcrumbs
            items={[
              { label: section, href: `/${section}` },
              { label: r.title, href: `/${section}/${r.slug}` },
            ]}
          />
          {query.preview !== 'true' && (
            <DetailSchema record={r} section={section} settings={settings} />
          )}
          {intro(
            section === 'research'
              ? r.data.cve || 'ORIGINAL RESEARCH'
              : section === 'careers'
                ? `${r.data.department || 'CAREERS'} / ${r.data.location || 'Location to be confirmed'}`
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
                    r.data[k] != null &&
                    r.data[k] !== '' && (
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
                  <SubmissionForm
                    type="application"
                    jobId={r.id}
                    role={r.title}
                    demo={isDemo}
                    nonce={nonce}
                  />
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
                  'category',
                  'affected_version',
                  'fixed_version',
                  'publication_date',
                ].map(
                  (k) =>
                    r.data[k] != null &&
                    r.data[k] !== '' && (
                      <div key={k}>
                        <span className="eyebrow">{k.replaceAll('_', ' ')}</span>
                        <strong>{r.data[k]}</strong>
                      </div>
                    )
                )}
              </div>
              <Markdown>{r.data.content || ''}</Markdown>
              {r.data.disclosure_timeline && (
                <section className="xa-service-section">
                  <h2>Disclosure timeline</h2>
                  <Markdown>{r.data.disclosure_timeline}</Markdown>
                </section>
              )}
              {(r.data.advisory_url || r.data.github_advisory) && (
                <div className="references">
                  <h2>Advisories</h2>
                  {['advisory_url', 'github_advisory'].map(
                    (k) =>
                      r.data[k] != null &&
                      r.data[k] !== '' && (
                        <a key={k} href={r.data[k]} rel="noopener noreferrer">
                          {k === 'advisory_url' ? 'Vendor advisory' : 'GitHub advisory'} ↗
                        </a>
                      )
                  )}
                </div>
              )}
              {r.data.tags && <p className="mono">{r.data.tags}</p>}
              {r.data.related_services && (
                <div className="xa-related">
                  <h2>Related services</h2>
                  {(await listRecords('services', true))
                    .filter((x) => String(r.data.related_services).split('\n').includes(x.slug))
                    .map((x) => (
                      <Link className="text-link" key={x.id} href={`/services/${x.slug}`}>
                        {x.title} ↗
                      </Link>
                    ))}
                </div>
              )}
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
              {['problem', 'audience'].map(
                (key) =>
                  r.data[key] && (
                    <section key={key} className="xa-service-section">
                      <h2>{key === 'problem' ? 'The problem' : 'Who it is for'}</h2>
                      <Markdown>{r.data[key]}</Markdown>
                    </section>
                  )
              )}
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
              {['attack_paths', 'methodology', 'example_scope', 'process'].map(
                (key) =>
                  r.data[key] && (
                    <section key={key} className="xa-service-section">
                      <h2>
                        {
                          (
                            {
                              attack_paths: 'Common attack paths',
                              methodology: 'Testing methodology',
                              example_scope: 'Example scope',
                              process: 'Engagement process',
                            } as Record<string, string>
                          )[key]
                        }
                      </h2>
                      <Markdown>{r.data[key]}</Markdown>
                    </section>
                  )
              )}
              <section className="xa-service-section">
                <h2>What you receive</h2>
                <Markdown>
                  {r.data.deliverables ||
                    'A scoped report with validated findings, reproduction steps, demonstrated impact and remediation guidance. Deliverables are agreed before testing.'}
                </Markdown>
              </section>
              <section className="xa-service-section">
                <h2>Retesting</h2>
                <Markdown>
                  {r.data.retesting ||
                    'Agree on the retest scope and window during scoping. We repeat the original reproduction against the remediated version and document resolved, partially resolved or remaining findings.'}
                </Markdown>
                <Link className="text-link" href="/methodology">
                  Explore the engagement process ↗
                </Link>
              </section>
              {r.data.related_research && (
                <div className="xa-related">
                  <h2>Related research</h2>
                  {(await listRecords('research', true))
                    .filter((x) => String(r.data.related_research).split('\n').includes(x.slug))
                    .map((x) => (
                      <Link key={x.id} className="text-link" href={`/research/${x.slug}`}>
                        {x.title} ↗
                      </Link>
                    ))}
                </div>
              )}
              {r.data.related_services && (
                <div className="xa-related">
                  <h2>Related services</h2>
                  {(await listRecords('services', true))
                    .filter(
                      (x) =>
                        x.id !== r.id &&
                        String(r.data.related_services).split('\n').includes(x.slug)
                    )
                    .map((x) => (
                      <Link key={x.id} className="text-link" href={`/services/${x.slug}`}>
                        {x.title} ↗
                      </Link>
                    ))}
                </div>
              )}
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
        <h2 className="sr-only">
          {section === 'careers'
            ? 'Published positions'
            : section === 'services'
              ? 'Published services'
              : 'Published research'}
        </h2>
        {section === 'research' ? (
          <PublicationList records={data} />
        ) : data.length ? (
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
              {section === 'careers' ? 'NO OPEN ROLES' : 'SCOPE BEFORE TESTING'}
            </span>
            <h2>
              {section === 'careers' ? 'Good people. At the right time.' : 'Start with the system.'}
            </h2>
            <p>
              {section === 'careers'
                ? 'We don’t have an open role right now. Future opportunities will appear here.'
                : 'Discuss your assets, security objectives and testing boundaries with a practitioner. Published service details will appear here when enabled.'}
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
  if (section === 'methodology') {
    const page = await getRecord('pages', 'methodology', !previewPage);
    const home = await getRecord('pages', 'home', true);
    return (
      <div className="wrap section">
        {previewBanner}
        {intro(
          'THE XARMOURED APPROACH',
          page?.data.headline || 'Follow the evidence.\nVerify the boundary.',
          page?.data.summary ||
            'An assessment should explain how a system fails, what the failure permits and how to verify the fix. Every stage has a purpose. Every conclusion needs evidence.'
        )}
        <h2 className="sr-only">Engagement lifecycle</h2>
        <ProcessTimeline
          copy={['scope', 'map', 'test', 'validate', 'report', 'remediate', 'retest'].map(
            (k) => home?.data[`lifecycle_${k}`]
          )}
        />
        <div className="xa-methodology-intro">
          <h2>
            Authorization first.
            <br />
            Evidence throughout.
          </h2>
          <p>
            Before testing, agree on ownership, permitted techniques, exclusions, access,
            environments, windows and emergency contacts. Testing stays within those rules.
            Automated tools assist exploration; manual investigation establishes the context and
            validates exploitability.
          </p>
        </div>
        {page?.data.content && <Markdown>{page.data.content}</Markdown>}
        <div className="methodology-details">
          {lifecycle.map((x, i) => (
            <section className="methodology-detail" key={x[0]}>
              <span>0{i + 1}</span>
              <h2>{x[0]}</h2>
              <p>{home?.data[`lifecycle_${x[0].toLowerCase()}`] || x[2]}</p>
            </section>
          ))}
        </div>
        <div className="xa-method-notes">
          <div>
            <span className="eyebrow">RISK RATING</span>
            <h3>Severity needs context.</h3>
            <p>
              Use a documented CVSS vector alongside exploit preconditions, asset sensitivity and
              demonstrated impact. A technical score supports prioritization; it does not replace
              the engineering and business context.
            </p>
          </div>
          <div>
            <span className="eyebrow">EVIDENCE HANDLING</span>
            <h3>Capture only what is needed.</h3>
            <p>
              Agree on evidence storage, transfer and retention before testing. Minimize sensitive
              data in reproduction artifacts, redact secrets and explain coverage limitations in the
              final report.
            </p>
          </div>
          <div>
            <span className="eyebrow">ATTACK CHAINING</span>
            <h3>Follow relationships.</h3>
            <p>
              Where authorized, investigate how smaller weaknesses combine into a meaningful attack
              path. Stop at the agreed proof point, communicate urgent risk and preserve
              reproducibility.
            </p>
          </div>
          <div>
            <span className="eyebrow">CLOSURE</span>
            <h3>A retest is a result.</h3>
            <p>
              Record the tested version, original test, observed behavior and residual limitations.
              Distinguish resolved findings from partial fixes and items not retested.
            </p>
          </div>
        </div>
        <span className="eyebrow">FRAMEWORK REFERENCES / SELECTED TO FIT THE SCOPE</span>
        <div className="xa-reference-grid">
          {[
            ['OWASP WSTG', 'https://owasp.org/www-project-web-security-testing-guide/'],
            ['OWASP API Security', 'https://owasp.org/API-Security/'],
            ['OWASP MASVS & MASTG', 'https://mas.owasp.org/'],
            ['CWE', 'https://cwe.mitre.org/'],
            ['CVSS', 'https://www.first.org/cvss/'],
            ['NIST SP 800-115', 'https://csrc.nist.gov/pubs/sp/800/115/final'],
          ].map(([label, url]) => (
            <a key={label} href={url} rel="noopener noreferrer">
              {label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          ))}
        </div>
        <p>
          Frameworks inform coverage where applicable. Referencing a framework does not imply
          certification or endorsement.
        </p>
        <div className="xa-related">
          <ButtonLink href="/assessment">Define your assessment</ButtonLink>
        </div>
      </div>
    );
  }
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
            Evidence first.
            <br />
            Engineering throughout.
          </h2>
          <p>
            We care about the work behind the report. Understanding a system. Challenging its
            assumptions. Turning a finding into something an engineer can fix.
          </p>
        </div>
        <div className="xa-company-principles">
          {[
            [
              'Investigate honestly.',
              'State what was tested, what was observed and what remains uncertain.',
            ],
            [
              'Make the work reproducible.',
              'Clear evidence is useful to both the engineer fixing a flaw and the reviewer assessing risk.',
            ],
            [
              'Share responsibly.',
              'Coordinate disclosure, respect confidentiality and publish only what is ready to be shared.',
            ],
            [
              'Finish the loop.',
              'Help teams understand the cause and verify remediation against the original failure.',
            ],
          ].map(([t, p]) => (
            <div key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
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
                    r.data[k] != null &&
                    r.data[k] !== '' && (
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
        <h2 className="sr-only">Report anatomy</h2>
        <ReportPreview />
        {r ? (
          <div className="report-download xa-related">
            <h2>{r.title}</h2>
            <p>{r.data.description}</p>
            <span className="mono">
              VERSION {r.data.version} · Updated{' '}
              {new Date(r.updated_at).toLocaleDateString('en-GB')}
            </span>
            {r.data.file && <ButtonLink href={r.data.file}>Download sample report</ButtonLink>}
          </div>
        ) : (
          <div className="public-empty xa-related">
            <h2>Discuss the reporting format.</h2>
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
