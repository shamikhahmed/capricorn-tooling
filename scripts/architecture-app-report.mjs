#!/usr/bin/env node
/**
 * ARCH-10 CLI — emit APP-REPORT ## Architecture section from pilot maps / queue.
 *
 * Usage (from capricorn-tooling/):
 *   npm run architecture:app-report -- --app PulseCap
 *   npm run architecture:app-report -- --app PulseCap --out qa/architecture/APP-REPORT-ARCH10-PulseCap.md
 *   npm run architecture:app-report -- --app PulseCap --insert ../PulseCap/qa/finish-loop/APP-REPORT.md
 *   npm run architecture:app-report -- --template
 *   npm run architecture:app-report -- --data path/to/architecture-data.json --app PulseCap
 *
 * Paste location in each Cap repo: qa/finish-loop/APP-REPORT.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalizeAppId } from '../shared/architecture/findings-to-queue.mjs';
import {
  blankArchitectureTemplate,
  formatArchitectureSection,
  upsertArchitectureSection,
} from '../shared/architecture/app-report-section.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = path.resolve(HERE, '..');

function parseArgs(argv) {
  const opts = {
    dir: path.join(TOOLING_ROOT, 'qa', 'architecture'),
    app: null,
    data: null,
    queue: null,
    out: null,
    insert: null,
    template: false,
    stdout: false,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir' && argv[i + 1]) opts.dir = path.resolve(argv[++i]);
    else if (a === '--app' && argv[i + 1]) opts.app = canonicalizeAppId(argv[++i]);
    else if (a === '--data' && argv[i + 1]) opts.data = path.resolve(argv[++i]);
    else if (a === '--queue' && argv[i + 1]) opts.queue = path.resolve(argv[++i]);
    else if (a === '--out' && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (a === '--insert' && argv[i + 1]) opts.insert = path.resolve(argv[++i]);
    else if (a === '--template') opts.template = true;
    else if (a === '--stdout') opts.stdout = true;
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  return opts;
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Map Cap app id → pilot-* slug directories under qa/architecture.
 * @param {string} archDir
 * @param {string} appId
 * @returns {{ dataPath: string, mapRel: string, slug: string } | null}
 */
function findPilotData(archDir, appId) {
  if (!fs.existsSync(archDir)) return null;
  const want = canonicalizeAppId(appId);
  const entries = fs.readdirSync(archDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory() || !ent.name.startsWith('pilot-')) continue;
    const slug = ent.name.replace(/^pilot-/, '');
    const dataPath = path.join(archDir, ent.name, 'architecture-data.json');
    if (!fs.existsSync(dataPath)) continue;
    const hintId = canonicalizeAppId(slug);
    let docApp = null;
    try {
      docApp = canonicalizeAppId(loadJson(dataPath).app);
    } catch {
      docApp = null;
    }
    if (hintId === want || docApp === want) {
      return {
        dataPath,
        mapRel: path.relative(TOOLING_ROOT, path.join(archDir, ent.name)).split(path.sep).join('/'),
        slug,
      };
    }
  }
  return null;
}

function defaultQueuePath(archDir, appId) {
  return path.join(archDir, 'queue', appId + '-ARCH-QUEUE.json');
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log(`Usage:
  node scripts/architecture-app-report.mjs --app PulseCap [--out path] [--insert APP-REPORT.md]
  node scripts/architecture-app-report.mjs --data architecture-data.json --app PulseCap
  node scripts/architecture-app-report.mjs --template [--out path]

  --app       Cap app id (PulseCap, scent, …)
  --dir       Architecture dir (default: qa/architecture)
  --data      Explicit architecture-data.json
  --queue     Explicit ARCH-07 queue JSON (default: queue/<App>-ARCH-QUEUE.json if present)
  --out       Write section markdown
  --insert    Upsert ## Architecture into an existing APP-REPORT.md
  --template  Emit blank template only
  --stdout    Also print section to stdout
`);
    process.exit(0);
  }

  if (opts.template) {
    const md = blankArchitectureTemplate();
    const out =
      opts.out ||
      path.join(
        TOOLING_ROOT,
        'shared',
        'architecture',
        'templates',
        'APP-REPORT-ARCHITECTURE.md'
      );
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, md);
    console.log('Wrote template ' + path.relative(TOOLING_ROOT, out));
    if (opts.stdout) process.stdout.write(md);
    process.exit(0);
  }

  if (!opts.app && !opts.data) {
    console.error('Need --app and/or --data (or --template). See --help.');
    process.exit(1);
  }

  let dataPath = opts.data;
  let mapRel = null;
  if (!dataPath) {
    const found = findPilotData(opts.dir, opts.app);
    if (!found) {
      console.error(
        'No architecture-data.json for ' +
          opts.app +
          ' under ' +
          opts.dir +
          '. Run architecture:analyze / architecture:regen first.'
      );
      process.exit(1);
    }
    dataPath = found.dataPath;
    mapRel = found.mapRel;
  } else {
    mapRel = path.relative(TOOLING_ROOT, path.dirname(dataPath)).split(path.sep).join('/');
  }

  const doc = loadJson(dataPath);
  const appId = opts.app || canonicalizeAppId(doc.app);
  if (!appId) {
    console.error('Could not resolve app id; pass --app.');
    process.exit(1);
  }

  let queue = null;
  let queueRel = null;
  const queuePath = opts.queue || defaultQueuePath(opts.dir, appId);
  if (fs.existsSync(queuePath)) {
    queue = loadJson(queuePath);
    queueRel = path.relative(TOOLING_ROOT, queuePath).split(path.sep).join('/');
  }

  const section = formatArchitectureSection({
    doc,
    queue,
    appId,
    mapRel,
    queueRel,
  });

  const defaultOut = path.join(
    TOOLING_ROOT,
    'qa',
    'architecture',
    'APP-REPORT-ARCH10-' + appId + '.md'
  );
  const outPath = opts.out || defaultOut;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, section);
  console.log('Wrote ' + path.relative(TOOLING_ROOT, outPath));

  if (opts.insert) {
    const existing = fs.existsSync(opts.insert) ? fs.readFileSync(opts.insert, 'utf8') : '';
    const { markdown, action } = upsertArchitectureSection(existing, section);
    fs.mkdirSync(path.dirname(opts.insert), { recursive: true });
    fs.writeFileSync(opts.insert, markdown);
    console.log(action + ' Architecture section in ' + opts.insert);
  }

  if (opts.stdout) process.stdout.write(section);
}

main();
