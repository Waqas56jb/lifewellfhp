'use client';

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Eye, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { PageLoader } from '@/components/PageLoader';
import { PreviewShell } from '@/components/PreviewShell';

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'url' | 'json';
  options?: { value: string; label: string }[];
  full?: boolean;
};

type PreviewConfig = {
  render: (form: Record<string, unknown>, rows: Record<string, unknown>[]) => ReactNode;
  liveHref?: (row: Record<string, unknown>) => string | null;
  hint?: string;
};

type Props = {
  title: string;
  subtitle: string;
  endpoint: string;
  columns: { key: string; label: string; render?: (row: Record<string, unknown>) => ReactNode }[];
  fields: Field[];
  createDefaults?: Record<string, unknown>;
  preview?: PreviewConfig;
  itemLabel?: (row: Record<string, unknown>) => string;
};

export function ResourceManager({
  title,
  subtitle,
  endpoint,
  columns,
  fields,
  createDefaults = {},
  preview,
  itemLabel,
}: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(createDefaults);
  const [saving, setSaving] = useState(false);
  const [previewRow, setPreviewRow] = useState<Record<string, unknown> | null>(null);

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
    document.body.style.overflow = editing || previewRow ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [editing, previewRow]);

  const isEdit = Boolean(editing?.id);

  function labelOf(row: Record<string, unknown>) {
    if (itemLabel) return itemLabel(row);
    return String(row.title || row.question || row.name || row.path || 'this item');
  }

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
    if ((next.image_url == null || next.image_url === '') && typeof next.icon === 'string' && next.icon) {
      next.image_url = next.icon;
    }
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

    if (fields.some((field) => field.key === 'image_url') && body.image_url) {
      body.icon = body.image_url;
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

  async function onDelete(row: Record<string, unknown>) {
    const name = labelOf(row);
    if (!confirm(`Delete “${name}”? Visitors will no longer see it on the website after this.`)) return;
    const res = await api(`${endpoint}/${row.id}`, { method: 'DELETE' });
    if (!res.success) setError(res.message || 'Delete failed');
    else await load();
  }

  const empty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  function ActionButtons({ row }: { row: Record<string, unknown> }) {
    return (
      <div className="row-actions">
        {preview ? (
          <button type="button" className="btn btn-ghost" onClick={() => setPreviewRow(row)}>
            <Eye size={15} />
            Preview
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={() => openEdit(row)}>
          <Pencil size={15} />
          Edit
        </button>
        <button type="button" className="btn btn-danger" onClick={() => onDelete(row)}>
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    );
  }

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
                        <td>
                          <ActionButtons row={row} />
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
                    <ActionButtons row={row} />
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {editing ? (
        <div className="overlay modal-overlay">
          <form className={`card card-pad modal-card ${preview ? 'modal-card-split' : ''}`} onSubmit={onSubmit}>
            <div className="modal-head">
              <h2>{isEdit ? `Edit ${labelOf(form)}` : 'Create item'}</h2>
              <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className={preview ? 'split-edit' : undefined}>
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
              {preview ? (
                <aside className="live-preview-pane">
                  <p className="preview-kicker">Live preview</p>
                  <p className="preview-hint">{preview.hint || 'Updates as you type. Visitors see this only after Save.'}</p>
                  {preview.render(form, rows)}
                </aside>
              ) : null}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save to website'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {preview && previewRow ? (
        <PreviewShell
          title={labelOf(previewRow)}
          hint={preview.hint}
          livePath={preview.liveHref?.(previewRow)}
          onClose={() => setPreviewRow(null)}
        >
          {preview.render(previewRow, rows)}
        </PreviewShell>
      ) : null}
    </div>
  );
}
