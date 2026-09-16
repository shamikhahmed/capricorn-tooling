/**
 * ARCH-01 fixture suite — SPEC §8
 * Run: node --test shared/architecture/__tests__/architecture.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  analyzeRepo,
  validateArchitectureData,
  withoutGeneratedAt,
  stableStringify,
  containsSecret,
  ArchitectureGraph,
  runAnalyses,
  makeEvidence,
  writeAuditMarkdown,
} from '../core/index.mjs';
import { fingerprintBody, similarity } from '../core/analyses/fingerprint.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, 'fixtures');
const SECRET = 'supersecretvalue123NEVERLEAK';

function analyzeFixture(name, extra) {
  return analyzeRepo(path.join(FIX, name), Object.assign({ writeAudit: false }, extra || {}));
}

test('schema validates analyzer output (vanilla-dispatch)', () => {
  const doc = analyzeFixture('vanilla-dispatch');
  const v = validateArchitectureData(doc);
  assert.equal(v.ok, true, v.errors.join('; '));
  assert.ok(doc.nodes.length > 0);
  assert.ok(doc.stats.functions >= 1);
});

test('deterministic JSON: two runs identical except generatedAt', () => {
  const a = analyzeFixture('vanilla-dispatch', { generatedAt: '2026-01-01T00:00:00.000Z' });
  const b = analyzeFixture('vanilla-dispatch', { generatedAt: '2026-12-31T23:59:59.000Z' });
  assert.notEqual(a.generatedAt, b.generatedAt);
  assert.deepEqual(withoutGeneratedAt(a), withoutGeneratedAt(b));
  // stableStringify of stripped docs must match exactly
  assert.equal(stableStringify(withoutGeneratedAt(a)), stableStringify(withoutGeneratedAt(b)));
});

test('vanilla-dispatch: string dispatch + undefined handler → BROKEN', () => {
  const doc = analyzeFixture('vanilla-dispatch');
  const broken = doc.edges.filter(function (e) { return e.status === 'BROKEN'; });
  assert.ok(broken.length >= 1, 'expected BROKEN edge for missingHandler');
  const findings = doc.findings.filter(function (f) { return f.kind === 'BROKEN'; });
  assert.ok(findings.length >= 1, 'expected BROKEN finding');
  // save handler should be wired
  const saveEdges = doc.edges.filter(function (e) {
    return e.type === 'HANDLES' && /save/i.test(e.label || e.to || '');
  });
  assert.ok(saveEdges.length >= 1 || doc.nodes.some(function (n) {
    return n.type === 'function' && n.name === 'save';
  }));
});

test('similar-names: no CALLS edge and no DUPLICATE finding', () => {
  const doc = analyzeFixture('similar-names');
  const fns = doc.nodes.filter(function (n) {
    return n.type === 'function' && /formatDate/.test(n.name);
  });
  assert.equal(fns.length, 2);
  const ids = new Set(fns.map(function (n) { return n.id; }));
  const cross = doc.edges.filter(function (e) {
    return e.type === 'CALLS' && ids.has(e.from) && ids.has(e.to);
  });
  assert.equal(cross.length, 0, 'similar names must not create CALLS edge');
  const dup = doc.findings.filter(function (f) { return f.kind === 'DUPLICATE'; });
  assert.equal(dup.length, 0, 'unrelated similar names must not be DUPLICATE');
});

test('genuine duplicate: DUPLICATE finding', () => {
  const doc = analyzeFixture('duplicate');
  const dup = doc.findings.filter(function (f) { return f.kind === 'DUPLICATE'; });
  assert.ok(dup.length >= 1, 'expected DUPLICATE finding for calcTotalA/B');
  const flagged = doc.nodes.filter(function (n) {
    return (n.flags || []).indexOf('DUPLICATED') !== -1;
  });
  assert.ok(flagged.length >= 2);
});

test('hardcoded dashboard number → HARDCODED', () => {
  const doc = analyzeFixture('hardcoded-dashboard');
  const hard = doc.findings.filter(function (f) { return f.kind === 'HARDCODED'; });
  assert.ok(hard.length >= 1, 'expected HARDCODED finding');
  assert.ok(
    doc.traces.display.some(function (t) { return t.source === 'HARDCODED' && t.shown === '42'; }) ||
    hard.some(function (f) { return /42/.test(f.explanation); })
  );
});

test('env-secret: secret value never appears in output', () => {
  const doc = analyzeFixture('env-secret');
  const blob = stableStringify(doc);
  assert.equal(containsSecret(blob, SECRET), false, 'secret value leaked into JSON');
  const audit = writeAuditMarkdown(doc, path.join(FIX, 'env-secret'));
  assert.equal(containsSecret(audit, SECRET), false, 'secret value leaked into AUDIT.md');
  assert.ok(doc.env.some(function (e) { return e.name === 'API_SECRET'; }));
  assert.ok(blob.includes('API_SECRET'));
  const rec = doc.env.find(function (e) { return e.name === 'API_SECRET'; });
  assert.ok((rec.definedIn || []).some(function (d) { return /key only/.test(d); }));
});

test('service-worker missing precache → BROKEN', () => {
  const doc = analyzeFixture('service-worker-missing');
  const brokenCache = doc.edges.filter(function (e) {
    return e.type === 'CACHES' && e.status === 'BROKEN';
  });
  assert.ok(brokenCache.length >= 1, 'expected BROKEN CACHES edge for missing-file.js');
  assert.ok(doc.findings.some(function (f) {
    return f.kind === 'BROKEN' && /missing-file/.test(f.explanation);
  }));
});

test('react-router fixture: routes extracted', () => {
  const doc = analyzeFixture('react-router');
  const routes = doc.nodes.filter(function (n) { return n.type === 'route'; });
  assert.ok(routes.some(function (r) { return r.name === '/'; }));
  assert.ok(routes.some(function (r) { return r.name === '/about'; }));
  assert.ok(doc.stacks.includes('routes-react') || doc.stacks.includes('es-modules'));
});

test('next app dir: page routes', () => {
  const doc = analyzeFixture('next-app');
  const routes = doc.nodes.filter(function (n) { return n.type === 'route'; });
  assert.ok(routes.some(function (r) { return r.name === '/' || r.file.includes('app/page'); }));
  assert.ok(routes.some(function (r) { return r.name === '/settings' || r.file.includes('settings/page'); }));
});

test('expo + AsyncStorage: screens and storage keys', () => {
  const doc = analyzeFixture('expo-nav');
  assert.ok(doc.nodes.some(function (n) { return n.type === 'screen' && n.name === 'Home'; }));
  assert.ok(doc.nodes.some(function (n) { return n.type === 'screen' && n.name === 'Profile'; }));
  assert.ok(doc.storage.some(function (s) { return s.key === 'user'; }));
});

test('dexie stores → tables', () => {
  const doc = analyzeFixture('dexie-idb');
  assert.equal(doc.database.engine, 'indexeddb');
  const names = (doc.database.tables || []).map(function (t) { return t.name; });
  assert.ok(names.includes('friends'));
  assert.ok(names.includes('pets'));
});

test('nest-prisma: models and endpoints', () => {
  const doc = analyzeFixture('nest-prisma');
  assert.equal(doc.database.engine, 'postgres');
  const tables = (doc.database.tables || []).map(function (t) { return t.name; });
  assert.ok(tables.includes('User'));
  assert.ok(tables.includes('Post'));
  assert.ok(doc.nodes.some(function (n) {
    return n.type === 'api-endpoint' && /GET/.test(n.name);
  }));
});

test('dart-flutter: regex fallback always runs', () => {
  const doc = analyzeFixture('dart-flutter');
  assert.ok(doc.stacks.includes('dart-flutter') || doc.nodes.some(function (n) {
    return /\.dart$/.test(n.file);
  }));
  assert.ok(doc.edges.some(function (e) { return e.type === 'IMPORTS'; }) ||
    doc.nodes.some(function (n) { return n.type === 'file' && n.file.endsWith('.dart'); }));
  // If Dart SDK missing, coverage note should say so (when unresolved recorded)
  // Always at least regex-inferred imports
  assert.ok(doc.nodes.length >= 1);
});

test('fingerprint: similar unrelated bodies stay below duplicate threshold', () => {
  const a = fingerprintBody('function formatDateUser(d){var y=d.getFullYear();var m=d.getMonth()+1;return y+\"-\"+m;}');
  const b = fingerprintBody('function formatDateOrder(ts){var invoice=ts;var prefix=\"ORD\";return prefix+String(invoice);}');
  assert.ok(similarity(a, b) < 0.85);
});

test('core analyses on hand-built graph: BROKEN missing target', () => {
  const g = new ArchitectureGraph();
  g.addNode({ type: 'function', name: 'caller', file: 'x.js', line: 1 });
  g.addEdge({
    from: 'function:x.js#caller',
    to: 'function:x.js#doesNotExist',
    type: 'CALLS',
    status: 'VERIFIED',
    evidence: [makeEvidence('x.js', 2, 'doesNotExist()')],
  });
  runAnalyses(g, {});
  const edges = Array.from(g.edges.values());
  assert.equal(edges[0].status, 'BROKEN');
  assert.ok(g.findings.some(function (f) { return f.kind === 'BROKEN'; }));
});
