/** Env key extraction — SPEC §0.8 / §3 env-config (values never loaded) */

import fs from 'node:fs';
import path from 'node:path';
import { listFiles, lineAt, readText } from '../fs-util.mjs';
import { makeEvidence } from '../evidence.mjs';
import { EDGE_STATUS, NODE_FLAGS } from '../constants.mjs';

/**
 * Parse .env* files for KEY names only — never read values into graph storage.
 * Implementation reads lines but immediately discards the value portion.
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 */
export function extractEnv(root, graph) {
  const envMap = new Map(); // name -> record

  // .env files: keys only
  const envFiles = listFiles(root, { extensions: ['.env'], maxFiles: 50 }).filter(function (f) {
    return f.rel === '.env' || f.rel.startsWith('.env.') || path.basename(f.rel).startsWith('.env');
  });
  // Also pick up root .env that may be hidden from walk
  for (const name of ['.env', '.env.local', '.env.development', '.env.production', '.env.example']) {
    const abs = path.join(root, name);
    if (fs.existsSync(abs) && !envFiles.some(function (f) { return f.abs === abs; })) {
      envFiles.push({ abs, rel: name });
    }
  }

  for (const f of envFiles) {
    let text;
    try {
      text = fs.readFileSync(f.abs, 'utf8');
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
      if (!m) continue;
      const name = m[1];
      // Explicitly do not capture m[2] / value — discard remainder
      upsert(envMap, name, {
        definedIn: f.rel + ' (key only)',
        line: i + 1,
      });
    }
  }

  // Code references: process.env.X / import.meta.env.X / EXPO_PUBLIC etc.
  const codeFiles = listFiles(root, {
    extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.dart'],
    maxFiles: 4000,
  });
  const refRe = /(?:process\.env|import\.meta\.env)\.([A-Za-z_][A-Za-z0-9_]*)/g;
  for (const f of codeFiles) {
    let text;
    try {
      text = readText(f.abs);
    } catch {
      continue;
    }
    let m;
    refRe.lastIndex = 0;
    while ((m = refRe.exec(text))) {
      const name = m[1];
      const line = lineAt(text, m.index);
      const clientExposed = /^(NEXT_PUBLIC_|VITE_|EXPO_PUBLIC_)/.test(name);
      upsert(envMap, name, {
        referencedBy: f.rel + ':' + line,
        clientExposed,
        evidence: makeEvidence(f.rel, line, m[0]),
      });
      const fromId = 'file:' + f.rel;
      graph.addNode({ type: 'file', name: path.basename(f.rel), file: f.rel, layer: 'config' });
      const envNode = graph.addNode({
        type: 'env',
        name,
        file: f.rel,
        line,
        flags: clientExposed && looksSecretName(name) ? [NODE_FLAGS.SECURITY] : [],
        meta: { clientExposed },
      });
      graph.addEdge({
        from: fromId,
        to: envNode.id,
        type: 'ENV',
        status: EDGE_STATUS.VERIFIED,
        evidence: [makeEvidence(f.rel, line, m[0])],
        label: name,
      });
    }
  }

  for (const [name, rec] of envMap) {
    graph.env.push({
      name,
      definedIn: rec.definedIn || [],
      referencedBy: rec.referencedBy || [],
      clientExposed: !!rec.clientExposed,
      looksSecret: looksSecretName(name),
    });
    graph.addNode({
      type: 'env',
      name,
      file: (rec.definedIn && rec.definedIn[0]) || 'env',
      line: rec.line || 0,
      flags: rec.clientExposed && looksSecretName(name) ? [NODE_FLAGS.SECURITY] : [],
      meta: { clientExposed: !!rec.clientExposed },
    });
  }
}

function upsert(map, name, patch) {
  const cur = map.get(name) || {
    definedIn: [],
    referencedBy: [],
    clientExposed: false,
    line: 0,
  };
  if (patch.definedIn) {
    if (cur.definedIn.indexOf(patch.definedIn) === -1) cur.definedIn.push(patch.definedIn);
    cur.line = patch.line || cur.line;
  }
  if (patch.referencedBy && cur.referencedBy.indexOf(patch.referencedBy) === -1) {
    cur.referencedBy.push(patch.referencedBy);
  }
  if (patch.clientExposed) cur.clientExposed = true;
  map.set(name, cur);
}

function looksSecretName(name) {
  return /(secret|password|token|api[_-]?key|private|_key)$/i.test(name);
}
