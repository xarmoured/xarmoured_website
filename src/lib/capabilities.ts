/**
 * Capability and maturity registry.
 *
 * Every maturity label shown on the public site comes from here so pages cannot
 * drift apart. A capability may only be marked 'available' when it is genuinely
 * delivered today. Protocol items stay 'development' or 'planned' until the
 * Protocol repository itself has been inspected and the feature verified.
 */
export type Maturity = 'available' | 'development' | 'planned';

export const maturityLabel: Record<Maturity, string> = {
  available: 'AVAILABLE NOW',
  development: 'IN DEVELOPMENT',
  planned: 'PLANNED',
};

/** What Xarmoured delivers as a service today. */
export const offensiveServices: Maturity = 'available';

/** Company direction, shown on About and the Services index. */
export const direction: { title: string; text: string; maturity: Maturity; href?: string }[] = [
  {
    title: 'Offensive security',
    text: 'Manual web application, API and Android testing, with retesting to verify fixes.',
    maturity: 'available',
    href: '/services',
  },
  {
    title: 'Defensive engineering',
    text: 'Detection validation and threat hunting, built on what offensive work reveals.',
    maturity: 'development',
  },
  {
    title: 'Protocol',
    text: 'Our security engineering platform for evidence, findings lifecycle and retest verification.',
    maturity: 'development',
    href: '/protocol',
  },
  {
    title: 'Continuous validation',
    text: 'Recurring validation of security improvements over time.',
    maturity: 'planned',
  },
];

/** Protocol's four components. Statuses are deliberately conservative. */
export const protocolComponents: {
  name: string;
  role: string;
  text: string;
  maturity: Maturity;
}[] = [
  {
    name: 'Protocol Core',
    role: 'The shared foundation',
    text: 'Organization and tenant boundaries, role-based access, shared assets, evidence storage, audit logs, APIs, integrations and notifications.',
    maturity: 'development',
  },
  {
    name: 'Protocol Attack',
    role: 'Evidence-led offensive assessment',
    text: 'Engagement and asset management, findings with CWE and CVSS mapping, evidence, reporting and retesting. Controlled attack scenarios and adversary emulation are later ambitions.',
    maturity: 'development',
  },
  {
    name: 'Protocol Defend',
    role: 'Defensive validation and hunting',
    text: 'Security telemetry, SIEM and EDR integrations, detection rule management, hunt libraries and investigation workflows, mapped to MITRE ATT&CK.',
    maturity: 'planned',
  },
  {
    name: 'Protocol Intelligence',
    role: 'Research and threat context',
    text: 'CVE and advisory intelligence, attack techniques and threat research, linked to attack scenarios and detections.',
    maturity: 'planned',
  },
];

/** Protocol's evidence lineage: the spine of the product idea. */
export const evidenceLifecycle: { step: string; text: string }[] = [
  { step: 'Evidence', text: 'What was tested, what was observed, and the proof that it happened.' },
  { step: 'Finding', text: 'A validated issue with scope, severity, impact and reproduction.' },
  {
    step: 'Remediation',
    text: 'The fix, tracked to the underlying cause rather than a closed ticket.',
  },
  { step: 'Retest', text: 'The original attack path repeated against the fix.' },
  {
    step: 'Measured improvement',
    text: 'A recorded result: resolved, partially resolved or still open.',
  },
];

/** The longer-term connected loop. Planned, not implemented. */
export const validationLoop = ['Intelligence', 'Attack', 'Defend', 'Validate', 'Improve'];

export const validationQuestions = [
  'Which threats and techniques matter?',
  'Can our systems be tested against them?',
  'Can our controls detect them?',
  'Did the improvement actually work?',
];

/** Enquiry topics added to the existing assessment form. */
export const enquiryTopics = {
  protocol: 'Discuss Protocol',
  partnership: 'Partnership or research collaboration',
} as const;

export const RESEARCH_PUBLISHER = 'published through Xarmoured';

/**
 * Attribution is shown only when a record has been explicitly verified against
 * the public advisory and names a researcher. Never infer it.
 */
export function researchAttribution(data: Record<string, any>): string | null {
  if (data?.attribution_verified !== true) return null;
  const researcher = String(data.researcher || '').trim();
  return researcher ? `Research by ${researcher}, ${RESEARCH_PUBLISHER}` : null;
}
