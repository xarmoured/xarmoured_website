'use client';
import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Plus,
  ArrowUpRight,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutList,
  Columns3,
  Inbox,
  MoreHorizontal,
} from 'lucide-react';
import { modules, type RecordData } from '@/lib/modules';
import { Status } from './ui';
import { ContentOrder } from './content-order';
export function DataTable({
  module,
  records,
  writable,
}: {
  module: string;
  records: RecordData[];
  writable: boolean;
}) {
  const config = modules[module];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(0);
  const [board, setBoard] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [column, setColumn] = useState(true);
  const [detailFilter, setDetailFilter] = useState('');
  const [unread, setUnread] = useState(false);
  const [week, setWeek] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const filtered = useMemo(
    () =>
      records
        .filter(
          (r) =>
            (status === 'all' || r.status === status) &&
            (!unread || r.data.unread) &&
            (!week || Date.now() - Date.parse(r.created_at) < 7 * 86400000) &&
            (!detailFilter ||
              String(module === 'applications' ? r.data.job_title : r.data.services).includes(
                detailFilter
              )) &&
            `${r.title} ${r.slug} ${JSON.stringify(r.data)}`
              .toLowerCase()
              .includes(query.toLowerCase())
        )
        .sort((a, b) =>
          sort
            ? a.title.localeCompare(b.title)
            : Date.parse(b.created_at) - Date.parse(a.created_at)
        ),
    [records, query, status, sort, detailFilter, unread, week, module]
  );
  const business = ['leads', 'applications'].includes(module);
  const update = (setter: (v: any) => void, value: any) => {
    setter(value);
    setPage(0);
  };
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">{business ? 'RELATIONSHIPS' : 'YOUR WORKSPACE'}</span>
          <h1>
            {config.label}
            <span className="heading-count">{records.length}</span>
          </h1>
          <p>{config.description}</p>
        </div>
        <div className="button-row">
          {writable &&
            ['services', 'faqs', 'team', 'navigation'].includes(module) &&
            records.length > 1 && (
              <button className="button secondary compact" onClick={() => setOrdering(!ordering)}>
                <ArrowDownUp size={15} />
                Reorder
              </button>
            )}
          {business && writable && (
            <a className="button secondary compact" href={`/api/admin/export?module=${module}`}>
              <Download size={15} />
              Export
            </a>
          )}
          {writable && !business && !config.readOnly && (
            <Link className="button compact" href={`/admin/${module}/new`}>
              <Plus size={16} />
              {module === 'jobs' ? 'Post a job' : `Add ${config.singular.toLowerCase()}`}
            </Link>
          )}
        </div>
      </div>
      {ordering && (
        <ContentOrder module={module} records={records} onClose={() => setOrdering(false)} />
      )}
      <div className="table-panel">
        <div className="table-tabs">
          <button
            className={status === 'all' ? 'selected' : ''}
            onClick={() => update(setStatus, 'all')}
          >
            All {config.label.toLowerCase()}
            <span>{records.length}</span>
          </button>
          {config.statuses.slice(0, 6).map((s) => (
            <button
              className={status === s ? 'selected' : ''}
              key={s}
              onClick={() => update(setStatus, s)}
            >
              {s}
              <span>{records.filter((r) => r.status === s).length}</span>
            </button>
          ))}
        </div>
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={16} />
            <input
              ref={search}
              aria-label={`Search ${config.label}`}
              placeholder={`Search ${config.label.toLowerCase()}…`}
              value={query}
              onChange={(e) => update(setQuery, e.target.value)}
            />
          </label>
          <div className="table-filters">
            {business && (
              <>
                <select
                  aria-label={module === 'applications' ? 'Filter by job' : 'Filter by service'}
                  value={detailFilter}
                  onChange={(e) => update(setDetailFilter, e.target.value)}
                >
                  <option value="">
                    {module === 'applications' ? 'All roles' : 'All services'}
                  </option>
                  {Array.from(
                    new Set(
                      records
                        .map((r) =>
                          String(module === 'applications' ? r.data.job_title : r.data.services)
                        )
                        .filter((v) => v && v !== 'undefined')
                    )
                  ).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <button
                  className={unread ? 'selected' : ''}
                  onClick={() => update(setUnread, !unread)}
                >
                  Unread
                </button>
                <button className={week ? 'selected' : ''} onClick={() => update(setWeek, !week)}>
                  This week
                </button>
              </>
            )}
            <button
              aria-label="Toggle details column"
              aria-pressed={column}
              onClick={() => setColumn(!column)}
            >
              <SlidersHorizontal size={15} />
              <span>Display</span>
            </button>
            {business && (
              <button
                aria-label={board ? 'Switch to table' : 'Switch to pipeline'}
                onClick={() => setBoard(!board)}
              >
                {board ? <LayoutList size={16} /> : <Columns3 size={16} />}
              </button>
            )}
          </div>
        </div>
        {filtered.length ? (
          board ? (
            <div className="pipeline">
              {config.statuses
                .filter((s) => s !== 'archived')
                .map((s) => (
                  <div className="pipeline-column" key={s}>
                    <div>
                      <Status value={s} />
                      <span>{filtered.filter((r) => r.status === s).length}</span>
                    </div>
                    {filtered
                      .filter((r) => r.status === s)
                      .map((r) => (
                        <Link key={r.id} href={`/admin/${module}/${r.id}`}>
                          <strong>{r.title}</strong>
                          <p>{r.data.email}</p>
                          <small>{r.data.job_title || r.data.services}</small>
                          <span className="mono">{r.data.reference}</span>
                        </Link>
                      ))}
                  </div>
                ))}
            </div>
          ) : (
            <>
              <div className="data-table">
                <div className={`data-table-head ${!column ? 'hide-detail' : ''}`}>
                  <button onClick={() => setSort(!sort)}>
                    {' '}
                    {module === 'jobs'
                      ? 'ROLE'
                      : module === 'leads'
                        ? 'COMPANY / CONTACT'
                        : module === 'applications'
                          ? 'CANDIDATE'
                          : 'TITLE'}
                    <ArrowDownUp size={12} />
                  </button>
                  {column && (
                    <span>
                      {module === 'jobs'
                        ? 'LOCATION / TYPE'
                        : module === 'applications'
                          ? 'APPLIED FOR'
                          : module === 'leads'
                            ? 'REQUESTED SERVICES'
                            : 'DETAILS'}
                    </span>
                  )}
                  <span>STATUS</span>
                  <span>UPDATED</span>
                  <span />
                </div>
                {filtered.slice(page * 10, page * 10 + 10).map((r) => (
                  <Link
                    className={`data-table-row ${!column ? 'hide-detail' : ''}`}
                    href={`/admin/${module}/${r.id}`}
                    key={r.id}
                  >
                    <div className="record-name">
                      <span className={`record-icon ${module}`}>
                        {module === 'applications' ? (
                          (r.data.name || r.title)
                            .split(' ')
                            .map((s: string) => s[0])
                            .slice(0, 2)
                            .join('')
                        ) : (
                          <Inbox size={17} />
                        )}
                      </span>
                      <div>
                        <strong>{r.title}</strong>
                        <small>{r.data.email || r.data.department || r.slug}</small>
                      </div>
                      {r.data.unread && <i className="unread-dot" />}
                    </div>
                    {column && (
                      <div className="row-detail">
                        {module === 'jobs' ? (
                          <>
                            {r.data.location || 'Not specified'}
                            <small>{r.data.employment || '—'}</small>
                          </>
                        ) : module === 'applications' ? (
                          r.data.job_title || 'General'
                        ) : module === 'leads' ? (
                          r.data.services || '—'
                        ) : (
                          r.data.summary ||
                          r.data.description ||
                          r.data.category ||
                          r.data.destination ||
                          r.data.message ||
                          '—'
                        )}
                      </div>
                    )}
                    <Status value={r.status} />
                    <span className="row-date">
                      {new Date(r.updated_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <ArrowUpRight className="row-open" size={17} />
                  </Link>
                ))}
              </div>
              <div className="table-pagination">
                <span>
                  Showing {page * 10 + 1}–{Math.min((page + 1) * 10, filtered.length)} of{' '}
                  {filtered.length}
                </span>
                <div>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>Page {page + 1}</span>
                  <button
                    disabled={(page + 1) * 10 >= filtered.length}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <Inbox size={28} />
            </span>
            <h2>
              {query || status !== 'all'
                ? 'No matching records.'
                : `No ${config.label.toLowerCase()} yet.`}
            </h2>
            <p>
              {query || status !== 'all'
                ? 'Try another search or clear your filters.'
                : module === 'jobs'
                  ? 'Publish your first role when you’re ready to hire.'
                  : module === 'leads'
                    ? 'New assessment requests will arrive here. Every enquiry, ready for a conversation.'
                    : module === 'applications'
                      ? 'Applications will appear here when candidates apply for an open role.'
                      : `Your ${config.label.toLowerCase()} will appear here when you add them.`}
            </p>
            {writable && !business && !config.readOnly && (
              <Link className="button secondary compact" href={`/admin/${module}/new`}>
                <Plus size={15} />
                Create {config.singular.toLowerCase()}
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
