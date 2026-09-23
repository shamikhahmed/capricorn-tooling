/**
 * ARCH-09 offline tests — pilot discovery + regenerate skip honesty (no Cap apps required).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PILOT_SLUG_TO_CONFIG,
  discoverPilotTargets,
  regeneratePilot,
  regeneratePilots,
  resolvePilotAnalyzeRoot,
  resolvePilotRepoRoot,
} from '../regenerate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = path.resolve(HERE, '..', '..', '..');

test('PILOT_SLUG_TO_CONFIG covers every fleet pilot slug', () => {
  const slugs = Object.keys(PILOT_SLUG_TO_CONFIG);
  assert.equal(slugs.length, 17);
  assert.ok(slugs.includes('cook'));
  assert.ok(slugs.includes('pulse'));
  assert.ok(slugs.includes('soul'));
  assert.ok(slugs.includes('hub'));
});

test('discoverPilotTargets finds committed pilot configs', () => {
  const targets = discoverPilotTargets(TOOLING_ROOT);
  assert.equal(targets.length, 17);
  for (const t of targets) {
    assert.ok(fs.existsSync(t.configPath), 'missing config ' + t.configPath);
    assert.equal(path.basename(t.mapDir), 'pilot-' + t.slug);
  }
});

test('SoulCap analyze root prefers docs/ when present under a fake tree', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch09-soul-'));
  const tooling = path.join(tmp, 'capricorn-tooling');
  const soul = path.join(tmp, 'SoulCap');
  fs.mkdirSync(path.join(soul, 'docs'), { recursive: true });
  fs.mkdirSync(tooling, { recursive: true });
  // resolve uses tooling/../SoulCap
  const root = resolvePilotRepoRoot(tooling, 'soul');
  assert.equal(root, soul);
  const analyze = resolvePilotAnalyzeRoot(tooling, 'soul');
  assert.equal(analyze, path.join(soul, 'docs'));
});

test('regeneratePilot skips honestly when Cap sibling missing', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch09-nosib-'));
  const tooling = path.join(tmp, 'capricorn-tooling');
  fs.mkdirSync(path.join(tooling, 'qa', 'architecture', 'pilots'), { recursive: true });
  const r = regeneratePilot({ toolingRoot: tooling, slug: 'cook' });
  assert.equal(r.ok, false);
  assert.equal(r.skipped, true);
  assert.equal(r.reason, 'no_sibling_app_root');
});

test('regeneratePilots --stale-style skip when no maps and no siblings', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arch09-batch-'));
  const tooling = path.join(tmp, 'capricorn-tooling');
  fs.mkdirSync(path.join(tooling, 'qa', 'architecture', 'pilots'), {
    recursive: true,
  });
  // Copy one real config name path expectation — configs missing → still skips via no sibling
  const { results, summary } = regeneratePilots({
    toolingRoot: tooling,
    slugs: ['cook', 'pulse'],
    staleOnly: true,
  });
  assert.equal(results.length, 2);
  assert.equal(summary.failed, 0);
  assert.equal(summary.skipped, 2);
  assert.ok(results.every((r) => r.reason === 'no_sibling_app_root'));
});
