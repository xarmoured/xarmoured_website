import type { RecordData } from './modules';
const row = (
  id: string,
  title: string,
  slug: string,
  status: string,
  data: Record<string, any>
): RecordData => ({
  id,
  title,
  slug,
  status,
  data,
  created_at: '2026-10-02T09:00:00Z',
  updated_at: '2026-10-02T09:00:00Z',
});
export const initialSettings = row('site', 'Website settings', 'site', 'published', {
  company: 'Xarmoured',
  description: 'Penetration testing and security engineering. Built by practitioners.',
  sales_email: 'contact@xarmoured.com',
  assessment_enabled: true,
  careers_enabled: true,
  research_enabled: true,
  sample_report_enabled: true,
  announcements_enabled: true,
  general_applications: false,
  sales_cta: 'Request an assessment',
});
export const initialHome = row('home', 'Homepage', 'home', 'published', {
  eyebrow: 'OFFENSIVE SECURITY & SECURITY ENGINEERING',
  headline: 'Security that survives\ncontact with an attacker.',
  summary:
    'We trace real attack paths, demonstrate exploitable risk and help engineers verify the fix. Manual penetration testing and security engineering, grounded in evidence.',
  primary_label: 'Request an assessment',
  primary_url: '/assessment',
  secondary_label: 'Explore our approach',
  secondary_url: '/methodology',
  services_heading: 'Different systems.\nThe same depth of attention.',
  research_heading: 'Questions worth\nfollowing further.',
  final_cta: 'Put your security\nassumptions to the test.',
  show_research: true,
  show_report: true,
  show_careers: true,
  show_labs: false,
});
export const defaultServices = [
  [
    'Web Application VAPT',
    'web-application',
    'Business logic. Access control. The paths scanners miss.',
    'globe',
  ],
  [
    'API Security Testing',
    'api-security',
    'Test authorization boundaries, data exposure, and trust between services.',
    'code',
  ],
  [
    'Mobile Application Security',
    'mobile-security',
    'Beyond the interface. Across devices, storage, and APIs.',
    'smartphone',
  ],
  [
    'Cloud Security Assessment',
    'cloud-security',
    'Identity, configuration, and cross-service attack paths.',
    'cloud',
  ],
  [
    'Network & Infrastructure',
    'network-security',
    'Discover exposure, lateral movement, and infrastructure weaknesses.',
    'network',
  ],
  [
    'Source Code Review',
    'source-code-review',
    'Understand the flaws where they begin. In the code.',
    'shield',
  ],
].map((x, i) =>
  row(`service-${i}`, x[0], x[1], 'published', {
    summary: x[2],
    category: 'Offensive Security',
    capability_group: [
      'Application',
      'Application',
      'Application',
      'Cloud',
      'Infrastructure',
      'Engineering',
    ][i],
    description:
      i === 0
        ? 'We examine the application as a system of identities, workflows and trust boundaries. The goal is to demonstrate where an attacker can act outside their intended permissions, access data or influence a sensitive operation.'
        : x[2],
    problem:
      i === 0
        ? 'A successful login does not prove that every resource and operation is correctly authorized. Alternate roles, object identifiers and multi-step workflows can expose paths that are easy to miss in feature testing.'
        : '',
    audience:
      i === 0
        ? 'Engineering and security teams preparing a release, changing authentication, introducing tenant boundaries or seeking an independent assessment of a web application.'
        : '',
    attack_paths:
      i === 0
        ? '- Change an object identifier and test cross-account access (IDOR/BOLA).\n- Combine session weaknesses with sensitive workflow actions.\n- Follow server-side request handling into unintended network or data access.\n- Test file processing and business workflows for privilege or data exposure.'
        : '',
    methodology:
      'Agree on scope, access and safeguards. Map the system, investigate manually with focused tooling, validate exploitability and document evidence. Coverage follows the technology and threat model; exclusions are explicit.',
    example_scope:
      i === 0
        ? 'Illustrative scope: one staging web application, its supporting API, two test tenants and agreed user roles. Include account creation, privileged workflows, file handling and administrative actions. Asset counts, integrations and testing windows are agreed before authorization.'
        : '',
    process:
      'Scoping and written authorization → kickoff and access validation → mapping and testing → finding validation → report and debrief → remediation discussion → agreed retest.',
    retesting:
      'Repeat the original reproduction against the fixed version. Check adjacent behavior within scope and record whether the finding is resolved, partially resolved or still open. Agree the retest window and coverage during scoping.',
    icon: x[3],
    order: i,
    testing_areas:
      i === 0
        ? 'Authentication and account recovery\nAuthorization, IDOR and BOLA\nSession lifecycle and token handling\nBusiness logic and workflow abuse\nInjection and input handling\nFile upload, processing and storage\nServer-side request handling\nClient-side issues and browser boundaries\nMisconfiguration and data exposure'
        : 'Authentication and session management\nAuthorization and privilege boundaries\nBusiness logic and data exposure\nConfiguration and input validation',
    deliverables:
      '## Evidence you can act on\nA validated finding report, reproducible steps, impact analysis, and practical remediation guidance.',
    timeline: 'Defined together during scoping',
  })
);
export const defaultFaqs = [
  [
    'What does an assessment include?',
    'We agree on scope and rules of engagement, test manually, validate findings, and deliver a report with reproducible evidence and remediation guidance.',
  ],
  [
    'Will testing affect production?',
    'We agree on the environment, testing windows, and safeguards before testing begins. A staging environment is often a good starting point.',
  ],
  [
    'Can you retest our fixes?',
    'Yes. Retesting verifies remediation against the original finding and documents the outcome.',
  ],
  [
    'How do we get started?',
    'Tell us about your systems and goals. A tester will help define a practical scope.',
  ],
].map((x, i) =>
  row(`faq-${i}`, x[0], `faq-${i}`, 'published', { answer: x[1], category: 'General', order: i })
);
export const demoSeed: Record<string, RecordData[]> = {
  settings: [initialSettings],
  pages: [initialHome],
  services: defaultServices,
  faqs: defaultFaqs,
  seo: [
    row('global', 'Global SEO', 'global', 'published', {
      default_title: 'Xarmoured — Penetration Testing & Security Engineering',
      title_template: '%s — Xarmoured',
      description: initialSettings.data.description,
    }),
  ],
  jobs: [
    row('demo-job', 'DEMO · Security Researcher', 'demo-security-researcher', 'open', {
      department: 'Security Research',
      location: 'Remote',
      remote: 'remote',
      employment: 'Full time',
      summary: 'A development-only example role. Not an actual vacancy.',
      description:
        '## See what others miss\nExplore complex systems, validate vulnerabilities, and turn findings into clear research.',
      requirements:
        '- Web and API security experience\n- Clear technical communication\n- Responsible disclosure mindset',
      responsibilities: '- Investigate security boundaries\n- Write reproducible findings',
      accept_applications: true,
    }),
  ],
  research: [
    row(
      'demo-research',
      'DEMO · The anatomy of an authorization flaw',
      'demo-authorization-flaw',
      'draft',
      {
        summary: 'Development-only research sample. No real vulnerability claim.',
        disclosure: 'private',
        content:
          '## A trust boundary worth testing\nThis is a demonstration draft, not a published advisory.',
        severity: 'high',
      }
    ),
  ],
  leads: [
    row('demo-lead', 'DEMO · Northstar Labs', 'demo-northstar', 'new', {
      company: 'DEMO · Northstar Labs',
      name: 'Demo Contact',
      email: 'demo@example.com',
      services: 'Web Application VAPT, API Security',
      timeline: 'This month',
      source: 'Website',
      reference: 'XA-LEAD-2026-DEMO',
      environment: 'Staging · SaaS platform',
      message: 'Development-only example enquiry.',
    }),
  ],
  applications: [
    row('demo-app', 'DEMO · Alex Morgan', 'demo-alex', 'reviewing', {
      name: 'DEMO · Alex Morgan',
      email: 'applicant@example.com',
      job_id: 'demo-job',
      job_title: 'DEMO · Security Researcher',
      experience: '3 years',
      introduction: 'Development-only applicant record. Not a real candidate.',
      reference: 'XA-CAR-2026-DEMO',
    }),
  ],
  activity: [],
  notifications: [],
  team: [],
  media: [],
  reports: [],
  navigation: [],
  announcements: [],
  redirects: [],
};
