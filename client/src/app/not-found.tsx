import type { Metadata } from 'next';
import { Container, Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Section tone="raised" spacing="lg">
      <Container size="narrow">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-h1 text-brand-primary" aria-hidden="true">
            404
          </p>
          <h1 className="mt-4">We couldn’t find that page</h1>
          <p className="mt-6 text-lead text-text-secondary">
            The page you’re looking for may have moved or no longer exists. Here are a few places
            that might help.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Button href="/" size="lg">
              Back to home
            </Button>
            <Button href="/our-services" variant="outline" size="lg">
              Browse services
            </Button>
          </div>

          <div className="mt-12 rounded-md border border-border-subtle bg-surface-muted px-6 py-6 text-left">
            <h2 className="text-h5">Need to reach us?</h2>
            <p className="mt-3 text-sm text-text-secondary">
              Call{' '}
              <a href={site.contact.phoneHref} className="font-semibold text-text-link">
                {site.contact.phone}
              </a>{' '}
              or email{' '}
              <a href={site.contact.emailHref} className="font-semibold text-text-link">
                {site.contact.email}
              </a>
              . If you are in crisis, call or text{' '}
              <a href={site.crisis.phoneHref} className="font-semibold text-crisis">
                988
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
