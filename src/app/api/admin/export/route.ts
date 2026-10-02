import { NextResponse } from 'next/server';
import { currentUser, listRecords } from '@/lib/server';
import { can } from '@/lib/modules';
export async function GET(req: Request) {
  const user = await currentUser();
  const module = new URL(req.url).searchParams.get('module') || '';
  if (!user || !['leads', 'applications'].includes(module) || !can(user.role, `${module}:export`))
    return NextResponse.json({ error: 'Export not permitted.' }, { status: 403 });
  const rows = await listRecords(module);
  const keys =
    module === 'leads'
      ? ['reference', 'company', 'name', 'email', 'services', 'source', 'next_action']
      : ['reference', 'name', 'email', 'job_title', 'experience'];
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const csv = [
    ['title', 'status', 'created_at', ...keys].map(cell).join(','),
    ...rows.map((r) =>
      [r.title, r.status, r.created_at, ...keys.map((k) => r.data[k])].map(cell).join(',')
    ),
  ].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="xarmoured-${module}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
