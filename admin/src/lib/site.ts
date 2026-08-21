export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://lifewellfhp-client.vercel.app';

export function publicAssetUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${PUBLIC_SITE_URL}${path}`;
}

export function livePageUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_SITE_URL}${normalized}`;
}
