#!/usr/bin/env node
/**
 * Capture story screenshots from qa/v7 persona step scripts.
 *
 *   node capture-story.mjs <appPathOrSlug> <personaId>
 *
 * Saves PNG + WebP under capricorn-lab/content/stories/<slug>/<personaShort>/
 * for iPhone 16 Pro, iPad Air, MacBook 14 — light and dark.
 * Writes manifest.json with git SHA.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const TOOLING = join(dirname(fileURLToPath(import.meta.url)), '..');
const FLEET = join(TOOLING, '..');
const LAB = join(FLEET, 'capricorn-lab');
const DEFAULT_PW_CORE = join(FLEET, 'MasteryCap', 'node_modules', 'playwright-core');

const REPO_BY_SLUG = {
  vaultcap: 'VaultCap', pulsecap: 'PulseCap', prismcap: 'PrismCap', steadycap: 'SteadyCap',
  ledgercap: 'LedgerCap', deeponycap: 'DeePonyCap', scentcap: 'ScentCap', soulcap: 'SoulCap',
  travelcap: 'TravelCap', auracap: 'AuraCap', masterycap: 'MasteryCap', ideacap: 'IdeaCap',
  carcap: 'CarCap', cookcap: 'CookCap', deefoodie: 'DeeFoodieApp',
};

const VIEWPORTS = [
  ['iphone-16-pro', { width: 402, height: 874, deviceScaleFactor: 3, isMobile: true, hasTouch: true }],
  ['ipad-air', { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['macbook-14', { width: 1512, height: 982, deviceScaleFactor: 2 }],
];

function resolvePwCore() {
  if (process.env.PW_CORE) return process.env.PW_CORE;
  if (existsSync(join(DEFAULT_PW_CORE, 'index.mjs'))) return DEFAULT_PW_CORE;
  const lab = join(LAB, 'node_modules', 'playwright-core');
  if (existsSync(join(lab, 'index.mjs'))) return lab;
  return null;
}

function gitSha(cwd) {
  const r = spawnSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
}

function personaShort(personaId) {
  const i = personaId.lastIndexOf('-');
  return i >= 0 ? personaId.slice(i + 1) : personaId;
}

function resolveAppRoot(arg) {
  if (!arg) return null;
  const slug = arg.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (REPO_BY_SLUG[slug]) return { slug, root: join(FLEET, REPO_BY_SLUG[slug]) };
  const abs = arg.startsWith('/') ? arg : join(process.cwd(), arg);
  if (existsSync(join(abs, 'index.html'))) {
    const name = basename(abs);
    const slug2 = Object.entries(REPO_BY_SLUG).find(([, r]) => r === name)?.[0] || slugify(name);
    return { slug: slug2, root: abs };
  }
  return null;
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function contentType(p) {
  if (p.endsWith('.html')) return 'text/html';
  if (p.endsWith('.js')) return 'application/javascript';
  if (p.endsWith('.css')) return 'text/css';
  if (p.endsWith('.json')) return 'application/json';
  if (p.endsWith('.webp')) return 'image/webp';
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.svg')) return 'image/svg+xml';
  if (p.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}

function startStatic(root) {
  const server = createServer((req, res) => {
    const path = (req.url || '/').split('?')[0];
    const file = join(root, decodeURIComponent(path === '/' ? 'index.html' : path.replace(/^\//, '')));
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType(file) });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function runPrep(page, baseUrl, prep) {
  for (const step of prep || []) {
    if (step.action === 'goto') await page.goto(`${baseUrl}${step.path || '/'}`, { waitUntil: 'load', timeout: 60000 });
    if (step.action === 'wait') await page.waitForTimeout(step.ms || 500);
    if (step.action === 'click' && step.selector) {
      try {
        await page.locator(step.selector).first().click({ timeout: step.optional ? 2000 : 10000 });
      } catch {
        if (!step.optional) throw new Error(`click failed: ${step.selector}`);
      }
    }
  }
}

async function runStep(page, step) {
  if (step.action === 'nav' && step.page) {
    await page.evaluate((pg) => {
      if (typeof R !== 'undefined' && R.goto) R.goto(pg);
    }, step.page);
    await page.waitForTimeout(900);
  }
  if (step.action === 'screenshot' || step.screenshot) {
    await page.waitForTimeout(400);
  }
}

const [appArg, personaId] = process.argv.slice(2);
const appInfo = resolveAppRoot(appArg);
if (!appInfo || !personaId) {
  console.error('Usage: node capture-story.mjs <appPathOrSlug> <personaId>');
  process.exit(2);
}

const stepsPath = join(appInfo.root, 'qa', 'v7', 'personas', `${personaId}.steps.json`);
if (!existsSync(stepsPath)) {
  console.error(`Missing ${stepsPath}`);
  process.exit(2);
}
const script = JSON.parse(readFileSync(stepsPath, 'utf8'));
const outDir = join(LAB, 'content', 'stories', appInfo.slug, personaShort(personaId));
mkdirSync(outDir, { recursive: true });

const pwCore = resolvePwCore();
if (!pwCore) {
  console.error('capture-story: set PW_CORE to playwright-core');
  process.exit(2);
}

const { chromium } = await import(pathToFileURL(join(pwCore, 'index.mjs')).href);
const { server, baseUrl } = await startStatic(appInfo.root);
const manifest = { personaId, app: appInfo.slug, gitSha: gitSha(appInfo.root), capturedAt: new Date().toISOString(), files: [] };

try {
  for (const theme of ['light', 'dark']) {
    for (const [deviceName, viewport] of VIEWPORTS) {
      const browser = await chromium.launch();
      const context = await browser.newContext({ ...viewport, colorScheme: theme, baseURL: baseUrl });
      const page = await context.newPage();
      await runPrep(page, baseUrl, script.prep);
      for (const step of script.steps || []) {
        await runStep(page, step);
        const id = step.id || 'shot';
        const base = `${id}-${deviceName}-${theme}`;
        const png = join(outDir, `${base}.png`);
        await page.screenshot({ path: png, fullPage: false });
        const webp = join(outDir, `${base}.webp`);
        const cwebp = spawnSync('cwebp', ['-quiet', '-q', '80', png, '-o', webp]);
        manifest.files.push({ step: id, device: deviceName, theme, png: basename(png), webp: cwebp.status === 0 ? basename(webp) : null });
        if (deviceName === 'iphone-16-pro' && theme === 'light') {
          const canonical = join(outDir, `${id}.png`);
          const canonicalWebp = join(outDir, `${id}.webp`);
          writeFileSync(canonical, readFileSync(png));
          if (cwebp.status === 0) writeFileSync(canonicalWebp, readFileSync(webp));
        }
      }
      await browser.close();
    }
  }
} finally {
  server.close();
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`capture-story: ${manifest.files.length} shots → ${outDir}`);
