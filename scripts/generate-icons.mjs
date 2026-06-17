#!/usr/bin/env node
/** Generate maskable PNG icons (192 + 512) per app brand color — no deps */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const APPS = {
  VaultOS: { dir: 'VaultOS', bg: [8, 8, 8], fg: [91, 141, 238], letter: 'V' },
  FitnessOS: { dir: 'FitnessOS', bg: [10, 10, 15], fg: [0, 213, 255], letter: 'F' },
  PrismOS: { dir: 'PrismOS', bg: [10, 10, 15], fg: [199, 125, 255], letter: 'P' },
  DisciplineOS: { dir: 'DisciplineOS', bg: [8, 8, 8], fg: [255, 107, 53], letter: 'D' },
  StundsOS: { dir: 'StundsOS', bg: [11, 14, 17], fg: [255, 107, 53], letter: 'S', outDir: 'assets/icons' },
  DeePonyOS: { dir: 'DeePonyOS', bg: [255, 245, 248], fg: [255, 107, 157], letter: 'D' },
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

function drawIcon(size, bg, fg) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = 1 + x * 4;
      if (dist <= r) {
        row[i] = fg[0]; row[i + 1] = fg[1]; row[i + 2] = fg[2]; row[i + 3] = 255;
      } else {
        row[i] = bg[0]; row[i + 1] = bg[1]; row[i + 2] = bg[2]; row[i + 3] = 255;
      }
    }
    rows.push(row);
  }
  return Buffer.concat(rows);
}

function png(size, bg, fg) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = drawIcon(size, bg, fg);
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk(Buffer.from('IHDR'), ihdr),
    chunk(Buffer.from('IDAT'), idat),
    chunk(Buffer.from('IEND'), Buffer.alloc(0)),
  ]);
}

for (const [name, cfg] of Object.entries(APPS)) {
  const outDir = join(root, cfg.dir, cfg.outDir || '');
  mkdirSync(outDir, { recursive: true });
  for (const sz of [192, 512, 1024]) {
    const p = join(outDir, `icon-${sz}.png`);
    writeFileSync(p, png(sz, cfg.bg, cfg.fg));
    console.log('wrote', p);
  }
}
