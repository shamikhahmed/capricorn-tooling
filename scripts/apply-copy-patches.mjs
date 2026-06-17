#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['copy-patches.json', 'copy-patches-engineering.json'];

let applied = 0;
let skipped = 0;

for (const file of files) {
  const patches = JSON.parse(readFileSync(join(SCRIPTS_DIR, file), 'utf8'));
  for (const { file: rel, old_string, new_string } of patches) {
    const path = join(ROOT, rel);
    if (!existsSync(path)) { skipped += 1; continue; }
    const html = readFileSync(path, 'utf8');
    if (!html.includes(old_string)) { skipped += 1; continue; }
    writeFileSync(path, html.replace(old_string, new_string));
    applied += 1;
  }
}

console.log(`Applied ${applied}, skipped ${skipped}.`);
