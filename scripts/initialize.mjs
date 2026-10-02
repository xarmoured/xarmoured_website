import { createClient } from '@supabase/supabase-js';
if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
  throw new Error('Set server credentials before initialization.');
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const rows = [
  {
    module: 'settings',
    title: 'Website settings',
    slug: 'site',
    status: 'published',
    data: {
      company: 'Xarmoured',
      assessment_enabled: true,
      careers_enabled: true,
      research_enabled: true,
      sample_report_enabled: true,
      announcements_enabled: true,
      general_applications: false,
    },
  },
  {
    module: 'pages',
    title: 'Homepage',
    slug: 'home',
    status: 'published',
    data: {
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
    },
  },
  {
    module: 'seo',
    title: 'Global SEO',
    slug: 'global',
    status: 'published',
    data: {
      default_title: 'Xarmoured — Penetration Testing & Security Engineering',
      title_template: '%s — Xarmoured',
      description:
        'Manual penetration testing, actionable research, and security engineering. Built by practitioners.',
    },
  },
];
for (const row of rows) {
  const { error } = await db
    .from('records')
    .upsert(row, { onConflict: 'module,slug', ignoreDuplicates: true });
  if (error) throw error;
}
console.log(
  'Necessary configuration initialized. No fake jobs, people, research, leads, or business claims were inserted.'
);
