import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Section } from '@/components/ui/Section';
import { InnerPageHero } from '@/components/sections/InnerPageHero';
import { CTASection } from '@/components/sections/CTASection';
import { pageMetadata } from '@/lib/seo';
import { fetchPublicBlogPost } from '@/lib/cms';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublicBlogPost(slug);
  if (!post) return pageMetadata({ title: 'Article', description: 'LifeWell article', path: `/blog/${slug}`, noIndex: true });
  return pageMetadata({
    title: String(post.seo_title || post.title || 'Article'),
    description: String(post.seo_description || post.excerpt || ''),
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPublicBlogPost(slug);
  if (!post) notFound();

  const title = String(post.title || 'Article');
  const body = typeof post.body === 'string' ? post.body : '';
  const excerpt = typeof post.excerpt === 'string' ? post.excerpt : '';

  return (
    <>
      <InnerPageHero title={title} lead={excerpt || undefined} leadSize="subhead" />
      <Section tone="base">
        <Container>
          <article className="mx-auto max-w-[70ch] whitespace-pre-wrap text-[16px] leading-[1.7] text-[#374151] sm:text-[18px]">
            {body || excerpt || 'This article is being prepared.'}
          </article>
        </Container>
      </Section>
      <CTASection />
    </>
  );
}
