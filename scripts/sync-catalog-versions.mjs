#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';
const APPS = ['VaultCap', 'PulseCap', 'PrismCap', 'SteadyCap', 'LedgerCap', 'DeePonyCap', 'ScentCap', 'AuraCap'];

const versions = {};
for (const app of APPS) {
  const v = JSON.parse(readFileSync(join(ROOT, app, 'VERSION.json'), 'utf8'));
  versions[app.toLowerCase().replace('deeponycap', 'deeponycap')] = v.version;
}

let catalog = readFileSync(join(ROOT, 'shamikhahmed.github.io/js/products-data.js'), 'utf8');
for (const [slug, ver] of Object.entries(versions)) {
  const key = slug === 'scentcap' ? 'scentcap' : slug;
  if (catalog.includes(`${key}: {`) && catalog.includes(`${key}:`)) {
    if (new RegExp(`${key}:[\\s\\S]*?ver:`).test(catalog)) {
      catalog = catalog.replace(new RegExp(`(${key}:[\\s\\S]*?ver: )'[^']*'`), `$1'${ver}'`);
    } else {
      catalog = catalog.replace(
        new RegExp(`(${key}:\\s*\\{[\\s\\S]*?category: '[^']*',)`),
        `$1\n    ver: '${ver}',`,
      );
    }
  }
}

writeFileSync(join(ROOT, 'shamikhahmed.github.io/js/products-data.js'), catalog);
console.log('Synced catalog versions:', versions);
