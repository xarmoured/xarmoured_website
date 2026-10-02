import { NextResponse } from 'next/server';
import { currentUser, getRecord, supabase, isDemo } from '@/lib/server';
import { can } from '@/lib/modules';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || !can(user.role, 'applications:read'))
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  const { id } = await params;
  const record = await getRecord('applications', id);
  if (!record?.data.resume_path || isDemo)
    return NextResponse.json({ error: 'No resume is available for this record.' }, { status: 404 });
  const db = await supabase();
  const { data, error } = await db.storage
    .from('private-applications')
    .createSignedUrl(record.data.resume_path, 60);
  if (error) return NextResponse.json({ error: 'Unable to access resume.' }, { status: 400 });
  return NextResponse.redirect(data.signedUrl, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
