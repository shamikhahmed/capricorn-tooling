/**
 * ARCH-03 adapter packaging tests
 * Run: npm run architecture:test
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { analyzeRepo, stableStringify, containsSecret } from '../core/index.mjs';
import { listAdapterIds, ADAPTERS, runAdapters } from '../adapters/index.mjs';
import { ArchitectureGraph } from '../core/graph.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, 'fixtures');
const WRANGLE_SECRET = 'do-not-store-this-value-in-graph';

function analyzeFixture(name, extra) {
  return analyzeRepo(path.join(FIX, name), Object.assign({ writeAudit: false }, extra || {}));
}

test('ARCH-03 adapters registry covers SPEC §3 ids', () => {
  const ids = listAdapterIds();
  const required = [
    'vanilla-globals',
    'html',
    'service-worker',
    'es-modules',
    'routes-react',
    'env-config',
    'cloudflare-worker',
    'nest-prisma',
    'dart-flutter',
    'backend-presence',
  ];
  for (const id of required) {
    assert.ok(ids.includes(id), 'missing adapter ' + id);
  }
  assert.equal(ADAPTERS.length, required.length);
});

test('Cap static (vanilla-globals): adapters run + verified backend absence', () => {
  const doc = analyzeFixture('vanilla-dispatch');
  const ran = (doc.analyzerCoverage && doc.analyzerCoverage.adaptersRun) || [];
  assert.ok(ran.includes('vanilla-globals'), 'vanilla-globals should run');
  assert.ok(ran.includes('html'), 'html should run');
  assert.ok(ran.includes('env-config'), 'env-config always runs');
  assert.ok(ran.includes('backend-presence'), 'backend-presence always runs');
  const bp = doc.analyzerCoverage.backendPresence;
  assert.equal(bp.supabase, false);
  assert.equal(bp.firebase, false);
  assert.equal(bp.sqlite, false);
  assert.ok(
    (doc.analyzerCoverage.unresolved || []).some(function (u) {
      return /verified absence/.test(u);
    })
  );
});

test('routes-react adapter owns Route extraction (react-router fixture)', () => {
  const doc = analyzeFixture('react-router');
  const ran = (doc.analyzerCoverage && doc.analyzerCoverage.adaptersRun) || [];
  assert.ok(ran.includes('routes-react'));
  assert.ok(ran.includes('es-modules'));
  const routes = doc.nodes.filter(function (n) { return n.type === 'route'; });
  assert.ok(routes.some(function (r) { return r.name === '/'; }));
  assert.ok(routes.some(function (r) { return r.name === '/about'; }));
});

test('cloudflare-worker: bindings by name; secret values never stored', () => {
  const doc = analyzeFixture('cloudflare-worker');
  assert.ok(doc.stacks.includes('cloudflare-worker'));
  const ran = doc.analyzerCoverage.adaptersRun || [];
  assert.ok(ran.includes('cloudflare-worker'));

  assert.ok(doc.nodes.some(function (n) {
    return n.type === 'storage' && n.name === 'SESSIONS_KV';
  }));
  assert.ok(doc.nodes.some(function (n) {
    return n.type === 'storage' && n.name === 'BLOBS_BUCKET';
  }));
  assert.ok(doc.env.some(function (e) { return e.name === 'API_TOKEN'; }));
  assert.ok(doc.env.some(function (e) { return e.name === 'PUBLIC_ORIGIN'; }));

  const blob = stableStringify(doc);
  assert.equal(containsSecret(blob, WRANGLE_SECRET), false, 'wrangler var value leaked');

  assert.ok(doc.nodes.some(function (n) {
    return n.type === 'api-endpoint' && /\/api\/health/.test(n.name);
  }));
  assert.ok(doc.network.some(function (n) {
    return n.host === 'upstream.example.invalid';
  }));
});

test('backend-presence detects supabase when present', () => {
  const doc = analyzeFixture('supabase-present');
  assert.equal(doc.analyzerCoverage.backendPresence.supabase, true);
  assert.ok(doc.stacks.includes('supabase'));
  assert.ok(doc.nodes.some(function (n) {
    return n.type === 'database' && n.name === 'supabase';
  }));
});

test('runAdapters is idempotent on empty graph stacks for always adapters', () => {
  const g = new ArchitectureGraph();
  const ran = runAdapters(path.join(FIX, 'vanilla-dispatch'), g, [], {});
  assert.ok(ran.includes('env-config'));
  assert.ok(ran.includes('backend-presence'));
  assert.ok(!ran.includes('vanilla-globals'), 'vanilla should not run without stack');
});
