'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, ChevronDown, Sun, Moon, Monitor } from 'lucide-react';
import { Brand } from './ui';
import type { RecordData } from '@/lib/modules';
export function ThemeControl() {
  const [theme, setTheme] = useState('system');
  useEffect(() => {
    try {
      setTheme(localStorage.getItem('xa-theme') || 'system');
    } catch {}
  }, []);
  const change = (next: string) => {
    setTheme(next);
    try {
      localStorage.setItem('xa-theme', next);
    } catch {}
    document.documentElement.dataset.theme =
      next === 'system'
        ? matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : next;
    window.dispatchEvent(new Event('xa-theme-change'));
  };
  return (
    <label className="xa-theme-control">
      <span className="sr-only">Color theme</span>
      {theme === 'light' ? (
        <Sun size={17} aria-hidden="true" />
      ) : theme === 'dark' ? (
        <Moon size={17} aria-hidden="true" />
      ) : (
        <Monitor size={17} aria-hidden="true" />
      )}
      <select aria-label="Color theme" value={theme} onChange={(e) => change(e.target.value)}>
        <option value="system">System</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </label>
  );
}
export function PublicHeader({
  links,
  settings,
  services = [],
  categories = [],
}: {
  links: RecordData[];
  settings: Record<string, any>;
  services?: RecordData[];
  categories?: RecordData[];
}) {
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const desktop = useRef<HTMLDivElement>(null);
  const serviceButton = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  const previousPath = useRef(path);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (previousPath.current !== path) {
      setMenu(false);
      setMega(false);
      previousPath.current = path;
    }
  }, [path]);
  useEffect(() => {
    if (menu) dialog.current?.showModal();
    else dialog.current?.close();
    if (!menu) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, [menu]);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      try {
        if (!localStorage.getItem('xa-theme') || localStorage.getItem('xa-theme') === 'system')
          document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
      } catch {}
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!mega) return;
    const close = (e: PointerEvent) => {
      if (!desktop.current?.contains(e.target as Node)) setMega(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMega(false);
        serviceButton.current?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [mega]);
  const custom = links
    .filter((r) => r.data.placement === 'header')
    .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  const nav = custom.length
    ? custom.map((r) => ({ label: r.title, href: r.data.destination }))
    : [
        ...(settings.research_enabled !== false ? [{ label: 'Research', href: '/research' }] : []),
        { label: 'Approach', href: '/methodology' },
        { label: 'Resources', href: '/resources' },
        { label: 'Company', href: '/about' },
        ...(settings.careers_enabled !== false ? [{ label: 'Careers', href: '/careers' }] : []),
      ];
  const groups = [...new Set(services.map((s) => s.data.category || 'Offensive Security'))].sort(
    (a, b) =>
      Number(categories.find((c) => c.title === a)?.data.order || 0) -
      Number(categories.find((c) => c.title === b)?.data.order || 0)
  );
  const serviceLinks = (
    <>
      {groups.map((g) => (
        <div className="xa-mega-group" key={g}>
          <span className="eyebrow">{g}</span>
          {categories.find((c) => c.title === g)?.data.summary && (
            <p>{categories.find((c) => c.title === g)!.data.summary}</p>
          )}
          {services
            .filter((s) => (s.data.category || 'Offensive Security') === g)
            .map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                onClick={() => {
                  setMega(false);
                  setMenu(false);
                }}
              >
                {s.title}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            ))}
        </div>
      ))}
    </>
  );
  return (
    <header className="public-header">
      <div className="public-nav">
        <Brand />
        <div
          className="xa-desktop-nav"
          ref={desktop}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setMega(false);
          }}
        >
          <nav aria-label="Main navigation">
            <button
              ref={serviceButton}
              disabled={!ready}
              aria-expanded={mega}
              aria-controls="xa-services-menu"
              onClick={() => setMega(!mega)}
            >
              Services <ChevronDown size={13} aria-hidden="true" />
            </button>
            {nav
              .filter((n) => n.href !== '/services')
              .map((n) => (
                <Link
                  key={n.href}
                  aria-current={path === n.href ? 'page' : undefined}
                  href={n.href}
                >
                  {n.label}
                </Link>
              ))}
          </nav>
          {mega && (
            <div id="xa-services-menu" className="xa-mega-menu">
              <div className="xa-mega-intro">
                <span className="eyebrow">THE PRACTICE</span>
                <h2>
                  Test the boundary.
                  <br />
                  Understand the risk.
                </h2>
                <Link className="text-link" href="/services" onClick={() => setMega(false)}>
                  All services <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <Link className="text-link" href="/methodology">
                  How we work →
                </Link>
              </div>
              {services.length ? (
                serviceLinks
              ) : (
                <div className="xa-mega-group">
                  <h3>Define the right scope.</h3>
                  <p>Discuss your system and testing objectives with a practitioner.</p>
                  <Link href="/assessment">Request an assessment →</Link>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="xa-nav-actions">
          <ThemeControl />
          <Link className="nav-contact" href="/assessment">
            <span className="cta-label">{settings.sales_cta || 'Request an assessment'}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <button
            className="menu-toggle"
            aria-label="Open navigation"
            disabled={!ready}
            aria-haspopup="dialog"
            aria-expanded={menu}
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
        </div>
      </div>
      <dialog
        className="xa-mobile-nav"
        ref={dialog}
        aria-label="Mobile navigation"
        onKeyDown={(e) => {
          if (e.key !== 'Tab') return;
          const targets = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.tabIndex >= 0 && el.checkVisibility());
          const first = targets[0];
          const last = targets[targets.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => setMenu(false)}
      >
        <div className="xa-mobile-top">
          <Brand />
          <button aria-label="Close navigation" onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>
        <nav aria-label="Mobile main navigation">
          <details>
            <summary>
              Services <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <Link href="/services" onClick={() => setMenu(false)}>
              All services →
            </Link>
            {serviceLinks}
          </details>
          {nav
            .filter((n) => n.href !== '/services')
            .map((n) => (
              <Link href={n.href} key={n.href} onClick={() => setMenu(false)}>
                {n.label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
          <Link href="/contact" onClick={() => setMenu(false)}>
            Contact
          </Link>
        </nav>
        <Link className="button" href="/assessment" onClick={() => setMenu(false)}>
          Request an assessment <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </dialog>
    </header>
  );
}
export function PublicFooter({
  settings,
  links,
  services = [],
}: {
  settings: Record<string, any>;
  links: RecordData[];
  services?: RecordData[];
}) {
  return (
    <footer className="public-footer wrap">
      <div className="xa-footer-brand">
        <Brand />
        <p>
          Offensive Security &<br />
          Security Engineering
        </p>
        <span className="mono">FIND / UNDERSTAND / FIX / VERIFY</span>
      </div>
      <div>
        <span className="eyebrow">SERVICES</span>
        {services.slice(0, 6).map((s) => (
          <Link key={s.id} href={`/services/${s.slug}`}>
            {s.title}
          </Link>
        ))}
        <Link href="/assessment">Request an assessment ↗</Link>
        <Link href="/methodology">Our approach</Link>
      </div>
      <div>
        <span className="eyebrow">EXPLORE</span>
        {settings.research_enabled !== false && <Link href="/research">Research</Link>}
        <Link href="/resources">Resources</Link>
        {settings.sample_report_enabled !== false && (
          <Link href="/sample-report">Sample report</Link>
        )}
        <Link href="/about">Company</Link>
        {settings.careers_enabled !== false && <Link href="/careers">Careers</Link>}
        {links
          .filter((r) => r.data.placement === 'footer')
          .map((r) => (
            <Link key={r.id} href={r.data.destination}>
              {r.title}
            </Link>
          ))}
      </div>
      <div>
        <span className="eyebrow">GET IN TOUCH</span>
        <Link href="/contact">Contact</Link>
        {settings.sales_email && (
          <a href={`mailto:${settings.sales_email}`}>{settings.sales_email}</a>
        )}
        <Link href="/security">Responsible disclosure</Link>
        <a href="/.well-known/security.txt">Security.txt</a>
        {['linkedin', 'github', 'twitter', 'youtube'].map(
          (k) =>
            settings[k] && (
              <a href={settings[k]} key={k} rel="noopener noreferrer">
                {k === 'twitter' ? 'X / Twitter' : k}
              </a>
            )
        )}
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {settings.legal_name || settings.company || 'Xarmoured'}
          {settings.country ? ` · ${settings.country}` : ''}
        </span>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <span className="xa-footer-signal">
          <i /> Evidence over assumptions.
        </span>
      </div>
    </footer>
  );
}
