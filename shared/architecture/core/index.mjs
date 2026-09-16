/** Public core API */

export { ANALYZER_VERSION, SCHEMA_VERSION, NODE_TYPES, EDGE_TYPES, EDGE_STATUS, NODE_FLAGS } from './constants.mjs';
export { ArchitectureGraph } from './graph.mjs';
export { nodeId, edgeId, normalizePath } from './ids.mjs';
export { makeEvidence, redactSecrets, containsSecret } from './evidence.mjs';
export { canonicalize, stableStringify, withoutGeneratedAt } from './serialize.mjs';
export { detectStacks } from './detect.mjs';
export { computeStats } from './stats.mjs';
export { runAnalyses } from './analyses/index.mjs';
export { analyzeRepo, writeOutputs } from './pipeline.mjs';
export { validateArchitectureData, loadSchema } from './validate.mjs';
export { writeAuditMarkdown } from './audit.mjs';
