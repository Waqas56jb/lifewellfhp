import type { Metadata } from 'next';
import Image from 'next/image';

import { Container, Section, Eyebrow } from '@/components/ui/Section';
import { PageHero } from '@/components/sections/PageHero';
import { ContactForm } from '@/components/forms/ContactForm';
import { CrisisCallout } from '@/components/sections/HowItWorks';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import { site } from '@/data/site';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Contact LifeWell Family Health & Psychiatry to schedule a telehealth appointment, ask about services, or verify insurance. Call, text, or send a confidential message.';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us — Secure, Confidential Telehealth Support',
  description: DESCRIPTION,
  path: '/contact-telehealth-mental-health-provider',
  image: {
    url: '/images/sections/Contact-Telehealth-Mental-Health-Provider.avif',
    width: 633,
    height: 633,
    alt: 'Contact a telehealth mental health provider',
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

      <PageHero
        eyebrow="Contact"
        title="Contact Telehealth Mental Health Provider for Secure, Confidential Support"
        lead="Reach out today to schedule your appointment, or ask questions about services, fees, and insurance options."
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Contact Us', href: '/contact-telehealth-mental-health-provider' },
        ]}
      >
        <ul className="flex flex-wrap gap-3">
          <QuickAction href={site.contact.phoneHref} label="Call" value={site.contact.phone} />
          <QuickAction href={site.contact.smsHref} label="Text" value={site.contact.sms} />
          <QuickAction href={site.contact.emailHref} label="Email" value={site.contact.email} />
        </ul>
      </PageHero>

      <Section tone="base">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* Contact details */}
            <div>
              <Eyebrow>Contact information</Eyebrow>
              <h2 className="text-h3">We’re here to support you</h2>
              <p className="mt-5 max-w-[58ch] text-md leading-relaxed text-text-secondary">
                Whether you have questions about our services, would like to schedule an
                appointment, or need additional information, compassionate and confidential
                assistance is available to help you move forward with confidence.
              </p>

              <dl className="mt-9 space-y-6">
                <DetailRow label="Phone">
                  <a href={site.contact.phoneHref} className="font-semibold text-text-link">
                    {site.contact.phone}
                  </a>
                </DetailRow>
                <DetailRow label="Text">
                  <a href={site.contact.smsHref} className="font-semibold text-text-link">
                    {site.contact.sms}
                  </a>
                </DetailRow>
                <DetailRow label="Fax">
                  <span className="text-text-secondary">{site.contact.fax}</span>
                </DetailRow>
                <DetailRow label="Email">
                  <a href={site.contact.emailHref} className="font-semibold text-text-link">
                    {site.contact.email}
                  </a>
                </DetailRow>
                <DetailRow label="Hours">
                  {site.hours.map((h) => (
                    <span key={h.days} className="block text-text-secondary">
                      {h.days}: {h.display}
                    </span>
                  ))}
                </DetailRow>
                <DetailRow label={site.address.type}>
                  <address className="not-italic text-text-secondary">
                    {site.address.street}
                    <br />
                    {site.address.city}, {site.address.region} {site.address.postalCode}
                  </address>
                  <p className="mt-2 text-sm text-text-secondary">
                    All care is delivered by secure video — this address is for correspondence
                    only.
                  </p>
                </DetailRow>
              </dl>

              <div className="mt-9 overflow-hidden rounded-md border border-border-subtle">
                <Image
                  src="/images/sections/Contact-Telehealth-Mental-Health-Provider.avif"
                  alt=""
                  width={633}
                  height={633}
                  loading="lazy"
                  sizes="(min-width: 1024px) 42vw, 92vw"
                  className="w-full object-cover"
                />
              </div>
            </div>

            {/* Enquiry form */}
            <div>
              <div className="rounded-md border border-border-subtle bg-surface-raised p-5 sm:p-7 md:p-9">
                <Eyebrow>Ask a question</Eyebrow>
                <h2 className="text-h3">Send a confidential message</h2>
                <p className="mt-4 text-md leading-relaxed text-text-secondary">
                  Have a question or need more information? Fill out the form below, and you will
                  receive a confidential response shortly.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>

              <CrisisCallout className="mt-6" />
            </div>
          </div>
        </Container>
      </Section>

      <CTASection
        heading="Prefer to book straight away?"
        body="Choose a time that suits you through the secure online booking system."
      />
    </>
  );
}

function QuickAction({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <li>
      <a
        href={href}
        className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-text-link no-underline transition-colors duration-quick hover:border-brand-primary hover:bg-brand-primary-soft sm:px-5"
      >
        <span className="text-text-secondary">{label}</span>
        {value}
      </a>
    </li>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-subtle pb-5 sm:flex-row sm:gap-6">
      <dt className="w-36 shrink-0 text-sm font-semibold uppercase tracking-[0.06em] text-text-primary">
        {label}
      </dt>
      <dd className="text-md">{children}</dd>
    </div>
  );
}
