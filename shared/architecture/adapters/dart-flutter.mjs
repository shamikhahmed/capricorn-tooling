/** SPEC §3 dart-flutter — arch_dump when available; regex fallback always */

import { extractDartFlutter } from '../core/extract/dart.mjs';

export const id = 'dart-flutter';
export const stackIds = ['dart-flutter'];
export const description = 'Flutter widgets/routes via analyzer dump or regex INFERRED fallback';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  const r = extractDartFlutter(root, graph, config);
  if (r && r.skippedAnalyzer) graph.noteUnresolved(r.skippedAnalyzer);
}
