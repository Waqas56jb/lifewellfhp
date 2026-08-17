import type { Metadata } from 'next';
import { LegalPageTemplate, getLegalPage } from '@/components/sections/LegalPageTemplate';
import { pageMetadata } from '@/lib/seo';

const SLUG = 'privacy-policy';
const page = getLegalPage(SLUG);

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy — How We Protect Your Information',
  description:
    page?.seoDescription ??
    page?.intro[0]?.slice(0, 158) ??
    'Privacy Policy for LifeWell Family Health & Psychiatry.',
  path: `/${SLUG}`,
});

export default function Page() {
  return <LegalPageTemplate slug={SLUG} label="Privacy Policy" />;
}
