#!/usr/bin/env node
/**
 * v7 §7.4 simulator spot pass — one device at a time, Safari opens demo URL.
 *
 *   node v7-sim-pass.mjs --app ScentCap --url 'http://127.0.0.1:8771/?demo=1' \
 *     --out ScentCap/build/qa/v7/sim --device 'iPhone SE (3rd generation)'
 *
 * Writes PNG screenshots + appends JSON lines to sim-run.jsonl (gitignored out dir).
 * Committed summary lives in qa/v7/SIM-PASS.md (maintained by the agent).
 */
import { mkdirSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const DEVICES = {
  se: 'iPhone SE (3rd generation)',
  pro: 'iPhone 16 Pro',
  ipad: 'iPad Air 11-inch (M2)',
};

function parseArgs(argv) {
  const o = { app: '', url: '', out: '', device: DEVICES.se, dark: false, ax: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--app=')) o.app = a.slice(6);
    else if (a === '--app') o.app = argv[++i];
    else if (a.startsWith('--url=')) o.url = a.slice(6);
    else if (a === '--url') o.url = argv[++i];
    else if (a.startsWith('--out=')) o.out = a.slice(6);
    else if (a === '--out') o.out = argv[++i];
    else if (a.startsWith('--device=')) o.device = a.slice(9);
    else if (a === '--device') o.device = argv[++i];
    else if (a === '--dark') o.dark = true;
    else if (a === '--larger-text') o.ax = true;
    else if (a === '--preset=se') o.device = DEVICES.se;
    else if (a === '--preset=pro') o.device = DEVICES.pro;
    else if (a === '--preset=ipad') o.device = DEVICES.ipad;
  }
  if (!o.app || !o.url || !o.out) {
    console.error(
      'Usage: node v7-sim-pass.mjs --app NAME --url URL --out DIR [--preset=se|pro|ipad] [--dark] [--larger-text]',
    );
    process.exit(2);
  }
  return o;
}

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return r;
}

const opts = parseArgs(process.argv.slice(2));
mkdirSync(opts.out, { recursive: true });

const list = sh('xcrun', ['simctl', 'list', 'devices', 'available', '-j']);
if (list.status !== 0) {
  console.error('simctl unavailable:', list.stderr);
  process.exit(2);
}
const devices = JSON.parse(list.stdout).devices;
let udid = null;
for (const runtime of Object.values(devices)) {
  for (const d of runtime) {
    if (d.name === opts.device && d.isAvailable !== false) {
      udid = d.udid;
      break;
    }
  }
  if (udid) break;
}
if (!udid) {
  console.error(`Device not found: ${opts.device}`);
  process.exit(2);
}

for (const other of ['Booted']) {
  /* shutdown other booted sims — one at a time */
}
const booted = sh('xcrun', ['simctl', 'list', 'devices', 'booted', '-j']);
try {
  const bootJson = JSON.parse(booted.stdout).devices;
  for (const runtime of Object.values(bootJson)) {
    for (const d of runtime) {
      if (d.udid !== udid) sh('xcrun', ['simctl', 'shutdown', d.udid]);
    }
  }
} catch {
  /* ignore */
}

sh('xcrun', ['simctl', 'boot', udid]);
sh('open', ['-a', 'Simulator']);

if (opts.ax) {
  sh('xcrun', ['simctl', 'spawn', udid, 'defaults', 'write', 'com.apple.Accessibility', 'AXDynamicTypeSize', '-int', '3']);
}
if (opts.dark) {
  sh('xcrun', ['simctl', 'ui', udid, 'appearance', 'dark']);
} else {
  sh('xcrun', ['simctl', 'ui', udid, 'appearance', 'light']);
}

sh('xcrun', ['simctl', 'openurl', udid, opts.url]);
spawnSync('sleep', ['5']);

const slug = opts.device.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
const tag = `${slug}${opts.dark ? '-dark' : '-light'}${opts.ax ? '-ax3' : ''}`;
const png = join(opts.out, `${opts.app}-${tag}.png`);
const shot = sh('xcrun', ['simctl', 'io', udid, 'screenshot', png]);
if (shot.status !== 0) {
  console.error('screenshot failed:', shot.stderr);
  process.exit(1);
}

const entry = {
  at: new Date().toISOString(),
  app: opts.app,
  device: opts.device,
  udid,
  url: opts.url,
  dark: opts.dark,
  largerTextAx3: opts.ax,
  screenshot: png,
};
appendFileSync(join(opts.out, 'sim-run.jsonl'), `${JSON.stringify(entry)}\n`);
console.log(`v7-sim-pass: ${opts.app} ${opts.device} → ${png}`);
