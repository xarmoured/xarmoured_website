import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Check, Crosshair, GitBranch, FileCheck2 } from 'lucide-react';
import { Reveal, ButtonLink } from '@/components/ui';
import { AttackDiagram } from '@/components/attack-diagram';
import {
  CapabilityExplorer,
  ProcessTimeline,
  ReportPreview,
} from '@/components/public-experiences';
import { listRecords, requireUser, getRecord, siteSettings, isDemo } from '@/lib/server';
import { initialHome } from '@/lib/demo';
import { Markdown } from '@/components/markdown';
import { pageMetadata } from '@/lib/seo';
import { researchAttribution } from '@/lib/capabilities';
import { MaturityTag, ProtocolComponentGrid, AudiencePaths } from '@/components/protocol';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const query = await searchParams;
  const home = (await listRecords('pages', true)).find((r) => r.slug === 'home');
  return pageMetadata(
    '/',
    home?.data.seo_title || 'Xarmoured — Cybersecurity Engineering, Offensive Security & Research',
    home?.data.seo_description ||
      'Xarmoured is an independent cybersecurity engineering company combining offensive security, defensive engineering and research, and building Protocol, its security engineering platform.',
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
  const [settings, pages, services, research, faqs, cases] = await Promise.all([
    siteSettings(),
    listRecords('pages', true),
    listRecords('services', true),
    listRecords('research', true),
    listRecords('faqs', true),
    listRecords('case_studies', true),
  ]);
  const h = (previewHome || pages.find((r) => r.slug === 'home') || initialHome).data;
  return (
    <>
      {query.preview === 'true' && (
        <div className="preview-banner wrap">PRIVATE HOMEPAGE PREVIEW · Unpublished content</div>
      )}
      <section className="xa-hero wrap">
        <div className="xa-hero-copy">
          <span className="eyebrow">
            <i className="signal-dot" />
            {h.eyebrow || 'OFFENSIVE SECURITY · DEFENSIVE ENGINEERING · RESEARCH'}
          </span>
          <h1>{h.headline || 'Engineering security\nfrom both sides of the attack.'}</h1>
          <p>{h.summary}</p>
          <div className="button-row">
            <ButtonLink href={h.primary_url || '/assessment'}>
              {h.primary_label || 'Request an Assessment'}
            </ButtonLink>
            <Link className="text-link" href={h.secondary_url || '/protocol'}>
              {h.secondary_label || 'Explore Protocol'}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="xa-hero-assurance">
            <span>
              <Check size={14} aria-hidden="true" />
              Manual testing
            </span>
            <span>
              <Check size={14} aria-hidden="true" />
              Reproducible evidence
            </span>
            <span>
              <Check size={14} aria-hidden="true" />
              Retest verification
            </span>
          </div>
        </div>
        <div className="xa-hero-visual">
          <AttackDiagram />
        </div>
        <div className="xa-hero-foot">
          <span className="mono">ASSUMPTION → EVIDENCE → CONFIDENCE</span>
          <span>
            Look closer. Go deeper. <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </section>
      <div className="xa-proof wrap" aria-label="Engagement principles">
        {[
          'Manual validation',
          'Contextual severity',
          'Reproducible evidence',
          'Engineering-ready remediation',
          'Retest verification',
        ].map((x) => (
          <span key={x}>
            <span className="xa-proof-mark" aria-hidden="true">
              ↗
            </span>
            {x}
          </span>
        ))}
      </div>
      {h.show_who !== false && (
        <section className="xa-section wrap xa-home-who">
          <span className="eyebrow">01 / WHO WE ARE</span>
          <h2>{'An independent security\nengineering company.'}</h2>
          <p>
            Xarmoured is founder-led and based in India, working remotely. Today we test web
            applications, APIs and Android apps. We are building defensive engineering capability
            and our own platform, Protocol, on the same evidence. We are growing deliberately, and
            we say plainly which parts are available now and which are still being built.
          </p>
          <Link href="/about" className="text-link">
            About Xarmoured <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>
      )}
      {h.show_problem !== false && (
        <section className="xa-section wrap xa-problem">
          <div>
            <span className="eyebrow">02 / BEYOND THE FINDING</span>
            <h2>
              A signal is the start.
              <br />
              <span className="xa-muted-heading">
                Evidence changes
                <br />
                the decision.
              </span>
            </h2>
            <p>
              Scanners help identify potential weaknesses. Understanding whether a weakness can be
              exploited takes context: who has access, what the system trusts, and what happens when
              that trust fails.
            </p>
            <Link href="/methodology" className="text-link">
              See how we validate risk <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="xa-evidence-comparison">
            <div className="xa-comparison-head">
              <span className="mono">A POTENTIAL FINDING</span>
              <Crosshair size={18} aria-hidden="true" />
            </div>
            <h3>An endpoint may expose data.</h3>
            <p>
              A useful lead. The access conditions and actual impact still need to be established.
            </p>
            <div className="xa-evidence-rule">
              <span>TEST THE ASSUMPTION</span>
              <ArrowRight size={17} aria-hidden="true" />
            </div>
            <div className="xa-comparison-head">
              <span className="mono">A VALIDATED ATTACK PATH</span>
              <GitBranch size={18} aria-hidden="true" />
            </div>
            <h3>Identity → authorization → impact.</h3>
            <dl>
              {[
                ['Context', 'Identify the role and preconditions.'],
                ['Evidence', 'Reproduce the boundary failure.'],
                ['Impact', 'Demonstrate what becomes accessible.'],
                ['Resolution', 'Fix the cause. Verify the result.'],
                ['Improvement', 'Record the retest. Measure what changed.'],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt>{a}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>
            <span className="xa-tag">ILLUSTRATIVE TESTING LOGIC</span>
          </div>
        </section>
      )}
      {h.show_services !== false && services.length > 0 && (
        <section className="xa-section wrap">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">03 / OFFENSIVE SECURITY, AVAILABLE NOW</span>
              <h2>{h.services_heading || 'Different systems.\nThe same depth of attention.'}</h2>
            </div>
            <div>
              <MaturityTag maturity="available" />
              <p>Scope follows your system. Testing follows the paths an attacker could take.</p>
            </div>
          </div>
          <CapabilityExplorer services={services} />
        </section>
      )}
      {h.show_defensive !== false && (
        <section className="wrap xa-section xa-home-defensive">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">04 / DEFENSIVE ENGINEERING</span>
              <h2>{'Where findings\nlead next.'}</h2>
            </div>
            <MaturityTag maturity="development" />
          </div>
          <p className="xa-home-who">
            Every confirmed attack path raises a second question: would anyone have noticed? We are
            expanding into defensive security to help answer it, through detection validation and
            threat hunting built on what offensive work reveals.
          </p>
          <div className="xa-company-principles">
            <div>
              <h3>Detection validation.</h3>
              <p>
                Test whether existing controls detect the techniques that matter, and record the
                gaps.
              </p>
            </div>
            <div>
              <h3>Threat hunting.</h3>
              <p>Hypothesis-led hunts informed by research and by what our assessments uncover.</p>
            </div>
          </div>
          <div className="xa-notice xa-defensive-note" role="note">
            <MaturityTag maturity="development" />
            <span>
              This capability is being built. Xarmoured does not currently offer defensive services,
              monitoring, SOC, MDR or 24/7 detection and response.
            </span>
          </div>
        </section>
      )}
      {h.show_protocol !== false && (
        <section className="wrap xa-section xa-home-protocol">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">05 / PROTOCOL</span>
              <h2>{'Evidence that follows\nthe fix all the way through.'}</h2>
            </div>
            <MaturityTag maturity="development" />
          </div>
          <p className="xa-home-who">
            Protocol is the security engineering platform we are developing to connect offensive
            assessments, adversary simulation, defensive validation and security intelligence. It
            starts from what every engagement already produces: findings, evidence, remediation and
            retests. It is under active development and is not yet available.
          </p>
          <ProtocolComponentGrid compact />
          <div className="button-row">
            <ButtonLink href="/protocol">Explore Protocol</ButtonLink>
          </div>
        </section>
      )}
      {h.show_research !== false && settings.research_enabled !== false && (
        <section className="wrap xa-section xa-home-research">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">06 / RESEARCH & DISCLOSURE</span>
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
                  {researchAttribution(r.data) && (
                    <span className="xa-attribution">{researchAttribution(r.data)}</span>
                  )}
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
      {h.show_lifecycle !== false && (
        <section className="xa-lifecycle-section">
          <div className="wrap xa-section">
            <div className="xa-section-heading">
              <div>
                <span className="eyebrow">07 / THE XARMOURED ENGAGEMENT</span>
                <h2>
                  Find the path.
                  <br />
                  Close the loop.
                </h2>
              </div>
              <Link href="/methodology" className="text-link">
                The full methodology <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <ProcessTimeline
              copy={['scope', 'map', 'test', 'validate', 'report', 'remediate', 'retest'].map(
                (k) => h[`lifecycle_${k}`]
              )}
            />
          </div>
        </section>
      )}
      {h.show_principles !== false && (
        <section className="wrap xa-section xa-principles">
          <div>
            <span className="eyebrow">08 / HOW WE THINK</span>
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
      {h.show_report !== false && settings.sample_report_enabled !== false && (
        <section className="wrap xa-section xa-deliverables">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">09 / THE DELIVERABLE</span>
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
      {h.show_industries !== false && (
        <section className="wrap xa-section">
          <span className="eyebrow">WHO WE WORK WITH</span>
          <h2>Security in your environment.</h2>
          <AudiencePaths />
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
        <span className="eyebrow">FIND → UNDERSTAND → FIX → VERIFY</span>
        <h2>{h.final_cta || 'Put your security\nassumptions to the test.'}</h2>
        <div className="button-row">
          <ButtonLink href="/assessment">Request an Assessment</ButtonLink>
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
