import type { Metadata } from 'next';

import { OurServicesPageContent } from '@/components/sections/OurServicesPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSummaries } from '@/data/services';
import { pageMetadata } from '@/lib/seo';
import { serviceListGraph } from '@/lib/schema';

const DESCRIPTION =
  'Personalized, evidence-based psychiatric care delivered through secure and convenient telehealth sessions as part of our comprehensive online mental health services.';

export const metadata: Metadata = pageMetadata({
  title: 'Our Services — Telehealth Psychiatry & Primary Care',
  description: DESCRIPTION,
  path: '/our-services',
  image: {
    url: '/images/sections/SERVIES-IMG.avif',
    width: 1180,
    height: 990,
    alt: 'Comprehensive online mental health services',
  },
});

export default function OurServicesPage() {
  return (
    <>
      <JsonLd data={serviceListGraph(serviceSummaries, DESCRIPTION)} id="services-schema" />
      <OurServicesPageContent />
    </>
  );
}
