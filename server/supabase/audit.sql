-- Run once in the Supabase SQL editor (or any Postgres client).
-- Super-admin activity trail. Never stores passwords or clinical content.

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  actor_name text,
  action text not null,
  resource text not null,
  resource_id text,
  summary text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_idx on admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_actor_idx on admin_audit_logs (actor_email);

alter table admin_audit_logs enable row level security;
