#!/usr/bin/env node
/**
 * audit-secrets.mjs — FLT-08 lightweight secret scan (no new dependency).
 * Scans changed files when GIT_DIFF_BASE is set; otherwise scans common app roots.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { WORKSPACE_ROOT as ROOT } from './lib/workspace-root.mjs';

const PATTERNS = [
  { name: 'OpenAI key', re: /sk-[A-Za-z0-9]{20,}/g },
  { name: 'Anthropic key', re: /sk-ant-[A-Za-z0-9_-]{20,}/g },
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/g },
  { name: 'Private key block', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'EXPO_PUBLIC_*KEY assignment', re: /EXPO_PUBLIC_[A-Z0-9_]*KEY\s*=\s*['"][^'"]+['"]/g },
  { name: 'Telegram bot token', re: /\d{8,12}:[A-Za-z0-9_-]{30,}/g },
];

const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'out', 'build', 'vendor', 'coverage', 'playwright-report', 'test-results', '.next']);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (/\.(js|ts|tsx|jsx|mjs|cjs|json|env|md|html|yml|yaml)$/i.test(name) || name.startsWith('.env')) out.push(p);
  }
  return out;
}

function filesToScan() {
  const base = process.env.GIT_DIFF_BASE;
  const cwd = process.env.SCAN_ROOT || process.cwd();
  if (base) {
    try {
      const out = execSync(`git -C "${cwd}" diff --name-only --diff-filter=ACMR ${base}`, { encoding: 'utf8' });
      return out.split('\n').filter(Boolean).map((f) => join(cwd, f)).filter((f) => existsSync(f));
    } catch {
      return [];
    }
  }
  return walk(cwd).slice(0, 5000);
}

const files = filesToScan();
const hits = [];
for (const file of files) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  // Skip PEM examples in rules docs that are placeholders
  if (file.includes('.cursor/rules') && text.includes('BEGIN RSA PRIVATE KEY')) continue;
  if (file.includes('audit-secrets.mjs')) continue;
  for (const { name, re } of PATTERNS) {
    re.lastIndex = 0;
    if (re.test(text)) {
      hits.push({ file: relative(ROOT, file) || file, name });
    }
  }
}

if (hits.length) {
  console.error('Secret scan hits:');
  for (const h of hits) console.error(`  ${h.name}: ${h.file}`);
  process.exit(1);
}
console.log(`Secret scan clean (${files.length} files)`);
