'use client';

import { Container, Section } from '@/components/ui/Section';
import { SwapButton } from '@/components/ui/SwapButton';
import { site } from '@/data/site';

/**
 * CharmHealth Web Embed. Do not bounce visitors to the apex domain — its TLS
 * certificate is not valid, and www/apex Vercel domain redirects currently loop.
 */
export function BookingCalendar({
  src = site.booking.url,
  label = site.booking.label,
}: {
  src?: string;
  label?: string;
}) {
  return (
    <Section
      id="charm-calendar"
      tone="muted"
      aria-labelledby="booking-calendar-heading"
      className="scroll-mt-28"
    >
      <Container>
        <div className="mx-auto max-w-[52rem] text-center">
          <p className="mb-2.5 inline-flex rounded-[7px] bg-[#EEF3F7] px-[15px] pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[var(--lw-accent)] sm:text-[12px]">
            CharmHealth scheduling
          </p>
          <h2
            id="booking-calendar-heading"
            className="font-heading text-[30px] font-normal leading-[1.15] tracking-[-2px] sm:text-[48px] min-[1181px]:text-[56px]"
          >
            <span className="text-[var(--lw-accent)]">Choose a time </span>
            <span className="italic tracking-normal text-[var(--lw-primary)]">that works for you</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[16px] leading-[1.45] text-[#374151] min-[1181px]:text-[18px]">
            Book a secure telehealth visit in the same CharmHealth calendar used on the previous LifeWell site.
          </p>
          <div className="mt-6 flex justify-center">
            <SwapButton href={src} size="sm">
              {label} on CharmHealth
            </SwapButton>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1100px] overflow-hidden rounded-[30px] border border-[#e1e8ee] bg-white shadow-[0_10px_28px_rgba(62,127,177,0.12)]">
          <iframe
            width="100%"
            height="1000"
            src={src}
            title="CharmHealth appointment calendar"
            style={{ overflow: 'hidden' }}
            frameBorder={0}
            className="block w-full max-w-none border-0 bg-white"
          />
        </div>
      </Container>
    </Section>
  );
}
