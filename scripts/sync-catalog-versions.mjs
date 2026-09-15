#!/usr/bin/env node
/**
 * Sync VERSION.json → hub products-data.js + capricorn-lab products.js (HUB-P0-01).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT } from './lib/workspace-root.mjs';

const DESCRIPTIONS = {
  AuraCap: 'Organize your iPhone, iPad and Mac setup.',
  CarCap: 'Service, fuel and documents for your cars.',
  CookCap: 'Your family cookbook, kept like a real book.',
  DeeFoodie: 'A private journal of where you eat in Karachi.',
  DeePonyCap: 'Track your collection, shelves and wishlist.',
  IdeaCap: 'Capture ideas by voice or text. They stay on your device.',
  LedgerCap: 'Track your PSX stocks and mutual funds in one place.',
  MasteryCap: 'Learn trading and software step by step, in English or Roman Urdu.',
  PrismCap: 'Party games for one phone, passed around the room.',
  PulseCap: 'Plan, log and track your training. Works offline.',
  ScentCap: 'Your fragrance collection, and what to wear today.',
  SoulCap: 'Quiet tools to steady yourself. Not therapy.',
  SteadyCap: 'Routines, medicines and support for recovery.',
  TravelCap: 'Trips, tickets and travel documents in one place.',
  VaultCap: 'Everything you own, encrypted on your device.',
};

const APPS = [
  ['VaultCap', 'vaultcap'],
  ['PulseCap', 'pulsecap'],
  ['PrismCap', 'prismcap'],
  ['SteadyCap', 'steadycap'],
  ['LedgerCap', 'ledgercap'],
  ['DeePonyCap', 'deeponycap'],
  ['ScentCap', 'scentcap'],
  ['AuraCap', 'auracap'],
  ['TravelCap', 'travelcap'],
  ['IdeaCap', 'ideacap'],
  ['MasteryCap', 'masterycap'],
  ['SoulCap', 'soulcap'],
  ['CarCap', 'carcap'],
  ['CookCap', 'cookcap'],
  ['DeeFoodieApp', 'deefoodie', 'DeeFoodie'],
];

function readVersion(dir) {
  const vf = join(ROOT, dir, 'VERSION.json');
  if (!existsSync(vf)) {
    if (dir === 'CookCap') {
      const pkg = JSON.parse(readFileSync(join(ROOT, dir, 'package.json'), 'utf8'));
      return pkg.version;
    }
    return null;
  }
  const meta = JSON.parse(readFileSync(vf, 'utf8'));
  return meta.version;
}

/** Hub products-data.js: keyed blocks `slug: { … ver: '…' }` */
function patchKeyedBlock(text, slug, ver, tagline) {
  let next = text;
  const verRe = new RegExp(`(${slug}:\\s*\\{[\\s\\S]*?ver:\\s*)'[^']*'`);
  if (verRe.test(next)) next = next.replace(verRe, `$1'${ver}'`);
  const tagRe = new RegExp(`(${slug}:\\s*\\{[\\s\\S]*?tagline:\\s*)'[^']*'`);
  if (tagRe.test(next) && tagline) next = next.replace(tagRe, `$1'${tagline.replace(/'/g, "\\'")}'`);
  return next;
}

/** Lab products.js: array objects `{ slug: 'x', … ver: '…' }` */
function patchSlugObject(text, slug, ver, tagline) {
  let next = text;
  const verRe = new RegExp(`(\\{\\s*slug:\\s*'${slug}'[\\s\\S]*?ver:\\s*)'[^']*'`);
  if (verRe.test(next)) next = next.replace(verRe, `$1'${ver}'`);
  const tagRe = new RegExp(`(\\{\\s*slug:\\s*'${slug}'[\\s\\S]*?tagline:\\s*)'[^']*'`);
  if (tagRe.test(next) && tagline) next = next.replace(tagRe, `$1'${tagline.replace(/'/g, "\\'")}'`);
  return next;
}

const versions = {};
for (const row of APPS) {
  const [dir, slug, descKey] = row;
  const ver = readVersion(dir);
  if (!ver) {
    console.warn('skip', dir);
    continue;
  }
  const name = descKey || dir;
  versions[slug] = { ver, tagline: DESCRIPTIONS[name] };
  console.log(slug, ver);
}

const hubPath = join(ROOT, 'shamikhahmed.github.io/js/products-data.js');
let hub = readFileSync(hubPath, 'utf8');
for (const [slug, { ver, tagline }] of Object.entries(versions)) {
  hub = patchKeyedBlock(hub, slug, ver, tagline);
}
writeFileSync(hubPath, hub);

const labPath = join(ROOT, 'capricorn-lab/js/products.js');
if (existsSync(labPath)) {
  let lab = readFileSync(labPath, 'utf8');
  for (const [slug, { ver, tagline }] of Object.entries(versions)) {
    lab = patchSlugObject(lab, slug, ver, tagline);
  }
  writeFileSync(labPath, lab);
  console.log('Updated lab catalog:', labPath);
} else {
  console.warn('skip lab catalog (missing)', labPath);
}

console.log('Synced catalog versions:', Object.fromEntries(Object.entries(versions).map(([k, v]) => [k, v.ver])));
