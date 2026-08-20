import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getSupabase } from '../lib/supabase.js';
import {
  signAdminToken,
  type AdminRole,
  type AuthedRequest,
} from '../middleware/adminAuth.js';
import { loginSchema, adminUserCreate, adminUserUpdate } from '../validation/adminSchemas.js';
import { badRequest, unauthorized, notFound } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function handleAdminLogin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest('Email and password are required.');

  const email = parsed.data.email.toLowerCase().trim();
  const { data: user, error } = await getSupabase()
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw badRequest(error.message);
  if (!user || !user.active) throw unauthorized('Invalid email or password.');

  const ok = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!ok) throw unauthorized('Invalid email or password.');

  const token = signAdminToken({
    sub: user.id,
    email: user.email,
    role: user.role as AdminRole,
    permissions: (user.permissions as string[]) ?? [],
  });

  await getSupabase()
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  logger.info('admin login', { role: user.role });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    },
  });
}

export async function handleAdminMe(req: Request, res: Response): Promise<void> {
  const admin = (req as AuthedRequest).admin;
  if (!admin) throw unauthorized('Sign in required.');

  const { data: user, error } = await getSupabase()
    .from('admin_users')
    .select('id, email, name, role, permissions, active, last_login_at, created_at')
    .eq('id', admin.sub)
    .maybeSingle();

  if (error) throw badRequest(error.message);
  if (!user || !user.active) throw unauthorized('Account inactive.');

  res.json({ success: true, data: user });
}

export async function listAdminUsers(_req: Request, res: Response): Promise<void> {
  const { data, error } = await getSupabase()
    .from('admin_users')
    .select('id, email, name, role, permissions, active, last_login_at, created_at')
    .order('created_at', { ascending: true });
  if (error) throw badRequest(error.message);
  res.json({ success: true, data });
}

export async function createAdminUser(req: Request, res: Response): Promise<void> {
  const parsed = adminUserCreate.safeParse(req.body);
  if (!parsed.success) throw badRequest('Invalid user payload.');

  const password_hash = await bcrypt.hash(parsed.data.password, 12);
  const { data, error } = await getSupabase()
    .from('admin_users')
    .insert({
      email: parsed.data.email.toLowerCase().trim(),
      name: parsed.data.name,
      role: parsed.data.role,
      permissions: parsed.data.permissions,
      active: parsed.data.active,
      password_hash,
    })
    .select('id, email, name, role, permissions, active, created_at')
    .single();

  if (error) throw badRequest(error.message);
  res.status(201).json({ success: true, data });
}

export async function updateAdminUser(req: Request, res: Response): Promise<void> {
  const parsed = adminUserUpdate.safeParse(req.body);
  if (!parsed.success) throw badRequest('Invalid user payload.');

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.email) patch.email = parsed.data.email.toLowerCase().trim();
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.role !== undefined) patch.role = parsed.data.role;
  if (parsed.data.permissions !== undefined) patch.permissions = parsed.data.permissions;
  if (parsed.data.active !== undefined) patch.active = parsed.data.active;
  if (parsed.data.password) patch.password_hash = await bcrypt.hash(parsed.data.password, 12);

  const { data, error } = await getSupabase()
    .from('admin_users')
    .update(patch)
    .eq('id', req.params.id)
    .select('id, email, name, role, permissions, active, last_login_at, created_at')
    .maybeSingle();

  if (error) throw badRequest(error.message);
  if (!data) throw notFound('User not found.');
  res.json({ success: true, data });
}

export async function deleteAdminUser(req: Request, res: Response): Promise<void> {
  const admin = (req as AuthedRequest).admin;
  if (admin?.sub === req.params.id) {
    throw badRequest('You cannot delete your own account.');
  }
  const { error } = await getSupabase().from('admin_users').delete().eq('id', req.params.id);
  if (error) throw badRequest(error.message);
  res.json({ success: true });
}
