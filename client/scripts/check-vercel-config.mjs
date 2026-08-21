/**
 * Validates every vercel.json in the repo against Vercel's published schema.
 *
 *   node scripts/check-vercel-config.mjs
 *
 * Vercel sets `additionalProperties: false`, so any stray key — including the
 * `"//"` pseudo-comment convention, which JSON does not actually support —
 * fails the import with:
 *
 *   Invalid request: should NOT have additional property `//`. Please remove it.
 *
 * Catching that here costs a second; catching it in the Vercel dashboard costs
 * a round trip.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const CONFIGS = [
  join(repoRoot, 'client', 'vercel.json'),
  join(repoRoot, 'admin', 'vercel.json'),
  join(repoRoot, 'server', 'vercel.json'),
  join(repoRoot, 'vercel.json'),
];

const SCHEMA_URL = 'https://openapi.vercel.sh/vercel.json';

let allowedKeys = null;
{
  // A manual controller lets the timer be cleared; AbortSignal.timeout leaves
  // a handle open and trips a libuv assertion on Node/Windows at exit.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(SCHEMA_URL, { signal: controller.signal });
    if (res.ok) {
      const schema = await res.json();
      allowedKeys = new Set(Object.keys(schema.properties ?? {}));
    }
  } catch {
    // Offline or the schema endpoint is down — fall through to the snapshot.
  } finally {
    clearTimeout(timer);
  }
}

if (!allowedKeys) {
  // Snapshot of the published schema, so the check still works offline.
  allowedKeys = new Set([
    '$schema', 'alias', 'build', 'buildCommand', 'builds', 'bulkRedirectsPath',
    'bunVersion', 'cleanUrls', 'crons', 'devCommand', 'env', 'experimentalBYOC',
    'experimentalEnvironmentVariables', 'experimentalServiceGroups',
    'experimentalServices', 'experimentalServicesV2', 'fluid', 'framework',
    'functionFailoverRegions', 'functions', 'git', 'github', 'headers',
    'ignoreCommand', 'images', 'installCommand', 'name', 'outputDirectory',
    'passiveRegions', 'proxy', 'redirects', 'regions', 'relatedProjects',
    'rewrites', 'routes', 'scope', 'services', 'trailingSlash', 'version',
    'wildcard',
  ]);
  console.log('  (schema unreachable — using bundled snapshot)');
}

let failures = 0;
const fail = (file, msg) => {
  failures++;
  console.log(`  FAIL  ${file}\n        ${msg}`);
};

console.log('\nVercel config validation\n');

let checked = 0;
for (const path of CONFIGS) {
  if (!existsSync(path)) continue;
  checked++;
  const label = relative(repoRoot, path).replace(/\\/g, '/');

  let config;
  try {
    config = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    fail(label, `not valid JSON — ${e.message}`);
    continue;
  }

  const unknown = Object.keys(config).filter((k) => !allowedKeys.has(k));
  if (unknown.length) {
    fail(
      label,
      `unknown top-level key(s): ${unknown.map((k) => `"${k}"`).join(', ')} — ` +
        `Vercel rejects these (additionalProperties: false). JSON has no comment syntax.`
    );
    continue;
  }

  // Shape checks for the parts we actually use.
  for (const entry of config.headers ?? []) {
    if (typeof entry.source !== 'string') fail(label, 'a headers entry is missing "source"');
    if (!Array.isArray(entry.headers)) fail(label, `headers["${entry.source}"] must be an array`);
    for (const h of entry.headers ?? []) {
      if (typeof h.key !== 'string' || typeof h.value !== 'string') {
        fail(label, `headers["${entry.source}"] entries need string key and value`);
      }
    }
  }
  for (const entry of config.rewrites ?? []) {
    if (typeof entry.source !== 'string' || typeof entry.destination !== 'string') {
      fail(label, 'a rewrites entry needs string "source" and "destination"');
    }
  }

  /* A catch-all rewrite to a single document is the single-page-app pattern.
     Next.js prerenders each route, so it would shadow real routes and break
     the 404 page. */
  const catchAll = (config.rewrites ?? []).find(
    (r) => /^\/\(\.\*\)$|^\/:path\*$/.test(r.source) && /index\.html|^\/$/.test(r.destination)
  );
  if (catchAll && label.startsWith('client/')) {
    fail(label, `catch-all rewrite "${catchAll.source}" → "${catchAll.destination}" would break Next.js routing`);
  }

  if (failures === 0 || !unknown.length) {
    const keys = Object.keys(config).filter((k) => k !== '$schema');
    console.log(`  PASS  ${label.padEnd(20)} keys: ${keys.join(', ') || '(none)'}`);
  }
}

if (checked === 0) {
  console.log('  No vercel.json found.');
  process.exitCode = 1;
}

console.log(`\n${failures === 0 ? `✓ ALL PASS — ${checked} config(s) valid` : `✗ ${failures} problem(s)`}\n`);

if (failures > 0) process.exitCode = 1;

/* Close undici's keep-alive sockets so Node can exit on its own. Calling
   process.exit() here instead trips a libuv assertion on Windows and returns a
   bogus exit code, which would make this check useless in CI. */
const dispatcher = globalThis[Symbol.for('undici.globalDispatcher.1')];
await dispatcher?.close?.().catch(() => {});
