/** HTML + CSP extraction — SPEC §3 html */

import path from 'node:path';
import { listFiles, lineAt, readText } from '../fs-util.mjs';
import { makeEvidence } from '../evidence.mjs';
import { EDGE_STATUS } from '../constants.mjs';
import { nodeId } from '../ids.mjs';

/**
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function extractHtml(root, graph) {
  const files = listFiles(root, { extensions: ['.html', '.htm'], maxFiles: 100 });
  for (const f of files) {
    const text = readText(f.abs);
    graph.addNode({ type: 'entry', name: path.basename(f.rel), file: f.rel, layer: 'app' });
    graph.addNode({ type: 'file', name: path.basename(f.rel), file: f.rel });

    // CSP connect-src
    const cspRe = /Content-Security-Policy[^>]*content=["']([^"']+)["']/i;
    const httpEquiv = /http-equiv=["']Content-Security-Policy["'][^>]*content=["']([^"']+)["']/i;
    const meta = text.match(cspRe) || text.match(httpEquiv);
    if (meta) {
      const csp = meta[1];
      const connect = /connect-src\s+([^;]+)/i.exec(csp);
      if (connect) {
        const hosts = connect[1].split(/\s+/).filter(function (h) {
          return h && h !== "'self'" && h !== '*' && !h.startsWith("'");
        });
        for (const h of hosts) {
          const host = h.replace(/^https?:\/\//, '').split('/')[0];
          if (!graph.network.some(function (n) { return n.host === host; })) {
            graph.network.push({ host, paths: [], consumers: [], inCSP: true, inPrivacyPage: false });
          }
        }
      }
    }

    // Manifest
    const man = /rel=["']manifest["'][^>]*href=["']([^"']+)["']/i.exec(text)
      || /href=["']([^"']+)["'][^>]*rel=["']manifest["']/i.exec(text);
    if (man) {
      graph.addNode({ type: 'config', name: 'manifest', file: man[1], layer: 'config' });
      graph.addEdge({
        from: nodeId('entry', f.rel, path.basename(f.rel)),
        to: nodeId('config', man[1], 'manifest'),
        type: 'LOADS',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, lineAt(text, man.index), man[0].slice(0, 100))],
      });
    }
  }
}
