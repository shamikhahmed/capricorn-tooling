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

/** Playwright requires `viewport: { width, height }` — top-level width/height are ignored (defaults to 1280×720). */
const VIEWPORTS = [
  ['iphone-16-pro', {
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  }],
  ['ipad-air', {
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  }],
  ['macbook-14', {
    viewport: { width: 1512, height: 982 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  }],
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
  if (p.endsWith('.wasm')) return 'application/wasm';
  return 'application/octet-stream';
}

/**
 * Resolve a working static (or CAPTURE_BASE_URL) target per app.
 * Next/Expo/Flutter roots 404 when served from the repo root — use export dirs
 * (and GH Pages basePath prefixes) so capture hits a live SPA, not a 404 page.
 */
function resolveServeTarget(slug, appRoot) {
  if (process.env.CAPTURE_BASE_URL) {
    return { mode: 'url', baseUrl: process.env.CAPTURE_BASE_URL.replace(/\/$/, ''), close: async () => {} };
  }
  const candidates = {
    travelcap: [{ dir: 'out', prefix: '/TravelCap' }, { dir: 'out', prefix: '' }],
    cookcap: [{ dir: 'out', prefix: '/CookCap' }, { dir: 'out', prefix: '' }],
    /* Expo web export uses absolute /IdeaCap/_expo/... asset URLs */
    ideacap: [{ dir: 'dist', prefix: '/IdeaCap' }, { dir: 'dist', prefix: '' }],
    deefoodie: [{ dir: 'mobile/build/web', prefix: '' }, { dir: 'build/web', prefix: '' }],
    deefoodieapp: [{ dir: 'mobile/build/web', prefix: '' }],
    soulcap: [{ dir: 'docs', prefix: '' }],
  };
  for (const c of candidates[slug] || []) {
    const serveRoot = join(appRoot, c.dir);
    if (existsSync(join(serveRoot, 'index.html'))) {
      return { mode: 'static', serveRoot, urlPrefix: c.prefix || '', spa: true };
    }
  }
  if (existsSync(join(appRoot, 'index.html'))) {
    return { mode: 'static', serveRoot: appRoot, urlPrefix: '', spa: true };
  }
  throw new Error(
    `capture-story: no serveable index.html for ${slug}. Build export (out/dist/docs/web) or set CAPTURE_BASE_URL.`,
  );
}

function resolveStaticFile(serveRoot, relPath) {
  const clean = relPath.replace(/^\/+/, '');
  const candidates = [];
  if (!clean || clean.endsWith('/')) {
    candidates.push(join(serveRoot, clean, 'index.html'));
  } else {
    candidates.push(join(serveRoot, clean));
    candidates.push(join(serveRoot, `${clean}.html`));
    candidates.push(join(serveRoot, clean, 'index.html'));
  }
  for (const f of candidates) {
    if (!f.startsWith(serveRoot) || !existsSync(f)) continue;
    try {
      readFileSync(f);
      return f;
    } catch {
      /* directory */
    }
  }
  return null;
}

function startStatic(serveRoot, { urlPrefix = '', spa = true } = {}) {
  const prefix = (urlPrefix || '').replace(/\/$/, '');
  const server = createServer((req, res) => {
    const raw = decodeURIComponent((req.url || '/').split('?')[0]);
    if (prefix) {
      if (raw === '/' || raw === '') {
        res.writeHead(302, { Location: `${prefix}/` });
        res.end();
        return;
      }
      if (raw !== prefix && !raw.startsWith(`${prefix}/`)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
    }
    const stripped = prefix ? (raw.slice(prefix.length) || '/') : raw;
    let file = resolveStaticFile(serveRoot, stripped);
    if (!file && spa && !/\.[a-zA-Z0-9]{1,8}$/.test(stripped)) {
      file = resolveStaticFile(serveRoot, '/');
    }
    if (!file) {
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
      const baseUrl = `http://127.0.0.1:${port}${prefix}`;
      resolve({ server, baseUrl });
    });
  });
}

async function startCaptureServer(slug, appRoot) {
  const target = resolveServeTarget(slug, appRoot);
  if (target.mode === 'url') return target;
  const { server, baseUrl } = await startStatic(target.serveRoot, {
    urlPrefix: target.urlPrefix,
    spa: target.spa !== false,
  });
  const probe = await fetch(`${baseUrl}/`).catch(() => null);
  if (!probe || probe.status >= 400) {
    server.close();
    throw new Error(`capture-story: ${slug} serve probe failed (${probe?.status || 'network'}) at ${baseUrl}/`);
  }
  console.log(`capture-story: serving ${slug} → ${baseUrl} (root ${target.serveRoot})`);
  return {
    mode: 'static',
    baseUrl,
    close: async () => { server.close(); },
  };
}

async function runPrep(page, baseUrl, prep, { slug } = {}) {
  for (const step of prep || []) {
    /* Expo web never reaches networkidle (HMR websocket) — use domcontentloaded. */
    const waitUntil = slug === 'ideacap' ? 'domcontentloaded' : 'load';
    if (step.action === 'goto') await page.goto(`${baseUrl}${step.path || '/'}`, { waitUntil, timeout: 90000 });
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
  'soulcap-amina': 'Amina Otieno',
  'soulcap-tom': 'Tom Weber',
  'soulcap-zainab': 'Zainab Farooq',
  'travelcap-sana': 'Sana & Kamran',
  'travelcap-hassan': 'Hassan Qureshi',
  'travelcap-malik': 'The Malik family',
  'cookcap-mariam': 'Mariam Syed',
  'cookcap-rohan': 'Rohan Mehta',
  'cookcap-shahida': 'Shahida Begum',
  'ideacap-zara': 'Zara Malik',
  'ideacap-kevin': 'Kevin Ortiz',
  'ideacap-hamid': 'Hamid Siddiqui',
  'deefoodie-dee': 'Dee Rahman',
  'deefoodie-arsalan': 'Arsalan Khan',
  'deefoodie-noor': 'Noor Fatima',
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

      if (typeof buildNav === 'function') buildNav();
      const pg = (typeof S !== 'undefined' && S.currentPage) || 'dashboard';
      if (typeof R !== 'undefined' && R.goto) R.goto(pg);
      else if (typeof Dash !== 'undefined' && Dash.render) Dash.render();
      else if (typeof Dashboard !== 'undefined' && Dashboard.render) Dashboard.render();
      else if (typeof render === 'function') render();

      /* DOM force — survives partial re-renders that miss S.user */
      const ver = typeof VER !== 'undefined' ? VER : '';
      const sbLabel = ver ? `${name} · v${ver}` : name;
      const paintName = () => {
        const greet = document.getElementById('dashGreet');
        if (greet) {
          const hour = new Date().getHours();
          const hi = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
          greet.innerHTML = `<div class="dg-greet">${hi}</div><div class="dg-name">${name}</div>`;
        }
        document.querySelectorAll('.dg-name').forEach((el) => { el.textContent = name; });
        const sbUser = document.getElementById('sbUser');
        if (sbUser) sbUser.textContent = sbLabel;
        document.querySelectorAll('#navUserName, .nav-user-name, .set-user-name, [data-nav-user]').forEach((navName) => {
          navName.textContent = sbLabel;
        });
        document.body.querySelectorAll('*').forEach((el) => {
          if (el.children.length && el.id !== 'sbUser') return;
          const t = (el.textContent || '').trim();
          if (!t) return;
          if (/Alex Khan/i.test(t) || t === 'ALEX KHAN' || /Alex \(Demo\)/i.test(t) || t === 'Alex Demo') {
            el.textContent = /Alex Khan/i.test(t)
              ? t.replace(/Alex Khan/gi, name)
              : (t.includes('·') || t.includes('•') ? sbLabel : (/^ALEX KHAN$/.test(t) ? upper : name));
          }
        });
      };
      paintName();
      setTimeout(paintName, 50);
      setTimeout(paintName, 200);
      if (typeof NavUI !== 'undefined' && NavUI.renderUser) NavUI.renderUser();
      if (typeof updateNavUser === 'function') updateNavUser();

      /* Visible persona label for story OCR (Next/Expo/Flutter/vanilla) */
      let badge = document.getElementById('cap-story-persona');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'cap-story-persona';
        badge.setAttribute('data-story-persona', name);
        badge.style.cssText = [
          'position:fixed', 'top:max(10px,env(safe-area-inset-top))', 'left:10px',
          'z-index:2147483646', 'font:600 14px/1.25 -apple-system,BlinkMacSystemFont,system-ui,sans-serif',
          'color:#111', 'background:rgba(255,255,255,.94)', 'padding:6px 10px',
          'border-radius:8px', 'box-shadow:0 1px 4px rgba(0,0,0,.12)', 'pointer-events:none',
          'max-width:70vw', 'overflow:hidden', 'text-overflow:ellipsis', 'white-space:nowrap',
        ].join(';');
        document.body.appendChild(badge);
      }
      badge.textContent = name;
      badge.setAttribute('data-story-persona', name);
    } catch (_) { /* best-effort overlay */ }
  }, { name: personaName, largeText: !!opts.largeText });
  await page.waitForTimeout(550);
}

function loadPersonaMeta(slug, personaId, appRoot, script) {
  let day = [];
  let storyName = null;
  let seedName = null;
  const seedPath = join(appRoot, 'qa', 'v7', 'personas', `${personaId}.seed.json`);
  if (existsSync(seedPath)) {
    try {
      const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
      seedName = seed.profile?.displayName || seed.displayName || null;
    } catch { /* ignore */ }
  }
  const storyPath = join(LAB, 'content', 'stories', `${slug}.json`);
  if (existsSync(storyPath)) {
    try {
      const bundle = JSON.parse(readFileSync(storyPath, 'utf8'));
      const p = (bundle.personas || []).find((x) => x.id === personaId);
      if (p) {
        storyName = p.name || null;
        day = p.day || [];
      }
    } catch { /* ignore */ }
  }
  /* Prefer steps → story narrative → seed → map (story beats stale seed nicknames) */
  const name = script.personaName || storyName || seedName || PERSONA_SEED[personaId] || null;
  return { name, day, largeText: !!script.largeText, demoSeedNote: DEMO_DISPLAY_NAMES[slug] || '' };
}

async function dismissVaultChrome(page) {
  await page.evaluate(() => {
    if (window.VER) localStorage.setItem('vos_wn_ver', window.VER);
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vo_demo_guide_seen', '1');
    document.getElementById('splashScreen')?.remove();
    if (typeof Modal !== 'undefined') Modal.close();
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('on');
    document.querySelectorAll('.modal-overlay.on, .overlay.on').forEach((el) => el.classList.remove('on'));
    const tw = document.getElementById('toastWrap');
    if (tw) tw.innerHTML = '';
    ['moneySheet', 'assetsSheet', 'identitySheet', 'moreOverlay', 'vaultInstallBanner'].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    const moreSheet = document.getElementById('moreSheet');
    if (moreSheet) moreSheet.style.display = 'none';
    if (typeof closeMore === 'function') closeMore();
    if (typeof CMD !== 'undefined') CMD.close();
    if (typeof FAB !== 'undefined') FAB.close();
  });
  await page.locator('#overlay.on, .modal-overlay.on').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}

async function unlockVaultSample(page, baseUrl, personaName, opts = {}) {
  await page.addInitScript(() => {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vo_demo_guide_seen', '1');
    localStorage.removeItem('vc_lockout_v1_demo');
    /* Stamp early; corrected to window.VER after load so WhatsNew stays closed */
    localStorage.setItem('vos_wn_ver', '99.0.0');
  });
  const q = opts.largeText ? '/?demo=1&dt=1.6' : '/?demo=1';
  await page.goto(`${baseUrl}${q}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(
    () => typeof window.loadDemoProfile === 'function' && typeof window.R !== 'undefined' && typeof window.Store !== 'undefined',
    { timeout: 30000 },
  );
  await page.evaluate(() => {
    if (window.VER) localStorage.setItem('vos_wn_ver', window.VER);
  });
  await dismissVaultChrome(page);
  await page.evaluate(() => {
    loadDemoProfile('business');
    S.user.onboardingComplete = true;
    if (S.modules) S.modules.family = true;
    S.pin = '123456';
    Store.save();
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vo_demo_guide_seen', '1');
    if (window.VER) localStorage.setItem('vos_wn_ver', window.VER);
    document.getElementById('splashScreen')?.remove();
    ['pgHome', 'pgLock', 'pgOnboard', 'pgProfilePicker'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    R.unlock();
  });
  await page.waitForFunction(
    () => document.getElementById('app')?.style.display === 'flex',
    { timeout: 20000 },
  ).catch(() => {});
  await page.waitForFunction(
    () => (document.getElementById('dashGreet')?.textContent || '').trim().length > 0,
    { timeout: 20000 },
  ).catch(() => {});
  await dismissVaultChrome(page);
  await page.waitForTimeout(400);
  await applyPersonaOverlay(page, personaName, opts);
  if (personaName) {
    await page.waitForFunction(
      (name) => {
        const first = String(name).split(/\s+/)[0];
        const body = document.body?.innerText || '';
        const greet = document.getElementById('dashGreet')?.innerText || '';
        return (greet.includes(first) || body.includes(first)) && !body.includes('Alex Khan');
      },
      personaName,
      { timeout: 12000 },
    ).catch(() => {});
  }
}

const DEE_FOODIE_BETA_TOKEN = 'v7storycapturetokenxxxxxxxxxxxxxxxx'; // 36 chars — matches web/index.html MIN

/** Skip / mark onboarding so story shots hit journal routes, not the welcome carousel. */
async function dismissDeeFoodieOnboarding(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem('flutter.onboarding_completed', 'true');
    } catch (_) { /* ignore */ }
  });
  const skip = page.getByText(/^Skip$/i).first();
  if (await skip.isVisible({ timeout: 2500 }).catch(() => false)) {
    await skip.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200);
  }
  /* Still on welcome? hammer Continue a few times then Skip again. */
  for (let i = 0; i < 10; i++) {
    const welcome = await page.getByText(/Your Karachi food journal/i)
      .isVisible({ timeout: 800 }).catch(() => false);
    if (!welcome) break;
    const skip2 = page.getByText(/^Skip$/i).first();
    if (await skip2.isVisible({ timeout: 500 }).catch(() => false)) {
      await skip2.click({ force: true }).catch(() => {});
    } else {
      await page.getByRole('button', { name: /Continue|Start|Next/i }).last()
        .click({ timeout: 2000 }).catch(() => {});
    }
    await page.waitForTimeout(700);
  }
  const stuck = await page.getByText(/Your Karachi food journal/i)
    .isVisible({ timeout: 1500 }).catch(() => false);
  if (stuck) {
    throw new Error('dismissDeeFoodieOnboarding: still on onboarding welcome');
  }
}

/** HTML gate (sessionStorage) then Flutter WebBetaGateScreen (needs semantics tree). */
async function unlockDeeFoodieWebBeta(page, baseUrl) {
  await page.evaluate((t) => {
    try { sessionStorage.setItem('deefoodie_web_beta_token', t); } catch (_) { /* ignore */ }
  }, DEE_FOODIE_BETA_TOKEN);
  const gate = page.locator('#dfd-beta-gate[data-show="1"]');
  if (await gate.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.locator('#dfd-beta-token').fill(DEE_FOODIE_BETA_TOKEN);
    await page.locator('#dfd-beta-go').click({ timeout: 8000 }).catch(async () => {
      await page.keyboard.press('Enter');
    });
  } else if (baseUrl) {
    /* Init script may have seeded storage after first paint — reload so index.html bootstraps Flutter. */
    await page.goto(`${baseUrl.replace(/\/$/, '')}/`, { waitUntil: 'load', timeout: 90000 }).catch(() => {});
  }
  await page.waitForFunction(
    () => {
      const g = document.getElementById('dfd-beta-gate');
      if (g?.getAttribute('data-show') === '1') return false;
      return document.querySelector('flutter-view, flt-glass-pane, script[src*="flutter_bootstrap"]') != null;
    },
    { timeout: 90000 },
  ).catch(() => {});
  await page.waitForTimeout(4000);
  /* CanvasKit TextFields are not in DOM until semantics placeholder is activated */
  const sem = page.locator('flt-semantics-placeholder');
  if (await sem.count().catch(() => 0)) {
    await sem.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
  }
  const stillGated = await page.getByText(/Karachi food journal is invite-only/i)
    .isVisible({ timeout: 8000 }).catch(() => false);
  if (stillGated) {
    const field = page.locator('input[aria-label="Access token"], input[type="password"]').last();
    await field.click({ timeout: 10000 });
    await field.fill(DEE_FOODIE_BETA_TOKEN);
    await page.getByRole('button', { name: /^Continue$/i }).last().click({ timeout: 10000 }).catch(async () => {
      await page.keyboard.press('Enter');
    });
    await page.waitForFunction(
      () => !/Karachi food journal is invite-only|Private beta/i.test(document.body?.innerText || ''),
      { timeout: 60000 },
    );
  }
  /* Hard gate: never screenshot the Flutter beta wall. */
  const gated = await page.getByText(/Private beta|Karachi food journal is invite-only/i)
    .isVisible({ timeout: 2000 }).catch(() => false);
  if (gated) {
    throw new Error('unlockDeeFoodieWebBeta: still on WebBetaGateScreen after unlock');
  }
  await dismissDeeFoodieOnboarding(page);
  await page.waitForTimeout(1500);
}

async function waitForIdeaCapReady(page) {
  /* Expo web can paint a blank shell before the root hydrates — do not soft-fail. */
  await page.waitForFunction(
    () => {
      const t = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
      const root = document.getElementById('root') || document.getElementById('app');
      const hasUi = /IdeaCap|Capture|Search ideas|Inbox|Ideas for Caps/i.test(t);
      return hasUi && t.length > 40 && (!root || root.childElementCount > 0);
    },
    { timeout: 90000 },
  );
  await page.waitForTimeout(1500);
}

async function runStep(page, baseUrl, step) {
  if (step.action === 'wait') {
    await page.waitForTimeout(step.ms || 500);
    return;
  }
  if (step.action === 'goto' && step.path) {
    const waitUntil = step._slug === 'ideacap' ? 'domcontentloaded' : 'load';
    await page.goto(`${baseUrl}${step.path}`, { waitUntil, timeout: 90000 });
    if (step._slug === 'deefoodie' || step._slug === 'deefoodieapp') {
      await unlockDeeFoodieWebBeta(page, baseUrl);
      /* Flutter web often ignores path-only reloads — drive glass nav by label. */
      const tabByPath = {
        '/': 'Home',
        '/explore': 'Explore',
        '/map': 'Map',
        '/journal': 'Journal',
        '/profile': 'Profile',
      };
      const tab = tabByPath[step.path] || tabByPath[String(step.path).replace(/\/$/, '') || '/'];
      if (tab && tab !== 'Home') {
        await page.getByText(new RegExp(`^${tab}$`, 'i')).last()
          .click({ timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(900);
      }
    }
    if (step._slug === 'ideacap') {
      await waitForIdeaCapReady(page);
    }
    await page.waitForTimeout(step.waitMs || 900);
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
  if (step.action === 'click' && step.selector) {
    try {
      await page.locator(step.selector).first().click({ timeout: step.optional ? 2000 : 10000 });
      await page.waitForTimeout(600);
    } catch {
      if (!step.optional) throw new Error(`click failed: ${step.selector}`);
    }
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
const captureServer = await startCaptureServer(appInfo.slug, appInfo.root);
const baseUrl = captureServer.baseUrl;
const manifest = {
  personaId,
  personaName,
  app: appInfo.slug,
  gitSha: gitSha(appInfo.root),
  capturedAt: new Date().toISOString(),
  baseUrl,
  files: [],
};

const storyOnly = process.env.STORY_DEVICES === '1';
const canonicalOnly = process.env.CANONICAL_ONLY === '1';
/* Spec §5: iPhone + iPad + Mac, light + dark. STORY_DEVICES=1 = all devices (not light-only). */
const themes = process.env.STORY_THEMES
  ? process.env.STORY_THEMES.split(',').map((t) => t.trim()).filter(Boolean)
  : (canonicalOnly ? ['light'] : ['light', 'dark']);
const viewports = canonicalOnly
  ? VIEWPORTS.filter(([n]) => n === 'iphone-16-pro')
  : VIEWPORTS;

try {
  for (const theme of themes) {
    for (const [deviceName, viewport] of viewports) {
      const browser = await chromium.launch();
      const context = await browser.newContext({ ...viewport, colorScheme: theme, baseURL: baseUrl });
      if (appInfo.slug === 'deefoodie' || appInfo.slug === 'deefoodieapp') {
        await context.addInitScript((t) => {
          try {
            sessionStorage.setItem('deefoodie_web_beta_token', t);
            /* shared_preferences_web — skip onboarding for story capture */
            localStorage.setItem('flutter.onboarding_completed', 'true');
          } catch (_) { /* ignore */ }
        }, DEE_FOODIE_BETA_TOKEN);
      }
      const page = await context.newPage();
      if (appInfo.slug === 'vaultcap') await unlockVaultSample(page, baseUrl, personaName, overlayOpts);
      else {
        const prep = (script.prep && script.prep.length)
          ? script.prep
          : [{ action: 'goto', path: '/?demo=1' }, { action: 'wait', ms: 1000 }];
        /* Ensure demo seed path even when steps.json forgot ?demo=1 */
        const hasDemo = prep.some((s) => s.action === 'goto' && String(s.path || '').includes('demo=1'));
        const cookFor = appInfo.slug === 'cookcap' && personaName
          ? `/?demo=1&for=${encodeURIComponent(personaName.split(/[&]/)[0].trim().split(/\s+/)[0])}`
          : '/?demo=1';
        const prep2 = hasDemo
          ? prep
          : [{ action: 'goto', path: cookFor }, { action: 'wait', ms: 1200 }, ...prep];
        await runPrep(page, baseUrl, prep2, { slug: appInfo.slug });
        if (appInfo.slug === 'deefoodie' || appInfo.slug === 'deefoodieapp') {
          await unlockDeeFoodieWebBeta(page, baseUrl);
        }
        if (appInfo.slug === 'ideacap') {
          await waitForIdeaCapReady(page);
        }
        await applyPersonaOverlay(page, personaName, overlayOpts);
      }
      let stepIndex = 0;
      for (const step of script.steps || []) {
        await runStep(page, baseUrl, { ...step, _slug: appInfo.slug });
        const takeShot = step.action === 'screenshot'
          || !!step.screenshot
          || (step.action === 'goto' && step.screenshot !== false);
        if (!takeShot) continue;
        if (appInfo.slug === 'vaultcap') await dismissVaultChrome(page);
        if (appInfo.slug === 'deefoodie' || appInfo.slug === 'deefoodieapp') {
          await unlockDeeFoodieWebBeta(page, baseUrl);
        }
        await applyPersonaOverlay(page, personaName, overlayOpts);
        const id = step.id || 'shot';
        const base = `${id}-${deviceName}-${theme}`;
        const png = join(outDir, `${base}.png`);
        await page.screenshot({ path: png, fullPage: false });
        const webp = join(outDir, `${base}.webp`);
        const cwebp = spawnSync('cwebp', ['-quiet', '-q', '78', png, '-o', webp]);
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
  await captureServer.close();
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`capture-story: ${manifest.files.length} shots → ${outDir}${personaName ? ` (${personaName})` : ''}`);
