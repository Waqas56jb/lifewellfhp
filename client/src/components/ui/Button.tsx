import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn, isExternal } from '@/lib/utils';

type Variant = 'primary' | 'brand' | 'accent' | 'outline' | 'ghost' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

/* Solid fills use the darker brand tones so label text clears 4.5:1.
   See scripts/check-contrast.mjs for the measured ratios. */
const VARIANTS: Record<Variant, string> = {
  primary:
    'rounded-sm bg-brand-primary-solid text-text-inverse hover:bg-brand-primary-hover border border-transparent',
  /* Source Elementor fill — used on the header "Get Started" chip pairing. */
  brand:
    'rounded-[30px] bg-brand-primary text-text-inverse hover:bg-[#35719d] border border-transparent',
  accent:
    'rounded-sm bg-brand-accent-strong text-text-inverse hover:bg-brand-accent-hover border border-transparent',
  outline:
    'rounded-sm bg-transparent text-text-link border border-border-strong hover:border-brand-primary hover:bg-brand-primary-soft',
  ghost:
    'rounded-sm bg-transparent text-text-link border border-transparent hover:bg-brand-primary-soft',
  inverse:
    'rounded-sm bg-surface-raised text-text-link border border-transparent hover:bg-brand-primary-soft',
};

/* min-h keeps every control at or above the 44px comfortable touch target. */
const SIZES: Record<Size, string> = {
  sm: 'text-sm px-5 py-3.5 min-h-11 gap-3 sm:px-6 sm:py-4',
  md: 'text-md px-6 py-4 min-h-12 gap-3 sm:px-8 sm:py-5 sm:gap-4',
  lg: 'text-md px-6 py-4 min-h-12 gap-3 sm:px-9 sm:py-6 sm:min-h-14 sm:gap-4',
};

const BASE =
  'inline-flex items-center justify-center font-semibold leading-tight text-center no-underline ' +
  'transition-colors duration-quick ease-out-soft cursor-pointer touch-manipulation ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
  /**
   * Renders the detached circular arrow chip used across the original site's
   * calls to action. Decorative — the label carries the accessible name.
   */
  chip?: boolean;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { href?: never };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Renders an <a> when given `href` and a <button> otherwise, so navigation and
 * actions always use the correct element.
 */
/**
 * Wraps a button in the site's signature pill + detached arrow-chip pairing.
 * The chip is aria-hidden; it repeats the action the label already names.
 */
function withChip(node: ReactNode, variant: Variant, fullWidth?: boolean) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2',
        fullWidth ? 'w-full' : 'w-full sm:w-auto',
        '[&>a]:min-w-0 [&>a]:flex-1 sm:[&>a]:flex-initial',
        '[&>button]:min-w-0 [&>button]:flex-1 sm:[&>button]:flex-initial',
        fullWidth && '[&>a]:flex-1 [&>button]:flex-1'
      )}
    >
      {node}
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-quick sm:h-12 sm:w-12',
          variant === 'primary' && 'bg-brand-primary-solid text-text-inverse',
          variant === 'brand' && 'bg-brand-primary text-text-inverse',
          variant === 'accent' && 'bg-brand-accent-strong text-text-inverse',
          variant === 'inverse' && 'bg-surface-raised text-text-link',
          (variant === 'outline' || variant === 'ghost') &&
            'border border-border-strong text-text-link'
        )}
      >
        <ArrowIcon />
      </span>
    </span>
  );
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, fullWidth, chip, ...rest } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...anchorRest } = rest as ComponentPropsWithoutRef<'a'> & { href: string };

    if (isExternal(href)) {
      const external = /^https?:/.test(href);
      const anchor = (
        <a
          {...anchorRest}
          href={href}
          className={classes}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
          {external && !chip && <ExternalIcon />}
        </a>
      );
      return chip ? withChip(anchor, variant, fullWidth) : anchor;
    }

    const link = (
      <Link {...anchorRest} href={href} className={classes}>
        {children}
      </Link>
    );
    return chip ? withChip(link, variant, fullWidth) : link;
  }

  const { type = 'button', ...buttonRest } = rest as ComponentPropsWithoutRef<'button'>;
  const button = (
    <button {...buttonRest} type={type} className={classes}>
      {children}
    </button>
  );
  return chip ? withChip(button, variant, fullWidth) : button;
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-80"
    >
      <path d="M6 2H2v12h12v-4M10 2h4v4M14 2 7 9" />
    </svg>
  );
}
