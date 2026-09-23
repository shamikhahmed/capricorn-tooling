/**
 * ARCH-07 tests — findings → Finish Program queue items.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalizeAppId,
  sortFindingsForQueue,
  findingsToQueueItems,
  formatQueueMarkdown,
  buildFleetQueueIndex,
  doneWhenForKind,
} from '../findings-to-queue.mjs';

test('canonicalizeAppId maps pilot slugs to Cap IDs', () => {
  assert.equal(canonicalizeAppId('pulse'), 'PulseCap');
  assert.equal(canonicalizeAppId('pulsecap'), 'PulseCap');
  assert.equal(canonicalizeAppId('PulseCap'), 'PulseCap');
  assert.equal(canonicalizeAppId('scent'), 'ScentCap');
  assert.equal(canonicalizeAppId('scentcap'), 'ScentCap');
  assert.equal(canonicalizeAppId('deefoodie'), 'DeeFoodieApp');
  assert.equal(canonicalizeAppId('SoulCap'), 'SoulCap');
  assert.equal(canonicalizeAppId('hub'), 'CapricornOS');
  assert.equal(canonicalizeAppId('lab'), 'CapricornLab');
  assert.equal(canonicalizeAppId('shamikhahmed.github.io'), 'CapricornOS');
  assert.equal(canonicalizeAppId('capricorn-lab'), 'CapricornLab');
});

test('sortFindingsForQueue: risk before warn before info; stable by kind+id', () => {
  const sorted = sortFindingsForQueue([
    { id: 'F-003-ORPHAN', kind: 'ORPHAN', severity: 'info' },
    { id: 'F-001-SECURITY', kind: 'SECURITY', severity: 'risk' },
    { id: 'F-002-BROKEN', kind: 'BROKEN', severity: 'warn' },
    { id: 'F-004-BROKEN', kind: 'BROKEN', severity: 'warn' },
  ]);
  assert.deepEqual(
    sorted.map(function (f) {
      return f.id;
    }),
    ['F-001-SECURITY', 'F-002-BROKEN', 'F-004-BROKEN', 'F-003-ORPHAN']
  );
});

test('findingsToQueueItems: 1:1 IDs PulseCap-ARCH-01… with doneWhen', () => {
  const doc = {
    app: 'pulsecap',
    analyzerVersion: '1.3.0',
    sourceCommit: 'abc',
    findings: [
      {
        id: 'F-010-ORPHAN',
        kind: 'ORPHAN',
        severity: 'info',
        explanation: 'Unreachable: file:x.js#x',
        nodes: ['file:x.js#x'],
        evidence: [{ file: 'x.js', line: 1, snippet: 'export' }],
      },
      {
        id: 'F-001-BROKEN',
        kind: 'BROKEN',
        severity: 'warn',
        explanation: 'Edge target missing',
        nodes: ['event:a#b'],
        evidence: [{ file: 'a.js', line: 10, snippet: "'b':missing" }],
      },
      {
        id: 'F-002-SECURITY',
        kind: 'SECURITY',
        severity: 'risk',
        explanation: 'Client-exposed secret-looking env',
        nodes: ['env:VITE_KEY'],
        evidence: [{ file: 'src/api.ts', line: 3, snippet: 'import.meta.env.VITE_KEY' }],
      },
    ],
  };
  const q = findingsToQueueItems(doc);
  assert.equal(q.appId, 'PulseCap');
  assert.equal(q.items.length, 3);
  assert.equal(q.items[0].id, 'PulseCap-ARCH-01');
  assert.equal(q.items[0].kind, 'SECURITY');
  assert.equal(q.items[0].priority, 'P0');
  assert.equal(q.items[1].id, 'PulseCap-ARCH-02');
  assert.equal(q.items[1].kind, 'BROKEN');
  assert.equal(q.items[1].priority, 'P1');
  assert.equal(q.items[2].id, 'PulseCap-ARCH-03');
  assert.equal(q.items[2].findingId, 'F-010-ORPHAN');
  assert.ok(q.items[0].doneWhen.includes('Remediate'));
  assert.ok(q.items[1].doneWhen.includes('broken'));
  assert.ok(q.items[2].doneWhen.includes('Never auto-delete'));
  assert.equal(q.counts.bySeverity.risk, 1);
  assert.equal(q.counts.bySeverity.warn, 1);
  assert.equal(q.counts.bySeverity.info, 1);
});

test('formatQueueMarkdown includes priority slice and JSON pointer', () => {
  const q = findingsToQueueItems({
    app: 'CarCap',
    findings: [
      {
        id: 'F-001-BROKEN',
        kind: 'BROKEN',
        severity: 'warn',
        explanation: 'broken edge',
        evidence: [{ file: 'app.js', line: 2, snippet: 'go' }],
      },
      {
        id: 'F-002-ORPHAN',
        kind: 'ORPHAN',
        severity: 'info',
        explanation: 'orphan file',
        evidence: [{ file: 'extra.js', line: 1, snippet: 'x' }],
      },
    ],
  });
  const md = formatQueueMarkdown(q);
  assert.ok(md.includes('CarCap-ARCH-01'));
  assert.ok(md.includes('Priority slice'));
  assert.ok(md.includes('CarCap-ARCH-QUEUE.json'));
  assert.ok(md.includes('Never auto-delete') || md.includes('never auto-delete'));
});

test('buildFleetQueueIndex totals apps and items', () => {
  const a = findingsToQueueItems({
    app: 'PulseCap',
    findings: [{ id: 'F-001', kind: 'ORPHAN', severity: 'info', explanation: 'a', evidence: [] }],
  });
  const b = findingsToQueueItems({
    app: 'ScentCap',
    findings: [
      { id: 'F-001', kind: 'SECURITY', severity: 'risk', explanation: 's', evidence: [] },
      { id: 'F-002', kind: 'ORPHAN', severity: 'info', explanation: 'o', evidence: [] },
    ],
  });
  const idx = buildFleetQueueIndex([
    { appId: a.appId, counts: a.counts, meta: a.meta },
    { appId: b.appId, counts: b.counts, meta: b.meta },
  ]);
  assert.equal(idx.json.apps, 2);
  assert.equal(idx.json.totalItems, 3);
  assert.ok(idx.markdown.includes('PulseCap'));
  assert.ok(idx.markdown.includes('ScentCap'));
});

test('doneWhenForKind covers ARCH-07 verbs', () => {
  assert.ok(doneWhenForKind('ORPHAN').includes('Investigate'));
  assert.ok(doneWhenForKind('DUPLICATE').includes('Consolidate'));
  assert.ok(doneWhenForKind('BROKEN').includes('root'));
});
