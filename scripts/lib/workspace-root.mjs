import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** capricorn-tooling repository root */
export const TOOLING_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function findWorkspaceRoot() {
  if (process.env.CAP_WORKSPACE_ROOT) return process.env.CAP_WORKSPACE_ROOT;

  const sibling = join(TOOLING_ROOT, '..');
  if (existsSync(join(sibling, 'VaultCap')) && existsSync(join(sibling, 'shamikhahmed.github.io'))) {
    return sibling;
  }

  if (existsSync(join(TOOLING_ROOT, 'VaultCap'))) return TOOLING_ROOT;

  return sibling;
}

export const WORKSPACE_ROOT = findWorkspaceRoot();
export const SCRIPTS_DIR = join(TOOLING_ROOT, 'scripts');
export const SHARED_DIR = join(TOOLING_ROOT, 'shared');
export const AGENTS_DIR = join(TOOLING_ROOT, 'cap-agents');

export const APPS = {
  hub: 'shamikhahmed.github.io',
  capricorn: ['VaultCap', 'PulseCap', 'PrismCap', 'SteadyCap', 'LedgerCap', 'DeePonyCap'],
  standalone: ['ScentCap', 'AuraCap'],
};

export function appDir(name) {
  return join(WORKSPACE_ROOT, name);
}

export function hubDir() {
  return join(WORKSPACE_ROOT, APPS.hub);
}

export function screenshotsDir() {
  return join(hubDir(), 'assets/screenshots');
}

export function scriptsDir() {
  return SCRIPTS_DIR;
}

export function sharedDir() {
  return SHARED_DIR;
}
