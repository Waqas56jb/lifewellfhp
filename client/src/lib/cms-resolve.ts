import { cache } from 'react';
import type { Faq, Testimonial, InsuranceCarrier } from '@/types/content';
import { fetchPublicCms, type PublicCmsPayload } from '@/lib/cms';
import {
  faqs as staticFaqs,
  testimonials as staticTestimonials,
  insuranceCarriers as staticInsurance,
  hero as staticHero,
  welcome as staticWelcome,
} from '@/data/marketing';
import { site as staticSite } from '@/data/site';
import {
  homeServiceSummaries as staticHomeServices,
  serviceSummaries as staticServiceSummaries,
  serviceHref,
} from '@/data/service-catalog';
import type { ServiceSummary } from '@/types/content';

export type ResolvedHero = typeof staticHero & {
  headingPrimary?: string;
  headingAccent?: string;
};

export type ResolvedContent = {
  source: 'cms' | 'static';
  hero: ResolvedHero;
  welcome: typeof staticWelcome;
  faqs: Faq[];
  testimonials: Testimonial[];
  insurance: InsuranceCarrier[];
  homeServices: ServiceSummary[];
  serviceSummaries: ServiceSummary[];
  booking: { url: string; label: string };
  announcements: { title: string; body: string; tone: string }[];
  videos: { title: string; url: string; provider: string; description?: string | null; embedHtml?: string | null }[];
  settings: {
    primaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    headerCtaLabel: string;
    headerCtaUrl: string;
    logoUrl: string | null;
    practicePhone: string | null;
    practiceEmail: string | null;
  };
  provider: {
    name: string;
    credentials: string;
    title?: string | null;
    bio?: string | null;
    photoUrl?: string | null;
  } | null;
  locations: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    isPrimary: boolean;
  }[];
  posts: {
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImageUrl?: string | null;
    authorName?: string | null;
    publishedAt?: string | null;
    body?: string | null;
  }[];
};

type CmsService = {
  slug?: string;
  title?: string;
  summary?: string | null;
  published?: boolean;
  sort_order?: number;
};

type CmsSection = {
  page_key?: string;
  section_key?: string;
  title?: string | null;
  content?: Record<string, unknown> | null;
  published?: boolean;
};

function mapFaqs(cms: PublicCmsPayload | null): Faq[] {
  const rows = (cms?.faqs ?? []) as { question?: string; answer?: string }[];
  const mapped = rows
    .filter((r) => r.question && r.answer)
    .map((r) => ({ question: String(r.question), answer: String(r.answer) }));
  return mapped.length ? mapped : staticFaqs;
}

function mapTestimonials(cms: PublicCmsPayload | null): Testimonial[] {
  const rows = (cms?.testimonials ?? []) as {
    quote?: string;
    author_name?: string;
    author_role?: string | null;
    rating?: number | null;
  }[];
  const mapped = rows
    .filter((r) => r.quote && r.author_name)
    .map((r) => ({
      quote: String(r.quote),
      author: String(r.author_name),
      role: r.author_role ? String(r.author_role) : undefined,
      rating: typeof r.rating === 'number' ? r.rating : 5,
    }));
  return mapped.length ? mapped : staticTestimonials;
}

function mapInsurance(cms: PublicCmsPayload | null): InsuranceCarrier[] {
  const rows = (cms?.insurance ?? []) as {
    name?: string;
    logo_url?: string | null;
  }[];
  const mapped = rows
    .filter((r) => r.name)
    .map((r) => ({
      name: String(r.name),
      logo: r.logo_url ? String(r.logo_url) : '/images/insurance/placeholder.svg',
      width: 160,
      height: 64,
    }));
  return mapped.length ? mapped : staticInsurance;
}

function mapServiceSummaries(cms: PublicCmsPayload | null): ServiceSummary[] {
  const rows = (cms?.services ?? []) as CmsService[];
  if (!rows.length) return staticServiceSummaries;

  const bySlug = new Map(staticServiceSummaries.map((s) => [s.slug, s]));
  return rows
    .filter((r) => r.slug && r.title)
    .map((r) => {
      const slug = String(r.slug);
      const base = bySlug.get(slug);
      if (!base) {
        return {
          slug,
          title: String(r.title),
          category: 'psychiatric' as const,
          description: String(r.summary || r.title),
          href: serviceHref(slug),
          image: {
            src: '/images/services/Psychiatric-Evaluation-Telehealth.avif',
            width: 800,
            height: 600,
            alt: String(r.title),
          },
        } satisfies ServiceSummary;
      }
      return {
        ...base,
        title: String(r.title),
        description: String(r.summary || base.description),
      };
    });
}

function mapHomeServices(cms: PublicCmsPayload | null): ServiceSummary[] {
  const all = mapServiceSummaries(cms);
  if (all === staticServiceSummaries) return staticHomeServices;
  return all.slice(0, Math.max(4, Math.min(all.length, 8)));
}

function mapHero(cms: PublicCmsPayload | null): ResolvedHero {
  const sections = (cms?.sections ?? []) as CmsSection[];
  const heroSection = sections.find(
    (s) => s.page_key === 'home' && s.section_key === 'hero' && s.published !== false
  );
  const content = (heroSection?.content ?? {}) as Record<string, unknown>;
  const headline = typeof content.headline === 'string' ? content.headline : null;
  const subhead = typeof content.subhead === 'string' ? content.subhead : null;
  const badge = typeof content.badge === 'string' ? content.badge : null;

  if (!headline && !subhead && !badge) return staticHero;

  // Split headline into primary/accent roughly at midpoint for brand two-tone.
  let headingPrimary = staticHero.heading;
  let headingAccent = '';
  if (headline) {
    const parts = headline.split(/\s+/);
    const mid = Math.ceil(parts.length / 2);
    headingPrimary = parts.slice(0, mid).join(' ');
    headingAccent = parts.slice(mid).join(' ');
  }

  return {
    ...staticHero,
    heading: headline || staticHero.heading,
    subheading: subhead || staticHero.subheading,
    badge: badge || staticHero.badge,
    headingPrimary,
    headingAccent,
  };
}

function mapWelcome(cms: PublicCmsPayload | null): typeof staticWelcome {
  const sections = (cms?.sections ?? []) as CmsSection[];
  const welcomeSection = sections.find(
    (s) => s.page_key === 'home' && s.section_key === 'welcome' && s.published !== false
  );
  const content = (welcomeSection?.content ?? {}) as Record<string, unknown>;
  const heading = typeof content.heading === 'string' ? content.heading : null;
  const body = Array.isArray(content.body)
    ? content.body.filter((b): b is string => typeof b === 'string')
    : typeof content.body === 'string'
      ? [content.body]
      : null;

  if (!heading && !body) return staticWelcome;
  return {
    ...staticWelcome,
    heading: heading || staticWelcome.heading,
    body: body?.length ? body : staticWelcome.body,
  };
}

function mapBooking(cms: PublicCmsPayload | null): { url: string; label: string } {
  const rows = (cms?.booking ?? []) as { booking_url?: string; label?: string; active?: boolean }[];
  const active = rows.find((r) => r.active !== false && r.booking_url);
  if (!active?.booking_url) {
    return { url: staticSite.booking.url, label: staticSite.booking.label };
  }
  return {
    url: String(active.booking_url),
    label: String(active.label || staticSite.booking.label),
  };
}

function mapAnnouncements(cms: PublicCmsPayload | null) {
  const rows = (cms?.announcements ?? []) as {
    title?: string;
    body?: string;
    tone?: string;
    active?: boolean;
  }[];
  return rows
    .filter((r) => r.active !== false && r.title && r.body)
    .map((r) => ({
      title: String(r.title),
      body: String(r.body),
      tone: String(r.tone || 'info'),
    }));
}

function mapVideos(cms: PublicCmsPayload | null) {
  const rows = (cms?.videos ?? []) as {
    title?: string;
    url?: string;
    provider?: string;
    description?: string | null;
    embed_html?: string | null;
    published?: boolean;
  }[];
  return rows
    .filter((r) => r.published !== false && r.title && (r.url || r.embed_html))
    .map((r) => ({
      title: String(r.title),
      url: String(r.url || ''),
      provider: String(r.provider || 'youtube'),
      description: r.description ?? null,
      embedHtml: r.embed_html ?? null,
    }));
}

const DEFAULT_SETTINGS = {
  primaryColor: '#3E7FB1',
  accentColor: '#5FAF6B',
  headingFont: 'Lora',
  bodyFont: 'Source Sans 3',
  headerCtaLabel: 'Get Started',
  headerCtaUrl: '/book-telehealth-mental-health-appointment',
  logoUrl: null as string | null,
  practicePhone: null as string | null,
  practiceEmail: null as string | null,
};

function mapSettings(cms: PublicCmsPayload | null) {
  const row = (cms?.settings ?? null) as Record<string, unknown> | null;
  if (!row) return DEFAULT_SETTINGS;
  return {
    primaryColor: typeof row.primary_color === 'string' ? row.primary_color : DEFAULT_SETTINGS.primaryColor,
    accentColor: typeof row.accent_color === 'string' ? row.accent_color : DEFAULT_SETTINGS.accentColor,
    headingFont: typeof row.heading_font === 'string' ? row.heading_font : DEFAULT_SETTINGS.headingFont,
    bodyFont: typeof row.body_font === 'string' ? row.body_font : DEFAULT_SETTINGS.bodyFont,
    headerCtaLabel: typeof row.header_cta_label === 'string' ? row.header_cta_label : DEFAULT_SETTINGS.headerCtaLabel,
    headerCtaUrl: typeof row.header_cta_url === 'string' ? row.header_cta_url : DEFAULT_SETTINGS.headerCtaUrl,
    logoUrl: typeof row.logo_url === 'string' && row.logo_url ? row.logo_url : null,
    practicePhone: typeof row.practice_phone === 'string' && row.practice_phone ? row.practice_phone : null,
    practiceEmail: typeof row.practice_email === 'string' && row.practice_email ? row.practice_email : null,
  };
}

function mapProvider(cms: PublicCmsPayload | null) {
  const rows = (cms?.providers ?? []) as {
    name?: string;
    credentials?: string | null;
    title?: string | null;
    bio?: string | null;
    photo_url?: string | null;
    published?: boolean;
  }[];
  const row = rows.find((r) => r.published !== false && r.name);
  if (!row?.name) return null;
  return {
    name: String(row.name),
    credentials: String(row.credentials || ''),
    title: row.title ?? null,
    bio: row.bio ?? null,
    photoUrl: row.photo_url ?? null,
  };
}

function mapLocations(cms: PublicCmsPayload | null) {
  const rows = (cms?.locations ?? []) as {
    name?: string;
    phone?: string | null;
    email?: string | null;
    address_line1?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    is_primary?: boolean;
    published?: boolean;
  }[];
  return rows
    .filter((r) => r.published !== false && r.name)
    .map((r) => ({
      name: String(r.name),
      phone: r.phone ?? null,
      email: r.email ?? null,
      address: [r.address_line1, r.city, r.state, r.postal_code].filter(Boolean).join(', ') || null,
      isPrimary: Boolean(r.is_primary),
    }));
}

function mapPosts(cms: PublicCmsPayload | null) {
  const rows = (cms?.posts ?? []) as {
    slug?: string;
    title?: string;
    excerpt?: string | null;
    cover_image_url?: string | null;
    author_name?: string | null;
    published_at?: string | null;
    body?: string | null;
  }[];
  return rows
    .filter((r) => r.slug && r.title)
    .map((r) => ({
      slug: String(r.slug),
      title: String(r.title),
      excerpt: r.excerpt ?? null,
      coverImageUrl: r.cover_image_url ?? null,
      authorName: r.author_name ?? null,
      publishedAt: r.published_at ?? null,
      body: r.body ?? null,
    }));
}

/** Cached per-request CMS resolve with static fallbacks. */
export const getResolvedContent = cache(async (): Promise<ResolvedContent> => {
  const cms = await fetchPublicCms();
  const hasCms = Boolean(cms);

  return {
    source: hasCms ? 'cms' : 'static',
    hero: mapHero(cms),
    welcome: mapWelcome(cms),
    faqs: mapFaqs(cms),
    testimonials: mapTestimonials(cms),
    insurance: mapInsurance(cms),
    homeServices: mapHomeServices(cms),
    serviceSummaries: mapServiceSummaries(cms),
    booking: mapBooking(cms),
    announcements: mapAnnouncements(cms),
    videos: mapVideos(cms),
    settings: mapSettings(cms),
    provider: mapProvider(cms),
    locations: mapLocations(cms),
    posts: mapPosts(cms),
  };
});
