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
  vaultcap: 'VaultCap', steadycap: 'SteadyCap', pulsecap: 'PulseCap', soulcap: 'SoulCap',
  deeponycap: 'DeePonyCap', ledgercap: 'LedgerCap', scentcap: 'ScentCap',
  carcap: 'CarCap', masterycap: 'MasteryCap', travelcap: 'TravelCap', cookcap: 'CookCap',
  ideacap: 'IdeaCap', deefoodie: 'DeeFoodieApp', deefoodieapp: 'DeeFoodieApp',
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

/**
 * Hardcoded demo display names per Cap (for docs / overlay targeting).
 * Capture does not change product seeders — only page.evaluate overlays for story shots.
 */
const DEMO_DISPLAY_NAMES = {
  vaultcap: 'Alex Khan (demo-profiles.js)',
  steadycap: 'Alex (Demo) (demo-seed.js)',
  pulsecap: 'Alex Demo / Alex Khan (storage.js createDemo)',
  soulcap: '(no user display-name seed)',
  deeponycap: '(pony item names only)',
  ledgercap: '(portfolio seed — no display name)',
  scentcap: '(fragrance catalog — no user name)',
  carcap: '(no demo display-name seeder found)',
  masterycap: '(no demo display-name seeder found)',
  travelcap: 'Alex / Sam travelers (demo-seed.ts)',
  cookcap: '(no demo display-name seeder found)',
  ideacap: '(no demo display-name seeder found)',
  deefoodie: '(menu/food seed — no user name)',
};

/** Fallback when seed.json / story JSON / steps.personaName are missing */
const PERSONA_SEED = {
  'vaultcap-ayesha': 'Ayesha Siddiqui',
  'vaultcap-omar': 'Omar Rahman',
  'vaultcap-margaret': 'Margaret Ellis',
  'steadycap-bilal': 'Bilal Ahmed',
  'steadycap-hamza': 'Hamza Khan',
  'steadycap-priya': 'Priya Sharma',
  'pulsecap-daniel': 'Daniel Okonkwo',
  'pulsecap-khalid': 'Khalid Hassan',
  'pulsecap-sara': 'Sara Malik',
  'soulcap-amina': 'Amina Rahman',
  'soulcap-tom': 'Tom Hughes',
  'soulcap-zainab': 'Zainab Ali',
};

async function applyPersonaOverlay(page, personaName, opts = {}) {
  if (!personaName) return;
  await page.addStyleTag({
    content: `
      #demoBanner, .demo-banner, [data-demo-banner], .cap-demo-banner,
      .cap-demo-mode-banner, [id*="demoBanner"], [class*="demo-banner"] {
        display: none !important; visibility: hidden !important; height: 0 !important;
        overflow: hidden !important; opacity: 0 !important; pointer-events: none !important;
      }
      body.demo-banner-active #app {
        margin-top: 0 !important; height: 100dvh !important; max-height: 100dvh !important;
      }
    `,
  }).catch(() => {});
  await page.evaluate(({ name, largeText }) => {
    const upper = String(name).toUpperCase();
    const initials = name.split(/\s+/).map((p) => p[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'VC';
    const isDemoish = (v) => /alex|demo|sample|guided/i.test(String(v || ''));
    const patchHolders = (arr) => {
      if (!Array.isArray(arr)) return;
      for (const row of arr) {
        if (!row || typeof row !== 'object') continue;
        if (row.holderName != null && String(row.holderName).trim()) {
          row.holderName = /[a-z]/.test(row.holderName) ? name : upper;
        }
        if (row.name && isDemoish(row.name)) row.name = name;
      }
    };
    try {
      document.body.classList.remove('demo-banner-active');
      document.documentElement.style.removeProperty('--demo-banner-h');
      document.querySelectorAll(
        '#demoBanner, .demo-banner, [data-demo-banner], .cap-demo-banner, .cap-demo-mode-banner',
      ).forEach((el) => {
        el.hidden = true;
        el.style.display = 'none';
      });
      if (typeof CapDemo !== 'undefined' && CapDemo.dismissBanner) {
        try { CapDemo.dismissBanner(); } catch (_) { /* ignore */ }
      }

      if (typeof S !== 'undefined' && S.user) {
        S.user.name = name;
        if (S.user.email) {
          const first = name.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '') || 'user';
          S.user.email = `${first}.story@example.com`;
        }
        patchHolders(S.banks);
        patchHolders(S.cards);
        patchHolders(S.documents);
        if (Array.isArray(S.familyMembers)) {
          for (const m of S.familyMembers) {
            if (!m) continue;
            if (m.isHead || isDemoish(m.name)) {
              m.name = name;
              m.avatar = initials;
            }
          }
        }
        if (S.emergency && typeof S.emergency === 'object') {
          if (!S.emergency.name || isDemoish(S.emergency.name)) S.emergency.name = name;
        }
        if (largeText && typeof applyLargeText === 'function') applyLargeText(true);
        else if (largeText) {
          S.largeText = true;
          document.body.classList.add('large-text');
        }
        if (typeof Store !== 'undefined' && Store.save) Store.save();
      }
      if (typeof State !== 'undefined' && State.update) {
        State.update((d) => { if (d.user) d.user.name = name; });
      }
      if (typeof window.user !== 'undefined' && window.user && typeof window.user === 'object') {
        window.user.name = name;
      }

      const pg = (typeof S !== 'undefined' && S.currentPage) || 'dashboard';
      if (typeof R !== 'undefined' && R.goto) R.goto(pg);
      else if (typeof Dash !== 'undefined' && Dash.render) Dash.render();
      else if (typeof Dashboard !== 'undefined' && Dashboard.render) Dashboard.render();
      else if (typeof render === 'function') render();
    } catch (_) { /* best-effort overlay */ }
  }, { name: personaName, largeText: !!opts.largeText });
  await page.waitForTimeout(450);
}

function loadPersonaMeta(slug, personaId, appRoot, script) {
  let name = script.personaName || PERSONA_SEED[personaId] || null;
  let day = [];
  const seedPath = join(appRoot, 'qa', 'v7', 'personas', `${personaId}.seed.json`);
  if (existsSync(seedPath)) {
    try {
      const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
      name = seed.profile?.displayName || seed.displayName || name;
    } catch { /* ignore */ }
  }
  const storyPath = join(LAB, 'content', 'stories', `${slug}.json`);
  if (existsSync(storyPath)) {
    try {
      const bundle = JSON.parse(readFileSync(storyPath, 'utf8'));
      const p = (bundle.personas || []).find((x) => x.id === personaId);
      if (p) {
        name = name || p.name || null;
        day = p.day || [];
      }
    } catch { /* ignore */ }
  }
  return { name, day, largeText: !!script.largeText, demoSeedNote: DEMO_DISPLAY_NAMES[slug] || '' };
}

async function unlockVaultSample(page, baseUrl, personaName, opts = {}) {
  await page.addInitScript(() => {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vo_demo_guide_seen', '1');
    localStorage.setItem('vos_wn_ver', '5.4.0');
  });
  const q = opts.largeText ? '/?demo=1&dt=1.6' : '/?demo=1';
  await page.goto(`${baseUrl}${q}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => typeof window.loadDemoProfile === 'function', { timeout: 20000 }).catch(() => {});
  await page.evaluate(() => {
    try {
      if (typeof loadDemoProfile === 'function') loadDemoProfile('business');
      if (typeof S !== 'undefined') {
        S.user.onboardingComplete = true;
        S.pin = '123456';
        if (typeof Store !== 'undefined') Store.save();
      }
      document.getElementById('pgOnboard') && (document.getElementById('pgOnboard').style.display = 'none');
      document.getElementById('splashScreen')?.remove();
      if (typeof R !== 'undefined' && R.unlock) R.unlock();
      if (typeof WhatsNew !== 'undefined' && window.VER) localStorage.setItem('vos_wn_ver', window.VER);
      if (typeof Modal !== 'undefined') Modal.close();
    } catch (_) { /* continue */ }
  });
  await page.waitForTimeout(500);
  await applyPersonaOverlay(page, personaName, opts);
}

async function runStep(page, step) {
  if (step.action === 'wait') {
    await page.waitForTimeout(step.ms || 500);
    return;
  }
  if (step.action === 'nav' && step.page) {
    await page.evaluate((pg) => {
      try {
        if (typeof R !== 'undefined' && R.goto) R.goto(pg);
        else if (typeof window.go === 'function') window.go(pg);
      } catch (e) {
        console.warn('nav failed', pg, e && e.message);
      }
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
const personaMeta = loadPersonaMeta(appInfo.slug, personaId, appInfo.root, script);
const personaName = personaMeta.name || null;
const overlayOpts = { largeText: personaMeta.largeText };
const outDir = join(LAB, 'content', 'stories', appInfo.slug, personaShort(personaId));
mkdirSync(outDir, { recursive: true });

const pwCore = resolvePwCore();
if (!pwCore) {
  console.error('capture-story: set PW_CORE to playwright-core');
  process.exit(2);
}

const DEVICE_ALIAS = {
  'iphone-16-pro': 'iphone',
  'ipad-air': 'ipad',
  'macbook-14': 'mac',
};

const { chromium } = await import(pathToFileURL(join(pwCore, 'index.mjs')).href);
const { server, baseUrl } = await startStatic(appInfo.root);
const manifest = {
  personaId,
  personaName,
  app: appInfo.slug,
  gitSha: gitSha(appInfo.root),
  capturedAt: new Date().toISOString(),
  files: [],
};

const storyOnly = process.env.STORY_DEVICES === '1';
const canonicalOnly = process.env.CANONICAL_ONLY === '1';
const themes = canonicalOnly || storyOnly ? ['light'] : ['light', 'dark'];
const viewports = canonicalOnly
  ? VIEWPORTS.filter(([n]) => n === 'iphone-16-pro')
  : storyOnly
    ? VIEWPORTS
    : VIEWPORTS;

try {
  for (const theme of themes) {
    for (const [deviceName, viewport] of viewports) {
      const browser = await chromium.launch();
      const context = await browser.newContext({ ...viewport, colorScheme: theme, baseURL: baseUrl });
      const page = await context.newPage();
      if (appInfo.slug === 'vaultcap') await unlockVaultSample(page, baseUrl, personaName, overlayOpts);
      else {
        await runPrep(page, baseUrl, script.prep);
        await applyPersonaOverlay(page, personaName, overlayOpts);
      }
      let stepIndex = 0;
      for (const step of script.steps || []) {
        await runStep(page, step);
        if (step.action === 'wait' || step.action === 'click' || step.action === 'nav') {
          if (step.action !== 'screenshot' && !step.screenshot) continue;
        }
        if (step.action && step.action !== 'screenshot' && !step.screenshot) continue;
        await applyPersonaOverlay(page, personaName, overlayOpts);
        const id = step.id || 'shot';
        const base = `${id}-${deviceName}-${theme}`;
        const png = join(outDir, `${base}.png`);
        await page.screenshot({ path: png, fullPage: false });
        const webp = join(outDir, `${base}.webp`);
        const cwebp = spawnSync('cwebp', ['-quiet', '-q', '80', png, '-o', webp]);
        manifest.files.push({ step: id, device: deviceName, theme, png: basename(png), webp: cwebp.status === 0 ? basename(webp) : null });
        if (theme === 'light') {
          const alias = DEVICE_ALIAS[deviceName] || 'iphone';
          const storyDay = personaMeta.day[stepIndex];
          const storyName = storyDay?.shot
            ? basename(storyDay.shot)
            : `${String(stepIndex + 1).padStart(2, '0')}-${alias}`;
          if (deviceName === 'iphone-16-pro') {
            writeFileSync(join(outDir, `${id}.png`), readFileSync(png));
            if (cwebp.status === 0) writeFileSync(join(outDir, `${id}.webp`), readFileSync(webp));
          }
          /* Story JSON expects NN-<device> matching day[].device */
          if (storyDay?.device === alias || (!storyDay && alias === 'iphone')) {
            writeFileSync(join(outDir, `${storyName}.png`), readFileSync(png));
            if (cwebp.status === 0) writeFileSync(join(outDir, `${storyName}.webp`), readFileSync(webp));
          }
        }
        stepIndex += 1;
      }
      await browser.close();
    }
  }
} finally {
  server.close();
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`capture-story: ${manifest.files.length} shots → ${outDir}${personaName ? ` (${personaName})` : ''}`);
