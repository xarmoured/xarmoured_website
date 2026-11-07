'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, GitBranch, CircleDot, RotateCcw } from 'lucide-react';

/**
 * Illustrative attack-path sequence: Discover → Trace → Validate → Remediate → Verify.
 *
 * Plays once when the diagram first becomes visible, then rests on the final state.
 * It never loops and never restarts on scroll. Visitors can step through the stages
 * manually, which stops autoplay. With prefers-reduced-motion it renders the complete
 * final state statically (original path, applied control, verified retest) and does not play.
 * All movement is CSS (stroke-dashoffset, opacity, stroke) so no animation library is needed.
 */
const stages = [
  {
    name: 'Discover',
    legend: 'SIGNAL ENTERS',
    title: 'An exposed route is a starting point.',
    text: 'A signal enters through the public surface. Identify what is reachable and what it trusts.',
    label:
      'Illustrative attack path: a signal enters through the public surface and reaches an identity.',
  },
  {
    name: 'Trace',
    legend: 'PATH TRACED',
    title: 'Follow the path through the system.',
    text: 'Map identities, endpoints and the trust boundaries between them.',
    label: 'Illustrative attack path traced from identity through application to the API.',
  },
  {
    name: 'Validate',
    legend: 'BOUNDARY CROSSED',
    title: 'Prove the boundary fails.',
    text: 'An authorization failure lets the path cross the boundary. Capture reproducible evidence.',
    label:
      'The illustrative path crosses the trust boundary from the API to data, showing an authorization failure.',
  },
  {
    name: 'Remediate',
    legend: 'CONTROL APPLIED',
    title: 'Change the control at the boundary.',
    text: 'Apply server-side authorization to the resource and its related operations.',
    label: 'An authorization control is applied at the boundary and the vulnerable path is closed.',
  },
  {
    name: 'Verify',
    legend: 'CLOSURE CONFIRMED',
    title: 'The original path no longer holds.',
    text: 'Retest the original path against the fix and document any remaining limitations.',
    label: 'The original path is tested again and stops at the control. Closure is confirmed.',
  },
];
const LAST = stages.length - 1;
/** Milliseconds a stage rests before the sequence advances. */
const DWELL = [2400, 3200, 3000, 3000];
const nodes = [
  { key: 'id', x: 80, y: 50, label: 'IDENTITY' },
  { key: 'app', x: 195, y: 115, label: 'APPLICATION' },
  { key: 'api', x: 320, y: 195, label: 'API' },
  { key: 'data', x: 405, y: 275, label: 'DATA' },
];

export function AttackDiagram() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Start once, when first visible. Reduced motion shows the complete static state instead.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      started.current = true;
      setStep(LAST);
      return;
    }
    const el = root.current;
    const start = () => {
      if (started.current) return;
      started.current = true;
      setPlaying(true);
    };
    if (!el || typeof IntersectionObserver === 'undefined') {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step >= LAST) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, LAST)), DWELL[step]);
    return () => clearTimeout(t);
  }, [playing, step]);

  const go = (i: number) => {
    setPlaying(false);
    setStep(i);
  };
  const replay = () => {
    setRun((r) => r + 1);
    setStep(0);
    setPlaying(true);
  };
  const s = stages[step];
  const remediated = step >= 3;
  const verified = step === LAST;
  const nodeClass = (key: string) => {
    if (key === 'data') return step === 2 ? 'is-on' : '';
    if (key === 'id' || step >= 1) return verified ? 'is-verified-node' : 'is-on';
    return '';
  };

  return (
    <div
      ref={root}
      data-step={step}
      className={`xa-boundary-map ${verified ? 'is-verified' : ''} ${remediated ? 'is-remediated' : ''}`}
    >
      <div className="xa-artifact-bar">
        <GitBranch size={16} aria-hidden="true" />
        <span className="mono">ATTACK PATH / AUTHORIZATION</span>
        <span className="xa-tag">ILLUSTRATIVE</span>
      </div>
      <div className="xa-system-map">
        <div className="xa-map-zone">
          <span className="eyebrow">PUBLIC SURFACE</span>
          <span className="xa-map-coordinate mono">
            0{step + 1} / {s.name.toUpperCase()}
          </span>
        </div>
        <svg viewBox="0 0 480 330" role="img" aria-label={s.label}>
          <defs>
            <pattern id="xa-map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="currentColor" opacity=".18" />
            </pattern>
          </defs>
          <rect width="480" height="330" fill="url(#xa-map-grid)" />
          <g className="xa-map-connections" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M80 50H195V115H320V195H405V275" />
            <path className="xa-map-links" d="M80 50V195H155M195 115H95V275H260M320 115V50H405" />
          </g>
          <path
            className="xa-trust-line"
            d="M20 218H460"
            fill="none"
            stroke="currentColor"
            strokeDasharray="4 5"
          />
          <text x="22" y="240" className="xa-map-label">
            TRUST BOUNDARY
          </text>
          {/* Discover: the signal enters through the public surface. */}
          <path key={`entry-${run}`} className="xa-p xa-p-entry" d="M20 50H72" pathLength={1} />
          {step === 0 && <circle key={`pulse-${run}`} className="xa-pulse" cx="80" cy="50" r="9" />}
          {/* Trace: identity → application → API. */}
          <path className="xa-p xa-p-trace" d="M80 50H195V115H320V195" pathLength={1} />
          {/* Validate: the API → data segment crosses the boundary. */}
          <path className="xa-p xa-p-impact" d="M320 195H405V275" pathLength={1} />
          {/* Remediate: the vulnerable segment becomes a closed ghost path behind a control. */}
          <path className="xa-p-ghost" d="M320 195H405V275" />
          <g className="xa-gate">
            <path d="M390 218H420" />
          </g>
          {/* Verify: the original path is tested again and stops at the control. */}
          <path className="xa-p xa-p-verify" d="M80 50H195V115H320V195H405V218" pathLength={1} />
          {nodes.map((n) => (
            <g key={n.key}>
              <rect
                x={n.x - 8}
                y={n.y - 8}
                width="16"
                height="16"
                rx="2"
                className={`xa-map-point n-${n.key} ${nodeClass(n.key)}`}
              />
              <text x={n.x + 17} y={n.y - 16} className="xa-map-label">
                {n.label}
              </text>
            </g>
          ))}
          <g className="xa-map-check">
            <circle cx="440" cy="218" r="11" />
            <path d="m435 218 3.5 3.5 7-8" fill="none" stroke="var(--background)" strokeWidth="2" />
          </g>
        </svg>
        <div className="xa-map-legend">
          <span>
            <CircleDot size={12} aria-hidden="true" />
            {s.legend}
          </span>
          <span className="mono">XA / BOUNDARY STUDY 01</span>
        </div>
      </div>
      <div className="xa-map-controls" aria-label="Attack path stages">
        {stages.map((st, i) => (
          <button key={st.name} aria-pressed={step === i} onClick={() => go(i)}>
            <span className="mono">0{i + 1}</span>
            {st.name}
          </button>
        ))}
      </div>
      <div className="xa-map-caption" aria-live={playing ? 'off' : 'polite'}>
        <div>
          <strong>{s.title}</strong>
          <p>{s.text}</p>
        </div>
        {verified ? (
          <button aria-label="Replay the sequence" onClick={replay}>
            <RotateCcw size={20} aria-hidden="true" />
          </button>
        ) : (
          <button aria-label="Next stage" onClick={() => go(step + 1)}>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
