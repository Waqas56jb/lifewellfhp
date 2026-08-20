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
import { homeServiceSummaries as staticHomeServices, serviceSummaries as staticServiceSummaries, serviceHref } from '@/data/services';
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
  videos: { title: string; url: string; provider: string; description?: string | null }[];
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
    published?: boolean;
  }[];
  return rows
    .filter((r) => r.published !== false && r.title && r.url)
    .map((r) => ({
      title: String(r.title),
      url: String(r.url),
      provider: String(r.provider || 'youtube'),
      description: r.description ?? null,
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
  };
});
