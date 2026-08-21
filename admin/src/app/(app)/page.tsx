'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  HeartPulse,
  Inbox,
  MessageCircleQuestion,
  Shield,
  Star,
  Activity,
  Download,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Sparkline } from '@/components/charts';

type LeadRow = {
  id: string;
  type: string;
  name?: string;
  email?: string;
  status: string;
  created_at: string;
};

type LogRow = {
  id: string;
  actor_name?: string;
  actor_email?: string;
  action: string;
  summary: string;
  created_at: string;
};

type Dash = {
  newLeads: number;
  services: number;
  testimonials: number;
  faqs: number;
  insurance: number;
  views7d: number;
  conversions7d: number;
  trend: { date: string; views: number }[];
  recentLeads: LeadRow[];
  recentLogs: LogRow[];
};

const KPIS = [
  { label: 'New leads', key: 'newLeads', href: '/leads', icon: Inbox, hint: 'Waiting in inbox' },
  { label: 'Visits · 7 days', key: 'views7d', href: '/analytics', icon: Activity, hint: 'Public site traffic' },
  { label: 'Booking clicks', key: 'conversions7d', href: '/analytics', icon: CalendarDays, hint: 'Last 7 days' },
  { label: 'Services', key: 'services', href: '/services', icon: HeartPulse, hint: 'Live treatment areas' },
  { label: 'Insurance plans', key: 'insurance', href: '/insurance', icon: Shield, hint: 'Shown on fees page' },
  { label: 'Reviews', key: 'testimonials', href: '/testimonials', icon: Star, hint: 'Published quotes' },
] as const;

function greeting(name: string) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = name.split(' ')[0] || name;
  return `${hello}, ${first}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const autoImported = useRef(false);

  async function loadDash() {
    const res = await api<Dash>('/api/admin/dashboard');
    if (!res.success) setError(res.message || 'Could not load dashboard');
    else setData(res.data || null);
  }

  useEffect(() => {
    void loadDash();
  }, []);

  useEffect(() => {
    if (user?.role !== 'super_admin' || !data || autoImported.current) return;
    if ((data.services || 0) > 0 || (data.faqs || 0) > 0) return;
    autoImported.current = true;
    void importLive();
  }, [data, user?.role]);

  async function importLive() {
    setImporting(true);
    setError(null);
    setImportMessage(null);
    const res = await api('/api/admin/content/import-live', { method: 'POST' });
    setImporting(false);
    if (!res.success) setError(res.message || 'Import failed');
    else {
      setImportMessage(res.message || 'Live website content is now in the admin panel.');
      await loadDash();
    }
  }

  const spark = useMemo(() => (data?.trend || []).map((d) => d.views), [data]);

  return (
    <div className="dash">
      <div className="dash-hero">
        <div>
          <p className="dash-kicker">Control center</p>
          <h1 className="page-title">{greeting(user?.name || 'there')}</h1>
          <p className="page-sub">Website operations for LifeWell — never clinical charts.</p>
          {user?.role === 'super_admin' ? (
            <button type="button" className="btn btn-primary" style={{ marginTop: '0.85rem' }} onClick={() => void importLive()} disabled={importing}>
              <Download size={16} />
              {importing ? 'Loading live pages…' : 'Load live website content'}
            </button>
          ) : null}
        </div>
        <div className="dash-hero-card">
          <span>Traffic this week</span>
          <strong>{data?.views7d ?? '—'}</strong>
          <Sparkline values={spark} color="#ffffff" />
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}
      {importMessage ? <div className="ok-banner">{importMessage}</div> : null}

      <div className="kpi-grid">
        {KPIS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} prefetch className="kpi-card">
              <div className="kpi-top">
                <span className="stat-icon">
                  <Icon size={18} />
                </span>
                <ArrowUpRight size={16} />
              </div>
              <div className="kpi-value">{data?.[s.key] ?? '—'}</div>
              <div className="kpi-label">{s.label}</div>
              <div className="kpi-hint">{s.hint}</div>
            </Link>
          );
        })}
      </div>

      <div className="dash-split">
        <section className="card card-pad">
          <div className="section-head">
            <h2>Latest inquiries</h2>
            <Link href="/leads" className="text-link">
              Open inbox
            </Link>
          </div>
          {(data?.recentLeads || []).length === 0 ? (
            <p className="muted">No inquiries yet.</p>
          ) : (
            <ul className="activity-list">
              {(data?.recentLeads || []).map((row) => (
                <li key={row.id}>
                  <span className={`badge ${row.status === 'new' ? 'warn' : 'ok'}`}>{row.type}</span>
                  <div>
                    <strong>{row.name || row.email || 'Anonymous'}</strong>
                    <span>{row.email}</span>
                  </div>
                  <em>{timeAgo(row.created_at)}</em>
                </li>
              ))}
            </ul>
          )}
        </section>

        {user?.role === 'super_admin' ? (
          <section className="card card-pad">
            <div className="section-head">
              <h2>Staff activity</h2>
              <Link href="/logs" className="text-link">
                Full audit log
              </Link>
            </div>
            {(data?.recentLogs || []).length === 0 ? (
              <p className="muted">Actions will appear here as your team edits the site.</p>
            ) : (
              <ul className="activity-list">
                {(data?.recentLogs || []).map((row) => (
                  <li key={row.id}>
                    <span className="badge">{row.action}</span>
                    <div>
                      <strong>{row.actor_name || row.actor_email || 'Staff'}</strong>
                      <span>{row.summary}</span>
                    </div>
                    <em>{timeAgo(row.created_at)}</em>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="card card-pad dash-note">
            <div className="stat-icon">
              <MessageCircleQuestion size={18} />
            </div>
            <div>
              <h2>Need a change you cannot see?</h2>
              <p className="muted">Staff accounts can edit assigned website modules. Account access stays with Super Admin.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
