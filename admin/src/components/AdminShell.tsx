'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { NAV_GROUPS, NAV_ITEMS } from '@/lib/nav';
import { NAV_ICONS } from '@/lib/icons';
import { NavOverlay, NavUiProvider, useNavUi } from './NavProgress';
import { NotificationBell } from './NotificationBell';
import { PageLoader } from './PageLoader';

const SIDEBAR_KEY = 'lw_admin_sidebar';

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <NavUiProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </NavUiProvider>
  );
}

function AdminShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, can, loading } = useAuth();
  const { pendingHref, begin } = useNavUi();
  const [collapsed, setCollapsed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved === 'collapsed') setCollapsed(true);
    else if (saved === 'expanded') setCollapsed(false);
    else if (window.matchMedia('(max-width: 1080px)').matches) setCollapsed(true);
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1080px)').matches) {
      setCollapsed(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading && !user) {
    return (
      <div className="boot-screen">
        <PageLoader />
      </div>
    );
  }

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => {
    if ('superAdminOnly' in item && item.superAdminOnly && user.role !== 'super_admin') return false;
    return can(item.module);
  });
  const currentPath = pendingHref || pathname;
  const current = items.find((item) =>
    item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href)
  );

  function toggleSidebar() {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'expanded');
      return next;
    });
  }

  function signOut() {
    logout();
    router.replace('/login');
  }

  return (
    <div className={`admin-shell ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed ? <div className="overlay sidebar-dim" onClick={() => setCollapsed(true)} aria-hidden /> : null}

      <aside className="sidebar" aria-label="Admin navigation">
        <div className="sidebar-head">
            <Link href="/" className="sidebar-brand" prefetch scroll={false} onClick={() => {
              begin('/');
              if (window.matchMedia('(max-width: 1080px)').matches) setCollapsed(true);
            }}>
            <Image src="/images/brand/logo.avif" alt="LifeWell" width={354} height={63} className="sidebar-logo" />
            <span>Control Center</span>
          </Link>
          <button
            type="button"
            className="icon-btn sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            aria-pressed={collapsed}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => {
            const groupItems = items.filter((item) => (group.hrefs as readonly string[]).includes(item.href));
            if (!groupItems.length) return null;
            return (
              <div key={group.label ?? 'overview'} className="nav-group">
                {group.label ? <p className="nav-group-label">{group.label}</p> : null}
                {groupItems.map((item) => {
                  const active = item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href);
                  const Icon = NAV_ICONS[item.icon];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      scroll={false}
                      title={item.label}
                      className={`nav-link ${active ? 'active' : ''}`}
                      onMouseEnter={() => router.prefetch(item.href)}
                      onFocus={() => router.prefetch(item.href)}
                      onClick={() => {
                        begin(item.href);
                        if (window.matchMedia('(max-width: 1080px)').matches) setCollapsed(true);
                      }}
                    >
                      <Icon size={18} strokeWidth={1.85} aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div className="sidebar-user-meta">
            <strong>{user.name}</strong>
            <span>{user.role === 'super_admin' ? 'Super Admin' : 'Staff'}</span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-btn topbar-menu"
              aria-label="Open menu"
              onClick={() => setCollapsed(false)}
            >
              <Menu size={20} />
            </button>
            {pathname !== '/' ? (
              <button
                type="button"
                className="icon-btn"
                aria-label="Go back"
                onClick={() => router.back()}
              >
                <ArrowLeft size={18} />
              </button>
            ) : null}
            <div>
              <strong>{current?.label ?? 'Website Control Center'}</strong>
              <span className="muted topbar-sub">Website operations · never clinical charts</span>
            </div>
          </div>
          <div className="topbar-actions">
            <NotificationBell />
            <a
              className="btn btn-ghost"
              href={process.env.NEXT_PUBLIC_SITE_URL || 'https://lifewellfhp-client.vercel.app'}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} />
              <span className="btn-label">View site</span>
            </a>
            <button type="button" className="btn btn-ghost" onClick={signOut}>
              <LogOut size={16} />
              <span className="btn-label">Sign out</span>
            </button>
          </div>
        </header>
        <div className="content" ref={mainRef}>
          <NavOverlay />
          <div className="content-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
