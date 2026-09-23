/**
 * Vanilla classic-script extractor — SPEC §3 vanilla-globals (ARCH-01 minimal).
 * Script order from HTML, top-level functions, string dispatch, calls.
 */

import fs from 'node:fs';
import path from 'node:path';
import { listFiles, lineAt, readText } from '../fs-util.mjs';
import { makeEvidence } from '../evidence.mjs';
import { EDGE_STATUS } from '../constants.mjs';
import { nodeId } from '../ids.mjs';

/**
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extractVanilla(root, graph, config) {
  const htmlFiles = listFiles(root, { extensions: ['.html', '.htm'], maxFiles: 50 });
  const scriptOrder = [];

  for (const hf of htmlFiles) {
    const text = readText(hf.abs);
    graph.addNode({ type: 'file', name: path.basename(hf.rel), file: hf.rel, layer: 'app' });
    graph.addNode({ type: 'entry', name: path.basename(hf.rel), file: hf.rel, layer: 'app' });

    const scriptRe = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = scriptRe.exec(text))) {
      const src = m[1].replace(/^\.\//, '');
      scriptOrder.push(src);
      const line = lineAt(text, m.index);
      const fileNode = graph.addNode({ type: 'file', name: path.basename(src), file: src, layer: 'logic' });
      graph.addEdge({
        from: nodeId('entry', hf.rel, path.basename(hf.rel)),
        to: fileNode.id,
        type: 'LOADS',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(hf.rel, line, m[0].slice(0, 100))],
      });
    }

    // Inline onclick / data-act
    const actRe = /data-act=["']([^"']+)["']/gi;
    while ((m = actRe.exec(text))) {
      const act = m[1];
      const line = lineAt(text, m.index);
      const ev = graph.addNode({
        type: 'event',
        name: act,
        file: hf.rel,
        line,
        layer: 'event',
      });
      // Will wire to dispatcher / handler below
      graph.addEdge({
        from: nodeId('entry', hf.rel, path.basename(hf.rel)),
        to: ev.id,
        type: 'TRIGGERS',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(hf.rel, line, m[0])],
        label: act,
      });
    }
  }

  const jsFiles = listFiles(root, { extensions: ['.js', '.mjs'], maxFiles: 2000 }).filter(function (f) {
    // Prefer classic scripts; still parse modules lightly
    return !f.rel.includes('node_modules');
  });

  /** @type {Map<string, { id: string, file: string, line: number, body: string }>} */
  const globals = new Map();

  for (const jf of jsFiles) {
    let text;
    try {
      text = readText(jf.abs);
    } catch {
      continue;
    }
    graph.addNode({ type: 'file', name: path.basename(jf.rel), file: jf.rel });

    // function name(...) { ... }
    const fnRe = /function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g;
    let m;
    while ((m = fnRe.exec(text))) {
      const name = m[1];
      const line = lineAt(text, m.index);
      const body = extractBalanced(text, m.index + m[0].length - 1);
      const node = graph.addNode({
        type: 'function',
        name,
        file: jf.rel,
        line,
        endLine: lineAt(text, m.index + m[0].length + body.length),
        layer: 'logic',
        meta: { exported: true, body },
      });
      globals.set(name, { id: node.id, file: jf.rel, line, body });
    }

    // window.X = function
    const winRe = /window\.([A-Za-z_$][\w$]*)\s*=\s*function/g;
    while ((m = winRe.exec(text))) {
      const name = m[1];
      const line = lineAt(text, m.index);
      const node = graph.addNode({
        type: 'function',
        name,
        file: jf.rel,
        line,
        meta: { exported: true, body: '' },
      });
      globals.set(name, { id: node.id, file: jf.rel, line, body: '' });
    }
  }

  // Second pass: calls + string dispatch
  const dispatchPatterns = (config && config.dispatchPatterns) || [
    { type: 'data-act', dispatcher: 'handleAct' },
  ];

  for (const jf of jsFiles) {
    let text;
    try {
      text = readText(jf.abs);
    } catch {
      continue;
    }
    const fileNodeId = nodeId('file', jf.rel);

    // Direct calls: foo(
    for (const [name, g] of globals) {
      const callRe = new RegExp('\\b' + escapeRe(name) + '\\s*\\(', 'g');
      let m;
      while ((m = callRe.exec(text))) {
        // Skip the definition itself
        const line = lineAt(text, m.index);
        const around = text.slice(Math.max(0, m.index - 20), m.index);
        if (/function\s*$/.test(around)) continue;
        // Find enclosing function if any
        const caller = enclosingFunction(text, m.index, jf.rel, globals);
        const from = caller || fileNodeId;
        if (from === g.id) continue;
        graph.addEdge({
          from,
          to: g.id,
          type: 'CALLS',
          status: EDGE_STATUS.VERIFIED,
          evidence: [makeEvidence(jf.rel, line, m[0] + '…')],
        });
      }
    }

    // String dispatch: handleAct('name') or handlers[act] / if (act === 'x') handlers
    for (const pat of dispatchPatterns) {
      if (pat.type === 'reg-go') {
        extractRegGo(jf, text, graph, globals, pat);
        continue;
      }
      if (pat.type === 'data-act' || pat.dispatcher) {
        const disp = pat.dispatcher || 'handleAct';
        // map of act -> handler name:  case 'x': return foo(  OR  'x': foo
        const caseRe = /(?:case\s+['"]([^'"]+)['"]\s*:|['"]([^'"]+)['"]\s*:\s*)\s*([A-Za-z_$][\w$]*)/g;
        let m;
        while ((m = caseRe.exec(text))) {
          const act = m[1] || m[2];
          const handler = m[3];
          if (!isLiteralScreenId(act)) continue;
          if (!/^[A-Za-z_$][\w$]*$/.test(handler || '')) continue;
          const line = lineAt(text, m.index);
          const evId = nodeId('event', jf.rel, act);
          graph.addNode({ type: 'event', name: act, file: jf.rel, line });
          const target = globals.get(handler);
          if (target) {
            graph.addEdge({
              from: evId,
              to: target.id,
              type: 'HANDLES',
              status: EDGE_STATUS.INFERRED,
              evidence: [makeEvidence(jf.rel, line, m[0])],
              label: act + '→' + handler,
            });
          } else {
            // Handler name referenced but undefined → BROKEN target placeholder
            const missingId = nodeId('function', jf.rel, handler);
            // Do NOT create the node — leave edge broken
            graph.addEdge({
              from: evId,
              to: missingId,
              type: 'HANDLES',
              status: EDGE_STATUS.BROKEN,
              evidence: [makeEvidence(jf.rel, line, m[0])],
              label: act + '→' + handler + ' (undefined)',
            });
          }
        }

        // handleAct / dispatch registry function
        if (globals.has(disp)) {
          graph.addNode({ type: 'function', name: disp, file: jf.rel });
        }
      }
    }

    // PulseCap-style lazy module map: MODULE_SRC = { 'screen': 'js/modules/….js' }
    extractModuleSrc(jf, text, graph, config);

    // Hardcoded dashboard numbers: textContent/innerHTML/el(..., '42') style
    const hardRe = /(?:textContent|innerHTML)\s*=\s*['"](\d{1,6})['"]/g;
    let hm;
    while ((hm = hardRe.exec(text))) {
      const line = lineAt(text, hm.index);
      const caller = enclosingFunction(text, hm.index, jf.rel, globals);
      const node = graph.addNode({
        type: 'function',
        name: caller ? caller.split('#').pop() : path.basename(jf.rel),
        file: jf.rel,
        line,
        meta: {
          hardcodedDisplay: hm[1],
          hardcodedSnippet: hm[0],
        },
      });
      graph.traces.display.push({
        screen: 'dashboard',
        element: 'value',
        shown: hm[1],
        source: 'HARDCODED',
        path: [node.id],
        evidence: [makeEvidence(jf.rel, line, hm[0])],
      });
    }
  }

  // Wire HTML data-act events to handlers discovered in JS
  for (const n of graph.nodes.values()) {
    if (n.type !== 'event') continue;
    // If no HANDLES edge yet, look for global with same name
    let hasHandle = false;
    for (const e of graph.edges.values()) {
      if (e.from === n.id && e.type === 'HANDLES') hasHandle = true;
    }
    if (hasHandle) continue;
    const g = globals.get(n.name);
    if (g) {
      graph.addEdge({
        from: n.id,
        to: g.id,
        type: 'HANDLES',
        status: EDGE_STATUS.INFERRED,
        evidence: [makeEvidence(n.file, n.line || 1, 'data-act=' + n.name)],
      });
    } else {
      const missingId = nodeId('function', n.file, n.name);
      graph.addEdge({
        from: n.id,
        to: missingId,
        type: 'HANDLES',
        status: EDGE_STATUS.BROKEN,
        evidence: [makeEvidence(n.file, n.line || 1, 'data-act=' + n.name + ' (no handler)')],
      });
    }
  }

  void scriptOrder;
  void fs;
}

/**
 * PulseCap-style screen registry: reg('screen', fn) + go('screen').
 * @param {{ rel: string }} jf
 * @param {string} text
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @param {Map<string, { id: string }>} globals
 * @param {{ register?: string, navigate?: string }} pat
 */
function extractRegGo(jf, text, graph, globals, pat) {
  const register = pat.register || 'reg';
  const navigate = pat.navigate || 'go';

  const regRe = new RegExp(
    '\\b' + escapeRe(register) + '\\s*\\(\\s*[\'"]([^\'"]+)[\'"]',
    'g'
  );
  let m;
  while ((m = regRe.exec(text))) {
    const id = m[1];
    if (!isLiteralScreenId(id)) continue;
    const line = lineAt(text, m.index);
    const screen = graph.addNode({
      id: 'screen:' + id,
      type: 'screen',
      name: id,
      file: jf.rel,
      line,
      layer: 'screen',
    });
    const caller = enclosingFunction(text, m.index, jf.rel, globals);
    // Registration itself is structural evidence from the file
    graph.addEdge({
      from: caller || nodeId('file', jf.rel),
      to: screen.id,
      type: 'ROUTES_TO',
      status: EDGE_STATUS.VERIFIED,
      evidence: [makeEvidence(jf.rel, line, m[0] + '…')],
      label: register + '(' + id + ')',
    });
  }

  const goRe = new RegExp(
    '\\b' + escapeRe(navigate) + '\\s*\\(\\s*[\'"]([^\'"]+)[\'"]',
    'g'
  );
  while ((m = goRe.exec(text))) {
    const id = m[1];
    if (!isLiteralScreenId(id)) continue;
    const line = lineAt(text, m.index);
    const screen = graph.addNode({
      id: 'screen:' + id,
      type: 'screen',
      name: id,
      file: jf.rel,
      line,
      layer: 'screen',
    });
    const caller = enclosingFunction(text, m.index, jf.rel, globals);
    graph.addEdge({
      from: caller || nodeId('file', jf.rel),
      to: screen.id,
      type: 'NAVIGATES_TO',
      status: EDGE_STATUS.VERIFIED,
      evidence: [makeEvidence(jf.rel, line, m[0] + '…')],
      label: navigate + '(' + id + ')',
    });
  }
}

/** Reject string-concat false positives like console.error('go(' + id + ')'). */
function isLiteralScreenId(id) {
  return typeof id === 'string' && /^[A-Za-z][A-Za-z0-9_-]*$/.test(id);
}

/**
 * @param {{ rel: string }} jf
 * @param {string} text
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
function extractModuleSrc(jf, text, graph, config) {
  const mapNames = [];
  if (config && config.lazyModuleMap) mapNames.push(config.lazyModuleMap);
  // PulseCap evolved MODULE_SRC={} filled from MODULE_CHAIN — prefer both.
  for (const fallback of ['MODULE_CHAIN', 'MODULE_SRC']) {
    if (!mapNames.includes(fallback)) mapNames.push(fallback);
  }

  const arrayConsts = Object.create(null);
  const arrConstRe = /(?:const|var|let)\s+([A-Za-z_$][\w$]*)\s*=\s*\[([^\]]*)\]/g;
  let am;
  while ((am = arrConstRe.exec(text))) {
    arrayConsts[am[1]] = extractStringLiterals(am[2]);
  }

  for (const mapName of mapNames) {
    const mapRe = new RegExp(
      '(?:const|var|let|window\\.)\\s*' + escapeRe(mapName) + '\\s*=\\s*\\{',
      'm'
    );
    const mm = mapRe.exec(text);
    if (!mm) continue;
    const openIdx = mm.index + mm[0].length - 1;
    const body = extractBalanced(text, openIdx);
    if (!body || !body.trim()) continue;

    // 'screen': 'path.js'  OR  'screen': ['a.js', 'b.js']  OR  screen: OTHER_CONST
    const pairRe =
      /(?:['"]([^'"]+)['"]|([A-Za-z_$][\w$]*))\s*:\s*(?:['"]([^'"]+)['"]|\[([^\]]*)\]|([A-Za-z_$][\w$]*))/g;
    let m;
    while ((m = pairRe.exec(body))) {
      const screenId = m[1] || m[2];
      if (!isLiteralScreenId(screenId)) continue;
      let srcs = [];
      if (m[3]) srcs = [m[3]];
      else if (m[4] != null) srcs = extractStringLiterals(m[4]);
      else if (m[5] && arrayConsts[m[5]]) srcs = arrayConsts[m[5]].slice();
      if (!srcs.length) continue;

      const line = lineAt(text, openIdx + m.index);
      const screen = graph.addNode({
        id: 'screen:' + screenId,
        type: 'screen',
        name: screenId,
        file: jf.rel,
        line,
        layer: 'screen',
      });
      for (const raw of srcs) {
        const src = String(raw).replace(/^\.\//, '');
        const fileNode = graph.addNode({
          type: 'file',
          name: path.basename(src),
          file: src,
          layer: 'logic',
        });
        graph.addEdge({
          from: screen.id,
          to: fileNode.id,
          type: 'LOADS',
          status: EDGE_STATUS.VERIFIED,
          evidence: [makeEvidence(jf.rel, line, mapName + '[' + screenId + ']→' + src)],
          label: 'lazy ' + screenId,
        });
      }
    }
  }
}

function extractStringLiterals(chunk) {
  const out = [];
  const re = /['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(chunk))) out.push(m[1]);
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractBalanced(text, openBraceIndex) {
  // openBraceIndex points at '{'
  let depth = 0;
  for (let i = openBraceIndex; i < text.length; i++) {
    const c = text[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return text.slice(openBraceIndex + 1, i);
    }
  }
  return text.slice(openBraceIndex + 1, openBraceIndex + 400);
}

function enclosingFunction(text, index, file, globals) {
  let best = null;
  let bestPos = -1;
  const fnRe = /function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g;
  let m;
  while ((m = fnRe.exec(text))) {
    if (m.index > index) break;
    const bodyStart = m.index + m[0].length - 1;
    const body = extractBalanced(text, bodyStart);
    const end = bodyStart + body.length + 1;
    if (index >= bodyStart && index <= end && m.index >= bestPos) {
      bestPos = m.index;
      const g = globals.get(m[1]);
      best = g ? g.id : nodeId('function', file, m[1]);
    }
  }
  return best;
}
