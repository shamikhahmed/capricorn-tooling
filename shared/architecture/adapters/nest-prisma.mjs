/** SPEC §3 nest-prisma */

import { extractNestPrisma } from '../core/extract/nest-prisma.mjs';

export const id = 'nest-prisma';
export const stackIds = ['nest-prisma'];
export const description = 'Prisma models/fields and NestJS @Controller/@Get|Post endpoints';

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  extractNestPrisma(root, graph, config);
}
