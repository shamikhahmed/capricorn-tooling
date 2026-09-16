/**
 * Dart/Flutter extractor — SPEC §3 dart-flutter.
 * Prefer arch_dump when present; always provide regex fallback (INFERRED).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { listFiles, lineAt, readText } from '../fs-util.mjs';
import { makeEvidence } from '../evidence.mjs';
import { EDGE_STATUS } from '../constants.mjs';
import { nodeId } from '../ids.mjs';

/**
 * @param {string} root
 * @param {import('../graph.mjs').ArchitectureGraph} graph
 * @returns {{ mode: 'analyzer'|'regex', skippedAnalyzer?: string }}
 */
export function extractDartFlutter(root, graph) {
  const dartFiles = listFiles(root, { extensions: ['.dart'], maxFiles: 2000 });
  if (!dartFiles.length && !fs.existsSync(path.join(root, 'pubspec.yaml'))) {
    return { mode: 'regex' };
  }

  const dump = path.join(root, 'tool', 'arch_dump.dart');
  const dartOk = spawnSync('dart', ['--version'], { encoding: 'utf8' });
  if (fs.existsSync(dump) && dartOk.status === 0) {
    const run = spawnSync('dart', ['run', dump], { cwd: root, encoding: 'utf8', timeout: 60000 });
    if (run.status === 0 && run.stdout) {
      try {
        const data = JSON.parse(run.stdout);
        ingestDump(data, graph);
        return { mode: 'analyzer' };
      } catch {
        graph.noteUnresolved('dart arch_dump produced non-JSON; using regex fallback');
      }
    }
  } else if (dartOk.status !== 0) {
    graph.noteUnresolved('Dart SDK missing — regex fallback only (INFERRED)');
    return regexExtract(root, graph, 'Dart SDK missing — regex fallback only');
  }

  return regexExtract(root, graph, null);
}

function regexExtract(root, graph, skipMsg) {
  const files = listFiles(root, { extensions: ['.dart'], maxFiles: 2000 });
  for (const f of files) {
    const text = readText(f.abs);
    graph.addNode({ type: 'file', name: path.basename(f.rel), file: f.rel });

    const importRe = /import\s+['"]([^'"]+)['"]\s*;/g;
    let m;
    while ((m = importRe.exec(text))) {
      const line = lineAt(text, m.index);
      const to = graph.addNode({ type: 'file', name: m[1], file: m[1] });
      graph.addEdge({
        from: nodeId('file', f.rel),
        to: to.id,
        type: 'IMPORTS',
        status: EDGE_STATUS.INFERRED,
        evidence: [makeEvidence(f.rel, line, m[0])],
        label: m[1],
      });
    }

    const goRe = /GoRoute\s*\(\s*path:\s*['"]([^'"]+)['"]/g;
    while ((m = goRe.exec(text))) {
      const line = lineAt(text, m.index);
      graph.addNode({ type: 'route', name: m[1], file: f.rel, line });
    }

    const classRe = /class\s+(\w+)\s+extends\s+(\w+)/g;
    while ((m = classRe.exec(text))) {
      const line = lineAt(text, m.index);
      graph.addNode({
        type: /Widget$|Page$|Screen$/.test(m[2]) || /Widget$|Page$|Screen$/.test(m[1]) ? 'component' : 'class',
        name: m[1],
        file: f.rel,
        line,
      });
    }
  }
  return { mode: 'regex', skippedAnalyzer: skipMsg || undefined };
}

function ingestDump(data, graph) {
  for (const n of data.nodes || []) graph.addNode(n);
  for (const e of data.edges || []) graph.addEdge(e);
}
