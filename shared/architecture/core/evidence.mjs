/** Evidence helpers — SPEC §0.3, §0.8 (secrets never stored) */

const MAX_SNIPPET = 120;

/** Patterns that look like secret assignments — value side redacted. */
const SECRET_ASSIGN = /(api[_-]?key|secret|password|token|passwd|private[_-]?key)\s*[=:]\s*['"`]?[^\s'"`]+['"`]?/gi;
const LONG_HEX = /\b[0-9a-fA-F]{32,}\b/g;
const JWTISH = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

/**
 * Redact secret-looking material from a snippet. Never invent content.
 * @param {string} text
 * @returns {string}
 */
export function redactSecrets(text) {
  if (!text) return '';
  let s = String(text);
  s = s.replace(SECRET_ASSIGN, function (m) {
    const eq = m.search(/[=:]/);
    return m.slice(0, eq + 1) + ' [REDACTED]';
  });
  s = s.replace(LONG_HEX, '[REDACTED_HEX]');
  s = s.replace(JWTISH, '[REDACTED_JWT]');
  return s;
}

/**
 * @param {string} text
 * @param {number} [max]
 * @returns {string}
 */
export function truncateSnippet(text, max) {
  const limit = max == null ? MAX_SNIPPET : max;
  const s = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
  if (s.length <= limit) return s;
  return s.slice(0, limit - 1) + '…';
}

/**
 * @param {string} file
 * @param {number} line
 * @param {string} snippet
 * @returns {{ file: string, line: number, snippet: string }}
 */
export function makeEvidence(file, line, snippet) {
  return {
    file: String(file || '').replace(/\\/g, '/'),
    line: Number(line) || 0,
    snippet: truncateSnippet(redactSecrets(snippet)),
  };
}

/**
 * Assert a string (e.g. serialized JSON) never contains a forbidden value.
 * @param {string} haystack
 * @param {string} secret
 * @returns {boolean}
 */
export function containsSecret(haystack, secret) {
  if (!secret) return false;
  return String(haystack).indexOf(secret) !== -1;
}
