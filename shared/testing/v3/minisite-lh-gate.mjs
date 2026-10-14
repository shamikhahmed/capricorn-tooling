/**
 * G19 — mini-site Lighthouse (§8.3 / §10.4).
 * N/A (warn) when mini-site missing; fail when present without/failing LH.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const LH_DIRS = [
  'qa/perfection/minisite/lighthouse',
  'qa/finish-loop/lighthouse-minisite',
  'qa/finish-loop/minisite-lighthouse',
];

function appSlug(root, ver, pkg) {
  const raw = ver?.minisiteSlug || ver?.hubSlug || ver?.slug || ver?.app || pkg?.name || path.basename(root);
  // Hub mini-sites live at /apps/<catalog-slug>/ (lowercase, e.g. pulsecap not PulseCap).
  return String(raw)
    .replace(/^@.*\//, '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .toLowerCase();
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function scorePct(n) {
  if (n == null) return null;
  return n <= 1 ? n * 100 : n;
}

function evaluateLhJson(j, label) {
  if (!j) return { ok: false, detail: `${label}: invalid JSON` };
  if (/tier1-evidence-stub/i.test(String(j.userAgent || '')) || /n\/a/i.test(String(j.lighthouseVersion || ''))) {
    return { ok: false, detail: `${label}: stub / placeholder` };
  }
  const cats = j.categories || {};
  const perf = scorePct(cats.performance?.score);
  const a11y = scorePct(cats.accessibility?.score);
  const bp = scorePct(cats['best-practices']?.score ?? cats.bestPractices?.score);
  const seo = scorePct(cats.seo?.score);
  if (perf == null || a11y == null || bp == null) {
    return { ok: false, detail: `${label}: null category scores` };
  }
  const gate = perf >= 95 && a11y >= 95 && bp >= 95 && (seo == null || seo >= 95);
  return {
    ok: gate,
    detail: `${label}: perf ${perf.toFixed(0)} a11y ${a11y.toFixed(0)} bp ${bp.toFixed(0)}${seo != null ? ` seo ${seo.toFixed(0)}` : ''}`,
  };
}

function liveMinisiteStatus(slug) {
  const url = `https://shamikhahmed.github.io/apps/${slug}/`;
  try {
    const code = execSync(`curl -sS -o /dev/null -w "%{http_code}" --max-time 12 ${JSON.stringify(url)}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return { url, code };
  } catch (e) {
    return { url, code: 'unreachable', error: e.message };
  }
}

function collectLhFiles(root) {
  const files = [];
  for (const d of LH_DIRS) {
    const abs = path.join(root, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (f.endsWith('.json') && !f.includes('.report.')) files.push(path.join(abs, f));
    }
  }
  const legacy = path.join(root, 'qa', 'finish-loop', 'lighthouse');
  if (fs.existsSync(legacy)) {
    for (const f of fs.readdirSync(legacy)) {
      if (/minisite|mini-site|apps-/i.test(f) && f.endsWith('.json')) files.push(path.join(legacy, f));
    }
  }
  return files;
}

export function checkMinisiteLhGate(root) {
  const ver = readJson(path.join(root, 'VERSION.json')) || {};
  const pkg = readJson(path.join(root, 'package.json')) || {};
  const slug = appSlug(root, ver, pkg);
  const files = collectLhFiles(root);

  if (files.length) {
    const results = files.map((f) => evaluateLhJson(readJson(f), path.relative(root, f)));
    const bad = results.filter((r) => !r.ok);
    if (bad.length) {
      return { ok: false, id: 'g19:minisite-lh', detail: bad.map((b) => b.detail).join('; ') };
    }
    return { ok: true, id: 'g19:minisite-lh', detail: results.map((r) => r.detail).join('; ') };
  }

  if (process.env.TIER1_SKIP_LIVE_MINISITE === '1') {
    return {
      ok: true,
      na: true,
      id: 'g19:minisite-lh',
      detail: 'N/A — no local mini-site LH JSON; live probe skipped (TIER1_SKIP_LIVE_MINISITE=1)',
    };
  }

  const live = liveMinisiteStatus(slug);
  if (live.code === '200') {
    return {
      ok: false,
      id: 'g19:minisite-lh',
      detail: `mini-site live at ${live.url} but no LH JSON under ${LH_DIRS.join(' | ')} — run Lighthouse and save evidence`,
    };
  }
  if (live.code === '404' || live.code === '000' || live.code === 'unreachable') {
    return {
      ok: true,
      na: true,
      id: 'g19:minisite-lh',
      detail: `N/A — mini-site not present (${live.url} → ${live.code})`,
    };
  }
  return {
    ok: true,
    na: true,
    id: 'g19:minisite-lh',
    detail: `N/A — mini-site probe ${live.url} → ${live.code}; no local LH JSON`,
  };
}
