'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
export function AnalyticsTracker() {
  const path = usePathname();
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === 'true') return;
    const event =
      path === '/sample-report'
        ? 'sample_report_view'
        : path.startsWith('/careers/') && path !== '/careers/general'
          ? 'job_view'
          : path.startsWith('/services/')
            ? 'service_view'
            : path.startsWith('/research/')
              ? 'research_view'
              : path.startsWith('/careers')
                ? 'careers_view'
                : 'page_view';
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, path }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
  useEffect(() => {
    const track = (e: MouseEvent) => {
      if (new URLSearchParams(window.location.search).get('preview') === 'true') return;
      const link = (e.target as Element).closest('a');
      if (link?.getAttribute('href') !== '/assessment') return;
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'cta_used', path: window.location.pathname }),
        keepalive: true,
      }).catch(() => {});
    };
    document.addEventListener('click', track);
    return () => document.removeEventListener('click', track);
  }, []);
  return null;
}
