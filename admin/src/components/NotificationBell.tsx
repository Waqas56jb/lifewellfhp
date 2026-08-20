'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useNavUi } from './NavProgress';

type Notice = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  href?: string | null;
  unread: boolean;
  created_at: string;
};

function playChime() {
  try {
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Sound is optional.
  }
}

export function NotificationBell() {
  const { begin } = useNavUi();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const knownUnread = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  async function load(play = false) {
    const res = await api<Notice[]>('/api/admin/notifications');
    if (!res.success) return;
    const next = res.data || [];
    const nextUnread = next.filter((row) => row.unread).length;
    if (play && knownUnread.current !== null && nextUnread > knownUnread.current) {
      playChime();
    }
    knownUnread.current = nextUnread;
    setRows(next);
    setUnread(nextUnread);
  }

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => void load(true), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function markAll() {
    const ids = rows.filter((row) => row.unread).map((row) => row.id);
    if (!ids.length) return;
    await api('/api/admin/notifications/read', {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    });
    await load(false);
  }

  return (
    <div className="notif-wrap" ref={boxRef}>
      <button
        type="button"
        className="icon-btn notif-btn"
        aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void markAll();
        }}
      >
        <Bell size={18} />
        {unread ? <span className="notif-dot">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      {open ? (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-head">
            <strong>Notifications</strong>
            <button type="button" className="btn btn-ghost" onClick={() => void markAll()}>
              Mark read
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="muted notif-empty">No notifications yet.</p>
          ) : (
            <ul className="notif-list">
              {rows.slice(0, 20).map((row) => (
                <li key={row.id} className={row.unread ? 'unread' : undefined}>
                  {row.href ? (
                    <Link href={row.href} prefetch scroll={false} onClick={() => begin(row.href || '/')}>
                      <strong>{row.title}</strong>
                      {row.body ? <span>{row.body}</span> : null}
                      <em>{new Date(row.created_at).toLocaleString()}</em>
                    </Link>
                  ) : (
                    <div>
                      <strong>{row.title}</strong>
                      {row.body ? <span>{row.body}</span> : null}
                      <em>{new Date(row.created_at).toLocaleString()}</em>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
