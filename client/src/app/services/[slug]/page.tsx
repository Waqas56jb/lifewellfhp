import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/sections/PageHero';
import { ContentSections } from '@/components/sections/ContentSections';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { BenefitsGrid } from '@/components/sections/BenefitsGrid';
import { CTASection } from '@/components/sections/CTASection';
import { JsonLd } from '@/components/seo/JsonLd';

import {
  getService,
  getServiceSummary,
  relatedServices,
  serviceSlugs,
  serviceCategories,
} from '@/data/services';
import { site } from '@/data/site';
import { pageMetadata } from '@/lib/seo';
import { serviceGraph } from '@/lib/schema';

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

/** Unknown slugs 404 rather than rendering an empty shell. */
export const dynamicParams = false;

function description(slug: string): string {
  const summary = getServiceSummary(slug);
  const text = summary?.description ?? '';
  return text.length > 158 ? `${text.slice(0, 155).trimEnd()}…` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return pageMetadata({
    title: `${service.title} | Telehealth`,
    description: description(slug),
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const summary = getServiceSummary(slug);
  const related = relatedServices(slug, 3);
  const categoryLabel = serviceCategories[service.category].shortLabel;

  return (
    <>
      <JsonLd data={serviceGraph(service, description(slug))} id={`service-${slug}-schema`} />

      <PageHero
        eyebrow={categoryLabel}
        title={service.lead || service.title}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/our-services' },
          { name: summary?.title ?? service.title, href: `/services/${slug}` },
        ]}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Button href={site.booking.url} size="lg">
            {site.booking.label}
          </Button>
          <Button href="/fees-insurance" variant="outline" size="lg">
            View fees
          </Button>
        </div>
      </PageHero>

      <Section tone="base">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
            <div className="min-w-0">
              {service.intro.length > 0 && (
                <div className="space-y-5 border-l-2 border-brand-primary/30 pl-6">
                  {service.intro.map((paragraph, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? 'text-lead leading-relaxed text-text-primary'
                          : 'text-md leading-relaxed text-text-secondary'
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              <ContentSections sections={service.sections} className="mt-14" />

              {service.cta && (
                <div className="mt-14 rounded-md border border-border-subtle bg-surface-muted p-8">
                  <h2 className="text-h4">{service.cta.heading}</h2>
                  {service.cta.body.map((paragraph, i) => (
                    <p key={i} className="mt-4 text-md leading-relaxed text-text-secondary">
                      {paragraph}
                    </p>
                  ))}
                  <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                    <Button href={site.booking.url} size="lg">
                      {site.booking.label}
                    </Button>
                    <Button
                      href="/contact-telehealth-mental-health-provider"
                      variant="outline"
                      size="lg"
                    >
                      Ask a question
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <ServiceSidebar slug={slug} categoryLabel={categoryLabel} />
          </div>
        </Container>
      </Section>

      <BenefitsGrid tone="muted" />

      <Section tone="raised" aria-labelledby="related-heading">
        <Container>
          <SectionHeading
            eyebrow="Explore more"
            title="Related services"
            id="related-heading"
            align="center"
          />
          <ServicesGrid services={related} className="mt-11" />
        </Container>
      </Section>

      <CTASection />
    </>
  );
}

/** Sticky in-page aside: contact, hours and a jump list of the page's sections. */
function ServiceSidebar({ slug, categoryLabel }: { slug: string; categoryLabel: string }) {
  const siblings = relatedServices(slug, 5);

  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <div className="rounded-md border border-border-subtle bg-surface-raised p-6">
        <h2 className="text-h5">Ready to begin?</h2>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          Book a secure telehealth appointment, or call to ask a question first.
        </p>
        <div className="mt-5 space-y-3">
          <Button href={site.booking.url} fullWidth>
            {site.booking.label}
          </Button>
          <a
            href={site.contact.phoneHref}
            className="flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border-strong text-sm font-semibold text-text-link no-underline transition-colors duration-quick hover:border-brand-primary hover:bg-brand-primary-soft"
          >
            Call {site.contact.phone}
          </a>
        </div>

        <dl className="mt-6 space-y-3 border-t border-border-subtle pt-5 text-sm">
          <div>
            <dt className="font-semibold text-text-primary">Hours</dt>
            {site.hours.map((h) => (
              <dd key={h.days} className="text-text-secondary">
                {h.days}: {h.display}
              </dd>
            ))}
          </div>
          <div>
            <dt className="font-semibold text-text-primary">Delivered by</dt>
            <dd className="text-text-secondary">Secure video telehealth</dd>
          </div>
        </dl>
      </div>

      <nav aria-label={`Other ${categoryLabel} services`} className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
          Other services
        </h2>
        <ul className="mt-4 space-y-1">
          {siblings.map((s) => (
            <li key={s.slug}>
              <Link
                href={s.href}
                className="flex min-h-11 items-center rounded-xs px-3 py-2 text-sm leading-snug text-text-secondary no-underline transition-colors duration-quick hover:bg-surface-muted hover:text-text-link"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
