/**
 * Perfection Loop v3 — G16–G19 gate fixtures.
 * Run: node --test shared/testing/__tests__/tier1-v3-gates.test.mjs
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { summarizeDeviceQa, checkDeviceQaGate } from '../v3/device-qa-gate.mjs';
import { checkGalleryV3Local } from '../v3/gallery-v3-gate.mjs';
import { checkDocsTruthGate } from '../v3/docs-truth-gate.mjs';
import { checkMinisiteLhGate } from '../v3/minisite-lh-gate.mjs';
import { checkPngBlank } from '../v3/blank-image.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIER1 = path.join(HERE, '..', 'tier1.mjs');

function makeFixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tier1-v3-'));
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    if (Buffer.isBuffer(body)) fs.writeFileSync(abs, body);
    else fs.writeFileSync(abs, body);
  }
  return root;
}

/** Minimal RGB PNG (solid colour). */
function solidPng(w, h, rgb) {
  const [r, g, b] = rgb;
  const stride = 1 + w * 3;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const row = y * stride;
    raw[row] = 0; // filter none
    for (let x = 0; x < w; x++) {
      const o = row + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crc = Buffer.alloc(4);
    const crcVal = zlib.crc32 ? zlib.crc32(Buffer.concat([t, data])) : 0;
    // Node zlib.crc32 exists on Node 22+; fallback CRC
    let c = 0xffffffff;
    const buf = Buffer.concat([t, data]);
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    crc.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
    if (typeof crcVal === 'number' && zlib.crc32) crc.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

test('G16: summarizeDeviceQa enforces zero thresholds', () => {
  const summary = summarizeDeviceQa({
    runs: [
      {
        bad: [],
        smallCount: 0,
        tinyCount: 0,
        errors: [],
        hubOriginConsoleErrors: 0,
      },
    ],
  });
  assert.equal(summary.hardFailures, 0);
  assert.equal(summary.tapUnder32, 0);
  const bad = summarizeDeviceQa([
    { bad: ['overflow-x'], smallCount: 2, tinyCount: 1, errors: ['pageerror: x'], hubOriginConsoleErrors: 1 },
  ]);
  assert.equal(bad.hardFailures, 1);
  assert.equal(bad.tapUnder32, 2);
  assert.equal(bad.textUnder11, 1);
  assert.equal(bad.pageErrors, 1);
  assert.equal(bad.hubOriginConsoleErrors, 1);
});

test('G16: missing device-qa.json fails gate', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
  });
  const r = checkDeviceQaGate(root);
  assert.equal(r.ok, false);
  assert.match(r.detail, /missing device-qa/);
});

test('G16: clean summary passes', () => {
  const root = makeFixture({
    'qa/perfection/device/device-qa.json': JSON.stringify({
      runs: [{ app: 'Fx', bad: [], smallCount: 0, tinyCount: 0, errors: [], hubOriginConsoleErrors: 0 }],
      summary: {
        hardFailures: 0,
        tapUnder32: 0,
        textUnder11: 0,
        pageErrors: 0,
        hubOriginConsoleErrors: 0,
        runs: 1,
      },
    }),
  });
  const r = checkDeviceQaGate(root);
  assert.equal(r.ok, true, r.detail);
});

test('blank-image: solid PNG is ≥98% one colour', () => {
  const png = solidPng(32, 32, [20, 40, 60]);
  const r = checkPngBlank(png);
  assert.ok(r);
  assert.equal(r.blank, true, r.detail);
});

test('blank-image: mixed PNG is not blank', () => {
  // Two colours in halves
  const w = 32;
  const h = 32;
  const stride = 1 + w * 3;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * stride + 1 + x * 3;
      const on = x < w / 2;
      raw[o] = on ? 255 : 0;
      raw[o + 1] = on ? 0 : 255;
      raw[o + 2] = on ? 0 : 0;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crc = Buffer.alloc(4);
    let c = 0xffffffff;
    const buf = Buffer.concat([t, data]);
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    crc.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  const r = checkPngBlank(png);
  assert.ok(r);
  assert.equal(r.blank, false, r.detail);
});

test('G17: missing inventory fails', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ version: '1.0.0' }),
    'docs/screenshots/gallery/gallery-manifest.json': JSON.stringify({
      app: 'Fx',
      version: '1.0.0',
      shots: [],
    }),
  });
  const r = checkGalleryV3Local(root);
  assert.equal(r.ok, false);
  assert.match(r.detail, /INVENTORY/i);
});

test('G17: complete inventory + shots passes', () => {
  const png = solidPng(16, 16, [10, 20, 30]); // blank — will fail blank check
  // Use mixed colour shot instead
  const w = 16;
  const h = 16;
  const stride = 1 + w * 3;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * stride + 1 + x * 3;
      raw[o] = (x * 17) % 256;
      raw[o + 1] = (y * 13) % 256;
      raw[o + 2] = (x * y) % 256;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crc = Buffer.alloc(4);
    let c = 0xffffffff;
    const buf = Buffer.concat([t, data]);
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    crc.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const mixed = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  const shots = [];
  const files = {
    'VERSION.json': JSON.stringify({ version: '1.2.0' }),
    'qa/perfection/INVENTORY.json': JSON.stringify({ entries: [{ id: 'home' }] }),
  };
  for (const theme of ['light', 'dark']) {
    for (const device of ['iphone', 'ipad', 'desktop']) {
      const file = `${theme}/${device}/home--home--default.png`;
      files[`docs/screenshots/gallery/${file}`] = mixed;
      shots.push({
        id: 'home--home--default',
        screen: 'home',
        screenId: 'home',
        theme,
        device,
        file,
      });
    }
  }
  files['docs/screenshots/gallery/gallery-manifest.json'] = JSON.stringify({
    app: 'Fx',
    version: '1.2.0',
    shots,
  });
  const root = makeFixture(files);
  const r = checkGalleryV3Local(root);
  assert.equal(r.ok, true, r.detail);
  // solid blank should fail
  const blankRoot = makeFixture({
    'VERSION.json': JSON.stringify({ version: '1.0.0' }),
    'qa/perfection/INVENTORY.json': JSON.stringify({ entries: [{ id: 'home' }] }),
    'docs/screenshots/gallery/light/iphone/x.png': png,
    'docs/screenshots/gallery/gallery-manifest.json': JSON.stringify({
      app: 'Fx',
      version: '1.0.0',
      shots: [
        { id: 'home', screen: 'home', theme: 'light', device: 'iphone', file: 'light/iphone/x.png' },
      ],
    }),
  });
  const blank = checkGalleryV3Local(blankRoot);
  assert.equal(blank.ok, false);
  assert.match(blank.detail, /blank|missing/i);
});

test('G18: flags PrismOS and stale counts', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ version: '1.0.0', swCache: 'fx-v1' }),
    'package.json': JSON.stringify({ name: 'fx', version: '1.0.0', scripts: { tier1: 'node x' } }),
    'sw.js': "const CACHE='fx-v1';\n",
    'README.md': '# Fx\n\nPrismOS is great. We have ten apps and 300+ exercises.\n',
  });
  const r = checkDocsTruthGate(root);
  assert.equal(r.ok, false);
  assert.match(r.detail, /PrismOS|stale|ten-apps|300/i);
});

test('G18: aligned versions pass (no stale claims)', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ version: '1.0.0', swCache: 'fx-v1' }),
    'package.json': JSON.stringify({ name: 'fx', version: '1.0.0', scripts: { verify: 'echo ok' } }),
    'sw.js': "const CACHE='fx-v1';\n",
    'README.md': '# Fx\n\nVersion: 1.0.0\n\n```bash\nnpm run verify\n```\n',
  });
  const r = checkDocsTruthGate(root);
  assert.equal(r.ok, true, r.detail);
});

test('G19: N/A when mini-site missing', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'NoSuchCapXYZ', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'NoSuchCapXYZ' }),
  });
  const r = checkMinisiteLhGate(root);
  assert.equal(r.ok, true);
  assert.equal(r.na, true);
  assert.match(r.detail, /N\/A/i);
});

test('G19: failing LH scores fail gate', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'qa/perfection/minisite/lighthouse/home.json': JSON.stringify({
      userAgent: 'Mozilla/5.0',
      categories: {
        performance: { score: 0.5 },
        accessibility: { score: 0.99 },
        'best-practices': { score: 0.99 },
        seo: { score: 0.99 },
      },
    }),
  });
  const r = checkMinisiteLhGate(root);
  assert.equal(r.ok, false);
  assert.match(r.detail, /perf 50/i);
});

test('tier1 invokes g16 id when device-qa violates', () => {
  const root = makeFixture({
    'VERSION.json': JSON.stringify({ app: 'Fx', version: '0.0.1' }),
    'package.json': JSON.stringify({ name: 'Fx' }),
    'index.js': 'window.__APP_READY__ = true;\n',
    'qa/finish-loop/BASELINE.md': '# b\n',
    'qa/finish-loop/LOG.md': '# l\n',
    'qa/finish-loop/STATES.md': '# s\n',
    'qa/finish-loop/APP-REPORT.md': '# report\n' + 'x'.repeat(1100),
    'qa/finish-loop/DOCS-INVENTORY.md': '# d\n',
    'qa/perfection/device/device-qa.json': JSON.stringify({
      summary: {
        hardFailures: 1,
        tapUnder32: 0,
        textUnder11: 0,
        pageErrors: 0,
        hubOriginConsoleErrors: 0,
        runs: 1,
      },
      runs: [{ bad: ['overflow'], smallCount: 0, tinyCount: 0, errors: [] }],
    }),
  });
  const r = spawnSync(process.execPath, [TIER1], {
    cwd: root,
    env: {
      ...process.env,
      TIER1_SKIP_CI: '1',
      TIER1_SKIP_LH: '1',
      TIER1_SKIP_MATRIX: '1',
      TIER1_SKIP_AXE: '1',
      TIER1_SKIP_GALLERY: '1',
      TIER1_SKIP_G17: '1',
      TIER1_SKIP_G18: '1',
      TIER1_SKIP_G19: '1',
    },
    encoding: 'utf8',
  });
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /g16:device-qa/i);
});
