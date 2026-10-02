'use client';
import { useState } from 'react';
import { ArrowRight, LockKeyhole, ScanLine, ShieldCheck, Terminal } from 'lucide-react';
export function AttackDiagram() {
  const [mode, setMode] = useState<'attack' | 'verified'>('attack');
  return (
    <div className="attack-diagram">
      <div className="diagram-top">
        <span>
          <i className="signal-dot" /> THE ATTACKER’S PERSPECTIVE
        </span>
        <span>XA / 001</span>
      </div>
      <div className="diagram-grid">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="diagram-node user-node">
          <Terminal size={20} />
          <span>LOW PRIVILEGE USER</span>
        </div>
        <div className="diagram-node api-node">
          <ScanLine size={24} />
          <span>APPLICATION / API</span>
        </div>
        <div className={`diagram-node boundary-node ${mode === 'verified' ? 'verified' : ''}`}>
          <LockKeyhole size={22} />
          <span>{mode === 'attack' ? 'TRUST BOUNDARY' : 'BOUNDARY VERIFIED'}</span>
        </div>
        <div className={`diagram-node target-node ${mode === 'verified' ? 'verified' : ''}`}>
          <ShieldCheck size={21} />
          <span>{mode === 'attack' ? 'PRIVILEGED RESOURCE' : 'REMEDIATION CONFIRMED'}</span>
        </div>
        <svg
          className="diagram-lines"
          viewBox="0 0 500 380"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M80 95L235 145L335 235L425 295"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="5 5"
          />
        </svg>
        <div className="boundary-label">
          {mode === 'attack' ? 'TEST THE ASSUMPTION' : 'VERIFY THE FIX'}
        </div>
      </div>
      <div className="diagram-bottom">
        <div>
          <span className="mono">
            {mode === 'attack' ? '01 / FIND THE PATH' : '02 / CLOSE THE PATH'}
          </span>
          <p>
            {mode === 'attack'
              ? 'One weak boundary. A different level of access.'
              : 'A fix is only complete when it survives a retest.'}
          </p>
        </div>
        <button
          aria-label="Toggle attack and retest diagram"
          onClick={() => setMode(mode === 'attack' ? 'verified' : 'attack')}
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
