/**
 * G17 — gallery v3 completeness (§9.6).
 * Prefer Gallery Engineer `shared/gallery/check-completeness.mjs` when present.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkImageBlank } from './blank-image.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = path.resolve(HERE, '..', '..', '..');

export const MANIFEST_CANDIDATES = [
  'docs/screenshots/gallery/gallery-manifest.json',
  'gallery-manifest.json',
  'public/gallery-manifest.json',
  'assets/screenshots/gallery-manifest.json',
];

const REQUIRED_DEVICES = ['iphone', 'ipad', 'desktop'];
const REQUIRED_THEMES = ['light', 'dark'];

function normalizeDevice(d) {
  const s = String(d || '').toLowerCase().replace(/_/g, '-');
  if (/iphone|390|phone/.test(s)) return 'iphone';
  if (/ipad|820|1180|tablet/.test(s)) return 'ipad';
  if (/mac|desktop|1440|1920|laptop/.test(s)) return 'desktop';
  return s;
}

function normalizeTheme(t) {
  return String(t || '').toLowerCase();
}

function shotKey(screenId, theme, device) {
  return `${screenId}::${theme}::${device}`;
}

export function loadInventoryIds(root) {
  const jsonPath = path.join(root, 'qa', 'perfection', 'INVENTORY.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const entries = Array.isArray(j) ? j : j.entries || j.screens || j.items || [];
      return entries
        .map((e) => (typeof e === 'string' ? e : e.id || e.screenId || e.screen || e.slug || e.name))
        .filter(Boolean)
        .map(String);
    } catch {
      return { error: `invalid ${path.relative(root, jsonPath)}` };
    }
  }
  const mdPath = path.join(root, 'qa', 'perfection', 'INVENTORY.md');
  if (!fs.existsSync(mdPath)) return null;
  const text = fs.readFileSync(mdPath, 'utf8');
  const ids = new Set();
  for (const line of text.split('\n')) {
    let m = line.match(/^\s*[-*]\s*`([^`]+)`/);
    if (m) { ids.add(m[1].trim()); continue; }
    m = line.match(/^\s*[-*]\s+\*\*([^*]+)\*\*/);
    if (m) { ids.add(m[1].trim()); continue; }
    m = line.match(/^\s*[-*]\s+id\s*:\s*(\S+)/i);
    if (m) { ids.add(m[1].trim()); continue; }
    m = line.match(/^\s*\|([^\|]+)\|/);
    if (m && !/^\s*\|?\s*-+/.test(line) && !/screen|id|route|name/i.test(m[1])) {
      const cell = m[1].trim().replace(/`/g, '');
      if (cell && cell.length < 80) ids.add(cell);
    }
  }
  return [...ids];
}

function findManifest(root) {
  return MANIFEST_CANDIDATES.map((p) => path.join(root, p)).find((p) => fs.existsSync(p));
}

function readVersion(root) {
  for (const f of ['VERSION.json', 'package.json']) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (j.version) return String(j.version);
    } catch { /* */ }
  }
  return null;
}

export function checkGalleryV3Local(root) {
  const failures = [];
  const inv = loadInventoryIds(root);
  if (inv && inv.error) return { ok: false, detail: inv.error, failures: [inv.error] };
  if (!inv || inv.length === 0) {
    failures.push('missing qa/perfection/INVENTORY.json or parseable INVENTORY.md entries');
  }
  const manifestPath = findManifest(root);
  if (!manifestPath) {
    failures.push(`gallery-manifest.json not found (${MANIFEST_CANDIDATES.join(', ')})`);
    return { ok: false, detail: failures.join('; '), failures };
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    return { ok: false, detail: `invalid manifest: ${e.message}`, failures: [e.message] };
  }
  const shots = Array.isArray(manifest.shots) ? manifest.shots : [];
  if (shots.length === 0) failures.push('manifest.shots empty');

  const appVer = readVersion(root);
  const manVer = manifest.version ? String(manifest.version) : null;
  if (appVer && manVer && manVer !== appVer) {
    failures.push(`manifest version ${manVer} ≠ app ${appVer}`);
  } else if (appVer && !manVer) {
    failures.push(`manifest missing version (app is ${appVer})`);
  }

  const galleryRoot = path.dirname(manifestPath);
  const present = new Set();
  let blankChecked = 0;
  let blankSkipped = 0;

  for (const shot of shots) {
    const file = shot.file || shot.path || shot.src;
    if (!file) {
      failures.push(`shot missing file: ${JSON.stringify(shot).slice(0, 80)}`);
      continue;
    }
    const abs = path.isAbsolute(file) ? file : path.join(galleryRoot, file);
    if (!fs.existsSync(abs)) {
      failures.push(`missing file: ${file}`);
      continue;
    }
    const screenId = String(shot.id || shot.screenId || shot.screen || shot.label || path.basename(file, path.extname(file)));
    const theme = normalizeTheme(shot.theme || shot.mode || shot.colorScheme);
    let device = normalizeDevice(shot.device || shot.viewport || shot.vp);
    // Gallery Engineer uses "mac"; map to desktop for local required set
    if (device === 'mac') device = 'desktop';
    if (theme && device) present.add(shotKey(screenId, theme, device));
    const baseId = String(shot.screen || shot.screenId || screenId).toLowerCase();
    if (theme && device) present.add(shotKey(baseId, theme, device));

    const blank = checkImageBlank(abs);
    blankChecked += 1;
    if (blank.skipped) blankSkipped += 1;
    else if (blank.blank) failures.push(`blank (≥98%): ${file} (${blank.detail})`);
  }

  const inventoryIds = Array.isArray(inv) ? inv : [];
  for (const id of inventoryIds) {
    const sid = String(id);
    const sidLower = sid.toLowerCase();
    for (const theme of REQUIRED_THEMES) {
      for (const device of REQUIRED_DEVICES) {
        const ok =
          present.has(shotKey(sid, theme, device)) ||
          present.has(shotKey(sidLower, theme, device)) ||
          [...present].some((k) => {
            const [pid, ptheme, pdev] = k.split('::');
            return ptheme === theme && pdev === device && (pid.includes(sidLower) || sidLower.includes(pid));
          });
        if (!ok) failures.push(`inventory "${sid}" missing ${theme}/${device}`);
      }
    }
  }

  const capped = failures.slice(0, 25);
  const extra = failures.length > 25 ? ` (+${failures.length - 25} more)` : '';
  const blankNote = blankSkipped ? `; blank-check skipped on ${blankSkipped}/${blankChecked}` : '';
  if (failures.length) {
    return { ok: false, detail: `${path.relative(root, manifestPath)}: ${capped.join('; ')}${extra}${blankNote}`, failures };
  }
  return {
    ok: true,
    detail: `${path.relative(root, manifestPath)}: ${shots.length} shots, ${inventoryIds.length} inventory ids covered${blankNote}`,
    failures: [],
  };
}

/** Delegate to Gallery Engineer script when present. */
export function tryGalleryEngineerCheck(root) {
  const candidates = [
    path.join(TOOLING_ROOT, 'shared', 'gallery', 'check-completeness.mjs'),
    path.join(root, '..', 'capricorn-tooling', 'shared', 'gallery', 'check-completeness.mjs'),
  ];
  const script = candidates.find((p) => fs.existsSync(p));
  if (!script) return null;
  const r = spawnSync(
    process.execPath,
    [script, `--app-dir=${root}`, '--json'],
    { encoding: 'utf8', cwd: root, env: process.env },
  );
  const stdout = (r.stdout || '').trim();
  let detail = stdout.slice(0, 500) || (r.status === 0 ? 'gallery check-completeness ok' : 'gallery check-completeness failed');
  try {
    const j = JSON.parse(stdout);
    if (typeof j.pass === 'boolean') {
      const fails = (j.failures || []).slice(0, 8).join('; ');
      detail = fails || (j.pass ? `PASS shots=${j.meta?.shotCount ?? '?'}` : 'FAIL');
      return { ok: j.pass, detail, via: script };
    }
    if (typeof j.ok === 'boolean') {
      return { ok: j.ok, detail: j.detail || detail, via: script };
    }
  } catch { /* plain text */ }
  if (r.stderr) detail = `${detail} ${String(r.stderr).slice(0, 200)}`.trim();
  return { ok: r.status === 0, detail, via: script };
}

export function checkGalleryV3Gate(root) {
  const delegated = tryGalleryEngineerCheck(root);
  if (delegated) {
    return {
      ok: delegated.ok,
      id: 'g17:gallery-v3',
      detail: `${delegated.ok ? 'via' : 'FAIL via'} ${path.basename(delegated.via)}: ${delegated.detail}`,
    };
  }
  const local = checkGalleryV3Local(root);
  return { ok: local.ok, id: 'g17:gallery-v3', detail: local.detail };
}
