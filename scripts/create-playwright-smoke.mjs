#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apps = [
  { dir: 'VaultOS', title: 'VaultOS', port: 8765 },
  { dir: 'FitnessOS', title: 'FitnessOS', port: 8766 },
  { dir: 'PrismOS', title: 'PrismOS', port: 8767 },
  { dir: 'DisciplineOS', title: 'DisciplineOS', port: 8768 },
  { dir: 'StundsOS', title: 'StundsOS', port: 8769 },
  { dir: 'DeePonyOS', title: 'DeePonyOS', port: 8770 },
];

const spec = (title) => `// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('${title} smoke', () => {
  test('loads shell without fatal errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(800);
    const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
    expect(fatal).toEqual([]);
  });

  test('manifest link present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });
});
`;

const config = (port) => `// @ts-check
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:${port}' },
  webServer: {
    command: 'python3 -m http.server ${port}',
    url: 'http://127.0.0.1:${port}',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
`;

for (const a of apps) {
  const base = join(root, a.dir);
  mkdirSync(join(base, 'tests'), { recursive: true });
  if (a.dir !== 'VaultOS' || !existsSync(join(base, 'playwright.config.js'))) {
    writeFileSync(join(base, 'playwright.config.js'), config(a.port));
  }
  if (a.dir !== 'VaultOS') {
    writeFileSync(join(base, 'tests/smoke.spec.js'), spec(a.title));
  }
  console.log('playwright:', a.dir);
}
