'use client';
import { useState, useId } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Check, Crosshair, FileText } from 'lucide-react';
import type { RecordData } from '@/lib/modules';

import { lifecycle } from '@/lib/lifecycle';
export function ProcessTimeline({ copy }: { copy?: string[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  return (
    <div className="xa-lifecycle">
      <div className="xa-process-controls" aria-label="Engagement stages">
        {lifecycle.map((s, i) => (
          <button
            key={s[0]}
            aria-pressed={active === i}
            aria-controls={id}
            onClick={() => setActive(i)}
          >
            <span className="mono">0{i + 1}</span>
            <strong>{s[0]}</strong>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="xa-process-detail" id={id} aria-live="polite">
        <span className="eyebrow">
          0{active + 1} / {lifecycle[active][0].toUpperCase()}
        </span>
        <h3>{lifecycle[active][1]}</h3>
        <p>{copy?.[active] || lifecycle[active][2]}</p>
        <span className="xa-verification">
          <Check size={15} aria-hidden="true" />
          {active === 6
            ? 'Output: a documented verification result'
            : `Next: ${lifecycle[active + 1][0].toLowerCase()}`}
        </span>
      </div>
    </div>
  );
}
const reportSections = [
  [
    'Executive summary',
    'A decision, backed by evidence.',
    'The assessment scope, the most consequential risks and the decisions that need attention. Written for the people accountable for the system.',
    ['Scope and limitations', 'Risk themes', 'Prioritized actions'],
  ],
  [
    'Attack surface',
    'Know what was covered.',
    'Assets, identities, environments and testing boundaries. Coverage and exclusions stay visible alongside the findings.',
    ['Tested assets', 'Roles and access', 'Coverage limitations'],
  ],
  [
    'Findings & CVSS',
    'Severity with context.',
    'Each finding connects an observed weakness to a demonstrated impact. CVSS supports the rating; the business context explains its priority.',
    ['Finding identifier', 'CVSS vector and rationale', 'Affected components'],
  ],
  [
    'Evidence & reproduction',
    'Make the behavior reproducible.',
    'A clear sequence of requests, prerequisites and observations. Sensitive values are redacted without removing the information engineers need.',
    ['Prerequisites', 'Reproduction steps', 'Redacted evidence'],
  ],
  [
    'Impact & remediation',
    'Fix the underlying weakness.',
    'Explain what the attack path permits and where the control fails. Recommend actionable changes and distinguish containment from a durable fix.',
    ['Demonstrated impact', 'Root cause', 'Engineering guidance'],
  ],
  [
    'Retest',
    'Close the loop.',
    'Record the tested version, the original reproduction attempt and the result. Partial fixes and remaining limitations are stated explicitly.',
    ['Version and date', 'Verification evidence', 'Resolved / partial / open'],
  ],
] as const;
export function ReportPreview() {
  const [active, setActive] = useState(0);
  const id = useId();
  return (
    <div className="xa-report">
      <div className="xa-artifact-bar">
        <FileText size={16} aria-hidden="true" />
        <span className="mono">DELIVERABLE / ANATOMY</span>
        <span className="xa-tag">ILLUSTRATIVE FORMAT</span>
      </div>
      <div className="xa-report-grid">
        <div className="xa-report-index" aria-label="Report sections">
          {reportSections.map((s, i) => (
            <button
              key={s[0]}
              aria-pressed={active === i}
              aria-controls={id}
              onClick={() => setActive(i)}
            >
              <span className="mono">0{i + 1}</span>
              {s[0]}
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="xa-report-content" id={id} aria-live="polite">
          <span className="eyebrow">{reportSections[active][0]}</span>
          <h3>{reportSections[active][1]}</h3>
          <p>{reportSections[active][2]}</p>
          <ul>
            {reportSections[active][3].map((x) => (
              <li key={x}>
                <Check size={15} aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
          <div className="xa-report-note">
            Report structure only. No customer data or fictional vulnerability findings.
          </div>
        </div>
      </div>
    </div>
  );
}
export function CapabilityExplorer({ services }: { services: RecordData[] }) {
  const groups = [
    ...new Set(
      services.map((s) => s.data.capability_group || s.data.category || 'Offensive Security')
    ),
  ];
  const [active, setActive] = useState(groups[0] || '');
  return (
    <div className="xa-capabilities">
      <div className="xa-filter-buttons" aria-label="Service categories">
        {groups.map((g) => (
          <button key={g} aria-pressed={active === g} onClick={() => setActive(g)}>
            {g}
          </button>
        ))}
      </div>
      <div className="xa-capability-list">
        {services
          .filter(
            (s) => (s.data.capability_group || s.data.category || 'Offensive Security') === active
          )
          .map((s, i) => (
            <details key={s.id}>
              <summary>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <span aria-hidden="true">+</span>
              </summary>
              <div className="xa-capability-body">
                <p>{s.data.summary}</p>
                {s.data.testing_areas && (
                  <ul>
                    {String(s.data.testing_areas)
                      .split('\n')
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                  </ul>
                )}
                <Link className="text-link" href={`/services/${s.slug}`}>
                  Explore scope & deliverables <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </details>
          ))}
      </div>
    </div>
  );
}
export function PublicationList({
  records,
  section = 'research',
}: {
  records: RecordData[];
  section?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('newest');
  const date = (r: RecordData) => r.data.publication_date || r.published_at || r.created_at;
  const categories = [
    ...new Set([
      ...(section === 'research'
        ? ['Vulnerability Research', 'Advisories', 'Write-ups', 'Techniques', 'Tools']
        : []),
      ...records.map(
        (r) =>
          r.data.category ||
          (section === 'research' ? 'Vulnerability Research' : 'Technical article')
      ),
    ]),
  ];
  const years = [...new Set(records.map((r) => String(date(r)).slice(0, 4)))].sort().reverse();
  const filtered = records
    .filter(
      (r) =>
        (!category || (r.data.category || 'Vulnerability Research') === category) &&
        (!severity || r.data.severity === severity) &&
        (!year || String(date(r)).startsWith(year)) &&
        `${r.title} ${r.data.summary || ''} ${r.data.cve || ''} ${r.data.product || ''} ${r.data.tags || ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title)
        : (sort === 'oldest' ? 1 : -1) * (Date.parse(date(a)) - Date.parse(date(b)))
    );
  return (
    <div className="xa-publications">
      <div className="xa-publication-filters">
        <label>
          Search {section}
          <input
            type="search"
            placeholder="Title, identifier, product or tag"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        {section === 'research' && (
          <label>
            Severity
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="">All severities</option>
              {['informational', 'low', 'medium', 'high', 'critical'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Year
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">All years</option>
            {years.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      <p className="xa-result-count mono" role="status">
        {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
      </p>
      {filtered.length ? (
        filtered.map((r) => (
          <Link className="xa-research-row" href={`/${section}/${r.slug}`} key={r.id}>
            <div className="xa-research-id">
              <span className="mono">
                {r.data.cve || r.data.advisory || r.data.category || 'RESEARCH'}
              </span>
              <time dateTime={date(r)}>
                {new Date(date(r)).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </div>
            <div>
              <h3>{r.title}</h3>
              <p>{r.data.summary}</p>
              <span className="mono">
                {[r.data.product, r.data.category].filter(Boolean).join(' / ')}
              </span>
            </div>
            {r.data.severity && (
              <span className={`xa-severity severity-${r.data.severity}`}>{r.data.severity}</span>
            )}
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        ))
      ) : (
        <div className="xa-journal-empty">
          <Crosshair size={32} aria-hidden="true" />
          <h2>
            {records.length
              ? 'No matching entries.'
              : section === 'research'
                ? 'Research follows the evidence.'
                : 'Useful work. Shared openly.'}
          </h2>
          <p>
            {records.length
              ? 'Try another search or clear your filters.'
              : section === 'research'
                ? 'New research will appear after responsible disclosure. Explore our approach to see how we investigate security boundaries.'
                : 'Guides, technical articles and reviewed resources will appear here when published.'}
          </p>
          {records.length ? (
            <button
              className="button secondary"
              onClick={() => {
                setQuery('');
                setCategory('');
                setSeverity('');
                setYear('');
              }}
            >
              Clear filters
            </button>
          ) : (
            <Link className="text-link" href="/methodology">
              Explore the methodology <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
