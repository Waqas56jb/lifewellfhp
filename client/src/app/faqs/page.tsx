import type { Metadata } from 'next';

import { Container, Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { FAQAccordion } from '@/components/sections/FAQAccordion';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import { faqs } from '@/data/marketing';
import { site } from '@/data/site';
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

      <PageHero
        eyebrow="Support"
        title="Frequently Asked Questions"
        lead="Find answers to common questions about telehealth mental health services, appointments, insurance, fees, and how to get started with care."
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'FAQs', href: '/faqs' },
        ]}
      />

      <Section tone="base">
        <Container size="narrow">
          {/* Primary content of this page, so questions sit at h2. */}
          <FAQAccordion faqs={faqs} headingLevel={2} />

          <div className="mt-12 rounded-md border border-border-subtle bg-surface-muted p-8 text-center">
            <h2 className="text-h4">Still have a question?</h2>
            <p className="mx-auto mt-4 max-w-[56ch] text-text-secondary">
              If your question isn’t answered here, reach out — you’ll receive a confidential
              response.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
              <Button href="/contact-telehealth-mental-health-provider" size="lg">
                Contact us
              </Button>
              <Button href={site.contact.phoneHref} variant="outline" size="lg">
                Call {site.contact.phone}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <CTASection />
    </>
  );
}
