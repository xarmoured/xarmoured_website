import { NextResponse } from 'next/server';
import { currentUser, getRecord, supabase } from '@/lib/server';
import { can } from '@/lib/modules';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || !can(user.role, 'media:read')) return new Response(null, { status: 403 });
  const { id } = await params;
  const r = await getRecord('media', id);
  if (!r?.data.path) return new Response(null, { status: 404 });
  const db = await supabase();
  const { data, error } = await db.storage.from(r.data.bucket).createSignedUrl(r.data.path, 60);
  if (error) return new Response(null, { status: 400 });
  return NextResponse.redirect(data.signedUrl, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
