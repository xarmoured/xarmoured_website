'use client';
import { useState } from 'react';
import { ArrowRight, Check, GitBranch, CircleDot } from 'lucide-react';
const states = [
  [
    'Discovered',
    'An exposed route is a starting point.',
    'Map identities, endpoints and the assumptions that connect them.',
  ],
  [
    'Validated',
    'Follow the path. Prove the impact.',
    'An authorization failure crosses a boundary. Capture reproducible evidence.',
  ],
  [
    'Remediated',
    'Change the control at the boundary.',
    'Apply server-side authorization to the resource and its related operations.',
  ],
  [
    'Verified',
    'The original path no longer holds.',
    'Retest the fix and document the remaining limitations.',
  ],
];
export function AttackDiagram() {
  const [step, setStep] = useState(0);
  const closed = step >= 2;
  return (
    <div className={`xa-boundary-map ${closed ? 'is-verified' : ''}`}>
      <div className="xa-artifact-bar">
        <GitBranch size={16} aria-hidden="true" />
        <span className="mono">ATTACK PATH / AUTHORIZATION</span>
        <span className="xa-tag">ILLUSTRATIVE</span>
      </div>
      <div className="xa-system-map">
        <div className="xa-map-zone">
          <span className="eyebrow">PUBLIC SURFACE</span>
          <span className="xa-map-coordinate mono">01 / ENTRY</span>
        </div>
        <svg
          viewBox="0 0 480 330"
          role="img"
          aria-label={
            closed
              ? 'Remediated authorization blocks the illustrative path from identity through application and API to data.'
              : 'Illustrative attack path from public surface through identity, application and API crosses a trust boundary to data.'
          }
        >
          <defs>
            <pattern id="xa-map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="currentColor" opacity=".18" />
            </pattern>
          </defs>
          <rect width="480" height="330" fill="url(#xa-map-grid)" />
          <g className="xa-map-connections" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M80 50H195V115H320V195H405V275" />
            <path d="M80 50V195H155M195 115H95V275H260M320 115V50H405" opacity=".35" />
          </g>
          <path
            className="xa-map-path"
            d={closed ? 'M80 50H195V115H320V180' : 'M80 50H195V115H320V195H405V275'}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={step === 0 ? '4 6' : undefined}
          />
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
          {[
            [80, 50, 'IDENTITY'],
            [195, 115, 'APPLICATION'],
            [320, 195, 'API'],
            [405, 275, 'DATA'],
          ].map(([x, y, label]) => (
            <g key={label}>
              <rect
                x={Number(x) - 8}
                y={Number(y) - 8}
                width="16"
                height="16"
                rx="2"
                className="xa-map-point"
              />
              <text x={Number(x) + 17} y={Number(y) - 16} className="xa-map-label">
                {label}
              </text>
            </g>
          ))}
          {closed && (
            <g className="xa-map-check">
              <circle cx="320" cy="180" r="13" />
              <path d="m314 180 4 4 8-9" fill="none" stroke="var(--background)" strokeWidth="2" />
            </g>
          )}
        </svg>
        <div className="xa-map-legend">
          <span>
            <CircleDot size={12} aria-hidden="true" />
            {closed ? 'CONTROL APPLIED' : 'ATTACK PATH'}
          </span>
          <span className="mono">XA / BOUNDARY STUDY 01</span>
        </div>
      </div>
      <div className="xa-map-controls" aria-label="Attack path states">
        {states.map((s, i) => (
          <button key={s[0]} aria-pressed={step === i} onClick={() => setStep(i)}>
            <span className="mono">0{i + 1}</span>
            {s[0]}
          </button>
        ))}
      </div>
      <div className="xa-map-caption" aria-live="polite">
        <div>
          <strong>{states[step][1]}</strong>
          <p>{states[step][2]}</p>
        </div>
        <button
          aria-label="Next attack path state"
          onClick={() => setStep((step + 1) % states.length)}
        >
          {step === 3 ? <Check size={20} /> : <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
