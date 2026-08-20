-- LifeWell admin CMS schema (run in Supabase SQL editor)
-- Privacy: no clinical PHI columns; contact messages are operational leads only.

create extension if not exists "pgcrypto";

-- Roles: super_admin | staff
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null check (role in ('super_admin', 'staff')),
  password_hash text not null,
  permissions jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'support', 'newsletter')),
  name text,
  email text,
  phone text,
  subject text,
  message text,
  status text not null default 'new' check (status in ('new', 'open', 'replied', 'closed', 'spam')),
  source text default 'website',
  reference_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on leads (status);
create index if not exists leads_created_idx on leads (created_at desc);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  tone text not null default 'info' check (tone in ('info', 'warning', 'urgent')),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body text,
  icon text,
  published boolean not null default true,
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  credentials text,
  title text,
  bio text,
  education jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  photo_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists insurance_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  notes text,
  self_pay boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null,
  author_role text,
  rating int check (rating is null or (rating >= 1 and rating <= 5)),
  published boolean not null default false,
  consent_confirmed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  phone text,
  email text,
  hours jsonb not null default '{}'::jsonb,
  is_primary boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  cover_image_url text,
  author_name text,
  published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  alt_text text,
  mime_type text,
  width int,
  height int,
  folder text default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  provider text not null default 'youtube' check (provider in ('youtube', 'vimeo', 'file', 'embed')),
  url text not null,
  embed_html text,
  thumbnail_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create table if not exists booking_settings (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'Book appointment',
  booking_url text not null,
  provider text default 'charmhealth',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists seo_meta (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  title text,
  description text,
  og_image_url text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Privacy-focused analytics: no names, emails, or free-text patient content.
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'session_start', 'outbound_click')),
  path text,
  referrer_host text,
  device text check (device in ('mobile', 'tablet', 'desktop', 'unknown')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on analytics_events (created_at desc);
create index if not exists analytics_events_path_idx on analytics_events (path);

create table if not exists conversions (
  id uuid primary key default gen_random_uuid(),
  conversion_type text not null check (conversion_type in ('contact', 'newsletter', 'booking_click')),
  path text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;
alter table leads enable row level security;
alter table announcements enable row level security;
alter table services enable row level security;
alter table providers enable row level security;
alter table insurance_plans enable row level security;
alter table testimonials enable row level security;
alter table faqs enable row level security;
alter table locations enable row level security;
alter table blog_posts enable row level security;
alter table media_assets enable row level security;
alter table videos enable row level security;
alter table site_sections enable row level security;
alter table booking_settings enable row level security;
alter table seo_meta enable row level security;
alter table analytics_events enable row level security;
alter table conversions enable row level security;
-- Access is via service role from the API only (no public anon policies).
