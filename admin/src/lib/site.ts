/** Canonical public hostname (may still be WordPress until DNS is cut over). */
export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lifewellfhp.com';

/**
 * Origin that actually serves the Next.js `/images` and `/video` files.
 * www.lifewellfhp.com is still the old WordPress site, so relative media
 * must load from the Vercel client unless an explicit asset URL is set.
 */
export const PUBLIC_ASSET_URL = assetOrigin();

function stripSlash(url: string) {
  return url.replace(/\/$/, '');
}

function isLocalHost(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function assetOrigin() {
  const explicit = process.env.NEXT_PUBLIC_ASSET_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return stripSlash(explicit);
  if (isLocalHost(PUBLIC_SITE_URL)) return stripSlash(PUBLIC_SITE_URL);
  return 'https://lifewellfhp-client.vercel.app';
}

function isBundledPath(pathname: string) {
  return (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/video/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/brand/')
  );
}

function isLifeWellHost(host: string) {
  return /(^|\.)lifewellfhp\.com$/i.test(host) || /lifewellfhp-client\.vercel\.app$/i.test(host);
}

/** Resolve a CMS/media path so admin previews can load it. */
export function publicAssetUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(data:|blob:)/i.test(trimmed)) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (isLifeWellHost(parsed.hostname) && isBundledPath(parsed.pathname)) {
        return `${PUBLIC_ASSET_URL}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${PUBLIC_ASSET_URL}${path}`;
}

/** “Open live page” should open the Next.js site, not the old WordPress www. */
export function livePageUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_ASSET_URL}${normalized}`;
}
