import 'server-only';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { cache } from 'react';
import Link from 'next/link';
import { listRecords } from './server';
import type { RecordData } from './modules';
export const seoSettings = cache(async () => (await listRecords('seo', true))[0]?.data || {});
export async function siteOrigin() {
  const seo = await seoSettings();
  try {
    const u = new URL(seo.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    return ['https:', 'http:'].includes(u.protocol) ? u.origin : 'http://localhost:3000';
  } catch {
    return 'http://localhost:3000';
  }
}
const descriptions: Record<string, string> = {
  services:
    'Explore published offensive security and security engineering services, testing scope, deliverables and retesting.',
  research:
    'Security research, responsibly disclosed advisories, technical write-ups and tools from Xarmoured.',
  resources: 'Reviewed security guides, technical articles, checklists and reports from Xarmoured.',
  methodology:
    'From scope and rules of engagement to manual testing, evidence, remediation and retest verification.',
  about:
    'The principles behind Xarmoured: careful investigation, reproducible evidence and security engineering.',
  careers:
    'Explore published roles at Xarmoured and how we work across offensive security and research.',
  assessment:
    'Define your security assessment: systems, access, environment, objectives and preferred timeline.',
  contact: 'Contact Xarmoured to discuss security testing and assessment scope.',
  security: 'How to report a suspected security issue involving Xarmoured-owned systems.',
  'sample-report':
    'Explore the structure of a security assessment report, from executive summary to retest evidence.',
  privacy: 'How Xarmoured handles assessment enquiries, career applications and website data.',
  terms: 'Website terms and the boundaries of authorized security testing engagements.',
};
export async function pageMetadata(
  path: string,
  title: string,
  description?: string,
  preview = false,
  image?: string
): Promise<Metadata> {
  const seo = await seoSettings();
  const url = new URL(path, await siteOrigin()).toString();
  const summary =
    description ||
    descriptions[path.split('/')[1]] ||
    seo.description ||
    'Offensive security and security engineering, grounded in evidence.';
  const images = image || seo.og_image;
  return {
    title: { absolute: title.includes('Xarmoured') ? title : `${title} — Xarmoured` },
    description: summary,
    alternates: { canonical: url },
    robots: preview ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: summary,
      url,
      type: 'website',
      ...(images ? { images: [images] } : {}),
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description: summary,
      ...(images ? { images: [images] } : {}),
    },
  };
}
export async function JsonLd({ data }: { data: Record<string, unknown> }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }}
    />
  );
}
export async function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const base = await siteOrigin();
  return (
    <>
      <nav className="xa-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {items.map((x, i) => (
          <span key={x.href}>
            <span aria-hidden="true"> / </span>
            {i === items.length - 1 ? (
              <span aria-current="page">{x.label}</span>
            ) : (
              <Link href={x.href}>{x.label}</Link>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [{ label: 'Home', href: '/' }, ...items].map((x, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: x.label,
            item: new URL(x.href, base).toString(),
          })),
        }}
      />
    </>
  );
}
export async function DetailSchema({
  record: r,
  section,
  settings,
}: {
  record: RecordData;
  section: string;
  settings: Record<string, any>;
}) {
  const base = await siteOrigin();
  const url = `${base}/${section}/${r.slug}`;
  const org = { '@type': 'Organization', name: settings.company || 'Xarmoured', url: base };
  if (section === 'services')
    return (
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: r.title,
          description: r.data.summary,
          url,
          provider: org,
          serviceType: r.data.category || 'Offensive Security',
        }}
      />
    );
  if (['research', 'resources'].includes(section) && r.data.content)
    return (
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': section === 'research' ? 'TechArticle' : 'Article',
          headline: r.title,
          description: r.data.summary,
          url,
          datePublished: r.data.publication_date || r.published_at || r.created_at,
          dateModified: r.updated_at,
          author: r.data.researcher ? { '@type': 'Person', name: r.data.researcher } : org,
          publisher: org,
          ...(r.data.og_image ? { image: r.data.og_image } : {}),
        }}
      />
    );
  const open =
    r.status === 'open' &&
    r.data.accept_applications !== false &&
    (!r.data.deadline || r.data.deadline >= new Date().toISOString().slice(0, 10));
  if (
    section === 'careers' &&
    open &&
    r.data.description &&
    r.data.location &&
    r.data.job_country &&
    r.published_at
  )
    return (
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: r.title,
          description: [r.data.description, r.data.responsibilities, r.data.requirements]
            .filter(Boolean)
            .join('\n'),
          datePosted: r.published_at,
          ...(r.data.deadline ? { validThrough: `${r.data.deadline}T23:59:59Z` } : {}),
          hiringOrganization: org,
          url,
          employmentType: (
            {
              'Full time': 'FULL_TIME',
              'Part time': 'PART_TIME',
              Contract: 'CONTRACTOR',
              Internship: 'INTERN',
            } as Record<string, string>
          )[r.data.employment],
          ...(r.data.remote === 'remote'
            ? {
                jobLocationType: 'TELECOMMUTE',
                applicantLocationRequirements: { '@type': 'Country', name: r.data.job_country },
              }
            : {
                jobLocation: {
                  '@type': 'Place',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: r.data.location,
                    addressCountry: r.data.job_country,
                  },
                },
              }),
        }}
      />
    );
  return null;
}
