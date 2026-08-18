import type { Metadata } from 'next';

import { FaqsPageContent } from '@/components/sections/FaqsPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqs } from '@/data/marketing';
import { pageMetadata } from '@/lib/seo';
import { faqGraph } from '@/lib/schema';

/**
 * The source site published this page with the Privacy Policy's <title> and
 * meta description verbatim. Both are unique here.
 */
const DESCRIPTION =
  'Answers to common questions about telehealth mental health care — how appointments work, insurance and fees, confidentiality, what you need for a visit, and rescheduling.';

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions — Telehealth Mental Health Care',
  description: DESCRIPTION,
  path: '/faqs',
});

export default function FaqsPage() {
  return (
    <>
      <JsonLd data={faqGraph(faqs, DESCRIPTION)} id="faq-schema" />
      <FaqsPageContent />
    </>
  );
}
