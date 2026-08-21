import { api } from '@/lib/api';

export type Placement = {
  label: string;
  path: string;
  detail: string;
};

function includesUrl(haystack: unknown, url: string): boolean {
  if (!url) return false;
  if (typeof haystack === 'string') return haystack.includes(url) || (url.startsWith('http') && haystack.includes(url.replace(/^https?:\/\/[^/]+/, '')));
  if (haystack && typeof haystack === 'object') return JSON.stringify(haystack).includes(url);
  return false;
}

export async function findMediaPlacements(url: string): Promise<Placement[]> {
  if (!url) return [];
  const [services, insurance, providers, sections, settings, blog, seo] = await Promise.all([
    api<Record<string, unknown>[]>('/api/admin/services'),
    api<Record<string, unknown>[]>('/api/admin/insurance'),
    api<Record<string, unknown>[]>('/api/admin/providers'),
    api<Record<string, unknown>[]>('/api/admin/sections'),
    api<Record<string, unknown>>('/api/admin/settings'),
    api<Record<string, unknown>[]>('/api/admin/blog'),
    api<Record<string, unknown>[]>('/api/admin/seo'),
  ]);

  const found: Placement[] = [];

  for (const row of services.data || []) {
    if (includesUrl(row.image_url, url) || includesUrl(row.icon, url)) {
      found.push({
        label: 'Services',
        path: `/services/${String(row.slug || '')}`,
        detail: `${String(row.title || 'Service')} card and service page hero`,
      });
    }
  }

  for (const row of insurance.data || []) {
    if (includesUrl(row.logo_url, url)) {
      found.push({
        label: 'Fees & Insurance',
        path: '/fees-insurance',
        detail: `${String(row.name || 'Plan')} logo in the insurance grid`,
      });
    }
  }

  for (const row of providers.data || []) {
    if (includesUrl(row.photo_url, url)) {
      found.push({
        label: 'Provider bio',
        path: '/bio',
        detail: `Photo for ${String(row.name || 'provider')}`,
      });
    }
  }

  for (const row of sections.data || []) {
    if (includesUrl(row.content, url) || includesUrl(row.title, url)) {
      found.push({
        label: 'Homepage',
        path: '/',
        detail: `${String(row.page_key || 'page')} / ${String(row.section_key || 'section')}`,
      });
    }
  }

  const settingsRow = settings.data;
  if (settingsRow && includesUrl(settingsRow.logo_url, url)) {
    found.push({
      label: 'Appearance',
      path: '/',
      detail: 'Header and footer logo',
    });
  }

  for (const row of blog.data || []) {
    if (includesUrl(row.cover_image_url, url) || includesUrl(row.og_image_url, url)) {
      found.push({
        label: 'Blog',
        path: `/blog/${String(row.slug || '')}`,
        detail: `Cover image for “${String(row.title || 'post')}”`,
      });
    }
  }

  for (const row of seo.data || []) {
    if (includesUrl(row.og_image_url, url)) {
      found.push({
        label: 'SEO / social share',
        path: String(row.path || '/'),
        detail: `Social preview image for ${String(row.path || '/')}`,
      });
    }
  }

  return found;
}

export const MEDIA_LIBRARY_HINT =
  'Uploading here only stores the file. Visitors see it after you save and attach the URL to a service, insurance plan, homepage block, logo, or blog post.';

export const VIDEO_PLACEMENT: Placement = {
  label: 'Homepage',
  path: '/#videos',
  detail: 'Watch and Learn video row on the homepage. Published videos go live after Save.',
};
