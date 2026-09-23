/**
 * SPEC §3 routes-react — react-router, Next app dir, React Navigation.
 * Split from es-modules so route tree is owned by this adapter.
 */

import { listFiles, lineAt, readText } from '../core/fs-util.mjs';
import { makeEvidence } from '../core/evidence.mjs';
import { EDGE_STATUS } from '../core/constants.mjs';
import { nodeId } from '../core/ids.mjs';

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
  void config;
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
    extractNavigationsFromFile(f, text, graph);
  }

  linkRoutesToComponents(graph);
}

/**
 * @param {{ rel: string }} f
 * @param {string} text
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
export function extractRoutesFromFile(f, text, graph) {
  // Path attribute on <Route>; do not span across sibling Route tags.
  // element={<Comp} may contain `>`, so capture element from a short window after path=.
  const routeRe = /<Route\b[^>]*\bpath=["']([^"']+)["']/g;
  let m;
  while ((m = routeRe.exec(text))) {
    const routePath = m[1];
    const line = lineAt(text, m.index);
    const window = text.slice(m.index, Math.min(text.length, m.index + 220));
    const elM = /\belement=\{\s*<([A-Za-z_$][\w$.]*)/.exec(window);
    const elementComp = elM ? elM[1] : null;
    const route = graph.addNode({
      id: 'route:' + routePath,
      type: 'route',
      name: routePath,
      file: f.rel,
      line,
      layer: 'screen',
      meta: elementComp ? { element: elementComp } : {},
    });
    if (elementComp) {
      const target = resolveComponentTarget(graph, elementComp, f.rel);
      graph.addEdge({
        from: route.id,
        to: target,
        type: 'ROUTES_TO',
        status: graph.hasNode(target) ? EDGE_STATUS.VERIFIED : EDGE_STATUS.INFERRED,
        evidence: [makeEvidence(f.rel, line, '<Route path="' + routePath + '" element={' + elementComp + '}')],
        label: routePath + '→' + elementComp,
      });
    }
  }

  const screenRe = /<Stack\.Screen\b[^>]*\bname=["']([^'"]+)["'][^>]*>/g;
  while ((m = screenRe.exec(text))) {
    const line = lineAt(text, m.index);
    graph.addNode({ type: 'screen', name: m[1], file: f.rel, line });
    graph.addNode({ id: 'route:' + m[1], type: 'route', name: m[1], file: f.rel, line });
  }

  const rel = f.rel.replace(/\\/g, '/');
  if (/^app\/.*page\.(t|j)sx?$/.test(rel) || rel === 'app/page.tsx' || rel === 'app/page.jsx') {
    const routePath = '/' + rel
      .replace(/^app/, '')
      .replace(/\/page\.(t|j)sx?$/, '')
      .replace(/\/\([^)]+\)/g, '')
      .replace(/\\/g, '/') || '/';
    graph.addNode({ id: 'route:' + routePath, type: 'route', name: routePath, file: f.rel, layer: 'screen' });
    graph.addNode({ type: 'screen', name: routePath, file: f.rel });
  }
}

/**
 * Link / navigate / NavLink targets → NAVIGATES_TO route nodes.
 * @param {{ rel: string }} f
 * @param {string} text
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
export function extractNavigationsFromFile(f, text, graph) {
  const patterns = [
    /\bnavigate\(\s*["']([^"']+)["']/g,
    /\bto=["']([^"']+)["']/g,
    /<Navigate\b[^>]*\bto=["']([^"']+)["']/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      const targetPath = m[1];
      // Skip template-ish / relative non-routes
      if (!targetPath || targetPath.startsWith('http') || targetPath.startsWith('#')) continue;
      const line = lineAt(text, m.index);
      const route = graph.addNode({
        id: 'route:' + normalizeRoutePath(targetPath),
        type: 'route',
        name: normalizeRoutePath(targetPath),
        file: f.rel,
        line,
        layer: 'screen',
      });
      graph.addEdge({
        from: nodeId('file', f.rel),
        to: route.id,
        type: 'NAVIGATES_TO',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, line, m[0].slice(0, 80))],
        label: targetPath,
      });
    }
  }
}

/**
 * Second pass: if route.meta.element exists but ROUTES_TO pointed at a weak target, upgrade.
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
function linkRoutesToComponents(graph) {
  for (const n of graph.nodes.values()) {
    if (n.type !== 'route' || !n.meta || !n.meta.element) continue;
    const preferred = resolveComponentTarget(graph, n.meta.element, n.file);
    // Ensure edge exists (idempotent via edge id)
    graph.addEdge({
      from: n.id,
      to: preferred,
      type: 'ROUTES_TO',
      status: graph.hasNode(preferred) ? EDGE_STATUS.VERIFIED : EDGE_STATUS.INFERRED,
      evidence: [makeEvidence(n.file, n.line || 1, 'element={' + n.meta.element + '}')],
      label: n.name + '→' + n.meta.element,
    });
  }
}

/**
 * Prefer component:pages/X.tsx#Name over JSX usage site in App.tsx.
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {string} name
 * @param {string} fallbackFile
 * @returns {string}
 */
function resolveComponentTarget(graph, name, fallbackFile) {
  const bare = String(name).split('.').pop();
  let best = null;
  for (const n of graph.nodes.values()) {
    if (n.name !== bare) continue;
    if (n.type !== 'component' && n.type !== 'function') continue;
    const score =
      (n.type === 'component' ? 2 : 0) +
      (/\/pages\//.test(n.file) ? 4 : 0) +
      (/\/screens\//.test(n.file) ? 4 : 0) +
      (n.file !== fallbackFile ? 1 : 0);
    if (!best || score > best.score) best = { id: n.id, score };
  }
  if (best) return best.id;
  return nodeId('component', fallbackFile, bare);
}

function normalizeRoutePath(p) {
  // Drop query/hash; keep :params as-is
  return String(p).split('?')[0].split('#')[0] || '/';
}
