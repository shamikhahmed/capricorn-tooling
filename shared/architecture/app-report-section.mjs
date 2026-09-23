/**
 * ARCH-10 — APP-REPORT "Architecture" section generator.
 *
 * Spec: CURSOR-MASTER-PROMPT §2.6 ARCH-10 + SPEC §6 / §10.
 * Interpretation (documented in qa/architecture/LOG.md):
 *   - Emit a paste-ready ## Architecture markdown block from pilot
 *     architecture-data.json (+ optional ARCH-07 queue for resolved/remaining).
 *   - Also ship a blank shared template for apps without a map yet.
 *   - Never invent health numbers; never claim product Tier 1.
 *   - SPEC §10 answers are map-derived where data exists; gaps are stated honestly.
 */

import { canonicalizeAppId } from './findings-to-queue.mjs';

/** SPEC §10 questions (stable order for the report). */
export const SPEC_SECTION_10_QUESTIONS = [
  {
    id: 'Q1',
    text: 'What files, screens, components, functions, services and state exist?',
  },
  {
    id: 'Q2',
    text: 'Where does each piece of data come from and where does it go?',
  },
  {
    id: 'Q3',
    text: 'What does each screen depend on?',
  },
  {
    id: 'Q4',
    text: 'What depends on each service?',
  },
  {
    id: 'Q5',
    text: 'What happens when a user presses each primary control?',
  },
  {
    id: 'Q6',
    text: 'Where is data stored?',
  },
  {
    id: 'Q7',
    text: 'Which APIs, hosts, database objects and env vars are used?',
  },
  {
    id: 'Q8',
    text: 'Which code is disconnected, unused, duplicated or dead?',
  },
  {
    id: 'Q9',
    text: 'Which displayed values are hardcoded, mock/demo or without a verified source?',
  },
  {
    id: 'Q10',
    text: 'Which connections are broken or unknown?',
  },
  {
    id: 'Q11',
    text: 'What would be affected if I changed this?',
  },
];

const DONE_STATUSES = new Set([
  'done',
  'fixed',
  'resolved',
  'closed',
  'wontfix',
  'wont-fix',
  'accepted',
]);

/**
 * @param {object} [stats]
 * @returns {object}
 */
function edgeStatus(stats) {
  const edges = (stats && stats.edges) || {};
  const by = edges.byStatus || {};
  return {
    total: edges.total || 0,
    verified: by.VERIFIED || 0,
    inferred: by.INFERRED || 0,
    unknown: by.UNKNOWN || 0,
    broken: by.BROKEN || 0,
  };
}

/**
 * Summarize queue items for resolved/remaining counts.
 * @param {{ items?: object[] } | null | undefined} queue
 * @returns {{ total: number, resolved: number, remaining: number, byPriority: Record<string, number>, byKindOpen: Record<string, number> }}
 */
export function summarizeQueueFindings(queue) {
  const items = (queue && queue.items) || [];
  let resolved = 0;
  let remaining = 0;
  const byPriority = {};
  const byKindOpen = {};
  for (const it of items) {
    const st = String(it.status || 'open').toLowerCase();
    if (DONE_STATUSES.has(st)) {
      resolved += 1;
      continue;
    }
    remaining += 1;
    const p = it.priority || 'P?';
    byPriority[p] = (byPriority[p] || 0) + 1;
    const k = it.kind || 'OTHER';
    byKindOpen[k] = (byKindOpen[k] || 0) + 1;
  }
  return {
    total: items.length,
    resolved,
    remaining,
    byPriority,
    byKindOpen,
  };
}

/**
 * Build SPEC §10 Q&A rows from map data (honest gaps when data is thin).
 * @param {object} doc architecture-data.json
 * @returns {{ id: string, question: string, answer: string, status: 'answered'|'partial'|'gap' }[]}
 */
export function buildSpec10Answers(doc) {
  const s = doc.stats || {};
  const edges = edgeStatus(s);
  const displayTraces = (((doc.traces || {}).display) || []).length;
  const actionTraces = (((doc.traces || {}).actions) || []).length;
  const features = doc.features || [];
  const coverage = doc.analyzerCoverage || {};
  const unresolved = coverage.unresolved || [];
  const bp = coverage.backendPresence || {};
  const storage = doc.storage || [];
  const network = doc.network || [];
  const env = doc.env || [];
  const tables = ((doc.database && doc.database.tables) || []).length;
  const engine = (doc.database && doc.database.engine) || null;

  /** @type {{ id: string, question: string, answer: string, status: 'answered'|'partial'|'gap' }[]} */
  const rows = [];

  rows.push({
    id: 'Q1',
    question: SPEC_SECTION_10_QUESTIONS[0].text,
    status: 'answered',
    answer:
      'Map inventory: files=' +
      (s.files || 0) +
      ', screens=' +
      (s.screens || 0) +
      ', routes=' +
      (s.routes || 0) +
      ', components=' +
      (s.components || 0) +
      ', hooks=' +
      (s.hooks || 0) +
      ', functions=' +
      (s.functions || 0) +
      ', classes=' +
      (s.classes || 0) +
      ', services=' +
      (s.services || 0) +
      ', stateHolders=' +
      (s.stateHolders || 0) +
      '. Stacks: ' +
      ((doc.stacks || []).join(', ') || '(none)') +
      '.',
  });

  rows.push({
    id: 'Q2',
    question: SPEC_SECTION_10_QUESTIONS[1].text,
    status: displayTraces > 0 ? 'partial' : 'gap',
    answer:
      displayTraces > 0
        ? 'Display traces materialised: ' +
          displayTraces +
          '. Open the viewer Trace mode for per-value paths. Journey `traces.actions` count=' +
          actionTraces +
          (actionTraces === 0
            ? ' (not auto-materialised — analyzer coverage gap; use primaryJourneys + hand traces in LOG).'
            : '.')
        : 'No display traces in this map yet. Data-flow answers require regenerating with dashboard/home screens configured, or hand-tracing in the viewer. `traces.actions`=' +
          actionTraces +
          '.',
  });

  rows.push({
    id: 'Q3',
    question: SPEC_SECTION_10_QUESTIONS[2].text,
    status: (s.screens || 0) > 0 ? 'partial' : 'gap',
    answer:
      (s.screens || 0) > 0
        ? 'Screens in map: ' +
          (s.screens || 0) +
          '. Per-screen dependency lists live in the viewer (select a screen → Depends / Impact). This report does not inline every screen graph.'
        : 'No screen nodes detected — adapter/config gap for this stack or entry HTML.',
  });

  rows.push({
    id: 'Q4',
    question: SPEC_SECTION_10_QUESTIONS[3].text,
    status: (s.services || 0) > 0 ? 'partial' : 'answered',
    answer:
      (s.services || 0) > 0
        ? 'Service nodes: ' +
          (s.services || 0) +
          '. Reverse deps: open each service in the viewer Impact mode.'
        : 'No service nodes in this map (typical for local-only Cap PWAs). Storage/API/env rows below cover backends that exist.',
  });

  rows.push({
    id: 'Q5',
    question: SPEC_SECTION_10_QUESTIONS[4].text,
    status: actionTraces > 0 ? 'partial' : 'gap',
    answer:
      actionTraces > 0
        ? 'Action/journey traces: ' + actionTraces + '. Spot-check primary controls in the viewer Trace mode before calling a feature integrated (ARCH-09).'
        : 'Primary-control journeys are not auto-materialised (`traces.actions` empty). Adapter work: wire `primaryJourneys` from STATES.md into action traces. Until then, answer via hand traces in LOG.md.',
  });

  rows.push({
    id: 'Q6',
    question: SPEC_SECTION_10_QUESTIONS[5].text,
    status: 'answered',
    answer:
      'Storage keys/stores: ' +
      (s.storageKeys || 0) +
      (storage.length
        ? ' (' +
          storage
            .slice(0, 8)
            .map(function (k) {
              return '`' + (k.key || k.name || k.id || '?') + '`';
            })
            .join(', ') +
          (storage.length > 8 ? ', …' : '') +
          ')'
        : '') +
      '; database engine=' +
      (engine || 'none detected') +
      ', tables=' +
      tables +
      '. Backend presence: supabase=' +
      !!bp.supabase +
      ', firebase=' +
      !!bp.firebase +
      ', sqlite=' +
      !!bp.sqlite +
      '.',
  });

  rows.push({
    id: 'Q7',
    question: SPEC_SECTION_10_QUESTIONS[6].text,
    status: 'answered',
    answer:
      'API endpoints=' +
      (s.apiEndpoints || 0) +
      ', external hosts=' +
      (s.externalHosts || 0) +
      (network.length
        ? ' (' +
          network
            .slice(0, 6)
            .map(function (n) {
              return '`' + n.host + '`';
            })
            .join(', ') +
          (network.length > 6 ? ', …' : '') +
          ')'
        : '') +
      ', env vars=' +
      (s.envVars || 0) +
      (env.length
        ? ' (' +
          env
            .slice(0, 8)
            .map(function (e) {
              return '`' + e.name + '`';
            })
            .join(', ') +
          (env.length > 8 ? ', …' : '') +
          ')'
        : '') +
      ', tables=' +
      tables +
      '.',
  });

  rows.push({
    id: 'Q8',
    question: SPEC_SECTION_10_QUESTIONS[7].text,
    status: 'answered',
    answer:
      'Orphans=' +
      (s.orphans || 0) +
      ', unused=' +
      (s.unused || 0) +
      ', dead=' +
      (s.dead || 0) +
      ', duplicates=' +
      (s.duplicates || 0) +
      ' (findings/flags). Investigate via ARCH-07 queue — never auto-delete.',
  });

  rows.push({
    id: 'Q9',
    question: SPEC_SECTION_10_QUESTIONS[8].text,
    status: 'answered',
    answer:
      'Hardcoded=' +
      (s.hardcoded || 0) +
      ', mock=' +
      (s.mock || 0) +
      ', demo=' +
      (s.demo || 0) +
      ', unknown/NO_VERIFIED_SOURCE signals=' +
      (s.unknown || 0) +
      '; display traces=' +
      displayTraces +
      '.',
  });

  rows.push({
    id: 'Q10',
    question: SPEC_SECTION_10_QUESTIONS[9].text,
    status: 'answered',
    answer:
      'Broken path findings/edges≈' +
      (s.brokenPaths || 0) +
      '; edge statuses: VERIFIED=' +
      edges.verified +
      ', INFERRED=' +
      edges.inferred +
      ', UNKNOWN=' +
      edges.unknown +
      ', BROKEN=' +
      edges.broken +
      ' (total edges=' +
      edges.total +
      ').',
  });

  rows.push({
    id: 'Q11',
    question: SPEC_SECTION_10_QUESTIONS[10].text,
    status: 'partial',
    answer:
      'Impact analysis is interactive: open the map viewer, select a node, use Impact mode (upstream/downstream). This section does not snapshot every impact set. Features in config: ' +
      features.length +
      ' (complete=' +
      (s.featuresComplete || 0) +
      ', incomplete=' +
      (s.featuresIncomplete || 0) +
      ').',
  });

  if (unresolved.length) {
    rows.push({
      id: 'COV',
      question: 'Analyzer coverage / still cannot answer',
      status: 'gap',
      answer:
        unresolved.join('; ') +
        '. Adapters run: ' +
        ((coverage.adaptersRun || []).join(', ') || '(none)') +
        '.',
    });
  }

  return rows;
}

/**
 * @param {object} opts
 * @param {object} opts.doc architecture-data.json
 * @param {{ items?: object[], generatedAt?: string, appId?: string } | null} [opts.queue]
 * @param {string} [opts.mapRel] relative path to map dir for evidence links
 * @param {string} [opts.queueRel] relative path to queue file
 * @param {string} [opts.generatedAt] override timestamp
 * @returns {string} markdown including leading ## Architecture
 */
export function formatArchitectureSection(opts) {
  const doc = opts.doc;
  if (!doc || typeof doc !== 'object') {
    throw new Error('formatArchitectureSection: doc is required');
  }
  const appId = canonicalizeAppId(opts.appId || doc.app || 'app') || String(doc.app || 'app');
  const s = doc.stats || {};
  const edges = edgeStatus(s);
  const queue = opts.queue || null;
  const qSum = queue
    ? summarizeQueueFindings(queue)
    : {
        total: s.findings || (doc.findings || []).length || 0,
        resolved: 0,
        remaining: s.findings || (doc.findings || []).length || 0,
        byPriority: {},
        byKindOpen: {},
      };
  const features = doc.features || [];
  const when = opts.generatedAt || new Date().toISOString();
  const lines = [];

  lines.push('## Architecture');
  lines.push('');
  lines.push(
    '_Generated by capricorn-tooling ARCH-10 (`npm run architecture:app-report`). Architecture track ≠ product Tier 1 — do not treat this section as a Tier 1 pass._'
  );
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|---|---|');
  lines.push('| App | `' + appId + '` |');
  lines.push('| Analyzer | `' + (doc.analyzerVersion || '?') + '` |');
  lines.push('| Map generatedAt | `' + (doc.generatedAt || '?') + '` |');
  lines.push('| sourceCommit | `' + (doc.sourceCommit || '?') + '` |');
  lines.push('| Section generatedAt | `' + when + '` |');
  if (opts.mapRel) lines.push('| Map path | `' + opts.mapRel + '` |');
  if (opts.queueRel) lines.push('| Queue path | `' + opts.queueRel + '` |');
  lines.push('| Stacks | ' + ((doc.stacks || []).join(', ') || '—') + ' |');
  lines.push('');

  lines.push('### Health (from map)');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|---|---:|');
  const healthRows = [
    ['Files', s.files],
    ['Screens', s.screens],
    ['Routes', s.routes],
    ['Components', s.components],
    ['Hooks', s.hooks],
    ['Functions', s.functions],
    ['Classes', s.classes],
    ['Services', s.services],
    ['State holders', s.stateHolders],
    ['Storage keys/stores', s.storageKeys],
    ['Tables', s.tables],
    ['API endpoints', s.apiEndpoints],
    ['External hosts', s.externalHosts],
    ['Env vars', s.envVars],
    ['Dependencies', s.dependencies],
    ['Edges (total)', edges.total],
    ['Edges VERIFIED', edges.verified],
    ['Edges INFERRED', edges.inferred],
    ['Edges UNKNOWN', edges.unknown],
    ['Edges BROKEN', edges.broken],
    ['Orphans', s.orphans],
    ['Unused', s.unused],
    ['Dead', s.dead],
    ['Duplicates', s.duplicates],
    ['Broken paths', s.brokenPaths],
    ['Hardcoded', s.hardcoded],
    ['Mock', s.mock],
    ['Demo', s.demo],
    ['Unknown', s.unknown],
    ['Security items', s.securityItems],
    ['Findings (map)', s.findings != null ? s.findings : (doc.findings || []).length],
    ['Features complete', s.featuresComplete],
    ['Features incomplete', s.featuresIncomplete],
  ];
  for (const row of healthRows) {
    lines.push('| ' + row[0] + ' | ' + (row[1] != null ? row[1] : 0) + ' |');
  }
  lines.push('');

  lines.push('### Feature completeness');
  lines.push('');
  if (!features.length) {
    lines.push(
      '_No features listed in `architecture.config.json` / map. Add `features` (and journeys) so the analyzer can score COMPLETE vs INCOMPLETE._'
    );
    lines.push('');
  } else {
    lines.push('| Feature | Overall | UI | Component | Logic | State | Service | Persistence | Display |');
    lines.push('|---|---|---|---|---|---|---|---|---|');
    for (const f of features) {
      const c = f.chain || {};
      const cell = function (v) {
        return v ? '✅' : '—';
      };
      lines.push(
        '| `' +
          (f.name || '?') +
          '` | **' +
          (f.overall || '?') +
          '** | ' +
          cell(c.ui) +
          ' | ' +
          cell(c.component) +
          ' | ' +
          cell(c.logic) +
          ' | ' +
          cell(c.state) +
          ' | ' +
          cell(c.service) +
          ' | ' +
          cell(c.persistence) +
          ' | ' +
          cell(c.display) +
          ' |'
      );
    }
    lines.push('');
    lines.push(
      '_Incomplete chains are analyzer honesty, not a silent pass. Fix adapters / evidence before calling a feature integrated (ARCH-09)._'
    );
    lines.push('');
  }

  lines.push('### Findings — resolved / remaining');
  lines.push('');
  if (queue) {
    lines.push(
      'From ARCH-07 queue: **' +
        qSum.total +
        '** items · **' +
        qSum.resolved +
        '** resolved · **' +
        qSum.remaining +
        '** remaining (open).'
    );
    lines.push('');
    const priKeys = Object.keys(qSum.byPriority).sort();
    if (priKeys.length) {
      lines.push('| Priority (open) | Count |');
      lines.push('|---|---:|');
      for (const p of priKeys) {
        lines.push('| ' + p + ' | ' + qSum.byPriority[p] + ' |');
      }
      lines.push('');
    }
    const kindKeys = Object.keys(qSum.byKindOpen).sort();
    if (kindKeys.length) {
      lines.push('| Kind (open) | Count |');
      lines.push('|---|---:|');
      for (const k of kindKeys) {
        lines.push('| ' + k + ' | ' + qSum.byKindOpen[k] + ' |');
      }
      lines.push('');
    }
    lines.push(
      'Pickup: tooling `qa/architecture/queue/' +
        appId +
        '-ARCH-QUEUE.md` (and JSON). Status updates happen in the Finish Program — never auto-fixed by the analyzer.'
    );
  } else {
    lines.push(
      'No ARCH-07 queue loaded. Map findings count: **' +
        qSum.remaining +
        '** (treated as remaining). Run `npm run architecture:queue -- --apps ' +
        appId +
        '` then regenerate this section.'
    );
  }
  lines.push('');

  lines.push('### SPEC §10 — map answers');
  lines.push('');
  lines.push('| ID | Status | Question | Answer |');
  lines.push('|---|---|---|---|');
  for (const row of buildSpec10Answers(doc)) {
    lines.push(
      '| ' +
        row.id +
        ' | `' +
        row.status +
        '` | ' +
        escapeTableCell(row.question) +
        ' | ' +
        escapeTableCell(row.answer) +
        ' |'
    );
  }
  lines.push('');
  lines.push(
    '**Paste location:** app repo `qa/finish-loop/APP-REPORT.md` — insert or replace the `## Architecture` section (Step R / Final Report). Template: `shared/architecture/templates/APP-REPORT-ARCHITECTURE.md`.'
  );
  lines.push('');

  return lines.join('\n');
}

/**
 * @param {string} s
 * @returns {string}
 */
function escapeTableCell(s) {
  return String(s || '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

/**
 * Blank / manual template body (no invented numbers).
 * @returns {string}
 */
export function blankArchitectureTemplate() {
  return [
    '## Architecture',
    '',
    '_Fill via `npm run architecture:app-report -- --app <App>` from capricorn-tooling (ARCH-10), or complete by hand after `architecture:analyze`. Architecture track ≠ product Tier 1._',
    '',
    '| Field | Value |',
    '|---|---|',
    '| App | `REPLACE_APP_ID` |',
    '| Analyzer | |',
    '| Map generatedAt | |',
    '| sourceCommit | |',
    '| Map path | `qa/architecture/pilot-<slug>/` or `docs/architecture/` |',
    '',
    '### Health (from map)',
    '',
    '| Metric | Count |',
    '|---|---:|',
    '| Files | |',
    '| Screens | |',
    '| Functions | |',
    '| Edges (total) | |',
    '| Orphans | |',
    '| Unused | |',
    '| Broken paths | |',
    '| Findings (map) | |',
    '| Features complete | |',
    '| Features incomplete | |',
    '',
    '### Feature completeness',
    '',
    '| Feature | Overall | UI | Component | Logic | State | Service | Persistence | Display |',
    '|---|---|---|---|---|---|---|---|---|',
    '| `…` | | | | | | | | |',
    '',
    '### Findings — resolved / remaining',
    '',
    'From ARCH-07 queue: **N** items · **R** resolved · **M** remaining.',
    '',
    '### SPEC §10 — map answers',
    '',
    '| ID | Status | Question | Answer |',
    '|---|---|---|---|',
    ...SPEC_SECTION_10_QUESTIONS.map(function (q) {
      return '| ' + q.id + ' | `gap` | ' + q.text + ' | _(fill from map / viewer / adapter plan)_ |';
    }),
    '',
    '**Paste location:** `qa/finish-loop/APP-REPORT.md`',
    '',
  ].join('\n');
}

/**
 * Insert or replace ## Architecture in an existing APP-REPORT markdown.
 * @param {string} reportMd
 * @param {string} architectureSectionMd must start with ## Architecture
 * @returns {{ markdown: string, action: 'replaced'|'inserted'|'created' }}
 */
export function upsertArchitectureSection(reportMd, architectureSectionMd) {
  const section = String(architectureSectionMd || '').trimEnd() + '\n';
  if (!/^## Architecture\b/m.test(section)) {
    throw new Error('architecture section must start with ## Architecture');
  }
  const src = String(reportMd || '');
  if (!src.trim()) {
    return { markdown: section, action: 'created' };
  }
  const re = /^## Architecture\b[\s\S]*?(?=^## |\Z)/m;
  if (re.test(src)) {
    return { markdown: src.replace(re, section.trimEnd() + '\n\n'), action: 'replaced' };
  }
  const trimmed = src.replace(/\s*$/, '');
  return {
    markdown: trimmed + '\n\n' + section,
    action: 'inserted',
  };
}
