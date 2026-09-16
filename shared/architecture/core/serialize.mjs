/** Deterministic JSON helpers — only generatedAt may differ across runs */

/**
 * Recursively sort object keys; sort arrays of objects with `id` by id.
 * @param {unknown} value
 * @returns {unknown}
 */
export function canonicalize(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const mapped = value.map(canonicalize);
    if (mapped.length && mapped.every(function (x) {
      return x && typeof x === 'object' && !Array.isArray(x) && typeof x.id === 'string';
    })) {
      return mapped.slice().sort(function (a, b) {
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      });
    }
    if (mapped.length && mapped.every(function (x) { return typeof x === 'string'; })) {
      return mapped.slice().sort();
    }
    return mapped;
  }
  const keys = Object.keys(value).sort();
  const out = {};
  for (const k of keys) out[k] = canonicalize(value[k]);
  return out;
}

/**
 * Stable JSON string (sorted keys). Does not include a trailing newline.
 * @param {unknown} value
 * @returns {string}
 */
export function stableStringify(value) {
  return JSON.stringify(canonicalize(value), null, 2);
}

/**
 * Strip generatedAt for equality comparison.
 * @param {object} doc
 * @returns {object}
 */
export function withoutGeneratedAt(doc) {
  const copy = JSON.parse(JSON.stringify(doc));
  delete copy.generatedAt;
  return canonicalize(copy);
}
