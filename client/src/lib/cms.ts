/**
 * Public CMS client — fetches published content from the API.
 * Falls back to null when the CMS is empty/unconfigured so static data remains.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lifewellfhp-server.vercel.app';

export type PublicCmsPayload = {
  announcements: unknown[];
  services: unknown[];
  providers: unknown[];
  insurance: unknown[];
  testimonials: unknown[];
  faqs: unknown[];
  locations: unknown[];
  posts: unknown[];
  videos: unknown[];
  sections: unknown[];
  booking: unknown[];
  seo: unknown[];
  settings: Record<string, unknown> | null;
};

export async function fetchPublicCms(): Promise<PublicCmsPayload | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/content`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: PublicCmsPayload | null };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function fetchPublicBlogPost(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/blog/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: Record<string, unknown> | null };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function trackPageView(path: string): Promise<void> {
  try {
    const device =
      typeof window === 'undefined'
        ? 'unknown'
        : window.matchMedia('(max-width: 767px)').matches
          ? 'mobile'
          : window.matchMedia('(max-width: 1024px)').matches
            ? 'tablet'
            : 'desktop';

    let referrer_host: string | null = null;
    try {
      referrer_host = document.referrer ? new URL(document.referrer).host : null;
    } catch {
      referrer_host = null;
    }

    await fetch(`${API_URL}/api/public/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        path,
        referrer_host,
        device,
      }),
      keepalive: true,
    });
  } catch {
    // Telemetry must never break the page.
  }
}

export async function trackConversion(
  conversion_type: 'contact' | 'newsletter' | 'booking_click',
  path?: string
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/public/conversions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversion_type, path: path ?? null, meta: {} }),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}
