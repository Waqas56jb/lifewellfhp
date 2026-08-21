'use client';

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { PageLoader } from '@/components/PageLoader';

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

  useEffect(() => {
    document.body.style.overflow = editing ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [editing]);

  const isEdit = Boolean(editing?.id);

  function openCreate() {
    setEditing({});
    const next = { ...createDefaults };
    for (const field of fields) {
      if (field.type === 'json' && next[field.key] != null && typeof next[field.key] !== 'string') {
        next[field.key] = JSON.stringify(next[field.key], null, 2);
      }
    }
    setForm(next);
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
          if (typeof value === 'string') {
            value = value.trim() ? JSON.parse(value) : {};
          } else if (value == null) {
            value = {};
          }
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
          <Plus size={16} />
          Add new
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="card">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap desktop-only">
          {empty ? (
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
                    <td className="row-actions">
                      <button type="button" className="btn btn-ghost" onClick={() => openEdit(row)}>
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => onDelete(String(row.id))}>
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mobile-cards">
          {empty ? (
            <div className="empty">No items yet. Add the first one.</div>
          ) : (
            rows.map((row) => (
              <article key={String(row.id)} className="mobile-card">
                {columns.slice(0, 4).map((c) => (
                  <div key={c.key} className="mobile-card-row">
                    <span>{c.label}</span>
                    <strong>{c.render ? c.render(row) : String(row[c.key] ?? '—')}</strong>
                  </div>
                ))}
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => openEdit(row)}>
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(String(row.id))}>
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
          </>
        )}
      </div>

      {editing ? (
        <div className="overlay modal-overlay">
          <form className="card card-pad modal-card" onSubmit={onSubmit}>
            <div className="modal-head">
              <h2>{isEdit ? 'Edit item' : 'Create item'}</h2>
              <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
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
                    <label className="check-label">
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
            <div className="modal-actions">
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
