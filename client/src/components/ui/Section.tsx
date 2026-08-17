import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* --------------------------------------------------------- Container --- */

export function Container({
  children,
  className,
  size = 'page',
}: {
  children: ReactNode;
  className?: string;
  size?: 'page' | 'prose' | 'narrow';
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-10',
        size === 'page' && 'max-w-page',
        size === 'narrow' && 'max-w-narrow',
        size === 'prose' && 'max-w-prose',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------- Section --- */

type Tone = 'base' | 'raised' | 'muted' | 'inverse' | 'transparent';

const TONES: Record<Tone, string> = {
  base: 'bg-surface-base',
  raised: 'bg-surface-raised',
  muted: 'bg-surface-muted',
  inverse: 'bg-surface-inverse text-text-inverse on-inverse',
  transparent: '',
};

/* Vertical rhythm: 56-80px on mobile scaling to 96-128px on desktop. */
const SPACING = {
  sm: 'py-14 md:py-20',
  md: 'py-14 md:py-24',
  lg: 'py-20 md:py-32',
} as const;

export function Section({
  children,
  tone = 'base',
  spacing = 'md',
  className,
  as: Tag = 'section',
  id,
  'aria-labelledby': labelledBy,
  'aria-label': label,
}: {
  children: ReactNode;
  tone?: Tone;
  spacing?: keyof typeof SPACING;
  className?: string;
  as?: ElementType;
  id?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn(TONES[tone], SPACING[spacing], className)}
    >
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------- Eyebrow --- */

/**
 * The small uppercase kicker above section headings.
 *
 * The source site marked these up as <h6>, which injected phantom levels into
 * every document outline. Here it is a styled <p> — appearance only.
 */
export function Eyebrow({
  children,
  tone = 'primary',
  className,
}: {
  children: ReactNode;
  tone?: 'primary' | 'accent' | 'inverse';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em]',
        tone === 'primary' && 'text-brand-primary-solid',
        tone === 'accent' && 'text-brand-accent-strong',
        tone === 'inverse' && 'text-text-inverse/85',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-px w-8',
          tone === 'primary' && 'bg-brand-primary',
          tone === 'accent' && 'bg-brand-accent-strong',
          tone === 'inverse' && 'bg-text-inverse/50'
        )}
      />
      {children}
    </p>
  );
}

/* ---------------------------------------------------- SectionHeading --- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'default',
  as = 'h2',
  id,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'default' | 'inverse';
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  const Tag = as;
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' && 'items-center text-center',
        align === 'left' && 'items-start text-left',
        className
      )}
    >
      {eyebrow && <Eyebrow tone={tone === 'inverse' ? 'inverse' : 'primary'}>{eyebrow}</Eyebrow>}
      <Tag id={id} className={cn('max-w-[22ch] sm:max-w-[28ch]', tone === 'inverse' && 'text-text-inverse')}>
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            'mt-6 max-w-[62ch] text-lead',
            tone === 'inverse' ? 'text-text-inverse/85' : 'text-text-secondary'
          )}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
