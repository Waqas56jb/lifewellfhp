'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Dash = {
  newLeads: number;
  services: number;
  posts: number;
  testimonials: number;
  faqs: number;
  media: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api<Dash>('/api/admin/dashboard').then((res) => {
      if (!res.success) setError(res.message || 'Could not load dashboard');
      else setData(res.data || null);
    });
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">
        Manage website content, leads, media, and marketing without developer help.
      </p>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="grid-stats" style={{ marginBottom: '1rem' }}>
        {[
          { label: 'New leads', value: data?.newLeads, href: '/leads' },
          { label: 'Services', value: data?.services, href: '/services' },
          { label: 'Blog posts', value: data?.posts, href: '/blog' },
          { label: 'Reviews', value: data?.testimonials, href: '/testimonials' },
          { label: 'FAQs', value: data?.faqs, href: '/faqs' },
          { label: 'Media', value: data?.media, href: '/media' },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="card stat">
            <div className="label">{s.label}</div>
            <div className="value">{s.value ?? '—'}</div>
          </Link>
        ))}
      </div>

      <div className="card card-pad">
        <h2 style={{ marginTop: 0 }}>Privacy reminder</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          This admin panel is for website operations only. Ask patients not to send clinical details
          through contact forms. Analytics store page paths and devices — not names, emails, or
          message content.
        </p>
      </div>
    </div>
  );
}
