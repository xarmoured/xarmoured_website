import { NextResponse } from 'next/server';
import { applicationSchema, leadSchema } from '@/lib/modules';
import {
  demoChange,
  isDemo,
  privileged,
  getRecord,
  siteSettings,
  internalEmailTemplates,
} from '@/lib/server';
import { rateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';
export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin)
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  try {
    if (Number(req.headers.get('content-length') || 0) > 6000000)
      throw new Error('The upload is too large.');
    await rateLimit('submission', 6);
    const form = await req.formData();
    const type = form.get('type');
    const module = type === 'application' ? 'applications' : 'leads';
    if (form.get('website_check')) throw new Error('Unable to submit.');
    if (!isDemo) {
      if (!process.env.TURNSTILE_SECRET_KEY)
        throw new Error('The form is not configured yet. Please contact us by email.');
      const token = form.get('cf-turnstile-response');
      if (!token) throw new Error('Complete the security check.');
      const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: String(token),
        }),
      });
      const verified = await result.json();
      if (
        !verified.success ||
        verified.hostname !== new URL(process.env.NEXT_PUBLIC_SITE_URL || req.url).hostname
      )
        throw new Error('Security check failed. Please try again.');
    }
    const raw = Object.fromEntries(form);
    const parsed = (module === 'applications' ? applicationSchema : leadSchema).safeParse(raw);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message, fields: parsed.error.flatten() },
        { status: 422 }
      );
    const data: Record<string, any> = parsed.data;
    const settings = await siteSettings();
    if (module === 'leads' && settings.assessment_enabled === false)
      throw new Error('Assessment requests are currently paused.');
    if (module === 'applications') {
      if (settings.careers_enabled === false) throw new Error('Applications are currently paused.');
      if (data.job_id === 'general') {
        if (!settings.general_applications) throw new Error('General applications are closed.');
        data.job_title = 'General application';
      } else {
        const job = await getRecord('jobs', data.job_id, true);
        if (
          !job ||
          job.status !== 'open' ||
          job.data.accept_applications === false ||
          (job.data.deadline && job.data.deadline < new Date().toISOString().slice(0, 10))
        )
          throw new Error('Applications for this role are closed.');
        data.job_title = job.title;
      }
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const ref = `XA-${module === 'leads' ? 'LEAD' : 'CAR'}-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    if (module === 'applications') {
      const file = form.get('resume');
      if (!(file instanceof File) || file.size === 0)
        throw new Error('Attach your resume as a PDF.');
      if (file.size > 5242880 || file.type !== 'application/pdf')
        throw new Error('Use a PDF resume under 5 MB.');
      const buffer = await file.arrayBuffer();
      if (new TextDecoder().decode(buffer.slice(0, 5)) !== '%PDF-')
        throw new Error('The file must be a valid PDF.');
      if (!isDemo) {
        const resumePath = `${id}/${crypto.randomUUID()}.pdf`;
        const { error } = await privileged()
          .storage.from('private-applications')
          .upload(resumePath, buffer, { contentType: 'application/pdf', upsert: false });
        if (error) throw new Error('Unable to upload resume. Please try again.');
        data.resume_path = resumePath;
      }
    }
    data.reference = ref;
    data.source = settings.lead_source || 'Website';
    data.unread = true;
    const row = {
      id,
      module,
      title: module === 'leads' ? data.company : data.name,
      slug: id,
      status: 'new',
      data,
      created_at: now,
      updated_at: now,
    };
    if (isDemo)
      await demoChange((db) => {
        (db[module] ??= []).unshift(row);
        (db.notifications ??= []).unshift({
          id: crypto.randomUUID(),
          title: module === 'leads' ? 'New assessment request' : 'New application',
          slug: id,
          status: 'unread',
          data: { message: row.title, destination: `/admin/${module}/${id}` },
          created_at: now,
          updated_at: now,
        });
      });
    else {
      const db = privileged();
      const { error } = await db.rpc('receive_submission', {
        p_id: id,
        p_module: module,
        p_title: row.title,
        p_data: data,
      });
      if (error) {
        if (data.resume_path)
          await db.storage.from('private-applications').remove([data.resume_path]);
        throw new Error(
          error.message.includes('closed')
            ? 'Applications for this role are closed.'
            : 'Unable to save your submission. Please try again.'
        );
      }
    }
    const templates = await internalEmailTemplates().catch(() => ({}) as Record<string, any>);
    const emailResult = await sendEmail(
      data.email,
      `${module === 'leads' ? 'Assessment request' : 'Application'} received · ${ref}`,
      `Thank you, ${data.name}.\n\n${templates[module === 'leads' ? 'assessment_received' : 'application_received'] || 'Your submission has been received. We will contact you if it matches our current work.'}\n\nReference: ${ref}`,
      id
    );
    if (process.env.ADMIN_NOTIFICATION_EMAIL)
      await sendEmail(
        process.env.ADMIN_NOTIFICATION_EMAIL,
        `New ${module === 'leads' ? 'assessment request' : 'application'}`,
        `Reference: ${ref}\nReview securely at ${process.env.NEXT_PUBLIC_SITE_URL}/admin/${module}/${id}`,
        id
      );
    return NextResponse.json({
      ok: true,
      reference: ref,
      role: data.job_title,
      confirmation: module === 'applications' ? settings.application_confirmation : undefined,
      emailSent: emailResult.sent,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to submit. Please try again.' },
      { status: 400 }
    );
  }
}
