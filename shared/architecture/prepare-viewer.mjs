#!/usr/bin/env node
/**
 * Prepare / refresh the architecture viewer demo data (SPEC §5).
 * Usage:
 *   node shared/architecture/prepare-viewer.mjs
 *   node shared/architecture/prepare-viewer.mjs --root <path>
 *   node shared/architecture/prepare-viewer.mjs --stress 5000
 *
 * Opens from file:// — no network server required.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeRepo } from './core/pipeline.mjs';
import { writeOutputs } from './core/pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viewerDir = path.join(__dirname, 'viewer');
const defaultRoot = path.join(__dirname, '__tests__', 'fixtures', 'vanilla-dispatch');

function parseArgs(argv) {
  const out = { root: defaultRoot, stress: 0 };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) out.root = path.resolve(argv[++i]);
    else if (argv[i] === '--stress' && argv[i + 1]) out.stress = Number(argv[++i]) || 0;
    else if (argv[i] === '--help' || argv[i] === '-h') out.help = true;
  }
  return out;
}

function stressDoc(n) {
  const nodes = [];
  const edges = [];
  nodes.push({
    id: 'app:.#stress',
    type: 'app',
    name: 'stress-' + n,
    file: '.',
    line: 0,
    endLine: 0,
    layer: 'app',
    feature: null,
    flags: [],
    meta: {},
  });
  for (let i = 0; i < n; i++) {
    const layer = ['screen', 'component', 'logic', 'state', 'service', 'data'][i % 6];
    const type =
      layer === 'screen' ? 'screen' :
      layer === 'component' ? 'component' :
      layer === 'state' ? 'state' :
      layer === 'service' ? 'service' :
      layer === 'data' ? 'storage' : 'function';
    const id = type + ':f' + (i % 50) + '/n' + i + '#sym' + i;
    nodes.push({
      id: id,
      type: type,
      name: 'n' + i,
      file: 'f' + (i % 50) + '/n' + i + '.js',
      line: 1,
      endLine: 2,
      layer: layer,
      feature: null,
      flags: [],
      meta: {},
    });
  }
  for (let i = 0; i < n; i++) {
    const from = i === 0 ? nodes[0].id : nodes[i].id;
    const to = nodes[i + 1].id;
    edges.push({
      id: 'e:CALLS:' + from + '->' + to,
      from: from,
      to: to,
      type: 'CALLS',
      status: 'VERIFIED',
      evidence: [{ file: 'stress.js', line: 1, snippet: 'link' }],
    });
  }
  return {
    schemaVersion: 1,
    analyzerVersion: '1.0.0',
    app: 'stress-' + n,
    appVersion: '0.0.0',
    sourceCommit: 'stress',
    generatedAt: new Date().toISOString(),
    stacks: ['stress'],
    stats: {
      files: 50,
      screens: Math.ceil(n / 6),
      routes: 0,
      components: Math.ceil(n / 6),
      hooks: 0,
      functions: Math.ceil(n / 6),
      classes: 0,
      services: Math.ceil(n / 6),
      stateHolders: Math.ceil(n / 6),
      storageKeys: Math.ceil(n / 6),
      tables: 0,
      apiEndpoints: 0,
      externalHosts: 0,
      envVars: 0,
      dependencies: 0,
      edges: { total: edges.length, byStatus: { VERIFIED: edges.length, INFERRED: 0, UNKNOWN: 0, BROKEN: 0 } },
      orphans: 0,
      unused: 0,
      dead: 0,
      duplicates: 0,
      brokenPaths: 0,
      hardcoded: 0,
      mock: 0,
      demo: 0,
      unknown: 0,
      securityItems: 0,
      featuresComplete: 0,
      featuresIncomplete: 0,
      findings: 0,
    },
    nodes: nodes,
    edges: edges,
    trees: {},
    storage: [],
    network: [],
    database: { engine: null, tables: [] },
    env: [],
    features: [],
    traces: { data: [], actions: [], display: [] },
    findings: [],
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    process.stdout.write(
      'Usage: node prepare-viewer.mjs [--root <path>] [--stress <n>]\n' +
        'Writes architecture-data.{js,json} into shared/architecture/viewer/\n' +
        'Open viewer/index.html via file:// (no server).\n'
    );
    process.exit(0);
  }

  let doc;
  if (args.stress > 0) {
    doc = stressDoc(args.stress);
    writeOutputs(viewerDir, doc, { writeAudit: false });
    process.stdout.write(
      'Wrote stress architecture data (' + args.stress + ' nodes) → ' + viewerDir + '\n'
    );
  } else {
    doc = analyzeRepo(args.root, { outDir: viewerDir, writeAudit: false });
    process.stdout.write(
      'Wrote architecture data for ' + doc.app + ' → ' + viewerDir +
        ' (nodes=' + doc.nodes.length + ' edges=' + doc.edges.length + ')\n'
    );
  }

  const indexPath = path.join(viewerDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    process.stderr.write('Missing viewer/index.html — expected shared viewer files.\n');
    process.exit(1);
  }

  process.stdout.write('\nOpen (file://, no network):\n  open ' + indexPath + '\n');
  process.stdout.write('Or: npm run architecture:viewer\n');
}

main();
