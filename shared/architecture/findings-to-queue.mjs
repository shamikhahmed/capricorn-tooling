/**
 * ARCH-07 — convert analyzer findings into Finish Program queue items.
 *
 * Spec: CURSOR-MASTER-PROMPT §2.6 ARCH-07 + SPEC §7 + DECISIONS G-11.
 * Interpretation (documented in qa/architecture/LOG.md):
 *   - Every finding → exactly one durable item `<APP>-ARCH-<n>` (1:1).
 *   - Stable order: severity (risk → warn → info) → kind → finding id.
 *   - Never auto-delete / auto-fix; items are investigate-or-fix work.
 *   - Outputs live under tooling `qa/architecture/queue/` (+ fleet index)
 *     so the Finish Program can pick them up without a parallel process.
 */

/** Canonical Cap app IDs used in Finish Program item prefixes. */
export const APP_ID_ALIASES = {
  // Full + short pilot slugs (qa/architecture/pilot-<slug>/)
  pulse: 'PulseCap',
  pulsecap: 'PulseCap',
  scent: 'ScentCap',
  scentcap: 'ScentCap',
  aura: 'AuraCap',
  auracap: 'AuraCap',
  car: 'CarCap',
  carcap: 'CarCap',
  cook: 'CookCap',
  cookcap: 'CookCap',
  deefoodie: 'DeeFoodieApp',
  deefoodieapp: 'DeeFoodieApp',
  deepony: 'DeePonyCap',
  deeponycap: 'DeePonyCap',
  idea: 'IdeaCap',
  ideacap: 'IdeaCap',
  ledger: 'LedgerCap',
  ledgercap: 'LedgerCap',
  mastery: 'MasteryCap',
  masterycap: 'MasteryCap',
  prism: 'PrismCap',
  prismcap: 'PrismCap',
  soul: 'SoulCap',
  soulcap: 'SoulCap',
  steady: 'SteadyCap',
  steadycap: 'SteadyCap',
  travel: 'TravelCap',
  travelcap: 'TravelCap',
  vault: 'VaultCap',
  vaultcap: 'VaultCap',
  lab: 'CapricornLab',
  'capricorn-lab': 'CapricornLab',
  capricornlab: 'CapricornLab',
  hub: 'CapricornOS',
  'hub-pages': 'CapricornOS',
  capricornos: 'CapricornOS',
  'shamikhahmed.github.io': 'CapricornOS',
  shamikhahmedgithubio: 'CapricornOS',
};

const SEVERITY_RANK = { risk: 0, warn: 1, info: 2 };

const KIND_DONE_WHEN = {
  ORPHAN:
    'Investigate: keep (document why), wire into a real entry path, or remove only with proof it is unreachable (§74). Never auto-delete.',
  UNUSED:
    'Investigate: keep (document why), wire a consumer, or remove only with proof it is unused (§74). Never auto-delete.',
  DUPLICATE:
    'Consolidate only when safe and behavior-equivalent; otherwise document why both must remain.',
  HARDCODED:
    'Replace with a real data source, or label honestly as constant/demo — no silent fake numbers.',
  MOCK:
    'Confine to demo paths or replace with real data; flag SUSPICIOUS if demo leaks into product paths.',
  DEMO:
    'Confirm demo-only path; if it leaks into non-demo UI, treat as SUSPICIOUS and fix.',
  BROKEN:
    'Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over.',
  SECURITY:
    'Remediate the security finding (client-exposed secret, sink, unprotected store) with evidence.',
  SUSPICIOUS:
    'Confirm whether the pattern is intentional; fix or document with evidence.',
};

/**
 * @param {string} raw
 * @returns {string}
 */
export function canonicalizeAppId(raw) {
  const s = String(raw || '').trim();
  if (!s) return 'UnknownApp';
  if (/^[A-Z][A-Za-z0-9]+$/.test(s) && /Cap$|App$|Lab$|OS$/.test(s)) return s;
  const lower = s.toLowerCase();
  if (APP_ID_ALIASES[lower]) return APP_ID_ALIASES[lower];
  const key = lower.replace(/[^a-z0-9-]/g, '');
  if (APP_ID_ALIASES[key]) return APP_ID_ALIASES[key];
  // PascalCase fallback: pulse-cap → PulseCap
  return s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(function (p) {
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * @param {string} kind
 * @returns {string}
 */
export function doneWhenForKind(kind) {
  return KIND_DONE_WHEN[kind] || 'Investigate finding with evidence; resolve or document reason to keep.';
}

/**
 * @param {object} finding
 * @returns {number}
 */
function severityRank(finding) {
  const s = String(finding.severity || 'info').toLowerCase();
  return SEVERITY_RANK[s] != null ? SEVERITY_RANK[s] : 9;
}

/**
 * Stable sort for 1:1 numbering.
 * @param {object[]} findings
 * @returns {object[]}
 */
export function sortFindingsForQueue(findings) {
  return findings.slice().sort(function (a, b) {
    const sr = severityRank(a) - severityRank(b);
    if (sr !== 0) return sr;
    const ka = String(a.kind || '');
    const kb = String(b.kind || '');
    if (ka !== kb) return ka < kb ? -1 : 1;
    const ia = String(a.id || '');
    const ib = String(b.id || '');
    if (ia !== ib) return ia < ib ? -1 : 1;
    return 0;
  });
}

/**
 * @param {object} evidence
 * @returns {string}
 */
function formatEvidenceOne(evidence) {
  if (!evidence || typeof evidence !== 'object') return '';
  const file = evidence.file || '';
  const line = evidence.line != null ? String(evidence.line) : '';
  const snip = evidence.snippet ? String(evidence.snippet).slice(0, 80) : '';
  if (file && line) return file + ':' + line + (snip ? ' — ' + snip : '');
  return file || snip || '';
}

/**
 * @param {object[]} evidence
 * @param {number} [limit]
 * @returns {string[]}
 */
function evidenceLines(evidence, limit) {
  const list = Array.isArray(evidence) ? evidence : [];
  const max = limit == null ? 5 : limit;
  return list.slice(0, max).map(formatEvidenceOne).filter(Boolean);
}

/**
 * Build Finish Program queue items from architecture-data findings.
 *
 * @param {{ app?: string, findings?: object[], sourceCommit?: string, analyzerVersion?: string, generatedAt?: string }} doc
 * @param {{ appId?: string, sourcePath?: string }} [opts]
 * @returns {{ appId: string, items: object[], counts: object, meta: object }}
 */
export function findingsToQueueItems(doc, opts) {
  const options = opts || {};
  const appId = canonicalizeAppId(options.appId || (doc && doc.app) || 'UnknownApp');
  const findings = sortFindingsForQueue((doc && doc.findings) || []);
  const items = findings.map(function (f, i) {
    const n = i + 1;
    const id = appId + '-ARCH-' + String(n).padStart(2, '0');
    const kind = String(f.kind || 'UNKNOWN');
    const severity = String(f.severity || 'info').toLowerCase();
    const explanation = String(f.explanation || '').trim();
    const title =
      kind +
      (explanation
        ? ': ' + (explanation.length > 100 ? explanation.slice(0, 97) + '…' : explanation)
        : '');
    return {
      id,
      n,
      findingId: f.id || null,
      kind,
      severity,
      title,
      explanation,
      nodes: Array.isArray(f.nodes) ? f.nodes.slice() : [],
      evidence: evidenceLines(f.evidence, 8),
      evidenceRaw: Array.isArray(f.evidence) ? f.evidence.slice(0, 8) : [],
      doneWhen: doneWhenForKind(kind),
      status: 'open',
      priority: severity === 'risk' ? 'P0' : severity === 'warn' ? 'P1' : 'P2',
    };
  });

  const counts = {
    total: items.length,
    bySeverity: {},
    byKind: {},
    byPriority: {},
  };
  for (const it of items) {
    counts.bySeverity[it.severity] = (counts.bySeverity[it.severity] || 0) + 1;
    counts.byKind[it.kind] = (counts.byKind[it.kind] || 0) + 1;
    counts.byPriority[it.priority] = (counts.byPriority[it.priority] || 0) + 1;
  }

  return {
    appId,
    items,
    counts,
    meta: {
      sourceApp: (doc && doc.app) || null,
      sourceCommit: (doc && doc.sourceCommit) || null,
      analyzerVersion: (doc && doc.analyzerVersion) || null,
      architectureGeneratedAt: (doc && doc.generatedAt) || null,
      sourcePath: options.sourcePath || null,
      mapping: '1:1 finding → item (ARCH-07)',
      neverAutoDelete: true,
    },
  };
}

/**
 * @param {{ appId: string, items: object[], counts: object, meta: object }} queue
 * @returns {string}
 */
export function formatQueueMarkdown(queue) {
  const lines = [];
  lines.push('# ' + queue.appId + ' — Architecture queue (ARCH-07)');
  lines.push('');
  lines.push('Generated from analyzer findings. **Observe → queue → human decides.** Never auto-delete.');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|---|---|');
  lines.push('| App | `' + queue.appId + '` |');
  lines.push('| Items | **' + queue.counts.total + '** (1:1 with findings) |');
  lines.push('| Priorities | ' + formatCounts(queue.counts.byPriority) + ' |');
  lines.push('| Severities | ' + formatCounts(queue.counts.bySeverity) + ' |');
  lines.push('| Kinds | ' + formatCounts(queue.counts.byKind) + ' |');
  if (queue.meta.sourceCommit) {
    lines.push('| Source commit | `' + queue.meta.sourceCommit + '` |');
  }
  if (queue.meta.analyzerVersion) {
    lines.push('| Analyzer | ' + queue.meta.analyzerVersion + ' |');
  }
  if (queue.meta.sourcePath) {
    lines.push('| Source | `' + queue.meta.sourcePath + '` |');
  }
  lines.push('| Full register | `' + queue.appId + '-ARCH-QUEUE.json` (every finding) |');
  lines.push('| Status | all `open` until Finish Program resolves |');
  lines.push('');

  const priority = queue.items.filter(function (it) {
    return it.severity === 'risk' || it.severity === 'warn';
  });
  const info = queue.items.filter(function (it) {
    return it.severity !== 'risk' && it.severity !== 'warn';
  });

  lines.push('## Priority slice (risk + warn) — work these first');
  lines.push('');
  if (!priority.length) {
    lines.push('_No risk/warn findings — info-level orphans/unused remain in the JSON register._');
    lines.push('');
  } else {
    lines.push('| ID | P | Kind | Title | Evidence | Done when | Status |');
    lines.push('|---|---|---|---|---|---|---|');
    for (const it of priority) {
      lines.push(rowMarkdown(it));
    }
    lines.push('');
  }

  lines.push('## Info-level register (sample + pointer)');
  lines.push('');
  lines.push(
    '**' +
      info.length +
      '** info items (ORPHAN/UNUSED/DUPLICATE/…). Full 1:1 list with evidence is in `' +
      queue.appId +
      '-ARCH-QUEUE.json`. Finish Program picks up by ID from JSON.'
  );
  lines.push('');
  const sample = info.slice(0, 25);
  if (sample.length) {
    lines.push('| ID | P | Kind | Title | Evidence | Status |');
    lines.push('|---|---|---|---|---|---|');
    for (const it of sample) {
      lines.push(
        '| `' +
          it.id +
          '` | ' +
          it.priority +
          ' | ' +
          it.kind +
          ' | ' +
          mdCell(it.title) +
          ' | ' +
          mdCell((it.evidence && it.evidence[0]) || '') +
          ' | ' +
          it.status +
          ' |'
      );
    }
    if (info.length > sample.length) {
      lines.push('');
      lines.push('_… and ' + (info.length - sample.length) + ' more in JSON._');
    }
    lines.push('');
  }

  lines.push('## Finish Program notes');
  lines.push('');
  lines.push('- IDs: `<APP>-ARCH-<n>` (stable for this generation order: risk → warn → info, then kind, then finding id).');
  lines.push('- Work risk/warn first; orphans/unused are investigate-not-delete (§74).');
  lines.push('- Resolving an item = keep/wire/remove with proof, or fix broken/security at root.');
  lines.push('- Re-run `npm run architecture:queue` after re-analyzing to refresh this file.');
  lines.push('');
  return lines.join('\n');
}

/**
 * @param {object} it
 * @returns {string}
 */
function rowMarkdown(it) {
  return (
    '| `' +
    it.id +
    '` | ' +
    it.priority +
    ' | ' +
    it.kind +
    ' | ' +
    mdCell(it.title) +
    ' | ' +
    mdCell((it.evidence && it.evidence[0]) || '') +
    ' | ' +
    mdCell(it.doneWhen) +
    ' | ' +
    it.status +
    ' |'
  );
}

/**
 * @param {string} s
 * @returns {string}
 */
function mdCell(s) {
  return String(s || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .slice(0, 160);
}

/**
 * @param {Record<string, number>} obj
 * @returns {string}
 */
function formatCounts(obj) {
  return Object.keys(obj)
    .sort()
    .map(function (k) {
      return k + '=' + obj[k];
    })
    .join(', ');
}

/**
 * Fleet index document.
 * @param {{ appId: string, counts: object, meta: object, queuePath?: string }[]} entries
 * @returns {{ json: object, markdown: string }}
 */
export function buildFleetQueueIndex(entries) {
  const sorted = entries.slice().sort(function (a, b) {
    return a.appId < b.appId ? -1 : a.appId > b.appId ? 1 : 0;
  });
  const totalItems = sorted.reduce(function (n, e) {
    return n + ((e.counts && e.counts.total) || 0);
  }, 0);
  const json = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    arch: 'ARCH-07',
    apps: sorted.length,
    totalItems,
    entries: sorted.map(function (e) {
      return {
        appId: e.appId,
        items: (e.counts && e.counts.total) || 0,
        bySeverity: (e.counts && e.counts.bySeverity) || {},
        byKind: (e.counts && e.counts.byKind) || {},
        byPriority: (e.counts && e.counts.byPriority) || {},
        queueJson: e.queuePath || 'qa/architecture/queue/' + e.appId + '-ARCH-QUEUE.json',
        queueMd: (e.queuePath || 'qa/architecture/queue/' + e.appId + '-ARCH-QUEUE.json').replace(
          /\.json$/,
          '.md'
        ),
        sourcePath: (e.meta && e.meta.sourcePath) || null,
        sourceCommit: (e.meta && e.meta.sourceCommit) || null,
      };
    }),
  };

  const md = [];
  md.push('# Architecture queue index (ARCH-07)');
  md.push('');
  md.push('Finish Program pickup: per-app files under `qa/architecture/queue/`.');
  md.push('Mapping: **1:1** analyzer finding → `<APP>-ARCH-<n>` (never auto-delete).');
  md.push('');
  md.push('| App | Items | P0/P1/P2 | Queue |');
  md.push('|---|---:|---|---|');
  for (const e of json.entries) {
    const bp = e.byPriority || {};
    md.push(
      '| ' +
        e.appId +
        ' | ' +
        e.items +
        ' | P0=' +
        (bp.P0 || 0) +
        ' · P1=' +
        (bp.P1 || 0) +
        ' · P2=' +
        (bp.P2 || 0) +
        ' | [`' +
        e.appId +
        '-ARCH-QUEUE.md`](queue/' +
        e.appId +
        '-ARCH-QUEUE.md) |'
    );
  }
  md.push('');
  md.push('**Fleet total:** ' + totalItems + ' items across ' + sorted.length + ' apps.');
  md.push('');
  md.push('Regenerate: `npm run architecture:queue`');
  md.push('');

  return { json, markdown: md.join('\n') };
}
