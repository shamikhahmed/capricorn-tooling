/**
 * Architecture adapters registry — SPEC §3 / ARCH-03.
 * Core detects stacks; matching adapters emit nodes/edges with evidence.
 */

import * as vanillaGlobals from './vanilla-globals.mjs';
import * as html from './html.mjs';
import * as serviceWorker from './service-worker.mjs';
import * as esModules from './es-modules.mjs';
import * as routesReact from './routes-react.mjs';
import * as envConfig from './env-config.mjs';
import * as cloudflareWorker from './cloudflare-worker.mjs';
import * as nestPrisma from './nest-prisma.mjs';
import * as dartFlutter from './dart-flutter.mjs';
import * as backendPresence from './backend-presence.mjs';

/** @type {Array<{ id: string, stackIds: string[], description?: string, always?: boolean, extract: Function }>} */
export const ADAPTERS = [
  html,
  vanillaGlobals,
  esModules,
  routesReact,
  serviceWorker,
  envConfig,
  cloudflareWorker,
  nestPrisma,
  dartFlutter,
  backendPresence,
];

/**
 * @returns {string[]}
 */
export function listAdapterIds() {
  return ADAPTERS.map(function (a) { return a.id; });
}

/**
 * Run every adapter whose stackIds intersect detected stacks (or always=true).
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {string[]} stacks
 * @param {object} [config]
 * @returns {string[]} adapter ids that ran
 */
export function runAdapters(root, graph, stacks, config) {
  const set = new Set(stacks || []);
  const ran = [];

  for (const adapter of ADAPTERS) {
    const match =
      adapter.always === true ||
      (adapter.stackIds || []).some(function (id) { return set.has(id); });
    if (!match) continue;
    adapter.extract(root, graph, config || {});
    ran.push(adapter.id);
  }

  graph.adaptersRun = ran.slice();
  return ran;
}
