/**
 * C-33 — fixtures proving hardened tier1 gates fail on violations.
 * Run: node --test shared/testing/__tests__/tier1.test.mjs
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIER1 = path.join(HERE, '..', 'tier1.mjs');

function runTier1(fixtureRoot) {
  return spawnSync(process.execPath, [TIER1], {
    cwd: fixtureRoot,
    env: { ...process.env, TIER1_SKIP_CI: '1', TIER1_SKIP_LH: '0', TIER1_SKIP_MATRIX: '0' },
    encoding: 'utf8',
  });
}

function makeFixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tier1-fx-'));
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  }
  return root;
}

test('C-29: raw hex in css/app.css fails (no brandOk exemption)', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1', swCache: 'fx-v1' }),
    'package.json': JSON.stringify({ name: 'fx', scripts: { tier1: 'node tier1.mjs' } }),
    'sw.js': "const CACHE='fx-v1';\n",
    'css/app.css': 'body{color:#ff00aa;font-size:10px;outline:none !important;}\n',
    'index.html': '<html><body></body></html>\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
    'qa/finish-loop/SINKS.md': '# sinks\n',
  });
  const r = runTier1(root);
  assert.notEqual(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout + r.stderr, /raw-hex|kill:raw-hex|FAIL/i);
});

test('C-30: stub lighthouse JSON fails', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'fx' }),
    'index.js': 'window.__APP_READY__ = true;\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
    'qa/finish-loop/lighthouse/home.json': JSON.stringify({
      userAgent: 'tier1-evidence-stub',
      categories: { performance: { score: null }, accessibility: { score: null }, 'best-practices': { score: null } },
    }),
  });
  const r = runTier1(root);
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /stub|null|lighthouse/i);
});

test('C-32: missing axe dir fails', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'Fx' }),
    'index.js': 'window.__APP_READY__ = true;\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
    'qa/finish-loop/CI-WORKFLOW.txt': 'Verify and deploy\n',
    'qa/finish-loop/matrix-results.json': JSON.stringify({
      timestamp: '2099-01-01T00:00:00.000Z',
      routes: ['home'],
      viewports: ['iphone-16'],
      themes: ['light', 'dark'],
      shotCount: 2,
      failures: [],
    }),
    'tests/finish-matrix.spec.mjs': 'export {};\n',
  });
  const r = spawnSync(process.execPath, [TIER1], {
    cwd: root,
    env: { ...process.env, TIER1_SKIP_CI: '1', TIER1_SKIP_LH: '1', TIER1_SKIP_GALLERY: '1' },
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /axe:dir|axe/i);
});

test('C-32: __APP_READY__ only in tests fails', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'Fx' }),
    'e2e/app.spec.js': 'await page.waitForFunction(() => window.__APP_READY__);\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
  });
  const r = spawnSync(process.execPath, [TIER1], {
    cwd: root,
    env: {
      ...process.env,
      TIER1_SKIP_CI: '1',
      TIER1_SKIP_LH: '1',
      TIER1_SKIP_MATRIX: '1',
      TIER1_SKIP_AXE: '1',
      TIER1_SKIP_GALLERY: '1',
    },
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /app-ready/i);
});

test('C-32: test.skip without gallery allowlist fails', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'Fx' }),
    'index.js': 'window.__APP_READY__ = true;\n',
    'e2e/x.spec.js': "test.skip('nope', () => {});\n",
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
  });
  const r = spawnSync(process.execPath, [TIER1], {
    cwd: root,
    env: {
      ...process.env,
      TIER1_SKIP_CI: '1',
      TIER1_SKIP_LH: '1',
      TIER1_SKIP_MATRIX: '1',
      TIER1_SKIP_AXE: '1',
      TIER1_SKIP_GALLERY: '1',
    },
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /test-skip/i);
});

test('C-30: null LCP/TBT/CLS fails', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'Fx' }),
    'index.js': 'window.__APP_READY__ = true;\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
    'qa/finish-loop/lighthouse/home.json': JSON.stringify({
      userAgent: 'Mozilla/5.0',
      fetchTime: '2099-01-01T00:00:00.000Z',
      categories: {
        performance: { score: 0.95 },
        accessibility: { score: 0.99 },
        'best-practices': { score: 0.99 },
      },
      audits: {},
    }),
  });
  const r = spawnSync(process.execPath, [TIER1], {
    cwd: root,
    env: { ...process.env, TIER1_SKIP_CI: '1', TIER1_SKIP_MATRIX: '1', TIER1_SKIP_AXE: '1', TIER1_SKIP_GALLERY: '1' },
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /LCP\/TBT\/CLS|missing LCP/i);
});

test('C-29: rem font-size below 0.6875rem counts as sub-11', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1', swCache: 'fx-v1' }),
    'package.json': JSON.stringify({ name: 'fx' }),
    'sw.js': "const CACHE='fx-v1';\n",
    'tokens.css': '.x{font-size:0.5rem;}\n',
    'index.js': 'window.__APP_READY__ = true;\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
    'qa/finish-loop/SINKS.md': '# sinks\n',
  });
  const r = spawnSync(process.execPath, [TIER1], {
    cwd: root,
    env: {
      ...process.env,
      TIER1_SKIP_CI: '1',
      TIER1_SKIP_LH: '1',
      TIER1_SKIP_MATRIX: '1',
      TIER1_SKIP_AXE: '1',
      TIER1_SKIP_GALLERY: '1',
    },
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /sub-11/i);
});

test('C-31: missing matrix-results.json fails', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'fx' }),
    'tests/finish-matrix.spec.mjs': 'export {};\n',
    'index.js': 'window.__APP_READY__ = true;\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
  });
  const r = spawnSync(process.execPath, [TIER1], {
    cwd: root,
    env: { ...process.env, TIER1_SKIP_CI: '1', TIER1_SKIP_LH: '1', TIER1_SKIP_AXE: '1', TIER1_SKIP_GALLERY: '1' },
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /matrix:results|matrix-results/i);
});
