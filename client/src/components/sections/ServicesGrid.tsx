import Link from 'next/link';
import type { ServiceSummary } from '@/types/content';
import { cn } from '@/lib/utils';

/**
 * Service card.
 *
 * The whole card is one link — a stretched anchor over the heading keeps a
 * single tab stop and one accessible name, rather than nesting a "Learn more"
 * link inside a clickable container.
 */
export function ServiceCard({
  service,
  className,
}: {
  service: ServiceSummary;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-md border border-border-subtle bg-surface-raised p-7',
        'transition-[border-color,box-shadow,transform] duration-fast ease-out-soft',
        'hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-md',
        'focus-within:border-brand-primary/40 focus-within:shadow-md',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mb-5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm',
          service.category === 'psychiatric'
            ? 'bg-brand-primary-soft text-brand-primary-solid'
            : 'bg-brand-accent-soft text-brand-accent-strong'
        )}
      >
        <ServiceIcon category={service.category} />
      </span>

      <h3 className="text-h5">
        <Link
          href={service.href}
          className="rounded-xs text-text-primary no-underline transition-colors duration-quick after:absolute after:inset-0 after:content-[''] group-hover:text-brand-primary-solid"
        >
          {service.title}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
        {service.description}
      </p>

      <span
        aria-hidden="true"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-text-link"
      >
        Learn more
        <ArrowIcon className="transition-transform duration-quick group-hover:translate-x-1" />
      </span>
    </article>
  );
}

export function ServicesGrid({
  services,
  columns = 3,
  className,
}: {
  services: ServiceSummary[];
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'grid list-none gap-6 sm:grid-cols-2',
        columns === 3 && 'lg:grid-cols-3',
        className
      )}
    >
      {services.map((service) => (
        <li key={service.slug} className="flex">
          <ServiceCard service={service} className="w-full" />
        </li>
      ))}
    </ul>
  );
}

function ServiceIcon({ category }: { category: ServiceSummary['category'] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  // Mind/brain mark for psychiatric care; heart-in-hand for primary care.
  return category === 'psychiatric' ? (
    <svg {...common}>
      <path d="M12 5a3.2 3.2 0 0 0-3.2 3.2A2.9 2.9 0 0 0 6 11a2.9 2.9 0 0 0 1.5 2.5A2.8 2.8 0 0 0 10 18h2V5Z" />
      <path d="M12 5a3.2 3.2 0 0 1 3.2 3.2A2.9 2.9 0 0 1 18 11a2.9 2.9 0 0 1-1.5 2.5A2.8 2.8 0 0 1 14 18h-2" />
      <path d="M12 18v3" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="M3 13.5a10 10 0 0 0 6 3.2l3.3.4a3 3 0 0 0 2.4-.8L20 12" />
      <path d="M12.5 8.6a2 2 0 0 1 2.9-2.7l.6.6.6-.6a2 2 0 0 1 2.9 2.7L16 11.9l-3.5-3.3Z" />
      <path d="M3 11v7" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}
