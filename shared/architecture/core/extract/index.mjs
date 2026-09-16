/** Run all extractors for detected stacks */

import { extractEnv } from './env.mjs';
import { extractVanilla } from './vanilla.mjs';
import { extractHtml } from './html.mjs';
import { extractServiceWorker } from './service-worker.mjs';
import { extractEsModules } from './es-modules.mjs';
import { extractNestPrisma } from './nest-prisma.mjs';
import { extractDartFlutter } from './dart.mjs';

/**
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @param {string[]} stacks
 * @param {object} [config]
 */
export function runExtractors(root, graph, stacks, config) {
  const set = new Set(stacks);

  if (set.has('html')) extractHtml(root, graph);
  if (set.has('vanilla-globals')) extractVanilla(root, graph, config);
  if (set.has('es-modules') || set.has('routes-react')) extractEsModules(root, graph);
  if (set.has('service-worker')) extractServiceWorker(root, graph);
  if (set.has('env-config')) extractEnv(root, graph);
  if (set.has('nest-prisma')) extractNestPrisma(root, graph);
  if (set.has('dart-flutter')) {
    const r = extractDartFlutter(root, graph);
    if (r.skippedAnalyzer) graph.noteUnresolved(r.skippedAnalyzer);
  }

  // Always run env if any .env present even when stack list odd
  if (!set.has('env-config')) extractEnv(root, graph);
}
