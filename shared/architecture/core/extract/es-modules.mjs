/**
 * ES module / React light extractor using TypeScript compiler API when available.
 * ARCH-01: imports, exports, JSX component tags, fetch hosts, localStorage keys.
 */

import path from 'node:path';
import { createRequire } from 'node:module';
import { listFiles, lineAt, readText } from '../fs-util.mjs';
import { makeEvidence } from '../evidence.mjs';
import { EDGE_STATUS } from '../constants.mjs';
import { nodeId } from '../ids.mjs';

const require = createRequire(import.meta.url);

let ts = null;
try {
  ts = require('typescript');
} catch {
  ts = null;
}

/**
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function extractEsModules(root, graph) {
  const files = listFiles(root, {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    maxFiles: 4000,
  }).filter(function (f) {
    return !f.rel.includes('sw.js') && !f.rel.endsWith('service-worker.js');
  });

  for (const f of files) {
    let text;
    try {
      text = readText(f.abs);
    } catch {
      continue;
    }
    // Skip classic scripts without import/export unless tsx/jsx
    if (!/\.(tsx|jsx)$/.test(f.rel) && !/^\s*import\s/m.test(text) && !/^\s*export\s/m.test(text)) {
      continue;
    }
    graph.addNode({ type: 'file', name: path.basename(f.rel), file: f.rel });

    if (ts) {
      extractWithTs(root, f, text, graph);
    } else {
      extractWithRegex(f, text, graph);
    }

    extractStorageAndFetch(f, text, graph);
    extractRoutes(f, text, graph);
    extractDexie(f, text, graph);
  }
}

function extractWithTs(root, f, text, graph) {
  const kind = f.rel.endsWith('.tsx') || f.rel.endsWith('.jsx')
    ? ts.ScriptKind.TSX
    : f.rel.endsWith('.ts')
      ? ts.ScriptKind.TS
      : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(f.rel, text, ts.ScriptTarget.Latest, true, kind);

  function visit(node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      const targetRel = resolveImport(f.rel, spec);
      const to = graph.addNode({
        type: 'file',
        name: path.basename(targetRel || spec),
        file: targetRel || spec,
      });
      graph.addEdge({
        from: nodeId('file', f.rel),
        to: to.id,
        type: 'IMPORTS',
        status: targetRel ? EDGE_STATUS.VERIFIED : EDGE_STATUS.INFERRED,
        evidence: [makeEvidence(f.rel, line, text.slice(node.getStart(sf), node.getEnd()).slice(0, 100))],
        label: spec,
      });
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      const body = node.body ? node.body.getText(sf) : '';
      graph.addNode({
        type: name[0] === name[0].toUpperCase() && name.length > 1 ? 'component' : 'function',
        name,
        file: f.rel,
        line,
        meta: {
          exported: !!(node.modifiers && node.modifiers.some(function (m) {
            return m.kind === ts.SyntaxKind.ExportKeyword;
          })),
          body,
        },
      });
    }

    if (ts.isVariableStatement(node)) {
      for (const dec of node.declarationList.declarations) {
        if (ts.isIdentifier(dec.name) && dec.initializer && (
          ts.isArrowFunction(dec.initializer) || ts.isFunctionExpression(dec.initializer)
        )) {
          const name = dec.name.text;
          const line = sf.getLineAndCharacterOfPosition(dec.getStart(sf)).line + 1;
          const isComp = name[0] === name[0].toUpperCase();
          graph.addNode({
            type: isComp ? 'component' : 'function',
            name,
            file: f.rel,
            line,
            meta: {
              exported: !!(node.modifiers && node.modifiers.some(function (m) {
                return m.kind === ts.SyntaxKind.ExportKeyword;
              })),
              body: dec.initializer.getText(sf),
            },
          });
        }
      }
    }

    // JSX: <Foo
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName;
      if (ts.isIdentifier(tag) && tag.text[0] === tag.text[0].toUpperCase()) {
        const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
        const comp = graph.addNode({ type: 'component', name: tag.text, file: f.rel, line });
        graph.addEdge({
          from: nodeId('file', f.rel),
          to: comp.id,
          type: 'RENDERS',
          status: EDGE_STATUS.INFERRED,
          evidence: [makeEvidence(f.rel, line, '<' + tag.text)],
        });
      }
    }

    ts.forEachChild(node, visit);
  }
  visit(sf);
  void root;
}

function extractWithRegex(f, text, graph) {
  const importRe = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRe.exec(text))) {
    const line = lineAt(text, m.index);
    const targetRel = resolveImport(f.rel, m[1]);
    const to = graph.addNode({
      type: 'file',
      name: path.basename(targetRel || m[1]),
      file: targetRel || m[1],
    });
    graph.addEdge({
      from: nodeId('file', f.rel),
      to: to.id,
      type: 'IMPORTS',
      status: EDGE_STATUS.INFERRED,
      evidence: [makeEvidence(f.rel, line, m[0].slice(0, 100))],
      label: m[1],
    });
  }
  const fnRe = /(?:export\s+)?function\s+([A-Za-z_$][\w$]*)/g;
  while ((m = fnRe.exec(text))) {
    graph.addNode({
      type: 'function',
      name: m[1],
      file: f.rel,
      line: lineAt(text, m.index),
      meta: { exported: /^export/.test(m[0]), body: '' },
    });
  }
}

function extractStorageAndFetch(f, text, graph) {
  const lsRe = /(?:localStorage|sessionStorage|AsyncStorage)\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = lsRe.exec(text))) {
    const key = m[1];
    const line = lineAt(text, m.index);
    const isWrite = /\.setItem\(/.test(m[0]);
    const node = graph.addNode({ type: 'storage', name: key, file: f.rel, line });
    let rec = graph.storage.find(function (s) { return s.key === key; });
    if (!rec) {
      rec = {
        kind: /AsyncStorage/.test(m[0]) ? 'AsyncStorage' : /sessionStorage/.test(m[0]) ? 'sessionStorage' : 'localStorage',
        key,
        keyPattern: false,
        readers: [],
        writers: [],
      };
      graph.storage.push(rec);
    }
    const fileId = nodeId('file', f.rel);
    if (isWrite) {
      if (rec.writers.indexOf(fileId) === -1) rec.writers.push(fileId);
      graph.addEdge({
        from: fileId,
        to: node.id,
        type: 'WRITES',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, line, m[0])],
      });
    } else {
      if (rec.readers.indexOf(fileId) === -1) rec.readers.push(fileId);
      graph.addEdge({
        from: fileId,
        to: node.id,
        type: 'READS',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, line, m[0])],
      });
    }
  }

  const fetchRe = /fetch\s*\(\s*['"](https?:\/\/[^'"]+|\/[^'"]*)['"]/g;
  while ((m = fetchRe.exec(text))) {
    const url = m[1];
    const line = lineAt(text, m.index);
    let host = url;
    if (url.startsWith('http')) {
      try {
        host = new URL(url).host;
      } catch {
        host = url;
      }
    } else {
      host = '(same-origin)';
    }
    let net = graph.network.find(function (n) { return n.host === host; });
    if (!net) {
      net = { host, paths: [], consumers: [], inCSP: false, inPrivacyPage: false };
      graph.network.push(net);
    }
    if (net.paths.indexOf(url) === -1) net.paths.push(url);
    const fileId = nodeId('file', f.rel);
    if (net.consumers.indexOf(fileId) === -1) net.consumers.push(fileId);
    const ext = graph.addNode({ type: 'external', name: host, file: f.rel, line });
    graph.addEdge({
      from: fileId,
      to: ext.id,
      type: 'FETCHES_FROM',
      status: EDGE_STATUS.VERIFIED,
      evidence: [makeEvidence(f.rel, line, m[0].slice(0, 100))],
      label: url,
    });
  }
}

function extractRoutes(f, text, graph) {
  // react-router <Route path="..."
  const routeRe = /<Route\b[^>]*\bpath=["']([^"']+)["'][^>]*>/g;
  let m;
  while ((m = routeRe.exec(text))) {
    const line = lineAt(text, m.index);
    graph.addNode({ type: 'route', name: m[1], file: f.rel, line, layer: 'screen' });
  }
  // React Navigation Stack.Screen name=
  const screenRe = /<Stack\.Screen\b[^>]*\bname=["']([^"']+)["'][^>]*>/g;
  while ((m = screenRe.exec(text))) {
    const line = lineAt(text, m.index);
    graph.addNode({ type: 'screen', name: m[1], file: f.rel, line });
    graph.addNode({ type: 'route', name: m[1], file: f.rel, line });
  }
  // Next app dir: file path app/**/page.tsx
  if (/^app\/.*page\.(t|j)sx?$/.test(f.rel) || f.rel === 'app/page.tsx' || f.rel === 'app/page.jsx') {
    const routePath = '/' + f.rel
      .replace(/^app/, '')
      .replace(/\/page\.(t|j)sx?$/, '')
      .replace(/\/\([^)]+\)/g, '') // route groups
      .replace(/\\/g, '/') || '/';
    graph.addNode({ type: 'route', name: routePath, file: f.rel, layer: 'screen' });
    graph.addNode({ type: 'screen', name: routePath, file: f.rel });
  }
}

function extractDexie(f, text, graph) {
  const storesRe = /\.stores\s*\(\s*\{([^}]+)\}/g;
  let m;
  while ((m = storesRe.exec(text))) {
    const line = lineAt(text, m.index);
    graph.database.engine = graph.database.engine || 'indexeddb';
    const body = m[1];
    const entryRe = /([A-Za-z_$][\w$]*)\s*:/g;
    let e;
    while ((e = entryRe.exec(body))) {
      const table = e[1];
      graph.addNode({ type: 'table', name: table, file: f.rel, line });
      if (!graph.database.tables.some(function (t) { return t.name === table; })) {
        graph.database.tables.push({
          name: table,
          columns: [],
          pk: [],
          fks: [],
          indexes: [],
          readers: [],
          writers: [nodeId('file', f.rel)],
        });
      }
    }
    graph.addEdge({
      from: nodeId('file', f.rel),
      to: nodeId('table', f.rel, body.match(/[A-Za-z_$][\w$]*/)[0]),
      type: 'STORES_IN',
      status: EDGE_STATUS.VERIFIED,
      evidence: [makeEvidence(f.rel, line, m[0].slice(0, 100))],
    });
  }
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const dir = path.posix.dirname(fromFile.replace(/\\/g, '/'));
  let resolved = path.posix.normalize(dir + '/' + spec);
  return resolved.replace(/^\.\//, '');
}
