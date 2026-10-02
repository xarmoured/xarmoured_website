'use server';
import { redirect } from 'next/navigation';
import { supabase, configured, isDemo, requireUser, audit } from '@/lib/server';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
export async function login(_: unknown, form: FormData) {
  if (isDemo) redirect('/admin');
  try {
    if (!configured)
      return { error: 'Connect Supabase to enable secure sign-in. See the setup guide.' };
    await rateLimit('login', 6);
    const email = z.email().parse(form.get('email'));
    const password = z.string().min(8).max(200).parse(form.get('password'));
    const db = await supabase();
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Unable to sign in. Check your email and password.' };
    const user = await requireUser();
    await audit('User logged in', 'account', user.id);
  } catch {
    return { error: 'Unable to sign in. Check your credentials or try again later.' };
  }
  redirect('/admin');
}
export async function logout() {
  if (!isDemo && configured) {
    const db = await supabase();
    await db.auth.signOut();
  }
  redirect('/admin/login');
}
export async function resetPassword(_: unknown, form: FormData) {
  try {
    await rateLimit('password-reset', 3);
    const email = z.email().parse(form.get('email'));
    const db = await supabase();
    await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/admin/account`,
    });
    return { success: 'If this account exists, a reset link has been sent.' };
  } catch {
    return { error: 'Unable to request a reset. Please try again later.' };
  }
}
