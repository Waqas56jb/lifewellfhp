'use client';

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'url' | 'json';
  options?: { value: string; label: string }[];
  full?: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  endpoint: string;
  columns: { key: string; label: string; render?: (row: Record<string, unknown>) => ReactNode }[];
  fields: Field[];
  createDefaults?: Record<string, unknown>;
};

export function ResourceManager({ title, subtitle, endpoint, columns, fields, createDefaults = {} }: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(createDefaults);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await api<Record<string, unknown>[]>(endpoint);
    if (!res.success) setError(res.message || 'Failed to load');
    else {
      setError(null);
      setRows(res.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [endpoint]);

  const isEdit = Boolean(editing?.id);

  function openCreate() {
    setEditing({});
    setForm({ ...createDefaults });
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    const next = { ...row };
    for (const field of fields) {
      if (field.type === 'json' && next[field.key] != null && typeof next[field.key] !== 'string') {
        next[field.key] = JSON.stringify(next[field.key], null, 2);
      }
    }
    setForm(next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body: Record<string, unknown> = {};
    for (const field of fields) {
      let value = form[field.key];
      if (field.type === 'checkbox') value = Boolean(value);
      if (field.type === 'number') value = value === '' || value == null ? null : Number(value);
      if (field.type === 'json') {
        try {
          value = typeof value === 'string' && value.trim() ? JSON.parse(value) : {};
        } catch {
          setSaving(false);
          setError(`Invalid JSON in ${field.label}`);
          return;
        }
      }
      body[field.key] = value;
    }

    const res = isEdit
      ? await api(`${endpoint}/${editing?.id}`, { method: 'PATCH', body: JSON.stringify(body) })
      : await api(endpoint, { method: 'POST', body: JSON.stringify(body) });

    setSaving(false);
    if (!res.success) {
      setError(res.message || 'Save failed');
      return;
    }
    setEditing(null);
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this item?')) return;
    const res = await api(`${endpoint}/${id}`, { method: 'DELETE' });
    if (!res.success) setError(res.message || 'Delete failed');
    else await load();
  }

  const empty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{subtitle}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add new
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="empty">Loading…</div>
          ) : empty ? (
            <div className="empty">No items yet. Add the first one.</div>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id)}>
                    {columns.map((c) => (
                      <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '—')}</td>
                    ))}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => openEdit(row)}>
                        Edit
                      </button>{' '}
                      <button type="button" className="btn btn-danger" onClick={() => onDelete(String(row.id))}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing ? (
        <div className="overlay" style={{ display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <form className="card card-pad" style={{ width: 'min(720px, 100%)', maxHeight: '90dvh', overflow: 'auto' }} onSubmit={onSubmit}>
            <h2 style={{ marginTop: 0 }}>{isEdit ? 'Edit item' : 'Create item'}</h2>
            <div className="form-grid two">
              {fields.map((field) => (
                <div className="field" key={field.key} style={field.full ? { gridColumn: '1 / -1' } : undefined}>
                  <label htmlFor={field.key}>{field.label}</label>
                  {field.type === 'textarea' || field.type === 'json' ? (
                    <textarea
                      id={field.key}
                      value={String(form[field.key] ?? (field.type === 'json' ? '{}' : ''))}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    />
                  ) : field.type === 'checkbox' ? (
                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 500 }}>
                      <input
                        id={field.key}
                        type="checkbox"
                        checked={Boolean(form[field.key])}
                        onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.checked }))}
                      />
                      Enabled
                    </label>
                  ) : field.type === 'select' ? (
                    <select
                      id={field.key}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    >
                      {(field.options || []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
