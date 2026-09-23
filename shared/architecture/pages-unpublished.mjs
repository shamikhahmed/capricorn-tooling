/**
 * ARCH-06 — architecture maps must never be served on GitHub Pages (C-57).
 * Pure URL matrix + response classification (no network). Live curl is
 * scripts/verify-architecture-unpublished.mjs.
 */

/** Primary Pages hosts for Cap fleet (personal + org). */
export const PAGES_HOSTS = [
  'https://shamikhahmed.github.io',
  'https://cap-apps.github.io',
];

/**
 * Apps with a public Pages path under /<slug>/.
 * SoulCap Pages artifact root is docs/, so maps live at repo-root architecture/
 * and the leak URL is /SoulCap/architecture/ (i.e. docs/architecture/ if wrongly placed).
 * Hub root uses slug null → /docs/architecture/.
 */
export const PAGES_APPS = [
  { slug: 'AuraCap', mapDir: 'docs/architecture' },
  { slug: 'CarCap', mapDir: 'docs/architecture' },
  { slug: 'CookCap', mapDir: 'docs/architecture' },
  { slug: 'DeeFoodieApp', mapDir: 'docs/architecture' },
  { slug: 'DeePonyCap', mapDir: 'docs/architecture' },
  { slug: 'IdeaCap', mapDir: 'docs/architecture' },
  { slug: 'LedgerCap', mapDir: 'docs/architecture' },
  { slug: 'MasteryCap', mapDir: 'docs/architecture' },
  { slug: 'PrismCap', mapDir: 'docs/architecture' },
  { slug: 'PulseCap', mapDir: 'docs/architecture' },
  { slug: 'ScentCap', mapDir: 'docs/architecture' },
  { slug: 'SoulCap', mapDir: 'architecture' },
  { slug: 'SteadyCap', mapDir: 'docs/architecture' },
  { slug: 'TravelCap', mapDir: 'docs/architecture' },
  { slug: 'VaultCap', mapDir: 'docs/architecture' },
  { slug: null, mapDir: 'docs/architecture', label: 'hub' },
];

/** High-signal map artifacts (index is the SPEC/ARCH-06 requirement). */
export const MAP_ARTIFACTS = [
  'index.html',
  'architecture-data.json',
  'architecture-data.js',
];

/** HTTP statuses that mean "not published" for this gate. */
export const UNPUBLISHED_STATUSES = new Set([404, 410]);

/**
 * @returns {{ url: string, host: string, app: string, path: string }[]}
 */
export function buildUnpublishedUrlMatrix(opts = {}) {
  const hosts = opts.hosts || PAGES_HOSTS;
  const apps = opts.apps || PAGES_APPS;
  const artifacts = opts.artifacts || MAP_ARTIFACTS;
  const out = [];

  for (const host of hosts) {
    const base = String(host).replace(/\/$/, '');
    for (const app of apps) {
      const label = app.label || app.slug || 'hub';
      const prefix = app.slug ? `/${app.slug}` : '';
      for (const file of artifacts) {
        const path = `${prefix}/${app.mapDir}/${file}`.replace(/\/+/g, '/');
        out.push({
          url: `${base}${path}`,
          host: base,
          app: label,
          path,
        });
      }
    }
  }
  return out;
}

/**
 * Classify a live fetch result.
 * @param {{ status: number, bodySnippet?: string }} res
 * @returns {{ ok: boolean, reason: string }}
 */
export function classifyUnpublishedResponse(res) {
  const status = Number(res && res.status);
  if (!Number.isFinite(status) || status <= 0) {
    return { ok: false, reason: 'unreachable_or_invalid_status' };
  }
  if (UNPUBLISHED_STATUSES.has(status)) {
    return { ok: true, reason: `http_${status}` };
  }
  const snippet = String((res && res.bodySnippet) || '');
  if (/window\.ARCH_DATA|architecture-data\.js|"analyzerVersion"/i.test(snippet)) {
    return { ok: false, reason: `http_${status}_architecture_payload` };
  }
  return { ok: false, reason: `http_${status}_expected_404` };
}
