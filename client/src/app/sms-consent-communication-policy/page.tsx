import type { Metadata } from 'next';
import { LegalPageTemplate, getLegalPage } from '@/components/sections/LegalPageTemplate';
import { pageMetadata } from '@/lib/seo';

const SLUG = 'sms-consent-communication-policy';
const page = getLegalPage(SLUG);

export const metadata: Metadata = pageMetadata({
  title: 'SMS Consent & Communication Policy',
  description:
    page?.seoDescription ??
    page?.intro[0]?.slice(0, 158) ??
    'SMS Consent Policy for LifeWell Family Health & Psychiatry.',
  path: `/${SLUG}`,
});

export default function Page() {
  return <LegalPageTemplate slug={SLUG} label="SMS Consent Policy" />;
}
