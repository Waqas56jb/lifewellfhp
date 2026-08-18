import type { Metadata } from 'next';

import { InnerPageHero } from '@/components/sections/InnerPageHero';
import { JourneyCta } from '@/components/sections/JourneyCta';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { JsonLd } from '@/components/seo/JsonLd';
import { bookingSteps } from '@/data/marketing';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Schedule a confidential and personalized telehealth mental health appointment with a board-certified PMHNP and take the first step toward emotional wellness.';

export const metadata: Metadata = pageMetadata({
  title: 'Book an Appointment — Secure Telehealth Scheduling',
  description: DESCRIPTION,
  path: '/book-telehealth-mental-health-appointment',
  image: {
    url: '/images/sections/Book-Telehealth-Mental-Health-Appointment.avif',
    width: 633,
    height: 740,
    alt: 'Booking a telehealth mental health appointment',
  },
});

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

      <div className="bg-white">
        <InnerPageHero
          image={{
            src: '/images/sections/Book-Telehealth-Mental-Health-Appointment.avif',
            alt: 'Booking a telehealth mental health appointment',
          }}
          imageSide="left"
          title="Book Telehealth Mental Health Appointment"
          accent="for Secure, Professional Care"
          lead={DESCRIPTION}
          leadSize="subhead"
        />

        <HowItWorks
          steps={bookingSteps}
          heading="How Our Simple Telehealth Process Works"
          tone="transparent"
          showCta={false}
        />

        <JourneyCta
          image={{
            src: '/images/sections/Book-Telehealth-Mental-Health-Appointment.avif',
            alt: '',
            width: 633,
            height: 740,
          }}
          imageSide="right"
        />
      </div>
    </>
  );
}
