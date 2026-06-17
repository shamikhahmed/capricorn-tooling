#!/usr/bin/env node
/** Capricorn Systems — high-res maskable PNG icons (192, 512, 1024) */
import { writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const APPS = {
  Capricorn: {
    dir: 'shamikhahmed.github.io',
    bg: [10, 14, 23],
    accent: [201, 162, 39],
    symbol: 'C',
    outAlso: ['icon'],
  },
  VaultCap: { dir: 'VaultCap', bg: [7, 11, 20], accent: [91, 141, 238], symbol: '◆' },
  PulseCap: { dir: 'PulseCap', bg: [7, 19, 31], accent: [0, 242, 255], symbol: '◇' },
  PrismCap: { dir: 'PrismCap', bg: [10, 6, 18], accent: [199, 125, 255], symbol: '✦' },
  SteadyCap: { dir: 'SteadyCap', subdir: 'assets/icons', bg: [15, 20, 25], accent: [255, 107, 53], symbol: '◎' },
  LedgerCap: { dir: 'LedgerCap', subdir: 'assets/icons', bg: [11, 14, 17], accent: [245, 158, 11], symbol: '▣' },
  DeePonyCap: { dir: 'DeePonyCap', bg: [224, 176, 200], accent: [217, 70, 143], symbol: '♡', light: true },
};

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([len, type, data, crc]);
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function drawIcon(size, cfg) {
  const { bg, accent, light } = cfg;
  const cx = size / 2;
  const cy = size / 2;
  const pad = size * 0.08;
  const rows = [];

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 4;
      const nx = (x - cx) / (size / 2);
      const ny = (y - cy) / (size / 2);
      const corner = size * 0.22;
      const inSquircle =
        Math.abs(nx) < 1 - pad / (size / 2) &&
        Math.abs(ny) < 1 - pad / (size / 2) &&
        Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4) < 0.92;

      const ringR = size * 0.28;
      const ringW = size * 0.04;
      const dist = Math.hypot(x - cx, y - cy);
      const onRing = Math.abs(dist - ringR) < ringW;

      const coreR = size * 0.2;
      const inCore = dist < coreR;

      let r = bg[0], g = bg[1], b = bg[2];
      if (inSquircle) {
        const t = light ? 0.15 : 0.08;
        r = lerp(bg[0], accent[0], t);
        g = lerp(bg[1], accent[1], t);
        b = lerp(bg[2], accent[2], t);
      }
      if (onRing || inCore) {
        r = accent[0]; g = accent[1]; b = accent[2];
        if (inCore && light) { r = 255; g = 250; b = 252; }
      }
      row[i] = r; row[i + 1] = g; row[i + 2] = b; row[i + 3] = 255;
    }
    rows.push(row);
  }
  return Buffer.concat(rows);
}

function png(size, cfg) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = drawIcon(size, cfg);
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk(Buffer.from('IHDR'), ihdr),
    chunk(Buffer.from('IDAT'), idat),
    chunk(Buffer.from('IEND'), Buffer.alloc(0)),
  ]);
}

for (const [name, cfg] of Object.entries(APPS)) {
  const outDir = join(root, cfg.dir, cfg.subdir || '');
  mkdirSync(outDir, { recursive: true });
  for (const sz of [192, 512, 1024]) {
    const p = join(outDir, `icon-${sz}.png`);
    writeFileSync(p, png(sz, cfg));
    console.log('wrote', p);
  }
}

console.log('Done — Capricorn + 6 product icon sets (192, 512, 1024).');
