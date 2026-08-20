import { getSupabase } from './supabase.js';
import type { AdminTokenPayload } from '../middleware/adminAuth.js';
import { logger } from '../utils/logger.js';
import { writeNotification } from './notify.js';

export type AuditInput = {
  actor?: Pick<AdminTokenPayload, 'sub' | 'email'> & { name?: string; role?: AdminTokenPayload['role'] };
  action: string;
  resource: string;
  resourceId?: string | null;
  summary: string;
  meta?: Record<string, unknown>;
};

/** Best-effort activity log. Must never block the primary request. */
export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    const { error } = await getSupabase().from('admin_audit_logs').insert({
      actor_id: input.actor?.sub ?? null,
      actor_email: input.actor?.email ?? null,
      actor_name: input.actor?.name ?? input.actor?.email ?? null,
      action: input.action,
      resource: input.resource,
      resource_id: input.resourceId ?? null,
      summary: input.summary,
      meta: input.meta ?? {},
    });
    if (error) logger.info('audit skip', { message: error.message });
    if (input.action !== 'login' && input.actor?.role === 'staff') {
      await writeNotification({
        type: 'staff_action',
        audience: 'super_admin',
        title: input.summary,
        body: input.actor.email ? `${input.actor.email} · ${input.action} ${input.resource}` : input.action,
        href: '/logs',
      });
    }
  } catch (err) {
    logger.info('audit skip', { message: err instanceof Error ? err.message : 'unknown' });
  }
}

export function recordLabel(row: Record<string, unknown> | null | undefined): string {
  if (!row) return 'item';
  const value = row.title || row.name || row.question || row.slug || row.path || row.email || row.id;
  return String(value || 'item');
}
