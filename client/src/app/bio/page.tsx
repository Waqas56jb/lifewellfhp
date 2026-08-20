import type { Metadata } from 'next';

import { BioPageContent } from '@/components/sections/BioPageContent';
import { JsonLd } from '@/components/seo/JsonLd';

import { provider } from '@/data/provider';
import { pageMetadata } from '@/lib/seo';
import { providerPageGraph } from '@/lib/schema';
import { getResolvedContent } from '@/lib/cms-resolve';

const DESCRIPTION =
  'Meet Lourdie Chachoute, FNP-C, PMHNP-BC — a dual-certified Family and Psychiatric-Mental Health Nurse Practitioner with over 15 years of clinical experience, providing telehealth psychiatric care.';

export const metadata: Metadata = pageMetadata({
  title: 'Meet Your Provider — Lourdie Chachoute, PMHNP-BC',
  description: DESCRIPTION,
  path: '/bio',
  image: {
    url: provider.image.src,
    width: provider.image.width,
    height: provider.image.height,
    alt: provider.image.alt,
  },
});

export default async function BioPage() {
  const cms = await getResolvedContent();
  return (
    <>
      <JsonLd data={providerPageGraph(DESCRIPTION)} id="provider-schema" />
      <BioPageContent overlay={cms.provider ?? undefined} />
    </>
  );
}
