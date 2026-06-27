#!/usr/bin/env node
/**
 * Portfolio truth audit — flags marketing claims that may not match code.
 * Run from workspace root: node capricorn-tooling/scripts/truth-audit.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { WORKSPACE_ROOT } from './lib/workspace-root.mjs';

/** In-scope apps for the cross-portfolio excellence initiative (June 2026). */
const APPS = ['VaultCap', 'PulseCap', 'SteadyCap', 'LedgerCap', 'DeePonyCap', 'ScentCap'];

const RULES = [
  { id: 'claude-brand', pattern: /\bClaude AI\b/i, msg: 'Use Smart Parser / optional LLM — not "Claude AI"' },
  { id: 'ai-coach', pattern: /\bAI Coach\b/i, msg: 'Rename to Smart Coach unless LLM wired' },
  { id: 'ask-ai-label', pattern: /\bAsk AI\b/i, msg: 'Use Smart Coach / Smart Assistant — rules-based, not LLM' },
  { id: '18-themes', pattern: /\b18 themes?\b/i, msg: 'VaultCap ships 5 themes — fix count' },
  { id: '30-games', pattern: /\b30 games?\b/i, msg: 'PrismCap has 38 games' },
  { id: 'legacy-vaultos', pattern: /\bVaultOS\b/, msg: 'Use VaultCap branding' },
  { id: 'legacy-fitnessos', pattern: /\bFitnessOS\b/, msg: 'Use PulseCap branding' },
  { id: 'legacy-prismos', pattern: /\bPrismOS\b/, msg: 'Use PrismCap branding' },
  { id: 'legacy-discipline', pattern: /\bDisciplineOS\b/, msg: 'Use SteadyCap branding' },
  { id: 'legacy-stunds', pattern: /\bStundsOS\b/, msg: 'Use LedgerCap branding' },
  { id: 'legacy-deepony', pattern: /\bDeePonyOS\b/, msg: 'Use DeePonyCap branding' },
];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules' || name === '.git' || name === 'vendor' || name === 'dist') continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(md|html)$/i.test(name)) acc.push(p);
  }
  return acc;
}

let issues = 0;
for (const app of APPS) {
  const appRoot = join(WORKSPACE_ROOT, app);
  if (!existsSync(appRoot)) {
    console.warn(`[skip] ${app} not found at ${appRoot}`);
    continue;
  }
  const files = walk(appRoot);
  for (const file of files) {
    const rel = file.replace(WORKSPACE_ROOT + '/', '');
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

if (issues === 0) console.log(`truth-audit: OK — ${APPS.length} in-scope apps, no flagged patterns`);
else {
  console.log(`\ntruth-audit: ${issues} issue(s) found across in-scope apps`);
  process.exit(1);
}
