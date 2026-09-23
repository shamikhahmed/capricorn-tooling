#!/usr/bin/env node
/**
 * ARCH-08 CLI — fail on viewer drift or stale sourceCommit (never on findings).
 *
 * Usage (from capricorn-tooling/):
 *   npm run architecture:check
 *   node scripts/architecture-check.mjs --pilots
 *   node scripts/architecture-check.mjs --root ../PulseCap --map qa/architecture/pilot-pulse
 *   node scripts/architecture-check.mjs --root ../PulseCap
 *
 * Exit 0 only when every checked map passes viewer sync + freshness.
 * Pilots without a sibling Cap root: viewer-only (freshness skipped with note).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkArchitectureMap,
  discoverPilotMaps,
  resolveMapDir,
  resolvePilotAppRoot,
  SHARED_VIEWER_DIR,
} from '../shared/architecture/check-staleness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = path.resolve(HERE, '..');

function parseArgs(argv) {
  const opts = {
    root: null,
    map: null,
    pilots: false,
    json: path.join(TOOLING_ROOT, 'qa', 'architecture', 'CHECK-ARCH08.json'),
    skipFreshness: false,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root' && argv[i + 1]) opts.root = path.resolve(argv[++i]);
    else if (a === '--map' && argv[i + 1]) opts.map = path.resolve(argv[++i]);
    else if (a === '--pilots') opts.pilots = true;
    else if (a === '--json' && argv[i + 1]) opts.json = path.resolve(argv[++i]);
    else if (a === '--skip-freshness') opts.skipFreshness = true;
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  // Default: pilots mode when no --root
  if (!opts.root && !opts.pilots && !opts.map) opts.pilots = true;
  return opts;
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log(`Usage:
  node scripts/architecture-check.mjs --pilots
  node scripts/architecture-check.mjs --root <app> [--map <dir>]
  node scripts/architecture-check.mjs --root <app> --map <dir> --json <path>
`);
    process.exit(0);
  }

  const started = new Date().toISOString();
  /** @type {object[]} */
  const results = [];

  if (opts.pilots) {
    const archDir = path.join(TOOLING_ROOT, 'qa', 'architecture');
    const pilots = discoverPilotMaps(archDir);
    if (pilots.length === 0) {
      console.error('No pilot maps found under qa/architecture/pilot-*/');
      process.exit(1);
    }
    for (const p of pilots) {
      const appRoot = resolvePilotAppRoot(TOOLING_ROOT, p.slug);
      if (!appRoot) {
        const viewerOnly = checkArchitectureMap({
          root: TOOLING_ROOT,
          mapDir: p.mapDir,
          sharedViewerDir: SHARED_VIEWER_DIR,
          skipFreshness: true,
        });
        viewerOnly.slug = p.slug;
        viewerOnly.appRoot = null;
        viewerOnly.note = 'no_sibling_app_root';
        results.push(viewerOnly);
        continue;
      }
      results.push(
        Object.assign(
          checkArchitectureMap({
            root: appRoot,
            mapDir: p.mapDir,
            sharedViewerDir: SHARED_VIEWER_DIR,
            skipFreshness: opts.skipFreshness,
          }),
          { slug: p.slug, appRoot }
        )
      );
    }
  } else {
    const root = opts.root || process.cwd();
    const mapDir = opts.map || resolveMapDir(root);
    results.push(
      checkArchitectureMap({
        root,
        mapDir,
        sharedViewerDir: SHARED_VIEWER_DIR,
        skipFreshness: opts.skipFreshness,
      })
    );
  }

  const failed = results.filter(function (r) {
    return !r.ok;
  });
  const payload = {
    schemaVersion: 1,
    arch: 'ARCH-08',
    gate: 'architecture:check',
    generatedAt: started,
    finishedAt: new Date().toISOString(),
    sharedViewerDir: SHARED_VIEWER_DIR,
    summary: {
      checked: results.length,
      pass: results.length - failed.length,
      fail: failed.length,
    },
    // Honesty: what this gate does / does not cover
    coverage: {
      viewerSync: true,
      sourceCommitFreshness: true,
      failsOnFindings: false,
      journeyTracesActions: false,
      unexplainedBrokenEdges: false,
      noVerifiedSourceDisplays: false,
      pages404Live: 'ARCH-06 (architecture:pages-404)',
      note:
        'G15 Tier1 wire calls this check when a map exists. Full G15 (0 unexplained BROKEN, AUDIT triage, analyzer tests) is not collapsed into this script.',
    },
    results: results.map(function (r) {
      return {
        slug: r.slug || null,
        app: r.app,
        root: r.root,
        mapDir: r.mapDir,
        ok: r.ok,
        missing: r.missing || false,
        errors: r.errors,
        sourceCommit: r.sourceCommit,
        analyzerVersion: r.analyzerVersion,
        viewerOk: r.viewer ? r.viewer.ok : null,
        freshness: r.freshness,
        note: r.note || null,
      };
    }),
  };

  fs.mkdirSync(path.dirname(opts.json), { recursive: true });
  fs.writeFileSync(opts.json, JSON.stringify(payload, null, 2) + '\n');

  console.log(
    `architecture:check ${failed.length === 0 ? 'PASS' : 'FAIL'} — ${payload.summary.pass}/${payload.summary.checked} maps`
  );
  console.log(`Wrote ${path.relative(TOOLING_ROOT, opts.json)}`);
  for (const r of results) {
    const label = r.slug || r.app || path.basename(r.mapDir);
    const mark = r.ok ? '✓' : '✗';
    const bits = [];
    if (r.viewer && !r.viewer.ok) bits.push('viewer');
    if (r.freshness && r.freshness.stale) {
      bits.push('stale+' + (r.freshness.commitsBehind || '?') + 'c');
    }
    if (r.freshness && r.freshness.skipped) bits.push('freshness-skipped');
    if (r.missing) bits.push('missing');
    console.log(`  ${mark} ${label}${bits.length ? ' (' + bits.join(', ') + ')' : ''}`);
  }
  if (failed.length) {
    console.log('\nFailures:');
    for (const r of failed) {
      console.log(`  ✗ ${r.slug || r.app || r.mapDir}: ${(r.errors || []).join(', ')}`);
    }
  }
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
