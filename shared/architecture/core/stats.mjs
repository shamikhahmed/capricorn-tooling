/** Computed health stats — SPEC §6 */

/**
 * @param {import('./graph.mjs').ArchitectureGraph} graph
 * @returns {object}
 */
export function computeStats(graph) {
  const nodes = Array.from(graph.nodes.values());
  const edges = Array.from(graph.edges.values());
  const countType = function (t) {
    return nodes.filter(function (n) { return n.type === t; }).length;
  };
  const flagCount = function (f) {
    return nodes.filter(function (n) { return (n.flags || []).indexOf(f) !== -1; }).length;
  };
  const byStatus = { VERIFIED: 0, INFERRED: 0, UNKNOWN: 0, BROKEN: 0 };
  for (const e of edges) {
    if (byStatus[e.status] != null) byStatus[e.status]++;
    else byStatus[e.status] = 1;
  }
  const findings = graph.findings || [];
  const findingKind = function (k) {
    return findings.filter(function (f) { return f.kind === k; }).length;
  };
  const features = graph.features || [];
  const featuresComplete = features.filter(function (f) { return f.overall === 'COMPLETE'; }).length;
  const featuresIncomplete = features.length - featuresComplete;

  return {
    files: countType('file'),
    screens: countType('screen'),
    routes: countType('route'),
    components: countType('component'),
    hooks: countType('hook'),
    functions: countType('function'),
    classes: countType('class'),
    services: countType('service'),
    stateHolders: countType('state') + countType('store') + countType('context'),
    storageKeys: (graph.storage || []).length,
    tables: ((graph.database && graph.database.tables) || []).length,
    apiEndpoints: countType('api-endpoint'),
    externalHosts: (graph.network || []).length,
    envVars: (graph.env || []).length,
    dependencies: countType('dependency'),
    edges: {
      total: edges.length,
      byStatus: byStatus,
    },
    orphans: flagCount('ORPHANED'),
    unused: flagCount('UNUSED'),
    dead: flagCount('DEAD'),
    duplicates: findingKind('DUPLICATE'),
    brokenPaths: findingKind('BROKEN') + byStatus.BROKEN,
    hardcoded: flagCount('HARDCODED') + findingKind('HARDCODED'),
    mock: flagCount('MOCK') + findingKind('MOCK'),
    demo: flagCount('DEMO') + findingKind('DEMO'),
    unknown: byStatus.UNKNOWN + findingKind('UNKNOWN'),
    securityItems: flagCount('SECURITY') + findingKind('SECURITY'),
    featuresComplete: featuresComplete,
    featuresIncomplete: featuresIncomplete,
    findings: findings.length,
  };
}
