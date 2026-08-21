import { cache } from 'react';
import type { Benefit, Faq, Testimonial, InsuranceCarrier, Stat, Step } from '@/types/content';
import { fetchPublicCms, type PublicCmsPayload } from '@/lib/cms';
import {
  faqs as staticFaqs,
  testimonials as staticTestimonials,
  insuranceCarriers as staticInsurance,
  hero as staticHero,
  welcome as staticWelcome,
  benefits as staticBenefits,
  benefitsSection as staticBenefitsSection,
  howItWorks as staticHowItWorks,
  steps as staticSteps,
  stats as staticStats,
  servicesSection as staticServicesSection,
} from '@/data/marketing';
import { site as staticSite } from '@/data/site';
import { feesFaqs as staticFeesFaqs } from '@/data/pricing';
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
  feesFaqs: Faq[];
  testimonials: Testimonial[];
  insurance: InsuranceCarrier[];
  homeServices: ServiceSummary[];
  serviceSummaries: ServiceSummary[];
  servicesIntro: { eyebrow: string; heading: string; body: string; cta: string };
  benefitsHeading: string;
  benefits: Benefit[];
  howItWorks: { eyebrow: string; heading: string; body: string };
  steps: Step[];
  stats: Stat[];
  booking: { url: string; page: string; label: string };
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
  serviceDetails: {
    slug: string;
    title: string;
    summary: string;
    body: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }[];
};

type CmsService = {
  slug?: string;
  title?: string;
  summary?: string | null;
  body?: string | null;
  published?: boolean;
  sort_order?: number;
  image_url?: string | null;
  icon?: string | null;
  category?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
};

type CmsSection = {
  page_key?: string;
  section_key?: string;
  title?: string | null;
  content?: Record<string, unknown> | null;
  published?: boolean;
};

function cmsLive(cms: PublicCmsPayload | null): boolean {
  if (!cms) return false;
  return Boolean(
    cms.settings ||
      cms.faqs?.length ||
      cms.services?.length ||
      cms.sections?.length ||
      cms.testimonials?.length ||
      cms.insurance?.length
  );
}

function sectionContent(cms: PublicCmsPayload | null, page: string, key: string): Record<string, unknown> | null {
  const sections = (cms?.sections ?? []) as CmsSection[];
  const row = sections.find((s) => s.page_key === page && s.section_key === key && s.published !== false);
  return row?.content && typeof row.content === 'object' ? (row.content as Record<string, unknown>) : null;
}

function mapFaqs(cms: PublicCmsPayload | null, live: boolean): Faq[] {
  const rows = (cms?.faqs ?? []) as { question?: string; answer?: string; category?: string | null }[];
  const mapped = rows
    .filter((r) => r.question && r.answer && String(r.category || 'General') !== 'Fees')
    .map((r) => ({ question: String(r.question), answer: String(r.answer) }));
  if (live) return mapped;
  return mapped.length ? mapped : staticFaqs;
}

function mapFeesFaqs(cms: PublicCmsPayload | null, live: boolean): Faq[] {
  const rows = (cms?.faqs ?? []) as { question?: string; answer?: string; category?: string | null }[];
  const mapped = rows
    .filter((r) => r.question && r.answer && String(r.category || '') === 'Fees')
    .map((r) => ({ question: String(r.question), answer: String(r.answer) }));
  if (live) return mapped.length ? mapped : staticFeesFaqs;
  return mapped.length ? mapped : staticFeesFaqs;
}

function mapTestimonials(cms: PublicCmsPayload | null, live: boolean): Testimonial[] {
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
  if (live) return mapped;
  return mapped.length ? mapped : staticTestimonials;
}

function mapInsurance(cms: PublicCmsPayload | null, live: boolean): InsuranceCarrier[] {
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
  if (live) return mapped;
  return mapped.length ? mapped : staticInsurance;
}

function mapServiceSummaries(cms: PublicCmsPayload | null, live: boolean): ServiceSummary[] {
  const rows = (cms?.services ?? []) as CmsService[];
  if (!rows.length) return live ? [] : staticServiceSummaries;

  const bySlug = new Map(staticServiceSummaries.map((s) => [s.slug, s]));
  return rows
    .filter((r) => r.slug && r.title)
    .map((r) => {
      const slug = String(r.slug);
      const base = bySlug.get(slug);
      const category =
        r.category === 'primary-care' || r.category === 'psychiatric'
          ? r.category
          : base?.category ?? 'psychiatric';
      const imageSrc =
        (typeof r.image_url === 'string' && r.image_url) ||
        (typeof r.icon === 'string' && r.icon) ||
        base?.image.src ||
        '/images/services/Psychiatric-Evaluation-Telehealth.avif';
      return {
        slug,
        title: String(r.title),
        category,
        description: String(r.summary || base?.description || r.title),
        href: serviceHref(slug),
        image: {
          src: imageSrc,
          width: base?.image.width ?? 800,
          height: base?.image.height ?? 600,
          alt: String(r.title),
        },
      } satisfies ServiceSummary;
    });
}

function mapServiceDetails(cms: PublicCmsPayload | null) {
  const rows = (cms?.services ?? []) as CmsService[];
  return rows
    .filter((r) => r.slug && r.title)
    .map((r) => ({
      slug: String(r.slug),
      title: String(r.title),
      summary: String(r.summary || ''),
      body: r.body ? String(r.body) : null,
      seoTitle: r.seo_title ? String(r.seo_title) : null,
      seoDescription: r.seo_description ? String(r.seo_description) : null,
    }));
}

function mapHomeServices(cms: PublicCmsPayload | null, live: boolean): ServiceSummary[] {
  const all = mapServiceSummaries(cms, live);
  if (!live && all === staticServiceSummaries) return staticHomeServices;
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

function calendarEmbedUrl(value: string | undefined) {
  const url = (value || '').trim();
  if (/charmtracker\.com|clientsecure\.me/i.test(url)) return url;
  return staticSite.booking.url;
}

function mapBooking(cms: PublicCmsPayload | null): { url: string; page: string; label: string } {
  const rows = (cms?.booking ?? []) as { booking_url?: string; label?: string; active?: boolean }[];
  const active = rows.find((r) => r.active !== false && r.booking_url);
  return {
    url: calendarEmbedUrl(active?.booking_url),
    page: staticSite.booking.page,
    label: String(active?.label || staticSite.booking.label),
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
  headerCtaUrl: '/book-telehealth-mental-health-appointment#charm-calendar',
  logoUrl: null as string | null,
  practicePhone: null as string | null,
  practiceEmail: null as string | null,
};

function hexColor(value: unknown, fallback: string) {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function mapSettings(cms: PublicCmsPayload | null) {
  const row = (cms?.settings ?? null) as Record<string, unknown> | null;
  if (!row) return DEFAULT_SETTINGS;
  return {
    primaryColor: hexColor(row.primary_color, DEFAULT_SETTINGS.primaryColor),
    accentColor: hexColor(row.accent_color, DEFAULT_SETTINGS.accentColor),
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

function mapServicesIntro(cms: PublicCmsPayload | null) {
  const content = sectionContent(cms, 'home', 'services');
  if (!content) return { ...staticServicesSection, cta: staticServicesSection.cta.label };
  return {
    eyebrow: typeof content.eyebrow === 'string' ? content.eyebrow : staticServicesSection.eyebrow,
    heading: typeof content.heading === 'string' ? content.heading : staticServicesSection.heading,
    body: typeof content.body === 'string' ? content.body : staticServicesSection.body,
    cta: typeof content.cta === 'string' ? content.cta : staticServicesSection.cta.label,
  };
}

function mapBenefits(cms: PublicCmsPayload | null): { heading: string; items: Benefit[] } {
  const content = sectionContent(cms, 'home', 'benefits');
  const heading =
    typeof content?.heading === 'string' ? content.heading : staticBenefitsSection.heading;
  const raw = Array.isArray(content?.items) ? content.items : [];
  const items: Benefit[] = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.title !== 'string' || typeof row.description !== 'string') return null;
      const imageSrc =
        typeof row.image === 'string'
          ? row.image
          : staticBenefits[0]?.image.src || '/images/benefits/Personalized-One-on-One-Care.avif';
      return {
        title: row.title,
        description: row.description,
        image: { src: imageSrc, width: 1180, height: 1180 },
      } satisfies Benefit;
    })
    .filter((item): item is Benefit => Boolean(item));
  return { heading, items: items.length ? items : staticBenefits };
}

function mapHowItWorks(cms: PublicCmsPayload | null) {
  const content = sectionContent(cms, 'home', 'how_it_works');
  const rawSteps = Array.isArray(content?.steps) ? content.steps : [];
  const steps: Step[] = rawSteps
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.title !== 'string' || typeof row.description !== 'string') return null;
      return { title: row.title, description: row.description } satisfies Step;
    })
    .filter((item): item is Step => Boolean(item));
  return {
    eyebrow: typeof content?.eyebrow === 'string' ? content.eyebrow : staticHowItWorks.eyebrow,
    heading: typeof content?.heading === 'string' ? content.heading : staticHowItWorks.heading,
    body: typeof content?.body === 'string' ? content.body : staticHowItWorks.body,
    steps: steps.length ? steps : staticSteps,
  };
}

function mapStats(cms: PublicCmsPayload | null): Stat[] {
  const content = sectionContent(cms, 'home', 'stats');
  const raw = Array.isArray(content?.items) ? content.items : [];
  const items: Stat[] = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.label !== 'string') return null;
      return {
        value: Number(row.value) || 0,
        suffix: typeof row.suffix === 'string' ? row.suffix : '',
        label: row.label,
        requiresVerification: Boolean(row.requiresVerification),
      } satisfies Stat;
    })
    .filter((item): item is Stat => Boolean(item));
  return items.length ? items : staticStats;
}

/** Cached per-request CMS resolve with static fallbacks. */
export const getResolvedContent = cache(async (): Promise<ResolvedContent> => {
  const cms = await fetchPublicCms();
  const live = cmsLive(cms);
  const benefits = mapBenefits(cms);
  const howItWorks = mapHowItWorks(cms);

  return {
    source: live ? 'cms' : 'static',
    hero: mapHero(cms),
    welcome: mapWelcome(cms),
    faqs: mapFaqs(cms, live),
    feesFaqs: mapFeesFaqs(cms, live),
    testimonials: mapTestimonials(cms, live),
    insurance: mapInsurance(cms, live),
    homeServices: mapHomeServices(cms, live),
    serviceSummaries: mapServiceSummaries(cms, live),
    servicesIntro: mapServicesIntro(cms),
    benefitsHeading: benefits.heading,
    benefits: benefits.items,
    howItWorks: {
      eyebrow: howItWorks.eyebrow,
      heading: howItWorks.heading,
      body: howItWorks.body,
    },
    steps: howItWorks.steps,
    stats: mapStats(cms),
    booking: mapBooking(cms),
    announcements: mapAnnouncements(cms),
    videos: mapVideos(cms),
    settings: mapSettings(cms),
    provider: mapProvider(cms),
    locations: mapLocations(cms),
    posts: mapPosts(cms),
    serviceDetails: mapServiceDetails(cms),
  };
});
