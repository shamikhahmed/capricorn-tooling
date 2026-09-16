/** Service worker extractor — SPEC §3 service-worker */

import fs from 'node:fs';
import path from 'node:path';
import { listFiles, lineAt, readText } from '../fs-util.mjs';
import { makeEvidence } from '../evidence.mjs';
import { EDGE_STATUS } from '../constants.mjs';
import { nodeId } from '../ids.mjs';

/**
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function extractServiceWorker(root, graph) {
  const files = listFiles(root, { extensions: ['.js', '.mjs'], maxFiles: 500 }).filter(function (f) {
    const base = path.basename(f.rel);
    return base === 'sw.js' || base === 'service-worker.js' || /service.?worker/i.test(f.rel);
  });

  for (const f of files) {
    const text = readText(f.abs);
    const worker = graph.addNode({
      type: 'worker',
      name: path.basename(f.rel),
      file: f.rel,
      layer: 'service',
    });

    // CACHE name
    const cacheRe = /(?:const|var|let)\s+CACHE\s*=\s*['"]([^'"]+)['"]/;
    const cm = text.match(cacheRe);
    if (cm) {
      graph.addNode({
        type: 'storage',
        name: cm[1],
        file: f.rel,
        line: lineAt(text, cm.index),
        meta: { kind: 'cache' },
      });
      graph.storage.push({
        kind: 'CacheAPI',
        key: cm[1],
        keyPattern: false,
        readers: [worker.id],
        writers: [worker.id],
      });
    }

    // Precache lists: cache.addAll([...]) or arrays of URL strings near precache
    const urlRe = /['"](\.?\.?\/?[\w./-]+\.(?:js|css|html|png|svg|json|webp|woff2?))['"]/g;
    let m;
    const seen = new Set();
    while ((m = urlRe.exec(text))) {
      const relUrl = m[1].replace(/^\.\//, '');
      if (seen.has(relUrl)) continue;
      seen.add(relUrl);
      // Only treat as precache if inside addAll or ASSETS/PRECACHE array context
      const window = text.slice(Math.max(0, m.index - 80), m.index + 40);
      if (!/addAll|PRECACHE|ASSETS|urlsToCache|precache/i.test(window) && !/cache\.(add|put)/i.test(window)) {
        continue;
      }
      const line = lineAt(text, m.index);
      const abs = path.join(root, relUrl);
      const exists = fs.existsSync(abs);
      const fileNode = graph.addNode({
        type: 'file',
        name: path.basename(relUrl),
        file: relUrl,
        flags: exists ? [] : [],
      });
      graph.addEdge({
        from: worker.id,
        to: fileNode.id,
        type: 'CACHES',
        status: exists ? EDGE_STATUS.VERIFIED : EDGE_STATUS.BROKEN,
        evidence: [makeEvidence(f.rel, line, m[0])],
        label: relUrl,
      });
      if (!exists) {
        graph.addFinding({
          id: 'F-SW-' + relUrl,
          kind: 'BROKEN',
          severity: 'warn',
          nodes: [worker.id, fileNode.id],
          explanation: 'Service worker precache entry missing from build: ' + relUrl,
          evidence: [makeEvidence(f.rel, line, m[0])],
        });
      }
    }

    if (/skipWaiting/.test(text)) {
      graph.addEdge({
        from: worker.id,
        to: worker.id,
        type: 'TRIGGERS',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, lineAt(text, text.indexOf('skipWaiting')), 'skipWaiting')],
        label: 'skipWaiting',
      });
    }
  }
}
