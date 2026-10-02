'use client';
import { useState } from 'react';
export function Account({ name, email, demo }: { name: string; email: string; demo: boolean }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE IDENTITY</span>
          <h1>Account & security</h1>
          <p>Manage your profile and secure your access.</p>
        </div>
      </div>
      <div className="account-settings">
        <div className="avatar large">{name.slice(0, 2).toUpperCase()}</div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const fd = new FormData(e.currentTarget);
            const res = await fetch('/api/admin/account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(Object.fromEntries(fd)),
            });
            const b = await res.json();
            setMessage(b.error || 'Account updated.');
            setPending(false);
          }}
        >
          <label>
            Name
            <input name="name" defaultValue={name} required minLength={2} />
          </label>
          <label>
            Email
            <input value={email} readOnly />
            <small>Managed through your approved Supabase account.</small>
          </label>
          <label>
            New password
            <input type="password" name="password" minLength={12} autoComplete="new-password" />
            <small>At least 12 characters. Leave blank to keep your password.</small>
          </label>
          <button className="button compact" disabled={pending || demo}>
            {pending ? 'Saving…' : 'Save account'}
          </button>
          {message && <p role="status">{message}</p>}
        </form>
        <section>
          <h2>Session security</h2>
          <p>
            Sessions use protected cookies and verified server-side identity. Administrative access
            is checked against your profile on every request.
          </p>
          <p>
            Recent sign-ins appear in the activity log. For all-device session revocation, use the
            owner-controlled Supabase Auth console.
          </p>
          <p className="tiny-tag">THEME / XARMOURED DARK</p>
        </section>
      </div>
    </>
  );
}
