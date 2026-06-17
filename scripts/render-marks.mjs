#!/usr/bin/env node
/**
 * Rasterize the design-system marks (shared/design-system/marks/*.svg)
 * into maskable app icons: icon-192 / icon-512 / icon-1024 PNG per app,
 * plus icon.svg. Mark sits at 55% of canvas (maskable safe zone) on the
 * app's brand background. Uses the hub's sharp install.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(join(ROOT, 'shamikhahmed.github.io', 'package.json'))('sharp');
const MARKS = join(SHARED_DIR', 'design-system', 'marks');

const APPS = [
  { mark: 'capricorn', dir: 'shamikhahmed.github.io', bg: '#0a0e17' },
  { mark: 'vaultcap', dir: 'VaultCap', bg: '#070b14' },
  { mark: 'pulsecap', dir: 'PulseCap', bg: '#07131f' },
  { mark: 'prismcap', dir: 'PrismCap', bg: '#0a0612' },
  { mark: 'steadycap', dir: 'SteadyCap', sub: 'assets/icons', bg: '#0f1419' },
  { mark: 'ledgercap', dir: 'LedgerCap', sub: 'assets/icons', bg: '#0b0e11' },
  { mark: 'deeponycap', dir: 'DeePonyCap', bg: '#fdf2f7' },
  { mark: 'scentcap', dir: 'ScentCap', sub: 'public', bg: '#0c0a09' },
  { mark: 'auracap', dir: 'AuraCap', sub: 'public', bg: '#070811' },
];

for (const app of APPS) {
  const svg = readFileSync(join(MARKS, `${app.mark}.svg`), 'utf8');
  const out = join(ROOT, app.dir, app.sub || '');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'icon.svg'), svg);

  for (const size of [192, 512, 1024]) {
    const markPx = Math.round(size * 0.55);
    const composed = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="${app.bg}"/>
      <svg x="${(size - markPx) / 2}" y="${(size - markPx) / 2}" width="${markPx}" height="${markPx}" viewBox="0 0 48 48">
        ${svg.replace(/<\/?svg[^>]*>/g, '')}
      </svg>
    </svg>`;
    await sharp(Buffer.from(composed)).png().toFile(join(out, `icon-${size}.png`));
  }
  console.log(`✓ ${app.dir}${app.sub ? '/' + app.sub : ''}`);
}
