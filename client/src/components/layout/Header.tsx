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
        'z-50 w-full overflow-x-clip transition-[background-color,box-shadow] duration-300',
        isHome ? 'fixed top-0' : 'sticky top-0',
        overlay
          ? 'bg-transparent'
          : 'bg-white shadow-[0_5px_10px_0_rgb(0_0_0/0.03)]'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex min-h-[64px] w-full min-w-0 items-center justify-between gap-3 px-4 py-3 sm:min-h-[80px] sm:px-6 sm:py-5 md:px-8 lg:min-h-[96px] min-[1440px]:min-h-[110px] min-[1440px]:gap-8 min-[1440px]:px-[48px] min-[1601px]:px-[70px] min-[1601px]:py-[30px]">
        <Link
          href="/"
          prefetch
          className="relative z-10 min-w-0 shrink-0 no-underline"
          aria-label={`${site.name} — home`}
        >
          {remoteLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={site.name} className="h-8 w-auto max-w-[min(11.5rem,42vw)] sm:h-10 sm:max-w-[13rem] min-[1440px]:h-[50px] min-[1440px]:max-w-[15rem]" />
          ) : (
            <Image
              src={logo}
              alt={site.name}
              width={354}
              height={63}
              priority
              className="h-8 w-auto max-w-[min(11.5rem,42vw)] sm:h-10 sm:max-w-[13rem] min-[1440px]:h-[50px] min-[1440px]:max-w-[15rem]"
            />
          )}
        </Link>

        <NavBar items={headerNav} cta={button} overlay={overlay} />
      </div>
    </header>
  );
}
