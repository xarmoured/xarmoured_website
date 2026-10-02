'use client';
import { useActionState, useState } from 'react';
import { login, resetPassword } from '@/app/admin/actions';
import { ArrowRight, LockKeyhole } from 'lucide-react';
export function LoginForm({ configured, demo }: { configured: boolean; demo: boolean }) {
  const [reset, setReset] = useState(false);
  const [state, action, pending] = useActionState(reset ? resetPassword : login, null);
  return (
    <>
      <div className="login-icon">
        <LockKeyhole size={22} />
      </div>
      <span className="eyebrow">XARMOURED OPERATING SYSTEM</span>
      <h1>{reset ? 'Reset your password.' : 'Welcome back.'}</h1>
      <p>{reset ? 'We’ll email a secure reset link.' : 'Your company. One workspace.'}</p>
      {demo ? (
        <a className="button" href="/admin">
          Enter development demo <ArrowRight size={16} />
        </a>
      ) : (
        <form action={action}>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@xarmoured.com"
            />
          </label>
          {!reset && (
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
              />
            </label>
          )}
          <div aria-live="polite">
            {state?.error && <p className="error-text">{state.error}</p>}
            {state && 'success' in state && <p className="success-text">{state.success}</p>}
          </div>
          <button className="button" disabled={pending || !configured}>
            {pending ? 'Please wait…' : reset ? 'Send reset link' : 'Sign in'}
            <ArrowRight size={16} />
          </button>
          <button className="text-link reset-button" type="button" onClick={() => setReset(!reset)}>
            {reset ? 'Back to sign in' : 'Forgot your password?'}
          </button>
        </form>
      )}
      <div className="login-note">
        {configured
          ? 'Access is restricted to approved administrators.'
          : 'Supabase is not connected. Configure the environment and migrations before signing in.'}
      </div>
    </>
  );
}
