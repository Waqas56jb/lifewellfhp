import type { Request, Response } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { badRequest } from '../utils/errors.js';
import { isMissingTable } from '../lib/notify.js';
import type { AuthedRequest } from '../middleware/adminAuth.js';

type NotificationRow = {
  id: string;
  type: string;
  audience: string;
  title: string;
  body: string | null;
  href: string | null;
  read_by: unknown;
  created_at: string;
};

function readByIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string');
}

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const admin = (req as AuthedRequest).admin;
  if (!admin) throw badRequest('Sign in required.');

  const { data, error } = await getSupabase()
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(80);

  if (error) {
    if (isMissingTable(error)) {
      res.json({ success: true, data: [], unread: 0 });
      return;
    }
    throw badRequest(error.message);
  }

  const visible = ((data ?? []) as NotificationRow[]).filter((row) => {
    if (row.audience === 'super_admin') return admin.role === 'super_admin';
    return true;
  });

  const rows = visible.map((row) => {
    const readBy = readByIds(row.read_by);
    return {
      ...row,
      unread: !readBy.includes(admin.sub),
    };
  });

  res.json({
    success: true,
    data: rows,
    unread: rows.filter((row) => row.unread).length,
  });
}

export async function markNotificationsRead(req: Request, res: Response): Promise<void> {
  const admin = (req as AuthedRequest).admin;
  if (!admin) throw badRequest('Sign in required.');

  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.filter((id: unknown) => typeof id === 'string')
    : [];

  const { data, error } = await getSupabase()
    .from('admin_notifications')
    .select('id, read_by')
    .in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

  if (error) {
    if (isMissingTable(error)) {
      res.json({ success: true });
      return;
    }
    throw badRequest(error.message);
  }

  await Promise.all(
    (data ?? []).map(async (row) => {
      const readBy = new Set(readByIds(row.read_by));
      readBy.add(admin.sub);
      await getSupabase()
        .from('admin_notifications')
        .update({ read_by: Array.from(readBy) })
        .eq('id', row.id);
    })
  );

  res.json({ success: true });
}
