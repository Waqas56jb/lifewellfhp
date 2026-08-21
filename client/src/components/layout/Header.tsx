'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { site } from '@/data/site';
import { headerNav, headerCta } from '@/data/navigation';
import { cn } from '@/lib/utils';
import { NavBar } from './NavBar';

/**
 * Live header is absolutely positioned over the hero (transparent), then
 * fills white once the visitor starts scrolling — Headroom `not-top`.
 */
export function Header({
  cta,
  logoUrl,
}: {
  cta?: { label: string; href: string };
  logoUrl?: string | null;
} = {}) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const overlay = isHome && !scrolled;
  const button = cta ?? headerCta;
  const logo = logoUrl || '/images/brand/logo.avif';
  const remoteLogo = logo.startsWith('http');

  return (
    <header
      className={cn(
        'z-50 w-full transition-[background-color,box-shadow] duration-300',
        isHome ? 'fixed top-0' : 'sticky top-0',
        overlay
          ? 'bg-transparent'
          : 'bg-white shadow-[0_5px_10px_0_rgb(0_0_0/0.03)]'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex min-h-[72px] w-full min-w-0 items-center justify-between gap-3 px-4 py-[16px] sm:min-h-[90px] sm:gap-4 sm:px-[30px] sm:py-[30px] lg:min-h-[110px] lg:gap-[30px] lg:px-[70px]">
        <Link
          href="/"
          prefetch
          className="shrink-0 no-underline"
          aria-label={`${site.name} — home`}
        >
          {remoteLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={site.name} className="h-9 w-auto sm:h-11 lg:h-[50px]" />
          ) : (
            <Image
              src={logo}
              alt={site.name}
              width={354}
              height={63}
              priority
              className="h-9 w-auto sm:h-11 lg:h-[50px]"
            />
          )}
        </Link>

        <NavBar items={headerNav} cta={button} overlay={overlay} />
      </div>
    </header>
  );
}
