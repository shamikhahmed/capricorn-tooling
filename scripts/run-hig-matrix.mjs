#!/usr/bin/env node
/**
 * Run hig-check.mjs for all 8 viewport × color-scheme combos.
 *
 *   node run-hig-matrix.mjs --url http://127.0.0.1:8080/ --out App/build/qa/v7/hig-check
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const script = join(dirname(fileURLToPath(import.meta.url)), 'hig-check.mjs');
const viewports = ['se', 'pro', 'ipad', 'mac'];
const schemes = ['light', 'dark'];

function parseArgs(argv) {
  let url = null;
  let out = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--url=')) url = a.slice(6);
    else if (a === '--url') url = argv[++i];
    else if (a.startsWith('--out=')) out = a.slice(6);
    else if (a === '--out') out = argv[++i];
  }
  if (!url || !out) {
    console.error('Usage: node run-hig-matrix.mjs --url URL --out DIR');
    process.exit(2);
  }
  return { url, out };
}

const { url, out } = parseArgs(process.argv.slice(2));
let failed = 0;

for (const vp of viewports) {
  for (const scheme of schemes) {
    const r = spawnSync(
      process.execPath,
      [script, '--url', url, '--out', out, `--viewport=${vp}`, `--color-scheme=${scheme}`],
      { stdio: 'inherit', env: process.env },
    );
    if (r.status !== 0) failed += 1;
  }
}

console.log(`run-hig-matrix: ${failed ? `${failed}/8 failed` : '8/8 pass'} → ${out}`);
process.exit(failed ? 1 : 0);
