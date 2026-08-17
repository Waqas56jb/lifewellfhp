import type { BlogPost } from '@/types/content';
import { generatedPosts } from './generated/posts';

export const allPosts: BlogPost[] = generatedPosts;

/**
 * Publishable posts.
 *
 * Every one of the nine source articles was flagged by the content generator as
 * WordPress theme filler — the "Occidental / European languages" lorem
 * substitute, Goethe's Werther passage, a dental-practice paragraph in a
 * psychiatry article, and commercial-moving-company copy in a teen therapy
 * article. None can be published as clinical writing.
 *
 * Their routes are preserved (they are indexed and may have inbound links) but
 * they render a short placeholder and are excluded from the index, the sitemap
 * and search engines until real content is supplied. Removing the
 * `needsClientContent` flag in the generated data publishes a post
 * automatically.
 */
export const publishedPosts: BlogPost[] = allPosts.filter((p) => !p.needsClientContent);

export const pendingPosts: BlogPost[] = allPosts.filter((p) => p.needsClientContent);

export const getPost = (slug: string): BlogPost | undefined =>
  allPosts.find((p) => p.slug === slug);

export const postSlugs = allPosts.map((p) => p.slug);

export const postHref = (slug: string) => `/${slug}`;

export const blogCategories = Array.from(
  new Set(allPosts.map((p) => p.category).filter((c): c is string => Boolean(c)))
).sort();
