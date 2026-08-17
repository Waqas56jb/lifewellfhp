import Image from 'next/image';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { benefits, benefitsSection } from '@/data/marketing';

/**
 * "Why Patients Choose My Telehealth Clinic" — the most reused block on the
 * site, appearing on the homepage and all eleven service pages.
 *
 * Five cards do not divide evenly into a 2/3/4 grid, so the last row is
 * centred rather than left-orphaned.
 */
export function BenefitsGrid({
  heading = benefitsSection.heading,
  tone = 'base',
}: {
  heading?: string;
  tone?: 'base' | 'muted';
}) {
  return (
    <Section tone={tone} aria-labelledby="benefits-heading">
      <Container>
        <SectionHeading
          eyebrow="Why LifeWell"
          title={heading}
          id="benefits-heading"
          align="center"
        />

        <ul className="mx-auto mt-12 grid max-w-5xl list-none gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {benefits.map((benefit, i) => (
            <li
              key={benefit.title}
              className={[
                'flex',
                'lg:col-span-2',
                // Centre the final row of two on wide screens.
                i === 3 ? 'lg:col-start-2' : '',
              ].join(' ')}
            >
              <article className="flex h-full w-full flex-col overflow-hidden rounded-md border border-border-subtle bg-surface-raised transition-shadow duration-fast hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                  <Image
                    src={benefit.image.src}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                    className="object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-surface-raised/95 font-heading text-sm font-semibold text-brand-primary-solid shadow-sm"
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-h5">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {benefit.description}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
