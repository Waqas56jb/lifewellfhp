'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Lead = {
  id: string;
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  status: string;
  reference_id?: string;
  created_at: string;
};

export default function LeadsPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);

  async function load() {
    const res = await api<Lead[]>('/api/admin/leads');
    if (!res.success) setError(res.message || 'Failed to load leads');
    else setRows(res.data || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: string) {
    const res = await api(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.success) setError(res.message || 'Update failed');
    else {
      await load();
      if (selected?.id === id) setSelected({ ...selected, status });
    }
  }

  return (
    <div>
      <h1 className="page-title">Leads & inquiries</h1>
      <p className="page-sub">
        Contact forms, support requests, and newsletter signups. Treat messages as sensitive —
        avoid copying clinical content into other tools.
      </p>
      {error ? <div className="error-banner">{error}</div> : null}

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>When</th>
                <th>Type</th>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td>
                    <span className="badge">{row.type}</span>
                  </td>
                  <td>
                    <div>{row.name || '—'}</div>
                    <div className="muted">{row.email}</div>
                  </td>
                  <td>{row.subject || '—'}</td>
                  <td>
                    <span className={`badge ${row.status === 'new' ? 'warn' : 'ok'}`}>{row.status}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost" onClick={() => setSelected(row)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <div className="empty">No leads yet.</div> : null}
        </div>
      </div>

      {selected ? (
        <div className="overlay" style={{ display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div className="card card-pad" style={{ width: 'min(720px, 100%)' }}>
            <h2 style={{ marginTop: 0 }}>Inquiry {selected.reference_id || ''}</h2>
            <p>
              <strong>{selected.name}</strong> · {selected.email} · {selected.phone || 'no phone'}
            </p>
            <p className="muted">{selected.subject}</p>
            <div className="card card-pad" style={{ background: '#f8fafc', boxShadow: 'none' }}>
              {selected.message || '—'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {['new', 'open', 'replied', 'closed', 'spam'].map((s) => (
                <button key={s} type="button" className="btn btn-ghost" onClick={() => setStatus(selected.id, s)}>
                  Mark {s}
                </button>
              ))}
              <button type="button" className="btn btn-primary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
