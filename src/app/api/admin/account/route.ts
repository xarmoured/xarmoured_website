import { NextResponse } from 'next/server';
import { currentUser, supabase, audit, isDemo } from '@/lib/server';
import { z } from 'zod';
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || req.headers.get('origin') !== new URL(req.url).origin)
    return new Response(null, { status: 403 });
  try {
    if (isDemo) throw new Error('Account management is disabled in demo mode.');
    const parsed = z
      .object({
        name: z.string().min(2).max(120),
        password: z.union([z.literal(''), z.string().min(12).max(200)]),
      })
      .parse(await req.json());
    const db = await supabase();
    const { error } = await db.rpc('update_own_profile', { p_name: parsed.name });
    if (error) throw new Error('Unable to update profile.');
    if (parsed.password) {
      const { error: pw } = await db.auth.updateUser({ password: parsed.password });
      if (pw) throw new Error('Unable to change password. Sign in again and retry.');
      await audit('Password updated', 'account', user.id);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to update account.' },
      { status: 400 }
    );
  }
}
