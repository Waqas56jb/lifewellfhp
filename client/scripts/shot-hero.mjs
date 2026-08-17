/**
 * Captures the hero at several widths and measures heading contrast against
 * the *actual composited background* — the text is hidden for the measurement
 * pass so glyph pixels can't be mistaken for background.
 *
 *   node scripts/shot-hero.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SITE_BASE ?? 'http://localhost:3000';
const OUT = 'hero-shots';
mkdirSync(OUT, { recursive: true });

const srgb = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const VIEWPORTS = [
  [1440, 900],
  [1280, 800],
  [768, 1024],
  [390, 844],
];

const browser = await chromium.launch();
const page = await browser.newPage();

let worstWhite = Infinity;
let worstAccent = Infinity;

for (const [w, h] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(900);

  const hero = page.locator('section').first();
  await hero.screenshot({ path: `${OUT}/hero-${w}x${h}.png` });

  const info = await page.evaluate(() => {
    const section = document.querySelector('section');
    const h1 = document.getElementById('hero-heading');
    const rect = section.getBoundingClientRect();
    const hb = h1.getBoundingClientRect();
    const spans = Array.from(h1.querySelectorAll('span')).map((s) => ({
      text: s.textContent.trim().slice(0, 26),
      color: getComputedStyle(s).color,
      font: getComputedStyle(s).fontFamily.split(',')[0].replace(/["']/g, ''),
      size: getComputedStyle(s).fontSize,
      weight: getComputedStyle(s).fontWeight,
    }));
    return {
      heroW: Math.round(rect.width),
      heroH: Math.round(rect.height),
      viewport: window.innerWidth,
      docWidth: document.documentElement.clientWidth,
      headingBox: {
        x: Math.round(hb.left - rect.left),
        y: Math.round(hb.top - rect.top),
        w: Math.round(hb.width),
        h: Math.round(hb.height),
      },
      spans,
    };
  });

  // Hide the hero's foreground so only the composited background remains.
  await page.evaluate(() => {
    const inner = document.querySelector('section > div:last-of-type');
    if (inner) inner.style.visibility = 'hidden';
  });
  await page.waitForTimeout(150);
  const bgShot = await hero.screenshot();
  await page.evaluate(() => {
    const inner = document.querySelector('section > div:last-of-type');
    if (inner) inner.style.visibility = '';
  });

  const range = await page.evaluate(
    async ({ b64, box }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const scale = img.width / document.querySelector('section').getBoundingClientRect().width;
      const x = Math.max(0, Math.floor(box.x * scale));
      const y = Math.max(0, Math.floor(box.y * scale));
      const w = Math.min(img.width - x, Math.ceil(box.w * scale));
      const h = Math.min(img.height - y, Math.ceil(box.h * scale));
      if (w <= 0 || h <= 0) return null;

      const data = ctx.getImageData(x, y, w, h).data;
      const lum = ([r, g, b]) => {
        const f = (v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      let min = null;
      let max = null;
      let minL = 2;
      let maxL = -1;
      for (let i = 0; i < data.length; i += 4) {
        const px = [data[i], data[i + 1], data[i + 2]];
        const l = lum(px);
        if (l < minL) { minL = l; min = px; }
        if (l > maxL) { maxL = l; max = px; }
      }
      return { min, max };
    },
    { b64: bgShot.toString('base64'), box: info.headingBox }
  );

  const fullBleed = info.heroW === info.docWidth;
  console.log(`\n=== ${w}x${h} ===`);
  console.log(
    `  hero ${info.heroW}x${info.heroH}   full-bleed: ${fullBleed ? 'yes' : `NO (doc ${info.docWidth})`}`
  );
  for (const s of info.spans) {
    console.log(`  "${s.text}"  ${s.color}  ${s.font} ${s.size}/${s.weight}`);
  }

  if (range?.max) {
    const cw = contrast([255, 255, 255], range.max);
    const ca = contrast([0xa8, 0xd2, 0xef], range.max);
    worstWhite = Math.min(worstWhite, cw);
    worstAccent = Math.min(worstAccent, ca);
    console.log(
      `  lightest background behind heading rgb(${range.max.join(',')})  →  white ${cw.toFixed(2)}:1, accent ${ca.toFixed(2)}:1`
    );
  }
}

await browser.close();

console.log('\n=== worst case across all viewports (large text needs 3:1) ===');
console.log(`  white heading   ${worstWhite.toFixed(2)}:1   ${worstWhite >= 3 ? 'PASS' : 'FAIL'}`);
console.log(`  accent heading  ${worstAccent.toFixed(2)}:1   ${worstAccent >= 3 ? 'PASS' : 'FAIL'}`);
console.log(`\nScreenshots in ${OUT}/\n`);

process.exit(worstWhite >= 3 && worstAccent >= 3 ? 0 : 1);
