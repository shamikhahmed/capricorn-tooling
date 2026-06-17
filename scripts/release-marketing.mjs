#!/usr/bin/env node
/** Run full marketing release: catalog sync → deck enhancement */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { WORKSPACE_ROOT, SCRIPTS_DIR } from './lib/workspace-root.mjs';

function run(script) {
  const r = spawnSync('node', [join(SCRIPTS_DIR, script)], { stdio: 'inherit', cwd: WORKSPACE_ROOT });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run('apply-copy-patches.mjs');
run('sync-catalog-versions.mjs');
run('sync-versions.mjs');
run('sync-marketing-copy.mjs');
run('enhance-decks.mjs');
console.log('\nMarketing release pipeline complete.');
