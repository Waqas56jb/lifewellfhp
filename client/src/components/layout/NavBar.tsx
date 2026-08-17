'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem, NavLink } from '@/types/content';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MobileMenu } from './MobileMenu';
import { SiteSearch } from './SiteSearch';

export function NavBar({ items, cta }: { items: NavItem[]; cta: NavLink }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {items.map((item) =>
            item.groups ? (
              <MegaMenuItem key={item.href} item={item} pathname={pathname} />
            ) : (
              <li key={item.href}>
                <TopLevelLink href={item.href} pathname={pathname}>
                  {item.label}
                </TopLevelLink>
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="hidden shrink-0 items-center gap-3 lg:flex">
        <SiteSearch />
        <Button href={cta.href} size="sm">
          {cta.label}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm border border-border-subtle px-4 text-sm font-semibold text-text-primary transition-colors duration-quick hover:bg-surface-muted lg:hidden"
      >
        <BurgerIcon />
        Menu
      </button>

      <MobileMenu
        id="mobile-menu"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={items}
        cta={cta}
        pathname={pathname}
      />
    </>
  );
}

/* ------------------------------------------------------------- pieces --- */

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

function TopLevelLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative inline-flex min-h-11 items-center rounded-xs px-4 text-sm font-semibold no-underline transition-colors duration-quick',
        active
          ? 'text-brand-primary-solid'
          : 'text-text-primary hover:text-brand-primary-solid'
      )}
    >
      {children}
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-pill bg-brand-primary"
        />
      )}
    </Link>
  );
}

/**
 * Services mega menu.
 *
 * Opens on hover for pointer users and on click for everyone; Escape closes
 * and returns focus to the trigger. Focus leaving the subtree closes it, so
 * tabbing past the menu behaves predictably.
 */
function MegaMenuItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const active = isActive(pathname, item.href) || pathname.startsWith('/services');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openNow = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Small delay stops the panel flickering shut when the pointer crosses the
  // gap between the trigger and the panel.
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <li
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative inline-flex min-h-11 items-center gap-2 rounded-xs px-4 text-sm font-semibold transition-colors duration-quick',
          active ? 'text-brand-primary-solid' : 'text-text-primary hover:text-brand-primary-solid'
        )}
      >
        {item.label}
        <ChevronIcon className={cn('transition-transform duration-quick', open && 'rotate-180')} />
        {active && (
          <span
            aria-hidden="true"
            className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-pill bg-brand-primary"
          />
        )}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute left-1/2 top-full z-50 w-[min(56rem,calc(100vw-3rem))] -translate-x-1/2 pt-3"
      >
        <div className="grid gap-8 rounded-md border border-border-subtle bg-surface-raised p-8 shadow-lg md:grid-cols-2">
          {item.groups?.map((group) => (
            <div key={group.label}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary-solid">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? 'page' : undefined}
                      className={cn(
                        'block rounded-xs px-3 py-2.5 text-sm leading-snug no-underline transition-colors duration-quick',
                        pathname === link.href
                          ? 'bg-brand-primary-soft font-semibold text-brand-primary-solid'
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
          <div className="md:col-span-2">
            <Link
              href={item.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-xs text-sm font-semibold text-text-link"
            >
              View all services
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------- icons --- */

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="12"
      height="12"
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

function ArrowIcon() {
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
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}

function BurgerIcon() {
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
      <path d="M2 4.5h14M2 9h14M2 13.5h14" />
    </svg>
  );
}
