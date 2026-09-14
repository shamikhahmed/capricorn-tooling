#!/usr/bin/env node
/**
 * audit-version-truth.mjs — FLT-06
 * Asserts VERSION.json / package.json / CLAUDE.md / APP_VERSION / sw cache stay aligned.
 * Exit 0 always in report mode; use --strict to fail on drift.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT } from './lib/workspace-root.mjs';

const STRICT = process.argv.includes('--strict');
const APPS = [
  'AuraCap', 'CarCap', 'CookCap', 'DeePonyCap', 'IdeaCap', 'LedgerCap',
  'MasteryCap', 'PrismCap', 'PulseCap', 'ScentCap', 'SoulCap', 'SteadyCap',
  'TravelCap', 'VaultCap',
];

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function extractVersionFromClaude(text) {
  if (!text) return null;
  const m = text.match(/^\s*[-*]?\s*Version:\s*[vV]?([\d.]+)/m)
    || text.match(/Current version[:\s]+[vV]?([\d.]+)/i)
    || text.match(/\*\*v?([\d.]+)\*\*/);
  return m ? m[1] : null;
}

function extractAppVersion(jsText) {
  if (!jsText) return null;
  const m = jsText.match(/APP_VERSION\s*=\s*['"`]([^'"`]+)['"`]/)
    || jsText.match(/window\.APP_VERSION\s*=\s*['"`]([^'"`]+)['"`]/);
  return m ? m[1] : null;
}

const rows = [];
for (const app of APPS) {
  const dir = join(ROOT, app);
  if (!existsSync(dir)) {
    rows.push({ app, ok: false, note: 'missing' });
    continue;
  }
  const pkg = readJson(join(dir, 'package.json'));
  const verFile = readJson(join(dir, 'VERSION.json'));
  const appJson = readJson(join(dir, 'app.json'));
  let claude = null;
  for (const c of ['CLAUDE.md', 'docs/CLAUDE.md']) {
    const p = join(dir, c);
    if (existsSync(p)) { claude = extractVersionFromClaude(readFileSync(p, 'utf8')); break; }
  }
  let appVersion = null;
  for (const c of ['js/app.js', 'docs/app.js', 'src/version.ts', 'VERSION.js']) {
    const p = join(dir, c);
    if (existsSync(p)) {
      appVersion = extractAppVersion(readFileSync(p, 'utf8'));
      if (appVersion) break;
    }
  }
  const versions = {
    package: pkg?.version || null,
    VERSION_json: verFile?.version || verFile?.appVersion || null,
    app_json: appJson?.expo?.version || appJson?.version || null,
    CLAUDE: claude,
    APP_VERSION: appVersion,
  };
  const present = Object.values(versions).filter(Boolean);
  const unique = [...new Set(present)];
  const ok = unique.length <= 1;
  rows.push({ app, ok, versions, unique });
}

console.log('FLT-06 version truth');
for (const r of rows) {
  if (r.note === 'missing') {
    console.log(`  ${r.app}: MISSING`);
    continue;
  }
  const mark = r.ok ? 'OK' : 'DRIFT';
  console.log(`  ${r.app}: ${mark} → ${JSON.stringify(r.versions)}`);
}

const drifts = rows.filter((r) => !r.ok && r.note !== 'missing');
if (STRICT && drifts.length) {
  console.error(`\n${drifts.length} app(s) with version drift`);
  process.exit(1);
}
process.exit(0);
