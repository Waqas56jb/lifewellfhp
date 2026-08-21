/**
 * Shim for Vercel project settings that still run
 * `node scripts/vercel-monorepo.mjs` after Root Directory is set to client/.
 */
import { spawnSync } from 'node:child_process';

const action = process.argv[2];

function run(args) {
  const result = spawnSync('npm', args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (action === 'install') run(['install']);
else if (action === 'build') run(['run', 'build']);
else {
  console.error('Usage: node scripts/vercel-monorepo.mjs <install|build>');
  process.exit(1);
}
