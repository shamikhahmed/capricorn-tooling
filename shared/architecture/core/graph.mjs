/** In-memory architecture graph — nodes, edges, collections */

import { edgeId, nodeId, normalizePath } from './ids.mjs';
import { makeEvidence } from './evidence.mjs';
import { EDGE_STATUS } from './constants.mjs';

/**
 * @typedef {object} Evidence
 * @property {string} file
 * @property {number} line
 * @property {string} snippet
 */

/**
 * @typedef {object} ArchNode
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {string} file
 * @property {number} [line]
 * @property {number} [endLine]
 * @property {string} [layer]
 * @property {string} [feature]
 * @property {string[]} [flags]
 * @property {object} [meta]
 */

/**
 * @typedef {object} ArchEdge
 * @property {string} id
 * @property {string} from
 * @property {string} to
 * @property {string} type
 * @property {string} status
 * @property {Evidence[]} evidence
 * @property {string} [label]
 */

export class ArchitectureGraph {
  constructor() {
    /** @type {Map<string, ArchNode>} */
    this.nodes = new Map();
    /** @type {Map<string, ArchEdge>} */
    this.edges = new Map();
    /** @type {object} */
    this.trees = { files: {}, components: {}, routes: {}, services: {}, state: {} };
    /** @type {object[]} */
    this.storage = [];
    /** @type {object[]} */
    this.network = [];
    /** @type {object} */
    this.database = { engine: null, tables: [] };
    /** @type {object[]} */
    this.env = [];
    /** @type {object[]} */
    this.features = [];
    /** @type {object} */
    this.traces = { data: [], actions: [], display: [] };
    /** @type {object[]} */
    this.findings = [];
    /** @type {string[]} */
    this.stacks = [];
    /** @type {string[]} */
    this.unresolved = [];
  }

  /**
   * @param {Partial<ArchNode> & { type: string, name: string, file: string }} partial
   * @returns {ArchNode}
   */
  addNode(partial) {
    const file = normalizePath(partial.file);
    const id = partial.id || nodeId(partial.type, file, partial.name);
    const existing = this.nodes.get(id);
    if (existing) {
      if (partial.flags && partial.flags.length) {
        const set = new Set(existing.flags || []);
        for (const f of partial.flags) set.add(f);
        existing.flags = Array.from(set).sort();
      }
      if (partial.meta) existing.meta = Object.assign({}, existing.meta || {}, partial.meta);
      if (partial.line != null && existing.line == null) existing.line = partial.line;
      if (partial.endLine != null && existing.endLine == null) existing.endLine = partial.endLine;
      if (partial.layer && !existing.layer) existing.layer = partial.layer;
      if (partial.feature && !existing.feature) existing.feature = partial.feature;
      return existing;
    }
    const node = {
      id,
      type: partial.type,
      name: partial.name,
      file,
      line: partial.line != null ? partial.line : 0,
      endLine: partial.endLine != null ? partial.endLine : partial.line != null ? partial.line : 0,
      layer: partial.layer || layerForType(partial.type),
      feature: partial.feature || null,
      flags: (partial.flags || []).slice().sort(),
      meta: partial.meta || {},
    };
    this.nodes.set(id, node);
    return node;
  }

  /**
   * @param {object} opts
   * @returns {ArchEdge|null}
   */
  addEdge(opts) {
    const from = opts.from;
    const to = opts.to;
    if (!from || !to) return null;
    const type = opts.type;
    const label = opts.label || '';
    const id = opts.id || edgeId(from, to, type, label);
    const existing = this.edges.get(id);
    const evidence = (opts.evidence || []).map(function (e) {
      if (e && e.file != null) return makeEvidence(e.file, e.line, e.snippet);
      return e;
    });
    if (existing) {
      const seen = new Set(existing.evidence.map(function (e) {
        return e.file + ':' + e.line + ':' + e.snippet;
      }));
      for (const ev of evidence) {
        const k = ev.file + ':' + ev.line + ':' + ev.snippet;
        if (!seen.has(k)) {
          existing.evidence.push(ev);
          seen.add(k);
        }
      }
      // Prefer stronger status: VERIFIED > INFERRED > UNKNOWN > BROKEN (BROKEN wins if target missing later)
      if (statusRank(opts.status) > statusRank(existing.status) && opts.status !== EDGE_STATUS.BROKEN) {
        existing.status = opts.status;
      }
      if (opts.status === EDGE_STATUS.BROKEN) existing.status = EDGE_STATUS.BROKEN;
      return existing;
    }
    const edge = {
      id,
      from,
      to,
      type,
      status: opts.status || EDGE_STATUS.UNKNOWN,
      evidence,
      label: label || undefined,
    };
    this.edges.set(id, edge);
    return edge;
  }

  addFinding(finding) {
    this.findings.push(finding);
  }

  noteUnresolved(msg) {
    this.unresolved.push(msg);
  }

  hasNode(id) {
    return this.nodes.has(id);
  }

  getNode(id) {
    return this.nodes.get(id);
  }
}

function layerForType(type) {
  switch (type) {
    case 'app':
    case 'entry':
      return 'app';
    case 'screen':
    case 'route':
    case 'layout':
      return 'screen';
    case 'component':
    case 'primitive':
      return 'component';
    case 'event':
      return 'event';
    case 'function':
    case 'hook':
    case 'class':
    case 'logic':
    case 'validator':
      return 'logic';
    case 'state':
    case 'store':
    case 'context':
      return 'state';
    case 'service':
    case 'worker':
    case 'api-endpoint':
    case 'auth':
      return 'service';
    case 'database':
    case 'table':
    case 'column':
    case 'storage':
    case 'static-data':
      return 'data';
    case 'external':
    case 'dependency':
      return 'external';
    case 'config':
    case 'env':
    case 'file':
      return 'config';
    default:
      return 'logic';
  }
}

function statusRank(s) {
  if (s === EDGE_STATUS.VERIFIED) return 3;
  if (s === EDGE_STATUS.INFERRED) return 2;
  if (s === EDGE_STATUS.UNKNOWN) return 1;
  if (s === EDGE_STATUS.BROKEN) return 0;
  return 0;
}

export { nodeId, edgeId, normalizePath };
