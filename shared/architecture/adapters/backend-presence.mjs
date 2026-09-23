/**
 * SPEC §3 supabase / firebase / sqlite — small presence detector.
 * Cap fleet has none today; verified absence is recorded in AUDIT / analyzerCoverage.
 */

import fs from 'node:fs';
import path from 'node:path';
import { listFiles, lineAt, readText } from '../core/fs-util.mjs';
import { makeEvidence } from '../core/evidence.mjs';
import { EDGE_STATUS } from '../core/constants.mjs';
import { nodeId } from '../core/ids.mjs';

export const id = 'backend-presence';
export const stackIds = ['supabase', 'firebase', 'sqlite'];
export const description =
  'Detect Supabase/Firebase/SQLite usage; record verified absence when none found';
export const always = true;

/**
 * @param {string} root
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 * @param {object} [config]
 */
export function extract(root, graph, config) {
  const presence = { supabase: false, firebase: false, sqlite: false };
  const evidence = { supabase: null, firebase: null, sqlite: null };

  const files = listFiles(root, {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.dart', '.sql'],
    maxFiles: 4000,
  });

  scanPackageManifests(root, presence, evidence, graph);

  for (const f of files) {
    let text;
    try {
      text = readText(f.abs);
    } catch {
      continue;
    }
    scanFile(f, text, presence, evidence, graph);
  }

  graph.backendPresence = presence;

  if (!presence.supabase && !presence.firebase && !presence.sqlite) {
    graph.noteUnresolved(
      'supabase/firebase/sqlite: verified absence (no createClient/.from()/firebase/sqflite/expo-sqlite matches)'
    );
  } else {
    for (const kind of Object.keys(presence)) {
      if (!presence[kind]) continue;
      if (graph.stacks.indexOf(kind) === -1) graph.stacks.push(kind);
    }
    graph.stacks.sort();
  }
}

/**
 * @param {string} root
 * @param {object} presence
 * @param {object} evidence
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
function scanPackageManifests(root, presence, evidence, graph) {
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
      if (deps['@supabase/supabase-js'] || deps.supabase) {
        mark(presence, evidence, 'supabase', 'package.json', 1, '@supabase/supabase-js', graph);
      }
      if (deps.firebase || deps['firebase-admin'] || deps['@firebase/app']) {
        mark(presence, evidence, 'firebase', 'package.json', 1, 'firebase dependency', graph);
      }
      if (deps['expo-sqlite'] || deps.sqlite3 || deps.better-sqlite3 || deps['react-native-sqlite-storage']) {
        mark(presence, evidence, 'sqlite', 'package.json', 1, 'sqlite dependency', graph);
      }
    } catch { /* ignore */ }
  }

  const pub = path.join(root, 'pubspec.yaml');
  if (fs.existsSync(pub)) {
    try {
      const text = fs.readFileSync(pub, 'utf8');
      if (/\bsqflite\b/.test(text) || /\bsqlite\b/.test(text)) {
        mark(presence, evidence, 'sqlite', 'pubspec.yaml', 1, 'sqflite/sqlite', graph);
      }
      if (/\bfirebase\b/.test(text)) {
        mark(presence, evidence, 'firebase', 'pubspec.yaml', 1, 'firebase', graph);
      }
    } catch { /* ignore */ }
  }
}

/**
 * @param {{ rel: string }} f
 * @param {string} text
 * @param {object} presence
 * @param {object} evidence
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
function scanFile(f, text, presence, evidence, graph) {
  if (
    (/createClient\s*\(/.test(text) && /supabase/i.test(text)) ||
    (/from\s*\(\s*['"][\w]+['"]\s*\)/.test(text) && /supabase/i.test(text)) ||
    /@supabase\//.test(text)
  ) {
    const m = /createClient\s*\(|@supabase\/|\.from\s*\(/.exec(text);
    const line = m ? lineAt(text, m.index) : 1;
    mark(presence, evidence, 'supabase', f.rel, line, (m && m[0]) || 'supabase', graph);
  }

  if (
    /firebase\.(initializeApp|auth|firestore|storage)/.test(text) ||
    /getFirestore\s*\(|getAuth\s*\(/.test(text) ||
    /from\s+['"]firebase\//.test(text)
  ) {
    const m = /firebase\.(initializeApp|auth|firestore|storage)|getFirestore\s*\(|from\s+['"]firebase\//.exec(text);
    const line = m ? lineAt(text, m.index) : 1;
    mark(presence, evidence, 'firebase', f.rel, line, (m && m[0]) || 'firebase', graph);
  }

  if (
    /expo-sqlite|openDatabaseSync|SQLite\.openDatabase|sqflite|better-sqlite3/.test(text) ||
    /from\s+['"]expo-sqlite['"]/.test(text)
  ) {
    const m = /expo-sqlite|openDatabaseSync|SQLite\.openDatabase|sqflite|better-sqlite3/.exec(text);
    const line = m ? lineAt(text, m.index) : 1;
    mark(presence, evidence, 'sqlite', f.rel, line, (m && m[0]) || 'sqlite', graph);
  }
}

/**
 * @param {object} presence
 * @param {object} evidence
 * @param {string} kind
 * @param {string} file
 * @param {number} line
 * @param {string} snippet
 * @param {import('../core/graph.mjs').ArchitectureGraph} graph
 */
function mark(presence, evidence, kind, file, line, snippet, graph) {
  presence[kind] = true;
  if (!evidence[kind]) {
    evidence[kind] = { file: file, line: line, snippet: String(snippet).slice(0, 100) };
  }
  const db = graph.addNode({
    type: 'database',
    name: kind,
    file: file,
    line: line,
    layer: 'data',
    meta: { engine: kind },
  });
  if (!graph.database.engine) graph.database.engine = kind;
  // Avoid inventing a file node edge when evidence is only package.json
  const fromId = file === 'package.json' || file === 'pubspec.yaml'
    ? nodeId('config', file, path.basename(file))
    : nodeId('file', file);
  if (file === 'package.json' || file === 'pubspec.yaml') {
    graph.addNode({ type: 'config', name: path.basename(file), file: file, layer: 'config' });
  }
  graph.addEdge({
    from: fromId,
    to: db.id,
    type: 'DEPENDS_ON',
    status: EDGE_STATUS.INFERRED,
    evidence: [makeEvidence(file, line, String(snippet).slice(0, 100))],
    label: kind + ' detected',
  });
}
