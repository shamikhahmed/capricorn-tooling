/**
 * SPEC §3 routes-react — react-router, Next app dir, React Navigation.
 * Split from es-modules so route tree is owned by this adapter.
 */

import { listFiles, lineAt, readText } from '../core/fs-util.mjs';

export const id = 'routes-react';
export const stackIds = ['routes-react'];
export const description =
  'Route tree: react-router <Route>, Next app/**/page, React Navigation Stack.Screen';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  const files = listFiles(root, {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    maxFiles: 4000,
  });

  for (const f of files) {
    let text;
    try {
      text = readText(f.abs);
    } catch {
      continue;
    }
    extractRoutesFromFile(f, text, graph);
  }
}

/**
 * @param {{ rel: string }} f
 * @param {string} text
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
export function extractRoutesFromFile(f, text, graph) {
  const routeRe = /<Route\b[^>]*\bpath=["']([^"']+)["'][^>]*>/g;
  let m;
  while ((m = routeRe.exec(text))) {
    const line = lineAt(text, m.index);
    graph.addNode({ type: 'route', name: m[1], file: f.rel, line, layer: 'screen' });
  }

  const screenRe = /<Stack\.Screen\b[^>]*\bname=["']([^"']+)["'][^>]*>/g;
  while ((m = screenRe.exec(text))) {
    const line = lineAt(text, m.index);
    graph.addNode({ type: 'screen', name: m[1], file: f.rel, line });
    graph.addNode({ type: 'route', name: m[1], file: f.rel, line });
  }

  const rel = f.rel.replace(/\\/g, '/');
  if (/^app\/.*page\.(t|j)sx?$/.test(rel) || rel === 'app/page.tsx' || rel === 'app/page.jsx') {
    const routePath = '/' + rel
      .replace(/^app/, '')
      .replace(/\/page\.(t|j)sx?$/, '')
      .replace(/\/\([^)]+\)/g, '')
      .replace(/\\/g, '/') || '/';
    graph.addNode({ type: 'route', name: routePath, file: f.rel, layer: 'screen' });
    graph.addNode({ type: 'screen', name: routePath, file: f.rel });
  }
}
