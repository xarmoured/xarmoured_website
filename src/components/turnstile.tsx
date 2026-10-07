'use client';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
type Api = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
export function Turnstile({ retry, nonce }: { retry: number; nonce?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const api = () => (window as Window & { turnstile?: Api }).turnstile;
  function render() {
    if (container.current && api() && widget.current === undefined)
      widget.current = api()!.render(container.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        theme: 'auto',
        size: 'flexible',
      });
  }
  useEffect(() => {
    render();
    return () => {
      if (widget.current !== undefined) api()?.remove(widget.current);
      widget.current = undefined;
    };
  }, []);
  useEffect(() => {
    if (retry && widget.current !== undefined) api()?.reset(widget.current);
  }, [retry]);
  return (
    <>
      <Script
        nonce={nonce}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={render}
      />
      <div ref={container} />
    </>
  );
}
