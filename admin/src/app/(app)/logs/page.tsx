'use client';

import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type LogRow = {
  id: string;
  actor_email?: string | null;
  actor_name?: string | null;
  action: string;
  resource: string;
  summary: string;
  created_at: string;
};

export default function LogsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'super_admin') return;
    void api<LogRow[]>('/api/admin/audit-logs').then((res) => {
      if (!res.success) setError(res.message || 'Could not load audit log');
      else setRows(res.data || []);
    });
  }, [user?.role]);

  if (user?.role !== 'super_admin') {
    return (
      <div className="card card-pad">
        <h1 className="page-title">Audit log</h1>
        <p className="muted">Only the Super Admin can view who changed what in this panel.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Audit log</h1>
      <p className="page-sub">Every staff action on the website CMS. Passwords and clinical content are never stored here.</p>
      {error ? <div className="error-banner">{error}</div> : null}

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            <ScrollText size={22} />
            <p>No activity yet. Edits, logins, and account changes will appear here.</p>
          </div>
        ) : (
          <ul className="log-list">
            {rows.map((row) => (
              <li key={row.id}>
                <div className="log-when">{new Date(row.created_at).toLocaleString()}</div>
                <div>
                  <strong>{row.actor_name || row.actor_email || 'System'}</strong>
                  <span className="muted">{row.summary}</span>
                </div>
                <span className="badge">{row.action}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
