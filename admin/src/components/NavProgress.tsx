'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PageLoader } from './PageLoader';
import { NAV_ITEMS } from '@/lib/nav';

type NavUi = {
  pendingHref: string | null;
  begin: (href: string) => void;
};

const NavUiContext = createContext<NavUi>({ pendingHref: null, begin: () => {} });

export function useNavUi() {
  return useContext(NavUiContext);
}

export function NavUiProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const item of NAV_ITEMS) router.prefetch(item.href);
    }, 30);
    return () => window.clearTimeout(id);
  }, [router]);

  useEffect(() => {
    if (!pendingHref) return;
    const failsafe = window.setTimeout(() => setPendingHref(null), 12000);
    return () => window.clearTimeout(failsafe);
  }, [pendingHref]);

  const begin = useCallback(
    (href: string) => {
      const path = href.split('?')[0];
      if (path === pathname) return;
      setPendingHref(path);
    },
    [pathname]
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor || anchor.target === '_blank') return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      begin(url.pathname);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [begin]);

  const value = useMemo(() => ({ pendingHref, begin }), [pendingHref, begin]);

  return <NavUiContext.Provider value={value}>{children}</NavUiContext.Provider>;
}

export function NavOverlay() {
  const { pendingHref } = useNavUi();
  if (!pendingHref) return null;

  return (
    <>
      <div className="nav-progress" role="progressbar" aria-label="Loading page">
        <span />
      </div>
      <div className="nav-overlay" role="status" aria-live="polite">
        <PageLoader />
      </div>
    </>
  );
}
