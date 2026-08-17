/**
 * Finds substantive text held in leaf <div>/<span> elements that the extractor
 * (which reads only h1-6, p, ul, ol) would never emit.
 * Run against the pages that are actually published.
 */
const fs = require('fs');
const path = require('path');
process.chdir(path.join(__dirname, '..', '..', '_source'));

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&rsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');

const text = (s) => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

/** Everything the extractor does capture, for comparison. */
function captured(html) {
  const src = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const out = [];
  const re =
    /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\4>/gi;
  let m;
  while ((m = re.exec(src))) {
    if (m[1]) out.push(text(m[2]));
    else if (m[3] !== undefined) out.push(text(m[3]));
    else if (m[4])
      out.push(...[...m[5].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => text(li[1])));
  }
  return out.join(' ').toLowerCase();
}

/** Leaf divs/spans — no nested block element — carrying real prose. */
function leafText(html) {
  const src = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const found = [];
  for (const m of src.matchAll(/<(div|span)\b[^>]*>((?:(?!<(?:div|span|p|h[1-6]|ul|ol)\b)[\s\S])*?)<\/\1>/gi)) {
    const t = text(m[2]);
    // Prose, not a label: needs length and sentence-like punctuation.
    if (t.length >= 45 && /[.!?]/.test(t)) found.push(t);
  }
  return [...new Set(found)];
}

const PUBLISHED_PAGES = [
  'home',
  'bio',
  'our-services',
  'fees-insurance',
  'faqs',
  'telehealth-mental-health-testimonials',
  'book-telehealth-mental-health-appointment',
  'contact-telehealth-mental-health-provider',
  'privacy-policy',
  'terms-conditions',
  'accessibility-statement',
  'sms-consent-communication-policy',
];

const pages = JSON.parse(fs.readFileSync('pages.json', 'utf8'));
const services = JSON.parse(fs.readFileSync('services.json', 'utf8'));

let total = 0;
for (const item of [...pages.filter((p) => PUBLISHED_PAGES.includes(p.slug)), ...services]) {
  const html = item.content?.rendered ?? '';
  const got = captured(html);
  const orphans = leafText(html).filter((t) => !got.includes(t.toLowerCase().slice(0, 40)));
  if (orphans.length === 0) continue;
  console.log(`\n=== ${item.slug} — ${orphans.length} uncaptured block(s) ===`);
  orphans.forEach((t) => console.log(`   • ${t.slice(0, 170)}`));
  total += orphans.length;
}

console.log(`\n${total === 0 ? 'No uncaptured prose.' : `${total} uncaptured block(s) total.`}`);
