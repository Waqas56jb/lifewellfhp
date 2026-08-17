import Image from 'next/image';
import { Container, Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { primaryCta, contactCta } from '@/data/marketing';
import { site } from '@/data/site';

/** Full-width closing CTA band used at the foot of most pages. */
export function CTASection({
  heading = primaryCta.heading,
  body = primaryCta.body,
  primaryLabel = site.booking.label,
  primaryHref = site.booking.url,
  secondaryLabel = 'Contact us',
  secondaryHref = '/contact-telehealth-mental-health-provider',
}: {
  heading?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Section tone="inverse" aria-labelledby="cta-heading">
      <Container size="narrow">
        <div className="text-center">
          <h2 id="cta-heading" className="mx-auto max-w-[22ch] text-text-inverse">
            {heading}
          </h2>
          {body && (
            <p className="mx-auto mt-6 max-w-[56ch] text-lead text-text-inverse/85">{body}</p>
          )}

          <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Button href={primaryHref} variant="inverse" size="lg" chip>
              {primaryLabel}
            </Button>
            <Button
              href={secondaryHref}
              size="lg"
              className="border border-text-inverse/40 bg-transparent text-text-inverse hover:bg-text-inverse/10"
            >
              {secondaryLabel}
            </Button>
          </div>

          <p className="mt-8 text-sm text-text-inverse/75">
            Prefer to talk first?{' '}
            <a
              href={site.contact.phoneHref}
              className="font-semibold text-text-inverse underline underline-offset-2"
            >
              Call {site.contact.phone}
            </a>
          </p>
        </div>
      </Container>
    </Section>
  );
}

/** Split "reach out" band with imagery, used on the homepage. */
export function ContactCTA() {
  return (
    <Section tone="muted" aria-labelledby="contact-cta-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-raised">
            <Image
              src={contactCta.image.src}
              alt=""
              width={contactCta.image.width}
              height={contactCta.image.height}
              loading="lazy"
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="w-full object-cover"
            />
          </div>

          <div>
            <h2 id="contact-cta-heading" className="max-w-[18ch]">
              {contactCta.heading}
            </h2>
            <p className="mt-6 max-w-[52ch] text-lead text-text-secondary">
              Whether you have questions about services, fees, or insurance, compassionate and
              confidential support is available.
            </p>

            <dl className="mt-8 space-y-4">
              <ContactRow label="Phone" value={site.contact.phone} href={site.contact.phoneHref} />
              <ContactRow label="Email" value={site.contact.email} href={site.contact.emailHref} />
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="w-20 shrink-0 text-sm font-semibold text-text-primary">Hours</dt>
                <dd className="text-sm text-text-secondary">
                  {site.hours.map((h) => (
                    <span key={h.days} className="block">
                      {h.days}: {h.display}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button href="/contact-telehealth-mental-health-provider" size="lg">
                Contact us
              </Button>
              <Button href={site.booking.url} variant="outline" size="lg">
                {site.booking.label}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-20 shrink-0 text-sm font-semibold text-text-primary">{label}</dt>
      <dd>
        <a
          href={href}
          className="inline-flex min-h-6 items-center py-1 text-sm font-semibold text-text-link"
        >
          {value}
        </a>
      </dd>
    </div>
  );
}
