const fs = require('fs');
const dec = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&rsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');
const strip = (s) => dec(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

const pages = JSON.parse(fs.readFileSync('pages.json', 'utf8'));
const fees = pages.find((p) => p.slug === 'fees-insurance').content.rendered;
const home = pages.find((p) => p.slug === 'home').content.rendered;

console.log('=== PRICING TOKENS ON FEES PAGE ===');
const prices = [...fees.matchAll(/\$\s?[0-9][0-9,]*(?:\s*[–—-]\s*\$\s?[0-9][0-9,]*)?/g)].map((m) => m[0].trim());
console.log([...new Set(prices)].join('  |  '));

console.log('\n=== PRICING CONTEXT (surrounding text) ===');
const rows = [...fees.matchAll(/([^<>]{0,60})(\$\s?[0-9][0-9,]*)([^<>]{0,60})/g)]
  .map((m) => (strip(m[1]) + ' [' + m[2].trim() + '] ' + strip(m[3])).trim())
  .filter((s) => s.length > 4);
[...new Set(rows)].slice(0, 30).forEach((r) => console.log('  ' + r));

console.log('\n=== DURATION LABELS ===');
const durs = [...fees.matchAll(/>([^<>]*(?:Initial|Follow[- ]?Up|minutes|Month Program)[^<>]{0,40})</gi)]
  .map((m) => strip(m[1]))
  .filter(Boolean);
console.log([...new Set(durs)].slice(0, 30).join('  |  '));

console.log('\n=== HOMEPAGE BENEFIT CARDS ===');
const titles = [
  'Personalized One-on-One Care',
  'Private &amp; Secure Telehealth Sessions',
  'Flexible &amp; Convenient Scheduling',
  'Compassionate, Judgment-Free Support',
  'Evidence-Based Treatment Approach',
];
for (const t of titles) {
  const i = home.indexOf(t);
  if (i < 0) { console.log('\n* ' + dec(t) + '  -> NOT FOUND'); continue; }
  const after = strip(home.slice(i + t.length, i + t.length + 900));
  console.log('\n* ' + dec(t) + '\n   ' + after.slice(0, 240));
}

console.log('\n=== STAT COUNTER ATTRIBUTES ===');
const st = [...home.matchAll(/data-[a-z-]*(?:value|counter|duration|number)[a-z-]*="[^"]*"/gi)].map((m) => m[0]);
console.log(st.length ? [...new Set(st)].join('\n') : 'NONE — counters have no configured target values');

console.log('\n=== STAT LABELS ===');
const sl = [...home.matchAll(/Online Sessions Completed|Licensed Therapists|Years of Experience|Client Satisfaction Rate|Secure Online Access|Areas of Expertise/g)].map((m) => m[0]);
console.log([...new Set(sl)].join(' | ') || 'none');

console.log('\n=== HOMEPAGE SERVICE CARD TITLES (My Services section) ===');
const svc = [...home.matchAll(/href="https:\/\/lifewellfhp\.com\/services\/([a-z0-9-]+)\/?"/g)].map((m) => m[1]);
console.log([...new Set(svc)].join('\n'));
