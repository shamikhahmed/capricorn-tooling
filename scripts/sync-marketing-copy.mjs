#!/usr/bin/env node
/**
 * Sync hero + problem copy from hub catalog into pitch decks & landing pages.
 * Source: shamikhahmed.github.io/js/products-data.js (evaluated)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';
const CATALOG = join(ROOT, 'shamikhahmed.github.io/js/products-data.js');

const code = readFileSync(CATALOG, 'utf8');
const PRODUCTS = {};
const fn = new Function(`${code}; return PRODUCTS;`);
const catalog = fn();

const APPS = [
  { slug: 'vaultcap', pitch: 'VaultCap/pitch.html', landing: 'VaultCap/landing.html', presentation: 'VaultCap/presentation.html' },
  { slug: 'pulsecap', pitch: 'PulseCap/pitch.html', landing: 'PulseCap/landing.html', presentation: 'PulseCap/presentation.html' },
  { slug: 'prismcap', pitch: 'PrismCap/pitch.html', landing: 'PrismCap/landing.html', presentation: 'PrismCap/presentation.html' },
  { slug: 'steadycap', pitch: 'SteadyCap/pitch.html', landing: 'SteadyCap/landing.html', presentation: 'SteadyCap/presentation.html' },
  { slug: 'ledgercap', pitch: 'LedgerCap/pitch.html', landing: 'LedgerCap/landing.html', presentation: 'LedgerCap/presentation.html' },
  { slug: 'deeponycap', pitch: 'DeePonyCap/pitch.html', landing: 'DeePonyCap/landing.html', presentation: 'DeePonyCap/presentation.html' },
  { slug: 'scentcap', pitch: 'ScentCap/public/pitch.html', landing: 'ScentCap/public/landing.html', presentation: 'ScentCap/public/presentation.html' },
  { slug: 'auracap', pitch: 'AuraCap/public/pitch.html', landing: 'AuraCap/public/landing.html', presentation: 'AuraCap/public/presentation.html' },
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function patchPitch(path, p) {
  if (!existsSync(path)) return false;
  let html = readFileSync(path, 'utf8');

  // Hero tagline only — problem cards + screenshots owned by enhance-decks.mjs
  html = html.replace(
    /<p class="sub reveal delay-2">[^<]*<\/p>/,
    `<p class="sub reveal delay-2">${esc(p.tagline)}</p>`,
  );

  html = html.replace(
    /<p class="s1-sub">[^<]*<\/p>/,
    `<p class="s1-sub">${esc(p.tagline)}</p>`,
  );

  if (html.includes('class="trust"')) {
    html = html.replace(
      /<div class="trust[^"]*"[^>]*>[\s\S]*?<\/div>/,
      `<div class="trust reveal delay-2">${esc(p.promise)}</div>`,
    );
  }

  writeFileSync(path, html);
  return true;
}

function patchPresentation(path, p) {
  if (!existsSync(path)) return false;
  let html = readFileSync(path, 'utf8');
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${esc(p.name)} — ${esc(p.tagline)}</title>`,
  );
  // First slide subtitle (tagline class, first occurrence after h1)
  html = html.replace(
    /(<div class="anim tagline" style="color:var\(--text\);font-size:clamp\(16px,2\.5vw,24px\);font-weight:500;margin-bottom:8px">)[^<]*(<\/div>)/,
    `$1${esc(p.tagline)}$2`,
  );
  html = html.replace(
    /(<div class="anim tagline" style="font-size:clamp\(13px,1\.6vw,17px\)">)[^<]*(<\/div>)/,
    `$1${esc(p.hook)}$2`,
  );
  writeFileSync(path, html);
  return true;
}

function patchLanding(path, p) {
  if (!existsSync(path)) return false;
  let html = readFileSync(path, 'utf8');
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${esc(p.hook)}">`,
  );
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${esc(p.name)} — ${esc(p.tagline)}</title>`,
  );
  writeFileSync(path, html);
  return true;
}

let n = 0;
for (const app of APPS) {
  const p = catalog[app.slug];
  if (!p) continue;
  if (patchPitch(join(ROOT, app.pitch), p)) { n++; console.log(`✓ pitch ${app.slug}`); }
  if (patchLanding(join(ROOT, app.landing), p)) { n++; console.log(`✓ landing ${app.slug}`); }
  if (app.presentation && patchPresentation(join(ROOT, app.presentation), p)) { n++; console.log(`✓ presentation ${app.slug}`); }
}
console.log(`marketing copy synced to ${n} file(s)`);
