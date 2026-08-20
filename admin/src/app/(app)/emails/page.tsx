'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Inbox, Mail, Reply, Send, X } from 'lucide-react';
import { api } from '@/lib/api';

type EmailRow = {
  id: string;
  direction?: 'inbound' | 'outbound';
  from_email?: string | null;
  from_name?: string | null;
  to_email: string;
  to_name?: string | null;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  error?: string | null;
  sent_by?: string | null;
  sent_by_email?: string | null;
  created_at: string;
};

type MailConfig = {
  configured: boolean;
  from: string;
  smtp_user: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  inbox: string;
};

type Tab = 'inbox' | 'sent' | 'compose';

function isInbound(row: EmailRow) {
  if (row.direction) return row.direction === 'inbound';
  return !row.sent_by;
}

export default function EmailsPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const [rows, setRows] = useState<EmailRow[]>([]);
  const [config, setConfig] = useState<MailConfig | null>(null);
  const [inbox, setInbox] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selected, setSelected] = useState<EmailRow | null>(null);

  async function load() {
    const direction = tab === 'compose' ? '' : tab === 'inbox' ? 'inbound' : 'outbound';
    const query = direction ? `?direction=${direction}` : '';
    const [mail, cfg] = await Promise.all([
      api<EmailRow[]>(`/api/admin/emails${query}`),
      api<MailConfig>('/api/admin/emails/config'),
    ]);
    if (!mail.success) setError(mail.message || 'Failed to load emails');
    else {
      setError(null);
      setRows(mail.data || []);
    }
    if (cfg.success && cfg.data) {
      setConfig(cfg.data);
      setInbox(cfg.data.inbox);
    }
  }

  useEffect(() => {
    void load();
  }, [tab]);

  async function saveInbox(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await api('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ inbox_email: inbox }),
    });
    setSaving(false);
    if (!res.success) setError(res.message || 'Could not save inbox address');
    else setMessage('Inbox address saved. New website enquiries will be delivered here and listed below.');
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const recipients = to
      .split(/[,;\s]+/)
      .map((value) => value.trim())
      .filter(Boolean)
      .map((email) => ({ email }));
    if (!recipients.length) {
      setError('Add at least one email address.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await api<{ email: string; status: string }[]>('/api/admin/emails/send', {
      method: 'POST',
      body: JSON.stringify({ to: recipients, subject, body }),
    });
    setSaving(false);
    if (!res.success) {
      setError(res.message || 'Send failed');
      return;
    }
    const failed = (res.data || []).filter((row) => row.status === 'failed').length;
    setMessage(failed ? `Sent with ${failed} failure(s). Check Sent.` : 'Email sent from noreply@lifewellfhp.com.');
    setSubject('');
    setBody('');
    setTab('sent');
  }

  function replyTo(row: EmailRow) {
    const address = row.from_email || (isInbound(row) ? row.sent_by_email || row.to_email : row.to_email);
    setTo(address || '');
    setSubject(row.subject.startsWith('Re:') ? row.subject : `Re: ${row.subject}`);
    setBody(`\n\n--- Original message ---\n${row.body}`);
    setSelected(null);
    setTab('compose');
  }

  const visible = rows.filter((row) => (tab === 'inbox' ? isInbound(row) : !isInbound(row)));

  return (
    <div>
      <h1 className="page-title">Emails</h1>
      <p className="page-sub">
        Website enquiries are sent from the dedicated mailbox and also stored here. Reply or compose from this page.
        Do not include clinical details.
      </p>
      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="ok-banner">{message}</div> : null}

      <div className="card card-pad" style={{ marginBottom: '1rem' }}>
        <p className="muted" style={{ marginTop: 0 }}>
          Sender (SMTP): <strong>{config?.from || 'LifeWell Family Health & Psychiatry <noreply@lifewellfhp.com>'}</strong>
          {config?.configured ? <span className="badge ok" style={{ marginLeft: '0.5rem' }}>Connected</span> : <span className="badge warn" style={{ marginLeft: '0.5rem' }}>Not connected</span>}
        </p>
        <form className="filter-bar" onSubmit={saveInbox} style={{ marginBottom: 0 }}>
          <label htmlFor="inbox" className="muted">Receive website enquiries at</label>
          <input
            id="inbox"
            type="email"
            value={inbox}
            onChange={(e) => setInbox(e.target.value)}
            placeholder="noreply@lifewellfhp.com"
            required
            style={{ minWidth: '240px' }}
          />
          <button type="submit" className="btn btn-ghost" disabled={saving}>
            Save inbox
          </button>
        </form>
      </div>

      <div className="filter-bar">
        <button type="button" className={`btn ${tab === 'inbox' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('inbox')}>
          <Inbox size={16} />
          Inbox
        </button>
        <button type="button" className={`btn ${tab === 'sent' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('sent')}>
          <Mail size={16} />
          Sent
        </button>
        <button type="button" className={`btn ${tab === 'compose' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('compose')}>
          <Send size={16} />
          Compose
        </button>
      </div>

      {tab === 'compose' ? (
        <form className="card card-pad" onSubmit={onSend}>
          <div className="field">
            <label htmlFor="to">To</label>
            <input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@email.com" required />
          </div>
          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="body">Message</label>
            <textarea id="body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Send size={16} />
            {saving ? 'Sending…' : 'Send from noreply@lifewellfhp.com'}
          </button>
        </form>
      ) : (
        <div className="card">
          <div className="table-wrap desktop-only">
            {visible.length === 0 ? (
              <div className="empty">
                <Mail size={22} />
                <p>{tab === 'inbox' ? 'No received website emails yet.' : 'No sent emails yet.'}</p>
              </div>
            ) : (
              <table className="data">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>{tab === 'inbox' ? 'From' : 'To'}</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.id}>
                      <td>{new Date(row.created_at).toLocaleString()}</td>
                      <td>
                        {tab === 'inbox' ? (
                          <>
                            <div>{row.from_name || row.from_email || row.sent_by_email || row.to_name || '—'}</div>
                            <div className="muted">{row.from_email || row.sent_by_email || row.to_email}</div>
                          </>
                        ) : (
                          <>
                            <div>{row.to_name || row.to_email}</div>
                            {row.to_name ? <div className="muted">{row.to_email}</div> : null}
                          </>
                        )}
                      </td>
                      <td>{row.subject}</td>
                      <td>
                        <span className={`badge ${row.status === 'sent' ? 'ok' : 'warn'}`}>
                          {tab === 'inbox' ? (row.status === 'sent' ? 'Received' : 'Failed') : row.status}
                        </span>
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
            )}
          </div>
          <div className="mobile-cards">
            {visible.map((row) => (
              <article key={row.id} className="mobile-card">
                <div className="mobile-card-row">
                  <span>{tab === 'inbox' ? 'From' : 'To'}</span>
                  <strong>{tab === 'inbox' ? row.from_email || row.to_email : row.to_email}</strong>
                </div>
                <div className="mobile-card-row">
                  <span>Subject</span>
                  <strong>{row.subject}</strong>
                </div>
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setSelected(row)}>
                    Open
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {selected ? (
        <div className="overlay modal-overlay">
          <div className="card card-pad modal-card">
            <div className="modal-head">
              <h2>{selected.subject}</h2>
              <button type="button" className="icon-btn" onClick={() => setSelected(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="muted">
              {isInbound(selected) ? 'From' : 'To'}: {isInbound(selected) ? selected.from_email || selected.to_email : selected.to_email}
            </p>
            <div className="card card-pad inquiry-body" style={{ whiteSpace: 'pre-wrap' }}>
              {selected.body}
            </div>
            <div className="row-actions" style={{ marginTop: '1rem' }}>
              {isInbound(selected) ? (
                <button type="button" className="btn btn-primary" onClick={() => replyTo(selected)}>
                  <Reply size={16} />
                  Reply
                </button>
              ) : null}
              <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
