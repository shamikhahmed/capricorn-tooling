#!/usr/bin/env node
/**
 * !important-loss audit — finds declarations that were !important at <baseRev>, are not now,
 * and no longer win in the live app (the cascade silently changed).
 *
 *   PW_CORE=…/playwright-core node scripts/audit-important-loss.mjs <RepoDir> <baseRev> <url> [navJS …]
 *
 * Each navJS string is evaluated in the page between checks (e.g. "Navigation.go('market')").
 * Do not pass navigations that reload the page; run the script once per URL instead.
 * Loads phone (390×844) and desktop (1280×900) in light and dark, re-applies every removed
 * !important rule, and reports elements whose computed style changes.
 * Found the LedgerCap 3.58.2 regression (desktop sidebar hidden after the 2026-10 cleanup).
 */
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { WORKSPACE_ROOT } from './lib/workspace-root.mjs';

const [repoArg, base, url, ...navs] = process.argv.slice(2);
if (!repoArg || !base || !url) { console.error('usage: audit-important-loss.mjs <RepoDir> <baseRev> <url> [navJS …]'); process.exit(2); }
const repo = resolve(WORKSPACE_ROOT, repoArg);
const PW = process.env.PW_CORE || join(WORKSPACE_ROOT, 'MasteryCap/node_modules/playwright-core');
const POSTCSS = process.env.POSTCSS || join(WORKSPACE_ROOT, 'CookCap/node_modules/postcss/lib/postcss.js');
const postcss = (await import(pathToFileURL(POSTCSS).href)).default;
const { chromium } = await import(pathToFileURL(join(PW, 'index.mjs')).href);

const git = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });
const SKIP_DIR = /(^|\/)(node_modules|dist|docs|qa|test-results|ios|android|www|e2e|tests|coverage)\//;
const SKIP_PAGE = /(pitch|presentation|landing|screen-gallery|changelog|privacy|widget)\.html$/;
const files = (rev) => git('ls-tree', '-r', '--name-only', rev).split('\n').filter((f) => /\.(css|html)$/.test(f) && !SKIP_DIR.test(f) && !SKIP_PAGE.test(f));
const show = (rev, f) => { try { return git('show', `${rev}:${f}`); } catch { return null; } };
const cssOf = (f, t) => (f.endsWith('.html') ? [...t.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n') : t);

function collect(text) {
  const map = new Map();
  let root;
  try { root = postcss.parse(text); } catch { return map; }
  root.walkDecls((d) => {
    if (d.parent?.type !== 'rule') return;
    const media = [];
    for (let p = d.parent.parent; p && p.type !== 'root'; p = p.parent) if (p.type === 'atrule') media.unshift(`${p.name} ${p.params}`);
    if (media.some((m) => !m.startsWith('media'))) return;
    const mq = media.map((m) => m.slice(6)).join(' and ');
    for (const sel of d.parent.selectors || []) map.set(`${mq}|${sel.trim()}|${d.prop}`, { media: mq, selector: sel.trim(), prop: d.prop, value: d.value, important: !!d.important });
  });
  return map;
}

const decls = [];
const head = new Set(files('HEAD'));
for (const f of files(base)) {
  const old = show(base, f);
  if (!old) continue;
  const now = head.has(f) ? collect(cssOf(f, show('HEAD', f) || '')) : new Map();
  for (const [k, v] of collect(cssOf(f, old))) if (v.important && !now.get(k)?.important) decls.push({ file: f, ...v });
}

const browser = await chromium.launch();
const findings = new Map();
for (const v of [{ w: 390, h: 844, mobile: true }, { w: 1280, h: 900, mobile: false }]) for (const scheme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, colorScheme: scheme, isMobile: v.mobile, hasTouch: v.mobile });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  for (const step of ['', ...navs]) {
    if (step) { await page.evaluate(step).catch(() => {}); await page.waitForTimeout(700); }
    const diffs = await page.evaluate((decls) => {
      const freeze = document.createElement('style');
      freeze.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
      document.head.appendChild(freeze);
      const norm = (x) => x.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1').replace(/["']/g, '').trim();
      const loaded = new Set();
      const walk = (rules) => { for (const r of rules || []) { if (r.selectorText) for (const s of r.selectorText.split(',')) for (let k = 0; k < r.style.length; k++) loaded.add(`${norm(s)}|${r.style[k]}`); if (r.cssRules) walk(r.cssRules); } };
      for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* cross-origin */ } }
      const probes = [];
      decls.forEach((d, i) => {
        const s = norm(d.selector);
        if (!loaded.has(`${s}|${d.prop}`) && ![...loaded].some((x) => x.startsWith(`${s}|${d.prop}-`))) return; // rule not loaded on this page
        if (d.media && !matchMedia(d.media).matches) return;
        let sel = d.selector, pseudo = null;
        const m = sel.match(/::?(before|after|placeholder|marker)$/);
        if (m) { pseudo = `::${m[1]}`; sel = sel.slice(0, m.index); }
        if (/:(hover|active|focus|focus-visible|focus-within|visited)/.test(sel)) return;
        let els;
        try { els = [...document.querySelectorAll(sel || '*')].slice(0, 25); } catch { return; }
        els.forEach((el) => probes.push({ i, el, pseudo, prop: d.prop }));
      });
      const read = (p) => getComputedStyle(p.el, p.pseudo).getPropertyValue(p.prop).trim();
      const before = probes.map(read);
      const inj = document.createElement('style');
      inj.textContent = decls.map((d) => { const r = `${d.selector}{${d.prop}:${d.value} !important}`; return d.media ? `@media ${d.media}{${r}}` : r; }).join('\n');
      document.head.appendChild(inj);
      const after = probes.map(read);
      inj.remove(); freeze.remove();
      return probes.map((p, k) => (before[k] === after[k] ? null : { i: p.i, now: before[k].slice(0, 60), want: after[k].slice(0, 60), el: `${p.el.tagName.toLowerCase()}${p.el.id ? `#${p.el.id}` : ''}`, vis: p.el.offsetParent !== null && p.el.getBoundingClientRect().width > 0 })).filter(Boolean);
    }, decls);
    for (const d of diffs) {
      const f = findings.get(d.i) || { decl: decls[d.i], vis: 0, sample: d, views: new Set() };
      if (d.vis) { f.vis += 1; f.sample = d; }
      f.views.add(`${v.w}/${scheme}`);
      findings.set(d.i, f);
    }
  }
  await ctx.close();
}
await browser.close();
const list = [...findings.values()].sort((a, b) => b.vis - a.vis);
console.log(`${decls.length} declarations lost !important since ${base}; ${list.length} no longer win on ${url}`);
for (const f of list) {
  const d = f.decl;
  console.log(`${f.vis ? 'VISIBLE' : 'hidden '} ${d.file} ${d.media ? `@media ${d.media} ` : ''}${d.selector} { ${d.prop}: ${d.value} } → now ${f.sample.now} on ${f.sample.el} [${[...f.views].join(', ')}]`);
}
process.exit(list.some((f) => f.vis) ? 1 : 0);
