import type { Metadata } from 'next';
import { site } from '@/data/site';

/**
 * Canonical metadata builder. Every route derives its metadata from here so
 * titles and descriptions stay unique — the source site shipped the FAQ page
 * with the Privacy Policy's title and description verbatim.
 */

export const DEFAULT_OG_IMAGE = {
  url: '/images/og/default.png',
  width: 1200,
  height: 630,
  alt: 'LifeWell Family Health & Psychiatry — telehealth mental health care',
};

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Absolute or root-relative image path. Falls back to the branded default. */
  image?: { url: string; width: number; height: number; alt: string };
  type?: 'website' | 'article';
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
}

const absolute = (path: string) =>
  path.startsWith('http') ? path : `${site.url}${path.startsWith('/') ? path : `/${path}`}`;

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex = false,
}: PageMetaInput): Metadata {
  const canonical = absolute(path === '/' ? '/' : path.replace(/\/$/, ''));

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: site.locale,
      images: [{ url: absolute(image.url), width: image.width, height: image.height, alt: image.alt }],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absolute(image.url)],
    },
  };
}

/** Appends the practice name, unless the title already carries it. */
export function withBrand(title: string): string {
  return title.includes(site.shortName) || title.includes(site.name)
    ? title
    : `${title} | ${site.name}`;
}
