import type { MetadataRoute } from 'next';
import { site } from '@/data/site';
import { serviceSlugs, services } from '@/data/services';
import { publishedPosts } from '@/data/blog';
import { generatedLegalPages } from '@/data/generated/legal';

const abs = (path: string) => `${site.url}${path === '/' ? '' : path}`;

/**
 * Sitemap.
 *
 * Only indexable URLs are listed. Excluded on purpose:
 *  - the nine placeholder-bodied posts (noindexed until real content lands)
 *  - the retired WooCommerce /shop surface, which was an indexable soft-404
 *  - tag and author archives, which were thin duplicate pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: abs('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: abs('/our-services'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: abs('/bio'), lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
    { url: abs('/fees-insurance'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    {
      url: abs('/book-telehealth-mental-health-appointment'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
      url: abs('/contact-telehealth-mental-health-provider'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    { url: abs('/faqs'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    {
      url: abs('/telehealth-mental-health-testimonials'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const serviceEntries: MetadataRoute.Sitemap = serviceSlugs.map((slug) => {
    const service = services.find((s) => s.slug === slug);
    return {
      url: abs(`/services/${slug}`),
      lastModified: service?.modified ? new Date(service.modified) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    };
  });

  const blogIndex: MetadataRoute.Sitemap =
    publishedPosts.length > 0
      ? [{ url: abs('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 }]
      : [];

  const postEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: abs(`/${post.slug}`),
    lastModified: post.modifiedAt ? new Date(post.modifiedAt) : now,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  const legalEntries: MetadataRoute.Sitemap = generatedLegalPages.map((page) => ({
    url: abs(`/${page.slug}`),
    lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [...core, ...serviceEntries, ...blogIndex, ...postEntries, ...legalEntries];
}
