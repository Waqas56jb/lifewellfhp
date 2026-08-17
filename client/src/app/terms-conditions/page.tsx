import type { Metadata } from 'next';
import { LegalPageTemplate, getLegalPage } from '@/components/sections/LegalPageTemplate';
import { pageMetadata } from '@/lib/seo';

const SLUG = 'terms-conditions';
const page = getLegalPage(SLUG);

export const metadata: Metadata = pageMetadata({
  title: 'Terms & Conditions — Website and Telehealth Use',
  description:
    page?.seoDescription ??
    page?.intro[0]?.slice(0, 158) ??
    'Terms & Conditions for LifeWell Family Health & Psychiatry.',
  path: `/${SLUG}`,
});

export default function Page() {
  return <LegalPageTemplate slug={SLUG} label="Terms & Conditions" />;
}
