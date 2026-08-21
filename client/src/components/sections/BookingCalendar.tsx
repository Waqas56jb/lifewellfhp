'use client';

import { useEffect, useState } from 'react';
import { Container, Section } from '@/components/ui/Section';
import { SwapButton } from '@/components/ui/SwapButton';
import { site } from '@/data/site';

/** Must match CharmHealth Web Embed → Hosting Website(s). */
const CHARM_HOST = 'lifewellfhp.com';
const CHARM_ORIGIN = 'https://lifewellfhp.com';

/**
 * CharmHealth only renders the calendar when the parent page host is listed
 * under Hosting Websites. Their EHR is set to https://lifewellfhp.com/ — not
 * www and not the Vercel preview host.
 */
export function BookingCalendar({
  src = site.booking.url,
  label = site.booking.label,
}: {
  src?: string;
  label?: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    const local = host === 'localhost' || host === '127.0.0.1';
    if (!local && host !== CHARM_HOST) {
      const next = new URL(
        `${window.location.pathname}${window.location.search}${window.location.hash || '#charm-calendar'}`,
        CHARM_ORIGIN
      );
      window.location.replace(next.toString());
      return;
    }
    setReady(true);
  }, []);

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

        {ready ? (
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
        ) : (
          <p className="mx-auto mt-10 max-w-[40ch] text-center text-[15px] text-[#5b6675]">
            Opening the booking calendar on lifewellfhp.com…
          </p>
        )}
      </Container>
    </Section>
  );
}
