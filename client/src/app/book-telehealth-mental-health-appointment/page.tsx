import type { Metadata } from 'next';

import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { FAQAccordion } from '@/components/sections/FAQAccordion';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import { bookingSteps, faqs } from '@/data/marketing';
import { site } from '@/data/site';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Book a telehealth mental health appointment with a board-certified PMHNP. Secure, confidential online psychiatric care and medication management — three simple steps.';

export const metadata: Metadata = pageMetadata({
  title: 'Book an Appointment — Secure Telehealth Scheduling',
  description: DESCRIPTION,
  path: '/book-telehealth-mental-health-appointment',
  image: {
    url: '/images/sections/Book-Telehealth-Mental-Health-Appointment.avif',
    width: 633,
    height: 633,
    alt: 'Booking a telehealth mental health appointment',
  },
});

const bookingFaqs = faqs.filter((f) =>
  /schedule|appointment|need for a telehealth|reschedule|cancel/i.test(f.question)
);

export default function BookPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          '/book-telehealth-mental-health-appointment',
          'Book an Appointment',
          DESCRIPTION,
          [
            { name: 'Home', href: '/' },
            { name: 'Book an Appointment', href: '/book-telehealth-mental-health-appointment' },
          ]
        )}
        id="booking-schema"
      />

      <PageHero
        eyebrow="Booking"
        title="Book Telehealth Mental Health Appointment for Secure, Professional Care"
        lead="Schedule a confidential and personalized telehealth mental health appointment with a board-certified PMHNP and take the first step toward emotional wellness."
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Book an Appointment', href: '/book-telehealth-mental-health-appointment' },
        ]}
        image={{
          src: '/images/sections/Book-Telehealth-Mental-Health-Appointment.avif',
          width: 633,
          height: 633,
          alt: 'A patient scheduling a secure telehealth appointment',
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Button href={site.booking.url} size="lg">
            {site.booking.label}
          </Button>
          <Button href={site.contact.phoneHref} variant="outline" size="lg">
            Call {site.contact.phone}
          </Button>
        </div>
        <p className="mt-5 text-sm text-text-secondary">
          A free 10-minute consultation is available across all service lines.
        </p>
      </PageHero>

      <HowItWorks
        steps={bookingSteps}
        heading="How Our Simple Telehealth Process Works"
        tone="base"
      />

      {/* What to prepare */}
      <Section tone="muted" aria-labelledby="prepare-heading">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Before your visit"
            title="What you’ll need"
            description="Telehealth visits are straightforward. A little preparation helps your appointment run smoothly."
            id="prepare-heading"
            align="center"
          />
          <ul className="mt-11 grid list-none gap-4 sm:grid-cols-2">
            {[
              {
                title: 'A private space',
                body: 'Somewhere quiet where you can speak freely without being overheard.',
              },
              {
                title: 'A stable connection',
                body: 'A computer, tablet, or smartphone with a reliable internet connection.',
              },
              {
                title: 'Your medication list',
                body: 'Current medications and doses, including anything prescribed elsewhere.',
              },
              {
                title: 'Your questions',
                body: 'Anything you would like to discuss — no concern is too small.',
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-md border border-border-subtle bg-surface-raised p-6"
              >
                <h3 className="text-h5">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {bookingFaqs.length > 0 && (
        <Section tone="base" aria-labelledby="booking-faq-heading">
          <Container size="narrow">
            <SectionHeading
              eyebrow="FAQs"
              title="Booking questions"
              id="booking-faq-heading"
              align="center"
            />
            <div className="mt-11">
              <FAQAccordion faqs={bookingFaqs} />
            </div>
          </Container>
        </Section>
      )}

      <CTASection />
    </>
  );
}
