// Extracts clean semantic content from Elementor-rendered WordPress HTML.
// Strips widget scaffolding, reassembles span-fragmented headings, keeps
// headings / paragraphs / lists / images / links in document order.
const fs = require('fs');

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…');

const stripTags = (s) => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

function clean(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

// Walk the document in order, emitting content nodes.
function extract(html) {
  const src = clean(html);
  const out = [];
  const re =
    /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\4>|<img\b([^>]*)>|<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(src))) {
    if (m[1]) {
      const text = stripTags(m[2]);
      if (text) out.push({ type: 'heading', level: +m[1][1], text });
    } else if (m[3] !== undefined) {
      const text = stripTags(m[3]);
      if (text) out.push({ type: 'paragraph', text });
    } else if (m[4]) {
      const items = [...m[5].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => stripTags(li[1]))
        .filter(Boolean);
      if (items.length) out.push({ type: 'list', ordered: m[4].toLowerCase() === 'ol', items });
    } else if (m[6]) {
      const attrs = m[6];
      const src2 = (attrs.match(/\ssrc=["']([^"']+)["']/i) || [])[1];
      const alt = (attrs.match(/\salt=["']([^"']*)["']/i) || [])[1] ?? '';
      if (src2 && !/data:image/.test(src2)) out.push({ type: 'image', src: src2, alt: decode(alt) });
    } else if (m[7]) {
      const href = (m[7].match(/\shref=["']([^"']+)["']/i) || [])[1];
      const text = stripTags(m[8]);
      if (href && text) out.push({ type: 'link', href, text });
    }
  }
  return out;
}

// Collapse consecutive duplicate nodes (Elementor renders desktop+mobile copies).
function dedupe(nodes) {
  const seen = new Set();
  const out = [];
  for (const n of nodes) {
    const key = JSON.stringify(n);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

const which = process.argv[2];
const slug = process.argv[3];
const data = JSON.parse(fs.readFileSync(`${which}.json`, 'utf8'));
const item = data.find((d) => d.slug === slug);
if (!item) {
  console.error('not found:', slug, '\navailable:', data.map((d) => d.slug).join(', '));
  process.exit(1);
}
const nodes = dedupe(extract(item.content.rendered));
console.log('### ' + decode(item.title.rendered) + '  (' + item.slug + ')');
console.log('--- ' + nodes.length + ' nodes ---\n');
for (const n of nodes) {
  if (n.type === 'heading') console.log(`\n[H${n.level}] ${n.text}`);
  else if (n.type === 'paragraph') console.log(`  ${n.text}`);
  else if (n.type === 'list') n.items.forEach((i) => console.log(`   - ${i}`));
  else if (n.type === 'image') console.log(`  <IMG ${n.src.split('/').pop()} alt="${n.alt}">`);
  else if (n.type === 'link') console.log(`  <A "${n.text}" -> ${n.href}>`);
}
