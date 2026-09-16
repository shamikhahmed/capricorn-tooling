/** Lightweight schema validation against architecture-data.schema.json */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(HERE, '..', 'schema', 'architecture-data.schema.json');

/**
 * @returns {object}
 */
export function loadSchema() {
  return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
}

/**
 * Minimal validator (no AJV dependency): required keys, types, enums.
 * @param {object} doc
 * @param {object} [schema]
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateArchitectureData(doc, schema) {
  const sch = schema || loadSchema();
  const errors = [];
  if (!doc || typeof doc !== 'object') {
    return { ok: false, errors: ['document is not an object'] };
  }
  for (const key of sch.required || []) {
    if (doc[key] === undefined) errors.push('missing required: ' + key);
  }
  if (typeof doc.schemaVersion !== 'number') errors.push('schemaVersion must be number');
  if (typeof doc.analyzerVersion !== 'string') errors.push('analyzerVersion must be string');
  if (typeof doc.app !== 'string') errors.push('app must be string');
  if (typeof doc.generatedAt !== 'string') errors.push('generatedAt must be string');
  if (!Array.isArray(doc.nodes)) errors.push('nodes must be array');
  if (!Array.isArray(doc.edges)) errors.push('edges must be array');
  if (!doc.stats || typeof doc.stats !== 'object') errors.push('stats must be object');

  const nodeIds = new Set();
  for (let i = 0; i < (doc.nodes || []).length; i++) {
    const n = doc.nodes[i];
    if (!n.id || !n.type || !n.name || n.file == null) {
      errors.push('nodes[' + i + '] missing id/type/name/file');
      continue;
    }
    if (sch.$defs && sch.$defs.nodeType && sch.$defs.nodeType.enum) {
      if (sch.$defs.nodeType.enum.indexOf(n.type) === -1) {
        errors.push('nodes[' + i + '] invalid type: ' + n.type);
      }
    }
    nodeIds.add(n.id);
  }
  for (let i = 0; i < (doc.edges || []).length; i++) {
    const e = doc.edges[i];
    if (!e.id || !e.from || !e.to || !e.type || !e.status) {
      errors.push('edges[' + i + '] missing id/from/to/type/status');
      continue;
    }
    if (!Array.isArray(e.evidence)) errors.push('edges[' + i + '] evidence must be array');
    if (sch.$defs && sch.$defs.edgeStatus && sch.$defs.edgeStatus.enum) {
      if (sch.$defs.edgeStatus.enum.indexOf(e.status) === -1) {
        errors.push('edges[' + i + '] invalid status: ' + e.status);
      }
    }
  }

  // Stats must be computed numbers (not hand-typed strings)
  for (const [k, v] of Object.entries(doc.stats || {})) {
    if (k === 'edges') continue;
    if (typeof v !== 'number') errors.push('stats.' + k + ' must be number');
  }

  return { ok: errors.length === 0, errors };
}
