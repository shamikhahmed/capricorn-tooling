/**
 * ARCH-10 tests — APP-REPORT Architecture section generator.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SPEC_SECTION_10_QUESTIONS,
  blankArchitectureTemplate,
  buildSpec10Answers,
  formatArchitectureSection,
  summarizeQueueFindings,
  upsertArchitectureSection,
} from '../app-report-section.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = path.resolve(HERE, '..', '..', '..');
const TEMPLATE = path.join(
  TOOLING_ROOT,
  'shared',
  'architecture',
  'templates',
  'APP-REPORT-ARCHITECTURE.md'
);

function sampleDoc() {
  return {
    app: 'pulsecap',
    analyzerVersion: '1.3.0',
    generatedAt: '2026-09-23T00:00:00.000Z',
    sourceCommit: 'abc123',
    stacks: ['vanilla-globals', 'html', 'service-worker'],
    stats: {
      files: 10,
      screens: 3,
      routes: 0,
      components: 0,
      hooks: 0,
      functions: 40,
      classes: 0,
      services: 0,
      stateHolders: 0,
      storageKeys: 2,
      tables: 0,
      apiEndpoints: 0,
      externalHosts: 0,
      envVars: 1,
      dependencies: 0,
      edges: {
        total: 50,
        byStatus: { VERIFIED: 45, INFERRED: 2, UNKNOWN: 1, BROKEN: 2 },
      },
      orphans: 5,
      unused: 3,
      dead: 0,
      duplicates: 1,
      brokenPaths: 2,
      hardcoded: 0,
      mock: 1,
      demo: 2,
      unknown: 1,
      securityItems: 0,
      featuresComplete: 0,
      featuresIncomplete: 2,
      findings: 4,
    },
    features: [
      {
        name: 'dashboard',
        overall: 'INCOMPLETE',
        chain: {
          ui: true,
          component: false,
          logic: true,
          state: false,
          service: false,
          persistence: true,
          display: false,
        },
      },
      {
        name: 'workout',
        overall: 'INCOMPLETE',
        chain: {},
      },
    ],
    findings: [{ id: 'F-1' }, { id: 'F-2' }, { id: 'F-3' }, { id: 'F-4' }],
    storage: [{ key: 'pulse:v1' }, { key: 'settings' }],
    env: [{ name: 'VITE_X' }],
    network: [],
    database: { engine: null, tables: [] },
    traces: { display: [], actions: [] },
    analyzerCoverage: {
      adaptersRun: ['vanilla-globals', 'html'],
      backendPresence: { supabase: false, firebase: false, sqlite: false },
      unresolved: ['journey traces not materialised'],
    },
  };
}

test('SPEC_SECTION_10_QUESTIONS has 11 items', () => {
  assert.equal(SPEC_SECTION_10_QUESTIONS.length, 11);
  assert.ok(SPEC_SECTION_10_QUESTIONS[0].text.includes('files'));
});

test('summarizeQueueFindings counts resolved vs remaining', () => {
  const sum = summarizeQueueFindings({
    items: [
      { status: 'open', priority: 'P1', kind: 'BROKEN' },
      { status: 'fixed', priority: 'P1', kind: 'BROKEN' },
      { status: 'done', priority: 'P2', kind: 'ORPHAN' },
      { status: 'open', priority: 'P2', kind: 'ORPHAN' },
    ],
  });
  assert.equal(sum.total, 4);
  assert.equal(sum.resolved, 2);
  assert.equal(sum.remaining, 2);
  assert.equal(sum.byPriority.P1, 1);
  assert.equal(sum.byPriority.P2, 1);
  assert.equal(sum.byKindOpen.BROKEN, 1);
  assert.equal(sum.byKindOpen.ORPHAN, 1);
});

test('buildSpec10Answers marks journey/control gaps honestly', () => {
  const rows = buildSpec10Answers(sampleDoc());
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  assert.equal(byId.Q1.status, 'answered');
  assert.equal(byId.Q5.status, 'gap');
  assert.equal(byId.Q6.status, 'answered');
  assert.ok(byId.Q6.answer.includes('pulse:v1'));
  assert.ok(byId.COV);
  assert.equal(byId.COV.status, 'gap');
});

test('formatArchitectureSection includes health, features, findings, §10', () => {
  const md = formatArchitectureSection({
    doc: sampleDoc(),
    queue: {
      items: [
        { status: 'open', priority: 'P1', kind: 'BROKEN' },
        { status: 'open', priority: 'P2', kind: 'ORPHAN' },
        { status: 'fixed', priority: 'P1', kind: 'SECURITY' },
      ],
    },
    appId: 'PulseCap',
    mapRel: 'qa/architecture/pilot-pulse',
    queueRel: 'qa/architecture/queue/PulseCap-ARCH-QUEUE.json',
    generatedAt: '2026-09-23T12:00:00.000Z',
  });
  assert.match(md, /^## Architecture\n/);
  assert.match(md, /Architecture track ≠ product Tier 1/);
  assert.match(md, /\| Files \| 10 \|/);
  assert.match(md, /\| Edges VERIFIED \| 45 \|/);
  assert.match(md, /\| `dashboard` \| \*\*INCOMPLETE\*\*/);
  assert.match(md, /\*\*3\*\* items · \*\*1\*\* resolved · \*\*2\*\* remaining/);
  assert.match(md, /\| Q1 \| `answered` \|/);
  assert.match(md, /\| Q5 \| `gap` \|/);
  assert.match(md, /qa\/finish-loop\/APP-REPORT\.md/);
  assert.match(md, /pilot-pulse/);
});

test('formatArchitectureSection without queue treats findings as remaining', () => {
  const md = formatArchitectureSection({
    doc: sampleDoc(),
    generatedAt: '2026-09-23T12:00:00.000Z',
  });
  assert.match(md, /No ARCH-07 queue loaded/);
  assert.match(md, /Map findings count: \*\*4\*\*/);
});

test('upsertArchitectureSection replaces existing Architecture block', () => {
  const report = [
    '# PulseCap — APP-REPORT',
    '',
    '## Status',
    'PASS',
    '',
    '## Architecture',
    'old stuff',
    '',
    '## Remaining',
    'matrix',
    '',
  ].join('\n');
  const section = formatArchitectureSection({
    doc: sampleDoc(),
    generatedAt: '2026-09-23T12:00:00.000Z',
  });
  const { markdown, action } = upsertArchitectureSection(report, section);
  assert.equal(action, 'replaced');
  assert.match(markdown, /## Status/);
  assert.match(markdown, /## Architecture/);
  assert.match(markdown, /\| Files \| 10 \|/);
  assert.doesNotMatch(markdown, /old stuff/);
  assert.match(markdown, /## Remaining/);
});

test('upsertArchitectureSection inserts when missing', () => {
  const report = '# App\n\n## Status\nok\n';
  const section = '## Architecture\n\nhello\n';
  const { markdown, action } = upsertArchitectureSection(report, section);
  assert.equal(action, 'inserted');
  assert.match(markdown, /## Status/);
  assert.match(markdown, /## Architecture\n\nhello/);
});

test('blankArchitectureTemplate and committed template exist', () => {
  const blank = blankArchitectureTemplate();
  assert.match(blank, /^## Architecture\n/);
  assert.match(blank, /REPLACE_APP_ID/);
  assert.ok(fs.existsSync(TEMPLATE), 'missing ' + TEMPLATE);
  const disk = fs.readFileSync(TEMPLATE, 'utf8');
  assert.match(disk, /## Architecture/);
  assert.match(disk, /qa\/finish-loop\/APP-REPORT\.md/);
});
