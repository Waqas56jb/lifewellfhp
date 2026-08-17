import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Container, Section } from '@/components/ui/Section';
import { PageHero } from '@/components/sections/PageHero';
import { LegalSections } from '@/components/sections/ContentSections';
import { JsonLd } from '@/components/seo/JsonLd';

import { generatedLegalPages } from '@/data/generated/legal';
import { legalLinks } from '@/data/navigation';
import { site } from '@/data/site';
import { pageGraph } from '@/lib/schema';
import { formatDate, isoDate } from '@/lib/utils';

export const getLegalPage = (slug: string) => generatedLegalPages.find((p) => p.slug === slug);

/** Shared layout for the four policy pages. Content is preserved verbatim. */
export function LegalPageTemplate({ slug, label }: { slug: string; label: string }) {
  const page = getLegalPage(slug);
  if (!page) notFound();

  const others = legalLinks.filter((l) => l.href !== `/${slug}`);

  return (
    <>
      <JsonLd
        data={pageGraph(`/${slug}`, page.title, page.seoDescription ?? page.intro[0] ?? '', [
          { name: 'Home', href: '/' },
          { name: label, href: `/${slug}` },
        ])}
        id={`${slug}-schema`}
      />

      <PageHero
        eyebrow="Legal"
        title={page.heading}
        lead={page.intro[0]}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: label, href: `/${slug}` },
        ]}
      />

      <Section tone="base">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
            <article className="min-w-0">
              {page.intro.slice(1).map((paragraph, i) => (
                <p key={i} className="mb-4 text-md leading-relaxed text-text-secondary">
                  {paragraph}
                </p>
              ))}

              <LegalSections sections={page.sections} />

              {page.updatedAt && (
                <p className="mt-12 border-t border-border-subtle pt-6 text-sm text-text-secondary">
                  Last updated{' '}
                  <time dateTime={isoDate(page.updatedAt)}>{formatDate(page.updatedAt)}</time>.
                </p>
              )}
            </article>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <nav aria-label="Other policies">
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
                  Other policies
                </h2>
                <ul className="mt-4 space-y-1">
                  {others.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="flex min-h-11 items-center rounded-xs px-3 py-2 text-sm leading-snug text-text-secondary no-underline transition-colors duration-quick hover:bg-surface-muted hover:text-text-link"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-8 rounded-md border border-border-subtle bg-surface-muted p-6">
                <h2 className="text-h5">Questions?</h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  Contact us about any of these policies.
                </p>
                <p className="mt-4 flex flex-col text-sm">
                  <a
                    href={site.contact.emailHref}
                    className="inline-flex min-h-6 items-center py-1 font-semibold text-text-link"
                  >
                    {site.contact.email}
                  </a>
                  <a
                    href={site.contact.phoneHref}
                    className="inline-flex min-h-6 items-center py-1 font-semibold text-text-link"
                  >
                    {site.contact.phone}
                  </a>
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
