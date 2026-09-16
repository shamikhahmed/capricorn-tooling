/** Analyses — SPEC §4 (observe only; findings with evidence) */

import { EDGE_STATUS, NODE_FLAGS } from '../constants.mjs';
import { makeEvidence } from '../evidence.mjs';
import { fingerprintBody, similarity } from './fingerprint.mjs';

/**
 * Run all core analyses on a populated graph.
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @param {{ config?: object, root?: string }} [ctx]
 */
export function runAnalyses(graph, ctx) {
  markBrokenTargets(graph);
  analyzeReachability(graph, ctx && ctx.config);
  analyzeUnused(graph);
  analyzeDuplication(graph);
  analyzeHardcoded(graph);
  analyzeMockDemo(graph);
  analyzeEnvSecurity(graph);
  analyzeFeatures(graph, ctx && ctx.config);
}

/**
 * Edges whose `to` node is missing → BROKEN (when status isn't already intentional UNKNOWN to unresolved external).
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function markBrokenTargets(graph) {
  for (const edge of graph.edges.values()) {
    if (!graph.hasNode(edge.to)) {
      // Missing internal targets are BROKEN; external-looking ids stay UNKNOWN
      if (String(edge.to).startsWith('external:') || String(edge.to).startsWith('dependency:')) {
        if (edge.status === EDGE_STATUS.VERIFIED) edge.status = EDGE_STATUS.UNKNOWN;
        continue;
      }
      edge.status = EDGE_STATUS.BROKEN;
      graph.addFinding({
        id: nextFindingId(graph, 'BROKEN'),
        kind: 'BROKEN',
        severity: 'warn',
        nodes: [edge.from, edge.to],
        explanation: 'Edge target node is missing: ' + edge.type + ' ' + edge.from + ' → ' + edge.to,
        evidence: edge.evidence || [],
      });
    }
  }
}

/**
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function analyzeReachability(graph, config) {
  const entries = new Set();
  for (const n of graph.nodes.values()) {
    if (n.type === 'entry' || n.type === 'app') entries.add(n.id);
  }
  if (config && Array.isArray(config.entryPoints)) {
    for (const ep of config.entryPoints) {
      for (const n of graph.nodes.values()) {
        if (n.file === ep || n.id.endsWith('#' + ep) || n.name === ep) entries.add(n.id);
      }
    }
  }
  // HTML entry files
  for (const n of graph.nodes.values()) {
    if (n.type === 'file' && /\.html?$/i.test(n.file)) entries.add(n.id);
  }

  if (entries.size === 0) return;

  const adj = new Map();
  for (const e of graph.edges.values()) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e.to);
  }
  const seen = new Set();
  const queue = Array.from(entries);
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    const next = adj.get(id) || [];
    for (const t of next) {
      if (!seen.has(t)) queue.push(t);
    }
  }

  for (const n of graph.nodes.values()) {
    if (n.type === 'env' || n.type === 'dependency' || n.type === 'external') continue;
    if (!seen.has(n.id) && !entries.has(n.id)) {
      addFlag(n, NODE_FLAGS.ORPHANED);
      graph.addFinding({
        id: nextFindingId(graph, 'ORPHAN'),
        kind: 'ORPHAN',
        severity: 'info',
        nodes: [n.id],
        explanation: 'Unreachable from entry points: ' + n.id,
        evidence: [makeEvidence(n.file, n.line || 1, n.name)],
      });
    }
  }
}

/**
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function analyzeUnused(graph) {
  const referenced = new Set();
  for (const e of graph.edges.values()) {
    referenced.add(e.to);
    referenced.add(e.from);
  }
  // Track incoming only for UNUSED (defined/exported, no consumer)
  const incoming = new Set();
  for (const e of graph.edges.values()) incoming.add(e.to);

  for (const n of graph.nodes.values()) {
    if (n.type !== 'function' && n.type !== 'component' && n.type !== 'hook' && n.type !== 'service') continue;
    const exported = n.meta && n.meta.exported;
    if (exported && !incoming.has(n.id)) {
      addFlag(n, NODE_FLAGS.UNUSED);
      graph.addFinding({
        id: nextFindingId(graph, 'UNUSED'),
        kind: 'UNUSED',
        severity: 'info',
        nodes: [n.id],
        explanation: 'Exported/defined with no consumers: ' + n.name,
        evidence: [makeEvidence(n.file, n.line || 1, n.name)],
      });
    }
  }

  // Storage: read but never written → BROKEN finding
  for (const s of graph.storage || []) {
    const readers = s.readers || [];
    const writers = s.writers || [];
    if (readers.length && !writers.length) {
      graph.addFinding({
        id: nextFindingId(graph, 'BROKEN'),
        kind: 'BROKEN',
        severity: 'warn',
        nodes: readers.slice(),
        explanation: 'Storage key read but never written: ' + s.key,
        evidence: [],
      });
    }
  }
}

/**
 * Name similarity alone never produces a finding (SPEC §4.3).
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function analyzeDuplication(graph) {
  const fns = Array.from(graph.nodes.values()).filter(function (n) {
    return n.type === 'function' && n.meta && n.meta.body;
  });
  const fps = fns.map(function (n) {
    return { node: n, fp: fingerprintBody(n.meta.body) };
  });
  const reported = new Set();
  for (let i = 0; i < fps.length; i++) {
    for (let j = i + 1; j < fps.length; j++) {
      const a = fps[i];
      const b = fps[j];
      // Skip if same file+name (identical node)
      if (a.node.id === b.node.id) continue;
      const sim = similarity(a.fp, b.fp);
      if (sim >= 0.85 && a.fp.stmtCount >= 6) {
        const key = [a.node.id, b.node.id].sort().join('|');
        if (reported.has(key)) continue;
        reported.add(key);
        addFlag(a.node, NODE_FLAGS.DUPLICATED);
        addFlag(b.node, NODE_FLAGS.DUPLICATED);
        graph.addFinding({
          id: nextFindingId(graph, 'DUPLICATE'),
          kind: 'DUPLICATE',
          severity: 'info',
          nodes: [a.node.id, b.node.id],
          explanation: 'Similar function bodies (similarity ' + sim.toFixed(2) + '): ' + a.node.name + ' ↔ ' + b.node.name,
          evidence: [
            makeEvidence(a.node.file, a.node.line || 1, (a.node.meta.body || '').slice(0, 100)),
            makeEvidence(b.node.file, b.node.line || 1, (b.node.meta.body || '').slice(0, 100)),
          ],
        });
      }
    }
  }
}

/**
 * Hardcoded UI numbers flagged when node/meta says so or display traces say HARDCODED.
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function analyzeHardcoded(graph) {
  for (const n of graph.nodes.values()) {
    if (n.meta && n.meta.hardcodedDisplay) {
      addFlag(n, NODE_FLAGS.HARDCODED);
      graph.addFinding({
        id: nextFindingId(graph, 'HARDCODED'),
        kind: 'HARDCODED',
        severity: 'warn',
        nodes: [n.id],
        explanation: 'Hardcoded display value: ' + String(n.meta.hardcodedDisplay),
        evidence: [makeEvidence(n.file, n.line || 1, String(n.meta.hardcodedSnippet || n.meta.hardcodedDisplay))],
      });
    }
  }
  for (const t of (graph.traces && graph.traces.display) || []) {
    if (t.source === 'HARDCODED') {
      graph.addFinding({
        id: nextFindingId(graph, 'HARDCODED'),
        kind: 'HARDCODED',
        severity: 'warn',
        nodes: t.path || [],
        explanation: 'Display value is hardcoded: ' + (t.shown || ''),
        evidence: t.evidence || [],
      });
    }
  }
}

/**
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function analyzeMockDemo(graph) {
  const re = /(mock|fixture|fake|sample|seed|demo|placeholder|stub)/i;
  for (const n of graph.nodes.values()) {
    if (re.test(n.file) || re.test(n.name)) {
      const isDemo = /demo/i.test(n.file) || /demo/i.test(n.name);
      addFlag(n, isDemo ? NODE_FLAGS.DEMO : NODE_FLAGS.MOCK);
    }
  }
}

/**
 * Client-exposed secret-looking env names → SECURITY flag.
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function analyzeEnvSecurity(graph) {
  const secretName = /(secret|password|token|api[_-]?key|private|_key)$/i;
  for (const e of graph.env || []) {
    if (e.clientExposed && secretName.test(e.name)) {
      e.looksSecret = true;
      const node = graph.nodes.get('env:' + e.name) || graph.addNode({
        type: 'env',
        name: e.name,
        file: (e.definedIn && e.definedIn[0]) || 'env',
        flags: [NODE_FLAGS.SECURITY],
      });
      addFlag(node, NODE_FLAGS.SECURITY);
      graph.addFinding({
        id: nextFindingId(graph, 'SECURITY'),
        kind: 'SECURITY',
        severity: 'risk',
        nodes: [node.id],
        explanation: 'Client-exposed env name looks secret: ' + e.name,
        evidence: [makeEvidence(String((e.definedIn && e.definedIn[0]) || 'env'), 1, e.name + ' (key only)')],
      });
    } else if (secretName.test(e.name)) {
      e.looksSecret = true;
    }
  }
}

/**
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function analyzeFeatures(graph, config) {
  if (!config || !Array.isArray(config.features)) return;
  for (const feat of config.features) {
    const name = typeof feat === 'string' ? feat : feat.name;
    const chain = (typeof feat === 'object' && feat.chain) || {
      ui: false, component: false, state: false, logic: false, service: false, persistence: false, display: false,
    };
    // Mark true when any node has this feature and matching layer/type
    for (const n of graph.nodes.values()) {
      if (n.feature !== name) continue;
      if (n.layer === 'screen' || n.type === 'screen') chain.ui = true;
      if (n.type === 'component') chain.component = true;
      if (n.layer === 'state') chain.state = true;
      if (n.layer === 'logic') chain.logic = true;
      if (n.layer === 'service') chain.service = true;
      if (n.layer === 'data' || n.type === 'storage') chain.persistence = true;
    }
    const applicable = Object.keys(chain);
    const ok = applicable.every(function (k) { return chain[k] === true; });
    graph.features.push({
      name,
      chain,
      overall: ok ? 'COMPLETE' : 'INCOMPLETE',
      evidence: [],
    });
  }
}

function addFlag(node, flag) {
  const set = new Set(node.flags || []);
  set.add(flag);
  node.flags = Array.from(set).sort();
}

function nextFindingId(graph, kind) {
  const n = graph.findings.length + 1;
  return 'F-' + String(n).padStart(3, '0') + '-' + kind;
}
