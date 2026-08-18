import type { Metadata } from 'next';

import { TestimonialsPageContent } from '@/components/sections/TestimonialsPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Read authentic telehealth mental health testimonials from individuals who have experienced compassionate, professional, and confidential online mental health support.';

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
      <TestimonialsPageContent />
    </>
  );
}
