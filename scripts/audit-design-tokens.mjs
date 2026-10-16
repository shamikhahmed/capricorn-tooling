#!/usr/bin/env node
/** Compare catalog accent tokens vs pitch :root --accent declarations */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';
const code = readFileSync(join(ROOT, 'shamikhahmed.github.io/js/products-data.js'), 'utf8');
const catalog = new Function(`${code}; return PRODUCTS;`)();

const paths = {
  vaultcap: 'VaultCap/pitch.html',
  pulsecap: 'PulseCap/pitch.html',
  prismcap: 'PrismCap/pitch.html',
  steadycap: 'SteadyCap/pitch.html',
  ledgercap: 'LedgerCap/pitch.html',
  deeponycap: 'DeePonyCap/pitch.html',
  scentcap: 'ScentCap/public/pitch.html',
  auracap: 'AuraCap/public/pitch.html',
};

// Documented exceptions: the deck follows the app's own brand, not the hub tile colour.
const DECK_OVERRIDE = {
  vaultcap: '#ffffff', // VaultCap is monochrome by decision (CHANGELOG 5.1.x; tests/satellite-pages.spec.js forbids blue)
};

let issues = 0;
for (const [slug, rel] of Object.entries(paths)) {
  const p = catalog[slug];
  const path = join(ROOT, rel);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, 'utf8');
  const m = html.match(/--accent:\s*([^;}\s]+)/);
  const deck = m?.[1]?.toLowerCase();
  const cat = (DECK_OVERRIDE[slug] || p.accent).toLowerCase();
  const ok = deck === cat;
  console.log(`${ok ? '✓' : '✗'} ${slug}: deck=${deck || 'missing'} catalog=${cat}`);
  if (!ok) issues += 1;
}
process.exit(issues ? 1 : 0);
