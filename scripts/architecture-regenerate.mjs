#!/usr/bin/env node
/**
 * ARCH-09 CLI — regenerate architecture maps after structural change (SPEC §9).
 *
 * Usage (from capricorn-tooling/):
 *   npm run architecture:regen
 *   npm run architecture:regen -- --stale
 *   npm run architecture:regen -- --slugs cook,ledger,pulse,scent,travel
 *   npm run architecture:regen -- --dry-run
 *
 * Requires Cap-Apps sibling checkouts next to capricorn-tooling. When missing,
 * reports skips honestly (exit 0 on dry-run / all-skipped; exit 1 if any regen fails).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  discoverPilotTargets,
  regeneratePilots,
  TOOLING_ROOT_DEFAULT,
} from '../shared/architecture/regenerate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = path.resolve(HERE, '..');

function parseArgs(argv) {
  const opts = {
    stale: false,
    dryRun: false,
    slugs: null,
    json: path.join(TOOLING_ROOT, 'qa', 'architecture', 'REGEN-ARCH09.json'),
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--stale') opts.stale = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--slugs' && argv[i + 1]) {
      opts.slugs = String(argv[++i])
        .split(',')
        .map(function (s) {
          return s.trim().toLowerCase();
        })
        .filter(Boolean);
    } else if (a === '--json' && argv[i + 1]) opts.json = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log(`Usage:
  node scripts/architecture-regenerate.mjs [--stale] [--slugs a,b] [--dry-run] [--json path]

  --stale     Only regenerate maps that fail architecture:check freshness/viewer
  --slugs     Comma-separated pilot slugs (default: all)
  --dry-run   List targets / sibling availability; do not analyze
  --json      Evidence path (default: qa/architecture/REGEN-ARCH09.json)
`);
    process.exit(0);
  }

  const started = new Date().toISOString();
  const toolingRoot = fs.existsSync(path.join(TOOLING_ROOT, 'package.json'))
    ? TOOLING_ROOT
    : TOOLING_ROOT_DEFAULT;

  if (opts.dryRun) {
    const targets = discoverPilotTargets(toolingRoot).filter(function (t) {
      if (!opts.slugs) return true;
      return opts.slugs.includes(t.slug);
    });
    const payload = {
      schemaVersion: 1,
      arch: 'ARCH-09',
      mode: 'dry-run',
      generatedAt: started,
      finishedAt: new Date().toISOString(),
      summary: {
        targets: targets.length,
        withSibling: targets.filter(function (t) {
          return !!t.analyzeRoot;
        }).length,
        missingSibling: targets.filter(function (t) {
          return !t.analyzeRoot;
        }).length,
      },
      targets: targets.map(function (t) {
        return {
          slug: t.slug,
          config: t.configName,
          repo: t.repo,
          analyzeRoot: t.analyzeRoot,
          mapDir: t.mapDir,
          siblingPresent: !!t.analyzeRoot,
        };
      }),
    };
    fs.mkdirSync(path.dirname(opts.json), { recursive: true });
    fs.writeFileSync(opts.json, JSON.stringify(payload, null, 2) + '\n');
    console.log(
      `architecture:regen dry-run — ${payload.summary.withSibling}/${payload.summary.targets} siblings present`
    );
    console.log(`Wrote ${path.relative(toolingRoot, opts.json)}`);
    for (const t of payload.targets) {
      console.log(`  ${t.siblingPresent ? '✓' : '○'} ${t.slug} → ${t.repo || '?'}`);
    }
    process.exit(0);
  }

  const { results, summary } = regeneratePilots({
    toolingRoot,
    slugs: opts.slugs || undefined,
    staleOnly: opts.stale,
  });

  const payload = {
    schemaVersion: 1,
    arch: 'ARCH-09',
    gate: 'architecture:regen',
    staleOnly: opts.stale,
    generatedAt: started,
    finishedAt: new Date().toISOString(),
    summary,
    coverage: {
      regeneratesPilots: true,
      requiresCapSiblings: true,
      failsOnFindings: false,
      ciWithoutSiblings: 'dry-run — see workflow architecture-regenerate.yml',
      note: 'SPEC §9: regenerate after structural change. ARCH-08 check verifies freshness. Live regen is local (Cap siblings).',
    },
    results: results.map(function (r) {
      return {
        slug: r.slug,
        ok: r.ok,
        skipped: !!r.skipped,
        reason: r.reason || null,
        error: r.error || null,
        mapDir: r.mapDir || null,
        analyzeRoot: r.analyzeRoot || null,
        sourceCommit: r.sourceCommit || null,
        analyzerVersion: r.analyzerVersion || null,
        nodes: r.nodes ?? null,
        edges: r.edges ?? null,
        findings: r.findings ?? null,
      };
    }),
  };

  fs.mkdirSync(path.dirname(opts.json), { recursive: true });
  fs.writeFileSync(opts.json, JSON.stringify(payload, null, 2) + '\n');

  const failed = summary.failed;
  const label = failed === 0 ? 'PASS' : 'FAIL';
  console.log(
    `architecture:regen ${label} — ok=${summary.ok} skipped=${summary.skipped} failed=${summary.failed} / ${summary.attempted}`
  );
  console.log(`Wrote ${path.relative(toolingRoot, opts.json)}`);
  for (const r of results) {
    const mark = r.ok ? (r.skipped ? '○' : '✓') : '✗';
    const bits = [];
    if (r.skipped) bits.push(r.reason || 'skipped');
    if (r.error) bits.push(r.error);
    if (r.sourceCommit) bits.push('commit=' + String(r.sourceCommit).slice(0, 7));
    if (r.nodes != null) bits.push('n=' + r.nodes);
    console.log(`  ${mark} ${r.slug}${bits.length ? ' (' + bits.join(', ') + ')' : ''}`);
  }

  if (failed > 0) process.exit(1);
  // All skipped (no siblings) is not a regen success for --stale local runs, but
  // exit 0 so CI without Cap-Apps can stay green when nothing was attempted badly.
  if (summary.ok === 0 && summary.skipped > 0 && summary.failed === 0 && !opts.stale) {
    console.log(
      '\nNote: no maps regenerated (siblings missing or already fresh). Run locally with Cap-Apps siblings.'
    );
  }
  process.exit(0);
}

main();
