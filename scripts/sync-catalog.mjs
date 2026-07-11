#!/usr/bin/env node
/**
 * Catalog drift report — compares each Cap app's VERSION.json against the
 * version strings found on its catalog page in shamikhahmed.github.io.
 * Report-only (no writes). Run: node scripts/sync-catalog.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = join(ROOT, 'shamikhahmed.github.io');

const APPS = [
  'AuraCap', 'DeePonyCap', 'LedgerCap', 'MasteryCap', 'PrismCap',
  'PulseCap', 'ScentCap', 'SteadyCap', 'VaultCap',
];

let drift = 0;
for (const app of APPS) {
  const vPath = join(ROOT, app, 'VERSION.json');
  const pagePath = join(SITE, `${app.toLowerCase()}.html`);
  if (!existsSync(vPath)) { console.log(`?  ${app}: no VERSION.json`); continue; }
  const version = JSON.parse(readFileSync(vPath, 'utf8')).version;
  if (!existsSync(pagePath)) { console.log(`?  ${app}: no catalog page (${app.toLowerCase()}.html)`); drift++; continue; }
  const html = readFileSync(pagePath, 'utf8');
  const mentioned = html.includes(version);
  if (mentioned) console.log(`OK ${app}: v${version} on catalog page`);
  else { console.log(`!! ${app}: repo at v${version}, catalog page does NOT mention it — stale`); drift++; }
}
console.log(drift ? `\n${drift} page(s) drifted — update catalog copy/screenshots.` : '\nCatalog in sync.');
process.exit(0); // report-only; never fails builds
