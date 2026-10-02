import { NextResponse } from 'next/server';
import { currentUser, getRecord, internalEmailTemplates, audit } from '@/lib/server';
import { can } from '@/lib/modules';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin)
    return new Response(null, { status: 403 });
  const user = await currentUser();
  try {
    const b = await req.json();
    if (
      !user ||
      !['leads', 'applications'].includes(b.module) ||
      !can(user.role, `${b.module}:update`)
    )
      return new Response(null, { status: 403 });
    await rateLimit('admin-email', 10);
    const allowed =
      b.module === 'leads'
        ? ['assessment_received']
        : ['application_received', 'interview_invitation', 'application_rejection'];
    if (!allowed.includes(b.template)) throw new Error('Unsupported template.');
    const record = await getRecord(b.module, b.id);
    const settings = await internalEmailTemplates();
    const text = settings[b.template];
    if (!record?.data.email || !text)
      throw new Error('Configure this email template in Settings before sending.');
    const result = await sendEmail(
      record.data.email,
      b.template.replaceAll('_', ' '),
      text,
      record.id
    );
    if (result.sent) await audit('Email sent', b.module, record.id, { template: b.template });
    return NextResponse.json({ message: result.sent ? 'Email sent and logged.' : result.reason });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to send email.' },
      { status: 400 }
    );
  }
}
