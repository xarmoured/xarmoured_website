'use client';
import { useState, useEffect, useRef } from 'react';
import { Turnstile } from './turnstile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, applicationSchema } from '@/lib/modules';
import { ArrowRight, CheckCircle2, Upload } from 'lucide-react';
export function SubmissionForm({
  type,
  jobId = '',
  role = '',
  demo = false,
  services = [],
  nonce,
}: {
  type: 'assessment' | 'application';
  jobId?: string;
  role?: string;
  demo?: boolean;
  services?: string[];
  nonce?: string;
}) {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(type === 'assessment' ? leadSchema : applicationSchema),
    defaultValues: { job_id: jobId },
  });
  const started = useRef(false);
  function trackStart() {
    if (
      type !== 'assessment' ||
      started.current ||
      new URLSearchParams(window.location.search).get('preview') === 'true'
    )
      return;
    started.current = true;
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'assessment_start', path: '/assessment' }),
      keepalive: true,
    }).catch(() => {});
  }
  async function submit() {
    setError('');
    const form = new FormData(formRef.current!);
    form.set('type', type);
    try {
      const res = await fetch('/api/submit', { method: 'POST', body: form });
      const body = await res.json();
      if (!res.ok) {
        setRetry((v) => v + 1);
        setError(body.error || 'Unable to submit. Please try again.');
        return;
      }
      setResult(body);
    } catch {
      setRetry((v) => v + 1);
      setError(
        'We couldn’t send your submission. Your entries are still here. Check your connection and try again.'
      );
    }
  }
  if (result)
    return (
      <div className="submission-success" role="status">
        <CheckCircle2 size={42} />
        <span className="eyebrow">THANK YOU</span>
        <h2>{type === 'application' ? 'Application received.' : 'Let’s start a conversation.'}</h2>
        {result.role && <p>Role: {result.role}</p>}
        <p>
          Reference: <strong className="mono">{result.reference}</strong>
        </p>
        <p>
          {type === 'application'
            ? result.confirmation || 'We’ll contact you if your experience matches the role.'
            : 'Your request is saved. Our team will review your requirements.'}
        </p>
        {demo && <p className="demo-text">Demo submission saved locally. No email was sent.</p>}
      </div>
    );
  const input = (key: string, label: string, kind = 'text', required = false, placeholder = '') => (
    <label key={key}>
      {label}
      {required && <span className="accent"> *</span>}
      {kind === 'textarea' ? (
        <textarea
          {...register(key)}
          id={`field-${key}`}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `error-${key}` : undefined}
          rows={4}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...register(key)}
          id={`field-${key}`}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `error-${key}` : undefined}
          type={kind}
          placeholder={placeholder}
          autoComplete={
            (
              {
                name: 'name',
                email: 'email',
                company: 'organization',
                role: 'organization-title',
              } as Record<string, string>
            )[key]
          }
        />
      )}
      <span id={`error-${key}`} className="error-text">
        {errors[key]?.message as string}
      </span>
    </label>
  );
  return (
    <form
      className="public-form"
      ref={formRef}
      onFocus={trackStart}
      onSubmit={handleSubmit(submit, () =>
        requestAnimationFrame(() => summaryRef.current?.focus())
      )}
    >
      {Object.keys(errors).length > 0 && (
        <div className="form-error" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>Review the highlighted fields.</strong>
          <ul>
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>
                <a href={`#field-${key}`}>{String(value?.message || key)}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <input type="hidden" {...register('job_id')} />
      <input
        className="honeypot"
        name="website_check"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="form-grid">
        {input('name', 'Your name', 'text', true)}
        {input('email', 'Work email', 'email', true)}
        {type === 'assessment' ? (
          <>
            {input('company', 'Company', 'text', true)}
            {input('role', 'Your role')}
            {input('website', 'Website', 'url')}
          </>
        ) : (
          <>
            {input('phone', 'Phone (optional)')}
            {input('experience', 'Experience')}
          </>
        )}
      </div>
      {type === 'assessment' ? (
        <>
          <label>
            What would you like tested? <span className="accent">*</span>
            <select
              {...register('services')}
              id="field-services"
              aria-invalid={!!errors.services}
              aria-describedby={errors.services ? 'error-services' : undefined}
            >
              <option value="">Select a service</option>
              {[...services, 'Retest an existing finding', 'Discuss scope'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span id="error-services" className="error-text">
              {errors.services?.message as string}
            </span>
          </label>
          <div className="form-grid">
            {input('timeline', 'Preferred timeline')}
            <label>
              Target type
              <select {...register('target_type')}>
                <option value="">Select…</option>
                {['Web', 'API', 'Mobile', 'Cloud', 'Network', 'Code', 'Multiple', 'Unsure'].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  )
                )}
              </select>
            </label>
          </div>
          <details className="xa-scope-details">
            <summary>
              Add technical scope (optional)<span aria-hidden="true">+</span>
            </summary>
            <div className="form-grid">
              <label>
                Authenticated testing
                <select {...register('authenticated')}>
                  <option value="">Select…</option>
                  {['Yes', 'No', 'Unsure'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Testing environment
                <select {...register('environment_type')}>
                  <option value="">Select…</option>
                  {['Production', 'Staging', 'Both', 'Unsure'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Retest required?
                <select {...register('retest')}>
                  <option value="">Select…</option>
                  {['Yes', 'No', 'Discuss during scoping'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              {input('compliance', 'Compliance requirements')}
              {input('application_count', 'Number of applications', 'number')}
              {input('roles', 'User roles')}
            </div>
          </details>
          {input('environment', 'Environment / scope', 'textarea')}
          {input('message', 'Anything else we should know?', 'textarea')}
        </>
      ) : (
        <>
          <div className="form-grid">
            {input('github', 'GitHub', 'url')}
            {input('linkedin', 'LinkedIn', 'url')}
          </div>
          {input('portfolio', 'Portfolio', 'url')}
          {input('introduction', 'Introduce yourself', 'textarea', true)}
          {input('why', 'Why Xarmoured?', 'textarea')}
          {input('research', 'Security research / relevant work', 'textarea')}
          <label className="upload-area">
            <Upload size={24} />
            <strong>Resume · PDF, up to 5 MB</strong>
            <input type="file" name="resume" accept="application/pdf" required />
            <span>Stored privately. Accessible only to authorized reviewers.</span>
          </label>
        </>
      )}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !demo && (
        <Turnstile retry={retry} nonce={nonce} />
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button className="button" disabled={isSubmitting}>
        {isSubmitting
          ? 'Submitting securely…'
          : type === 'application'
            ? `Submit application${role ? '' : ' '}`
            : 'Request an assessment'}
        <ArrowRight size={17} />
      </button>
      <p className="form-privacy">
        By submitting, you agree to our <a href="/privacy">privacy notice</a>. Please don’t include
        secrets or sensitive system credentials.
      </p>
    </form>
  );
}
