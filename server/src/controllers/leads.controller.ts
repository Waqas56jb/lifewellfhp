import type { Request, Response } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { badRequest, notFound } from '../utils/errors.js';
import { leadUpdate } from '../validation/adminSchemas.js';
import { writeAuditLog } from '../lib/audit.js';
import { writeNotification } from '../lib/notify.js';
import type { AuthedRequest } from '../middleware/adminAuth.js';

export async function listLeads(req: Request, res: Response): Promise<void> {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const type = typeof req.query.type === 'string' ? req.query.type : undefined;
  let query = getSupabase().from('leads').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw badRequest(error.message);
  res.json({ success: true, data });
}

export async function getLead(req: Request, res: Response): Promise<void> {
  const { data, error } = await getSupabase()
    .from('leads')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();
  if (error) throw badRequest(error.message);
  if (!data) throw notFound('Lead not found.');
  res.json({ success: true, data });
}

export async function updateLead(req: Request, res: Response): Promise<void> {
  const parsed = leadUpdate.safeParse(req.body);
  if (!parsed.success) throw badRequest('Invalid lead update.');

  const { data, error } = await getSupabase()
    .from('leads')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*')
    .maybeSingle();

  if (error) throw badRequest(error.message);
  if (!data) throw notFound('Lead not found.');
  const actor = (req as AuthedRequest).admin;
  await writeAuditLog({
    actor,
    action: 'update',
    resource: 'leads',
    resourceId: data.id,
    summary: `Updated lead ${data.reference_id || data.email || data.id} → ${data.status}`,
  });
  res.json({ success: true, data });
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  const { error } = await getSupabase().from('leads').delete().eq('id', req.params.id);
  if (error) throw badRequest(error.message);
  res.json({ success: true });
}

/** Store a website lead without logging message body (PHI-safe). */
export async function storeLead(input: {
  type: 'contact' | 'support' | 'newsletter';
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  reference_id?: string;
  source?: string;
}): Promise<void> {
  const { error } = await getSupabase().from('leads').insert({
    type: input.type,
    name: input.name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    subject: input.subject ?? null,
    message: input.message ?? null,
    reference_id: input.reference_id ?? null,
    source: input.source ?? 'website',
    status: 'new',
  });
  if (error) {
    // Soft-fail so form delivery is not blocked if DB is down.
    throw new Error(error.message);
  }
  await writeNotification({
    type: 'lead',
    audience: 'all',
    title: input.type === 'newsletter' ? 'New newsletter signup' : 'New website inquiry',
    body: [input.name, input.email, input.subject].filter(Boolean).join(' · ') || 'Website visitor',
    href: '/leads',
  });
}
