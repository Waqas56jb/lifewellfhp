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
const home = pages.find((p) => p.slug === 'home').content.rendered;

console.log('=== BENEFIT CARD BODIES (paragraphs near each title) ===');
// Find all <p> and pick those matching the known benefit copy shape
const paras = [...home.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => strip(m[1])).filter((t) => t.length > 40);
const uniq = [...new Set(paras)];
uniq.forEach((p, i) => console.log(`\n[${i}] ${p.slice(0, 260)}`));

console.log('\n\n=== MY SERVICES SECTION: all internal service links on homepage ===');
const svc = [...home.matchAll(/href="([^"]*\/services\/[^"]*)"/g)].map((m) => dec(m[1]));
console.log([...new Set(svc)].join('\n') || 'NONE');

console.log('\n=== ALL HOMEPAGE IMAGES (full-size, deduped) ===');
const imgs = [...home.matchAll(/src="(https:\/\/lifewellfhp\.com\/wp-content\/uploads\/[^"]+)"/g)]
  .map((m) => m[1].replace(/-\d+x\d+(\.\w+)$/, '$1'));
[...new Set(imgs)].forEach((i) => console.log('  ' + i.split('/uploads/')[1]));
