#!/usr/bin/env node
/**
 * Fleet device QA — one command, every Cap, phone / iPad / Mac, WebKit + Chromium.
 *
 *   PW_CORE=/path/to/node_modules/playwright-core \
 *   node scripts/device-qa.mjs <outDir> [--apps=VaultCap,PulseCap] [--base=https://shamikhahmed.github.io] [--url=VaultCap=http://localhost:8080/?demo=1]
 *
 * Per run: horizontal overflow, visible content past the right edge, tap
 * targets < 32px on touch devices, text < 11px, console/page errors, and a
 * screenshot. Writes <outDir>/device-qa.json. Exit 1 if any hard failure
 * (overflow, off-screen content, page errors).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium, webkit } = await import(process.env.PW_CORE ? pathToFileURL(join(process.env.PW_CORE, 'index.mjs')).href : 'playwright-core');

const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const OUT = args.find((a) => !a.startsWith('--')) || 'device-qa';
const BASE = flag('base') || 'https://shamikhahmed.github.io';
mkdirSync(OUT, { recursive: true });

// Entry route per Cap — demo data where the app supports it.
const ROUTES = {
  VaultCap: '/VaultCap/?demo=1',
  PulseCap: '/PulseCap/?demo=1',
  PrismCap: '/PrismCap/',
  SteadyCap: '/SteadyCap/?demo=1',
  LedgerCap: '/LedgerCap/?demo=1',
  DeePonyCap: '/DeePonyCap/?demo=1',
  ScentCap: '/ScentCap/?demo=1',
  SoulCap: '/SoulCap/?demo=1',
  TravelCap: '/TravelCap/trips',
  AuraCap: '/AuraCap/?demo=1',
  MasteryCap: '/MasteryCap/',
  IdeaCap: '/IdeaCap/?demo=1',
  CarCap: '/CarCap/?demo=1&tab=today',
  CookCap: '/CookCap/?demo=1',
};
const overrides = Object.fromEntries(args.filter((a) => a.startsWith('--url=')).map((a) => a.slice(6).split(/=(.+)/)));
const apps = (flag('apps') || Object.keys(ROUTES).join(',')).split(',');

const DEVICES = [
  ['webkit', 'iphone-se', { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['webkit', 'iphone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['webkit', 'ipad-portrait', { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['webkit', 'ipad-landscape', { viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['webkit', 'macbook', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  ['chromium', 'macbook', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  ['chromium', 'android', { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true }],
];

const engines = { webkit: await webkit.launch(), chromium: await chromium.launch() };
const report = [];
let hard = 0;

for (const app of apps) {
  const url = overrides[app] || `${BASE}${ROUTES[app]}`;
  for (const [eng, dev, spec] of DEVICES) {
    const ctx = await engines[eng].newContext({ ...spec, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.split('\n')[0]}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    let nav = 'ok';
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    } catch (e) {
      nav = `nav: ${e.message.split('\n')[0]}`;
    }
    await page.waitForTimeout(2500);
    const m = await page.evaluate((touch) => {
      const W = window.innerWidth;
      const vis = (el) => {
        const s = getComputedStyle(el);
        if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight * 3;
      };
      const inScroller = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
        }
        return false;
      };
      const overflowX = document.scrollingElement.scrollWidth > W + 1;
      const offscreen = [];
      for (const el of document.querySelectorAll('body *')) {
        if (offscreen.length > 8) break;
        if (!el.children.length || /^(BUTTON|A|INPUT|IMG|SVG)$/i.test(el.tagName)) {
          const r = el.getBoundingClientRect();
          if (r.right > W + 2 && r.left < W && vis(el) && !inScroller(el)) {
            offscreen.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}:${Math.round(r.right - W)}px`);
          }
        }
      }
      const smallTargets = touch
        ? [...document.querySelectorAll('button, a[href], [role="button"], input, select')]
          .filter((el) => vis(el)).filter((el) => { const r = el.getBoundingClientRect(); return (r.width < 32 || r.height < 32) && r.width > 0; })
          .map((el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 24))
        : [];
      const tinyText = [...document.querySelectorAll('body *')]
        .filter((el) => el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
        .filter((el) => vis(el) && parseFloat(getComputedStyle(el).fontSize) < 11)
        .map((el) => el.textContent.trim().slice(0, 20));
      return { overflowX, scrollWidth: document.scrollingElement.scrollWidth, offscreen, smallTargets: smallTargets.slice(0, 12), smallCount: smallTargets.length, tinyCount: tinyText.length, tinySample: tinyText.slice(0, 6), title: document.title };
    }, Boolean(spec.hasTouch));
    const file = `${app}-${eng}-${dev}.png`;
    await page.screenshot({ path: join(OUT, file) }).catch(() => {});
    const bad = [];
    if (nav !== 'ok') bad.push(nav);
    if (m.overflowX) bad.push(`overflow-x ${m.scrollWidth}px`);
    if (m.offscreen.length) bad.push(`off-screen: ${m.offscreen.slice(0, 4).join(', ')}`);
    const pageErrors = errors.filter((e) => e.startsWith('pageerror'));
    if (pageErrors.length) bad.push(...pageErrors.slice(0, 3));
    if (bad.length) hard += 1;
    const soft = [];
    if (m.smallCount) soft.push(`${m.smallCount} tap<32px`);
    if (m.tinyCount) soft.push(`${m.tinyCount} text<11px`);
    const consoleErrors = errors.filter((e) => !e.startsWith('pageerror'));
    if (consoleErrors.length) soft.push(`${consoleErrors.length} console err`);
    report.push({ app, engine: eng, device: dev, url, file, ...m, errors, bad, soft });
    console.log(`${bad.length ? 'FAIL' : soft.length ? 'warn' : 'ok  '} ${app.padEnd(11)} ${eng.padEnd(8)} ${dev.padEnd(15)} ${[...bad, ...soft].join(' | ')}`);
    await ctx.close();
  }
}

await engines.webkit.close();
await engines.chromium.close();
writeFileSync(join(OUT, 'device-qa.json'), JSON.stringify(report, null, 2));
console.log(`\n${report.length - hard}/${report.length} without hard failures → ${OUT}`);
process.exit(hard ? 1 : 0);
