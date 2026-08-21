/**
 * Bundled photos live on the Next.js app (`/images/...`).
 * www.lifewellfhp.com is still WordPress, so absolute www URLs 404.
 * Keep Supabase (and other remote) URLs unchanged.
 */
export function siteAssetSrc(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(data:|blob:)/i.test(trimmed)) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    const bundled =
      parsed.pathname.startsWith('/images/') ||
      parsed.pathname.startsWith('/video/') ||
      parsed.pathname.startsWith('/fonts/');
    if (
      bundled &&
      (/(^|\.)lifewellfhp\.com$/i.test(parsed.hostname) ||
        /lifewellfhp-client\.vercel\.app$/i.test(parsed.hostname))
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}
