import { getSupabase, supabaseConfigured } from './supabase.js';
import { isMissingTable } from './notify.js';
import { logger } from '../utils/logger.js';

export type MailLogInput = {
  direction: 'inbound' | 'outbound';
  from_email?: string | null;
  from_name?: string | null;
  to_email: string;
  to_name?: string | null;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  error?: string | null;
  lead_id?: string | null;
  sent_by?: string | null;
  sent_by_email?: string | null;
};

export async function logEmailMessage(input: MailLogInput): Promise<void> {
  if (!supabaseConfigured()) return;
  const full = {
    direction: input.direction,
    from_email: input.from_email ?? null,
    from_name: input.from_name ?? null,
    to_email: input.to_email,
    to_name: input.to_name ?? null,
    subject: input.subject,
    body: input.body,
    status: input.status,
    error: input.error ?? null,
    lead_id: input.lead_id ?? null,
    sent_by: input.sent_by ?? null,
    sent_by_email: input.sent_by_email ?? null,
  };
  try {
    const first = await getSupabase().from('email_messages').insert(full);
    if (!first.error) return;
    if (isMissingTable(first.error)) return;
    const fallback = await getSupabase().from('email_messages').insert({
      to_email: input.to_email,
      to_name: input.to_name ?? input.from_name ?? null,
      subject: input.subject,
      body: input.body,
      status: input.status,
      error: input.error ?? null,
      lead_id: input.lead_id ?? null,
      sent_by: input.sent_by ?? null,
      sent_by_email: input.direction === 'inbound' ? input.from_email ?? null : input.sent_by_email ?? null,
    });
    if (fallback.error && !isMissingTable(fallback.error)) {
      logger.info('email log skip', { message: fallback.error.message });
    }
  } catch (err) {
    logger.info('email log skip', { message: err instanceof Error ? err.message : 'unknown' });
  }
}
