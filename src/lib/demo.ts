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
  eyebrow: 'OFFENSIVE SECURITY. DEFENSIVE CONFIDENCE.',
  headline: 'Find the cracks.\nBefore they become breaches.',
  summary:
    'We test the assumptions your security depends on. Manual penetration testing, actionable research, and security engineering for the systems that matter.',
  primary_label: 'Request an assessment',
  primary_url: '/assessment',
  secondary_label: 'Explore our approach',
  secondary_url: '/methodology',
  services_heading: 'Your attack surface.\nOur starting point.',
  research_heading: 'From curiosity to disclosure.',
  final_cta: 'Build with confidence.\nLaunch with Xarmoured.',
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
    description: x[2],
    icon: x[3],
    order: i,
    testing_areas:
      'Authentication and session management\nAuthorization and privilege boundaries\nBusiness logic and data exposure\nConfiguration and input validation',
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
