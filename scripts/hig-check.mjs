#!/usr/bin/env node
/**
 * HIG-style checks for a single URL (Playwright).
 *
 *   node hig-check.mjs --url URL --out DIR
 *
 * Checks: interactive targets ≥44px (≥28 with data-hit-dense), font-size ≥11px,
 * body ≥17px at default, axe serious/critical=0, no horizontal overflow.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
const DEFAULT_PW_CORE = '/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core';
const AXE_CANDIDATES = [
  '/Users/shamikhahmed/Projects/Cap/Cap-Apps/VaultCap/node_modules/axe-core/axe.min.js',
  '/Users/shamikhahmed/Projects/Cap/Cap-Apps/capricorn-lab/node_modules/axe-core/axe.min.js',
];

function resolvePwCore() {
  if (process.env.PW_CORE) return process.env.PW_CORE;
  if (existsSync(join(DEFAULT_PW_CORE, 'index.mjs'))) return DEFAULT_PW_CORE;
  const lab = join(dirname(fileURLToPath(import.meta.url)), '../../capricorn-lab/node_modules/playwright-core');
  if (existsSync(join(lab, 'index.mjs'))) return lab;
  return null;
}

const args = process.argv.slice(2);
const urlFlag = args.find((a) => a.startsWith('--url='));
const outFlag = args.find((a) => a.startsWith('--out='));
const URL = urlFlag?.slice(6) || args[args.indexOf('--url') + 1];
const OUT = outFlag?.slice(6) || args[args.indexOf('--out') + 1] || 'hig-check-out';

if (!URL) {
  console.error('Usage: node hig-check.mjs --url URL --out DIR');
  process.exit(2);
}

const pwCore = resolvePwCore();
if (!pwCore) {
  console.error('hig-check: playwright-core not found — set PW_CORE');
  process.exit(2);
}

const axePath = AXE_CANDIDATES.find(existsSync);
const { chromium } = await import(pathToFileURL(join(pwCore, 'index.mjs')).href);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
const page = await context.newPage();
const issues = [];

try {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
} catch (e) {
  issues.push({ rule: 'navigation', detail: e.message.split('\n')[0] });
}

const metrics = await page.evaluate(() => {
  const bodyFs = parseFloat(getComputedStyle(document.body).fontSize) || 0;
  const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  const smallFonts = [];
  document.querySelectorAll('*').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs && fs < 11) smallFonts.push({ tag: el.tagName, fs, text: (el.textContent || '').slice(0, 40) });
  });
  const targets = [];
  document.querySelectorAll('a, button, input, select, textarea, summary, [role="button"]').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const dense = el.hasAttribute('data-hit-dense');
    const min = dense ? 28 : 44;
    if (r.width < min || r.height < min) {
      targets.push({ tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height), dense, label: (el.getAttribute('aria-label') || el.textContent || '').slice(0, 40) });
    }
  });
  return { bodyFs, overflow, smallFonts: smallFonts.slice(0, 20), targets: targets.slice(0, 40) };
});

if (metrics.bodyFs < 17) issues.push({ rule: 'body-font', detail: `body ${metrics.bodyFs}px < 17px` });
if (metrics.overflow) issues.push({ rule: 'horizontal-overflow', detail: 'document wider than viewport' });
if (metrics.smallFonts.length) issues.push({ rule: 'min-font', detail: `${metrics.smallFonts.length} elements < 11px`, sample: metrics.smallFonts[0] });
if (metrics.targets.length) issues.push({ rule: 'hit-target', detail: `${metrics.targets.length} targets below minimum`, sample: metrics.targets[0] });

let axe = { serious: 0, critical: 0, skipped: !axePath };
if (axePath && !issues.some((i) => i.rule === 'navigation')) {
  await page.addScriptTag({ content: readFileSync(axePath, 'utf8') });
  axe = await page.evaluate(async () => {
    // @ts-expect-error axe injected
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    const v = res.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical');
    return { serious: v.filter((x) => x.impact === 'serious').length, critical: v.filter((x) => x.impact === 'critical').length, ids: v.map((x) => x.id) };
  });
  if (axe.critical || axe.serious) issues.push({ rule: 'axe', detail: `critical=${axe.critical} serious=${axe.serious}`, ids: axe.ids });
}

await browser.close();

const report = { url: URL, at: new Date().toISOString(), metrics, axe, issues, pass: issues.length === 0 };
writeFileSync(join(OUT, 'hig-check.json'), JSON.stringify(report, null, 2));

if (report.pass) {
  console.log(`hig-check: pass → ${join(OUT, 'hig-check.json')}`);
  process.exit(0);
}
console.error(`hig-check: ${issues.length} issue(s) → ${join(OUT, 'hig-check.json')}`);
process.exit(1);
