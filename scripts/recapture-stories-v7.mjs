#!/usr/bin/env node
/**
 * Recapture story screenshots with persona-name overlays, then rebuild videos.
 *
 * Uses STORY_DEVICES=1 so each persona gets iphone + ipad + mac × light + dark
 * (spec §5). capture-story.mjs writes NN-<device>.png matching content/stories/*.json.
 *
 *   node recapture-stories-v7.mjs              # all 39
 *   node recapture-stories-v7.mjs vaultcap     # one app (3 personas)
 *   CONCURRENCY=3 node recapture-stories-v7.mjs
 *   SKIP_VIDEO=1 node recapture-stories-v7.mjs vaultcap
 *
 * Demo display-name seeds (product code unchanged — overlay only at capture):
 *   VaultCap     Alex Khan          demo-profiles.js
 *   SteadyCap    Alex (Demo)        demo-seed.js
 *   PulseCap     Alex Demo          storage.js createDemo
 *   TravelCap    Alex / Sam         demo-seed.ts travelers
 *   Others       no user display-name seed (catalog / habits / fragrances)
 *
 * Full fleet recapture is slow (~minutes per persona × devices). Prefer:
 *   node recapture-stories-v7.mjs vaultcap
 * then run other slugs when idle.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLING = dirname(fileURLToPath(import.meta.url));
const FLEET = join(TOOLING, '..', '..');
const LAB = join(FLEET, 'capricorn-lab');
const CAPTURE = join(TOOLING, 'capture-story.mjs');
const MAKE_VIDEO = join(TOOLING, 'make-story-videos.py');
const PW_CORE = process.env.PW_CORE || join(FLEET, 'MasteryCap', 'node_modules', 'playwright-core');
/* Default 1: never run parallel Playwright captures (machine rule). */
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || 1));
const SKIP_VIDEO = process.env.SKIP_VIDEO === '1';

const REPO = {
  vaultcap: 'VaultCap', steadycap: 'SteadyCap', pulsecap: 'PulseCap', soulcap: 'SoulCap',
  deeponycap: 'DeePonyCap', ledgercap: 'LedgerCap', scentcap: 'ScentCap',
  carcap: 'CarCap', masterycap: 'MasteryCap', travelcap: 'TravelCap',
  cookcap: 'CookCap', ideacap: 'IdeaCap', deefoodie: 'DeeFoodieApp',
};

const filterSlug = process.argv[2]?.toLowerCase();

function listJobs() {
  const jobs = [];
  for (const [slug, repo] of Object.entries(REPO)) {
    if (filterSlug && slug !== filterSlug) continue;
    const dir = join(FLEET, repo, 'qa', 'v7', 'personas');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.steps.json'))) {
      jobs.push({ slug, personaId: f.replace(/\.steps\.json$/, '') });
    }
  }
  return jobs;
}

function runOne({ slug, personaId }) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CAPTURE, slug, personaId], {
      cwd: TOOLING,
      env: { ...process.env, PW_CORE, STORY_DEVICES: '1', CANONICAL_ONLY: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (code) => {
      const line = out.trim().split('\n').pop() || '';
      console.log(code === 0 ? `OK  ${personaId} — ${line}` : `FAIL ${personaId} (exit ${code})\n${out.slice(-800)}`);
      resolve({ slug, personaId, code, out: line });
    });
  });
}

async function pool(jobs, n) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < jobs.length) {
      const job = jobs[i++];
      results.push(await runOne(job));
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, jobs.length) }, () => worker()));
  return results;
}

function rebuildVideos(slugs) {
  if (SKIP_VIDEO) {
    console.log('SKIP_VIDEO=1 — skipping make-story-videos.py');
    return;
  }
  if (!existsSync(MAKE_VIDEO)) {
    console.warn('make-story-videos.py missing — skip video rebuild');
    return;
  }
  for (const slug of slugs) {
    console.log(`rebuild video: ${slug}`);
    const r = spawnSync('python3', [MAKE_VIDEO, slug], { cwd: TOOLING, encoding: 'utf8' });
    if (r.status !== 0) {
      console.warn(`video rebuild failed for ${slug}:\n${(r.stderr || r.stdout || '').slice(-500)}`);
    } else {
      console.log((r.stdout || '').trim().split('\n').slice(-3).join('\n'));
    }
  }
}

const jobs = listJobs();
if (!jobs.length) {
  console.error('No persona jobs found');
  process.exit(2);
}
console.log(`recapture-stories-v7: ${jobs.length} personas, concurrency=${CONCURRENCY}`);
const results = await pool(jobs, CONCURRENCY);
const failed = results.filter((r) => r.code !== 0);
const okSlugs = [...new Set(results.filter((r) => r.code === 0).map((r) => r.slug))];
if (okSlugs.length) rebuildVideos(okSlugs);

const report = {
  at: new Date().toISOString(),
  concurrency: CONCURRENCY,
  ok: results.length - failed.length,
  failed: failed.length,
  results,
};
writeFileSync(
  join(LAB, 'content', 'stories', '_recapture-report.json'),
  JSON.stringify(report, null, 2),
);
console.log(`done: ${report.ok}/${results.length} ok`);
process.exit(failed.length ? 1 : 0);
