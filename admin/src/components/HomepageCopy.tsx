'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type SectionRow = {
  id: string;
  page_key: string;
  section_key: string;
  title?: string | null;
  content?: Record<string, unknown> | null;
  published?: boolean;
};

type HeroForm = { badge: string; headline: string; subhead: string };
type WelcomeForm = { heading: string; body: string };

const emptyHero: HeroForm = { badge: '', headline: '', subhead: '' };
const emptyWelcome: WelcomeForm = { heading: '', body: '' };

export function HomepageCopy() {
  const [heroId, setHeroId] = useState<string | null>(null);
  const [welcomeId, setWelcomeId] = useState<string | null>(null);
  const [hero, setHero] = useState<HeroForm>(emptyHero);
  const [welcome, setWelcome] = useState<WelcomeForm>(emptyWelcome);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await api<SectionRow[]>('/api/admin/sections');
    if (!res.success) {
      setError(res.message || 'Could not load homepage copy');
      return;
    }
    const rows = res.data || [];
    const heroRow = rows.find((r) => r.page_key === 'home' && r.section_key === 'hero');
    const welcomeRow = rows.find((r) => r.page_key === 'home' && r.section_key === 'welcome');
    if (heroRow) {
      setHeroId(heroRow.id);
      const c = (heroRow.content || {}) as Record<string, unknown>;
      setHero({
        badge: String(c.badge || ''),
        headline: String(c.headline || ''),
        subhead: String(c.subhead || ''),
      });
    }
    if (welcomeRow) {
      setWelcomeId(welcomeRow.id);
      const c = (welcomeRow.content || {}) as Record<string, unknown>;
      const body = Array.isArray(c.body) ? c.body.filter((p) => typeof p === 'string').join('\n\n') : String(c.body || '');
      setWelcome({ heading: String(c.heading || ''), body });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveSection(
    id: string | null,
    section_key: string,
    title: string,
    content: Record<string, unknown>
  ) {
    const payload = { page_key: 'home', section_key, title, published: true, content };
    if (id) return api(`/api/admin/sections/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    return api('/api/admin/sections', { method: 'POST', body: JSON.stringify(payload) });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const welcomeBody = welcome.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const [heroRes, welcomeRes] = await Promise.all([
      saveSection(heroId, 'hero', 'Homepage hero', {
        badge: hero.badge,
        headline: hero.headline,
        subhead: hero.subhead,
      }),
      saveSection(welcomeId, 'welcome', 'Welcome', {
        heading: welcome.heading,
        body: welcomeBody,
      }),
    ]);
    setSaving(false);
    if (!heroRes.success || !welcomeRes.success) {
      setError(heroRes.message || welcomeRes.message || 'Save failed');
      return;
    }
    setMessage('Saved. The public homepage will update within about a minute.');
    await load();
  }

  return (
    <form className="card card-pad" onSubmit={onSubmit} style={{ marginBottom: '1.25rem' }}>
      <h2>Website text</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Hero and welcome copy currently on the live homepage. Edit and save — or delete a section below.
      </p>
      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="ok-banner">{message}</div> : null}

      <div className="field">
        <label htmlFor="hero-badge">Hero badge</label>
        <input id="hero-badge" value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="hero-headline">Hero headline</label>
        <input id="hero-headline" value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="hero-subhead">Hero subheading</label>
        <textarea id="hero-subhead" rows={3} value={hero.subhead} onChange={(e) => setHero({ ...hero, subhead: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="welcome-heading">Welcome heading</label>
        <input
          id="welcome-heading"
          value={welcome.heading}
          onChange={(e) => setWelcome({ ...welcome, heading: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="welcome-body">Welcome text (blank line between paragraphs)</label>
        <textarea
          id="welcome-body"
          rows={8}
          value={welcome.body}
          onChange={(e) => setWelcome({ ...welcome, body: e.target.value })}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Save homepage text'}
      </button>
    </form>
  );
}
