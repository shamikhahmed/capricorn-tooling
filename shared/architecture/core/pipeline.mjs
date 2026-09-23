/** Build architecture-data document from a repo root */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ArchitectureGraph } from './graph.mjs';
import { detectStacks } from './detect.mjs';
import { runAdapters } from '../adapters/index.mjs';
import { runAnalyses } from './analyses/index.mjs';
import { computeStats } from './stats.mjs';
import { canonicalize } from './serialize.mjs';
import { ANALYZER_VERSION, SCHEMA_VERSION } from './constants.mjs';
import { writeAuditMarkdown } from './audit.mjs';

const VIEWER_SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'viewer');
const VIEWER_ASSETS = ['index.html', 'viewer.js', 'viewer.css'];

/**
 * @param {string} root
 * @param {{ config?: object, generatedAt?: string, outDir?: string, writeAudit?: boolean }} [opts]
 * @returns {object}
 */
export function analyzeRepo(root, opts) {
  const options = opts || {};
  const absRoot = path.resolve(root);
  const config = options.config || loadConfig(absRoot);
  const graph = new ArchitectureGraph();

  const appMeta = readAppMeta(absRoot, config);
  graph.stacks = detectStacks(absRoot);
  if (config.stacks && Array.isArray(config.stacks)) {
    graph.stacks = Array.from(new Set(graph.stacks.concat(config.stacks))).sort();
  }

  graph.addNode({
    type: 'app',
    name: appMeta.app,
    file: '.',
    layer: 'app',
    meta: { version: appMeta.appVersion },
  });

  const adaptersRun = runAdapters(absRoot, graph, graph.stacks, config);
  // Adapters (e.g. backend-presence) may append stacks
  graph.stacks = Array.from(new Set(graph.stacks)).sort();
  runAnalyses(graph, { config, root: absRoot });

  const generatedAt = options.generatedAt || new Date().toISOString();
  const doc = canonicalize({
    schemaVersion: SCHEMA_VERSION,
    analyzerVersion: ANALYZER_VERSION,
    app: appMeta.app,
    appVersion: appMeta.appVersion,
    sourceCommit: readSourceCommit(absRoot),
    generatedAt,
    stacks: graph.stacks.slice().sort(),
    stats: computeStats(graph),
    nodes: Array.from(graph.nodes.values()),
    edges: Array.from(graph.edges.values()),
    trees: graph.trees,
    storage: graph.storage,
    network: graph.network,
    database: graph.database,
    env: graph.env,
    features: graph.features,
    traces: graph.traces,
    findings: graph.findings,
    analyzerCoverage: {
      unresolved: graph.unresolved.slice(),
      adaptersRun: (graph.adaptersRun || adaptersRun || []).slice(),
      backendPresence: graph.backendPresence || { supabase: false, firebase: false, sqlite: false },
    },
  });

  if (options.outDir) {
    writeOutputs(options.outDir, doc, { writeAudit: options.writeAudit !== false, root: absRoot });
  }

  return doc;
}

/**
 * @param {string} outDir
 * @param {object} doc
 * @param {{ writeAudit?: boolean, root?: string }} [opts]
 */
export function writeOutputs(outDir, doc, opts) {
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'architecture-data.json');
  const jsPath = path.join(outDir, 'architecture-data.js');
  const json = JSON.stringify(doc, null, 2) + '\n';
  fs.writeFileSync(jsonPath, json);
  fs.writeFileSync(jsPath, 'window.ARCH_DATA = ' + JSON.stringify(doc) + ';\n');
  if (opts && opts.writeAudit) {
    fs.writeFileSync(path.join(outDir, 'AUDIT.md'), writeAuditMarkdown(doc, opts.root || ''));
  }
  copyViewerAssets(outDir);
}

/** Copy shared static viewer next to generated data (SPEC §1.2). No-op if outDir is the source viewer. */
export function copyViewerAssets(outDir) {
  const absOut = path.resolve(outDir);
  const absSrc = path.resolve(VIEWER_SRC);
  if (absOut === absSrc) return;
  if (!fs.existsSync(absSrc)) return;
  for (const name of VIEWER_ASSETS) {
    const from = path.join(absSrc, name);
    if (!fs.existsSync(from)) continue;
    fs.copyFileSync(from, path.join(absOut, name));
  }
}

function loadConfig(root) {
  const p = path.join(root, 'architecture.config.json');
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function readAppMeta(root, config) {
  let app = (config && config.app) || path.basename(root);
  let appVersion = (config && config.appVersion) || '0.0.0';
  const versionJson = path.join(root, 'VERSION.json');
  if (fs.existsSync(versionJson)) {
    try {
      const v = JSON.parse(fs.readFileSync(versionJson, 'utf8'));
      if (v.app) app = v.app;
      if (v.version) appVersion = v.version;
    } catch { /* ignore */ }
  }
  const pkg = path.join(root, 'package.json');
  if (fs.existsSync(pkg)) {
    try {
      const p = JSON.parse(fs.readFileSync(pkg, 'utf8'));
      if (p.name && app === path.basename(root)) app = p.name;
      if (p.version && appVersion === '0.0.0') appVersion = p.version;
    } catch { /* ignore */ }
  }
  return { app, appVersion };
}

function readSourceCommit(root) {
  const r = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  if (r.status === 0) return String(r.stdout || '').trim();
  return 'unknown';
}
