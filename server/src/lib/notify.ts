import { getSupabase } from './supabase.js';
import { logger } from '../utils/logger.js';

export type NotificationInput = {
  type: 'lead' | 'email' | 'staff_action';
  title: string;
  body?: string | null;
  href?: string | null;
  audience?: 'all' | 'super_admin';
};

function isMissingTable(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    error.code === 'PGRST205' ||
    error.code === '42P01'
  );
}

/** Best-effort inbox for the admin header. Never blocks the primary request. */
export async function writeNotification(input: NotificationInput): Promise<void> {
  try {
    const { error } = await getSupabase().from('admin_notifications').insert({
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
      audience: input.audience ?? 'all',
      read_by: [],
    });
    if (error && !isMissingTable(error)) {
      logger.info('notification skip', { message: error.message });
    }
  } catch (err) {
    logger.info('notification skip', { message: err instanceof Error ? err.message : 'unknown' });
  }
}

export { isMissingTable };
