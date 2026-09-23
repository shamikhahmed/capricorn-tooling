/**
 * SPEC §3 cloudflare-worker — LedgerCap/VaultCap worker/.
 * Binding names from wrangler.toml only; never secret values.
 */

import fs from 'node:fs';
import path from 'node:path';
import { listFiles, lineAt, readText } from '../core/fs-util.mjs';
import { makeEvidence } from '../core/evidence.mjs';
import { EDGE_STATUS } from '../core/constants.mjs';
import { nodeId } from '../core/ids.mjs';

export const id = 'cloudflare-worker';
export const stackIds = ['cloudflare-worker'];
export const description =
  'Worker routes, upstream fetch hosts, wrangler KV/R2/Secrets binding names (never values)';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  parseWrangler(root, graph);
  parseWorkerScripts(root, graph);
}

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
function parseWrangler(root, graph) {
  const rel = 'wrangler.toml';
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return;

  let text;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    return;
  }

  graph.addNode({ type: 'config', name: 'wrangler.toml', file: rel, layer: 'config' });

  const nameM = /^\s*name\s*=\s*["']([^"']+)["']/m.exec(text);
  if (nameM) {
    graph.addNode({
      type: 'worker',
      name: nameM[1],
      file: rel,
      line: lineAt(text, nameM.index),
      layer: 'service',
      meta: { kind: 'cloudflare' },
    });
  }

  // binding = "NAME" — KV, R2, D1, queues, etc. Names only.
  const bindingRe = /\bbinding\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = bindingRe.exec(text))) {
    const binding = m[1];
    const line = lineAt(text, m.index);
    const node = graph.addNode({
      type: 'storage',
      name: binding,
      file: rel,
      line,
      layer: 'data',
      meta: { kind: 'cf-binding' },
    });
    graph.storage.push({
      kind: 'cf-binding',
      key: binding,
      keyPattern: false,
      readers: [],
      writers: [],
    });
    graph.addEdge({
      from: nodeId('config', rel, 'wrangler.toml'),
      to: node.id,
      type: 'CONFIG',
      status: EDGE_STATUS.VERIFIED,
      evidence: [makeEvidence(rel, line, m[0])],
      label: 'binding (name only)',
    });
  }

  // [vars] KEY = "…" — record KEY names only; do not store values
  const varsBlock = /\[vars\]([\s\S]*?)(?=\n\[|\n\[\[|$)/.exec(text);
  if (varsBlock) {
    const body = varsBlock[1];
    const keyRe = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/gm;
    let km;
    while ((km = keyRe.exec(body))) {
      const key = km[1];
      const absIdx = varsBlock.index + km.index;
      const line = lineAt(text, absIdx);
      graph.addNode({
        type: 'env',
        name: key,
        file: rel,
        line,
        layer: 'config',
        flags: [],
        meta: { source: 'wrangler.vars', valueNeverRead: true },
      });
      if (!graph.env.some(function (e) { return e.name === key; })) {
        graph.env.push({
          name: key,
          definedIn: [rel + ' [vars] (key only)'],
          referencedBy: [],
          clientExposed: false,
          looksSecret: /secret|key|token|password|credential/i.test(key),
        });
      }
    }
  }
}

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
function parseWorkerScripts(root, graph) {
  const files = listFiles(root, { extensions: ['.js', '.mjs', '.ts'], maxFiles: 500 }).filter(function (f) {
    const rel = f.rel.replace(/\\/g, '/');
    return (
      rel.startsWith('worker/') ||
      rel.startsWith('src/worker/') ||
      /\.worker\.(js|mjs|ts)$/.test(rel) ||
      path.basename(rel) === 'worker.js' ||
      path.basename(rel) === 'index.js' && (rel.startsWith('worker/') || rel.includes('/worker/'))
    );
  });

  // Also accept top-level worker.js next to wrangler
  const top = path.join(root, 'worker.js');
  if (fs.existsSync(top) && !files.some(function (f) { return f.rel === 'worker.js'; })) {
    files.push({ abs: top, rel: 'worker.js' });
  }

  for (const f of files) {
    let text;
    try {
      text = readText(f.abs);
    } catch {
      continue;
    }

    const worker = graph.addNode({
      type: 'worker',
      name: path.basename(f.rel),
      file: f.rel,
      layer: 'service',
      meta: { kind: 'cloudflare' },
    });

    // fetch("https://…") upstream
    const fetchRe = /fetch\s*\(\s*['"](https?:\/\/[^'"]+)['"]/g;
    let m;
    while ((m = fetchRe.exec(text))) {
      const url = m[1];
      const line = lineAt(text, m.index);
      let host = url;
      try {
        host = new URL(url).host;
      } catch { /* keep */ }
      let net = graph.network.find(function (n) { return n.host === host; });
      if (!net) {
        net = { host: host, paths: [], consumers: [], inCSP: false, inPrivacyPage: false };
        graph.network.push(net);
      }
      if (net.paths.indexOf(url) === -1) net.paths.push(url);
      if (net.consumers.indexOf(worker.id) === -1) net.consumers.push(worker.id);
      const ext = graph.addNode({ type: 'external', name: host, file: f.rel, line });
      graph.addEdge({
        from: worker.id,
        to: ext.id,
        type: 'FETCHES_FROM',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, line, m[0].slice(0, 100))],
        label: url,
      });
    }

    // pathname / url.pathname === '/api/…' style routes
    const pathRe = /(?:pathname|url\.pathname)\s*(?:===|==)\s*['"]([^'"]+)['"]/g;
    while ((m = pathRe.exec(text))) {
      const routePath = m[1];
      const line = lineAt(text, m.index);
      const route = graph.addNode({
        type: 'api-endpoint',
        name: 'WORKER ' + routePath,
        file: f.rel,
        line,
        layer: 'service',
      });
      graph.addEdge({
        from: worker.id,
        to: route.id,
        type: 'ROUTES_TO',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, line, m[0].slice(0, 100))],
        label: routePath,
      });
    }
  }
}
