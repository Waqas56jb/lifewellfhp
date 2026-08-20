'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { NAV_ITEMS } from '@/lib/nav';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'staff';
  permissions: string[];
  active: boolean;
};

const MODULES = Array.from(new Set(NAV_ITEMS.map((n) => n.module)));

export default function UsersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' as 'super_admin' | 'staff',
    permissions: [] as string[],
    active: true,
  });

  async function load() {
    const res = await api<UserRow[]>('/api/admin/users');
    if (!res.success) setError(res.message || 'Failed to load users');
    else setRows(res.data || []);
  }

  useEffect(() => {
    void load();
  }, []);

  if (user?.role !== 'super_admin') {
    return (
      <div className="card card-pad">
        <h1 className="page-title">Staff & access</h1>
        <p className="muted">Only Super Admins can manage staff accounts.</p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    if (!res.success) setError(res.message || 'Create failed');
    else {
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'staff', permissions: [], active: true });
      await load();
    }
  }

  async function toggleActive(row: UserRow) {
    const res = await api(`/api/admin/users/${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !row.active }),
    });
    if (!res.success) setError(res.message || 'Update failed');
    else await load();
  }

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Staff & access</h1>
          <p className="page-sub">Super Admin and staff accounts with module permissions.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          Add staff
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td>
                    <span className={`badge ${row.active ? 'ok' : 'danger'}`}>
                      {row.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost" onClick={() => toggleActive(row)}>
                      {row.active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <div className="overlay" style={{ display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <form className="card card-pad" style={{ width: 'min(640px, 100%)' }} onSubmit={onSubmit}>
            <h2 style={{ marginTop: 0 }}>New staff account</h2>
            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Temporary password</label>
              <input
                type="password"
                required
                minLength={10}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'super_admin' | 'staff' })}
              >
                <option value="staff">Staff</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            {form.role === 'staff' ? (
              <div className="field">
                <label>Module permissions</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                  {MODULES.map((m) => {
                    const checked = form.permissions.includes(m);
                    return (
                      <label key={m} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setForm({
                              ...form,
                              permissions: e.target.checked
                                ? [...form.permissions, m]
                                : form.permissions.filter((p) => p !== m),
                            });
                          }}
                        />
                        {m}
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
