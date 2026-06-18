#!/usr/bin/env node
/**
 * Strips GSAP / 3D scene / cinematic from app index.html shells.
 * Adds data-cap-app="1" for instant navigation + lighter compositing.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT } from './lib/workspace-root.mjs';

const TARGETS = [
  { app: 'LedgerCap', index: 'index.html', js: 'js/' },
  { app: 'VaultCap', index: 'index.html', js: 'js/' },
  { app: 'PulseCap', index: 'index.html', js: 'js/' },
  { app: 'PrismCap', index: 'index.html', js: 'js/' },
  { app: 'SteadyCap', index: 'index.html', js: 'js/' },
  { app: 'DeePonyCap', index: 'index.html', js: 'js/' },
  { app: 'ScentCap', index: 'index.html', js: 'js/' },
  { app: 'AuraCap', index: 'index.html', js: 'js/' },
];

const STRIP_SCRIPTS = [
  /[ \t]*<script src="[^"]*vendor\/gsap\.min\.js"><\/script>\s*\n?/gi,
  /[ \t]*<script src="[^"]*vendor\/ScrollTrigger\.min\.js"><\/script>\s*\n?/gi,
  /[ \t]*<script src="[^"]*capricorn-scene\.js"><\/script>\s*\n?/gi,
  /[ \t]*<script src="[^"]*capricorn-cinematic\.js"><\/script>\s*\n?/gi,
];

function patch(html, jsBase) {
  let out = html;

  if (!out.includes('data-cap-app')) {
    out = out.replace(/<body(\s[^>]*)?>/i, (m, attrs = '') => {
      if (/data-cap-app/i.test(attrs)) return m;
      return `<body${attrs} data-cap-app="1">`;
    });
  }

  for (const re of STRIP_SCRIPTS) out = out.replace(re, '');

  out = out.replace(
    /if\s*\(\s*window\.CapCinematic\s*\)\s*CapCinematic\.init\([^)]*\)\s*;?/g,
    'if (window.CapricornMotion) CapricornMotion.init();',
  );
  out = out.replace(
    /if\s*\(\s*window\.CapCinematic\s*\)\s*CapCinematic\.init\(\s*\{[^}]*\}\s*\)\s*;?/g,
    'if (window.CapricornMotion) CapricornMotion.init();',
  );

  if (!out.includes('capricorn-motion.js')) {
    const tag = `  <script src="${jsBase}capricorn-motion.js"></script>\n`;
    out = out.replace(/<\/body>/i, tag + '</body>');
  }

  return out;
}

let n = 0;
for (const t of TARGETS) {
  const file = join(ROOT, t.app, t.index);
  if (!existsSync(file)) {
    console.warn(`skip ${t.app} (${t.index} missing)`);
    continue;
  }
  const before = readFileSync(file, 'utf8');
  const after = patch(before, t.js);
  if (after !== before) {
    writeFileSync(file, after);
    console.log(`✓ ${t.app} → fast app shell`);
    n++;
  } else {
    console.log(`· ${t.app} (already fast)`);
  }
}
console.log(`app-fast-mode: ${n} file(s) updated`);
