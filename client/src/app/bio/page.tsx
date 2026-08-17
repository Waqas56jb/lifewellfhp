import type { Metadata } from 'next';
import Image from 'next/image';

import { Container, Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { BenefitsGrid } from '@/components/sections/BenefitsGrid';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import { provider, providerPage } from '@/data/provider';
import { site } from '@/data/site';
import { pageMetadata } from '@/lib/seo';
import { providerPageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Meet Lourdie Chachoute, FNP-C, PMHNP-BC — a dual-certified Family and Psychiatric-Mental Health Nurse Practitioner with over 15 years of clinical experience, providing telehealth psychiatric care.';

export const metadata: Metadata = pageMetadata({
  title: 'Meet Your Provider — Lourdie Chachoute, PMHNP-BC',
  description: DESCRIPTION,
  path: '/bio',
  image: {
    url: provider.image.src,
    width: provider.image.width,
    height: provider.image.height,
    alt: provider.image.alt,
  },
});

export default function BioPage() {
  return (
    <>
      <JsonLd data={providerPageGraph(DESCRIPTION)} id="provider-schema" />

      <PageHero
        eyebrow={providerPage.eyebrow}
        title={`${provider.name}, ${provider.credentials}`}
        lead={provider.tagline}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Meet Your Provider', href: '/bio' },
        ]}
        image={provider.image}
      >
        <ul className="flex flex-wrap gap-2">
          {provider.certifications.map((c) => (
            <li
              key={c}
              className="rounded-pill border border-brand-primary/25 bg-brand-primary-soft px-4 py-1.5 text-xs font-semibold text-brand-primary-solid"
            >
              {c.split(' — ')[0]}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* Biography + credentials */}
      <Section tone="base">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
            <div className="min-w-0">
              <Eyebrow>Short biography</Eyebrow>
              <h2 className="text-h3">A whole-person approach to mental health</h2>
              <div className="mt-6 space-y-5">
                {provider.bio.map((paragraph, i) => (
                  <p key={i} className="text-md leading-relaxed text-text-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>

              <blockquote className="mt-9 rounded-md border-l-4 border-brand-accent-strong bg-brand-accent-soft px-6 py-5">
                <p className="font-heading text-lead text-text-primary">
                  “{provider.philosophy}”
                </p>
              </blockquote>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
              <CredentialCard title="Education" items={provider.education} />
              <CredentialCard title="Board certifications" items={provider.certifications} />
              <div className="rounded-md border border-border-subtle bg-surface-raised p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
                  Experience
                </h2>
                <p className="mt-3 font-heading text-h3 text-brand-primary-solid">15+</p>
                <p className="text-sm text-text-secondary">
                  years across critical care, primary care, respiratory therapy and mental health
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Fields of expertise */}
      <Section tone="muted" aria-labelledby="expertise-heading">
        <Container>
          <SectionHeading
            eyebrow="Clinical focus"
            title="Fields of expertise"
            id="expertise-heading"
            align="center"
          />
          <ul className="mx-auto mt-11 grid max-w-4xl list-none gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {provider.expertise.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-sm border border-border-subtle bg-surface-raised px-5 py-4 text-sm text-text-secondary"
              >
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Treatment philosophy */}
      <Section tone="base" aria-labelledby="philosophy-heading">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-muted">
              <Image
                src={providerPage.philosophyImage.src}
                alt={providerPage.philosophyImage.alt}
                width={providerPage.philosophyImage.width}
                height={providerPage.philosophyImage.height}
                loading="lazy"
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="w-full object-cover"
              />
            </div>

            <div>
              <Eyebrow>My approach</Eyebrow>
              <h2 id="philosophy-heading" className="text-h3">
                {providerPage.philosophyHeading}
              </h2>
              <p className="mt-6 text-md leading-relaxed text-text-secondary">
                {provider.approachIntro}
              </p>
              <ul className="mt-7 space-y-3">
                {provider.approach.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-md text-text-secondary">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 font-heading text-lead text-text-primary">
                {provider.approachOutcome}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Consultation prompt */}
      <Section tone="muted" spacing="sm">
        <Container size="narrow">
          <div className="rounded-md border border-border-subtle bg-surface-raised p-6 text-center sm:p-8">
            <h2 className="text-h4">{providerPage.consultation.heading}</h2>
            <p className="mx-auto mt-4 max-w-[56ch] text-text-secondary">
              {providerPage.consultation.body}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
              <Button href={providerPage.consultation.cta.href} size="lg">
                {providerPage.consultation.cta.label}
              </Button>
              <Button href={site.contact.phoneHref} variant="outline" size="lg">
                Call {site.contact.phone}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <BenefitsGrid tone="base" />
      <CTASection />
    </>
  );
}

function CredentialCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-raised p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-text-secondary">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 shrink-0"
    >
      <circle cx="10" cy="10" r="9" className="fill-brand-primary-soft" />
      <path
        d="m6 10.2 2.6 2.6L14 7.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-primary-solid"
      />
    </svg>
  );
}
