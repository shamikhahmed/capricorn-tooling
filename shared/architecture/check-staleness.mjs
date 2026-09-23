/**
 * ARCH-08 — architecture map staleness + viewer sync checks (SPEC §1.3, G15).
 *
 * Fails when:
 *   1) Viewer assets in the map dir differ from shared/architecture/viewer/
 *   2) architecture-data.json `sourceCommit` is older than the last commit
 *      that touches mapped source files (node `file` paths)
 *
 * Never fails on findings. Journey-trace materialization (`traces.actions`)
 * is not part of this gate (analyzer coverage gap; see LOG.md).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const VIEWER_ASSETS = Object.freeze(['index.html', 'viewer.js', 'viewer.css']);

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SHARED_VIEWER_DIR = path.join(HERE, 'viewer');

/** Repo folder names under Cap-Apps/ for pilot slug → sibling root. */
export const PILOT_SLUG_TO_REPO = Object.freeze({
  pulse: 'PulseCap',
  scent: 'ScentCap',
  aura: 'AuraCap',
  car: 'CarCap',
  cook: 'CookCap',
  deefoodie: 'DeeFoodieApp',
  deepony: 'DeePonyCap',
  idea: 'IdeaCap',
  ledger: 'LedgerCap',
  mastery: 'MasteryCap',
  prism: 'PrismCap',
  soul: 'SoulCap',
  steady: 'SteadyCap',
  travel: 'TravelCap',
  vault: 'VaultCap',
  lab: 'capricorn-lab',
  hub: 'shamikhahmed.github.io',
});

/**
 * Default map output dir for an app repo (SoulCap: architecture/ at root).
 * @param {string} root
 * @returns {string}
 */
export function resolveMapDir(root) {
  const abs = path.resolve(root);
  const soulStyle = path.join(abs, 'architecture', 'architecture-data.json');
  const docsStyle = path.join(abs, 'docs', 'architecture', 'architecture-data.json');
  if (fs.existsSync(soulStyle)) return path.join(abs, 'architecture');
  if (fs.existsSync(docsStyle)) return path.join(abs, 'docs', 'architecture');
  // Prefer SoulCap layout when basename is SoulCap even if empty
  if (path.basename(abs) === 'SoulCap') return path.join(abs, 'architecture');
  return path.join(abs, 'docs', 'architecture');
}

/**
 * Unique relative source paths referenced by graph nodes.
 * @param {object} doc
 * @returns {string[]}
 */
export function collectMappedSourceFiles(doc) {
  const set = new Set();
  const nodes = (doc && doc.nodes) || [];
  for (const n of nodes) {
    const f = n && n.file;
    if (typeof f !== 'string') continue;
    let rel = f.replace(/\\/g, '/').replace(/^\.\//, '');
    if (!rel || rel === '.' || rel === './') continue;
    // Skip non-repo / synthetic / absolute (git treats leading / as filesystem root)
    if (rel.startsWith('http:') || rel.startsWith('https:')) continue;
    if (path.isAbsolute(f) || rel.startsWith('/')) continue;
    set.add(rel);
  }
  return Array.from(set).sort();
}

/**
 * @param {string} abs
 * @returns {string}
 */
export function fileSha256(abs) {
  const buf = fs.readFileSync(abs);
  return createHash('sha256').update(buf).digest('hex');
}

/**
 * Compare shared viewer assets to a map output directory.
 * @param {{ sharedViewerDir?: string, mapDir: string }} opts
 * @returns {{ ok: boolean, checks: object[] }}
 */
export function compareViewerAssets(opts) {
  const shared = path.resolve(opts.sharedViewerDir || SHARED_VIEWER_DIR);
  const mapDir = path.resolve(opts.mapDir);
  const checks = [];
  let ok = true;

  for (const name of VIEWER_ASSETS) {
    const from = path.join(shared, name);
    const to = path.join(mapDir, name);
    if (!fs.existsSync(from)) {
      checks.push({ file: name, ok: false, reason: 'shared_viewer_missing' });
      ok = false;
      continue;
    }
    if (!fs.existsSync(to)) {
      checks.push({ file: name, ok: false, reason: 'map_viewer_missing' });
      ok = false;
      continue;
    }
    const a = fileSha256(from);
    const b = fileSha256(to);
    if (a !== b) {
      checks.push({ file: name, ok: false, reason: 'viewer_drift', sharedSha: a, mapSha: b });
      ok = false;
    } else {
      checks.push({ file: name, ok: true, reason: 'match', sha: a });
    }
  }
  return { ok, checks };
}

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  return {
    status: r.status,
    stdout: String(r.stdout || '').trim(),
    stderr: String(r.stderr || '').trim(),
  };
}

/**
 * Last commit SHA that touches any of the given relative paths (must exist).
 * @param {string} root
 * @param {string[]} relFiles
 * @returns {{ ok: boolean, sha?: string, reason?: string, filesUsed?: string[] }}
 */
export function latestCommitTouchingFiles(root, relFiles) {
  const absRoot = path.resolve(root);
  const existing = [];
  for (const rel of relFiles) {
    const abs = path.join(absRoot, rel);
    if (fs.existsSync(abs)) existing.push(rel);
  }
  if (existing.length === 0) {
    return { ok: false, reason: 'no_mapped_files_on_disk' };
  }
  // Cap argv length: batch if huge
  const batch = existing.slice(0, 400);
  const r = git(absRoot, ['log', '-1', '--format=%H', '--'].concat(batch));
  if (r.status !== 0 || !r.stdout) {
    return { ok: false, reason: 'git_log_failed', detail: r.stderr || r.stdout };
  }
  return { ok: true, sha: r.stdout, filesUsed: batch };
}

/**
 * True when sourceCommit is strictly behind latest (commits exist in between).
 * Equal commits → fresh. sourceCommit unknown / not in repo → error.
 * @param {string} root
 * @param {string} sourceCommit
 * @param {string} latestSha
 * @returns {{ ok: boolean, stale: boolean, commitsBehind?: number, reason?: string }}
 */
export function isSourceCommitStale(root, sourceCommit, latestSha) {
  const absRoot = path.resolve(root);
  const src = String(sourceCommit || '').trim();
  const latest = String(latestSha || '').trim();
  if (!src || src === 'unknown') {
    return { ok: false, stale: true, reason: 'missing_source_commit' };
  }
  if (!latest) {
    return { ok: false, stale: true, reason: 'missing_latest_commit' };
  }
  if (src === latest) {
    return { ok: true, stale: false, commitsBehind: 0 };
  }
  // Verify both resolve
  const resolveSrc = git(absRoot, ['rev-parse', '--verify', src + '^{commit}']);
  if (resolveSrc.status !== 0) {
    return { ok: false, stale: true, reason: 'source_commit_not_in_repo', detail: resolveSrc.stderr };
  }
  const resolveLatest = git(absRoot, ['rev-parse', '--verify', latest + '^{commit}']);
  if (resolveLatest.status !== 0) {
    return { ok: false, stale: true, reason: 'latest_commit_not_in_repo', detail: resolveLatest.stderr };
  }
  const count = git(absRoot, ['rev-list', '--count', src + '..' + latest]);
  if (count.status !== 0) {
    return { ok: false, stale: true, reason: 'rev_list_failed', detail: count.stderr };
  }
  const n = Number(count.stdout) || 0;
  if (n > 0) {
    return { ok: true, stale: true, commitsBehind: n, reason: 'source_commit_behind_mapped_sources' };
  }
  // latest is ancestor of source (map newer than last source touch) → still fresh
  return { ok: true, stale: false, commitsBehind: 0 };
}

/**
 * Full check for one map directory against an app git root.
 * @param {{
 *   root: string,
 *   mapDir?: string,
 *   sharedViewerDir?: string,
 *   doc?: object,
 *   skipFreshness?: boolean,
 * }} opts
 * @returns {object}
 */
export function checkArchitectureMap(opts) {
  const root = path.resolve(opts.root);
  const mapDir = path.resolve(opts.mapDir || resolveMapDir(root));
  const dataPath = path.join(mapDir, 'architecture-data.json');
  const result = {
    root,
    mapDir,
    dataPath,
    ok: true,
    missing: false,
    viewer: null,
    freshness: null,
    errors: [],
  };

  if (!fs.existsSync(dataPath)) {
    result.ok = false;
    result.missing = true;
    result.errors.push('architecture_data_missing');
    return result;
  }

  let doc = opts.doc;
  if (!doc) {
    try {
      doc = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (e) {
      result.ok = false;
      result.errors.push('architecture_data_invalid_json');
      result.parseError = String(e && e.message ? e.message : e);
      return result;
    }
  }

  result.app = doc.app || null;
  result.sourceCommit = doc.sourceCommit || null;
  result.analyzerVersion = doc.analyzerVersion || null;
  result.generatedAt = doc.generatedAt || null;

  const viewer = compareViewerAssets({
    sharedViewerDir: opts.sharedViewerDir,
    mapDir,
  });
  result.viewer = viewer;
  if (!viewer.ok) {
    result.ok = false;
    result.errors.push('viewer_out_of_sync');
  }

  if (opts.skipFreshness) {
    result.freshness = { ok: true, skipped: true, reason: 'skip_freshness' };
    return result;
  }

  const mapped = collectMappedSourceFiles(doc);
  result.mappedFileCount = mapped.length;
  const latest = latestCommitTouchingFiles(root, mapped);
  if (!latest.ok) {
    result.ok = false;
    result.freshness = { ok: false, stale: true, reason: latest.reason, detail: latest.detail };
    result.errors.push(latest.reason || 'freshness_failed');
    return result;
  }

  const stale = isSourceCommitStale(root, doc.sourceCommit, latest.sha);
  result.freshness = {
    ok: stale.ok && !stale.stale,
    stale: !!stale.stale,
    sourceCommit: doc.sourceCommit,
    latestSourceCommit: latest.sha,
    commitsBehind: stale.commitsBehind,
    reason: stale.reason || (stale.stale ? 'stale' : 'fresh'),
    filesSample: (latest.filesUsed || []).slice(0, 8),
  };
  if (!stale.ok || stale.stale) {
    result.ok = false;
    result.errors.push(stale.reason || 'stale');
  }
  return result;
}

/**
 * Discover pilot-* map dirs under qa/architecture.
 * @param {string} archDir
 * @returns {{ slug: string, mapDir: string, dataPath: string }[]}
 */
export function discoverPilotMaps(archDir) {
  const out = [];
  if (!fs.existsSync(archDir)) return out;
  for (const ent of fs.readdirSync(archDir, { withFileTypes: true })) {
    if (!ent.isDirectory() || !ent.name.startsWith('pilot-')) continue;
    const mapDir = path.join(archDir, ent.name);
    const dataPath = path.join(mapDir, 'architecture-data.json');
    if (!fs.existsSync(dataPath)) continue;
    out.push({
      slug: ent.name.replace(/^pilot-/, ''),
      mapDir,
      dataPath,
    });
  }
  out.sort(function (a, b) {
    return a.slug < b.slug ? -1 : 1;
  });
  return out;
}

/**
 * Resolve Cap app root for a pilot slug (sibling of tooling under Cap-Apps).
 * @param {string} toolingRoot
 * @param {string} slug
 * @returns {string|null}
 */
export function resolvePilotAppRoot(toolingRoot, slug) {
  const repo = PILOT_SLUG_TO_REPO[slug];
  if (!repo) return null;
  const candidate = path.resolve(toolingRoot, '..', repo);
  if (fs.existsSync(candidate)) return candidate;
  return null;
}
