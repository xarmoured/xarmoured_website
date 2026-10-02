import { PublicHeader, PublicFooter } from '@/components/public-shell';
import { listRecords, siteSettings, isDemo } from '@/lib/server';
import { AnalyticsTracker } from '@/components/tracker';
export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const seo = (await listRecords('seo', true))[0]?.data || {};
  let metadataBase: URL | undefined;
  try {
    if (seo.site_url) metadataBase = new URL(seo.site_url);
  } catch {}
  return {
    metadataBase,
    description: seo.description || undefined,
    openGraph: { images: seo.og_image ? [seo.og_image] : [] },
  };
}
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, links, announcements] = await Promise.all([
    siteSettings(),
    listRecords('navigation', true),
    listRecords('announcements', true),
  ]);
  const now = new Date().toISOString().slice(0, 10);
  const seo = (await listRecords('seo', true))[0]?.data || {};
  const banner =
    settings.announcements_enabled !== false
      ? announcements.find(
          (r) =>
            (!r.data.starts_at || r.data.starts_at <= now) &&
            (!r.data.ends_at || r.data.ends_at >= now)
        )
      : null;
  return (
    <>
      {seo.site_url && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: settings.company || 'Xarmoured',
              url: seo.site_url,
              ...(seo.organization ? { description: seo.organization } : {}),
              ...(settings.sales_email ? { email: settings.sales_email } : {}),
            }).replaceAll('<', '\\u003c'),
          }}
        />
      )}
      <PublicHeader settings={settings} links={links} />
      {isDemo && (
        <div className="demo-banner">
          DEVELOPMENT DEMO · All sample jobs, research, leads, and applications are fictional.
        </div>
      )}
      {banner && (
        <div className="announcement">
          {banner.data.message}{' '}
          {banner.data.destination && (
            <a href={banner.data.destination}>{banner.data.cta || 'Learn more'} →</a>
          )}
        </div>
      )}
      <main id="main">{children}</main>
      <PublicFooter settings={settings} links={links} />
      <AnalyticsTracker />
    </>
  );
}
