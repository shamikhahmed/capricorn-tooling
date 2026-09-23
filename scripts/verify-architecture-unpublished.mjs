#!/usr/bin/env node
/**
 * ARCH-06 live gate: curl architecture map URLs; require HTTP 404/410.
 *
 * Usage (from capricorn-tooling/):
 *   npm run architecture:pages-404
 *   node scripts/verify-architecture-unpublished.mjs [--json path] [--timeout ms]
 *
 * Exit 0 only when every URL is unpublished (404/410). Network failures fail the gate.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildUnpublishedUrlMatrix,
  classifyUnpublishedResponse,
} from '../shared/architecture/pages-unpublished.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOLING_ROOT = resolve(HERE, '..');

function parseArgs(argv) {
  const opts = {
    json: resolve(TOOLING_ROOT, 'qa/architecture/PAGES-404-ARCH06.json'),
    timeoutMs: 15000,
    retries: 2,
    concurrency: 8,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = resolve(argv[++i]);
    else if (a === '--timeout') opts.timeoutMs = Number(argv[++i]) || opts.timeoutMs;
    else if (a === '--retries') opts.retries = Math.max(0, Number(argv[++i]) || 0);
    else if (a === '--concurrency') opts.concurrency = Math.max(1, Number(argv[++i]) || 1);
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: node scripts/verify-architecture-unpublished.mjs [--json path] [--timeout ms] [--retries n]`);
      process.exit(0);
    }
  }
  return opts;
}

async function fetchOnce(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': 'capricorn-tooling-arch06/1.0 (+architecture-unpublished-gate)' },
    });
    const text = await res.text();
    return {
      status: res.status,
      bodySnippet: text.slice(0, 400),
      finalUrl: res.url,
    };
  } finally {
    clearTimeout(t);
  }
}

async function fetchWithRetries(url, timeoutMs, retries) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchOnce(url, timeoutMs);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  return {
    status: 0,
    bodySnippet: String(lastErr && lastErr.message ? lastErr.message : lastErr),
    error: true,
  };
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  const n = Math.min(concurrency, items.length || 1);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const matrix = buildUnpublishedUrlMatrix();
  const started = new Date().toISOString();

  console.log(`ARCH-06: checking ${matrix.length} architecture URLs (must be 404/410)…`);

  const results = await mapPool(matrix, opts.concurrency, async (row) => {
    const res = await fetchWithRetries(row.url, opts.timeoutMs, opts.retries);
    const verdict = classifyUnpublishedResponse(res);
    return {
      ...row,
      status: res.status,
      finalUrl: res.finalUrl || null,
      ok: verdict.ok,
      reason: verdict.reason,
      error: Boolean(res.error),
    };
  });

  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  const report = {
    gate: 'ARCH-06',
    checkedAt: started,
    finishedAt: new Date().toISOString(),
    hosts: [...new Set(matrix.map((m) => m.host))],
    totals: {
      urls: results.length,
      unpublished: ok.length,
      publishedOrError: fail.length,
    },
    results,
  };

  mkdirSync(dirname(opts.json), { recursive: true });
  writeFileSync(opts.json, JSON.stringify(report, null, 2) + '\n');

  if (fail.length) {
    console.error(`FAIL — ${fail.length}/${results.length} architecture URL(s) not unpublished:`);
    for (const f of fail.slice(0, 40)) {
      console.error(`  ${f.status}\t${f.reason}\t${f.url}`);
    }
    if (fail.length > 40) console.error(`  … +${fail.length - 40} more`);
    console.error(`Evidence: ${opts.json}`);
    process.exit(1);
  }

  console.log(`OK — ${ok.length}/${results.length} → HTTP 404/410`);
  console.log(`Evidence: ${opts.json}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
