/** SPEC §3 service-worker */

import { extractServiceWorker } from '../core/extract/service-worker.mjs';

export const id = 'service-worker';
export const stackIds = ['service-worker'];
export const description = 'Cache names, precache lists, fetch strategies';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  extractServiceWorker(root, graph, config);
}
