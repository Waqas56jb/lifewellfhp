import type { Metadata } from 'next';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { PageHero } from '@/components/sections/PageHero';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { BenefitsGrid } from '@/components/sections/BenefitsGrid';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import { serviceSummaries, summariesByCategory, serviceCategories } from '@/data/services';
import { pageMetadata } from '@/lib/seo';
import { serviceListGraph } from '@/lib/schema';

const DESCRIPTION =
  'Explore comprehensive online mental health and primary care services — psychiatric evaluations, medication management, chronic disease care and more, delivered by telehealth.';

export const metadata: Metadata = pageMetadata({
  title: 'Our Services — Telehealth Psychiatry & Primary Care',
  description: DESCRIPTION,
  path: '/our-services',
  image: {
    url: '/images/sections/Online-Mental-Health-Services.avif',
    width: 1180,
    height: 1180,
    alt: 'Comprehensive online mental health services',
  },
});

export default function OurServicesPage() {
  const psychiatric = summariesByCategory('psychiatric');
  const primaryCare = summariesByCategory('primary-care');

  return (
    <>
      <JsonLd data={serviceListGraph(serviceSummaries, DESCRIPTION)} id="services-schema" />

      <PageHero
        eyebrow="Services"
        title="Comprehensive Online Mental Health Services"
        lead="Personalized, evidence-based psychiatric care delivered through secure and convenient telehealth sessions as part of our comprehensive online mental health services, designed to support your long-term emotional wellness."
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/our-services' },
        ]}
        image={{
          src: '/images/sections/Online-Mental-Health-Services.avif',
          width: 1180,
          height: 1180,
          alt: 'A patient attending a secure telehealth appointment from home',
        }}
      />

      <Section tone="base" aria-labelledby="psychiatric-heading">
        <Container>
          <SectionHeading
            eyebrow="Mental health"
            title={serviceCategories.psychiatric.label}
            description="Assessment, diagnosis and ongoing psychiatric treatment for adults, delivered entirely by secure video."
            id="psychiatric-heading"
            align="left"
          />
          <ServicesGrid services={psychiatric} className="mt-11" />
        </Container>
      </Section>

      <Section tone="muted" aria-labelledby="primary-heading">
        <Container>
          <SectionHeading
            eyebrow="Family health"
            title={serviceCategories['primary-care'].label}
            description="Preventive, acute and chronic primary care for adults 18 and over, coordinated alongside your mental health treatment."
            id="primary-heading"
            align="left"
          />
          <ServicesGrid services={primaryCare} className="mt-11" />
        </Container>
      </Section>

      <BenefitsGrid tone="base" />
      <CTASection />
    </>
  );
}
