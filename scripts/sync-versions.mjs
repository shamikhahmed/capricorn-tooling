#!/usr/bin/env node
/**
 * Sync VERSION.json → sw.js, landing badges, package.json, changelog.html.
 * Run: node scripts/sync-versions.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';

const APPS = [
  { dir: 'VaultCap', landing: 'landing.html' },
  { dir: 'PulseCap', landing: 'landing.html' },
  { dir: 'PrismCap', landing: 'landing.html' },
  { dir: 'SteadyCap', landing: 'landing.html' },
  { dir: 'LedgerCap', landing: 'landing.html' },
  { dir: 'DeePonyCap', landing: 'landing.html' },
  { dir: 'ScentCap', landing: 'public/landing.html', pkg: true },
  { dir: 'AuraCap', landing: 'public/landing.html', pkg: true },
];

function patch(file, replacers) {
  if (!existsSync(file)) return false;
  let text = readFileSync(file, 'utf8');
  let changed = false;
  for (const [re, val] of replacers) {
    const next = typeof val === 'function' ? text.replace(re, val) : text.replace(re, val);
    if (next !== text) {
      text = next;
      changed = true;
    }
  }
  if (changed) writeFileSync(file, text);
  return changed;
}

function syncLandingBadge(landingPath, version, appName) {
  if (!existsSync(landingPath)) return false;
  let html = readFileSync(landingPath, 'utf8');
  let next = html;

  if (next.includes('hero-badge')) {
    next = next.replace(/(hero-badge[^>]*>[\s\S]*?)v[\d.]+/i, `$1v${version}`);
  }

  if (appName === 'ScentCap' && next.includes('class="badge"')) {
    next = next.replace(
      /(<div class="badge">Offline-first PWA · )([^<]*)(<\/div>)/,
      `$1v${version}$3`,
    );
    if (!next.includes(`v${version}`)) {
      next = next.replace(
        /(<div class="badge">)([^<]*)(<\/div>)/,
        `$1Offline-first PWA · v${version}$3`,
      );
    }
  }

  if (appName === 'AuraCap' && next.includes('class="badge"')) {
    next = next.replace(
      /(<div class="badge">Offline-first PWA · )v[\d.]+( · 16 modules<\/div>)/,
      `$1v${version}$2`,
    );
  }

  if (next === html) return false;
  writeFileSync(landingPath, next);
  return true;
}

function syncChangelog(appDir, version, updated) {
  const path = join(ROOT, appDir, 'changelog.html');
  if (!existsSync(path)) return false;
  let html = readFileSync(path, 'utf8');
  const first = html.match(/<h2>([\d.]+)\s*\(([^)]+)\)<\/h2>/);
  if (!first) return false;
  if (first[1] === version) return false;
  const next = html.replace(
    /<h2>[\d.]+\s*\([^)]+\)<\/h2>/,
    `<h2>${version} (${updated})</h2>`,
  );
  if (next === html) return false;
  writeFileSync(path, next);
  return true;
}

let count = 0;

for (const app of APPS) {
  const vf = join(ROOT, app.dir, 'VERSION.json');
  if (!existsSync(vf)) continue;
  const meta = JSON.parse(readFileSync(vf, 'utf8'));
  const { version, swCache, updated = '2026-06-17' } = meta;
  const base = join(ROOT, app.dir);

  if (swCache && patch(join(base, 'sw.js'), [[/^const CACHE = '[^']+';/m, `const CACHE = '${swCache}';`]])) {
    count++;
    console.log(`✓ sw.js ${app.dir}`);
  }

  if (syncLandingBadge(join(base, app.landing), version, app.dir)) {
    count++;
    console.log(`✓ landing ${app.dir}`);
  }

  if (app.pkg) {
    const pkgPath = join(base, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.version !== version) {
        pkg.version = version;
        writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
        count++;
        console.log(`✓ package.json ${app.dir}`);
      }
    }
  }

  if (syncChangelog(app.dir, version, updated)) {
    count++;
    console.log(`✓ changelog ${app.dir}`);
  }
}

// Hub package version tracks marketing releases
const hubPkgPath = join(ROOT, 'shamikhahmed.github.io/package.json');
if (existsSync(hubPkgPath)) {
  const hubPkg = JSON.parse(readFileSync(hubPkgPath, 'utf8'));
  if (hubPkg.version !== '1.2.1') {
    hubPkg.version = '1.2.1';
    writeFileSync(hubPkgPath, `${JSON.stringify(hubPkg, null, 2)}\n`);
    count++;
    console.log('✓ package.json shamikhahmed.github.io');
  }
}

console.log(`\nsync-versions: ${count} file(s) updated`);
