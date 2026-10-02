import { z } from 'zod';
export type Role = 'owner' | 'admin' | 'editor' | 'recruiter' | 'viewer';
export type RecordData = {
  id: string;
  title: string;
  slug: string;
  status: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  deleted_at?: string | null;
};
export type Field = {
  key: string;
  label: string;
  type?: 'textarea' | 'markdown' | 'email' | 'url' | 'number' | 'date' | 'checkbox' | 'select';
  options?: string[];
  required?: boolean;
  section?: string;
  help?: string;
};
export type Module = {
  label: string;
  singular: string;
  description: string;
  statuses: string[];
  fields: Field[];
  publicPath?: string;
  readOnly?: boolean;
};
const f = (
  key: string,
  label: string,
  type?: Field['type'],
  section = 'Overview',
  options?: string[]
): Field => ({ key, label, type, section, options });
const seo = [
  f('seo_title', 'SEO title', undefined, 'SEO'),
  f('seo_description', 'SEO description', 'textarea', 'SEO'),
  f('og_image', 'Social image URL', 'url', 'SEO'),
];
export const modules: Record<string, Module> = {
  jobs: {
    label: 'Jobs',
    singular: 'Job',
    description: 'Build a team that thinks like an attacker.',
    statuses: ['draft', 'open', 'paused', 'closed', 'archived'],
    publicPath: '/careers',
    fields: [
      f('department', 'Department'),
      f('location', 'Location'),
      f('remote', 'Remote status', 'select', 'Overview', ['remote', 'hybrid', 'onsite']),
      f('employment', 'Employment type', 'select', 'Overview', [
        'Full time',
        'Part time',
        'Contract',
        'Internship',
      ]),
      f('experience', 'Experience'),
      f('summary', 'Short summary', 'textarea'),
      f('description', 'Role description', 'markdown', 'Role'),
      f('responsibilities', 'Responsibilities', 'markdown', 'Role'),
      f('requirements', 'Requirements', 'markdown', 'Role'),
      f('nice_to_have', 'Nice to have', 'markdown', 'Role'),
      f('hiring_process', 'Hiring process', 'markdown', 'Hiring'),
      f('salary', 'Salary (optional)', undefined, 'Hiring'),
      f('deadline', 'Application deadline', 'date', 'Hiring'),
      f('contact', 'Hiring contact', 'email', 'Hiring'),
      f('accept_applications', 'Accept applications', 'checkbox', 'Hiring'),
      ...seo,
    ],
  },
  research: {
    label: 'Research',
    singular: 'Research entry',
    description: 'Original work. Responsible disclosure. Lasting impact.',
    statuses: ['draft', 'published', 'archived'],
    publicPath: '/research',
    fields: [
      f('summary', 'Summary', 'textarea'),
      f('content', 'Research content', 'markdown', 'Content'),
      f('disclosure', 'Disclosure status', 'select', 'Disclosure', [
        'private',
        'coordinating',
        'embargoed',
        'public',
        'archived',
      ]),
      f('cve', 'CVE', undefined, 'Disclosure'),
      f('advisory', 'Advisory ID', undefined, 'Disclosure'),
      f('product', 'Product', undefined, 'Disclosure'),
      f('vendor', 'Vendor', undefined, 'Disclosure'),
      f('vulnerability', 'Vulnerability type', undefined, 'Disclosure'),
      f('cwe', 'CWE', undefined, 'Disclosure'),
      f('cvss', 'CVSS', 'number', 'Disclosure'),
      f('severity', 'Severity', 'select', 'Disclosure', [
        'informational',
        'low',
        'medium',
        'high',
        'critical',
      ]),
      f('discovered_at', 'Discovery date', 'date', 'Disclosure'),
      f('disclosed_at', 'Disclosure date', 'date', 'Disclosure'),
      f('references', 'References (one URL per line)', 'textarea', 'Content'),
      f('researcher', 'Researcher attribution', undefined, 'Content'),
      ...seo,
    ],
  },
  services: {
    label: 'Services',
    singular: 'Service',
    description: 'Manage the work your clients come here for.',
    statuses: ['draft', 'published', 'inactive', 'archived'],
    publicPath: '/services',
    fields: [
      f('summary', 'Short description', 'textarea'),
      f('description', 'Hero description', 'markdown'),
      f('icon', 'Icon', 'select', 'Overview', [
        'globe',
        'code',
        'smartphone',
        'cloud',
        'shield',
        'network',
      ]),
      f('features', 'Features (one per line)', 'textarea', 'Details'),
      f('testing_areas', 'Testing areas (one per line)', 'textarea', 'Details'),
      f('deliverables', 'Deliverables', 'markdown', 'Details'),
      f('timeline', 'Typical timeline', undefined, 'Details'),
      f('faq_ids', 'Service FAQs', 'textarea', 'Details'),
      f('order', 'Display order', 'number'),
      ...seo,
    ],
  },
  pages: {
    label: 'Pages',
    singular: 'Page',
    description: 'A controlled editor. Your content, our crafted layouts.',
    statuses: ['draft', 'published', 'archived'],
    publicPath: '/',
    fields: [
      f('eyebrow', 'Hero eyebrow'),
      f('headline', 'Headline', 'textarea'),
      f('summary', 'Supporting text', 'textarea'),
      f('primary_label', 'Primary CTA label', undefined, 'CTAs'),
      f('primary_url', 'Primary CTA destination', 'url', 'CTAs'),
      f('secondary_label', 'Secondary CTA label', undefined, 'CTAs'),
      f('secondary_url', 'Secondary CTA destination', 'url', 'CTAs'),
      f('services_heading', 'Service section heading', undefined, 'Sections'),
      f('research_heading', 'Research section heading', undefined, 'Sections'),
      f('methodology_cta', 'Methodology CTA', undefined, 'Sections'),
      f('final_cta', 'Final CTA', undefined, 'Sections'),
      f('show_research', 'Show research', 'checkbox', 'Sections'),
      f('show_report', 'Show sample report', 'checkbox', 'Sections'),
      f('show_careers', 'Show careers callout', 'checkbox', 'Sections'),
      f('show_labs', 'Show Labs', 'checkbox', 'Sections'),
      f('content', 'Page content', 'markdown', 'Content'),
      ...seo,
    ],
  },
  faqs: {
    label: 'FAQs',
    singular: 'FAQ',
    description: 'Clear answers, without the back and forth.',
    statuses: ['draft', 'published', 'archived'],
    fields: [
      f('answer', 'Answer', 'markdown'),
      f('category', 'Category', 'select', 'Overview', [
        'General',
        'Web Pentesting',
        'API Security',
        'Mobile',
        'Careers',
        'Privacy',
      ]),
      f('order', 'Display order', 'number'),
    ],
  },
  team: {
    label: 'Team',
    singular: 'Team member',
    description: 'Real people. Real expertise.',
    statuses: ['draft', 'published', 'archived'],
    fields: [
      f('role', 'Role'),
      f('bio', 'Bio', 'markdown'),
      f('photo', 'Photo URL', 'url'),
      f('linkedin', 'LinkedIn', 'url', 'Links'),
      f('github', 'GitHub', 'url', 'Links'),
      f('website', 'Personal website', 'url', 'Links'),
      f('specialisms', 'Specialisms', 'textarea'),
      f('order', 'Display order', 'number'),
    ],
  },
  leads: {
    label: 'Leads',
    singular: 'Lead',
    description: 'Every conversation is a new possibility.',
    statuses: ['new', 'contacted', 'qualified', 'scoping', 'proposal', 'won', 'lost', 'archived'],
    fields: [
      f('company', 'Company'),
      f('name', 'Contact name'),
      f('email', 'Email', 'email'),
      f('website', 'Website', 'url'),
      f('services', 'Requested services', 'textarea', 'Scope'),
      f('environment', 'Environment', 'textarea', 'Scope'),
      f('application_count', 'Application count', 'number', 'Scope'),
      f('roles', 'Roles', 'textarea', 'Scope'),
      f('timeline', 'Preferred timeline', undefined, 'Scope'),
      f('compliance', 'Compliance requirements', undefined, 'Scope'),
      f('message', 'Customer notes', 'textarea', 'Scope'),
      f('value', 'Estimated value', 'number', 'Internal'),
      f('next_action', 'Next action', undefined, 'Internal'),
      f('assigned_to', 'Assigned person', undefined, 'Internal'),
      f('proposal', 'Proposal reference', undefined, 'Internal'),
      f('source', 'Lead source', undefined, 'Internal'),
    ],
  },
  applications: {
    label: 'Applications',
    singular: 'Application',
    description: 'Find the people who see what others miss.',
    statuses: [
      'new',
      'reviewing',
      'shortlisted',
      'interview',
      'assignment',
      'offer',
      'hired',
      'rejected',
      'withdrawn',
      'archived',
    ],
    fields: [
      f('name', 'Candidate name'),
      f('email', 'Email', 'email'),
      f('phone', 'Phone'),
      f('job_title', 'Applied for'),
      f('linkedin', 'LinkedIn', 'url', 'Profile'),
      f('github', 'GitHub', 'url', 'Profile'),
      f('portfolio', 'Portfolio', 'url', 'Profile'),
      f('experience', 'Experience', undefined, 'Profile'),
      f('introduction', 'Introduction', 'textarea', 'Profile'),
      f('why', 'Why Xarmoured?', 'textarea', 'Profile'),
      f('research', 'Security research', 'textarea', 'Profile'),
      f('resume_path', 'Private resume path', undefined, 'Profile'),
    ],
  },
  navigation: {
    label: 'Navigation',
    singular: 'Navigation link',
    description: 'Keep the next step intuitive.',
    statuses: ['published', 'inactive'],
    fields: [
      f('destination', 'Destination', 'url'),
      f('placement', 'Placement', 'select', 'Overview', ['header', 'footer']),
      f('external', 'External link', 'checkbox'),
      f('order', 'Display order', 'number'),
    ],
  },
  announcements: {
    label: 'Announcements',
    singular: 'Announcement',
    description: 'Share what matters, at the right moment.',
    statuses: ['draft', 'published', 'inactive'],
    fields: [
      f('message', 'Message', 'textarea'),
      f('cta', 'CTA label'),
      f('destination', 'Destination', 'url'),
      f('starts_at', 'Start date', 'date'),
      f('ends_at', 'End date', 'date'),
    ],
  },
  redirects: {
    label: 'Redirects',
    singular: 'Redirect',
    description: 'Keep your URLs connected as your content evolves.',
    statuses: ['published', 'inactive'],
    fields: [
      f('from', 'Old URL'),
      f('to', 'New destination', 'url'),
      f('code', 'HTTP code', 'select', 'Overview', ['301', '302']),
    ],
  },
  settings: {
    label: 'Settings',
    singular: 'Site settings',
    description: 'The essentials that keep Xarmoured running.',
    statuses: ['published'],
    fields: [
      f('company', 'Company display name', undefined, 'Company'),
      f('description', 'Short description', 'textarea', 'Company'),
      f('legal_name', 'Legal entity name', undefined, 'Company'),
      f('country', 'Country', undefined, 'Company'),
      f('address', 'Address', 'textarea', 'Company'),
      f('phone', 'Phone', undefined, 'Contact'),
      f('sales_email', 'Sales email', 'email', 'Contact'),
      f('support_email', 'Support email', 'email', 'Contact'),
      f('careers_email', 'Careers email', 'email', 'Contact'),
      f('security_email', 'Security email', 'email', 'Contact'),
      f('linkedin', 'LinkedIn', 'url', 'Social'),
      f('github', 'GitHub', 'url', 'Social'),
      f('twitter', 'X / Twitter', 'url', 'Social'),
      f('youtube', 'YouTube', 'url', 'Social'),
      f('founder_website', 'Founder website', 'url', 'Social'),
      f('assessment_enabled', 'Enable assessment requests', 'checkbox', 'Sales'),
      f('booking_url', 'Cal.com booking URL', 'url', 'Sales'),
      f('sales_cta', 'Primary sales CTA', undefined, 'Sales'),
      f('lead_source', 'Default lead source', undefined, 'Sales'),
      f('careers_enabled', 'Enable careers', 'checkbox', 'Features'),
      f('general_applications', 'Accept general applications', 'checkbox', 'Features'),
      f('research_enabled', 'Enable research', 'checkbox', 'Features'),
      f('labs_enabled', 'Enable Labs', 'checkbox', 'Features'),
      f('sample_report_enabled', 'Enable sample report', 'checkbox', 'Features'),
      f('announcements_enabled', 'Enable announcements', 'checkbox', 'Features'),
      f('remote', 'Default remote status', undefined, 'Careers'),
      f('application_confirmation', 'Application confirmation message', 'textarea', 'Careers'),
      f('assessment_received', 'Assessment received email', 'textarea', 'Email templates'),
      f('application_received', 'Application received email', 'textarea', 'Email templates'),
      f('interview_invitation', 'Interview invitation email', 'textarea', 'Email templates'),
      f('application_rejection', 'Application rejection email', 'textarea', 'Email templates'),
      f('onboarding_dismissed', 'Dismiss setup checklist', 'checkbox', 'Preferences'),
    ],
  },
  seo: {
    label: 'SEO',
    singular: 'SEO settings',
    description: 'Make the first impression count.',
    statuses: ['published'],
    fields: [
      f('default_title', 'Default title'),
      f('title_template', 'Title template'),
      f('description', 'Default description', 'textarea'),
      f('og_image', 'Default OG image', 'url'),
      f('site_url', 'Site URL', 'url'),
      f('organization', 'Organization description', 'textarea'),
    ],
  },
  reports: {
    label: 'Sample reports',
    singular: 'Sample report',
    description: 'Show clients exactly what to expect.',
    statuses: ['draft', 'published', 'archived'],
    publicPath: '/sample-report',
    fields: [
      f('description', 'Description', 'textarea'),
      f('version', 'Version'),
      f('file', 'Report URL', 'url'),
    ],
  },
  media: {
    label: 'Media',
    singular: 'Asset',
    description: 'Your assets, organized and protected.',
    statuses: ['published', 'private', 'archived'],
    fields: [
      f('description', 'Description', 'textarea'),
      f('alt', 'Alternative text'),
      f('url', 'Asset URL', 'url'),
      f('bucket', 'Bucket', 'select', 'Overview', ['public-assets', 'private-internal']),
    ],
  },
  activity: {
    label: 'Activity',
    singular: 'Event',
    description: 'A clear record of every meaningful change.',
    statuses: [],
    fields: [],
    readOnly: true,
  },
  notifications: {
    label: 'Notifications',
    singular: 'Notification',
    description: 'The updates that need your attention.',
    statuses: ['unread', 'read'],
    fields: [f('message', 'Message', 'textarea'), f('destination', 'Open record', 'url')],
  },
};
export function can(role: Role, permission: string) {
  const [resource, action] = permission.split(':');
  if (action === 'read' && resource === 'dashboard') return true;
  if (role === 'owner') return true;
  if (role === 'admin') return resource !== 'accounts';
  if (action === 'read')
    return (
      (role === 'viewer' && resource === 'analytics') ||
      (role === 'editor' &&
        [
          'pages',
          'services',
          'research',
          'faqs',
          'team',
          'media',
          'reports',
          'navigation',
          'announcements',
          'seo',
          'activity',
        ].includes(resource)) ||
      (role === 'recruiter' &&
        ['jobs', 'applications', 'activity', 'notifications'].includes(resource))
    );
  return (
    (role === 'editor' &&
      [
        'pages',
        'services',
        'research',
        'faqs',
        'team',
        'media',
        'reports',
        'navigation',
        'announcements',
        'seo',
      ].includes(resource)) ||
    (role === 'recruiter' && ['jobs', 'applications'].includes(resource))
  );
}
export function safeUrl(value: string, internal = true) {
  if (internal && /^\/(?!\/)[^\\\s]*$/.test(value)) return true;
  try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password;
  } catch {
    return false;
  }
}
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export function recordSchema(module: string) {
  const config = modules[module];
  if (!config) throw new Error('Unknown module');
  return z
    .object({
      title: z.string().trim().min(2).max(180),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(180),
      status: z.enum(config.statuses as [string, ...string[]]),
      data: z.record(
        z.string(),
        z.union([z.string().max(100000), z.number().finite(), z.boolean(), z.null()])
      ),
    })
    .superRefine((record, ctx) => {
      for (const field of config.fields) {
        const value = record.data[field.key];
        if (field.type === 'url' && value && !safeUrl(String(value)))
          ctx.addIssue({
            code: 'custom',
            path: ['data', field.key],
            message: 'Use a safe https URL or an internal path.',
          });
        if (field.type === 'email' && value && !z.email().safeParse(value).success)
          ctx.addIssue({
            code: 'custom',
            path: ['data', field.key],
            message: 'Enter a valid email.',
          });
        if (field.options && value && !field.options.includes(String(value)))
          ctx.addIssue({
            code: 'custom',
            path: ['data', field.key],
            message: 'Choose a supported option.',
          });
      }
      if (
        module === 'research' &&
        record.status === 'published' &&
        record.data.disclosure !== 'public'
      )
        ctx.addIssue({
          code: 'custom',
          path: ['data', 'disclosure'],
          message: 'Only PUBLIC disclosure research can be published.',
        });
      if (
        module === 'research' &&
        record.data.cvss &&
        (Number(record.data.cvss) < 0 || Number(record.data.cvss) > 10)
      )
        ctx.addIssue({
          code: 'custom',
          path: ['data', 'cvss'],
          message: 'CVSS must be between 0 and 10.',
        });
      if (
        module === 'redirects' &&
        (!String(record.data.from || '').startsWith('/') || record.data.from === record.data.to)
      )
        ctx.addIssue({
          code: 'custom',
          path: ['data', 'from'],
          message: 'Use an internal source path and a different destination.',
        });
    });
}
export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  company: z.string().trim().min(2).max(180),
  services: z.string().min(2).max(500),
  website: z.string().max(500).optional(),
  environment: z.string().max(3000).optional(),
  timeline: z.string().max(200).optional(),
  compliance: z.string().max(500).optional(),
  application_count: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().min(1).max(10000).optional()
  ),
  roles: z.string().max(1000).optional(),
  message: z.string().max(5000).optional(),
});
export const applicationSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email(),
    phone: z.string().max(60).optional(),
    job_id: z.string().max(100),
    linkedin: z.string().max(500).optional(),
    github: z.string().max(500).optional(),
    portfolio: z.string().max(500).optional(),
    experience: z.string().max(200).optional(),
    introduction: z.string().trim().min(20).max(6000),
    why: z.string().max(4000).optional(),
    research: z.string().max(4000).optional(),
  })
  .refine((v) => [v.linkedin, v.github, v.portfolio].every((x) => !x || safeUrl(x, false)), {
    message: 'Profile links must use https or http.',
  });
