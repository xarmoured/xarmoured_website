import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { RecordData } from '@/lib/modules';
import {
  currentServices,
  type Maturity,
  maturityLabel,
  evidenceLifecycle,
  validationLoop,
  protocolComponents,
  direction,
} from '@/lib/capabilities';

/** Text label first, colour second: status never relies on colour alone. */
export function MaturityTag({ maturity }: { maturity: Maturity }) {
  return <span className={`xa-maturity xa-maturity-${maturity}`}>{maturityLabel[maturity]}</span>;
}

export function EvidenceLifecycle() {
  return (
    <div className="xa-flow-wrap">
      <div className="xa-artifact-bar">
        <span className="mono">EVIDENCE LINEAGE</span>
        <span className="xa-tag">ILLUSTRATIVE</span>
      </div>
      <ol className="xa-evidence-flow" aria-label="Evidence lifecycle">
        {evidenceLifecycle.map((s, i) => (
          <li key={s.step}>
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.step}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ValidationLoop() {
  return (
    <div className="xa-flow-wrap">
      <div className="xa-artifact-bar">
        <span className="mono">CONNECTED VALIDATION LOOP</span>
        <MaturityTag maturity="planned" />
      </div>
      <ol className="xa-loop" aria-label="Connected validation loop">
        {validationLoop.map((s, i) => (
          <li key={s}>
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <strong>{s}</strong>
            {i < validationLoop.length - 1 && <ArrowRight size={16} aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProtocolComponentGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`xa-component-grid ${compact ? 'compact' : ''}`}>
      {protocolComponents.map((c) => (
        <div key={c.name}>
          <MaturityTag maturity={c.maturity} />
          <h3>{c.name}</h3>
          <span className="mono">{c.role}</span>
          {!compact && <p>{c.text}</p>}
        </div>
      ))}
    </div>
  );
}

export function DirectionList() {
  return (
    <div className="xa-direction">
      {direction.map((d) => {
        const body = (
          <>
            <MaturityTag maturity={d.maturity} />
            <div>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </div>
            {d.href && <ArrowUpRight size={20} aria-hidden="true" />}
          </>
        );
        return d.href ? (
          <Link key={d.title} href={d.href} className="xa-direction-row">
            {body}
          </Link>
        ) : (
          <div key={d.title} className="xa-direction-row">
            {body}
          </div>
        );
      })}
    </div>
  );
}

/** The commercial services available today, always visible with a link to the detail. */
export function AvailableServices({ services }: { services: RecordData[] }) {
  const items = services.length
    ? services.map((s) => ({
        key: s.id,
        title: s.title,
        text: String(s.data.summary || ''),
        href: `/services/${s.slug}`,
      }))
    : currentServices.map((s) => ({ key: s.title, ...s, href: '/services' }));
  return (
    <div className="xa-service-grid">
      {items.map((s, i) => (
        <Link key={s.key} href={s.href} className="xa-service-card">
          <span className="mono">{String(i + 1).padStart(2, '0')}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
          <span className="xa-service-link">
            Scope and deliverables <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
