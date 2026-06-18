#!/usr/bin/env node
/**
 * Cross-workspace health check — run from capricorn-tooling:
 *   node scripts/workspace-audit.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT } from './lib/workspace-root.mjs';

const APPS = [
  { name: 'VaultCap', index: 'index.html' },
  { name: 'PulseCap', index: 'index.html' },
  { name: 'PrismCap', index: 'index.html' },
  { name: 'SteadyCap', index: 'index.html' },
  { name: 'LedgerCap', index: 'index.html' },
  { name: 'DeePonyCap', index: 'index.html' },
  { name: 'ScentCap', index: 'index.html' },
  { name: 'AuraCap', index: 'index.html' },
];

let issues = 0;

function fail(app, msg) {
  console.log(`✗ [${app}] ${msg}`);
  issues++;
}
function ok(app, msg) {
  console.log(`✓ [${app}] ${msg}`);
}

for (const { name, index } of APPS) {
  const dir = join(ROOT, name);
  const htmlPath = join(dir, index);
  if (!existsSync(htmlPath)) {
    fail(name, `missing ${index}`);
    continue;
  }
  const html = readFileSync(htmlPath, 'utf8');
  if (!html.includes('data-cap-app="1"')) fail(name, 'data-cap-app not set on body');
  else ok(name, 'fast app shell flag');
  if (/gsap\.min\.js/.test(html)) fail(name, 'GSAP still loaded on app shell');
  else ok(name, 'no GSAP on shell');
  if (/capricorn-cinematic\.js/.test(html)) fail(name, 'cinematic still on shell');
  else ok(name, 'no cinematic on shell');
  const core = join(dir, name === 'ScentCap' || name === 'AuraCap' ? 'public/css/capricorn-core.css' : 'css/capricorn-core.css');
  if (!existsSync(core)) fail(name, 'capricorn-core.css missing');
  else {
    const coreText = readFileSync(core, 'utf8');
    if (!coreText.includes('data-cap-app="1"]') || !coreText.includes('.cap-tab-bar')) {
      fail(name, 'capricorn-core outdated — run sync-design-system');
    } else ok(name, 'design system synced');
  }
}

const hub = join(ROOT, 'shamikhahmed.github.io/index.html');
if (existsSync(hub)) {
  const h = readFileSync(hub, 'utf8');
  if (!h.includes('capricorn-core.css')) fail('hub', 'missing capricorn-core.css');
  else ok('hub', 'capricorn-core linked');
}

const verify = join(ROOT, 'LedgerCap/scripts/verify-ledger.js');
if (existsSync(verify)) {
  console.log('\n--- LedgerCap verify-ledger ---');
  const { execSync } = await import('node:child_process');
  try {
    execSync('node scripts/verify-ledger.js', { cwd: join(ROOT, 'LedgerCap'), stdio: 'inherit' });
  } catch {
    issues++;
  }
}

console.log(issues ? `\nworkspace-audit: ${issues} issue(s)` : '\nworkspace-audit: all checks passed');
process.exit(issues ? 1 : 0);
