/**
 * Seed the first Super Admin.
 *
 * Usage (from server/):
 *   node --import tsx scripts/seed-admin.mjs
 *
 * Or set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME in .env
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const email = (process.env.SEED_ADMIN_EMAIL || 'admin@lifewellfhp.com').toLowerCase();
const name = process.env.SEED_ADMIN_NAME || 'LifeWell Super Admin';
const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMeNow!2026';

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const password_hash = await bcrypt.hash(password, 12);

const { data: existing } = await sb.from('admin_users').select('id').eq('email', email).maybeSingle();

if (existing) {
  const { error } = await sb
    .from('admin_users')
    .update({
      name,
      role: 'super_admin',
      permissions: ['*'],
      active: true,
      password_hash,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }

  console.log(`Admin updated: ${email}`);
  process.exit(0);
}

const { error } = await sb.from('admin_users').insert({
  email,
  name,
  role: 'super_admin',
  permissions: ['*'],
  active: true,
  password_hash,
});

if (error) {
  console.error('Seed failed:', error.message);
  console.error('Did you run server/supabase/schema.sql in the Supabase SQL editor?');
  process.exit(1);
}

console.log('Super admin created.');
console.log(`  email: ${email}`);
console.log(`  password: ${password}`);
console.log('Change this password after first login.');
