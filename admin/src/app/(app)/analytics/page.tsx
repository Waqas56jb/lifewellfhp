'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Summary = {
  rangeDays: number;
  totals: { pageViews: number; sessions: number; conversions: number };
  popularPages: { path: string; views: number }[];
  devices: Record<string, number>;
  trafficSources: { source: string; visits: number }[];
  trends: { date: string; views: number }[];
  conversionCounts: Record<string, number>;
  integrations: { googleAnalytics: boolean; searchConsole: boolean };
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api<Summary>('/api/admin/analytics/summary').then((res) => {
      if (!res.success) setError(res.message || 'Failed to load analytics');
      else setData(res.data || null);
    });
  }, []);

  return (
    <div>
      <h1 className="page-title">Visitor analytics</h1>
      <p className="page-sub">
        Last {data?.rangeDays ?? 30} days · privacy-focused events only (paths, devices, referrers).
        No patient names or form message bodies are stored in analytics.
      </p>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="grid-stats" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <div className="label">Page views</div>
          <div className="value">{data?.totals.pageViews ?? '—'}</div>
        </div>
        <div className="card stat">
          <div className="label">Sessions</div>
          <div className="value">{data?.totals.sessions ?? '—'}</div>
        </div>
        <div className="card stat">
          <div className="label">Conversions</div>
          <div className="value">{data?.totals.conversions ?? '—'}</div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Integrations</h2>
        <p>
          Google Analytics 4:{' '}
          <strong>{process.env.NEXT_PUBLIC_GA4_ID || 'not set'}</strong>
        </p>
        <p style={{ marginBottom: 0 }}>
          Search Console site:{' '}
          <strong>{process.env.NEXT_PUBLIC_SEARCH_CONSOLE_SITE || 'not set'}</strong>
        </p>
        <p className="muted">
          GA4 runs on the public site. Search Console is verified at the domain level; this panel
          surfaces the configured property for staff reference.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-pad">
          <h2 style={{ marginTop: 0 }}>Popular pages</h2>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Path</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {(data?.popularPages || []).map((p) => (
                <tr key={p.path}>
                  <td>{p.path}</td>
                  <td>{p.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.popularPages?.length ? <div className="empty">No page views yet.</div> : null}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-pad">
          <h2 style={{ marginTop: 0 }}>Traffic sources</h2>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Source</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              {(data?.trafficSources || []).map((p) => (
                <tr key={p.source}>
                  <td>{p.source}</td>
                  <td>{p.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-pad">
        <h2 style={{ marginTop: 0 }}>Devices</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          {Object.entries(data?.devices || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ') || 'No device data yet.'}
        </p>
        <h3>Conversion tracking</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          {Object.entries(data?.conversionCounts || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ') || 'No conversions yet (contact / newsletter / booking clicks).'}
        </p>
      </div>
    </div>
  );
}
