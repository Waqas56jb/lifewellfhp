'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { NavItem, NavLink } from '@/types/content';
import { site } from '@/data/site';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { SiteSearch } from './SiteSearch';

interface MobileMenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  cta: NavLink;
  pathname: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal navigation drawer.
 *
 * Traps focus while open, closes on Escape or backdrop click, restores focus to
 * the trigger, and locks body scroll without the layout shift that hiding the
 * scrollbar normally causes.
 */
export function MobileMenu({ id, open, onClose, items, cta, pathname }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    // Compensate for the removed scrollbar so content doesn't jump.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    // Move focus into the panel.
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const list = Array.from(nodes).filter((n) => n.offsetParent !== null);
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (!firstEl || !lastEl) return;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className="absolute inset-0 bg-text-primary/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface-raised shadow-lg"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <Image
            src="/images/brand/logo.avif"
            alt={site.name}
            width={354}
            height={63}
            className="h-8 w-auto"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-border-subtle text-text-primary transition-colors duration-quick hover:bg-surface-muted"
          >
            <span className="sr-only">Close menu</span>
            <CloseIcon />
          </button>
        </div>

        <div className="border-b border-border-subtle px-5 py-4">
          <SiteSearch />
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          <ul className="space-y-1">
            {items.map((item) =>
              item.groups ? (
                <li key={item.href}>
                  <Accordion item={item} pathname={pathname} />
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center rounded-sm px-4 text-md font-semibold no-underline transition-colors duration-quick',
                      pathname === item.href
                        ? 'bg-brand-primary-soft text-brand-primary-solid'
                        : 'text-text-primary hover:bg-surface-muted'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="space-y-4 border-t border-border-subtle px-5 py-5">
          <Button href={cta.href} fullWidth>
            {cta.label}
          </Button>
          <a
            href={site.contact.phoneHref}
            className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-text-link"
          >
            Call {site.contact.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

function Accordion({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(() => pathname.startsWith('/services'));
  const panelId = `m-${item.label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-sm px-4 text-left text-md font-semibold text-text-primary transition-colors duration-quick hover:bg-surface-muted"
      >
        {item.label}
        <ChevronIcon className={cn('transition-transform duration-quick', open && 'rotate-180')} />
      </button>

      <div id={panelId} hidden={!open} className="pb-2 pl-2">
        {item.groups?.map((group) => (
          <div key={group.label} className="mt-3">
            <p className="px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary-solid">
              {group.label}
            </p>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center rounded-sm px-4 py-2 text-sm leading-snug no-underline transition-colors duration-quick',
                      pathname === link.href
                        ? 'font-semibold text-brand-primary-solid'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link
          href={item.href}
          className="mt-2 flex min-h-11 items-center px-4 text-sm font-semibold text-text-link"
        >
          View all services
        </Link>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 4l10 10M14 4L4 14" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 6 5 5 5-5" />
    </svg>
  );
}
