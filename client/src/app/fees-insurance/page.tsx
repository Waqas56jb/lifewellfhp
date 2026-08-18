import type { Metadata } from 'next';

import { FeesPageContent } from '@/components/sections/FeesPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { feesIntro } from '@/data/pricing';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Transparent telehealth fees and insurance information — self-pay rates for mental health, primary care and weight management, plus accepted plans and superbill details.';

export const metadata: Metadata = pageMetadata({
  title: 'Fees & Insurance — Transparent Telehealth Pricing',
  description: DESCRIPTION,
  path: '/fees-insurance',
  image: {
    url: feesIntro.image.src,
    width: feesIntro.image.width,
    height: feesIntro.image.height,
    alt: feesIntro.image.alt,
  },
});

export default function FeesInsurancePage() {
  return (
    <>
      <JsonLd
        data={pageGraph('/fees-insurance', 'Fees & Insurance', DESCRIPTION, [
          { name: 'Home', href: '/' },
          { name: 'Fees & Insurance', href: '/fees-insurance' },
        ])}
        id="fees-schema"
      />
      <FeesPageContent />
    </>
  );
}
