/** SPEC §3 es-modules — imports/exports, JSX, hooks, storage, fetch, Dexie */

import { extractEsModules } from '../core/extract/es-modules.mjs';

export const id = 'es-modules';
export const stackIds = ['es-modules'];
export const description =
  'ES modules / React: imports, exports, JSX RENDERS, storage, fetch hosts, Dexie stores';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  extractEsModules(root, graph, config);
}
