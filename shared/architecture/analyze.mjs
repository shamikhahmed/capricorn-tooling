#!/usr/bin/env node
/**
 * Cap Architecture Connection Map — CLI entry (SPEC §1.1).
 * Usage:
 *   node analyze.mjs [--root <path>] [--out <dir>] [--stdout] [--no-audit]
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeRepo } from './core/pipeline.mjs';
import { validateArchitectureData } from './core/validate.mjs';
import { stableStringify } from './core/serialize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = { root: process.cwd(), outDir: null, stdout: false, writeAudit: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root' && argv[i + 1]) {
      out.root = path.resolve(argv[++i]);
    } else if (a === '--out' && argv[i + 1]) {
      out.outDir = path.resolve(argv[++i]);
    } else if (a === '--stdout') {
      out.stdout = true;
    } else if (a === '--no-audit') {
      out.writeAudit = false;
    } else if (a === '--help' || a === '-h') {
      out.help = true;
    }
  }
  if (!out.outDir && !out.stdout) {
    // Default: docs/architecture under root, or architecture/ if SoulCap-style flag in config
    out.outDir = path.join(out.root, 'docs', 'architecture');
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    process.stdout.write(
      'Usage: node analyze.mjs [--root <path>] [--out <dir>] [--stdout] [--no-audit]\n'
    );
    process.exit(0);
  }

  const doc = analyzeRepo(args.root, {
    outDir: args.stdout ? null : args.outDir,
    writeAudit: args.writeAudit,
  });

  const v = validateArchitectureData(doc);
  if (!v.ok) {
    process.stderr.write('Schema validation failed:\n' + v.errors.map(function (e) {
      return '  - ' + e;
    }).join('\n') + '\n');
    process.exit(2);
  }

  if (args.stdout) {
    process.stdout.write(stableStringify(doc) + '\n');
  } else {
    process.stderr.write(
      'Wrote architecture data for ' + doc.app + ' → ' + args.outDir +
      ' (nodes=' + doc.nodes.length + ' edges=' + doc.edges.length + ' findings=' + doc.findings.length + ')\n'
    );
  }
}

main();
