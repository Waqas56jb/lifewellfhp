import type { Metadata } from 'next';
import { LegalPageTemplate, getLegalPage } from '@/components/sections/LegalPageTemplate';
import { pageMetadata } from '@/lib/seo';

const SLUG = 'accessibility-statement';
const page = getLegalPage(SLUG);

export const metadata: Metadata = pageMetadata({
  title: 'Accessibility Statement — Our Commitment to Access',
  description:
    page?.seoDescription ??
    page?.intro[0]?.slice(0, 158) ??
    'Accessibility Statement for LifeWell Family Health & Psychiatry.',
  path: `/${SLUG}`,
});

export default function Page() {
  return <LegalPageTemplate slug={SLUG} label="Accessibility Statement" />;
}
