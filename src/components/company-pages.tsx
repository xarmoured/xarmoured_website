import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal, ButtonLink } from '@/components/ui';
import {
  EvidenceLifecycle,
  ValidationLoop,
  ProtocolComponentGrid,
  MaturityTag,
} from '@/components/protocol';
import { Markdown } from '@/components/markdown';
import { validationQuestions } from '@/lib/capabilities';

const designGoals: [string, string][] = [
  [
    'Evidence lineage',
    'Every finding traces back to the evidence behind it, and forward to its fix.',
  ],
  [
    'Assessment history',
    'What was tested, when and under what scope stays visible across engagements.',
  ],
  [
    'Findings lifecycle',
    'From discovery through validation, remediation and closure, with explicit states.',
  ],
  [
    'Remediation tracking',
    'Fixes tracked against the underlying cause, not just the status of a ticket.',
  ],
  [
    'Retest verification',
    'Each retest repeats the original path and records resolved, partially resolved or open.',
  ],
];

export function ProtocolPage({ extra }: { extra?: string }) {
  return (
    <div className="wrap section xa-protocol">
      <Reveal className="page-intro">
        <span className="eyebrow">PROTOCOL · IN DEVELOPMENT</span>
        <h1>From finding vulnerabilities to proving security improvements.</h1>
        <p>
          Protocol is the security engineering platform being developed by Xarmoured. It starts
          from offensive assessment evidence, findings and retesting. Defensive validation and
          security intelligence are planned, and adversary simulation is a longer-term ambition.
        </p>
        <div className="xa-notice" role="note">
          <MaturityTag maturity="development" />
          <span>
            Protocol is under active development. It is not a generally available product: there is
            no public release, pricing or launch date.
          </span>
        </div>
        <div className="button-row">
          <ButtonLink href="/assessment?topic=protocol">Discuss Protocol</ButtonLink>
          <Link className="text-link" href="/methodology">
            See how we work today <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </Reveal>

      <section className="xa-protocol-section">
        <span className="eyebrow">01 / THE PROBLEM</span>
        <h2>A finding is not an improvement.</h2>
        <p>
          Security findings often end up scattered across reports, spreadsheets and tickets. It
          becomes hard to show what was tested, what was found, what changed and whether the fix
          held. Offensive and defensive teams can work from different records, so the same weakness
          is found, patched and forgotten without anyone measuring the result.
        </p>
      </section>

      <section className="xa-protocol-section">
        <span className="eyebrow">02 / EVIDENCE LINEAGE</span>
        <h2>Evidence → Finding → Remediation → Retest → Measured improvement.</h2>
        <p>
          This is the lifecycle Protocol is designed around. It is also how every Xarmoured
          engagement is already structured. Protocol’s job is to turn that practice into a durable,
          shared record.
        </p>
        <EvidenceLifecycle />
      </section>

      <section className="xa-protocol-section">
        <span className="eyebrow">03 / WHAT PROTOCOL IS DESIGNED AROUND</span>
        <h2>One record, from first evidence to verified fix.</h2>
        <p>
          These are the design principles of the platform, not a feature list. Feature-level status
          is shown in the architecture below.
        </p>
        <div className="xa-company-principles">
          {designGoals.map(([t, p]) => (
            <div key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="xa-protocol-section">
        <span className="eyebrow">04 / ARCHITECTURE</span>
        <h2>Four components, one shared foundation.</h2>
        <p>
          Labels show what we are prepared to claim today. Nothing on this page is generally
          available.
        </p>
        <ProtocolComponentGrid />
      </section>

      <section className="xa-protocol-section">
        <span className="eyebrow">05 / THE LONGER-TERM LOOP</span>
        <h2>Connecting offensive testing with defensive validation.</h2>
        <p>
          The longer ambition is to carry the same evidence trail across the boundary between attack
          and defense. Intelligence informs the attack. Attack validates the defense. Defense
          identifies gaps. Validation measures improvement. None of this loop is implemented today.
        </p>
        <ValidationLoop />
        <ul className="xa-questions">
          {validationQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="xa-protocol-section">
        <span className="eyebrow">06 / XARMOURED AND PROTOCOL</span>
        <h2>Xarmoured is the company. Protocol is its proprietary platform.</h2>
        <div className="xa-company-principles">
          {[
            [
              'Services provide practice.',
              'Real assessments show where security work actually breaks down.',
            ],
            [
              'Research produces technique.',
              'Published findings develop new knowledge and methods.',
            ],
            [
              'Protocol productizes workflow.',
              'Repeatable steps become technology rather than spreadsheets.',
            ],
            [
              'Engagements validate the product.',
              'Customer work tests the platform, and the platform improves delivery.',
            ],
          ].map(([t, p]) => (
            <div key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="xa-protocol-section">
        <span className="eyebrow">07 / WHAT PROTOCOL IS NOT</span>
        <h2>Clear about its limits.</h2>
        <ul className="xa-questions">
          <li>
            Not a SIEM or an EDR. The intent is to work with existing tools, not replace them.
          </li>
          <li>Not a vulnerability scanner.</li>
          <li>Not a managed service or a monitoring operation.</li>
          <li>Not generally available, with no public pricing, release or early-access program.</li>
        </ul>
      </section>

      <section className="xa-protocol-section">
        <span className="eyebrow">08 / WHO IT IS FOR</span>
        <h2>Teams that need a durable record of security work.</h2>
        <p>
          Over time: penetration testing teams and consultancies, product security teams, and
          security providers that want evidence and validation to outlast a single report. If this
          is a problem you work on, we would like to talk about it. This is a conversation, not a
          sign-up. We are not offering early access or taking pre-orders.
        </p>
        <div className="button-row">
          <ButtonLink href="/assessment?topic=protocol">Discuss Protocol</ButtonLink>
        </div>
      </section>
      {extra && <Markdown>{extra}</Markdown>}
    </div>
  );
}

const collaborators: [string, string, string][] = [
  [
    'Security consultancies',
    'Collaboration on application, API and Android assessments, agreed case by case.',
    'DISCUSSED CASE BY CASE',
  ],
  [
    'MSSPs and MDRs',
    'Conversations about how offensive validation could complement detection and response work. Protocol integration is a long-term direction.',
    'EXPLORATORY',
  ],
  [
    'Technology vendors',
    'Integration discussions for Protocol, once its architecture is ready for them.',
    'PLANNED',
  ],
  [
    'Independent researchers',
    'Joint research and responsible disclosure. Credit stays with the researcher.',
    'OPEN TO DISCUSSION',
  ],
];

export function PartnersPage() {
  return (
    <div className="wrap section xa-protocol">
      <Reveal className="page-intro">
        <span className="eyebrow">COLLABORATE</span>
        <h1>Work with Xarmoured.</h1>
        <p>
          Xarmoured is an independent, founder-led cybersecurity engineering company. We are open to
          collaboration with security consultancies, MSSPs and MDRs, technology vendors and
          independent researchers.
        </p>
        <div className="xa-notice" role="note">
          <span className="xa-tag">NOT A PROGRAM</span>
          <span>
            Xarmoured does not currently operate a formal partner program. There are no partner
            tiers, certifications, referral terms or revenue-share arrangements. Collaboration is
            discussed case by case.
          </span>
        </div>
      </Reveal>
      <section className="xa-protocol-section">
        <span className="eyebrow">WHO WE WOULD LIKE TO HEAR FROM</span>
        <h2>Four kinds of collaboration.</h2>
        <div className="xa-component-grid">
          {collaborators.map(([t, p, s]) => (
            <div key={t}>
              <span className="xa-tag">{s}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="xa-protocol-section">
        <span className="eyebrow">HOW TO START</span>
        <h2>Tell us what you would like to explore.</h2>
        <p>
          Tell us who you are, what you do and what you have in mind. We will reply to say whether
          it looks like a fit. To see where the platform side stands, read about{' '}
          <Link className="text-link" href="/protocol">
            Protocol
          </Link>
          .
        </p>
        <div className="button-row">
          <ButtonLink href="/assessment?topic=partnership">Start a conversation</ButtonLink>
        </div>
      </section>
    </div>
  );
}
