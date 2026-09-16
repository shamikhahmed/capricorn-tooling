/**
 * Normalized body fingerprints for duplication detection — SPEC §4.3.
 * Identifiers renamed to stable slots; literals bucketed; similarity ≥ 0.85 over ≥ 6 stmts.
 */

/**
 * @param {string} body
 * @returns {{ tokens: string[], stmtCount: number }}
 */
export function fingerprintBody(body) {
  const text = String(body || '');
  // Strip comments
  let s = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
  // String / number literals → buckets
  s = s.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, ' STR ');
  s = s.replace(/\b\d+(\.\d+)?\b/g, ' NUM ');
  // Tokenize
  const raw = s.match(/[A-Za-z_$][\w$]*|[{}()\[\];,]|[=+\-*/<>!&|]+/g) || [];
  const idMap = new Map();
  let idSeq = 0;
  const keywords = new Set([
    'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new',
    'this', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'import', 'export',
    'default', 'from', 'async', 'await', 'yield', 'true', 'false', 'null', 'undefined',
  ]);
  const tokens = raw.map(function (t) {
    if (keywords.has(t) || t === 'STR' || t === 'NUM') return t;
    if (/^[A-Za-z_$]/.test(t)) {
      if (!idMap.has(t)) idMap.set(t, 'ID' + idSeq++);
      return idMap.get(t);
    }
    return t;
  });
  const stmtCount = (text.match(/;/g) || []).length + (text.match(/\n/g) || []).length / 2;
  return { tokens, stmtCount: Math.max(Math.floor(stmtCount), tokens.length > 20 ? 6 : Math.floor(tokens.length / 4)) };
}

/**
 * Jaccard similarity over token multisets (as sets of token+index buckets for order-light compare).
 * @param {{ tokens: string[] }} a
 * @param {{ tokens: string[] }} b
 * @returns {number}
 */
export function similarity(a, b) {
  const ta = a.tokens || [];
  const tb = b.tokens || [];
  if (!ta.length || !tb.length) return 0;
  const ca = countMap(ta);
  const cb = countMap(tb);
  let inter = 0;
  let union = 0;
  const keys = new Set([...ca.keys(), ...cb.keys()]);
  for (const k of keys) {
    const x = ca.get(k) || 0;
    const y = cb.get(k) || 0;
    inter += Math.min(x, y);
    union += Math.max(x, y);
  }
  return union === 0 ? 0 : inter / union;
}

function countMap(tokens) {
  const m = new Map();
  for (const t of tokens) m.set(t, (m.get(t) || 0) + 1);
  return m;
}
