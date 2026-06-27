#!/usr/bin/env node
/**
 * Cross-workspace health check — run from capricorn-tooling:
 *   node scripts/workspace-audit.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT } from './lib/workspace-root.mjs';

/** In-scope apps — cross-portfolio excellence initiative (June 2026). */
const APPS = [
  { name: 'VaultCap', index: 'index.html' },
  { name: 'PulseCap', index: 'index.html' },
  { name: 'SteadyCap', index: 'index.html' },
  { name: 'LedgerCap', index: 'index.html' },
  { name: 'DeePonyCap', index: 'index.html' },
  { name: 'ScentCap', index: 'index.html' },
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
  if (!html.includes('cap-demo-mode.js') && !html.includes('CapDemo')) {
    fail(name, 'cap-demo-mode.js not linked — run sync-design-system');
  } else ok(name, 'demo contract script');
  if (/gsap\.min\.js/.test(html)) fail(name, 'GSAP still loaded on app shell');
  else ok(name, 'no GSAP on shell');
  if (/capricorn-cinematic\.js/.test(html)) fail(name, 'cinematic still on shell');
  else ok(name, 'no cinematic on shell');
  if (!/cap-skip-link|skip-link|Skip to content/i.test(html)) {
    fail(name, 'missing skip link — add .cap-skip-link as first focusable element');
  } else ok(name, 'skip link present');
  if (name === 'ScentCap') {
    if (!html.includes('Content-Security-Policy')) fail(name, 'CSP meta missing on index.html');
    else ok(name, 'CSP meta present');
  } else if (!html.includes('Content-Security-Policy')) {
    fail(name, 'CSP meta missing');
  } else ok(name, 'CSP meta present');
  const core = join(dir, name === 'ScentCap' || name === 'AuraCap' ? 'public/css/capricorn-core.css' : 'css/capricorn-core.css');
  if (!existsSync(core)) fail(name, 'capricorn-core.css missing');
  else {
    const coreText = readFileSync(core, 'utf8');
    if (!coreText.includes('data-cap-app="1"]') || !coreText.includes('.cap-tab-bar') || !coreText.includes('.cap-demo-banner')) {
      fail(name, 'capricorn-core outdated — run sync-design-system');
    } else ok(name, 'design system synced');
  }
}

console.log(`\n--- Scope: ${APPS.length} in-scope apps ---`);

console.log('\n--- Version consistency (M15) ---');
for (const { name } of APPS) {
  const vf = join(ROOT, name, 'VERSION.json');
  if (!existsSync(vf)) {
    fail(name, 'VERSION.json missing');
    continue;
  }
  let meta;
  try {
    meta = JSON.parse(readFileSync(vf, 'utf8'));
  } catch {
    fail(name, 'VERSION.json invalid JSON');
    continue;
  }
  const { version, swCache } = meta;
  if (!version) {
    fail(name, 'VERSION.json missing version field');
    continue;
  }

  if (name === 'ScentCap') {
    const pkgPath = join(ROOT, name, 'package.json');
    if (!existsSync(pkgPath)) {
      fail(name, 'package.json missing');
    } else {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.version !== version) {
        fail(name, `package.json v${pkg.version} ≠ VERSION.json v${version} — run sync-versions`);
      } else {
        ok(name, `v${version} (package.json aligned)`);
      }
    }
    const vitePath = join(ROOT, name, 'vite.config.ts');
    if (existsSync(vitePath)) {
      const vite = readFileSync(vitePath, 'utf8');
      if (!vite.includes('versionManifest.swCache') && swCache) {
        fail(name, 'vite PWA cacheId not wired to VERSION.json swCache');
      } else {
        ok(name, 'vite PWA cacheId wired');
      }
    }
    continue;
  }

  const swPath = join(ROOT, name, 'sw.js');
  if (!existsSync(swPath)) {
    fail(name, 'sw.js missing');
    continue;
  }
  const sw = readFileSync(swPath, 'utf8');
  let cacheName = sw.match(/^const CACHE = '([^']+)';/m)?.[1];
  if (!cacheName && name === 'DeePonyCap') {
    const vjs = join(ROOT, name, 'js/version.js');
    if (existsSync(vjs)) {
      cacheName = readFileSync(vjs, 'utf8').match(/SW_CACHE = '([^']+)'/)?.[1];
    }
  }
  if (swCache && (!cacheName || cacheName !== swCache)) {
    fail(name, `sw cache "${cacheName ?? '?'}" ≠ VERSION.json swCache "${swCache}" — run sync-versions`);
  } else {
    ok(name, `v${version} · swCache ${swCache || cacheName || 'n/a'}`);
  }
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
