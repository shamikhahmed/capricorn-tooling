/** Walk repo files for analyzers (skips node_modules, .git, build artifacts) */

import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.turbo',
  'ios', 'android', 'Pods', '.dart_tool',
  // Tests / tooling / minified vendor — not product architecture (ARCH-04)
  'vendor', 'tests', 'e2e', 'qa', 'scripts', 'test-results', 'playwright-report',
]);

/**
 * @param {string} root
 * @param {{ extensions?: string[], maxFiles?: number }} [opts]
 * @returns {{ abs: string, rel: string }[]}
 */
export function listFiles(root, opts) {
  const extensions = (opts && opts.extensions) || null;
  const maxFiles = (opts && opts.maxFiles) || 8000;
  const out = [];
  const stack = [root];
  while (stack.length && out.length < maxFiles) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (SKIP_DIRS.has(ent.name)) continue;
      if (ent.name.startsWith('.') && ent.isDirectory() && ent.name !== '.') continue;
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        // allow .env files at root; skip hidden dirs except we already skip most
        if (ent.name.startsWith('.') && ent.name !== '.github') continue;
        stack.push(abs);
        continue;
      }
      if (extensions) {
        const ok = extensions.some(function (ext) {
          return ent.name.endsWith(ext) || (ext === '.env' && (ent.name === '.env' || ent.name.startsWith('.env.')));
        });
        if (!ok && !(ent.name === '.env' || ent.name.startsWith('.env.'))) continue;
      }
      const rel = path.relative(root, abs).replace(/\\/g, '/');
      out.push({ abs, rel });
    }
  }
  return out.sort(function (a, b) {
    return a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0;
  });
}

/**
 * @param {string} abs
 * @returns {string}
 */
export function readText(abs) {
  return fs.readFileSync(abs, 'utf8');
}

/**
 * Line number (1-based) of an index in text.
 * @param {string} text
 * @param {number} index
 * @returns {number}
 */
export function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}
