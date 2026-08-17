import Image from 'next/image';
import { Container } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { hero } from '@/data/marketing';
import { site } from '@/data/site';
import { HeroMedia } from './HeroMedia';

/**
 * Homepage hero.
 *
 * Matches the original edge-to-edge treatment: a full-bleed photographic band
 * (80-home-bg.webp, 1920x994, center/cover) behind a two-tone Lora heading,
 * with the practice's signature pill + arrow-chip calls to action.
 *
 * Two deliberate departures from the source:
 *
 *  - The heading is a single semantic <h1> with two coloured <span>s. The
 *    original split it across dozens of nested animated spans, which broke
 *    screen-reader output and text extraction.
 *
 *  - The accent half uses --color-brand-primary-on-dark rather than the raw
 *    brand blue. #3E7FB1 over this photograph measures 2.21:1; the tinted
 *    variant reaches 5.9:1 while reading as the same colour.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[32rem] items-center overflow-hidden sm:min-h-[36rem] md:min-h-[42rem] lg:min-h-[50rem]"
    >
      {/* Looping background footage, with its poster as the LCP paint */}
      <HeroMedia />

      {/* Soft mist texture the original layers over the footage */}
      <Image
        src="/images/sections/home-hero-bg.webp"
        alt=""
        fill
        aria-hidden="true"
        sizes="100vw"
        className="-z-10 object-cover object-center opacity-25 mix-blend-soft-light"
      />

      {/* Brand tint, carried over from the source's teal overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[#4d9595]/20 mix-blend-multiply"
      />

      {/* Scrim — guarantees text contrast whatever frame is showing.
          A light uniform layer covers narrow viewports, where the heading
          spans the full width; wider ones add a left-weighted gradient so the
          footage stays visible on the right. Tuned against sampled pixels by
          scripts/shot-hero.mjs. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#12283a]/45" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0e2130]/80 via-[#0e2130]/45 to-transparent"
      />

      <Container className="relative py-16 sm:py-20 md:py-24">
        <div className="max-w-2xl">
          <h1 id="hero-heading" className="text-balance">
            <span className="text-brand-primary-on-dark">Compassionate Telehealth </span>
            <span className="text-text-inverse">Mental Care You Can Trust</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-lead text-text-inverse/90 sm:mt-7">{hero.subheading}</p>

          <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <Button href={site.booking.url} size="lg" chip>
              {site.booking.label}
            </Button>
            <Button href="/our-services" variant="inverse" size="lg" chip>
              View All Services
            </Button>
          </div>

          <p className="mt-9 flex items-center gap-2.5 text-sm text-text-inverse/85">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-brand-accent"
            />
            {hero.badge}
          </p>
        </div>
      </Container>
    </section>
  );
}
