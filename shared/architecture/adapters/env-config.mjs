/** SPEC §3 env-config — env var names only; values never stored */

import { extractEnv } from '../core/extract/env.mjs';

export const id = 'env-config';
export const stackIds = ['env-config'];
export const description = 'Env key names from .env* (keys only) and process.env / import.meta.env refs';
export const always = true;

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  extractEnv(root, graph, config);
}
