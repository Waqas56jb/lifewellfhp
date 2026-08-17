import Link from 'next/link';
import Image from 'next/image';
import { site } from '@/data/site';
import { footerColumns, legalLinks } from '@/data/navigation';
import { Container } from '@/components/ui/Section';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { newsletter } from '@/data/marketing';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-surface-raised">
      {/* Newsletter */}
      <div className="border-b border-border-subtle bg-surface-muted">
        <Container>
          <div className="grid items-center gap-8 py-14 md:grid-cols-2 md:py-16">
            <div>
              <h2 className="text-h4">{newsletter.heading}</h2>
              <p className="mt-3 max-w-[48ch] text-text-secondary">{newsletter.body}</p>
            </div>
            <NewsletterForm />
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
          {/* Brand + contact */}
          <div>
            <Link href="/" className="inline-block rounded-xs" aria-label={`${site.name} — home`}>
              <Image
                src="/images/brand/logo.avif"
                alt={site.name}
                width={354}
                height={63}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-[42ch] text-sm text-text-secondary">{site.footerBlurb}</p>

            <address className="mt-6 space-y-2 text-sm not-italic text-text-secondary">
              <p className="flex flex-wrap items-center gap-x-2">
                <a
                  href={site.contact.phoneHref}
                  className="inline-flex min-h-6 items-center py-1 font-semibold text-text-link"
                >
                  {site.contact.phone}
                </a>
                <span className="text-border-strong" aria-hidden="true">
                  |
                </span>
                <span>Fax {site.contact.fax}</span>
              </p>
              <p>
                <a
                  href={site.contact.emailHref}
                  className="inline-flex min-h-6 items-center py-1 text-text-link"
                >
                  {site.contact.email}
                </a>
              </p>
              <p className="max-w-[32ch]">
                <span className="block text-xs uppercase tracking-wide text-text-secondary/80">
                  {site.address.type}
                </span>
                {site.address.full}
              </p>
            </address>

            <ul className="mt-6 flex gap-2">
              {site.social.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-border-subtle text-text-secondary transition-colors duration-quick hover:border-brand-primary hover:text-brand-primary-solid"
                  >
                    <span className="sr-only">{site.name} on {s.name}</span>
                    <SocialIcon name={s.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
                {col.heading}
              </h2>
              <ul className="mt-5 space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-9 items-center py-1 text-sm leading-snug text-text-secondary no-underline transition-colors duration-quick hover:text-text-link hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Crisis notice — repeated at the foot of every page. */}
        <div className="mb-8 rounded-md border border-crisis/25 bg-crisis-soft px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-sm text-text-primary">
            <strong className="font-semibold text-crisis">In an emergency:</strong>{' '}
            If you are in immediate danger or thinking about harming yourself, call{' '}
            <a href={site.crisis.phoneHref} className="font-semibold text-crisis underline">
              988
            </a>{' '}
            (Suicide &amp; Crisis Lifeline) or dial 911. This website is not monitored for
            emergencies.
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-border-subtle py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-text-secondary">
            © {year} {site.name}. All Rights Reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-6 items-center py-1 text-xs text-text-secondary no-underline hover:text-text-link hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const common = {
    'aria-hidden': true as const,
    focusable: 'false' as const,
    width: 17,
    height: 17,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
  };

  if (name === 'Facebook') {
    return (
      <svg {...common}>
        <path d="M14 9V7c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.5 3 10.5 4.4 10.5 6.8V9H8.5v3h2v9h3.5v-9h2.4l.3-3H14Z" />
      </svg>
    );
  }
  if (name === 'LinkedIn') {
    return (
      <svg {...common}>
        <path d="M6.9 8.4v11.7H3.2V8.4h3.7ZM5.1 2.6a2.1 2.1 0 1 1 0 4.3 2.1 2.1 0 0 1 0-4.3ZM20.8 20.1h-3.7v-5.9c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.8 1.4-.1.2-.1.6-.1.9v6.1H9.6V8.4h3.7v1.6a3.7 3.7 0 0 1 3.4-1.9c2.4 0 4.2 1.6 4.2 5v7Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.3 2.2.4.5.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.3 1.8-.4 2.2-.2.5-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.3-2.2-.4-.5-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.3-1.8.4-2.2.2-.5.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 3.8a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 9.9a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8Zm7.6-10.1a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z" />
    </svg>
  );
}
