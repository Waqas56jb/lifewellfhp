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
  notices = [],
  phone,
}: {
  cta?: { label: string; href: string };
  logoUrl?: string | null;
  notices?: { title: string; body: string; tone: string }[];
  phone?: string | null;
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
      {notices.length ? (
        <div
          className="bg-[var(--lw-primary)] px-4 py-2 text-center text-[13px] leading-snug text-white sm:px-[30px] sm:text-[14px] lg:px-10"
          role="status"
        >
          {notices.map((notice) => (
            <p key={`${notice.title}-${notice.body}`}>
              <span className="font-semibold">{notice.title}</span>
              {notice.body ? <span>{` — ${notice.body}`}</span> : null}
            </p>
          ))}
        </div>
      ) : null}
      <div className="flex min-h-[72px] w-full min-w-0 items-center gap-3 px-4 py-3 sm:min-h-[90px] sm:gap-4 sm:px-[30px] sm:py-5 lg:min-h-[110px] lg:gap-5 lg:px-10 lg:py-[22px] min-[1601px]:gap-[30px] min-[1601px]:px-[70px] min-[1601px]:py-[30px]">
        <Link
          href="/"
          prefetch
          className="relative z-10 shrink-0 no-underline"
          aria-label={`${site.name} — home`}
        >
          {remoteLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={site.name} className="h-9 w-auto max-w-[min(11rem,46vw)] sm:h-11 sm:max-w-none lg:h-[50px]" />
          ) : (
            <Image
              src={logo}
              alt={site.name}
              width={354}
              height={63}
              priority
              className="h-9 w-auto max-w-[min(11rem,46vw)] sm:h-11 sm:max-w-none lg:h-[50px]"
            />
          )}
        </Link>

        <NavBar items={headerNav} cta={button} overlay={overlay} phone={phone} />
      </div>
    </header>
  );
}
