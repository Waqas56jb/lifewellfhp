/**
 * End-to-end Admin → public site publish test (production-safe test records).
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/test-cms-publish.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.API_BASE || 'https://lifewellfhp-server.vercel.app';
const SITE = process.env.SITE_BASE || 'https://www.lifewellfhp.com';
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars.');
  process.exit(1);
}

const stamp = Date.now();
const results = [];

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

const login = await api('/api/admin/auth/login', {
  method: 'POST',
  body: { email: EMAIL, password: PASSWORD },
});
const token = login.json?.data?.token;
ok('admin login', login.status === 200 && Boolean(token), `status ${login.status}`);
if (!token) process.exit(1);

const blogSlug = `cms-publish-test-${stamp}`;
const blog = await api('/api/admin/blog', {
  method: 'POST',
  token,
  body: {
    slug: blogSlug,
    title: `CMS Publish Test ${new Date(stamp).toISOString().slice(0, 10)}`,
    excerpt: 'Automated end-to-end test confirming Admin blog posts appear on the public site.',
    body: 'This is a short automated test article created to verify the Admin-to-website blog connection.',
    author_name: 'LifeWell QA',
    published: true,
  },
});
ok('create blog', blog.status === 201, blog.json?.data?.slug || `status ${blog.status}`);

const review = await api('/api/admin/testimonials', {
  method: 'POST',
  token,
  body: {
    quote: `Automated review test ${stamp}: compassionate care and clear communication throughout telehealth visits.`,
    author_name: 'QA Patient',
    author_role: 'Verified patient',
    rating: 5,
    published: true,
    consent_confirmed: true,
    sort_order: 0,
  },
});
ok('create review', review.status === 201, review.json?.data?.id ? 'created' : `status ${review.status}`);

const video = await api('/api/admin/videos', {
  method: 'POST',
  token,
  body: {
    title: `QA Video ${stamp}`,
    description: 'Automated test video entry for Admin-to-site verification.',
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    published: true,
    sort_order: 0,
  },
});
ok('create video', video.status === 201, video.json?.data?.title || `status ${video.status}`);

const here = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.resolve(here, '../../client/public/images/brand/logo-v2.avif');
let mediaStatus = 'skipped';
if (fs.existsSync(logoPath)) {
  const buffer = fs.readFileSync(logoPath);
  const media = await api('/api/admin/media/upload', {
    method: 'POST',
    token,
    body: {
      title: `QA Upload ${stamp}`,
      alt_text: 'LifeWell logo test upload',
      folder: 'qa-tests',
      filename: `qa-${stamp}.avif`,
      mime_type: 'image/avif',
      content_base64: buffer.toString('base64'),
    },
  });
  mediaStatus = media.status === 201 ? media.json?.data?.url || 'created' : `status ${media.status}`;
  ok('upload image', media.status === 201, mediaStatus);
} else {
  ok('upload image', false, 'logo-v2.avif not found locally');
}

// Allow revalidate ping + fresh fetch
await new Promise((r) => setTimeout(r, 3000));

const pub = await api('/api/public/content');
const posts = pub.json?.data?.posts ?? [];
const testimonials = pub.json?.data?.testimonials ?? [];
const videos = pub.json?.data?.videos ?? [];
ok(
  'public API blog',
  posts.some((p) => p.slug === blogSlug),
  `found=${posts.some((p) => p.slug === blogSlug)}`
);
ok(
  'public API review',
  testimonials.some((t) => String(t.quote || '').includes(String(stamp))),
  `count=${testimonials.length}`
);
ok(
  'public API video',
  videos.some((v) => String(v.title || '').includes(String(stamp))),
  `count=${videos.length}`
);

const blogHtml = await fetch(`${SITE}/blog`).then((r) => r.text());
ok('public /blog page', blogHtml.includes(blogSlug), blogSlug);

const reviewHtml = await fetch(`${SITE}/telehealth-mental-health-testimonials`).then((r) => r.text());
ok('public testimonials page', reviewHtml.includes('QA Patient') || reviewHtml.includes(String(stamp)));

const videoHtml = await fetch(`${SITE}/videos`).then((r) => r.text());
ok('public /videos page', videoHtml.includes(`QA Video ${stamp}`) || videoHtml.includes('dQw4w9WgXcQ'));

const fails = results.filter((r) => !r.pass).length;
console.log(`\n${fails === 0 ? 'ALL PASS' : `${fails} FAILURE(S)`} — ${results.length} checks\n`);
process.exit(fails === 0 ? 0 : 1);
