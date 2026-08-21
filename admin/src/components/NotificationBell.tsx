'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
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

const MOBILE_MQ = '(max-width: 760px)';

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
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 12 });
  const [rows, setRows] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const knownUnread = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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
    setMounted(true);
    void load(false);
    const timer = window.setInterval(() => void load(true), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const compact = window.matchMedia(MOBILE_MQ).matches;
      setMobile(compact);
      if (compact) return;
      const btn = btnRef.current?.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 16);
      const btnRight = btn?.right ?? window.innerWidth - 12;
      const right = Math.max(8, Math.min(window.innerWidth - width - 8, window.innerWidth - btnRight));
      setAnchor({
        top: Math.min((btn?.bottom ?? 56) + 8, window.innerHeight - 24),
        right,
      });
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (boxRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function markAll() {
    const ids = rows.filter((row) => row.unread).map((row) => row.id);
    if (!ids.length) return;
    await api('/api/admin/notifications/read', {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    });
    await load(false);
  }

  function close() {
    setOpen(false);
  }

  const panel =
    mounted && open
      ? createPortal(
          <>
            {mobile ? (
              <button type="button" className="notif-backdrop" aria-label="Close notifications" onClick={close} />
            ) : null}
            <div
              ref={panelRef}
              className="notif-panel"
              role="dialog"
              aria-modal={mobile ? true : undefined}
              aria-label="Notifications"
              style={mobile ? undefined : { top: anchor.top, right: anchor.right }}
            >
              <div className="notif-head">
                <strong>Notifications</strong>
                <div className="notif-head-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => void markAll()}>
                    Mark read
                  </button>
                  <button type="button" className="icon-btn notif-close" aria-label="Close notifications" onClick={close}>
                    <X size={18} />
                  </button>
                </div>
              </div>
              {rows.length === 0 ? (
                <p className="muted notif-empty">No notifications yet.</p>
              ) : (
                <ul className="notif-list">
                  {rows.slice(0, 20).map((row) => (
                    <li key={row.id} className={row.unread ? 'unread' : undefined}>
                      {row.href ? (
                        <Link
                          href={row.href}
                          prefetch
                          scroll={false}
                          onClick={() => {
                            begin(row.href || '/');
                            close();
                          }}
                        >
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
          </>,
          document.body
        )
      : null;

  return (
    <div className="notif-wrap" ref={boxRef}>
      <button
        ref={btnRef}
        type="button"
        className="icon-btn notif-btn"
        aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void markAll();
        }}
      >
        <Bell size={18} />
        {unread ? <span className="notif-dot">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      {panel}
    </div>
  );
}
