/**
 * ARCH-09 — regenerate architecture maps from Cap-Apps siblings (SPEC §9 / §1.3).
 *
 * Discovers pilot configs, resolves analyze roots, runs analyzeRepo → pilot-* outs.
 * Cap sibling paths are required for a full regen; when missing, callers get an
 * honest skip (never fake success).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeRepo } from './core/pipeline.mjs';
import { validateArchitectureData } from './core/validate.mjs';
import {
  PILOT_SLUG_TO_REPO,
  checkArchitectureMap,
  SHARED_VIEWER_DIR,
} from './check-staleness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TOOLING_ROOT_DEFAULT = path.resolve(HERE, '..', '..');

/** Config basename under qa/architecture/pilots/ for each pilot slug. */
export const PILOT_SLUG_TO_CONFIG = Object.freeze({
  pulse: 'pulsecap.architecture.config.json',
  scent: 'scentcap.architecture.config.json',
  aura: 'auracap.architecture.config.json',
  car: 'carcap.architecture.config.json',
  cook: 'cookcap.architecture.config.json',
  deefoodie: 'deefoodie.architecture.config.json',
  deepony: 'deeponycap.architecture.config.json',
  idea: 'ideacap.architecture.config.json',
  ledger: 'ledgercap.architecture.config.json',
  mastery: 'masterycap.architecture.config.json',
  prism: 'prismcap.architecture.config.json',
  soul: 'soulcap.architecture.config.json',
  steady: 'steadycap.architecture.config.json',
  travel: 'travelcap.architecture.config.json',
  vault: 'vaultcap.architecture.config.json',
  lab: 'capricorn-lab.architecture.config.json',
  hub: 'hub-pages.architecture.config.json',
});

/**
 * Analyze cwd relative to Cap-Apps/<repo> (SoulCap Pages root = docs/).
 * Git freshness still uses the repo root from PILOT_SLUG_TO_REPO.
 */
export const PILOT_ANALYZE_SUBDIR = Object.freeze({
  soul: 'docs',
});

/**
 * @param {string} toolingRoot
 * @returns {string}
 */
export function pilotsConfigDir(toolingRoot) {
  return path.join(toolingRoot, 'qa', 'architecture', 'pilots');
}

/**
 * @param {string} toolingRoot
 * @returns {string}
 */
export function pilotsOutDir(toolingRoot) {
  return path.join(toolingRoot, 'qa', 'architecture');
}

/**
 * @param {string} toolingRoot
 * @param {string} slug
 * @returns {string}
 */
export function pilotMapDir(toolingRoot, slug) {
  return path.join(pilotsOutDir(toolingRoot), 'pilot-' + slug);
}

/**
 * Cap-Apps repo root for a slug (git root), or null if missing.
 * @param {string} toolingRoot
 * @param {string} slug
 * @returns {string|null}
 */
export function resolvePilotRepoRoot(toolingRoot, slug) {
  const repo = PILOT_SLUG_TO_REPO[slug];
  if (!repo) return null;
  const candidate = path.resolve(toolingRoot, '..', repo);
  if (fs.existsSync(candidate)) return candidate;
  return null;
}

/**
 * Directory passed to analyzeRepo (may be repo/docs for SoulCap).
 * @param {string} toolingRoot
 * @param {string} slug
 * @returns {string|null}
 */
export function resolvePilotAnalyzeRoot(toolingRoot, slug) {
  const repoRoot = resolvePilotRepoRoot(toolingRoot, slug);
  if (!repoRoot) return null;
  const sub = PILOT_ANALYZE_SUBDIR[slug];
  if (!sub) return repoRoot;
  const nested = path.join(repoRoot, sub);
  return fs.existsSync(nested) ? nested : repoRoot;
}

/**
 * @param {string} toolingRoot
 * @returns {{
 *   slug: string,
 *   configName: string,
 *   configPath: string,
 *   mapDir: string,
 *   repoRoot: string|null,
 *   analyzeRoot: string|null,
 *   repo: string|null,
 * }[]}
 */
export function discoverPilotTargets(toolingRoot) {
  const cfgDir = pilotsConfigDir(toolingRoot);
  const out = [];
  for (const slug of Object.keys(PILOT_SLUG_TO_CONFIG).sort()) {
    const configName = PILOT_SLUG_TO_CONFIG[slug];
    const configPath = path.join(cfgDir, configName);
    out.push({
      slug,
      configName,
      configPath,
      mapDir: pilotMapDir(toolingRoot, slug),
      repo: PILOT_SLUG_TO_REPO[slug] || null,
      repoRoot: resolvePilotRepoRoot(toolingRoot, slug),
      analyzeRoot: resolvePilotAnalyzeRoot(toolingRoot, slug),
    });
  }
  return out;
}

/**
 * @param {string} configPath
 * @returns {object}
 */
export function loadPilotConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error('Pilot config not found: ' + configPath);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

/**
 * Run analyzer for one pilot target.
 * @param {{
 *   toolingRoot: string,
 *   slug: string,
 *   analyzeRoot?: string,
 *   configPath?: string,
 *   mapDir?: string,
 *   writeAudit?: boolean,
 * }} opts
 * @returns {{ ok: boolean, slug: string, doc?: object, error?: string, mapDir?: string, analyzeRoot?: string }}
 */
export function regeneratePilot(opts) {
  const toolingRoot = opts.toolingRoot;
  const slug = opts.slug;
  const configPath =
    opts.configPath || path.join(pilotsConfigDir(toolingRoot), PILOT_SLUG_TO_CONFIG[slug]);
  const analyzeRoot = opts.analyzeRoot || resolvePilotAnalyzeRoot(toolingRoot, slug);
  const mapDir = opts.mapDir || pilotMapDir(toolingRoot, slug);

  if (!analyzeRoot) {
    return {
      ok: false,
      slug,
      skipped: true,
      reason: 'no_sibling_app_root',
      mapDir,
      error: 'Cap sibling missing for slug "' + slug + '"',
    };
  }
  if (!configPath || !fs.existsSync(configPath)) {
    return {
      ok: false,
      slug,
      mapDir,
      analyzeRoot,
      error: 'config_missing',
    };
  }

  try {
    const config = loadPilotConfig(configPath);
    const doc = analyzeRepo(analyzeRoot, {
      outDir: mapDir,
      writeAudit: opts.writeAudit !== false,
      config,
    });
    const v = validateArchitectureData(doc);
    if (!v.ok) {
      return {
        ok: false,
        slug,
        mapDir,
        analyzeRoot,
        error: 'schema_validation_failed: ' + (v.errors || []).join('; '),
      };
    }
    return {
      ok: true,
      slug,
      mapDir,
      analyzeRoot,
      doc,
      sourceCommit: doc.sourceCommit,
      analyzerVersion: doc.analyzerVersion,
      nodes: doc.nodes.length,
      edges: doc.edges.length,
      findings: doc.findings.length,
    };
  } catch (e) {
    return {
      ok: false,
      slug,
      mapDir,
      analyzeRoot,
      error: String(e && e.message ? e.message : e),
    };
  }
}

/**
 * @param {{
 *   toolingRoot: string,
 *   slugs?: string[],
 *   staleOnly?: boolean,
 *   writeAudit?: boolean,
 * }} opts
 * @returns {{
 *   results: object[],
 *   summary: { attempted: number, ok: number, failed: number, skipped: number },
 * }}
 */
export function regeneratePilots(opts) {
  const toolingRoot = opts.toolingRoot;
  const targets = discoverPilotTargets(toolingRoot);
  const want = opts.slugs
    ? new Set(
        opts.slugs.map(function (s) {
          return String(s).toLowerCase();
        })
      )
    : null;

  /** @type {object[]} */
  const results = [];

  for (const t of targets) {
    if (want && !want.has(t.slug)) continue;

    if (opts.staleOnly) {
      if (!t.analyzeRoot || !fs.existsSync(path.join(t.mapDir, 'architecture-data.json'))) {
        // No map yet → treat as needing regen when root exists
        if (!t.analyzeRoot) {
          results.push({
            ok: false,
            slug: t.slug,
            skipped: true,
            reason: 'no_sibling_app_root',
            mapDir: t.mapDir,
          });
          continue;
        }
      } else {
        const check = checkArchitectureMap({
          root: t.repoRoot || t.analyzeRoot,
          mapDir: t.mapDir,
          sharedViewerDir: SHARED_VIEWER_DIR,
        });
        if (check.ok) {
          results.push({
            ok: true,
            slug: t.slug,
            skipped: true,
            reason: 'already_fresh',
            mapDir: t.mapDir,
            sourceCommit: check.sourceCommit,
          });
          continue;
        }
      }
    }

    results.push(
      regeneratePilot({
        toolingRoot,
        slug: t.slug,
        analyzeRoot: t.analyzeRoot || undefined,
        configPath: t.configPath,
        mapDir: t.mapDir,
        writeAudit: opts.writeAudit,
      })
    );
  }

  const summary = {
    attempted: results.length,
    ok: results.filter(function (r) {
      return r.ok && !r.skipped;
    }).length,
    failed: results.filter(function (r) {
      return !r.ok && !r.skipped;
    }).length,
    skipped: results.filter(function (r) {
      return !!r.skipped;
    }).length,
  };

  return { results, summary };
}
