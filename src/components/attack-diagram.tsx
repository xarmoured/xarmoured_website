'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, GitBranch, CircleDot } from 'lucide-react';

/**
 * Hero attack-path study.
 * Discover -> Trace -> Validate -> Remediate -> Verify.
 *
 * Motion is CSS-driven (stroke-dashoffset and opacity transitions keyed off a
 * single stage). The sequence plays once, when the diagram first becomes
 * visible, and then rests on the final state. It never loops or restarts on
 * scroll. Under prefers-reduced-motion the complete, verified state is shown.
 */
const states = [
  [
    'Discover',
    'A signal enters through the public surface.',
    'Map the exposed routes, identities and the assumptions that connect them.',
    'SIGNAL ENTERS',
  ],
  [
    'Trace',
    'Follow the path across trust boundaries.',
    'Move through endpoints and identities to see what each one is trusted to reach.',
    'PATH TRACED',
  ],
  [
    'Validate',
    'Examine the authorization boundary.',
    'An authorization failure lets the path cross. Capture reproducible evidence.',
    'BOUNDARY EXAMINED',
  ],
  [
    'Remediate',
    'Change the control at the boundary.',
    'Apply server-side authorization to the resource and its related operations.',
    'CONTROL APPLIED',
  ],
  [
    'Verify',
    'Retest the original path.',
    'The original path no longer holds. Closure is confirmed and limits are documented.',
    'CLOSURE CONFIRMED',
  ],
] as const;

/** Fraction of the attack path drawn at each stage (path length normalised to 1). */
const drawn = [0.04, 0.7, 1, 0.855, 0.855];
/** How long each stage rests before the next, during the one-time sequence (ms). */
const dwell = [2200, 2400, 2600, 2400];
const nodes = [
  [80, 50, 'IDENTITY', [0, 1, 2, 3, 4]],
  [195, 115, 'APPLICATION', [1, 2, 3, 4]],
  [320, 195, 'API', [1, 2, 3, 4]],
  [405, 275, 'DATA', [2]],
] as const;

export function AttackDiagram() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const closed = step >= 3;
  const last = states.length - 1;

  const stop = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPlaying(false);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(last); // complete static visual
      return;
    }
    const play = () => {
      if (started.current) return;
      started.current = true;
      setPlaying(true);
      let at = 0;
      dwell.forEach((ms, i) => {
        at += ms;
        timers.current.push(
          window.setTimeout(() => {
            setStep(i + 1);
            if (i + 1 === last) setPlaying(false);
          }, at)
        );
      });
    };
    if (!('IntersectionObserver' in window)) {
      play();
      return stop;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect(); // one-shot: scrolling away and back never restarts it
          play();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [last, stop]);

  const choose = (i: number) => {
    started.current = true;
    stop();
    setStep(i);
  };

  return (
    <div
      ref={root}
      className={`xa-boundary-map xa-stage-${step} ${closed ? 'is-verified' : ''}`}
    >
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
            step >= 4
              ? 'Illustrative attack path retested after remediation. The path stops at the corrected authorization control and closure is confirmed.'
              : closed
                ? 'Illustrative attack path after remediation: the authorization control now blocks the path before it reaches data.'
                : 'Illustrative attack path from public surface through identity, application and API toward data, crossing a trust boundary.'
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
            d="M80 50H195V115H320V195H405V275"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="1 1"
            style={{ strokeDashoffset: 1 - drawn[step] }}
          />
          <path
            className="xa-map-probe"
            d="M80 50H195V115H320V195H405V275"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="0.07 2"
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
          <circle className="xa-map-examine" cx="405" cy="218" r="15" fill="none" />
          <path className="xa-map-gate" d="M386 218H424" fill="none" strokeWidth="4" />
          {nodes.map(([x, y, label, active]) => (
            <g key={label}>
              <rect
                x={x - 8}
                y={y - 8}
                width="16"
                height="16"
                rx="2"
                className={`xa-map-point ${(active as readonly number[]).includes(step) ? 'is-reached' : ''}`}
              />
              <text x={x + 17} y={y - 16} className="xa-map-label">
                {label}
              </text>
            </g>
          ))}
          <g className="xa-map-check">
            <circle cx="446" cy="218" r="13" />
            <path d="m440 218 4 4 8-9" fill="none" stroke="var(--background)" strokeWidth="2" />
          </g>
        </svg>
        <div className="xa-map-legend">
          <span>
            <CircleDot size={12} aria-hidden="true" />
            {states[step][3]}
          </span>
          <span className="mono">XA / BOUNDARY STUDY 01</span>
        </div>
      </div>
      <div className="xa-map-controls" role="group" aria-label="Attack path stages">
        {states.map((s, i) => (
          <button
            key={s[0]}
            type="button"
            aria-pressed={step === i}
            aria-current={step === i ? 'step' : undefined}
            onClick={() => choose(i)}
          >
            <span className="mono">0{i + 1}</span>
            {s[0]}
          </button>
        ))}
      </div>
      <div className="xa-map-caption" aria-live={playing ? 'off' : 'polite'}>
        <div>
          <strong>{states[step][1]}</strong>
          <p>{states[step][2]}</p>
        </div>
        <button
          type="button"
          aria-label="Next stage"
          onClick={() => choose((step + 1) % states.length)}
        >
          {step === last ? <Check size={20} aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
