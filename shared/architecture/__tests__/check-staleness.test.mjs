/**
 * ARCH-08 offline tests — viewer sync + sourceCommit freshness (no Cap apps required).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  VIEWER_ASSETS,
  SHARED_VIEWER_DIR,
  collectMappedSourceFiles,
  compareViewerAssets,
  checkArchitectureMap,
  isSourceCommitStale,
  latestCommitTouchingFiles,
  resolveMapDir,
  discoverPilotMaps,
  PILOT_SLUG_TO_REPO,
} from '../check-staleness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function sh(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error('git ' + args.join(' ') + ' failed: ' + (r.stderr || r.stdout));
  }
  return String(r.stdout || '').trim();
}

function makeGitRepo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'arch08-'));
  sh(root, ['init']);
  sh(root, ['config', 'user.email', 'arch08@test.local']);
  sh(root, ['config', 'user.name', 'ARCH08 Test']);
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  }
  sh(root, ['add', '.']);
  sh(root, ['commit', '-m', 'init']);
  return root;
}

function copySharedViewer(mapDir) {
  fs.mkdirSync(mapDir, { recursive: true });
  for (const name of VIEWER_ASSETS) {
    fs.copyFileSync(path.join(SHARED_VIEWER_DIR, name), path.join(mapDir, name));
  }
}

test('collectMappedSourceFiles de-dupes node files', () => {
  const files = collectMappedSourceFiles({
    nodes: [
      { file: 'js/a.js' },
      { file: './js/a.js' },
      { file: '.' },
      { file: 'js/b.js' },
      { file: null },
      { file: '/assets/x.js' },
    ],
  });
  assert.deepEqual(files, ['js/a.js', 'js/b.js']);
});

test('compareViewerAssets detects match and drift', () => {
  const mapDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arch08-viewer-'));
  copySharedViewer(mapDir);
  const ok = compareViewerAssets({ mapDir });
  assert.equal(ok.ok, true);
  assert.equal(ok.checks.length, 3);

  fs.writeFileSync(path.join(mapDir, 'viewer.js'), '// drifted\n');
  const bad = compareViewerAssets({ mapDir });
  assert.equal(bad.ok, false);
  assert.ok(bad.checks.some((c) => c.file === 'viewer.js' && c.reason === 'viewer_drift'));
});

test('resolveMapDir prefers SoulCap architecture/ when present', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'arch08-soul-'));
  const soulRoot = path.join(root, 'SoulCap');
  fs.mkdirSync(path.join(soulRoot, 'architecture'), { recursive: true });
  fs.writeFileSync(path.join(soulRoot, 'architecture', 'architecture-data.json'), '{}\n');
  assert.equal(resolveMapDir(soulRoot), path.join(soulRoot, 'architecture'));
});

test('fresh map: sourceCommit == latest mapped commit → pass', () => {
  const root = makeGitRepo({
    'js/app.js': 'export const x = 1;\n',
    'index.html': '<html></html>\n',
  });
  const sha = sh(root, ['rev-parse', 'HEAD']);
  const mapDir = path.join(root, 'docs', 'architecture');
  copySharedViewer(mapDir);
  const doc = {
    app: 'Fx',
    sourceCommit: sha,
    analyzerVersion: '1.3.0',
    nodes: [{ type: 'file', name: 'app.js', file: 'js/app.js', layer: 'logic' }],
  };
  fs.writeFileSync(path.join(mapDir, 'architecture-data.json'), JSON.stringify(doc) + '\n');

  const r = checkArchitectureMap({ root, mapDir });
  assert.equal(r.ok, true, JSON.stringify(r.freshness));
  assert.equal(r.viewer.ok, true);
  assert.equal(r.freshness.stale, false);
});

test('stale map: commit after sourceCommit touching mapped file → fail', () => {
  const root = makeGitRepo({
    'js/app.js': 'export const x = 1;\n',
  });
  const first = sh(root, ['rev-parse', 'HEAD']);
  fs.writeFileSync(path.join(root, 'js/app.js'), 'export const x = 2;\n');
  sh(root, ['add', 'js/app.js']);
  sh(root, ['commit', '-m', 'change source']);
  const latest = sh(root, ['rev-parse', 'HEAD']);
  assert.notEqual(first, latest);

  const mapDir = path.join(root, 'docs', 'architecture');
  copySharedViewer(mapDir);
  const doc = {
    app: 'Fx',
    sourceCommit: first,
    nodes: [{ file: 'js/app.js' }],
  };
  fs.writeFileSync(path.join(mapDir, 'architecture-data.json'), JSON.stringify(doc) + '\n');

  const r = checkArchitectureMap({ root, mapDir });
  assert.equal(r.ok, false);
  assert.equal(r.freshness.stale, true);
  assert.ok(r.freshness.commitsBehind >= 1);
  assert.equal(r.freshness.latestSourceCommit, latest);
});

test('isSourceCommitStale: equal commits not stale', () => {
  const root = makeGitRepo({ 'a.js': '1\n' });
  const sha = sh(root, ['rev-parse', 'HEAD']);
  const r = isSourceCommitStale(root, sha, sha);
  assert.equal(r.ok, true);
  assert.equal(r.stale, false);
});

test('latestCommitTouchingFiles ignores missing paths', () => {
  const root = makeGitRepo({ 'keep.js': '1\n' });
  const r = latestCommitTouchingFiles(root, ['keep.js', 'gone.js']);
  assert.equal(r.ok, true);
  assert.ok(r.sha);
});

test('viewer drift alone fails even when freshness skipped', () => {
  const root = makeGitRepo({ 'js/app.js': '1\n' });
  const sha = sh(root, ['rev-parse', 'HEAD']);
  const mapDir = path.join(root, 'docs', 'architecture');
  copySharedViewer(mapDir);
  fs.writeFileSync(path.join(mapDir, 'index.html'), '<!-- old -->\n');
  fs.writeFileSync(
    path.join(mapDir, 'architecture-data.json'),
    JSON.stringify({ sourceCommit: sha, nodes: [{ file: 'js/app.js' }] }) + '\n'
  );
  const r = checkArchitectureMap({ root, mapDir, skipFreshness: true });
  assert.equal(r.ok, false);
  assert.ok(r.errors.includes('viewer_out_of_sync'));
});

test('PILOT_SLUG_TO_REPO covers fleet pilots', () => {
  assert.equal(PILOT_SLUG_TO_REPO.pulse, 'PulseCap');
  assert.equal(PILOT_SLUG_TO_REPO.soul, 'SoulCap');
  assert.equal(PILOT_SLUG_TO_REPO.hub, 'shamikhahmed.github.io');
  assert.equal(PILOT_SLUG_TO_REPO.lab, 'capricorn-lab');
});

test('discoverPilotMaps finds tooling pilots when present', () => {
  const archDir = path.resolve(HERE, '../../../qa/architecture');
  assert.ok(fs.existsSync(archDir), 'qa/architecture should exist in tooling');
  const maps = discoverPilotMaps(archDir);
  // Large architecture-data.* may be gitignored; API must still return valid entries when present
  for (const m of maps) {
    assert.ok(m.slug);
    assert.ok(fs.existsSync(m.dataPath));
  }
});
