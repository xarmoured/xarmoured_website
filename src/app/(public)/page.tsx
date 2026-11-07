import Link from 'next/link';
import { ArrowUpRight, ArrowRight, FileCheck2 } from 'lucide-react';
import { Reveal, ButtonLink } from '@/components/ui';
import { AttackDiagram } from '@/components/attack-diagram';
import { ProcessTimeline } from '@/components/public-experiences';
import { listRecords, requireUser, getRecord, siteSettings, isDemo } from '@/lib/server';
import { initialHome } from '@/lib/demo';
import { pageMetadata } from '@/lib/seo';
import { researchAttribution } from '@/lib/capabilities';
import { MaturityTag, AvailableServices } from '@/components/protocol';
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
  const [settings, pages, services, research] = await Promise.all([
    siteSettings(),
    listRecords('pages', true),
    listRecords('services', true),
    listRecords('research', true),
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
          <h1>
            {String(h.headline || 'Engineering security from both sides of the attack.').replace(
              /\s*\n\s*/g,
              ' '
            )}
          </h1>
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
      <div className="xa-proof wrap" aria-label="How we test">
        {[
          'Manual-first testing',
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
      {h.show_services !== false && (
        <section className="xa-section wrap">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">01 / SERVICES</span>
              <h2>{h.services_heading || 'Four services.\nOne standard of evidence.'}</h2>
            </div>
            <div>
              <MaturityTag maturity="available" />
              <p>Scope follows your system. Testing follows the paths an attacker could take.</p>
            </div>
          </div>
          <AvailableServices services={services} />
        </section>
      )}
      {h.show_lifecycle !== false && (
        <section className="xa-lifecycle-section">
          <div className="wrap xa-section">
            <div className="xa-section-heading">
              <div>
                <span className="eyebrow">02 / HOW WE WORK</span>
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
            <p className="xa-how-intro">
              Scanners help identify potential weaknesses. Understanding whether a weakness can be
              exploited takes context: who has access, what the system trusts, and what happens when
              that trust fails.
            </p>
            <ProcessTimeline
              copy={['scope', 'map', 'test', 'validate', 'report', 'remediate', 'retest'].map(
                (k) => h[`lifecycle_${k}`]
              )}
            />
            <div className="xa-how-values">
              {[
                [
                  'Manual validation.',
                  'Authorization, business logic and attack chaining are tested by people, not inferred from scanner output.',
                ],
                [
                  'Meaningful evidence.',
                  'Each finding records the conditions, the reproduction and the real impact, and states the limits of the assessment.',
                ],
                [
                  'Verified remediation.',
                  'Engineers get a clear path to fix the cause. We then test the fix against the original path.',
                ],
              ].map(([t, p]) => (
                <div key={t}>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {h.show_protocol !== false && (
        <section className="wrap xa-section xa-home-protocol">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">03 / PROTOCOL</span>
              <h2>
                Evidence that follows
                <br />
                the fix all the way through.
              </h2>
            </div>
            <MaturityTag maturity="development" />
          </div>
          <p className="xa-home-who">
            Protocol is the security engineering platform Xarmoured is developing, built around the
            lifecycle every engagement already follows. It is under active development and is not
            yet available.
          </p>
          <p className="xa-lifecycle-line mono">
            Evidence → Finding → Remediation → Retest → Measured improvement
          </p>
          <Link className="text-link" href="/protocol">
            Explore Protocol <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>
      )}
      {h.show_research !== false && settings.research_enabled !== false && (
        <section className="wrap xa-section xa-home-research">
          <div className="xa-section-heading">
            <div>
              <span className="eyebrow">04 / RESEARCH</span>
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
      <section className="xa-final-cta wrap">
        <span className="eyebrow">FIND → UNDERSTAND → FIX → VERIFY</span>
        <h2>{h.final_cta || 'Have an application\nthat needs testing?'}</h2>
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
