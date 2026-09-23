/**
 * Cap static / classic-script adapter (SoulCap, PulseCap, VaultCap, …).
 * SPEC §3 vanilla-globals.
 */

import { extractVanilla } from '../core/extract/vanilla.mjs';

export const id = 'vanilla-globals';
export const stackIds = ['vanilla-globals'];
export const description =
  'Classic script apps: HTML script order, globals, string dispatch, el()/innerHTML display';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  extractVanilla(root, graph, config);
}
