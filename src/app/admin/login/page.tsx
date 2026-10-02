import { Brand } from '@/components/ui';
import { LoginForm } from '@/components/login-form';
import { configured, isDemo } from '@/lib/server';
export const metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };
export default function Login() {
  return (
    <main id="main" className="login-page">
      <Brand />
      <div className="login-panel">
        <LoginForm configured={configured} demo={isDemo} />
      </div>
      <span className="login-footer">SECURE ACCESS / XARMOURED</span>
    </main>
  );
}
