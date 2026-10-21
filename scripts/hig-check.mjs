#!/usr/bin/env node
/**
 * HIG-style checks for a single URL (Playwright).
 *
 *   node hig-check.mjs --url URL --out DIR
 *   node hig-check.mjs --url URL --out DIR --viewport=393x852 --color-scheme=dark
 *
 * Checks: interactive targets ≥44px (≥28 with data-hit-dense), font-size ≥11px,
 * body ≥17px at default, axe serious/critical=0, no horizontal overflow.
 *
 * Viewport presets (also accept WxH):
 *   se | iphone-se | 375x667
 *   pro | iphone-16-pro | 393x852
 *   ipad | ipad-air | 820x1180
 *   mac | macbook-14 | 1512x982
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const DEFAULT_PW_CORE = '/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core';
const AXE_CANDIDATES = [
  '/Users/shamikhahmed/Projects/Cap/Cap-Apps/VaultCap/node_modules/axe-core/axe.min.js',
  '/Users/shamikhahmed/Projects/Cap/Cap-Apps/capricorn-lab/node_modules/axe-core/axe.min.js',
];

const VIEWPORT_PRESETS = {
  se: { width: 375, height: 667, name: 'iphone-se' },
  'iphone-se': { width: 375, height: 667, name: 'iphone-se' },
  '375x667': { width: 375, height: 667, name: 'iphone-se' },
  pro: { width: 393, height: 852, name: 'iphone-16-pro' },
  'iphone-16-pro': { width: 393, height: 852, name: 'iphone-16-pro' },
  '393x852': { width: 393, height: 852, name: 'iphone-16-pro' },
  ipad: { width: 820, height: 1180, name: 'ipad-air' },
  'ipad-air': { width: 820, height: 1180, name: 'ipad-air' },
  '820x1180': { width: 820, height: 1180, name: 'ipad-air' },
  mac: { width: 1512, height: 982, name: 'macbook-14' },
  'macbook-14': { width: 1512, height: 982, name: 'macbook-14' },
  '1512x982': { width: 1512, height: 982, name: 'macbook-14' },
};

function resolvePwCore() {
  if (process.env.PW_CORE) return process.env.PW_CORE;
  if (existsSync(join(DEFAULT_PW_CORE, 'index.mjs'))) return DEFAULT_PW_CORE;
  const lab = join(dirname(fileURLToPath(import.meta.url)), '../../capricorn-lab/node_modules/playwright-core');
  if (existsSync(join(lab, 'index.mjs'))) return lab;
  return null;
}

function parseArgs(argv) {
  const out = {
    url: null,
    out: 'hig-check-out',
    viewport: { width: 390, height: 844, name: 'default-390x844' },
    colorScheme: 'light',
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a.startsWith('--url=')) out.url = a.slice(6);
    else if (a === '--url') out.url = next();
    else if (a.startsWith('--out=')) out.out = a.slice(6);
    else if (a === '--out') out.out = next();
    else if (a.startsWith('--viewport=')) out.viewport = parseViewport(a.slice(11));
    else if (a === '--viewport') out.viewport = parseViewport(next());
    else if (a.startsWith('--color-scheme=')) out.colorScheme = a.slice(15);
    else if (a === '--color-scheme') out.colorScheme = next();
  }
  if (!['light', 'dark', 'no-preference'].includes(out.colorScheme)) {
    console.error(`hig-check: invalid --color-scheme=${out.colorScheme} (use light|dark|no-preference)`);
    process.exit(2);
  }
  return out;
}

function parseViewport(raw) {
  if (!raw) return VIEWPORT_PRESETS.pro;
  const key = String(raw).toLowerCase();
  if (VIEWPORT_PRESETS[key]) return { ...VIEWPORT_PRESETS[key] };
  const m = key.match(/^(\d+)\s*[x×]\s*(\d+)$/);
  if (m) {
    return { width: Number(m[1]), height: Number(m[2]), name: `${m[1]}x${m[2]}` };
  }
  console.error(`hig-check: unknown --viewport=${raw}`);
  process.exit(2);
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.url) {
  console.error('Usage: node hig-check.mjs --url URL --out DIR [--viewport=se|pro|ipad|mac|WxH] [--color-scheme=light|dark]');
  process.exit(2);
}

const pwCore = resolvePwCore();
if (!pwCore) {
  console.error('hig-check: playwright-core not found — set PW_CORE');
  process.exit(2);
}

const axePath = AXE_CANDIDATES.find(existsSync);
const { chromium } = await import(pathToFileURL(join(pwCore, 'index.mjs')).href);
mkdirSync(opts.out, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: opts.viewport.width, height: opts.viewport.height },
  colorScheme: opts.colorScheme,
});
const page = await context.newPage();
const issues = [];

try {
  await page.goto(opts.url, { waitUntil: 'networkidle', timeout: 45000 });
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
    // Skip links are intentionally clipped until :focus — do not treat as hit failures.
    const cls = typeof el.className === 'string' ? el.className : '';
    const label = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if (/skip/i.test(cls) || /^skip to /i.test(label)) return;
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return;
    const dense = el.hasAttribute('data-hit-dense');
    const min = dense ? 28 : 44;
    if (r.width < min || r.height < min) {
      targets.push({
        tag: el.tagName,
        w: Math.round(r.width),
        h: Math.round(r.height),
        dense,
        label: label.slice(0, 40),
      });
    }
  });
  return { bodyFs, overflow, smallFonts: smallFonts.slice(0, 20), targets: targets.slice(0, 40) };
});

if (metrics.bodyFs < 17) issues.push({ rule: 'body-font', detail: `body ${metrics.bodyFs}px < 17px` });
if (metrics.overflow) issues.push({ rule: 'horizontal-overflow', detail: 'document wider than viewport' });
if (metrics.smallFonts.length) {
  issues.push({ rule: 'min-font', detail: `${metrics.smallFonts.length} elements < 11px`, sample: metrics.smallFonts[0] });
}
if (metrics.targets.length) {
  issues.push({ rule: 'hit-target', detail: `${metrics.targets.length} targets below minimum`, sample: metrics.targets[0] });
}

let axe = { serious: 0, critical: 0, skipped: !axePath };
if (axePath && !issues.some((i) => i.rule === 'navigation')) {
  await page.addScriptTag({ content: readFileSync(axePath, 'utf8') });
  axe = await page.evaluate(async () => {
    // @ts-expect-error axe injected
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    const v = res.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical');
    return {
      serious: v.filter((x) => x.impact === 'serious').length,
      critical: v.filter((x) => x.impact === 'critical').length,
      ids: v.map((x) => x.id),
    };
  });
  if (axe.critical || axe.serious) {
    issues.push({ rule: 'axe', detail: `critical=${axe.critical} serious=${axe.serious}`, ids: axe.ids });
  }
}

await browser.close();

const report = {
  url: opts.url,
  at: new Date().toISOString(),
  viewport: opts.viewport,
  colorScheme: opts.colorScheme,
  metrics,
  axe,
  issues,
  pass: issues.length === 0,
};
const stamp = `${opts.viewport.name}-${opts.colorScheme}`;
writeFileSync(join(opts.out, `hig-check-${stamp}.json`), JSON.stringify(report, null, 2));
writeFileSync(join(opts.out, 'hig-check.json'), JSON.stringify(report, null, 2));

if (report.pass) {
  console.log(`hig-check: pass (${stamp}) → ${join(opts.out, `hig-check-${stamp}.json`)}`);
  process.exit(0);
}
console.error(`hig-check: ${issues.length} issue(s) (${stamp}) → ${join(opts.out, `hig-check-${stamp}.json`)}`);
process.exit(1);

