/**
 * G18 — docs truth audit (§11.4).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DOC_EXT = /\.(md|mdx|html|htm)$/i;
const SKIP_DIR = new Set([
  'node_modules', '.git', 'dist', 'out', 'build', 'coverage',
  'playwright-report', 'test-results', '.next', 'ios', 'android', 'vendor', 'archive',
]);

const LEGACY_OS = [
  /\bTravelOS\b/, /\bPrismOS\b/, /\bVaultOS\b/, /\bFitnessOS\b/, /\bDisciplineOS\b/,
  /\bStundsOS\b/, /\bDeePonyOS\b/, /\bSoulOS\b/, /\bLedgerOS\b/, /\bPulseOS\b/,
  /\bAuraOS\b/, /\bScentOS\b/, /\bCookOS\b/, /\bCarOS\b/, /\bIdeaOS\b/, /\bMasteryOS\b/,
  /\bPassport OS\b/i,
];

const STALE_COUNTS = [
  { re: /\bten apps\b/i, id: 'stale:ten-apps' },
  { re: /\bthirteen Caps\b/i, id: 'stale:thirteen-caps' },
  { re: /\b300\+\s*exercises\b/i, id: 'stale:300-exercises' },
];

function walkDocs(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDocs(p, acc);
    else if (DOC_EXT.test(ent.name)) acc.push(p);
  }
  return acc;
}

function tryJson(root, rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function findSwCache(root, swCache) {
  if (!swCache) return { matched: true, detail: 'no swCache (N/A)' };
  const candidates = [];
  for (const f of ['sw.js', 'public/sw.js', 'docs/sw.js', 'out/sw.js', 'dist/sw.js', 'vite.config.ts', 'vite.config.js', 'vite.config.mjs']) {
    if (fs.existsSync(path.join(root, f))) candidates.push(f);
  }
  try {
    for (const f of fs.readdirSync(root)) {
      if (/^sw(-v\d+)?\.js$/.test(f) && !candidates.includes(f)) candidates.push(f);
    }
  } catch { /* */ }
  if (!candidates.length) return { matched: false, detail: 'no sw.js to verify cache tag' };
  for (const sw of candidates) {
    const text = fs.readFileSync(path.join(root, sw), 'utf8');
    if (
      text.includes(swCache) ||
      /cacheId\s*:\s*versionManifest\.swCache/.test(text) ||
      /cacheId\s*:\s*.*swCache/.test(text)
    ) {
      return { matched: true, detail: `${sw} ↔ ${swCache}` };
    }
  }
  return { matched: false, detail: `${candidates[0]} missing ${swCache}` };
}

function extractDocVersions(text) {
  const found = [];
  const patterns = [
    /Current version[:\s]+[vV]?([\d.]+(?:\+\d+)?)/i,
    /^\s*[-*]?\s*Version:\s*[vV]?([\d.]+(?:\+\d+)?)/im,
    /\*\*v?([\d.]+(?:\+\d+)?)\*\*/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) found.push(m[1]);
  }
  return found;
}

function checkNpmScriptsInBash(text, scripts) {
  const bad = [];
  const fence = /```(?:bash|sh|shell|zsh)\s*\n([\s\S]*?)```/gi;
  let m;
  while ((m = fence.exec(text))) {
    const block = m[1];
    const re = /\bnpm\s+run\s+([a-zA-Z0-9:_-]+)/g;
    let mm;
    while ((mm = re.exec(block))) {
      const name = mm[1];
      if (!scripts[name]) bad.push(name);
    }
  }
  return [...new Set(bad)];
}

function checkRelativeLinks(fileAbs, text, root) {
  const bad = [];
  const dir = path.dirname(fileAbs);
  const re = /\[([^\]]*)\]\(([^)]+)\)|href=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    const raw = (m[2] || m[3] || '').trim();
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
    const clean = raw.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(dir, clean);
    if (!target.startsWith(root)) continue;
    if (!fs.existsSync(target)) bad.push(raw);
  }
  return bad.slice(0, 15);
}

export function checkDocsTruthGate(root) {
  const failures = [];
  const ver = tryJson(root, 'VERSION.json');
  const pkg = tryJson(root, 'package.json');
  const version = ver?.version || null;
  const pkgVersion = pkg?.version || null;
  const swCache = ver?.swCache || ver?.cache || null;
  const scripts = pkg?.scripts || {};

  if (!ver) failures.push('VERSION.json missing');
  if (!pkg) failures.push('package.json missing');
  if (version && pkgVersion && version !== pkgVersion) {
    failures.push(`VERSION.json ${version} ≠ package.json ${pkgVersion}`);
  }

  const sw = findSwCache(root, swCache);
  if (swCache && !sw.matched) failures.push(`sw-cache: ${sw.detail}`);

  const docs = walkDocs(root);
  for (const abs of docs) {
    const rel = path.relative(root, abs);
    if (/(^|\/)(playwright-report|coverage|qa\/finish-loop\/lighthouse)\//.test(rel.replace(/\\/g, '/'))) continue;
    let text;
    try { text = fs.readFileSync(abs, 'utf8'); } catch { continue; }
    if (text.length > 1_500_000) continue;

    if (version) {
      const docVers = extractDocVersions(text);
      for (const dv of docVers) {
        if (dv !== version && /current version|^\s*[-*]?\s*Version:/im.test(text)) {
          if (/^(README|HANDOVER|CLAUDE|AGENTS|FEATURES|ROADMAP)\./i.test(path.basename(rel))) {
            failures.push(`${rel}: docs version ${dv} ≠ ${version}`);
          }
        }
      }
    }

    for (const s of checkNpmScriptsInBash(text, scripts)) {
      failures.push(`${rel}: npm run ${s} not in package.json`);
    }
    for (const b of checkRelativeLinks(abs, text, root)) {
      failures.push(`${rel}: broken link ${b}`);
    }
    for (const re of LEGACY_OS) {
      if (re.test(text)) {
        failures.push(`${rel}: legacy app-as-OS (${re.source.replace(/\\b/g, '')})`);
        break;
      }
    }
    for (const sc of STALE_COUNTS) {
      if (sc.re.test(text)) failures.push(`${rel}: ${sc.id}`);
    }
  }

  const capped = failures.slice(0, 20);
  const extra = failures.length > 20 ? ` (+${failures.length - 20} more)` : '';
  if (failures.length) {
    return { ok: false, id: 'g18:docs-truth', detail: capped.join('; ') + extra, failures };
  }
  return {
    ok: true,
    id: 'g18:docs-truth',
    detail: `versions aligned (${version || pkgVersion || '?'}); ${docs.length} docs scanned; ${sw.detail}`,
    failures: [],
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const appRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const r = checkDocsTruthGate(appRoot);
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.id}: ${r.detail}`);
  process.exit(r.ok ? 0 : 1);
}
