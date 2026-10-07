'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { modules, recordSchema, slugify, type RecordData } from '@/lib/modules';
import { Status } from './ui';
import { Markdown } from './markdown';
import { RecordActions } from './record-actions';
import {
  ArrowLeft,
  ArrowUpRight,
  Save,
  Eye,
  Check,
  Archive,
  Copy,
  Mail,
  Clock,
  LockKeyhole,
  Plus,
  AlertTriangle,
  Send,
  FileText,
} from 'lucide-react';
type Timeline = { id: string; action: string; created_at: string; metadata?: Record<string, any> };
type Note = { id: string; body: string; created_at: string; created_by?: string };
export function Editor({
  module,
  record,
  writable,
  notes = [],
  timeline = [],
  relatedFaqs = [],
  defaultData = {},
}: {
  module: string;
  record?: RecordData;
  writable: boolean;
  notes?: Note[];
  timeline?: Timeline[];
  relatedFaqs?: RecordData[];
  defaultData?: Record<string, unknown>;
}) {
  const config = modules[module];
  const router = useRouter();
  const business = ['leads', 'applications'].includes(module);
  const draft = record
    ? {
        ...record,
        data: Object.fromEntries(
          Object.entries({
            ...(module === 'pages'
              ? Object.fromEntries(
                  config.fields
                    .filter((f) => f.key.startsWith('show_') && f.key !== 'show_labs')
                    .map((f) => [f.key, true])
                )
              : {}),
            ...record.data,
          }).filter(([key]) => !['notes'].includes(key))
        ),
      }
    : {
        title: module === 'settings' ? 'Website settings' : module === 'seo' ? 'Global SEO' : '',
        slug: module === 'settings' ? 'site' : module === 'seo' ? 'global' : '',
        status: config.statuses[0],
        data: defaultData,
      };
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<any>({ resolver: zodResolver(recordSchema(module)), defaultValues: draft });
  const values = watch();
  const sections = useMemo(
    () => Array.from(new Set(config.fields.map((f) => f.section || 'Overview'))),
    [config]
  );
  const [tab, setTab] = useState(sections[0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewed, setPreviewed] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState(notes);
  const [auto, setAuto] = useState(false);
  const [currentId, setCurrentId] = useState(record?.id);
  const [savedAt, setSavedAt] = useState(record?.updated_at);
  const [persistedStatus, setPersistedStatus] = useState(record?.status || config.statuses[0]);
  const [redirect, setRedirect] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const preview = useRef<HTMLDialogElement>(null);
  const fingerprint = JSON.stringify({ title: values.title, slug: values.slug, data: values.data });
  useEffect(() => {
    if (record) setPersistedStatus(record.status);
  }, [record?.status]);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirm]);
  useEffect(() => {
    if (previewOpen) preview.current?.showModal();
    else preview.current?.close();
  }, [previewOpen]);
  useEffect(() => {
    if (!isDirty) return;
    const before = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, [isDirty]);
  async function persist(v: any, action?: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/admin/${module}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentId,
          record: v,
          action,
          previewed: previewed === fingerprint,
          expectedUpdatedAt: savedAt,
          createRedirect: redirect,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      reset(v);
      setPersistedStatus(v.status);
      setCurrentId(body.id);
      setSavedAt(body.updatedAt || new Date().toISOString());
      setMessage(
        body.warning ||
          `${config.singular} ${['published', 'open'].includes(v.status) ? 'published' : 'saved'} successfully.`
      );
      if (!record) {
        router.replace(`/admin/${module}/${body.id}`);
      }
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to save. Your changes are still in this editor.'
      );
    } finally {
      setBusy(false);
      setConfirm('');
    }
  }
  useEffect(() => {
    if (
      !auto ||
      !isDirty ||
      busy ||
      !['jobs', 'research'].includes(module) ||
      values.status !== 'draft' ||
      !values.title ||
      !values.slug
    )
      return;
    const timer = setTimeout(() => {
      const parsed = recordSchema(module).safeParse(values);
      if (parsed.success) persist(parsed.data);
    }, 15000);
    return () => clearTimeout(timer); /* Auto-save only drafts, after an idle interval. */
  }, [fingerprint, auto]);
  async function addNote() {
    if (!note.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/${module}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentId, action: 'note', note }),
      });
      const body = await res.json();
      if (res.ok) {
        setSavedNotes([
          ...savedNotes,
          { id: crypto.randomUUID(), body: note, created_at: new Date().toISOString() },
        ]);
        setNote('');
        setMessage('Internal note saved.');
        router.refresh();
      } else setError(body.error);
    } catch {
      setError(
        'Unable to save your note. Your text is still here; check your connection and try again.'
      );
    } finally {
      setBusy(false);
    }
  }
  const publish = () => {
    if (previewed !== fingerprint) {
      setPreviewOpen(true);
      return;
    }
    setConfirm('publish');
  };
  const invalid = (issues: any) => {
    const key = Object.keys(issues.data || {})[0];
    const detail =
      issues.title?.message ||
      issues.slug?.message ||
      (key && issues.data[key]?.message) ||
      'Check the highlighted fields.';
    if (issues.title || issues.slug) setTab(sections[0]);
    else if (key) setTab(config.fields.find((f) => f.key === key)?.section || sections[0]);
    setConfirm('');
    setError(`Please review this field: ${detail}`);
  };
  const renderField = (field: (typeof config.fields)[number]) => (
    <label key={field.key} className={field.type === 'checkbox' ? 'checkbox-field' : ''}>
      <span>{field.label}</span>
      {field.key === 'faq_ids' ? (
        <div className="faq-picker">
          <input type="hidden" {...register('data.faq_ids')} />
          {relatedFaqs.length ? (
            relatedFaqs.map((faq) => (
              <span className="faq-choice" key={faq.id}>
                <input
                  type="checkbox"
                  aria-label={faq.title}
                  checked={String(values.data.faq_ids || '')
                    .split('\n')
                    .includes(faq.id)}
                  onChange={(e) => {
                    const ids = String(values.data.faq_ids || '')
                      .split('\n')
                      .filter(Boolean);
                    setValue(
                      'data.faq_ids',
                      (e.target.checked
                        ? [...ids, faq.id]
                        : ids.filter((id) => id !== faq.id)
                      ).join('\n'),
                      { shouldDirty: true }
                    );
                  }}
                />
                {faq.title}
              </span>
            ))
          ) : (
            <small>Create FAQs first to assign them to this service.</small>
          )}
        </div>
      ) : field.type === 'checkbox' ? (
        <input type="checkbox" {...register(`data.${field.key}`)} />
      ) : field.type === 'select' ? (
        <select
          disabled={module === 'media' && Boolean(record) && field.key === 'bucket'}
          {...register(`data.${field.key}`)}
        >
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' || field.type === 'markdown' ? (
        <>
          <textarea
            rows={field.type === 'markdown' ? 12 : 3}
            className={field.type === 'markdown' ? 'markdown-input' : ''}
            {...register(`data.${field.key}`)}
          />
          {field.type === 'markdown' && (
            <small>Markdown supported. HTML and scripts are not rendered.</small>
          )}
        </>
      ) : (
        <input
          type={field.type === 'url' ? 'text' : field.type || 'text'}
          {...register(
            `data.${field.key}`,
            field.type === 'number' ? { setValueAs: (v) => (v === '' ? null : Number(v)) } : {}
          )}
        />
      )}
      <span className="error-text">{(errors.data as any)?.[field.key]?.message}</span>
    </label>
  );
  return (
    <>
      <Link className="back-link" href={`/admin/${module}`}>
        <ArrowLeft size={15} />
        {config.label}
      </Link>
      <div className="admin-page-heading editor-heading">
        <div>
          <span className="eyebrow">{business ? 'RELATIONSHIP DETAILS' : 'CONTENT STUDIO'}</span>
          <h1>{record?.title || `New ${config.singular.toLowerCase()}`}</h1>
          <div className="editor-meta">
            <Status value={persistedStatus} />
            {record?.data.reference && <span className="mono">{record.data.reference}</span>}
            <span>
              {busy
                ? confirm === 'publish'
                  ? 'Publishing…'
                  : 'Saving…'
                : isDirty
                  ? 'Unsaved changes'
                  : savedAt
                    ? 'All changes saved'
                    : 'New draft'}
            </span>
          </div>
        </div>
        <div className="button-row">
          {currentId && config.publicPath && (
            <Link
              className="button secondary compact"
              target="_blank"
              href={`${config.publicPath === '/' ? '/' + (record?.slug === 'home' ? '' : record?.slug) : config.publicPath + '/' + (record?.slug || values.slug)}?preview=true`}
            >
              <ArrowUpRight size={15} />
              Public preview
            </Link>
          )}
          {writable && (
            <>
              <button
                className="button secondary compact"
                onClick={() => {
                  setPreviewed('');
                  setPreviewOpen(true);
                }}
              >
                <Eye size={15} />
                Preview
              </button>
              <button
                className="button compact"
                disabled={busy}
                onClick={handleSubmit((v) => persist(v), invalid)}
              >
                <Save size={15} />
                {busy
                  ? 'Saving…'
                  : business || values.status !== 'draft'
                    ? 'Save changes'
                    : 'Save draft'}
              </button>
            </>
          )}
        </div>
      </div>
      {(message || error) && (
        <div className={`toast-message ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>
          {error ? <AlertTriangle size={17} /> : <Check size={17} />} {error || message}
        </div>
      )}
      <div className="editor-layout">
        <div className="editor-main">
          <div className="editor-tabs">
            {sections.map((s) => (
              <button key={s} className={tab === s ? 'active' : ''} onClick={() => setTab(s)}>
                {s}
              </button>
            ))}
            {business && (
              <button
                className={tab === 'Activity' ? 'active' : ''}
                onClick={() => setTab('Activity')}
              >
                Activity
              </button>
            )}
          </div>
          <div className="editor-form">
            <fieldset disabled={!writable || busy}>
              {tab === sections[0] && (
                <div className="form-grid">
                  <label>
                    {module === 'faqs'
                      ? 'Question'
                      : module === 'team'
                        ? 'Name'
                        : business
                          ? 'Record title'
                          : 'Title'}
                    <input
                      {...register('title')}
                      onChange={(e) => {
                        setValue('title', e.target.value, { shouldDirty: true });
                        if (!record && !business)
                          setValue('slug', slugify(e.target.value), { shouldDirty: true });
                      }}
                    />
                    <span className="error-text">{errors.title?.message as string}</span>
                  </label>
                  <label>
                    Slug
                    <input {...register('slug')} />
                    <span className="error-text">{errors.slug?.message as string}</span>
                  </label>
                </div>
              )}
              {record && record.slug !== values.slug && (
                <div className="slug-warning">
                  <AlertTriangle size={16} />
                  <span>Changing a published URL may break links.</span>
                  <label>
                    <input
                      type="checkbox"
                      checked={redirect}
                      onChange={(e) => setRedirect(e.target.checked)}
                    />
                    Create redirect
                  </label>
                </div>
              )}
              {config.fields.filter((f) => (f.section || 'Overview') === tab).map(renderField)}
            </fieldset>
            {tab === 'SEO' && (
              <div className="serp-preview">
                <span className="eyebrow">SEARCH PREVIEW</span>
                <small>
                  xarmoured.com › {config.publicPath?.slice(1)} › {values.slug}
                </small>
                <h3>{values.data.seo_title || values.title}</h3>
                <p>
                  {values.data.seo_description ||
                    values.data.summary ||
                    'Add a clear description of this page.'}
                </p>
              </div>
            )}
            {module === 'seo' && (
              <div className="serp-preview">
                <small>{values.data.site_url || 'xarmoured.com'}</small>
                <h3>{values.data.default_title || 'Xarmoured'}</h3>
                <p>{values.data.description}</p>
              </div>
            )}
            {tab === 'Activity' && (
              <div className="timeline">
                {timeline.length ? (
                  timeline.map((e) => (
                    <div key={e.id}>
                      <span className="timeline-dot" />
                      <strong>{e.action}</strong>
                      <p>{e.metadata?.from && `${e.metadata.from} → ${e.metadata.to}`}</p>
                      <small>{new Date(e.created_at).toLocaleString('en-GB')}</small>
                    </div>
                  ))
                ) : (
                  <p>No activity has been recorded yet.</p>
                )}
              </div>
            )}
          </div>
          {business && (
            <div className="notes-panel">
              <h2>
                <LockKeyhole size={17} /> Internal notes
              </h2>
              <p>
                Private to authorized administrators. Never visible to the customer or candidate.
              </p>
              {savedNotes.map((n) => (
                <div className="internal-note" key={n.id}>
                  <p>{n.body}</p>
                  <small>{new Date(n.created_at).toLocaleString('en-GB')}</small>
                </div>
              ))}
              {writable && (
                <>
                  <label className="sr-only" htmlFor="internal-note">
                    Add an internal note
                  </label>
                  <textarea
                    id="internal-note"
                    placeholder="Add context, next steps, or interview feedback…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={5000}
                  />
                  <button
                    className="button secondary compact"
                    onClick={addNote}
                    disabled={busy || !note.trim()}
                  >
                    <Plus size={15} />
                    Add note
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <aside className="editor-aside">
          <div className="editor-aside-panel">
            {currentId && writable && (
              <RecordActions
                module={module}
                id={currentId}
                unread={record?.data.unread || record?.status === 'unread'}
              />
            )}
            <span className="eyebrow">{business ? 'PIPELINE' : 'PUBLISHING'}</span>
            <h3>{business ? 'Move the conversation forward.' : 'Ready when you are.'}</h3>
            <label>
              Status
              <select {...register('status')} disabled={!writable}>
                {config.statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            {!business && writable && (
              <>
                <p>Review the rendering before making content public.</p>
                {[
                  'research',
                  'jobs',
                  'services',
                  'pages',
                  'resources',
                  'case_studies',
                  'industries',
                ].includes(module) && (
                  <button className="button compact full" disabled={busy} onClick={publish}>
                    <ArrowUpRight size={15} />
                    {module === 'jobs' ? 'Open applications' : 'Publish content'}
                  </button>
                )}
                {['jobs', 'research'].includes(module) && (
                  <label className="checkbox-field">
                    <span>Auto-save draft</span>
                    <input
                      type="checkbox"
                      checked={auto}
                      onChange={(e) => setAuto(e.target.checked)}
                    />
                  </label>
                )}
              </>
            )}
            {module === 'research' && values.data.disclosure !== 'public' && (
              <div className="disclosure-warning">
                <LockKeyhole size={18} />
                <strong>Disclosure is not public.</strong>
                <p>
                  This research cannot be published. Confirm coordinated disclosure before changing
                  its status.
                </p>
              </div>
            )}
            {currentId && writable && config.statuses.includes('archived') && (
              <button
                className="archive-button"
                onClick={() => setConfirm(module === 'jobs' ? 'close' : 'archive')}
              >
                <Archive size={15} />
                {module === 'jobs' ? 'Close applications' : 'Archive record'}
              </button>
            )}
          </div>
          {business && (
            <div className="editor-aside-panel">
              <span className="eyebrow">QUICK ACTIONS</span>
              <h3>Keep things moving.</h3>
              {values.data.email && (
                <>
                  <button
                    className="aside-action"
                    onClick={async () => {
                      await navigator.clipboard.writeText(values.data.email);
                      setMessage('Email copied.');
                    }}
                  >
                    <Copy size={15} />
                    Copy email
                  </button>
                  <a className="aside-action" href={`mailto:${values.data.email}`}>
                    <Mail size={15} />
                    Open mail client
                  </a>
                  <EmailAction
                    module={module}
                    id={currentId}
                    writable={writable}
                    onResult={setMessage}
                  />
                </>
              )}
              {module === 'applications' && record?.data.resume_path && (
                <a className="aside-action" href={`/api/admin/resume/${record.id}`} target="_blank">
                  <FileText size={15} />
                  View private resume
                </a>
              )}
              <span className="aside-created">
                <Clock size={13} />
                Received{' '}
                {record ? new Date(record.created_at).toLocaleDateString('en-GB') : 'today'}
              </span>
            </div>
          )}
          {module === 'research' && (
            <div className="editor-aside-panel">
              <span className="eyebrow">DISCLOSURE CHECKLIST</span>
              <p>✓ Verify vendor coordination</p>
              <p>✓ Review sensitive details</p>
              <p>✓ Preview the full advisory</p>
              <p>✓ Set disclosure to public</p>
            </div>
          )}
        </aside>
      </div>
      <dialog
        ref={preview}
        className="preview-dialog"
        aria-label="Private content preview"
        onClose={() => setPreviewOpen(false)}
      >
        <div className="dialog-header">
          <span className="eyebrow">PRIVATE PREVIEW</span>
          <button onClick={() => setPreviewOpen(false)} aria-label="Close preview">
            ×
          </button>
        </div>
        <h1>{values.data.headline || values.title || 'Untitled draft'}</h1>
        <p>{values.data.summary}</p>
        {config.fields
          .filter((f) => f.type === 'markdown')
          .map(
            (f) =>
              values.data[f.key] && (
                <div key={f.key}>
                  <h2>{f.label}</h2>
                  <Markdown>{values.data[f.key]}</Markdown>
                </div>
              )
          )}
        <div className="dialog-actions">
          <button className="button secondary compact" onClick={() => setPreviewOpen(false)}>
            Back to editor
          </button>
          <button
            className="button compact"
            onClick={() => {
              setPreviewed(fingerprint);
              setPreviewOpen(false);
              setMessage('Preview reviewed. You can now publish this version.');
            }}
          >
            <Check size={15} />
            Mark preview reviewed
          </button>
        </div>
      </dialog>
      <dialog
        ref={dialog}
        className="confirm-dialog"
        aria-label="Confirm content action"
        onClose={() => setConfirm('')}
      >
        <span className="dialog-icon">
          <AlertTriangle size={23} />
        </span>
        <h2>
          {confirm === 'publish'
            ? `Publish ${values.title}?`
            : confirm === 'close'
              ? `Close applications for ${values.title}?`
              : `Archive ${values.title}?`}
        </h2>
        <p>
          {confirm === 'publish'
            ? 'This version will become visible on the public website.'
            : confirm === 'close'
              ? 'Candidates will no longer be able to apply. Existing applications will be retained.'
              : 'This record will be retained and removed from normal public listings.'}
        </p>
        <div className="dialog-actions">
          <button className="button secondary compact" onClick={() => setConfirm('')}>
            Cancel
          </button>
          <button
            className="button compact"
            disabled={busy}
            onClick={handleSubmit((v) => {
              const candidate = {
                ...v,
                status:
                  confirm === 'publish'
                    ? module === 'jobs'
                      ? 'open'
                      : 'published'
                    : confirm === 'close'
                      ? 'closed'
                      : 'archived',
              };
              const checked = recordSchema(module).safeParse(candidate);
              if (!checked.success) {
                setError(checked.error.issues[0].message);
                setConfirm('');
                return;
              }
              persist(checked.data);
            }, invalid)}
          >
            {busy
              ? 'Saving…'
              : confirm === 'publish'
                ? 'Publish'
                : confirm === 'close'
                  ? 'Close applications'
                  : 'Archive'}
          </button>
        </div>
      </dialog>
    </>
  );
}
function EmailAction({
  module,
  id,
  writable,
  onResult,
}: {
  module: string;
  id?: string;
  writable: boolean;
  onResult: (s: string) => void;
}) {
  const [template, setTemplate] = useState(
    module === 'leads' ? 'assessment_received' : 'application_received'
  );
  const [sending, setSending] = useState(false);
  if (!writable || !id) return null;
  return (
    <div className="email-action">
      <label>
        Message template
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          {(module === 'leads'
            ? ['assessment_received']
            : ['application_received', 'interview_invitation', 'application_rejection']
          ).map((t) => (
            <option key={t} value={t}>
              {t.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <button
        className="aside-action"
        disabled={sending}
        onClick={async () => {
          setSending(true);
          const res = await fetch('/api/admin/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ module, id, template }),
          });
          const body = await res.json();
          onResult(body.message || body.error);
          setSending(false);
        }}
      >
        <Send size={15} />
        {sending ? 'Sending…' : 'Send configured template'}
      </button>
    </div>
  );
}
