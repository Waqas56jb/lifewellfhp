'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Hero background media.
 *
 * The poster image is always rendered and is the LCP element, so the hero
 * paints immediately rather than waiting on the video. The 1.1 MB loop is
 * layered on top only once it can play, and is skipped entirely for visitors
 * who prefer reduced motion — for them the poster is the finished state, and
 * the video is never requested.
 */
export function HeroMedia() {
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAllowMotion(!query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  return (
    <>
      <Image
        src="/images/sections/home-hero-poster.jpg"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover object-[68%_center]"
      />

      {allowMotion && (
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center]"
          poster="/images/sections/home-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          // Decorative; the heading carries the meaning.
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/video/home-hero.mp4" type="video/mp4" />
        </video>
      )}
    </>
  );
}
