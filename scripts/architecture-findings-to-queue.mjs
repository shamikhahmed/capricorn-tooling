#!/usr/bin/env node
/**
 * ARCH-07 CLI — turn pilot / architecture-data findings into Finish Program queues.
 *
 * Usage (from capricorn-tooling/):
 *   npm run architecture:queue
 *   node scripts/architecture-findings-to-queue.mjs [--dir qa/architecture] [--apps PulseCap,ScentCap,CarCap,VaultCap]
 *   node scripts/architecture-findings-to-queue.mjs --data path/to/architecture-data.json --app PulseCap
 *
 * Writes:
 *   qa/architecture/queue/<App>-ARCH-QUEUE.{json,md}
 *   qa/architecture/QUEUE-INDEX.{json,md}
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findingsToQueueItems,
  formatQueueMarkdown,
  buildFleetQueueIndex,
  canonicalizeAppId,
} from '../shared/architecture/findings-to-queue.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = path.resolve(HERE, '..');

function parseArgs(argv) {
  const opts = {
    dir: path.join(TOOLING_ROOT, 'qa', 'architecture'),
    outDir: null,
    apps: null,
    data: null,
    app: null,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir' && argv[i + 1]) opts.dir = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === '--apps' && argv[i + 1]) {
      opts.apps = new Set(
        String(argv[++i])
          .split(',')
          .map(function (s) {
            return canonicalizeAppId(s.trim());
          })
          .filter(Boolean)
      );
    } else if (a === '--data' && argv[i + 1]) opts.data = path.resolve(argv[++i]);
    else if (a === '--app' && argv[i + 1]) opts.app = canonicalizeAppId(argv[++i]);
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  if (!opts.outDir) opts.outDir = path.join(opts.dir, 'queue');
  return opts;
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Discover architecture-data.json under pilot-* dirs (and optional direct --data).
 * @param {string} archDir
 * @returns {{ appHint: string, dataPath: string, rel: string }[]}
 */
function discoverPilotData(archDir) {
  const out = [];
  if (!fs.existsSync(archDir)) return out;
  const entries = fs.readdirSync(archDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (!ent.name.startsWith('pilot-')) continue;
    const dataPath = path.join(archDir, ent.name, 'architecture-data.json');
    if (!fs.existsSync(dataPath)) continue;
    const slug = ent.name.replace(/^pilot-/, '');
    out.push({
      appHint: slug,
      dataPath,
      rel: path.relative(TOOLING_ROOT, dataPath).split(path.sep).join('/'),
    });
  }
  out.sort(function (a, b) {
    return a.appHint < b.appHint ? -1 : 1;
  });
  return out;
}

function writeQueueFiles(outDir, queue) {
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, queue.appId + '-ARCH-QUEUE');
  const jsonPath = base + '.json';
  const mdPath = base + '.md';
  const payload = {
    schemaVersion: 1,
    arch: 'ARCH-07',
    appId: queue.appId,
    generatedAt: new Date().toISOString(),
    counts: queue.counts,
    meta: queue.meta,
    items: queue.items.map(function (it) {
      // Drop evidenceRaw from committed JSON size; keep formatted evidence lines.
      return {
        id: it.id,
        n: it.n,
        findingId: it.findingId,
        kind: it.kind,
        severity: it.severity,
        priority: it.priority,
        title: it.title,
        explanation: it.explanation,
        nodes: it.nodes,
        evidence: it.evidence,
        doneWhen: it.doneWhen,
        status: it.status,
      };
    }),
  };
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + '\n');
  fs.writeFileSync(mdPath, formatQueueMarkdown(queue));
  return { jsonPath, mdPath };
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    process.stdout.write(
      'Usage: node scripts/architecture-findings-to-queue.mjs [--dir qa/architecture] [--apps PulseCap,ScentCap] [--data file --app App]\n'
    );
    process.exit(0);
  }

  const sources = [];
  if (opts.data) {
    if (!fs.existsSync(opts.data)) {
      process.stderr.write('Data not found: ' + opts.data + '\n');
      process.exit(1);
    }
    sources.push({
      appHint: opts.app || null,
      dataPath: opts.data,
      rel: path.relative(TOOLING_ROOT, opts.data).split(path.sep).join('/'),
    });
  } else {
    sources.push.apply(sources, discoverPilotData(opts.dir));
  }

  if (!sources.length) {
    process.stderr.write(
      'No architecture-data.json found under ' + opts.dir + '/pilot-* (run architecture:analyze first).\n'
    );
    process.exit(1);
  }

  const indexEntries = [];
  let written = 0;

  for (const src of sources) {
    const doc = loadJson(src.dataPath);
    // Prefer architecture-data.app / --app over pilot folder slug.
    const appId = canonicalizeAppId(opts.app || doc.app || src.appHint);
    if (opts.apps && !opts.apps.has(appId)) continue;

    const queue = findingsToQueueItems(doc, {
      appId,
      sourcePath: src.rel,
    });
    const paths = writeQueueFiles(opts.outDir, queue);
    indexEntries.push({
      appId: queue.appId,
      counts: queue.counts,
      meta: queue.meta,
      queuePath: path.relative(TOOLING_ROOT, paths.jsonPath).split(path.sep).join('/'),
    });
    written += 1;
    process.stderr.write(
      'Wrote ' +
        queue.appId +
        ' queue: ' +
        queue.counts.total +
        ' items → ' +
        path.relative(TOOLING_ROOT, paths.mdPath) +
        '\n'
    );
  }

  if (!written) {
    process.stderr.write('No apps matched --apps filter.\n');
    process.exit(1);
  }

  const index = buildFleetQueueIndex(indexEntries);
  const indexJson = path.join(opts.dir, 'QUEUE-INDEX.json');
  const indexMd = path.join(opts.dir, 'QUEUE-INDEX.md');
  fs.writeFileSync(indexJson, JSON.stringify(index.json, null, 2) + '\n');
  fs.writeFileSync(indexMd, index.markdown);
  process.stderr.write(
    'Fleet index: ' +
      index.json.apps +
      ' apps, ' +
      index.json.totalItems +
      ' items → ' +
      path.relative(TOOLING_ROOT, indexMd) +
      '\n'
  );
}

main();
