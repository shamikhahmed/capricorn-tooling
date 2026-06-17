#!/usr/bin/env node
/**
 * Cross-app upgrade pass (idempotent) — applies the 2026-06 workspace
 * audit fixes to the six Capricorn vanilla apps:
 *   1. a11y: remove pinch-zoom blocking from viewport meta (WCAG 1.4.4)
 *   2. design system: link css/capricorn-core.css before app styles,
 *      with the app's accent mapped to --cap-accent
 *   3. SEO: meta description + Open Graph + Twitter card + title
 *   4. perf: Google Fonts made non-render-blocking; PulseCap's
 *      no-cache meta tags removed (they fought the service worker)
 *   5. sw: capricorn-core.css added to precache ASSETS
 * Cache version bumps live in VERSION.json → run sync-versions.mjs after.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';
const BASE = 'https://shamikhahmed.github.io';

const APPS = {
  VaultCap: {
    accent: '#5b8dee',
    title: 'VaultCap — by Capricorn Systems',
    desc: 'Encrypted life vault — finance, identity, and documents on your device. Offline-first, by Capricorn Systems.',
  },
  PulseCap: {
    accent: '#00f2ff',
    title: 'PulseCap — Performance OS',
    desc: 'Performance OS — 300+ exercises, Smart Coach, and a full body map. Offline-first training, by Capricorn Systems.',
  },
  PrismCap: {
    accent: '#c77dff',
    title: 'PrismCap — 38 Offline Party Games',
    desc: '38 offline party games — pass & play on one device. No accounts, no ads, by Capricorn Systems.',
  },
  SteadyCap: {
    accent: '#c9652b',
    title: 'SteadyCap — Recovery OS',
    desc: 'Recovery OS — routines, medicines, habits, and SOS support. Offline-first, by Capricorn Systems.',
  },
  LedgerCap: {
    accent: '#f59e0b',
    title: 'LedgerCap — Wealth OS',
    desc: 'Wealth OS for Pakistan — PSX, Meezan funds, Zakat, and net worth. Offline-first, by Capricorn Systems.',
  },
  DeePonyCap: {
    accent: '#c4367a',
    title: 'DeePonyCap ✨',
    desc: 'Child-friendly My Little Pony collection tracker — photos and checklists, all on your device. By Capricorn Systems.',
  },
};

for (const [app, cfg] of Object.entries(APPS)) {
  const dir = join(ROOT, app);
  const file = join(dir, 'index.html');
  if (!existsSync(file)) { console.warn(`skip ${app}`); continue; }
  let html = readFileSync(file, 'utf8');
  const before = html;

  /* 1. allow pinch zoom */
  html = html.replace(/,\s*maximum-scale=1\s*,\s*user-scalable=no/g, '');
  html = html.replace(/,\s*user-scalable=no/g, '');

  /* 4b. PulseCap cache-meta vs service worker */
  html = html.replace(/\s*<meta http-equiv="(Cache-Control|Pragma|Expires)"[^>]*>/g, '');

  /* 2. design-system core before the first app stylesheet */
  if (!html.includes('capricorn-core.css')) {
    const accentStyle =
      `<link rel="stylesheet" href="css/capricorn-core.css">\n` +
      `<style>:root{--cap-accent:${cfg.accent}}</style>\n`;
    // before first local stylesheet link, or before </head> if none (inline-CSS apps)
    if (/<link rel="stylesheet" href="(?:\.\/)?css\//.test(html)) {
      html = html.replace(/(<link rel="stylesheet" href="(?:\.\/)?css\/)/, `${accentStyle}$1`);
    } else {
      html = html.replace(/<\/head>/, `${accentStyle}</head>`);
    }
  }

  /* 3. SEO */
  if (!html.includes('name="description"')) {
    html = html.replace(/(<title>)/, `<meta name="description" content="${cfg.desc}">\n$1`);
  }
  if (!html.includes('property="og:title"')) {
    const slug = app.toLowerCase();
    const url = `${BASE}/${app}/`;
    const img = `${BASE}/assets/screenshots/${slug}.png`;
    const block = [
      `<link rel="canonical" href="${url}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="Capricorn Systems">`,
      `<meta property="og:title" content="${cfg.title}">`,
      `<meta property="og:description" content="${cfg.desc}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${img}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${cfg.title}">`,
      `<meta name="twitter:description" content="${cfg.desc}">`,
      `<meta name="twitter:image" content="${img}">`,
    ].join('\n');
    html = html.replace(/(<title>[^<]*<\/title>)/, `$1\n${block}`);
  }

  /* 4. non-blocking fonts */
  html = html.replace(
    /<link (href="https:\/\/fonts\.googleapis\.com[^"]+" rel="stylesheet")>(?!\s*<noscript>)/g,
    (m, attrs) => `<link ${attrs} media="print" onload="this.media='all'">\n<noscript><link ${attrs}></noscript>`
  );

  if (html !== before) writeFileSync(file, html);

  /* 5. precache the core stylesheet */
  const swf = join(dir, 'sw.js');
  if (existsSync(swf)) {
    let sw = readFileSync(swf, 'utf8');
    if (!sw.includes('capricorn-core.css')) {
      sw = sw.replace(/const ASSETS = \[/, `const ASSETS = [\n  './css/capricorn-core.css',`);
      writeFileSync(swf, sw);
    }
  }

  console.log(`${html !== before ? '✓' : '='} ${app}`);
}
