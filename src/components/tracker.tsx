'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
export function AnalyticsTracker() {
  const path = usePathname();
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('preview') === 'true') return;
    const event = path.startsWith('/services/')
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
  return null;
}
