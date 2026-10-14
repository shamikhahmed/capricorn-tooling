/**
 * G16 — device-qa thresholds (§8.2 / §8.3).
 * Expects device-qa.mjs JSON (array or { runs, summary }).
 */
import fs from 'node:fs';
import path from 'node:path';

export const DEVICE_QA_CANDIDATES = [
  'qa/perfection/device/device-qa.json',
  'qa/perfection/baseline/device-qa.json',
  'qa/finish-loop/device-qa.json',
  'qa/finish-loop/device/device-qa.json',
];

export function summarizeDeviceQa(payload) {
  const runs = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.runs)
      ? payload.runs
      : [];
  if (payload?.summary && typeof payload.summary === 'object' && !Array.isArray(payload)) {
    const s = payload.summary;
    return {
      runs: runs.length || Number(s.runs || 0),
      hardFailures: Number(s.hardFailures ?? s.hard ?? 0),
      tapUnder32: Number(s.tapUnder32 ?? s.smallTargets ?? 0),
      textUnder11: Number(s.textUnder11 ?? s.tinyText ?? 0),
      pageErrors: Number(s.pageErrors ?? 0),
      hubOriginConsoleErrors: Number(s.hubOriginConsoleErrors ?? s.hubConsoleErrors ?? 0),
      fromEmbeddedSummary: true,
    };
  }
  let hardFailures = 0;
  let tapUnder32 = 0;
  let textUnder11 = 0;
  let pageErrors = 0;
  let hubOriginConsoleErrors = 0;
  for (const r of runs) {
    if (Array.isArray(r.bad) && r.bad.length) hardFailures += 1;
    else if (r.hard === true || (Array.isArray(r.failures) && r.failures.length)) hardFailures += 1;
    tapUnder32 += Number(r.smallCount ?? r.tapUnder32 ?? (r.smallTargets?.length ?? 0));
    textUnder11 += Number(r.tinyCount ?? r.textUnder11 ?? 0);
    const errs = Array.isArray(r.errors) ? r.errors : [];
    pageErrors += errs.filter((e) => String(e).startsWith('pageerror')).length;
    if (typeof r.hubOriginConsoleErrors === 'number') {
      hubOriginConsoleErrors += r.hubOriginConsoleErrors;
    } else if (Array.isArray(r.hubOriginErrors)) {
      hubOriginConsoleErrors += r.hubOriginErrors.length;
    } else {
      hubOriginConsoleErrors += errs.filter((e) => !String(e).startsWith('pageerror')).length;
    }
  }
  return {
    runs: runs.length,
    hardFailures,
    tapUnder32,
    textUnder11,
    pageErrors,
    hubOriginConsoleErrors,
    fromEmbeddedSummary: false,
  };
}

export function checkDeviceQaGate(root) {
  const hit = DEVICE_QA_CANDIDATES.map((p) => path.join(root, p)).find((p) => fs.existsSync(p));
  if (!hit) {
    return {
      ok: false,
      missing: true,
      id: 'g16:device-qa',
      detail: `missing device-qa.json (looked in ${DEVICE_QA_CANDIDATES.join(', ')})`,
    };
  }
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(hit, 'utf8'));
  } catch (e) {
    return { ok: false, id: 'g16:device-qa', detail: `invalid JSON ${path.relative(root, hit)}: ${e.message}` };
  }
  const summary = summarizeDeviceQa(payload);
  if (summary.runs === 0) {
    return { ok: false, id: 'g16:device-qa', detail: `${path.relative(root, hit)} has 0 runs` };
  }
  const violations = [];
  if (summary.hardFailures !== 0) violations.push(`hardFailures=${summary.hardFailures}`);
  if (summary.tapUnder32 !== 0) violations.push(`tap<32px=${summary.tapUnder32}`);
  if (summary.textUnder11 !== 0) violations.push(`text<11px=${summary.textUnder11}`);
  if (summary.pageErrors !== 0) violations.push(`pageErrors=${summary.pageErrors}`);
  if (summary.hubOriginConsoleErrors !== 0) {
    violations.push(`hubOriginConsoleErrors=${summary.hubOriginConsoleErrors}`);
  }
  const rel = path.relative(root, hit);
  if (violations.length) {
    return {
      ok: false,
      id: 'g16:device-qa',
      detail: `${rel}: ${violations.join(', ')} (${summary.runs} runs)`,
      summary,
    };
  }
  return {
    ok: true,
    id: 'g16:device-qa',
    detail: `${rel}: 0 hard / tap / text / page / hub-console (${summary.runs} runs)`,
    summary,
  };
}
