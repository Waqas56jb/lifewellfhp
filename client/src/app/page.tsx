import type { Metadata } from 'next';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { SwapButton } from '@/components/ui/SwapButton';
import { Hero } from '@/components/sections/Hero';
import { WelcomeSection } from '@/components/sections/WelcomeSection';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { BenefitsGrid } from '@/components/sections/BenefitsGrid';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { StatsBand } from '@/components/sections/StatsBand';
import { InsuranceGrid } from '@/components/sections/InsuranceGrid';
import { Testimonials } from '@/components/sections/Testimonials';
import { ContactCTA } from '@/components/sections/CTASection';

import { homeServiceSummaries } from '@/data/services';
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
 * Stats → Insurance → Testimonials → Contact CTA (→ Newsletter in footer).
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
            eyebrowVariant="badge"
            title="How I"
            accent="Help"
            description={servicesSection.body}
            descriptionClassName="mt-6 max-w-[42ch] text-[18px] leading-[1.35] text-[#374151] sm:text-[20px] min-[1181px]:text-[22px]"
            id="services-heading"
            align="center"
          />
          <ServicesGrid services={homeServiceSummaries} columns={4} className="mt-10 md:mt-[60px] min-[1181px]:mt-20" />
          <div className="mt-10 flex justify-center md:mt-[60px] min-[1181px]:mt-20">
            <SwapButton href={servicesSection.cta.href}>{servicesSection.cta.label}</SwapButton>
          </div>
        </Container>
      </Section>

      <BenefitsGrid />
      <HowItWorks />
      <StatsBand stats={stats} />
      <InsuranceGrid showCta={false} showDisclaimer={false} />
      <Testimonials testimonials={testimonials} />
      <ContactCTA />
    </>
  );
}
