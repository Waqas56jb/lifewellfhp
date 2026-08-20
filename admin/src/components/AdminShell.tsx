'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { NAV_ITEMS } from '@/lib/nav';

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, can, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="login-wrap">
        <p className="muted">Loading admin…</p>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    return null;
  }

  const items = NAV_ITEMS.filter((item) => can(item.module));

  return (
    <div className="admin-shell">
      {open ? <div className="overlay" onClick={() => setOpen(false)} aria-hidden /> : null}
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="sidebar-brand">
          <strong>LifeWell Admin</strong>
          <span>Family Health & Psychiatry</span>
        </div>
        <nav style={{ display: 'grid', gap: '0.2rem', flex: 1 }}>
          {items.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '0.5rem 0.75rem', opacity: 0.85, fontSize: '0.85rem' }}>
          <div>{user.name}</div>
          <div className="muted" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {user.role === 'super_admin' ? 'Super Admin' : 'Staff'}
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-ghost menu-btn"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              Menu
            </button>
            <div>
              <strong style={{ display: 'block' }}>Website Control Center</strong>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                Privacy-focused · no clinical charting
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              className="btn btn-ghost"
              href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
              target="_blank"
              rel="noreferrer"
            >
              View site
            </a>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
