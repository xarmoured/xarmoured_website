import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui';
import { Markdown } from '@/components/markdown';
import { getRecord } from '@/lib/server';
import { pageMetadata } from '@/lib/seo';
/* Content lives in the CMS (pages: platform). This fallback shows only until that record exists. */
const fallback = {
  headline: 'ExploitLedger',
  summary:
    'An AI-assisted vulnerability assessment and remediation management platform, in development at Xarmoured.',
  content:
    '## Availability\n\nExploitLedger is in development and has no public release. Demo and early-access conversations are handled by enquiry.',
};
const subpages = [
  ['Features', '/exploitledger-features', 'What the platform manages, and what is planned.'],
  ['Workflow', '/exploitledger-workflow', 'From engagement to verified remediation.'],
  ['Architecture', '/exploitledger-architecture', 'The conceptual model behind the platform.'],
];
export async function generateMetadata() {
  const r = await getRecord('pages', 'platform', true);
  return pageMetadata(
    '/platform',
    r?.data.seo_title || 'ExploitLedger — vulnerability assessment and remediation platform | Xarmoured',
    r?.data.seo_description ||
      'ExploitLedger is an AI-assisted vulnerability assessment and remediation management platform in development from Xarmoured.'
  );
}
export default async function PlatformPage() {
  const r = await getRecord('pages', 'platform', true);
  const d = r?.data || fallback;
  return (
    <>
      <section className="xa-hero wrap xe-platform-hero">
        <div className="xa-hero-copy">
          <span className="xa-tag">PRODUCT · IN DEVELOPMENT</span>
          <h1 className="xe-tagline xe-single">
            <span>{d.headline || fallback.headline}</span>
          </h1>
          <p>{d.summary || fallback.summary}</p>
          <div className="button-row">
            <ButtonLink href="/assessment">Request a demo</ButtonLink>
            <Link className="text-link" href="/exploitledger-features">
              See features <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="xa-hero-visual">
          <div className="xe-shot" role="note">
            <strong>Product screenshots</strong>
            <span>Not yet published. Real screenshots will replace this panel when available.</span>
          </div>
        </div>
      </section>
      <section className="wrap xa-section xe-disciplines">
        <div className="prose">
          <Markdown>{d.content || fallback.content}</Markdown>
        </div>
        {subpages.map(([t, h, b]) => (
          <Link className="xe-row" href={h} key={h}>
            <h3>{t}</h3>
            <div>
              <p>{b}</p>
            </div>
            <span className="text-link">
              Read <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
