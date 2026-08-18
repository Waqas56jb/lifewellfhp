'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem, NavLink } from '@/types/content';
import { cn } from '@/lib/utils';
import { SwapButton } from '@/components/ui/SwapButton';
import { MobileMenu } from './MobileMenu';

export function NavBar({
  items,
  cta,
  overlay = false,
}: {
  items: NavItem[];
  cta: NavLink;
  overlay?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Hide the drawer if the viewport grows into the desktop nav.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1180px)');
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-3 lg:gap-[30px]">
      <nav aria-label="Main" className="hidden min-w-0 min-[1180px]:block">
        <ul className="flex flex-nowrap items-center justify-end gap-[3px]">
          {items.map((item) =>
            item.groups ? (
              <MegaMenuItem key={item.href} item={item} pathname={pathname} />
            ) : (
              <li key={item.href} className="shrink-0">
                <TopLevelLink href={item.href} pathname={pathname}>
                  {item.label}
                </TopLevelLink>
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="hidden shrink-0 min-[1180px]:flex">
        <SwapCta href={cta.href} label={cta.label} />
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        className={cn(
          'relative z-10 inline-flex min-h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-sm border px-3 text-sm font-semibold transition-colors duration-quick sm:px-4 min-[1180px]:hidden',
          overlay
            ? 'border-white/50 text-white hover:bg-white/10'
            : 'border-border-subtle text-text-primary hover:bg-surface-muted'
        )}
      >
        <BurgerIcon />
        <span>Menu</span>
      </button>

      <MobileMenu
        id="mobile-menu"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={items}
        cta={cta}
        pathname={pathname}
      />
    </div>
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
        'inline-flex min-h-[42px] shrink-0 items-center whitespace-nowrap rounded-[30px] px-[22px] py-[5px] text-[16px] font-semibold no-underline transition-colors duration-300 min-[1601px]:px-[25px]',
        active
          ? 'bg-[#3E7FB1] text-white'
          : 'text-[#5FAF6B] hover:bg-[#3E7FB1] hover:text-white'
      )}
    >
      {children}
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
  const [top, setTop] = useState(110);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const active = isActive(pathname, item.href) || pathname.startsWith('/services');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const header = document.querySelector('header')?.getBoundingClientRect();
      const fromTrigger = trigger ? trigger.bottom + 45 : 0;
      const fromHeader = (header?.bottom ?? 110) + 16;
      setTop(Math.max(fromTrigger, fromHeader));
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('.services-mega')) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openNow = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const panel =
    mounted &&
    open &&
    createPortal(
      <div
        id={panelId}
        className="services-mega fixed left-1/2 z-[70] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2"
        style={{ top }}
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
      >
        <div className="mega-card flex min-h-[390px] overflow-hidden rounded-[30px] shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
          {item.groups?.map((group) => (
            <div
              key={group.label}
              className="flex min-w-0 w-1/2 flex-col justify-center gap-5 p-10"
            >
              <Link href={item.href} className="mega-heading block no-underline">
                {group.label}
              </Link>
              <ul className="flex flex-col gap-px">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? 'page' : undefined}
                      className="mega-link block px-2.5 py-2.5 no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>,
      document.body
    );

  return (
    <li
      ref={wrapperRef}
      className="relative shrink-0"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex min-h-[42px] shrink-0 items-center gap-[7px] whitespace-nowrap rounded-[30px] px-[22px] py-[5px] text-[16px] font-semibold transition-colors duration-300 min-[1601px]:px-[25px]',
          active || open
            ? 'bg-[#3E7FB1] text-white'
            : 'text-[#5FAF6B] hover:bg-[#3E7FB1] hover:text-white'
        )}
      >
        {item.label}
        <ChevronIcon className={cn('transition-transform duration-quick', open && 'rotate-180')} />
      </button>
      {panel}
    </li>
  );
}

/* -------------------------------------------------------------- icons --- */

function SwapCta({ href, label }: { href: string; label: string }) {
  return <SwapButton href={href}>{label}</SwapButton>;
}

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
