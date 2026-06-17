#!/usr/bin/env node
/**
 * Ensures every Cap PWA service worker precaches the GSAP + cinematic stack.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';

const CAP_CINEMATIC = [
  './js/capricorn-motion.js',
  './js/capricorn-scene.js',
  './js/capricorn-premium-nav.js',
  './js/capricorn-cinematic.js',
  './js/capricorn-deck.js',
  './js/capricorn-deck-pro.js',
  './js/capricorn-pitch.js',
  './js/vendor/gsap.min.js',
  './js/vendor/ScrollTrigger.min.js',
];

const EXTRA_HTML = ['./privacy.html', './changelog.html'];

const TARGETS = [
  { app: 'LedgerCap', cacheFrom: 'ledgercap-v51', cacheTo: 'ledgercap-v52' },
  { app: 'VaultCap', cacheFrom: 'vaultcap-v35', cacheTo: 'vaultcap-v36', swQuery: '36' },
  { app: 'PulseCap', cacheFrom: 'pulsecap-v35', cacheTo: 'pulsecap-v36', swQuery: '36' },
  { app: 'PrismCap', cacheFrom: 'prismcap-v39', cacheTo: 'prismcap-v40' },
  { app: 'SteadyCap', cacheFrom: 'steadycap-v38', cacheTo: 'steadycap-v39' },
  { app: 'DeePonyCap', cacheFrom: 'deeponycap-v36', cacheTo: 'deeponycap-v37' },
  { app: 'shamikhahmed.github.io', cacheFrom: 'capricorn-v20', cacheTo: 'capricorn-v21' },
];

function injectAssets(content, assets) {
  let out = content;
  for (const a of assets) {
    if (!out.includes(`'${a}'`) && !out.includes(`"${a}"`)) {
      out = out.replace(
        /(\];[\s\n]*self\.addEventListener\('install')/,
        `  '${a}',\n$1`,
      );
      if (!out.includes(`'${a}'`)) {
        out = out.replace(/\n];/, `,\n  '${a}'\n];`);
      }
    }
  }
  return out;
}

for (const t of TARGETS) {
  const swPath = join(ROOT, t.app, 'sw.js');
  if (!existsSync(swPath)) {
    console.warn(`skip ${t.app} (no sw.js)`);
    continue;
  }
  let sw = readFileSync(swPath, 'utf8');
  sw = sw.replace(t.cacheFrom, t.cacheTo);
  sw = injectAssets(sw, [...CAP_CINEMATIC, ...EXTRA_HTML.filter((h) => !sw.includes(h))]);
  writeFileSync(swPath, sw);
  console.log(`✓ ${t.app}/sw.js → ${t.cacheTo}`);

  if (t.swQuery) {
    const indexPath = join(ROOT, t.app, 'index.html');
    if (existsSync(indexPath)) {
      let html = readFileSync(indexPath, 'utf8');
      html = html.replace(/sw\.js\?v=\d+/g, `sw.js?v=${t.swQuery}`);
      writeFileSync(indexPath, html);
      console.log(`  ↳ index.html sw query v=${t.swQuery}`);
    }
  }
}

console.log('PWA cinematic precache sync complete');
