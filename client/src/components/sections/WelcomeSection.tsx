import Image from 'next/image';
import { Container, Section } from '@/components/ui/Section';
import { SwapButton } from '@/components/ui/SwapButton';
import { welcome as staticWelcome } from '@/data/marketing';

/**
 * Welcome band — live split title:
 *   Welcome to (green, roman) LifeWell (blue, italic)
 *   Family Health & / Psychiatry (blue, italic)
 */
export function WelcomeSection({ welcome = staticWelcome }: { welcome?: typeof staticWelcome }) {
  return (
    <Section tone="base" aria-labelledby="welcome-heading">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-x-[80px] lg:gap-y-12">
          <div className="overflow-hidden rounded-[12px]">
            <Image
              src={welcome.image.src}
              alt={welcome.image.alt}
              width={welcome.image.width}
              height={welcome.image.height}
              loading="lazy"
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="w-full object-cover"
            />
          </div>

          <div>
            <h2
              id="welcome-heading"
              className="font-heading text-[28px] font-normal leading-[1.2] tracking-normal sm:text-[38px] min-[1181px]:text-[56px]"
            >
              <span className="whitespace-nowrap">
                <span className="text-[var(--lw-accent)] not-italic">Welcome to </span>
                <span className="italic text-[var(--lw-primary)]">LifeWell</span>
              </span>
              <span className="block italic text-[var(--lw-primary)]">
                Family Health &amp;
                <br />
                Psychiatry
              </span>
            </h2>

            <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              {welcome.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-[14px] font-normal leading-[1.45] text-[#374151] sm:text-[16px] min-[1181px]:text-[18px]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 sm:mt-10">
              <SwapButton href={welcome.cta.href}>{welcome.cta.label}</SwapButton>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
