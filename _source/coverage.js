/**
 * Measures how much source text the content extractor captures.
 * Any page below the threshold is losing content that should be investigated.
 */
const fs = require('fs');

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&rsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');

const stripAll = (html) =>
  decode(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

// Mirrors the extractor in scripts/generate-content.mjs
const text = (s) => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

function extracted(html) {
  const src = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const re =
    /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\4>/gi;
  let m;
  while ((m = re.exec(src))) {
    if (m[1]) out.push(text(m[2]));
    else if (m[3] !== undefined) out.push(text(m[3]));
    else if (m[4])
      out.push(
        [...m[5].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((li) => text(li[1])).join(' ')
      );
  }
  return [...new Set(out)].join(' ');
}

/** Words present in the source that the extractor never emitted. */
function missingSample(html) {
  const all = stripAll(html);
  const got = extracted(html).toLowerCase();
  const sentences = all.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 40);
  return sentences.filter((s) => !got.includes(s.toLowerCase().slice(0, 45))).slice(0, 3);
}

for (const file of ['services.json', 'pages.json', 'posts.json']) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`\n=== ${file} ===`);
  for (const item of data) {
    const html = item.content?.rendered ?? '';
    if (!html) continue;
    const total = stripAll(html).length;
    const got = extracted(html).length;
    if (total === 0) continue;
    // Extraction dedupes Elementor's duplicate desktop/mobile copies, so a
    // ratio above 100% is impossible but below ~55% signals real loss.
    const pct = Math.round((got / total) * 100);
    const flag = pct < 55 ? '  <-- CHECK' : '';
    console.log(`  ${String(pct).padStart(3)}%  ${item.slug.slice(0, 52).padEnd(54)}${flag}`);
    if (pct < 55) {
      for (const s of missingSample(html)) console.log(`         missing: ${s.slice(0, 110)}`);
    }
  }
}
