import Link from 'next/link';
import { ArrowUpRight, ArrowRight, FileCheck2 } from 'lucide-react';
import { Reveal, ButtonLink } from '@/components/ui';
import { LoopDiagram } from '@/components/loop-diagram';
import {
  CapabilityExplorer,
  ProcessTimeline,
  ReportPreview,
} from '@/components/public-experiences';
import { listRecords, requireUser, getRecord, siteSettings, isDemo } from '@/lib/server';
import { initialHome } from '@/lib/demo';
import { Markdown } from '@/components/markdown';
import { pageMetadata } from '@/lib/seo';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const query = await searchParams;
  return pageMetadata(
    '/',
    'Xarmoured — Think like an attacker. Engineer for resilience.',
    'Xarmoured is an independent, engineering-driven cybersecurity company: attack research, manual security assessments, practical remediation engineering and security posture software in development.',
    query.preview === 'true'
  );
}
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const query = await searchParams;
  let previewHome;
  if (query.preview === 'true') {
    await requireUser('pages:read');
    previewHome = await getRecord('pages', 'home');
  }
  const [settings, pages, services, research, faqs, cases, industries] = await Promise.all([
    siteSettings(),
    listRecords('pages', true),
    listRecords('services', true),
    listRecords('research', true),
    listRecords('faqs', true),
    listRecords('case_studies', true),
    listRecords('industries', true),
  ]);
  const h = (previewHome || pages.find((r) => r.slug === 'home') || initialHome).data;
  return (
    <>
      {query.preview === 'true' && (
        <div className="preview-banner wrap">PRIVATE HOMEPAGE PREVIEW · Unpublished content</div>
      )}
      <section className="xa-hero xe-hero wrap">
        <div className="xa-hero-copy">
          <span className="eyebrow">
            <i className="signal-dot" />
            Think like an attacker. Engineer for resilience.
          </span>
          <h1 className="xe-tagline">
            <span>Security Engineering for the Systems Attackers Target.</span>
          </h1>
          <p>
            We uncover exploitable weaknesses, research emerging attack techniques, and engineer
            practical security improvements for modern applications and infrastructure.
          </p>
          <div className="button-row">
            <ButtonLink href="/assessment">Talk to an Engineer</ButtonLink>
            <Link className="text-link" href="/services">
              Explore Capabilities
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="xa-hero-visual">
          <LoopDiagram />
        </div>
        <div className="xa-hero-foot">
          <span>Independent, with no vendor to sell.</span>
          <span>Engineering-led, from finding to verified fix.</span>
          <span>Remote-first, based in India.</span>
        </div>
      </section>
      <section className="xa-section wrap xe-intro">
        <h2>Attack research, engineering and software in one practice.</h2>
        <p>
          Xarmoured is an independent, founder-led cybersecurity company. Offensive testing shows
          what an attacker can do, research explains how, engineering turns the finding into a fix
          that holds, and our software keeps that knowledge usable after the engagement ends.
        </p>
      </section>
      <section className="xa-section wrap xe-disciplines">
        <div className="xa-section-heading">
          <div>
            <h2>Four capability areas.</h2>
          </div>
          <p>Each one links to what we deliver today and what is still in development.</p>
        </div>
        {[
          ['Offensive Security', 'Manual testing of web applications, APIs and Android apps for exploitable authentication, authorization and business-logic flaws.', '/services', 'Explore offensive security'],
          ['Defensive & Security Engineering', 'Remediation guidance for the engineers who ship the fix, secure architecture review, and retesting to verify the attack path is closed.', '/methodology', 'See the engineering approach'],
          ['AI Security (emerging)', 'LLM application, prompt injection, RAG and agent security. A research-stage capability that we describe as such, not as established delivery.', '/research', 'Follow the research'],
          ['Security Products', 'ExploitLedger, our assessment and remediation management platform. Further products stay labelled as research or development.', '/platform', 'Explore the platform'],
        ].map(([name, body, href, cta]) => (
          <Link className="xe-row" href={href} key={name}>
            <h3>{name}</h3>
            <div>
              <p>{body}</p>
            </div>
            <span className="text-link">
              {cta} <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>
      {h.show_services !== false && services.length > 0 && (
        <section className="xa-section wrap">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">Assessments</span>
              <h2>{h.services_heading || 'Different systems.\nThe same depth of attention.'}</h2>
            </div>
            <p>Scope follows your system. Testing follows the paths an attacker could take.</p>
          </div>
          <CapabilityExplorer services={services} />
        </section>
      )}
      <section className="xa-lifecycle-section">
        <div className="wrap xa-section">
          <h2>Research, attack, validate, engineer, verify.</h2>
          <ol className="xe-method">
            <li><strong>Research</strong><span>Study emerging attack techniques and how real systems fail.</span></li>
            <li><strong>Attack</strong><span>Test your system manually, along the paths an attacker would take.</span></li>
            <li><strong>Validate</strong><span>Prove each finding is exploitable and record reproducible evidence.</span></li>
            <li><strong>Engineer</strong><span>Fix the underlying cause with guidance written for your developers.</span></li>
            <li><strong>Verify</strong><span>Retest the original attack path and report whether it is closed.</span></li>
          </ol>
          <Link href="/methodology" className="text-link">
            The full methodology <ArrowUpRight size=17 aria-hidden="true" />
          </Link>
        </div>
      </section>
      {h.show_principles !== false && (
        <section className="wrap xa-section xa-principles">
          <div>
            <span className="eyebrow">How we think</span>
            <h2>
              The work behind
              <br />
              the confidence.
            </h2>
            <p>
              Security testing is an engineering conversation. The finding matters. What your team
              can do with it matters just as much.
            </p>
          </div>
          <div>
            {[
              [
                '01',
                'Depth over checklists.',
                'Explore business logic, authorization boundaries and the interaction between components.',
              ],
              [
                '02',
                'Evidence over assumptions.',
                'Validate the behavior, document the conditions and state the limits of the assessment.',
              ],
              [
                '03',
                'Resolution over volume.',
                'Give engineers a clear path to fix the underlying cause, then test that fix.',
              ],
            ].map(([n, t, p]) => (
              <div className="xa-principle" key={n}>
                <span className="mono">{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="wrap xa-section xe-platform">
        <div>
          <span className="xa-tag">PRODUCT · IN DEVELOPMENT</span>
          <h2>ExploitLedger</h2>
          <p>
            An AI-assisted vulnerability assessment and remediation management platform. Product
            screenshots will be published here once they are ready for public release.
          </p>
          <div className="button-row">
            <ButtonLink href="/platform">Product overview</ButtonLink>
            <Link className="text-link" href="/assessment">
              Request a demo <ArrowUpRight size=17 aria-hidden="true" />
            </Link>
          </div>
        </div>
        <ul className="xe-feature-list">
            <li>Engagement management</li>
            <li>Asset management</li>
            <li>Vulnerability tracking</li>
            <li>OWASP-based assessment workflows</li>
            <li>Evidence management and integrity</li>
            <li>CWE classification</li>
            <li>CVSS scoring</li>
            <li>Remediation tracking</li>
            <li>Retesting workflows</li>
            <li>Organizational separation and access control</li>
        </ul>
      </section>
      {h.show_research !== false && settings.research_enabled !== false && (
        <section className="wrap xa-section xa-home-research">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">Research and disclosure</span>
              <h2>{h.research_heading || 'Questions worth\nfollowing further.'}</h2>
            </div>
            <Link href="/research" className="text-link">
              Research journal <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {research.length ? (
            research.slice(0, 3).map((r) => (
              <Link className="xa-research-row" href={`/research/${r.slug}`} key={r.id}>
                <span className="mono">
                  {r.data.cve || r.data.advisory || r.data.category || 'RESEARCH'}
                </span>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.data.summary}</p>
                </div>
                {r.data.severity && (
                  <span className={`xa-severity severity-${r.data.severity}`}>
                    {r.data.severity}
                  </span>
                )}
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            ))
          ) : (
            <div className="xa-research-holding">
              <span className="xa-journal-mark" aria-hidden="true">
                [ ↗ ]
              </span>
              <div>
                <span className="eyebrow">EVIDENCE BEFORE PUBLICATION</span>
                <h3>Research follows the evidence.</h3>
                <p>
                  New findings will appear after responsible disclosure. Until then, explore the
                  process behind the work.
                </p>
              </div>
              <Link href="/methodology" className="text-link">
                Our approach <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
      )}
      {h.show_report !== false && settings.sample_report_enabled !== false && (
        <section className="wrap xa-section xa-deliverables">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">The deliverable</span>
              <h2>
                Built to be understood.
                <br />
                Ready to be acted on.
              </h2>
            </div>
            <p>
              Executive clarity. Technical evidence. A practical path from finding to verified
              remediation.
            </p>
          </div>
          <ReportPreview />
          <Link className="text-link" href="/sample-report">
            Explore our reporting <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>
      )}
      {h.show_case_studies !== false && cases.length > 0 && (
        <section className="wrap xa-section">
          <span className="eyebrow">ENGAGEMENT OUTCOMES</span>
          <h2>Evidence from the work.</h2>
          {cases
            .sort((a, b) => Number(Boolean(b.data.featured)) - Number(Boolean(a.data.featured)))
            .slice(0, 3)
            .map((r) => (
              <Link className="xa-research-row" key={r.id} href={`/case-studies/${r.slug}`}>
                <span className="mono">{r.data.industry}</span>
                <h3>{r.title}</h3>
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            ))}
        </section>
      )}
      {h.show_industries !== false && industries.length > 0 && (
        <section className="wrap xa-section">
          <span className="eyebrow">Solutions</span>
          <h2>Security in your environment.</h2>
          <div className="xa-use-cases">
            {industries.map((r) => (
              <Link key={r.id} href={`/industries/${r.slug}`}>
                <h3>{r.title}</h3>
                <p>{r.data.summary}</p>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
      {h.show_faq !== false && faqs.length > 0 && (
        <section className="wrap xa-section faq-section">
          <div>
            <span className="eyebrow">BEFORE WE BEGIN</span>
            <h2>
              Good questions.
              <br />
              Clear answers.
            </h2>
          </div>
          <div>
            {faqs.slice(0, 6).map((f) => (
              <details key={f.id}>
                <summary>
                  {f.title}
                  <span aria-hidden="true">+</span>
                </summary>
                <Markdown>{f.data.answer || ''}</Markdown>
              </details>
            ))}
          </div>
        </section>
      )}
      {h.show_careers !== false && settings.careers_enabled !== false && (
        <div className="careers-callout wrap">
          <span>Curiosity is part of the practice.</span>
          <Link href="/careers">
            Work with Xarmoured <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
      <section className="xa-final-cta wrap">
        <span className="eyebrow">Research, assess, engineer, build</span>
        <h2>Build with security in mind. Validate against real-world threats.</h2>
        <div className="button-row">
          <ButtonLink href="/assessment">Talk to an Engineer</ButtonLink>
          {settings.sales_email && (
            <a className="text-link" href={`mailto:${settings.sales_email}`}>
              {settings.sales_email}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
        <FileCheck2 className="xa-cta-art" size={150} strokeWidth={0.5} aria-hidden="true" />
      </section>
    </>
  );
}
