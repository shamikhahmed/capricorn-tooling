#!/usr/bin/env node
/**
 * contrast-check.mjs — FND-02
 * WCAG relative luminance contrast for Cap Foundation theme pairs.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(__dirname, '..', 'shared', 'design', 'tokens.json'), 'utf8'));

function parseHex(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return null;
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

function lin(c) {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb) {
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

function contrast(a, b) {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs = [
  ['text', 'bg', 7],
  ['text', 'surface', 7],
  ['text-secondary', 'surface', 4.5],
  ['accent-contrast', 'accent', 4.5],
  ['accent-text', 'bg', 4.5],
  ['danger-text', 'bg', 4.5],
  ['success-text', 'bg', 3],
];

let failed = 0;
for (const [themeName, theme] of Object.entries(tokens.themes)) {
  console.log(`Theme: ${themeName}`);
  for (const [fgKey, bgKey, min] of pairs) {
    const fg = parseHex(theme[fgKey]);
    const bg = parseHex(theme[bgKey]);
    if (!fg || !bg) {
      console.log(`  skip ${fgKey}/${bgKey} (non-hex)`);
      continue;
    }
    const ratio = contrast(fg, bg);
    const ok = ratio >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? 'OK' : 'FAIL'} ${fgKey} on ${bgKey}: ${ratio.toFixed(2)} (need ≥ ${min})`);
  }
}

if (failed) {
  console.error(`\n${failed} contrast pair(s) failed`);
  process.exit(1);
}
console.log('\nAll hex contrast pairs passed');
