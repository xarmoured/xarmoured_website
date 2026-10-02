import Link from 'next/link';
import { ArrowUpRight, Check, ArrowRight } from 'lucide-react';
import { Reveal, ButtonLink, ServiceIcon } from '@/components/ui';
import { AttackDiagram } from '@/components/attack-diagram';
import {
  listRecords,
  requireUser,
  getRecord,
  configured,
  isDemo,
  siteSettings,
} from '@/lib/server';
import { initialHome, defaultServices, defaultFaqs } from '@/lib/demo';
export async function generateMetadata() {
  const seo = (await listRecords('seo', true))[0]?.data || {};
  return {
    title: {
      absolute: seo.default_title || 'Xarmoured — Penetration Testing & Security Engineering',
    },
    description: seo.description,
    openGraph: { images: seo.og_image ? [seo.og_image] : [] },
  };
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
  const settings = await siteSettings();
  const [pages, serviceRows, research, faqRows] = await Promise.all([
    listRecords('pages', true),
    listRecords('services', true),
    listRecords('research', true),
    listRecords('faqs', true),
  ]);
  const h = (previewHome || pages.find((r) => r.slug === 'home') || initialHome).data;
  const services = serviceRows.length || (configured && !isDemo) ? serviceRows : defaultServices;
  const faqs = faqRows.length || (configured && !isDemo) ? faqRows : defaultFaqs;
  return (
    <>
      {query.preview === 'true' && (
        <div className="preview-banner wrap">PRIVATE HOMEPAGE PREVIEW · Unpublished content</div>
      )}
      <section className="hero wrap">
        <Reveal className="hero-copy">
          <span className="eyebrow">
            <i className="signal-dot" />
            {h.eyebrow}
          </span>
          <h1>{h.headline}</h1>
          <p>{h.summary}</p>
          <div className="button-row">
            <ButtonLink href={h.primary_url || '/assessment'}>
              {h.primary_label || 'Request an assessment'}
            </ButtonLink>
            <Link className="text-link" href={h.secondary_url || '/methodology'}>
              {h.secondary_label || 'Explore our approach'}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <Check size={13} /> Manual-first testing
            </span>
            <span>
              <Check size={13} /> Evidence. Not guesswork.
            </span>
          </div>
        </Reveal>
        <Reveal className="hero-visual" delay={0.1}>
          <AttackDiagram />
        </Reveal>
        <div className="hero-foot">
          <span className="mono">SECURITY THAT GOES BELOW THE SURFACE</span>
          <span>
            Built by practitioners. For builders. <span className="accent">↓</span>
          </span>
        </div>
      </section>
      <section className="services-section section wrap">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">01 / WHAT WE TEST</span>
            <h2>{h.services_heading || 'Your attack surface.\nOur starting point.'}</h2>
          </div>
          <p>
            Every engagement is scoped by a tester. We follow real attack paths, challenge business
            logic, and validate what actually matters.
          </p>
        </Reveal>
        <div className="service-grid">
          {services
            .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
            .map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 0.05}>
                <Link href={`/services/${s.slug}`} className="service-item">
                  <div className="service-top">
                    <ServiceIcon name={s.data.icon} />
                    <span className="mono">0{i + 1}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.data.summary}</p>
                  <span className="service-arrow">
                    <ArrowUpRight size={19} />
                  </span>
                </Link>
              </Reveal>
            ))}
        </div>
      </section>
      <section className="manifesto">
        <Reveal className="wrap manifesto-inner">
          <span className="eyebrow">THE DIFFERENCE IS IN THE DEPTH.</span>
          <h2>
            Tools find signals.
            <br />
            <span>People find the story.</span>
          </h2>
          <p>
            A scanner sees an endpoint. A practitioner asks who can access it, what it trusts, and
            what happens when those assumptions fail.
          </p>
          <Link className="text-link" href="/methodology">
            Meet our methodology <ArrowUpRight size={17} />
          </Link>
        </Reveal>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / FROM SCOPE TO CERTAINTY</span>
            <h2>Clarity at every step.</h2>
          </div>
          <p>
            A focused process. Clear communication. No mystery between kickoff and the final retest.
          </p>
        </div>
        <div className="methodology-line">
          {[
            ['01', 'Scope & threat model', 'Understand your systems, goals, and trust boundaries.'],
            ['02', 'Test & validate', 'Manual testing. Real evidence. Confirmed business impact.'],
            ['03', 'Report & remediate', 'Reproducible findings your engineers can act on.'],
            ['04', 'Retest & verify', 'Test the fix. Document the result. Close the loop.'],
          ].map((x) => (
            <Reveal key={x[0]}>
              <span className="step-number">{x[0]}</span>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
            </Reveal>
          ))}
        </div>
      </section>
      {h.show_research !== false && settings.research_enabled !== false && (
        <section className="section wrap research-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">03 / XARMOURED RESEARCH</span>
              <h2>{h.research_heading || 'From curiosity to disclosure.'}</h2>
            </div>
            <Link href="/research" className="text-link">
              Explore research <ArrowUpRight size={17} />
            </Link>
          </div>
          {research.length ? (
            <div className="research-list">
              {research.slice(0, 3).map((r) => (
                <Link className="editorial-row" href={`/research/${r.slug}`} key={r.id}>
                  <span className="mono">{r.data.cve || 'RESEARCH'}</span>
                  <h3>{r.title}</h3>
                  <span>{r.data.severity}</span>
                  <ArrowUpRight size={22} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="research-empty">
              <span className="research-glyph">[↗]</span>
              <div>
                <h3>Good research takes time.</h3>
                <p>
                  We share original findings after responsible disclosure. Our first publications
                  will appear here.
                </p>
              </div>
              <Link className="text-link" href="/about">
                Meet the practice <ArrowUpRight size={17} />
              </Link>
            </div>
          )}
        </section>
      )}
      <section className="section wrap deliverables">
        <Reveal>
          <span className="eyebrow">04 / THE WORK DOESN’T END AT A FINDING</span>
          <h2>
            A report your team
            <br />
            can actually use.
          </h2>
          <p>
            Executive clarity for decision makers. Technical depth for the people shipping the fix.
          </p>
          {h.show_report !== false && settings.sample_report_enabled !== false && (
            <ButtonLink href="/sample-report" secondary>
              Explore our deliverables
            </ButtonLink>
          )}
        </Reveal>
        <Reveal className="report-preview">
          <div className="report-bar">
            <span className="mono">XARMOURED / REPORT STRUCTURE</span>
            <span className="tiny-tag">ILLUSTRATIVE</span>
          </div>
          <h3>From finding to resolution.</h3>
          {[
            ['01', 'Business impact', 'Understand what is at risk.'],
            ['02', 'Reproducible evidence', 'See exactly how it happens.'],
            ['03', 'Remediation guidance', 'Give engineers a clear next step.'],
            ['04', 'Retest verification', 'Confirm that the boundary holds.'],
          ].map((x) => (
            <div className="report-line" key={x[0]}>
              <span>{x[0]}</span>
              <div>
                <strong>{x[1]}</strong>
                <p>{x[2]}</p>
              </div>
              <Check size={16} />
            </div>
          ))}
        </Reveal>
      </section>
      <section className="section wrap faq-section">
        <div>
          <span className="eyebrow">BEFORE WE BEGIN</span>
          <h2>A few good questions.</h2>
        </div>
        <div>
          {faqs.slice(0, 6).map((f) => (
            <details key={f.id}>
              <summary>
                {f.title}
                <span>+</span>
              </summary>
              <p>{f.data.answer}</p>
            </details>
          ))}
        </div>
      </section>
      {h.show_careers !== false && settings.careers_enabled !== false && (
        <div className="careers-callout wrap">
          <span>Curious minds belong here.</span>
          <Link href="/careers">
            Build with Xarmoured <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      {h.show_labs && settings.labs_enabled && (
        <div className="careers-callout wrap">
          <span>Tools born from the work.</span>
          <Link href="/labs">
            Explore Xarmoured Labs <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      <section className="final-cta wrap">
        <Reveal>
          <span className="eyebrow">LET’S TEST YOUR ASSUMPTIONS.</span>
          <h2>{h.final_cta}</h2>
          <ButtonLink href="/assessment">Start a conversation</ButtonLink>
        </Reveal>
        <span className="cta-watermark" aria-hidden="true">
          X
        </span>
      </section>
    </>
  );
}
