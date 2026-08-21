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
  updated_at?: string;
};

type HeroForm = { badge: string; headline: string; subhead: string };
type WelcomeForm = { heading: string; body: string };
type IntroForm = { eyebrow: string; heading: string; body: string; cta: string };
type TextForm = { heading: string; body: string; eyebrow: string };

const emptyHero: HeroForm = { badge: '', headline: '', subhead: '' };
const emptyWelcome: WelcomeForm = { heading: '', body: '' };
const emptyIntro: IntroForm = { eyebrow: '', heading: '', body: '', cta: '' };
const emptyHow: TextForm = { heading: '', body: '', eyebrow: '' };

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function bodyText(value: unknown) {
  if (Array.isArray(value)) return value.filter((p) => typeof p === 'string').join('\n\n');
  return typeof value === 'string' ? value : '';
}

export function HomepageCopy() {
  const [ids, setIds] = useState<Record<string, string | null>>({});
  const [hero, setHero] = useState<HeroForm>(emptyHero);
  const [welcome, setWelcome] = useState<WelcomeForm>(emptyWelcome);
  const [services, setServices] = useState<IntroForm>(emptyIntro);
  const [benefitsHeading, setBenefitsHeading] = useState('');
  const [benefitsItems, setBenefitsItems] = useState<unknown[]>([]);
  const [how, setHow] = useState<TextForm>(emptyHow);
  const [howSteps, setHowSteps] = useState<unknown[]>([]);
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
    const byLatest = (key: string) =>
      [...rows]
        .filter((r) => r.page_key === 'home' && r.section_key === key)
        .sort((a, b) => Date.parse(b.updated_at || '') - Date.parse(a.updated_at || ''))[0];

    const nextIds: Record<string, string | null> = {};
    const heroRow = byLatest('hero');
    const welcomeRow = byLatest('welcome');
    const servicesRow = byLatest('services');
    const benefitsRow = byLatest('benefits');
    const howRow = byLatest('how_it_works');
    nextIds.hero = heroRow?.id ?? null;
    nextIds.welcome = welcomeRow?.id ?? null;
    nextIds.services = servicesRow?.id ?? null;
    nextIds.benefits = benefitsRow?.id ?? null;
    nextIds.how_it_works = howRow?.id ?? null;
    setIds(nextIds);

    if (heroRow) {
      const c = asRecord(heroRow.content);
      setHero({
        badge: String(c.badge || ''),
        headline: String(c.headline || c.heading || ''),
        subhead: String(c.subhead || c.subheading || ''),
      });
    }
    if (welcomeRow) {
      const c = asRecord(welcomeRow.content);
      setWelcome({ heading: String(c.heading || ''), body: bodyText(c.body) });
    }
    if (servicesRow) {
      const c = asRecord(servicesRow.content);
      setServices({
        eyebrow: String(c.eyebrow || ''),
        heading: String(c.heading || ''),
        body: String(c.body || ''),
        cta: String(c.cta || ''),
      });
    }
    if (benefitsRow) {
      const c = asRecord(benefitsRow.content);
      setBenefitsHeading(String(c.heading || ''));
      setBenefitsItems(Array.isArray(c.items) ? c.items : []);
    }
    if (howRow) {
      const c = asRecord(howRow.content);
      setHow({
        eyebrow: String(c.eyebrow || ''),
        heading: String(c.heading || ''),
        body: String(c.body || ''),
      });
      setHowSteps(Array.isArray(c.steps) ? c.steps : []);
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

    const results = await Promise.all([
      saveSection(ids.hero ?? null, 'hero', 'Homepage hero', {
        badge: hero.badge,
        headline: hero.headline,
        subhead: hero.subhead,
      }),
      saveSection(ids.welcome ?? null, 'welcome', 'Welcome', {
        heading: welcome.heading,
        body: welcomeBody,
      }),
      saveSection(ids.services ?? null, 'services', 'Services intro', {
        eyebrow: services.eyebrow,
        heading: services.heading,
        body: services.body,
        cta: services.cta,
      }),
      saveSection(ids.benefits ?? null, 'benefits', 'Why patients choose us', {
        heading: benefitsHeading,
        items: benefitsItems,
      }),
      saveSection(ids.how_it_works ?? null, 'how_it_works', 'How it works', {
        eyebrow: how.eyebrow,
        heading: how.heading,
        body: how.body,
        steps: howSteps,
      }),
    ]);
    setSaving(false);
    const failed = results.find((row) => !row.success);
    if (failed) {
      setError(failed.message || 'Save failed');
      return;
    }
    setMessage('Saved to the live website. Open the public site and refresh — homepage text updates immediately.');
    await load();
  }

  return (
    <form className="card card-pad" onSubmit={onSubmit} style={{ marginBottom: '1.25rem' }}>
      <h2>Website text</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        These fields publish to the public homepage on Save. Hard-refresh the client site if a tab was already open.
      </p>
      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="ok-banner">{message}</div> : null}

      <h3>Hero</h3>
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

      <h3>Welcome</h3>
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

      <h3>Services band</h3>
      <div className="field">
        <label htmlFor="svc-eyebrow">Eyebrow</label>
        <input id="svc-eyebrow" value={services.eyebrow} onChange={(e) => setServices({ ...services, eyebrow: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="svc-heading">Heading</label>
        <input id="svc-heading" value={services.heading} onChange={(e) => setServices({ ...services, heading: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="svc-body">Body</label>
        <textarea id="svc-body" rows={3} value={services.body} onChange={(e) => setServices({ ...services, body: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="svc-cta">Button label</label>
        <input id="svc-cta" value={services.cta} onChange={(e) => setServices({ ...services, cta: e.target.value })} />
      </div>

      <h3>Benefits</h3>
      <div className="field">
        <label htmlFor="benefits-heading">Benefits heading</label>
        <input id="benefits-heading" value={benefitsHeading} onChange={(e) => setBenefitsHeading(e.target.value)} />
      </div>
      <p className="muted">Individual benefit cards stay in Homepage sections JSON (`benefits` → `items`).</p>

      <h3>How it works</h3>
      <div className="field">
        <label htmlFor="how-eyebrow">Eyebrow</label>
        <input id="how-eyebrow" value={how.eyebrow} onChange={(e) => setHow({ ...how, eyebrow: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="how-heading">Heading</label>
        <input id="how-heading" value={how.heading} onChange={(e) => setHow({ ...how, heading: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="how-body">Body</label>
        <textarea id="how-body" rows={3} value={how.body} onChange={(e) => setHow({ ...how, body: e.target.value })} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Save homepage text'}
      </button>
    </form>
  );
}
