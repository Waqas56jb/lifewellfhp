import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Section';
import type { ReactNode } from 'react';

export interface Crumb {
  name: string;
  href: string;
}

/** Interior-page hero: breadcrumbs, H1, lead paragraph and optional imagery. */
export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumbs?: Crumb[];
  image?: { src: string; width: number; height: number; alt: string };
  children?: ReactNode;
}) {
  const hasImage = Boolean(image);

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-surface-raised">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-[18rem] w-[18rem] rounded-full bg-brand-primary-soft/60 blur-3xl sm:-right-32 sm:-top-40 sm:h-[26rem] sm:w-[26rem]"
      />

      <Container className="relative">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        <div
          className={
            hasImage
              ? 'grid items-center gap-10 pb-14 pt-6 md:pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-20'
              : 'max-w-3xl pb-14 pt-6 md:pb-16 lg:pb-20'
          }
        >
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="max-w-[20ch]">{title}</h1>
            {lead && <p className="mt-6 max-w-[62ch] text-lead text-text-secondary">{lead}</p>}
            {children && <div className="mt-8">{children}</div>}
          </div>

          {image && (
            <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-muted shadow-md">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-2">
              {last ? (
                <span
                  aria-current="page"
                  className="inline-flex min-h-6 items-center font-semibold text-text-primary"
                >
                  {item.name}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-6 items-center rounded-xs py-1 text-text-secondary no-underline hover:text-text-link hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-border-strong">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
