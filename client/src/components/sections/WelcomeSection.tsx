import Image from 'next/image';
import { Container, Section, Eyebrow } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { welcome } from '@/data/marketing';
import { provider } from '@/data/provider';

/** Homepage "Welcome" / about-the-provider band. */
export function WelcomeSection() {
  return (
    <Section tone="base" aria-labelledby="welcome-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative">
            <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-muted">
              <Image
                src={welcome.image.src}
                alt={welcome.image.alt}
                width={welcome.image.width}
                height={welcome.image.height}
                loading="lazy"
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="w-full object-cover"
              />
            </div>
            <p className="mt-4 rounded-md border border-border-subtle bg-surface-raised px-5 py-4 text-sm shadow-sm">
              <span className="block font-heading text-md font-semibold text-text-primary">
                {provider.name}
              </span>
              <span className="mt-0.5 block text-text-secondary">{provider.credentials}</span>
            </p>
          </div>

          <div>
            <Eyebrow>About the practice</Eyebrow>
            <h2 id="welcome-heading" className="max-w-[20ch]">
              {welcome.heading}
            </h2>

            <div className="mt-6 space-y-5">
              {welcome.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-md leading-relaxed text-text-secondary">
                  {paragraph}
                </p>
              ))}
            </div>

            <blockquote className="mt-8 border-l-2 border-brand-accent-strong pl-5">
              <p className="font-heading text-lead italic text-text-primary">
                “{provider.philosophy}”
              </p>
            </blockquote>

            <div className="mt-9">
              <Button href={welcome.cta.href} variant="outline" size="lg" chip>
                {welcome.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
