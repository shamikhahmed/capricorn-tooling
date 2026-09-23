/** Architecture analyzer constants — SPEC §2 */

export const ANALYZER_VERSION = '1.2.0';
export const SCHEMA_VERSION = 1;

export const NODE_TYPES = Object.freeze([
  'app', 'entry', 'config', 'route', 'screen', 'layout', 'component', 'primitive',
  'event', 'function', 'hook', 'class', 'logic', 'validator', 'state', 'store',
  'context', 'service', 'worker', 'api-endpoint', 'external', 'auth', 'database',
  'table', 'column', 'storage', 'static-data', 'env', 'file', 'dependency',
]);

export const EDGE_TYPES = Object.freeze([
  'IMPORTS', 'EXPORTS', 'LOADS', 'RENDERS', 'CALLS', 'USES', 'HANDLES', 'TRIGGERS',
  'ROUTES_TO', 'NAVIGATES_TO', 'READS', 'WRITES', 'UPDATES', 'DERIVES_FROM', 'STATE',
  'PERSISTS_TO', 'STORES_IN', 'CACHES', 'FETCHES_FROM', 'QUERIES', 'MUTATES',
  'AUTHENTICATES_THROUGH', 'AUTHORIZES', 'EXTERNAL', 'CONFIG', 'ENV', 'DEPENDS_ON',
]);

export const EDGE_STATUS = Object.freeze({
  VERIFIED: 'VERIFIED',
  INFERRED: 'INFERRED',
  UNKNOWN: 'UNKNOWN',
  BROKEN: 'BROKEN',
});

export const NODE_FLAGS = Object.freeze({
  ORPHANED: 'ORPHANED',
  UNUSED: 'UNUSED',
  DEAD: 'DEAD',
  DUPLICATED: 'DUPLICATED',
  SUSPICIOUS: 'SUSPICIOUS',
  HARDCODED: 'HARDCODED',
  MOCK: 'MOCK',
  DEMO: 'DEMO',
  SECURITY: 'SECURITY',
});

export const LAYERS = Object.freeze([
  'app', 'screen', 'component', 'event', 'logic', 'state',
  'service', 'data-access', 'data', 'external', 'config',
]);

export const FINDING_KINDS = Object.freeze([
  'ORPHAN', 'UNUSED', 'DEAD', 'DUPLICATE', 'SUSPICIOUS', 'HARDCODED',
  'MOCK', 'DEMO', 'BROKEN', 'SECURITY', 'UNKNOWN', 'INCOMPLETE_FEATURE',
]);
