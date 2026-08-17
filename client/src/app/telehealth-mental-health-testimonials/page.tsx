import type { Metadata } from 'next';

import { Container, Section } from '@/components/ui/Section';
import { PageHero } from '@/components/sections/PageHero';
import { TestimonialCard } from '@/components/sections/Testimonials';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import { testimonials, testimonialsCta } from '@/data/marketing';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Read testimonials from patients who received compassionate, professional and confidential telehealth mental health support at LifeWell Family Health & Psychiatry.';

export const metadata: Metadata = pageMetadata({
  title: 'Patient Testimonials — Telehealth Mental Health Care',
  description: DESCRIPTION,
  path: '/telehealth-mental-health-testimonials',
  image: {
    url: '/images/sections/Telehealth-Mental-Health-Testimonials.avif',
    width: 633,
    height: 633,
    alt: 'Patient testimonials for telehealth mental health care',
  },
});

/**
 * Testimonials page.
 *
 * Only the genuine testimonials are rendered. The source page also published
 * four Lorem-ipsum placeholders attributed to "John Doe" / "Jane Doe"; those are
 * omitted rather than reproduced.
 *
 * No Review or AggregateRating schema is emitted. Review markup on a medical
 * practice needs verified, consented, first-party reviews, and consent status
 * for these quotes is unconfirmed — see README.
 */
export default function TestimonialsPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          '/telehealth-mental-health-testimonials',
          'Patient Testimonials',
          DESCRIPTION,
          [
            { name: 'Home', href: '/' },
            { name: 'Testimonials', href: '/telehealth-mental-health-testimonials' },
          ]
        )}
        id="testimonials-schema"
      />

      <PageHero
        eyebrow="Testimonials"
        title="Telehealth Mental Health Testimonials from Real Patients"
        lead="Honest feedback from patients who found support, understanding, and lasting care through secure online mental health services."
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Testimonials', href: '/telehealth-mental-health-testimonials' },
        ]}
        image={{
          src: '/images/sections/Telehealth-Mental-Health-Testimonials.avif',
          width: 633,
          height: 633,
          alt: 'A patient reflecting after a telehealth therapy session',
        }}
      />

      <Section tone="base">
        <Container>
          <ul className="grid list-none gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <li key={i} className="flex">
                <TestimonialCard testimonial={t} />
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-11 max-w-[68ch] text-center text-sm text-text-secondary">
            Individual experiences vary. Testimonials describe personal experiences and are not a
            guarantee of any particular outcome.
          </p>
        </Container>
      </Section>

      <CTASection heading={testimonialsCta.heading} body={testimonialsCta.body} />
    </>
  );
}
