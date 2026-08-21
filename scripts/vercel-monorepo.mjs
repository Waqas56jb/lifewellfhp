/**
 * Vercel Git deploys of this monorepo often have Root Directory left empty.
 * That serves the repo root (no Next.js app) and returns platform 404 NOT_FOUND.
 *
 * When this script is the install/build command, pick client vs admin from
 * VERCEL_PROJECT_NAME and stage the Next.js output at the repo root so the
 * @vercel/next builder can collect it.
 *
 * Projects that already set Root Directory to client/ or admin/ never run this
 * — they use that folder's own vercel.json instead.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const action = process.argv[2];

function selectedApp() {
  const name = (process.env.VERCEL_PROJECT_NAME || '').toLowerCase();
  if (name.includes('admin')) return 'admin';
  if (name.includes('server') || name.includes('api') || name.includes('backend')) {
    return 'server';
  }
  return 'client';
}

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function replaceWith(from, to, asSymlink) {
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  if (asSymlink) {
    const type = process.platform === 'win32' ? 'junction' : 'dir';
    symlinkSync(from, to, type);
    return;
  }
  cpSync(from, to, { recursive: true });
}

const app = selectedApp();
const dir = join(root, app);

console.log(
  `[lifewell] ${action} → ${app}/  (VERCEL_PROJECT_NAME=${process.env.VERCEL_PROJECT_NAME || '(unset)'})`
);

if (!existsSync(join(dir, 'package.json'))) {
  console.error(`[lifewell] missing ${app}/package.json`);
  process.exit(1);
}

if (action === 'install') {
  run('npm', ['install'], dir);
  process.exit(0);
}

if (action === 'build') {
  run('npm', ['run', 'build'], dir);

  if (app === 'server') process.exit(0);

  const nextOut = join(dir, '.next');
  if (!existsSync(nextOut)) {
    console.error(`[lifewell] ${app}/.next was not produced`);
    process.exit(1);
  }

  replaceWith(nextOut, join(root, '.next'), false);

  const modules = join(dir, 'node_modules');
  if (existsSync(modules)) {
    const dest = join(root, 'node_modules');
    if (existsSync(dest) && !lstatSync(dest).isSymbolicLink()) {
      rmSync(dest, { recursive: true, force: true });
    }
    replaceWith(modules, dest, true);
  }

  for (const file of ['next.config.ts', 'next.config.js', 'next.config.mjs']) {
    const from = join(dir, file);
    if (existsSync(from)) cpSync(from, join(root, file));
  }

  const pubFrom = join(dir, 'public');
  if (existsSync(pubFrom)) replaceWith(pubFrom, join(root, 'public'), false);

  process.exit(0);
}

console.error('Usage: node scripts/vercel-monorepo.mjs <install|build>');
process.exit(1);
