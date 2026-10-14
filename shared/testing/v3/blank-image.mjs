/**
 * Detect near-blank screenshots (≥98% one colour).
 * PNG: inflate IDAT and sample pixels (Node zlib only).
 * WebP/other: optional ImageMagick `magick` when available.
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const BLANK_RATIO = 0.98;

function pngChunks(buf) {
  if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  const chunks = [];
  let i = 8;
  while (i + 8 <= buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString('ascii', i + 4, i + 8);
    const data = buf.subarray(i + 8, i + 8 + len);
    chunks.push({ type, data });
    i += 12 + len;
  }
  return chunks;
}

export function checkPngBlank(buf) {
  const chunks = pngChunks(buf);
  if (!chunks) return null;
  const ihdr = chunks.find((c) => c.type === 'IHDR');
  if (!ihdr || ihdr.data.length < 13) return { blank: true, ratio: 1, detail: 'bad IHDR' };
  const w = ihdr.data.readUInt32BE(0);
  const h = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data[8];
  const colorType = ihdr.data[9];
  if (w * h > 12_000_000) return { blank: false, ratio: 0, detail: 'too large to sample' };
  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    return { blank: false, ratio: 0, detail: `skip colorType=${colorType} bitDepth=${bitDepth}` };
  }
  const idat = Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data));
  let raw;
  try {
    raw = zlib.inflateSync(idat);
  } catch (e) {
    return { blank: false, ratio: 0, detail: `inflate: ${e.message}` };
  }
  const bpp = colorType === 6 ? 4 : 3;
  const stride = 1 + w * bpp;
  const counts = new Map();
  let samples = 0;
  const stepY = Math.max(1, Math.floor(h / 48));
  const stepX = Math.max(1, Math.floor(w / 48));
  for (let y = 0; y < h; y += stepY) {
    const row = y * stride;
    if (row >= raw.length) break;
    for (let x = 0; x < w; x += stepX) {
      const o = row + 1 + x * bpp;
      if (o + 2 >= raw.length) continue;
      const key = ((raw[o] >> 3) << 10) | ((raw[o + 1] >> 3) << 5) | (raw[o + 2] >> 3);
      counts.set(key, (counts.get(key) || 0) + 1);
      samples += 1;
    }
  }
  if (samples === 0) return { blank: true, ratio: 1, detail: 'no samples' };
  let max = 0;
  for (const n of counts.values()) if (n > max) max = n;
  const ratio = max / samples;
  return { blank: ratio >= BLANK_RATIO, ratio, detail: `${(ratio * 100).toFixed(1)}% one colour (${samples} samples)` };
}

function externalDominantRatio(abs) {
  try {
    const out = execFileSync(
      'magick',
      [abs, '-format', '%c', '-depth', '8', '-colors', '16', 'histogram:info:-'],
      { encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const lines = out.split('\n').filter((l) => /\d+:/.test(l));
    let total = 0;
    let max = 0;
    for (const line of lines) {
      const m = line.match(/^\s*(\d+):/);
      if (!m) continue;
      const n = Number(m[1]);
      total += n;
      if (n > max) max = n;
    }
    if (total > 0) return max / total;
  } catch {
    /* */
  }
  return null;
}

export function checkImageBlank(absPath) {
  let buf;
  try {
    buf = fs.readFileSync(absPath);
  } catch (e) {
    return { blank: true, ratio: 1, detail: `unreadable: ${e.message}` };
  }
  if (buf.length < 64) {
    return { blank: true, ratio: 1, detail: `tiny file ${buf.length}B` };
  }
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    const r = checkPngBlank(buf);
    if (r) return r;
  }
  const extRatio = externalDominantRatio(absPath);
  if (extRatio != null) {
    return {
      blank: extRatio >= BLANK_RATIO,
      ratio: extRatio,
      detail: `${(extRatio * 100).toFixed(1)}% one colour (magick)`,
    };
  }
  return {
    blank: false,
    ratio: 0,
    skipped: true,
    detail: 'blank-check skipped (no PNG decoder path / magick)',
  };
}
