#!/usr/bin/env node
/**
 * Honest VoiceOver spot-check helper for v7 §7.4.
 * Pulls up to 10 labeled interactive controls from the live demo page
 * (aria-label / aria-labelledby / text / title) when native VO is not automatable.
 *
 *   node v7-sim-a11y-spot.mjs --app ScentCap --url 'https://…/ScentCap/?demo=1'
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const pwCandidates = [
  join(root, 'ScentCap/node_modules/playwright'),
  join(root, 'PulseCap/node_modules/playwright'),
  join(root, 'VaultCap/node_modules/playwright'),
];
const pwRoot = pwCandidates.find((p) => existsSync(p));
if (!pwRoot) {
  console.error('playwright not found under Cap apps');
  process.exit(2);
}
const require = createRequire(join(pwRoot, 'package.json'));
const { chromium } = require('playwright');

function parseArgs(argv) {
  const o = { app: '', url: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--app') o.app = argv[++i];
    else if (a.startsWith('--app=')) o.app = a.slice(6);
    else if (a === '--url') o.url = argv[++i];
    else if (a.startsWith('--url=')) o.url = a.slice(6);
  }
  if (!o.app || !o.url) {
    console.error('Usage: node v7-sim-a11y-spot.mjs --app NAME --url URL');
    process.exit(2);
  }
  return o;
}

const opts = parseArgs(process.argv.slice(2));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(opts.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(/IdeaCap|DeeFoodie/i.test(opts.app) ? 6000 : 2500);

const controls = await page.evaluate(() => {
  const sel =
    'button, a[href], [role="button"], [role="tab"], [role="link"], input, select, textarea, [role="menuitem"], [aria-label]';
  const nodes = Array.from(document.querySelectorAll(sel));
  const out = [];
  const seen = new Set();
  for (const el of nodes) {
    if (out.length >= 10) break;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    let label =
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      el.getAttribute('placeholder') ||
      (el.getAttribute('aria-labelledby')
        ? el
            .getAttribute('aria-labelledby')
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent?.trim())
            .filter(Boolean)
            .join(' ')
        : '') ||
      (el.labels && el.labels[0] ? el.labels[0].textContent.trim() : '') ||
      (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    label = (label || '').trim();
    if (!label || label.length < 1) continue;
    const key = `${el.tagName}:${label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const role = el.getAttribute('role') || el.tagName.toLowerCase();
    out.push({ role, label, tag: el.tagName.toLowerCase() });
  }
  return out;
});

await browser.close();
console.log(JSON.stringify({ app: opts.app, url: opts.url, controls }, null, 2));
