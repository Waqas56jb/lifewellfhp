/**
 * Static-output audit for the built site.
 *
 *   npm run build && node scripts/check-links.mjs
 *
 * Verifies against the real prerendered HTML in .next/server/app:
 *   - every internal href resolves to a route that exists
 *   - no dead "#" placeholder links (the source site shipped several)
 *   - exactly one <h1> per page and no skipped heading levels
 *   - every <img> carries an alt attribute
 *   - titles and meta descriptions are present and unique across pages
 *   - JSON-LD parses and contains no double-encoded entities
 *   - external links carry rel="noopener"
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const APP = join(here, '..', '.next', 'server', 'app');
const PUBLIC = join(here, '..', 'public');

if (!existsSync(APP)) {
  console.error('No build output found. Run `npm run build` first.');
  process.exit(1);
}

/* ------------------------------------------------------------ collect --- */

const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.html')) pages.push(full);
  }
})(APP);

/**
 * A run that finds no pages must fail loudly. Reporting "no issues" against an
 * empty or partial build would be a vacuous pass.
 */
const MIN_EXPECTED_PAGES = 30;
if (pages.length < MIN_EXPECTED_PAGES) {
  console.error(
    `\nOnly ${pages.length} prerendered page(s) found — expected at least ${MIN_EXPECTED_PAGES}.\n` +
      `The build is missing or incomplete. Run \`npm run build\` and check it succeeded.\n`
  );
  process.exit(1);
}

/** Build the set of routes that actually exist. */
const routes = new Set(['/']);
for (const file of pages) {
  const rel = relative(APP, file).replace(/\\/g, '/').replace(/\.html$/, '');
  routes.add(rel === 'index' ? '/' : `/${rel}`);
}

/** Redirect sources declared in next.config.ts are valid link targets too. */
const configSrc = readFileSync(join(here, '..', 'next.config.ts'), 'utf8');
for (const m of configSrc.matchAll(/source:\s*'([^']+)'/g)) routes.add(m[1]);

/** Routes Next.js generates from file conventions rather than /public. */
const GENERATED_ROUTES = ['/icon.png', '/apple-icon.png', '/opengraph-image.png', '/sitemap.xml', '/robots.txt'];
for (const r of GENERATED_ROUTES) routes.add(r);

const problems = [];
const add = (page, kind, detail) =>
  problems.push({ page: relative(APP, page).replace(/\\/g, '/'), kind, detail });

const titles = new Map();
const descriptions = new Map();

/* ------------------------------------------------------------- checks --- */

const decodeEntities = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const name = relative(APP, file).replace(/\\/g, '/');
  const isNotFound = name === '_not-found.html';

  /* --- internal links --- */
  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const href = m[1].replace(/\/$/, '') || '/';
    if (href.startsWith('/_next') || href.startsWith('/images')) continue;
    if (routes.has(href)) continue;
    if (/\.(png|jpe?g|webp|avif|svg|ico|xml|txt|json)$/i.test(href)) {
      if (!existsSync(join(PUBLIC, href))) add(file, 'missing-asset', href);
      continue;
    }
    if (!routes.has(href)) add(file, 'broken-internal-link', href);
  }

  /* --- placeholder links --- */
  for (const m of html.matchAll(/<a\b[^>]*href="#"[^>]*>/g)) {
    add(file, 'placeholder-link', m[0].slice(0, 90));
  }

  /* --- external links need noopener --- */
  for (const m of html.matchAll(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/g)) {
    const tag = m[0];
    if (/target="_blank"/.test(tag) && !/rel="[^"]*noopener/.test(tag)) {
      add(file, 'external-without-noopener', tag.slice(0, 90));
    }
  }

  /* --- headings --- */
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s !== 1) add(file, 'h1-count', `found ${h1s}`);

  let previous = 0;
  for (const level of levels) {
    if (previous && level > previous + 1) {
      add(file, 'heading-skip', `h${previous} -> h${level}`);
      break;
    }
    previous = level;
  }

  /* --- images --- */
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) add(file, 'img-missing-alt', m[0].slice(0, 90));
  }

  /* --- metadata --- */
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];

  if (!title) add(file, 'missing-title', '');
  if (!desc) add(file, 'missing-description', '');

  if (!isNotFound) {
    if (title) {
      if (titles.has(title)) add(file, 'duplicate-title', `same as ${titles.get(title)}`);
      else titles.set(title, name);
    }
    if (desc) {
      if (descriptions.has(desc)) add(file, 'duplicate-description', `same as ${descriptions.get(desc)}`);
      else descriptions.set(desc, name);
    }
  }

  /* --- canonical --- */
  if (!isNotFound && !/rel="canonical"/.test(html)) add(file, 'missing-canonical', '');

  /* --- JSON-LD --- */
  for (const m of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    const raw = decodeEntities(m[1]);
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      add(file, 'jsonld-invalid', e.message.slice(0, 80));
      continue;
    }
    const text = JSON.stringify(parsed);
    if (text.includes('&amp;')) add(file, 'jsonld-double-encoded', 'contains &amp;');
    if (/"@type"\s*:\s*"Article"/.test(text) && name === 'index.html') {
      add(file, 'jsonld-homepage-article', 'homepage typed as Article');
    }
  }
}

/* ------------------------------------------------------------- report --- */

console.log(`\nStatic output audit — ${pages.length} pages\n`);

if (problems.length === 0) {
  console.log(`  ✓ no issues found`);
  console.log(`  ✓ ${routes.size} routes resolvable`);
  console.log(`  ✓ ${titles.size} unique titles, ${descriptions.size} unique descriptions\n`);
  process.exit(0);
}

const grouped = problems.reduce((acc, p) => {
  (acc[p.kind] ??= []).push(p);
  return acc;
}, {});

for (const [kind, list] of Object.entries(grouped)) {
  console.log(`  ${kind}  (${list.length})`);
  for (const p of list.slice(0, 12)) console.log(`     ${p.page}  ${p.detail}`);
  if (list.length > 12) console.log(`     … and ${list.length - 12} more`);
  console.log('');
}

console.log(`${problems.length} issue(s) found\n`);
process.exit(1);
