'use client';

import { useEffect, useRef, useState } from 'react';
import type { Stat } from '@/types/content';
import { Container, Section } from '@/components/ui/Section';
import { formatCount } from '@/lib/utils';

/**
 * Animated statistics band.
 *
 * The final values are rendered server-side, so the figures are correct with
 * JavaScript disabled and are never announced as "0" — the source site's
 * counters were configured but never fired, leaving every figure at zero.
 * The count-up is a progressive enhancement and is skipped entirely when the
 * visitor prefers reduced motion.
 */
export function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <Section tone="inverse" spacing="sm" aria-labelledby="stats-heading">
      <Container>
        <h2 id="stats-heading" className="sr-only">
          Practice at a glance
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <Counter value={stat.value} suffix={stat.suffix} />
                <span
                  aria-hidden="true"
                  className="mt-2 block text-sm leading-snug text-text-inverse/80"
                >
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || started) return;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setStarted(true);

        const duration = 1400;
        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // Ease-out so the number settles rather than stopping abruptly.
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        setDisplay(0);
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, started]);

  return (
    <span
      ref={ref}
      className="block font-heading text-h2 font-semibold leading-none text-text-inverse"
    >
      {formatCount(display)}
      {suffix}
    </span>
  );
}
