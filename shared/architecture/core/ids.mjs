/** Stable node/edge IDs — SPEC §2: <type>:<file>#<symbol> */

/**
 * @param {string} file
 * @returns {string}
 */
export function normalizePath(file) {
  if (!file) return '';
  return String(file).replace(/\\/g, '/').replace(/^\.\//, '');
}

/**
 * @param {string} type
 * @param {string} file
 * @param {string} [symbol]
 * @returns {string}
 */
export function nodeId(type, file, symbol) {
  const f = normalizePath(file);
  if (symbol == null || symbol === '') return type + ':' + f;
  return type + ':' + f + '#' + symbol;
}

/**
 * Deterministic edge id from endpoints + type (+ optional label disambiguator).
 * @param {string} from
 * @param {string} to
 * @param {string} type
 * @param {string} [label]
 * @returns {string}
 */
export function edgeId(from, to, type, label) {
  const base = 'e:' + type + ':' + from + '->' + to;
  if (label == null || label === '') return base;
  return base + ':' + String(label).replace(/\s+/g, '_').slice(0, 64);
}
