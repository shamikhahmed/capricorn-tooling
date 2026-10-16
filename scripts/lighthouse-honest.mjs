#!/usr/bin/env node
/**
 * Lighthouse as a first-time visitor sees the page: fresh Chrome per run, automation flag hidden
 * (navigator.webdriver === false), so apps cannot special-case the audit.
 *
 *   node scripts/lighthouse-honest.mjs <url> […]
 *
 * Prints mobile and desktop scores, LCP/CLS/TBT, and failing weighted a11y / best-practices / SEO audits.
 * LIGHTHOUSE_DIR defaults to MasteryCap/node_modules (lighthouse 12 + chrome-launcher).
 */
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { WORKSPACE_ROOT } from './lib/workspace-root.mjs';

const NM = process.env.LIGHTHOUSE_DIR || join(WORKSPACE_ROOT, 'MasteryCap/node_modules');
const imp = (p) => import(pathToFileURL(join(NM, p)).href);
const { default: lighthouse } = await imp('lighthouse/core/index.js');
const chromeLauncher = await imp('chrome-launcher/dist/index.js');
const desktop = (await imp('lighthouse/core/config/desktop-config.js')).default;
const pct = (c) => Math.round((c?.score ?? 0) * 100);

let worst = 100;
for (const url of process.argv.slice(2)) {
  for (const preset of ['mobile', 'desktop']) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-first-run', '--disable-blink-features=AutomationControlled'] });
    try {
      const r = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' }, preset === 'desktop' ? desktop : undefined);
      const { categories: c, audits: a } = r.lhr;
      const perf = pct(c.performance);
      worst = Math.min(worst, perf, pct(c.accessibility), pct(c['best-practices']), pct(c.seo));
      console.log(`${preset.padEnd(7)} perf ${perf} a11y ${pct(c.accessibility)} bp ${pct(c['best-practices'])} seo ${pct(c.seo)} | LCP ${a['largest-contentful-paint'].displayValue || a['largest-contentful-paint'].errorMessage} CLS ${a['cumulative-layout-shift'].displayValue} TBT ${a['total-blocking-time'].displayValue}  ${url}`);
      for (const k of ['accessibility', 'best-practices', 'seo']) for (const ref of c[k].auditRefs) {
        const x = a[ref.id];
        if (ref.weight > 0 && x.score !== null && x.score < 1) console.log(`         ${k}:${ref.id} ${(x.details?.items || []).slice(0, 2).map((i) => (i.node?.snippet || i.url || '').toString().slice(0, 80)).join(' | ')}`);
      }
    } finally { await chrome.kill(); }
  }
}
process.exit(worst >= 90 ? 0 : 1);
