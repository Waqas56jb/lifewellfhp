import type { Metadata } from 'next';
import { pageMetadata, type PageMetaInput } from '@/lib/seo';
import type { ResolvedContent } from '@/lib/cms-resolve';

function normalizePath(path: string) {
  if (!path || path === '/') return '/';
  return path.replace(/\/$/, '') || '/';
}

export function cmsMetadata(cms: ResolvedContent, fallback: PageMetaInput): Metadata {
  const path = normalizePath(fallback.path);
  const row = cms.seoByPath[path] ?? cms.seoByPath[fallback.path];
  if (!row) return pageMetadata(fallback);

  return pageMetadata({
    ...fallback,
    title: row.title || fallback.title,
    description: row.description || fallback.description,
    noIndex: row.noindex || fallback.noIndex,
    image: row.ogImageUrl
      ? {
          url: row.ogImageUrl,
          width: fallback.image?.width ?? 1200,
          height: fallback.image?.height ?? 630,
          alt: row.title || fallback.title,
        }
      : fallback.image,
  });
}
