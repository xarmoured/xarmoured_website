'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Layers,
  FlaskConical,
  MessageCircle,
  Image,
  Briefcase,
  Users,
  ChartNoAxesCombined,
  Settings,
  History,
  PanelLeftClose,
  Search,
  Bell,
  ArrowUpRight,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Command,
  Globe,
  UserRound,
  Link2,
  Radio,
  Route,
} from 'lucide-react';
import { Brand } from './ui';
import { can, type Role, type RecordData } from '@/lib/modules';
import { logout } from '@/app/admin/actions';
const groups = [
  { label: 'WORKSPACE', items: [['', 'Overview', LayoutDashboard]] },
  { label: 'SALES', items: [['leads', 'Leads', Inbox]] },
  {
    label: 'CONTENT',
    items: [
      ['pages', 'Pages', FileText],
      ['services', 'Services', Layers],
      ['research', 'Research', FlaskConical],
      ['faqs', 'FAQs', MessageCircle],
      ['team', 'Team', Users],
      ['media', 'Media library', Image],
      ['reports', 'Sample reports', FileText],
      ['announcements', 'Announcements', Radio],
    ],
  },
  {
    label: 'CAREERS',
    items: [
      ['jobs', 'Jobs', Briefcase],
      ['applications', 'Applications', Users],
    ],
  },
  { label: 'INSIGHTS', items: [['analytics', 'Analytics', ChartNoAxesCombined]] },
  {
    label: 'SYSTEM',
    items: [
      ['navigation', 'Navigation', Link2],
      ['seo', 'SEO', Globe],
      ['redirects', 'Redirects', Route],
      ['settings', 'Settings', Settings],
      ['activity', 'Activity', History],
    ],
  },
] as const;
export function AdminShell({
  children,
  user,
  demo,
  searchRecords,
  notificationCount,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: Role };
  demo: boolean;
  searchRecords: { module: string; record: RecordData }[];
  notificationCount: number;
}) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [command, setCommand] = useState(false);
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (command) dialog.current?.showModal();
    else dialog.current?.close();
  }, [command]);
  useEffect(() => {
    setMobile(false);
    setCommand(false);
  }, [path]);
  const actions = [
    ['Create job', '/admin/jobs/new'],
    ['Publish research', '/admin/research/new'],
    ['Edit homepage', '/admin/pages/home'],
    ['View applicants', '/admin/applications'],
    ['Find lead', '/admin/leads'],
    ['Create FAQ', '/admin/faqs/new'],
    ['Open settings', '/admin/settings'],
    ['View analytics', '/admin/analytics'],
  ].filter((a) =>
    can(user.role, `${a[1].split('/')[2]}:${a[1].includes('new') ? 'update' : 'read'}`)
  );
  const results = searchRecords
    .filter(({ record }) =>
      `${record.title} ${record.data.email || ''} ${record.data.company || ''}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .slice(0, 12);
  const current = path.split('/').filter(Boolean).slice(1);
  return (
    <div className={`admin-app ${collapsed ? 'collapsed' : ''}`}>
      <aside className={`admin-sidebar ${mobile ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand small />
          <button
            onClick={() => setMobile(false)}
            className="mobile-close"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-selector">
          <span className="workspace-icon">X</span>
          <div>
            <strong>Xarmoured</strong>
            <span>{demo ? 'Development workspace' : 'Company workspace'}</span>
          </div>
          <span className="workspace-dot" />
        </div>
        <nav aria-label="Admin navigation">
          {groups
            .filter((g) => g.items.some(([key]) => !key || can(user.role, `${key}:read`)))
            .map((g) => (
              <div className="nav-group" key={g.label}>
                <span className="nav-group-label">{g.label}</span>
                {g.items.map(
                  ([key, label, Icon]) =>
                    (!key || can(user.role, `${key}:read`)) && (
                      <Link
                        className={`sidebar-link ${path === '/admin' + (key ? '/' + key : '') || (key && path.startsWith('/admin/' + key + '/')) ? 'active' : ''}`}
                        href={'/admin' + (key ? '/' + key : '')}
                        title={label}
                        key={key}
                      >
                        <Icon size={18} />
                        <span>{label}</span>
                        {key === 'leads' && <span className="nav-mini-label">CRM</span>}
                      </Link>
                    )
                )}
              </div>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" className="sidebar-link">
            <ArrowUpRight size={18} />
            <span>View website</span>
          </Link>
          <Link href="/admin/account" className="account-row">
            <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
            <span>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
          </Link>
          <form action={logout}>
            <button className="sidebar-link">
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <div className="breadcrumb">
            <button
              onClick={() => {
                if (window.innerWidth < 900) setMobile(!mobile);
                else setCollapsed(!collapsed);
              }}
              aria-label="Toggle sidebar"
            >
              <Menu className="mobile-menu-icon" size={18} />
              <PanelLeftClose className="desktop-menu-icon" size={18} />
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={13} />
            <span>{current[0] || 'Overview'}</span>
            {current.length > 1 && (
              <>
                <ChevronRight size={13} />
                <span>{current[1] === 'new' ? 'New' : 'Details'}</span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setCommand(true)}>
              <Search size={15} />
              <span>Search anything…</span>
              <kbd>⌘ K</kbd>
            </button>
            <Link
              className="notification-button"
              href="/admin/notifications"
              aria-label={`${notificationCount} unread notifications`}
            >
              <Bell size={18} />
              {notificationCount > 0 && <i />}
            </Link>
            <Link className="topbar-avatar avatar" href="/admin/account">
              {user.name.slice(0, 2).toUpperCase()}
            </Link>
          </div>
        </header>
        {demo && (
          <div className="admin-demo">
            DEMO WORKSPACE · Fictional records · Local persistence · Email disabled
          </div>
        )}
        <main className="admin-main" id="main">
          {children}
        </main>
        <footer className="admin-footer">
          <span>
            <i className="signal-dot" /> Xarmoured workspace
          </span>
          <span>
            {demo ? 'DEVELOPMENT' : 'SECURE ADMIN'} <span className="footer-sep">/</span> V1.0
          </span>
        </footer>
      </div>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-label="Search workspace"
        onClose={() => setCommand(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCommand(false);
        }}
      >
        <div className="command-input">
          <Search size={20} />
          <input
            autoFocus
            aria-label="Search records and actions"
            placeholder="What would you like to do?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setCommand(false)} aria-label="Close search">
            <kbd>ESC</kbd>
          </button>
        </div>
        <div className="command-results">
          <span className="eyebrow">QUICK ACTIONS</span>
          {actions
            .filter((a) => a[0].toLowerCase().includes(query.toLowerCase()))
            .map((a) => (
              <Link href={a[1]} key={a[1]}>
                <Command size={15} />
                {a[0]}
                <ArrowUpRight size={15} />
              </Link>
            ))}
          {query && (
            <>
              <span className="eyebrow">RECORDS</span>
              {results.map(({ module, record }) => (
                <Link key={record.id} href={`/admin/${module}/${record.id}`}>
                  <FileText size={15} />
                  <span>
                    {record.title}
                    <small>{module}</small>
                  </span>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
              {!results.length && <p>No matching records. Try a name, email, or company.</p>}
            </>
          )}
        </div>
        <div className="command-footer">
          Search across your workspace <span>↵ to open · ESC to close</span>
        </div>
      </dialog>
    </div>
  );
}
