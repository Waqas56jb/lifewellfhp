import type { Metadata } from 'next';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Hero } from '@/components/sections/Hero';
import { WelcomeSection } from '@/components/sections/WelcomeSection';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { BenefitsGrid } from '@/components/sections/BenefitsGrid';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { InsuranceGrid } from '@/components/sections/InsuranceGrid';
import { StatsBand } from '@/components/sections/StatsBand';
import { Testimonials } from '@/components/sections/Testimonials';
import { ContactCTA } from '@/components/sections/CTASection';

import { serviceSummaries } from '@/data/services';
import { servicesSection, stats, testimonials } from '@/data/marketing';
import { site } from '@/data/site';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Telehealth Mental Health Care | PMHNP Online Therapy & Medication Management',
  description: site.description,
  path: '/',
});

/**
 * Homepage.
 *
 * Section order mirrors the source site exactly:
 * Hero → Welcome → My Services → Why Patients Choose → How It Works →
 * Insurance → Stats → Testimonials → Contact CTA (→ Newsletter in footer).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <WelcomeSection />

      <Section tone="raised" aria-labelledby="services-heading">
        <Container>
          <SectionHeading
            eyebrow={servicesSection.eyebrow}
            title={servicesSection.heading}
            description={servicesSection.body}
            id="services-heading"
            align="center"
          />
          <ServicesGrid services={serviceSummaries} className="mt-12" />
          <div className="mt-11 flex justify-center">
            <Button href={servicesSection.cta.href} variant="outline" size="lg" chip>
              {servicesSection.cta.label}
            </Button>
          </div>
        </Container>
      </Section>

      <BenefitsGrid />
      <HowItWorks />
      <InsuranceGrid />
      <StatsBand stats={stats} />
      <Testimonials testimonials={testimonials} />
      <ContactCTA />
    </>
  );
}
