import 'server-only';
import { Resend } from 'resend';
import { privileged, isDemo } from './server';
export async function sendEmail(to: string, subject: string, text: string, entityId: string) {
  if (isDemo) return { sent: false, reason: 'Demo mode: email is disabled' };
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    return { sent: false, reason: 'Email integration is not configured' };
  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
    if (error) throw error;
    await privileged()
      .from('communication_logs')
      .insert({ entity_id: entityId, recipient: to, subject, status: 'sent' });
    return { sent: true };
  } catch {
    await privileged()
      .from('records')
      .insert({
        module: 'notifications',
        title: 'Email could not be delivered',
        slug: crypto.randomUUID(),
        status: 'unread',
        data: {
          message: 'Check Resend configuration. The submission is saved.',
          entity_id: entityId,
        },
      });
    return { sent: false, reason: 'Email delivery failed; the record is saved' };
  }
}
