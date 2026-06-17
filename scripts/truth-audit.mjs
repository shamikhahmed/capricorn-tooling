#!/usr/bin/env node
/**
 * Portfolio truth audit — flags marketing claims that may not match code.
 * Run: node scripts/truth-audit.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apps = ['VaultCap', 'PulseCap', 'PrismCap', 'SteadyCap', 'LedgerCap', 'DeePonyCap', 'ScentCap', 'AuraCap'];

const RULES = [
  { id: 'claude-brand', pattern: /\bClaude AI\b/i, msg: 'Use Smart Parser / optional LLM — not "Claude AI"' },
  { id: 'ai-coach', pattern: /\bAI Coach\b/i, msg: 'Rename to Smart Coach unless LLM wired' },
  { id: '18-themes', pattern: /\b18 themes?\b/i, msg: 'VaultCap ships 5 themes — fix count' },
  { id: '30-games', pattern: /\b30 games?\b/i, msg: 'PrismCap has 38 games' },
  { id: 'legacy-vaultos', pattern: /\bVaultOS\b/, msg: 'Use VaultCap branding' },
  { id: 'legacy-fitnessos', pattern: /\bFitnessOS\b/, msg: 'Use PulseCap branding' },
  { id: 'legacy-prismos', pattern: /\bPrismOS\b/, msg: 'Use PrismCap branding' },
  { id: 'legacy-discipline', pattern: /\bDisciplineOS\b/, msg: 'Use SteadyCap branding' },
  { id: 'legacy-stunds', pattern: /\bStundsOS\b/, msg: 'Use LedgerCap branding' },
  { id: 'legacy-deepony', pattern: /\bDeePonyOS\b/, msg: 'Use DeePonyCap branding' },
  { id: 'truth-bomb-missing', pattern: /Truth Bomb/i, files: ['PrismCap'], skipIf: () => existsSync(join(root, 'PrismCap/js/app.js')) && readFileSync(join(root, 'PrismCap/js/app.js'), 'utf8').includes("id:'truthbomb'") },
  { id: 'trigger-intel', pattern: /trigger intelligence/i, files: ['SteadyCap'], skipIf: () => existsSync(join(root, 'SteadyCap/js/modules/journal.js')) && readFileSync(join(root, 'SteadyCap/js/modules/journal.js'), 'utf8').includes('triggers') },
];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === '.git' || name === 'vendor') continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(md|html)$/i.test(name)) acc.push(p);
  }
  return acc;
}

let issues = 0;
for (const app of apps) {
  const appRoot = join(root, app);
  if (!existsSync(appRoot)) continue;
  const files = walk(appRoot).filter((f) => !f.includes('node_modules'));
  for (const file of files) {
    const rel = file.replace(root + '/', '');
    const text = readFileSync(file, 'utf8');
    for (const rule of RULES) {
      if (rule.files && !rule.files.some((a) => rel.startsWith(a))) continue;
      if (rule.skipIf && rule.skipIf()) continue;
      if (rule.pattern.test(text)) {
        console.log(`[${rule.id}] ${rel}: ${rule.msg || rule.pattern}`);
        issues++;
      }
    }
  }
}

if (issues === 0) console.log('truth-audit: OK — no flagged patterns');
else {
  console.log(`\ntruth-audit: ${issues} issue(s) found`);
  process.exit(1);
}
