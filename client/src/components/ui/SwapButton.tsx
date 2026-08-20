import Link from 'next/link';
import { cn, isExternal } from '@/lib/utils';

/**
 * Live-site "swap button": pill label + detached circular arrow.
 * Hover fills both pieces with the secondary green.
 */
export function SwapButton({
  href,
  children,
  className,
  fullWidth,
  size = 'md',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  size?: 'md' | 'sm';
}) {
  const classes = cn(
    'group inline-flex max-w-full items-center',
    fullWidth && 'w-full',
    className
  );

  const compact = size === 'sm';
  const pill = cn(
    'inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-[30px] bg-[var(--lw-primary,#3E7FB1)] font-semibold leading-[1.3] text-white no-underline transition-colors duration-300 group-hover:bg-[var(--lw-accent,#5FAF6B)]',
    compact
      ? 'min-h-[40px] px-5 py-2 text-[14px]'
      : 'min-h-[51px] px-[30px] py-[14px] text-[16px] min-[1181px]:text-[18px]'
  );

  const chip = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--lw-primary,#3E7FB1)] text-white transition-colors duration-300 group-hover:bg-[var(--lw-accent,#5FAF6B)]',
    compact ? 'size-10' : 'size-[51px]'
  );

  const inner = (
    <>
      <span className={cn(pill, fullWidth && 'flex-1')}>{children}</span>
      <span aria-hidden="true" className={chip}>
        <LongArrow />
      </span>
    </>
  );

  if (isExternal(href)) {
    const externalTab = /^https?:/.test(href);
    return (
      <a
        href={href}
        {...(externalTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={classes}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} prefetch className={classes}>
      {inner}
    </Link>
  );
}

export function OutlineButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        'inline-flex min-h-[51px] items-center justify-center gap-2 whitespace-nowrap rounded-[30px] border border-white px-[30px] py-[14px] text-[16px] font-semibold leading-[1.3] text-white no-underline transition-colors duration-300 hover:border-[#3E7FB1] hover:bg-[#3E7FB1] min-[1181px]:text-[18px]',
        className
      )}
    >
      {children}
      <LongArrow />
    </Link>
  );
}

export function LongArrow() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 448 512"
      fill="currentColor"
    >
      <path d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z" />
    </svg>
  );
}
