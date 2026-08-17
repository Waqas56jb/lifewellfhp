import Image from 'next/image';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { insuranceCarriers, insuranceSection } from '@/data/marketing';

/**
 * Accepted-plans wall.
 *
 * Every logo carries the carrier name as alt text — all fourteen were rendered
 * with empty alt attributes on the source site, making the section invisible to
 * screen readers and to text extraction.
 */
export function InsuranceGrid({ showCta = true }: { showCta?: boolean }) {
  return (
    <Section tone="raised" aria-labelledby="insurance-heading">
      <Container>
        <SectionHeading
          eyebrow="Insurance"
          title={insuranceSection.heading}
          description={insuranceSection.body}
          id="insurance-heading"
          align="center"
        />

        <ul className="mt-12 grid list-none grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {insuranceCarriers.map((carrier) => (
            <li
              key={carrier.name}
              className="flex items-center justify-center rounded-sm border border-border-subtle bg-surface-raised px-3 py-5 sm:px-5 sm:py-6 transition-colors duration-fast hover:border-border-strong"
            >
              <Image
                src={carrier.logo}
                alt={carrier.name}
                width={carrier.width}
                height={carrier.height}
                loading="lazy"
                sizes="(min-width: 1024px) 15vw, (min-width: 640px) 28vw, 42vw"
                className="h-7 w-auto max-w-full object-contain sm:h-8"
              />
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-[70ch] text-center text-sm text-text-secondary">
          {insuranceSection.disclaimer}
        </p>

        {showCta && (
          <div className="mt-9 flex justify-center">
            <Button href="/fees-insurance" variant="outline">
              View fees &amp; insurance details
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}
