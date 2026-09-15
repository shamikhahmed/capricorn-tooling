#!/usr/bin/env node
/**
 * Cap Fleet Tier 1 gate runner (C-10).
 * Plain Node — no new dependencies.
 *
 * Usage (from an app repo):
 *   node ../capricorn-tooling/shared/testing/tier1.mjs
 *   npm run tier1
 *
 * Writes qa/finish-loop/TIER1.json and exits non-zero on any failure.
 *
 * Env:
 *   TIER1_BASELINE_SHA — optional git SHA; suppressions added after this are violations
 *   TIER1_SKIP_CI — set to 1 to skip gh run check (local-only)
 *   TIER1_SKIP_LH — set to 1 to skip requiring lighthouse JSON files
 *   TIER1_SKIP_MATRIX — set to 1 to skip requiring finish-matrix evidence
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'qa', 'finish-loop');
const OUT = path.join(OUT_DIR, 'TIER1.json');

const FAIL = [];
const WARN = [];
const PASS = [];

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}

function tryRead(p) {
  try {
    return read(p);
  } catch {
    return null;
  }
}

function add(ok, id, detail) {
  const row = { id, detail };
  if (ok) PASS.push(row);
  else FAIL.push(row);
}

function warn(id, detail) {
  WARN.push({ id, detail });
}

function sh(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts,
    }).trim();
  } catch (e) {
    return { error: true, status: e.status, stdout: e.stdout?.toString?.() || '', stderr: e.stderr?.toString?.() || e.message };
  }
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist' || ent.name === 'out' || ent.name === 'build' || ent.name === 'coverage' || ent.name === 'playwright-report' || ent.name === 'test-results' || ent.name === '.next' || ent.name === 'ios' || ent.name === 'android') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

function isProductCode(rel) {
  if (/\.(test|spec)\./.test(rel)) return false;
  // Bundled concatenations — scan sources only (LedgerCap ledgercap.bundle.js)
  if (/\.bundle\.(js|mjs|cjs|css)$/.test(rel)) return false;
  // Lab folders (SoulCap P-SOUL-2 and peers): not Pages / not Tier 1 scored
  if (/(^|\/)(backend|mobile)(\/|$)/.test(rel)) return false;
  // Non-product trees
  if (/(^|\/)(tests?|e2e|qa|scripts|__tests__|archive|vendor)(\/|$)/.test(rel)) return false;
  // GitHub Pages apps ship from docs/ — score product files there, skip assets/vendor
  if (/(^|\/)docs(\/|$)/.test(rel)) {
    if (/(^|\/)docs\/(archive|screenshots|vendor|assets)(\/|$)/.test(rel)) return false;
    if (/\.report\.html$/i.test(rel)) return false;
  }
  // Marketing / gallery / legal / changelog shells (not app chrome)
  if (/(^|\/)(landing|pitch|presentation|screen-gallery|privacy|support|terms|offline|changelog|install)\.html$/.test(rel)) return false;
  if (/\.(md|json|lock|svg|png|jpg|woff2|map)$/.test(rel)) return false;
  return /\.(js|jsx|ts|tsx|mjs|cjs|css|html|dart)$/.test(rel);
}

function killListScan() {
  const files = walkFiles(ROOT).filter((abs) => isProductCode(path.relative(ROOT, abs)));
  const brandOk = /(tokens|brand|theme|cap-foundation|design-tokens|capricorn-core|premium-overrides|premium-craft|cap-premium|css\/base|css\/components|css\/layout|css\/identity|css\/app|css\/institute|css\/shell|css\/ember|css\/lc-pro|css\/psx|css\/ledger|css\/home-market|brand-mark|globals\.css|index\.css|premium\.css|App\.css|data\/constants\.ts|data\/wallpapers\.ts)/i;
  const counts = {
    rawHex: 0,
    sub11: 0,
    important: 0,
    nativeDialog: 0,
    outlineNone: 0,
    consoleLog: 0,
    googleFonts: 0,
    innerHTML: 0,
  };
  // Color hex only (not CSS/JS id selectors like #helpFab). Require color-ish prefix.
  const hexRe = /(?:(?::|,|\()\s*|["'])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  const pxRe = /font-size\s*:\s*([0-9.]+)px/g;
  const importantRe = /!important/g;
  const dialogRe = /(?:window\.)?\b(?:alert|confirm|prompt)\s*\(/g;
  const outlineRe = /outline\s*:\s*none\b/g;
  const consoleRe = /console\.log\s*\(/g;
  const gfRe = /fonts\.googleapis\.com|fonts\.gstatic\.com/g;
  const ihRe = /\.innerHTML\s*=/g;

  for (const abs of files) {
    const rel = path.relative(ROOT, abs);
    let text;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    const inBrand = brandOk.test(rel);
    if (!inBrand) {
      // Skip browser chrome theme-color meta (must be literal; tokens live in brand.css)
      const forHex = text
        .split('\n')
        .filter((line) => !/theme[_-]?color|background[_-]?color|msapplication-TileColor|stop-color/i.test(line))
        .join('\n');
      const hex = forHex.match(hexRe);
      if (hex) counts.rawHex += hex.length;

      let m;
      pxRe.lastIndex = 0;
      while ((m = pxRe.exec(text))) {
        const n = parseFloat(m[1]);
        if (n < 11) counts.sub11 += 1;
      }
      // Allow !important only in reduced-motion / forced-colors blocks — approximate: count all then note
      const imp = text.match(importantRe);
      if (imp) {
        let allowed = 0;
        const reMedia =
          /@media[^{]*(prefers-reduced-motion|forced-colors|prefers-reduced-transparency|print)[^{]*\{/g;
        let mm;
        while ((mm = reMedia.exec(text))) {
          let depth = 0;
          const start = mm.index + mm[0].length - 1;
          for (let j = start; j < text.length; j++) {
            const ch = text[j];
            if (ch === '{') depth += 1;
            else if (ch === '}') {
              depth -= 1;
              if (depth === 0) {
                const block = text.slice(start, j + 1);
                allowed += (block.match(importantRe) || []).length;
                reMedia.lastIndex = j + 1;
                break;
              }
            }
          }
        }
        counts.important += Math.max(0, (imp?.length || 0) - allowed);
      }
      const o = text.match(outlineRe);
      if (o) counts.outlineNone += o.length;
    }
    if (!/\.dart$/.test(rel)) {
      // RN Alert.alert is allowed (IdeaCap) — skip Alert.alert
      // BeforeInstallPromptEvent.prompt() is not a native dialog
      const cleaned = text
        .replace(/Alert\.alert\s*\(/g, 'Alert.__ok__(')
        .replace(/\.\s*prompt\s*\(/g, '.__bipPrompt__(');
      const d = cleaned.match(dialogRe);
      if (d) counts.nativeDialog += d.length;
    }
    const c = text.match(consoleRe);
    if (c) counts.consoleLog += c.length;
    const g = text.match(gfRe);
    if (g) counts.googleFonts += g.length;
    const ih = text.match(ihRe);
    if (ih) counts.innerHTML += ih.length;
  }
  return counts;
}

function checkRecords() {
  const needed = [
    'qa/finish-loop/BASELINE.md',
    'qa/finish-loop/LOG.md',
    'qa/finish-loop/STATES.md',
    'qa/finish-loop/APP-REPORT.md',
    'qa/finish-loop/DOCS-INVENTORY.md',
  ];
  for (const f of needed) {
    add(exists(f), `records:${path.basename(f)}`, exists(f) ? 'present' : `missing ${f}`);
  }
  if (exists('qa/finish-loop/APP-REPORT.md')) {
    const sz = fs.statSync(path.join(ROOT, 'qa/finish-loop/APP-REPORT.md')).size;
    add(sz >= 1024, 'records:APP-REPORT-size', `${sz} bytes (need ≥1024)`);
  }
}

function checkVersionTruth() {
  const ver = tryRead('VERSION.json');
  if (!ver) {
    add(false, 'version:VERSION.json', 'missing');
    return null;
  }
  let j;
  try {
    j = JSON.parse(ver);
  } catch {
    add(false, 'version:VERSION.json', 'invalid JSON');
    return null;
  }
  add(!!j.version, 'version:field', j.version || 'missing');
  const swCache = j.swCache || j.cache || null;
  if (!swCache) {
    warn('version:swCache', 'no swCache field (native-only apps may N/A)');
    return j;
  }
  // Find SW file (or VitePWA cacheId wired to VERSION.json)
  const swCandidates = [
    'sw.js',
    'public/sw.js',
    'docs/sw.js',
    'out/sw.js',
    'dist/sw.js',
    'sw-v51.js',
    'vite.config.ts',
    'vite.config.js',
    'vite.config.mjs',
  ].filter(exists);
  // Also any root sw-*.js (VaultCap historical filename)
  try {
    for (const f of fs.readdirSync(ROOT)) {
      if (/^sw(-v\d+)?\.js$/.test(f) && !swCandidates.includes(f)) swCandidates.push(f);
    }
  } catch {
    /* */
  }
  let matched = false;
  let detail = 'no sw.js found';
  for (const sw of swCandidates) {
    const text = read(sw);
    if (text.includes(swCache) || text.includes(`'${swCache}'`) || text.includes(`"${swCache}"`)) {
      matched = true;
      detail = `${sw} contains ${swCache}`;
      break;
    }
    // workbox / VitePWA: cacheId from VERSION.json (versionManifest.swCache)
    if (
      text.includes(`prefix:"${swCache}"`) ||
      text.includes(`prefix: "${swCache}"`) ||
      /cacheId\s*:\s*versionManifest\.swCache/.test(text) ||
      /cacheId\s*:\s*.*swCache/.test(text)
    ) {
      matched = true;
      detail = `${sw} workbox/VitePWA cacheId ↔ ${swCache}`;
      break;
    }
    detail = `${sw} missing ${swCache}`;
  }
  add(matched, 'version:sw-cache-match', detail);
  return j;
}

function checkSuppressions() {
  const files = walkFiles(ROOT).filter((abs) => isProductCode(path.relative(ROOT, abs)));
  const bad = [];
  const re = /eslint-disable|@ts-ignore|@ts-expect-error|\.skip\(|\.only\(|xit\(|xdescribe\(|fit\(|fdescribe\(/;
  for (const abs of files) {
    const rel = path.relative(ROOT, abs);
    const text = fs.readFileSync(abs, 'utf8');
    if (re.test(text)) {
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        if (re.test(line)) bad.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
    }
  }
  add(bad.length === 0, 'suppressions', bad.length ? bad.slice(0, 20).join('\n') : 'none');
  return bad;
}

function checkAppReady() {
  // Search product sources for __APP_READY__
  const files = walkFiles(ROOT);
  let found = false;
  for (const abs of files) {
    const rel = path.relative(ROOT, abs);
    if (!/\.(js|jsx|ts|tsx|html|mjs)$/.test(rel)) continue;
    if (/(node_modules|dist|out|\.next)/.test(rel)) continue;
    try {
      const t = fs.readFileSync(abs, 'utf8');
      if (/__APP_READY__/.test(t)) {
        found = true;
        break;
      }
    } catch {
      /* */
    }
  }
  add(found, 'app-ready', found ? 'window.__APP_READY__ referenced' : 'missing __APP_READY__');
}

function checkCi() {
  if (process.env.TIER1_SKIP_CI === '1') {
    warn('ci:main', 'skipped via TIER1_SKIP_CI');
    return;
  }
  // Prefer completed runs (skip in-flight Deploy Pages / matrix jobs with empty conclusion)
  const r = sh(
    'gh run list -b main --limit 15 --json conclusion,status,databaseId,displayTitle,url,name 2>/dev/null',
  );
  if (typeof r === 'object' && r.error) {
    warn('ci:main', `gh unavailable: ${r.stderr || r.stdout}`);
    return;
  }
  try {
    const arr = JSON.parse(r || '[]');
    const done = arr.filter((x) => x && x.conclusion);
    const latest = done[0] || arr[0];
    if (!latest) {
      warn('ci:main', 'no runs');
      return;
    }
    if (!latest.conclusion) {
      warn('ci:main', `latest still ${latest.status || 'unknown'}: ${latest.displayTitle || latest.name}`);
      return;
    }
    add(
      latest.conclusion === 'success',
      'ci:main',
      `${latest.displayTitle || latest.name} → ${latest.conclusion} ${latest.url || ''}`,
    );
  } catch {
    warn('ci:main', 'could not parse gh output');
  }
}

function checkTag(version) {
  if (!version) return;
  const tags = sh('git tag -l');
  if (typeof tags === 'object' && tags.error) {
    warn('tag', 'git tag failed');
    return;
  }
  const list = String(tags).split('\n').filter(Boolean);
  const ok = list.includes(`v${version}`) || list.includes(version);
  add(ok, 'tag', ok ? `found v${version}` : `missing tag v${version} (have: ${list.slice(-5).join(', ')})`);
}

function checkMatrix() {
  if (process.env.TIER1_SKIP_MATRIX === '1') {
    warn('matrix', 'skipped');
    return;
  }
  const specs = walkFiles(ROOT).filter((abs) => /finish-matrix\.(spec|test)\./.test(abs));
  add(specs.length > 0, 'matrix:spec', specs.length ? specs.map((p) => path.relative(ROOT, p)).join(', ') : 'no finish-matrix spec');
  const shots = exists('qa/finish-loop/shots');
  if (!shots) warn('matrix:shots', 'qa/finish-loop/shots missing (run matrix)');
}

function checkLighthouse() {
  if (process.env.TIER1_SKIP_LH === '1') {
    warn('lighthouse', 'skipped');
    return;
  }
  const dir = path.join(ROOT, 'qa', 'finish-loop', 'lighthouse');
  if (!fs.existsSync(dir)) {
    add(false, 'lighthouse:dir', 'missing qa/finish-loop/lighthouse/');
    return;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  add(files.length > 0, 'lighthouse:files', files.length ? `${files.length} JSON` : 'empty');
}

function checkSinks() {
  const sinks = exists('qa/finish-loop/SINKS.md');
  if (!sinks) {
    warn('sinks', 'SINKS.md missing — required when innerHTML > 0');
    return;
  }
  add(true, 'sinks:SINKS.md', 'present');
}

function checkPackageScripts() {
  const pkg = tryRead('package.json');
  if (!pkg) {
    add(false, 'package.json', 'missing');
    return null;
  }
  try {
    return JSON.parse(pkg);
  } catch {
    add(false, 'package.json', 'invalid');
    return null;
  }
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const pkg = checkPackageScripts();
  const ver = checkVersionTruth();
  checkRecords();
  checkSuppressions();
  checkAppReady();
  checkCi();
  checkTag(ver?.version || pkg?.version);
  checkMatrix();
  checkLighthouse();
  checkSinks();

  const kills = killListScan();
  add(kills.rawHex === 0, 'kill:raw-hex', String(kills.rawHex));
  add(kills.sub11 === 0, 'kill:sub-11px', String(kills.sub11));
  add(kills.important === 0, 'kill:important', String(kills.important));
  add(kills.nativeDialog === 0, 'kill:native-dialogs', String(kills.nativeDialog));
  add(kills.outlineNone === 0, 'kill:outline-none', String(kills.outlineNone));
  add(kills.consoleLog === 0, 'kill:console.log', String(kills.consoleLog));
  add(kills.googleFonts === 0, 'kill:google-fonts', String(kills.googleFonts));
  if (kills.innerHTML > 0) {
    add(exists('qa/finish-loop/SINKS.md'), 'kill:innerHTML-classified', `${kills.innerHTML} sinks; SINKS.md ${exists('qa/finish-loop/SINKS.md') ? 'ok' : 'MISSING'}`);
  } else {
    add(true, 'kill:innerHTML', '0');
  }

  const result = {
    app: ver?.app || pkg?.name || path.basename(ROOT),
    version: ver?.version || pkg?.version || null,
    swCache: ver?.swCache || null,
    generatedAt: new Date().toISOString(),
    status: FAIL.length === 0 ? 'PASS' : 'FAIL',
    pass: PASS,
    fail: FAIL,
    warn: WARN,
    killList: kills,
  };

  fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
  console.log(`TIER1 ${result.status} — ${PASS.length} pass, ${FAIL.length} fail, ${WARN.length} warn`);
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
  if (FAIL.length) {
    console.log('\nFailures:');
    for (const f of FAIL) console.log(`  ✗ ${f.id}: ${f.detail}`);
  }
  if (WARN.length) {
    console.log('\nWarnings:');
    for (const w of WARN) console.log(`  ! ${w.id}: ${w.detail}`);
  }
  process.exit(FAIL.length === 0 ? 0 : 1);
}

main();
