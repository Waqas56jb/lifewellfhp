import Image from 'next/image';
import type { Step } from '@/types/content';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { howItWorks, steps as defaultSteps } from '@/data/marketing';
import { site } from '@/data/site';

export function HowItWorks({
  steps = defaultSteps,
  heading = howItWorks.heading,
  tone = 'muted',
}: {
  steps?: Step[];
  heading?: string;
  tone?: 'base' | 'muted' | 'raised';
}) {
  return (
    <Section tone={tone} aria-labelledby="how-it-works-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={howItWorks.eyebrow}
              title={heading}
              description={howItWorks.body}
              id="how-it-works-heading"
              align="left"
            />

            <div className="mt-9 overflow-hidden rounded-md border border-border-subtle bg-surface-raised">
              <Image
                src={howItWorks.image.src}
                alt=""
                width={howItWorks.image.width}
                height={howItWorks.image.height}
                loading="lazy"
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="w-full object-cover"
              />
            </div>

            <CrisisCallout className="mt-6" />
          </div>

          <ol className="relative list-none space-y-5">
            {steps.map((step, i) => (
              <li key={step.title}>
                <article className="relative flex flex-col gap-4 rounded-md border border-border-subtle bg-surface-raised p-5 transition-shadow duration-fast hover:shadow-md xs:flex-row xs:gap-5 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-brand-primary-soft font-heading text-h5 font-semibold text-brand-primary-solid"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-h5">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                </article>
              </li>
            ))}

            <li className="pt-2">
              <Button href={site.booking.url} size="lg" fullWidth chip>
                {site.booking.label}
              </Button>
            </li>
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Crisis callout.
 *
 * Given prominence rather than being folded into body copy — someone in
 * distress must be able to find it immediately.
 */
export function CrisisCallout({ className }: { className?: string }) {
  return (
    <aside
      aria-labelledby="crisis-heading"
      className={`rounded-md border-2 border-crisis/30 bg-crisis-soft p-5 sm:p-6 ${className ?? ''}`}
    >
      <div className="flex flex-col gap-4 xs:flex-row">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-crisis text-text-inverse"
        >
          <AlertIcon />
        </span>
        <div>
          <h3 id="crisis-heading" className="text-h5 text-crisis">
            {site.crisis.heading}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            {site.crisis.body} If you are in immediate danger, call 911.
          </p>
          <p className="mt-4 flex flex-wrap gap-3">
            <a
              href={site.crisis.phoneHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-crisis px-5 text-sm font-semibold text-text-inverse no-underline transition-opacity duration-quick hover:opacity-90"
            >
              Call or text 988
            </a>
            <a
              href={site.crisis.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-crisis/40 px-5 text-sm font-semibold text-crisis no-underline transition-colors duration-quick hover:bg-crisis/5"
            >
              988lifeline.org
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9.5v4.2" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
