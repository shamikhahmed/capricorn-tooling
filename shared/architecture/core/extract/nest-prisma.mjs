/** NestJS + Prisma light extractor — SPEC §3 nest-prisma (ARCH-01) */

import fs from 'node:fs';
import path from 'node:path';
import { listFiles, lineAt, readText } from '../fs-util.mjs';
import { makeEvidence } from '../evidence.mjs';
import { EDGE_STATUS } from '../constants.mjs';
import { nodeId } from '../ids.mjs';

/**
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function extractNestPrisma(root, graph) {
  const schemaPaths = ['schema.prisma', 'prisma/schema.prisma'];
  for (const rel of schemaPaths) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    parsePrisma(rel, readText(abs), graph);
  }

  const files = listFiles(root, { extensions: ['.ts', '.js'], maxFiles: 2000 });
  for (const f of files) {
    let text;
    try {
      text = readText(f.abs);
    } catch {
      continue;
    }
    // @Controller('path')
    const ctrl = /@Controller\s*\(\s*['"]([^'"]*)['"]\s*\)/.exec(text);
    if (ctrl) {
      const base = ctrl[1] || '';
      const line = lineAt(text, ctrl.index);
      graph.addNode({ type: 'service', name: path.basename(f.rel, path.extname(f.rel)), file: f.rel, line });

      const methodRe = /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"]?([^'")]*)['"]?\s*\)/g;
      let m;
      while ((m = methodRe.exec(text))) {
        const method = m[1].toUpperCase();
        const sub = m[2] || '';
        const route = ('/' + base + '/' + sub).replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        const ml = lineAt(text, m.index);
        const ep = graph.addNode({
          type: 'api-endpoint',
          name: method + ' ' + route,
          file: f.rel,
          line: ml,
          meta: { httpMethod: method },
        });
        graph.addEdge({
          from: nodeId('file', f.rel),
          to: ep.id,
          type: 'EXPORTS',
          status: EDGE_STATUS.VERIFIED,
          evidence: [makeEvidence(f.rel, ml, m[0])],
          label: method + ' ' + route,
        });
      }
    }

    // prisma.model.op
    const prismaRe = /prisma\.([A-Za-z_][\w]*)\.(findMany|findFirst|findUnique|create|update|delete|upsert)/g;
    let pm;
    while ((pm = prismaRe.exec(text))) {
      const model = pm[1];
      const op = pm[2];
      const line = lineAt(text, pm.index);
      const table = graph.addNode({ type: 'table', name: model, file: f.rel, line });
      const isMut = /^(create|update|delete|upsert)$/.test(op);
      graph.addEdge({
        from: nodeId('file', f.rel),
        to: table.id,
        type: isMut ? 'MUTATES' : 'QUERIES',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, line, pm[0])],
        label: op,
      });
    }
  }
}

function parsePrisma(rel, text, graph) {
  graph.database.engine = 'postgres';
  graph.addNode({ type: 'database', name: 'prisma', file: rel });
  const modelRe = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let m;
  while ((m = modelRe.exec(text))) {
    const name = m[1];
    const body = m[2];
    const line = lineAt(text, m.index);
    graph.addNode({ type: 'table', name, file: rel, line });
    const columns = [];
    const pk = [];
    const fks = [];
    const fieldRe = /^\s*(\w+)\s+(\w+)/gm;
    let f;
    while ((f = fieldRe.exec(body))) {
      if (f[1] === '@@index' || f[1] === '@@unique' || f[1] === '@@id') continue;
      columns.push(f[1]);
      graph.addNode({ type: 'column', name: name + '.' + f[1], file: rel });
      if (/@id\b/.test(body.slice(f.index, f.index + 80)) || f[1] === 'id') pk.push(f[1]);
      if (/@relation\b/.test(body.slice(f.index, f.index + 120))) {
        fks.push(f[1]);
      }
    }
    if (!graph.database.tables.some(function (t) { return t.name === name; })) {
      graph.database.tables.push({
        name,
        columns,
        pk,
        fks,
        indexes: [],
        readers: [],
        writers: [],
      });
    }
  }
}
