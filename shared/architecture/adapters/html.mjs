/** SPEC §3 html — entry HTML, manifest, CSP */

import { extractHtml } from '../core/extract/html.mjs';

export const id = 'html';
export const stackIds = ['html'];
export const description = 'Entry HTML, manifest link, CSP connect-src hosts';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  extractHtml(root, graph, config);
}
