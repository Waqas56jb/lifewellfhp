'use client';

import { useId, useRef, useState } from 'react';
import type { Testimonial } from '@/types/content';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { testimonialsSection } from '@/data/marketing';
import { cn } from '@/lib/utils';

/**
 * Testimonial carousel.
 *
 * WCAG 2.2 notes:
 *  - Previous/Next are real buttons, so the control is fully keyboard operable
 *    and never drag-only (2.5.7 Dragging Movements).
 *  - The track is a focusable, labelled region with horizontal scroll, so
 *    pointer users can swipe and keyboard users can arrow through it.
 *  - Nothing auto-advances, so there is no moving content to pause (2.2.2).
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const headingId = useId();

  const scrollTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(next, testimonials.length - 1));
    const card = track.children[clamped] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    setIndex(clamped);
  };

  // Keep the indicator in step when the user swipes or scrolls directly.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    const left = track.scrollLeft + track.offsetLeft;
    let closest = 0;
    let min = Infinity;
    children.forEach((child, i) => {
      const distance = Math.abs(child.offsetLeft - left);
      if (distance < min) {
        min = distance;
        closest = i;
      }
    });
    setIndex(closest);
  };

  return (
    <Section tone="base" aria-labelledby={headingId}>
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={testimonialsSection.eyebrow}
            title={testimonialsSection.heading}
            description={testimonialsSection.body}
            id={headingId}
            align="left"
            className="md:max-w-2xl"
          />

          <div className="flex shrink-0 gap-3">
            <CarouselButton
              label="Previous testimonial"
              onClick={() => scrollTo(index - 1)}
              disabled={index === 0}
              direction="prev"
            />
            <CarouselButton
              label="Next testimonial"
              onClick={() => scrollTo(index + 1)}
              disabled={index >= testimonials.length - 1}
              direction="next"
            />
          </div>
        </div>

        <ul
          ref={trackRef}
          onScroll={onScroll}
          tabIndex={0}
          role="region"
          aria-label="Patient testimonials, scrollable"
          className={cn(
            'mt-11 flex list-none snap-x snap-mandatory gap-6 overflow-x-auto pb-4',
            // Hide the native bar; the buttons and swipe are the affordances.
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          )}
        >
          {testimonials.map((t, i) => (
            <li
              key={i}
              className="w-[min(85vw,26rem)] shrink-0 snap-start sm:w-[24rem] lg:w-[26rem]"
              aria-roledescription="testimonial"
              aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
            >
              <TestimonialCard testimonial={t} />
            </li>
          ))}
        </ul>

        {/* Position indicator — presentational; the region above is the control. */}
        <p aria-live="polite" className="mt-2 text-center text-sm text-text-secondary">
          <span className="sr-only">Showing testimonial </span>
          {index + 1} of {testimonials.length}
        </p>
      </Container>
    </Section>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-md border border-border-subtle bg-surface-raised p-7">
      {testimonial.rating !== null && <Rating value={testimonial.rating} />}

      <blockquote className="mt-5 flex-1">
        <p className="font-heading text-lead leading-relaxed text-text-primary">
          {testimonial.quote}
        </p>
      </blockquote>

      {testimonial.author && (
        <figcaption className="mt-6 flex items-center gap-3 border-t border-border-subtle pt-5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft font-heading text-md font-semibold text-brand-primary-solid"
          >
            {testimonial.author
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span className="text-sm font-semibold text-text-primary">{testimonial.author}</span>
        </figcaption>
      )}
    </figure>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <p className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < value} />
      ))}
    </p>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      className={filled ? 'text-brand-accent-strong' : 'text-border-strong'}
      fill="currentColor"
    >
      <path d="M10 1.8l2.4 5 5.5.8-4 3.9.95 5.5L10 14.4l-4.9 2.6.95-5.5-4-3.9 5.5-.8L10 1.8Z" />
    </svg>
  );
}

function CarouselButton({
  label,
  onClick,
  disabled,
  direction,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  direction: 'prev' | 'next';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-sm border transition-colors duration-quick',
        disabled
          ? 'cursor-not-allowed border-border-subtle text-text-secondary/40'
          : 'border-border-strong text-text-link hover:border-brand-primary hover:bg-brand-primary-soft'
      )}
    >
      <span className="sr-only">{label}</span>
      <svg
        aria-hidden="true"
        focusable="false"
        width="17"
        height="17"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={direction === 'prev' ? 'rotate-180' : undefined}
      >
        <path d="M2 8h11M9 4l4 4-4 4" />
      </svg>
    </button>
  );
}
