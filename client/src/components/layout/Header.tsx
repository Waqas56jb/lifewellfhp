import Link from 'next/link';
import Image from 'next/image';
import { site } from '@/data/site';
import { headerNav, headerCta } from '@/data/navigation';
import { Container } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { NavBar } from './NavBar';

/**
 * Global header.
 *
 * A slim crisis strip sits above the navigation so the 988 line is reachable
 * from every route — on the source site it appeared only mid-page on two
 * pages.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-surface-inverse text-text-inverse on-inverse">
        <Container>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-xs sm:gap-x-4">
            <span className="opacity-90">In crisis or thinking about self-harm?</span>
            <a
              href={site.crisis.phoneHref}
              className="inline-flex min-h-6 items-center gap-1.5 font-semibold text-text-inverse underline underline-offset-2 hover:no-underline"
            >
              <PhoneIcon />
              Call or text {site.crisis.phone}
            </a>
            <span className="hidden opacity-75 sm:inline">
              — {site.crisis.lineName}, available 24/7
            </span>
          </p>
        </Container>
      </div>

      <div className="border-b border-border-subtle bg-surface-raised/95 backdrop-blur-sm">
        <Container>
          <div className="flex items-center justify-between gap-3 py-3 sm:gap-6 sm:py-4">
            <Link
              href="/"
              className="min-w-0 shrink rounded-xs no-underline"
              aria-label={`${site.name} — home`}
            >
              <Image
                src="/images/brand/logo.avif"
                alt={site.name}
                width={354}
                height={63}
                priority
                className="h-8 w-auto max-w-[min(11.5rem,46vw)] sm:h-10 sm:max-w-none"
              />
            </Link>

            <NavBar items={headerNav} cta={headerCta} />
          </div>
        </Container>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M3.7 1.3a1.3 1.3 0 0 0-1.8.1L1.2 2c-.7.8-.8 2-.2 2.9a22 22 0 0 0 10.1 10.1c.9.6 2 .5 2.9-.2l.6-.7a1.3 1.3 0 0 0 .1-1.8l-2-2.2a1.3 1.3 0 0 0-1.7-.2l-1 .7a17 17 0 0 1-4.6-4.6l.7-1a1.3 1.3 0 0 0-.2-1.7l-2.2-2Z" />
    </svg>
  );
}

export { Button };
