import type { Metadata } from 'next';

import { Container, Section, SectionHeading, Eyebrow } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { InsuranceGrid } from '@/components/sections/InsuranceGrid';
import { FAQAccordion } from '@/components/sections/FAQAccordion';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import {
  feesIntro,
  selfPay,
  pricingTiers,
  packagesSection,
  pricingPackages,
  additionalInfo,
} from '@/data/pricing';
import { faqs } from '@/data/marketing';
import { site } from '@/data/site';
import { formatPrice } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';
import { pageGraph } from '@/lib/schema';

const DESCRIPTION =
  'Transparent telehealth fees and insurance information — self-pay rates for mental health, primary care and weight management, plus accepted plans and superbill details.';

export const metadata: Metadata = pageMetadata({
  title: 'Fees & Insurance — Transparent Telehealth Pricing',
  description: DESCRIPTION,
  path: '/fees-insurance',
  image: {
    url: feesIntro.image.src,
    width: feesIntro.image.width,
    height: feesIntro.image.height,
    alt: feesIntro.image.alt,
  },
});

/** Fee-related questions, drawn from the shared FAQ set. */
const feeFaqs = faqs.filter((f) =>
  /insurance|cost|fee|pay|cancel|reschedule/i.test(`${f.question} ${f.answer}`)
);

export default function FeesInsurancePage() {
  return (
    <>
      <JsonLd
        data={pageGraph('/fees-insurance', 'Fees & Insurance', DESCRIPTION, [
          { name: 'Home', href: '/' },
          { name: 'Fees & Insurance', href: '/fees-insurance' },
        ])}
        id="fees-schema"
      />

      <PageHero
        eyebrow="Fees & Insurance"
        title={feesIntro.heading}
        lead={feesIntro.body}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Fees & Insurance', href: '/fees-insurance' },
        ]}
        image={feesIntro.image}
      />

      {/* Self-pay rates */}
      <Section tone="base" aria-labelledby="selfpay-heading">
        <Container>
          <SectionHeading
            eyebrow="Self-pay"
            title={selfPay.heading}
            id="selfpay-heading"
            align="left"
          />
          <div className="mt-6 max-w-[70ch] space-y-4">
            {selfPay.body.map((p, i) => (
              <p key={i} className="text-md leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>

          <ul className="mt-11 grid list-none gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <li key={tier.name} className="flex">
                <article className="flex w-full flex-col rounded-md border border-border-subtle bg-surface-raised p-7 transition-shadow duration-fast hover:shadow-md">
                  <h3 className="text-h4">{tier.name}</h3>

                  <dl className="mt-6 space-y-4 border-y border-border-subtle py-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-sm text-text-secondary">
                        Initial
                        <span className="block text-xs">{tier.initialDuration}</span>
                      </dt>
                      <dd className="font-heading text-h3 leading-none text-brand-primary-solid">
                        {formatPrice(tier.initialFee)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-sm text-text-secondary">
                        Follow-up
                        <span className="block text-xs">{tier.followUpDuration}</span>
                      </dt>
                      <dd className="font-heading text-h4 leading-none text-text-primary">
                        {formatPrice(tier.followUpFee)}
                      </dd>
                    </div>
                  </dl>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                        <CheckIcon />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.freeConsult && (
                    <p className="mt-6 rounded-sm bg-brand-accent-soft px-4 py-3 text-sm font-semibold text-brand-accent-strong">
                      Free 10-minute consultation available
                    </p>
                  )}

                  <Button href={site.booking.url} className="mt-6" fullWidth>
                    Book a Session
                  </Button>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Weight-management packages */}
      <Section tone="muted" aria-labelledby="packages-heading">
        <Container>
          <SectionHeading
            eyebrow="Programs"
            title={packagesSection.heading}
            id="packages-heading"
            align="left"
          />
          <div className="mt-6 max-w-[70ch] space-y-4">
            {packagesSection.body.map((p, i) => (
              <p key={i} className="text-md leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>

          <ul className="mt-11 grid list-none gap-6 md:grid-cols-2">
            {pricingPackages.map((pkg) => (
              <li key={pkg.name} className="flex">
                <article className="flex w-full flex-col rounded-md border border-border-subtle bg-surface-raised p-7">
                  <h3 className="text-h4">{pkg.name}</h3>
                  <p className="mt-4 font-heading text-h3 text-brand-primary-solid">
                    {pkg.priceRange}
                  </p>
                  <p className="mt-4 text-md leading-relaxed text-text-secondary">
                    {pkg.description}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-border-subtle pt-6">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                        <CheckIcon />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <InsuranceGrid showCta={false} />

      {/* Additional information */}
      <Section tone="base" spacing="sm">
        <Container size="narrow">
          <div className="rounded-md border border-border-subtle bg-surface-muted p-8">
            <Eyebrow>Good to know</Eyebrow>
            <h2 className="text-h4">{additionalInfo.heading}</h2>
            <p className="mt-4 text-md leading-relaxed text-text-secondary">
              {additionalInfo.body}
            </p>
            <ul className="mt-6 space-y-4 border-t border-border-subtle pt-6">
              {additionalInfo.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-text-secondary">
                  <CheckIcon />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {feeFaqs.length > 0 && (
        <Section tone="muted" aria-labelledby="fees-faq-heading">
          <Container size="narrow">
            <SectionHeading
              eyebrow="FAQs"
              title="Questions about fees and insurance"
              id="fees-faq-heading"
              align="center"
            />
            <div className="mt-11">
              <FAQAccordion faqs={feeFaqs} />
            </div>
          </Container>
        </Section>
      )}

      <CTASection />
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 shrink-0"
    >
      <circle cx="10" cy="10" r="9" className="fill-brand-accent-soft" />
      <path
        d="m6 10.2 2.6 2.6L14 7.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-accent-strong"
      />
    </svg>
  );
}
