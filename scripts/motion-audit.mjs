#!/usr/bin/env node
/**
 * motion-audit.mjs — Cap fleet motion DoD gate (MOTION.md § Per-app motion DoD).
 *
 *   node scripts/motion-audit.mjs                # all apps in motion-audit.config.json
 *   node scripts/motion-audit.mjs --app VaultCap # one app
 *   node scripts/motion-audit.mjs --json out.json
 *
 * Checks (static, per app):
 *   M1 tokens   — kit timing/easing present, current, loaded and used by authored code
 *   M2 reduced  — platform reduced-motion API honoured in authored code
 *   M3 shell    — app shell marked instant (data-cap-app / native: no launch delay)
 *   M4 splash   — splash (if any) is skippable, session-once, reduced-motion aware
 *   M5 no-gsap  — apps with noGsap: no GSAP / ScrollTrigger anywhere shipped
 * Exits 1 when any app fails any check.
 */
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findWorkspaceRoot } from './lib/workspace-root.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOLING = join(HERE, '..');
const WS = findWorkspaceRoot();
const GEN = join(TOOLING, 'shared/design-system/generated');
const { apps } = JSON.parse(readFileSync(join(HERE, 'motion-audit.config.json'), 'utf8'));

const args = process.argv.slice(2);
const only = args.includes('--app') ? args[args.indexOf('--app') + 1] : null;
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

const SRC_EXT = new Set(['.html', '.css', '.js', '.mjs', '.ts', '.tsx', '.jsx', '.dart']);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.next', 'out', 'generated', 'test-results', 'screenshots', 'archive', 'data']);
// Kit-vendored / generated copies — never count as "authored" adoption.
const KIT_FILE = /^(capricorn-core\.css|tokens\.capricorn-core\.css|capricorn-[\w-]+\.js|cap-demo-mode\.js|cap-desktop-nav\.js|cap-motion-tokens\.css|cap-motion\.ts|capMotion\.ts|cap_motion\.dart)$/;

function walk(abs, out, { includeVendor = false } = {}) {
  if (!existsSync(abs)) return out;
  const st = statSync(abs);
  if (st.isFile()) {
    if (SRC_EXT.has(extname(abs))) out.push(abs);
    return out;
  }
  for (const name of readdirSync(abs)) {
    if (SKIP_DIRS.has(name) || name.startsWith('.')) continue;
    if (!includeVendor && name === 'vendor') continue;
    walk(join(abs, name), out, { includeVendor });
  }
  return out;
}

const read = (p) => readFileSync(p, 'utf8');
const isAuthored = (p) => !KIT_FILE.test(basename(p)) && !/\.(min|bundle)\.js$/.test(p) && !/^\s*(\/\*|\/\/)\s*GENERATED/.test(read(p).slice(0, 200));

function genMatches(app, rel, genName) {
  const p = join(WS, app, rel);
  if (!existsSync(p)) return `missing ${rel}`;
  if (read(p) !== read(join(GEN, genName))) return `${rel} out of date (run build-motion-tokens --sync)`;
  return null;
}

/** Lines within ±radius of any /splash/i line. */
function splashRegions(text, radius = 30) {
  const lines = text.split('\n');
  const keep = new Set();
  lines.forEach((l, i) => {
    if (/splash/i.test(l)) for (let j = Math.max(0, i - radius); j <= Math.min(lines.length - 1, i + radius); j++) keep.add(j);
  });
  return [...keep].sort((a, b) => a - b).map((i) => lines[i]).join('\n');
}

function auditApp(name, cfg) {
  const root = join(WS, name);
  const res = { app: name, kind: cfg.kind, checks: {} };
  const set = (id, ok, detail) => (res.checks[id] = { ok, detail });
  if (!existsSync(root)) {
    set('M0', false, `app dir missing: ${root}`);
    return res;
  }
  const files = cfg.roots.flatMap((r) => walk(join(root, r), []));
  const authored = files.filter(isAuthored);
  const text = (list) => list.map(read).join('\n');
  const authoredText = text(authored);
  const entryText = cfg.entry.map((e) => (existsSync(join(root, e)) ? read(join(root, e)) : '')).join('\n');

  // M1 tokens
  {
    const problems = [];
    const usesVars = /var\(--cap-(dur|ease)/.test(authoredText);
    if (cfg.kind === 'web') {
      const kit = join(root, cfg.kitCss || 'css/capricorn-core.css');
      if (!existsSync(kit) || !read(kit).includes('--cap-dur-base')) problems.push(`kit css missing tokens: ${cfg.kitCss || 'css/capricorn-core.css'}`);
      else if (!entryText.includes(basename(kit)) && !new RegExp(`@import[^;]*${basename(kit).replace('.', '\\.')}`).test(authoredText)) problems.push(`entry/css does not load ${basename(kit)}`);
      if (!usesVars) problems.push('no authored var(--cap-dur-*/--cap-ease*) usage');
    } else if (cfg.kind === 'web-gen' || cfg.kind === 'next') {
      const g = genMatches(name, cfg.genCss, 'cap-motion-tokens.css');
      if (g) problems.push(g);
      else if (!authoredText.includes('cap-motion-tokens.css') && !entryText.includes('cap-motion-tokens.css')) problems.push('cap-motion-tokens.css not imported/linked');
      if (cfg.genTs) {
        const t = genMatches(name, cfg.genTs, 'capMotion.ts');
        if (t) problems.push(t);
      }
      const usesTs = cfg.genTs && /from\s+['"][^'"]*cap-motion['"]/.test(authoredText);
      if (!usesVars && !usesTs) problems.push('no authored usage of kit tokens (css vars or cap-motion import)');
    } else if (cfg.kind === 'expo') {
      const t = genMatches(name, cfg.genTs, 'capMotion.ts');
      if (t) problems.push(t);
      if (!/from\s+['"][^'"]*capMotion['"]/.test(authoredText)) problems.push('capMotion not imported by authored code');
    } else if (cfg.kind === 'flutter') {
      const d = genMatches(name, cfg.genDart, 'cap_motion.dart');
      if (d) problems.push(d);
      if (!/import\s+['"][^'"]*cap_motion\.dart['"]/.test(authoredText) || !/CapMotion\./.test(authoredText)) problems.push('CapMotion not imported/used by authored code');
    }
    set('M1', problems.length === 0, problems.join('; ') || 'ok');
  }

  // M2 reduced motion
  {
    let ok;
    let detail;
    if (cfg.kind === 'expo') {
      ok = /isReduceMotionEnabled|useReducedMotion|reduceMotionChanged/.test(authoredText);
      detail = ok ? 'AccessibilityInfo/useReducedMotion' : 'no AccessibilityInfo.isReduceMotionEnabled / useReducedMotion';
    } else if (cfg.kind === 'flutter') {
      ok = /disableAnimations/.test(authoredText);
      detail = ok ? 'MediaQuery.disableAnimations' : 'no MediaQuery.disableAnimations';
    } else {
      ok = /@media[^{]*prefers-reduced-motion:\s*reduce/.test(authoredText);
      detail = ok ? '@media (prefers-reduced-motion: reduce)' : 'no authored @media (prefers-reduced-motion: reduce)';
    }
    set('M2', ok, detail);
  }

  // M3 app shell instant
  {
    const problems = [];
    if (cfg.kind === 'expo' || cfg.kind === 'flutter') {
      if (/setTimeout\(|Future\.delayed\(/.test(entryText)) problems.push('launch delay (setTimeout/Future.delayed) in entry');
      if (!/CapMotion|capMotion/.test(authoredText)) problems.push('shell not on kit timing');
    } else {
      if (!/<body[^>]*data-cap-app=["'{]*1/.test(entryText)) problems.push('entry <body> lacks data-cap-app="1"');
      const bad = entryText.match(/data-cap-tilt|cap-magnetic|cap-hero-3d|data-cap-parallax|ScrollTrigger|gsap(\.min)?\.js/g);
      if (bad) problems.push(`marketing motion in app shell: ${[...new Set(bad)].join(', ')}`);
    }
    set('M3', problems.length === 0, problems.join('; ') || 'ok');
  }

  // M4 splash
  {
    const problems = [];
    if (!cfg.splash.length) {
      if (/id=["'](boot-)?splash["']|class=["'][^"']*\bsplash\b/.test(entryText)) problems.push('splash markup in entry but none configured');
      set('M4', problems.length === 0, problems.join('; ') || 'n/a (no splash)');
    } else {
      const missing = cfg.splash.filter((s) => !existsSync(join(root, s)));
      if (missing.length) problems.push(`missing splash file(s): ${missing.join(', ')}`);
      const region = cfg.splash.filter((s) => existsSync(join(root, s))).map((s) => splashRegions(read(join(root, s)))).join('\n');
      if (!/(session|local)Storage/.test(region)) problems.push('not session-once (no session/localStorage near splash)');
      if (!/addEventListener\(\s*['"](pointerdown|pointerup|click|keydown|touchstart|wheel)['"]|on(Click|PointerDown|KeyDown)=/.test(region)) problems.push('not skippable (no pointer/key/click handler near splash)');
      if (!/prefers-reduced-motion|useReducedMotion|prefersReducedMotion|reducedMotion|reduceMotion|\breduce\b/.test(region)) problems.push('splash ignores reduced motion');
      set('M4', problems.length === 0, problems.join('; ') || 'skippable + session-once + reduced');
    }
  }

  // M5 no GSAP
  if (cfg.noGsap) {
    const all = cfg.roots.flatMap((r) => walk(join(root, r), [], { includeVendor: true }));
    const hits = all.filter((p) => /gsap|ScrollTrigger/i.test(read(p))).map((p) => p.slice(root.length + 1));
    const vendor = ['public/js/vendor/gsap.min.js', 'public/js/vendor/ScrollTrigger.min.js'].filter((v) => existsSync(join(root, v)));
    const syncSrc = read(join(HERE, 'sync-design-system.mjs'));
    const syncLine = syncSrc.split('\n').find((l) => l.includes(`app: '${name}'`)) || '';
    const problems = [];
    if (hits.length) problems.push(`gsap refs: ${hits.join(', ')}`);
    if (vendor.length) problems.push(`vendor files: ${vendor.join(', ')}`);
    if (syncLine && !/noGsap:\s*true/.test(syncLine)) problems.push('sync-design-system target lacks noGsap: true');
    set('M5', problems.length === 0, problems.join('; ') || 'no GSAP');
  }

  res.pass = Object.values(res.checks).every((c) => c.ok);
  return res;
}

const results = Object.entries(apps)
  .filter(([n]) => !only || n === only)
  .map(([n, c]) => auditApp(n, c));

for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.app} (${r.kind})`);
  for (const [id, c] of Object.entries(r.checks)) console.log(`   ${c.ok ? '✓' : '✗'} ${id} ${c.detail}`);
}
const failed = results.filter((r) => !r.pass);
console.log(`\nmotion-audit: ${results.length - failed.length}/${results.length} PASS${failed.length ? ` — FAIL: ${failed.map((r) => r.app).join(', ')}` : ''}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ at: new Date().toISOString(), results }, null, 2) + '\n');
process.exit(failed.length ? 1 : 0);
