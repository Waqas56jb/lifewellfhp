'use client';

import { useId, useState } from 'react';
import type { Faq } from '@/types/content';
import { cn } from '@/lib/utils';

/**
 * FAQ accordion.
 *
 * Built on real <button> elements with aria-expanded / aria-controls rather
 * than native <details>, so the open state can be controlled and the panel can
 * animate without losing the correct semantics.
 */
export function FAQAccordion({
  faqs,
  allowMultiple = true,
  /**
   * Heading level for each question. Defaults to h3 for use beneath an h2
   * section heading; pass 2 where the accordion is the page's primary content
   * so the outline never skips a level.
   */
  headingLevel = 3,
}: {
  faqs: Faq[];
  allowMultiple?: boolean;
  headingLevel?: 2 | 3;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<number[]>([0]);
  const Heading = (headingLevel === 2 ? 'h2' : 'h3') as 'h2' | 'h3';

  const toggle = (i: number) =>
    setOpen((current) => {
      if (current.includes(i)) return current.filter((n) => n !== i);
      return allowMultiple ? [...current, i] : [i];
    });

  return (
    <ul className="divide-y divide-border-subtle overflow-hidden rounded-md border border-border-subtle bg-surface-raised">
      {faqs.map((faq, i) => {
        const expanded = open.includes(i);
        const buttonId = `${baseId}-q-${i}`;
        const panelId = `${baseId}-a-${i}`;

        return (
          <li key={faq.question}>
            <Heading>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className={cn(
                  'flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition-colors duration-quick sm:gap-5 sm:px-6 sm:py-5',
                  'min-h-14 touch-manipulation hover:bg-surface-muted',
                  expanded && 'bg-surface-muted/60'
                )}
              >
                <span className="font-heading text-h5 font-medium text-text-primary">
                  {faq.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-fast',
                    expanded
                      ? 'rotate-180 border-brand-primary bg-brand-primary-soft text-brand-primary-solid'
                      : 'border-border-strong text-text-secondary'
                  )}
                >
                  <ChevronIcon />
                </span>
              </button>
            </Heading>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!expanded}
              className="px-4 pb-5 sm:px-6 sm:pb-6"
            >
              <p className="max-w-[70ch] text-md leading-relaxed text-text-secondary">
                {faq.answer}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 6 5 5 5-5" />
    </svg>
  );
}
