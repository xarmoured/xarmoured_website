'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Brand } from './ui';
import type { RecordData } from '@/lib/modules';
export function PublicHeader({
  links,
  settings,
}: {
  links: RecordData[];
  settings: Record<string, any>;
}) {
  const [open, setOpen] = useState(false);
  const nav = links.length
    ? links
        .filter((r) => r.data.placement === 'header')
        .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
        .map((r) => ({ label: r.title, href: r.data.destination }))
    : [
        { label: 'Services', href: '/services' },
        { label: 'Our approach', href: '/methodology' },
        ...(settings.research_enabled !== false ? [{ label: 'Research', href: '/research' }] : []),
        { label: 'About', href: '/about' },
        ...(settings.careers_enabled !== false ? [{ label: 'Careers', href: '/careers' }] : []),
      ];
  return (
    <header className="public-header">
      <div className="public-nav">
        <Brand />
        <nav aria-label="Main navigation" className={open ? 'open' : ''}>
          {nav.map((n) => (
            <Link href={n.href} key={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link className="nav-contact" href="/assessment">
          <span className="cta-label">{settings.sales_cta || 'Let’s talk'}</span>{' '}
          <ArrowUpRight size={15} />
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function PublicFooter({
  settings,
  links,
}: {
  settings: Record<string, any>;
  links: RecordData[];
}) {
  return (
    <footer className="public-footer wrap">
      <div>
        <Brand />
        <p>
          {settings.description || (
            <>
              Offensive security.
              <br />
              Defensive confidence.
            </>
          )}
        </p>
      </div>
      <div>
        <span className="eyebrow">EXPLORE</span>
        <Link href="/services">Services</Link>
        <Link href="/methodology">Our approach</Link>
        {settings.research_enabled !== false && <Link href="/research">Research</Link>}
        {settings.careers_enabled !== false && <Link href="/careers">Careers</Link>}
        {links
          .filter((r) => r.data.placement === 'footer')
          .map((r) => (
            <Link href={r.data.destination} key={r.id}>
              {r.title}
            </Link>
          ))}
      </div>
      <div>
        <span className="eyebrow">START A CONVERSATION</span>
        {settings.sales_email && (
          <a href={`mailto:${settings.sales_email}`}>
            {settings.sales_email} <ArrowUpRight size={14} />
          </a>
        )}
        {['linkedin', 'github', 'twitter', 'youtube'].map(
          (k) =>
            settings[k] && (
              <a href={settings[k]} key={k} rel="noopener noreferrer">
                {k}
              </a>
            )
        )}
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {settings.company || 'Xarmoured'}. Built by practitioners.
        </span>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
    </footer>
  );
}
