import type { Metadata } from 'next';

import { ContactPageContent } from '@/components/sections/ContactPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { contactPage } from '@/data/contact';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Reach out today to contact a telehealth mental health provider, schedule your appointment, or ask questions about services, fees, and insurance options.';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us — Secure, Confidential Telehealth Support',
  description: DESCRIPTION,
  path: '/contact-telehealth-mental-health-provider',
  image: {
    url: contactPage.heroImage.src,
    width: contactPage.heroImage.width,
    height: contactPage.heroImage.height,
    alt: contactPage.heroImage.alt,
  },
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={pageGraph(
          '/contact-telehealth-mental-health-provider',
          'Contact Us',
          DESCRIPTION,
          [
            { name: 'Home', href: '/' },
            { name: 'Contact Us', href: '/contact-telehealth-mental-health-provider' },
          ]
        )}
        id="contact-schema"
      />
      <ContactPageContent />
    </>
  );
}
