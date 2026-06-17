#!/usr/bin/env node
/**
 * Injects GSAP + Capricorn cinematic stack into every app HTML surface.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const VANILLA_APPS = [
  'LedgerCap', 'VaultCap', 'PulseCap', 'PrismCap', 'SteadyCap', 'DeePonyCap',
];

const REACT_PUBLIC = [
  { app: 'ScentCap', base: 'public' },
  { app: 'AuraCap', base: 'public' },
];

const HUB = 'shamikhahmed.github.io';

function has(html, marker) {
  return html.includes(marker);
}

function injectBeforeBodyClose(html, snippet) {
  const idx = html.lastIndexOf('</body>');
  if (idx === -1) return html;
  return html.slice(0, idx) + snippet + '\n' + html.slice(idx);
}

function injectBeforeHeadClose(html, snippet) {
  const idx = html.lastIndexOf('</head>');
  if (idx === -1) return html;
  return html.slice(0, idx) + snippet + '\n' + html.slice(idx);
}

function relJsPath(htmlPath, appRoot) {
  const depth = relative(appRoot, dirname(htmlPath)).split(/[/\\]/).filter(Boolean).length;
  return depth > 0 ? '../'.repeat(depth) + 'js/' : 'js/';
}

function relCssPath(htmlPath, appRoot) {
  const depth = relative(appRoot, dirname(htmlPath)).split(/[/\\]/).filter(Boolean).length;
  return depth > 0 ? '../'.repeat(depth) + 'css/' : 'css/';
}

function classify(htmlPath, html) {
  const base = htmlPath.split(/[/\\]/).pop().toLowerCase();
  if (base === 'index.html' && html.includes('id="root"')) return 'react-entry';
  if (base === 'index.html' && html.includes('home-experience.js')) return 'hub-home';
  if (base === 'index.html') return 'app-index';
  if (base === 'presentation.html') {
    if (has(html, 'function go(n)') || has(html, 'data-cap-deck="pro"')) return 'presentation-pro';
    return 'presentation';
  }
  if (base === 'pitch.html') return 'pitch';
  if (['landing.html', 'privacy.html', 'changelog.html', 'widget.html', '404.html', 'support.html', 'terms.html'].includes(base)) {
    return 'marketing';
  }
  if (html.includes('id="deck"') || html.includes('data-cap-deck')) return 'presentation';
  if (html.includes('section class="slide"') || html.includes('<section class="slide"')) return 'pitch';
  return 'marketing';
}

function stripInlineDeckScript(html) {
  return html.replace(
    /<script>\s*const slides=\[\.\.\.document\.querySelectorAll\('\.slide'\)\];[\s\S]*?requestAnimationFrame\(draw\);\s*\}\)\(\);\s*<\/script>/,
    '',
  );
}

function ensureCoreCss(html, cssBase) {
  if (has(html, 'capricorn-core.css')) return html;
  return injectBeforeHeadClose(html, `\n  <link rel="stylesheet" href="${cssBase}capricorn-core.css">`);
}

function patchAppIndex(html, jsBase) {
  let out = html;
  if (!has(out, 'capricorn-cinematic.js')) {
    out = out.replace(
      /<script src="[^"]*capricorn-premium-nav\.js"><\/script>/,
      (m) => `${m}\n  <script src="${jsBase}vendor/gsap.min.js"></script>\n  <script src="${jsBase}vendor/ScrollTrigger.min.js"></script>\n  <script src="${jsBase}capricorn-cinematic.js"></script>`,
    );
    if (!has(out, 'capricorn-cinematic.js')) {
      out = injectBeforeBodyClose(
        out,
        `\n  <script src="${jsBase}vendor/gsap.min.js"></script>\n  <script src="${jsBase}vendor/ScrollTrigger.min.js"></script>\n  <script src="${jsBase}capricorn-cinematic.js"></script>`,
      );
    }
  }
  out = out.replace(
    /if \(window\.CapricornScene\) CapricornScene\.init\(\{ canvas: '#cap-scene' \}\);/g,
    "if (window.CapCinematic) CapCinematic.init({ canvas: '#cap-scene' });",
  );
  if (!has(out, 'CapCinematic.init')) {
    const hasScene = has(out, 'id="cap-scene"') || has(out, 'cap-scene-canvas');
    const sceneOpt = hasScene ? "canvas: '#cap-scene'" : 'scene: false';
    out = out.replace(
      /document\.addEventListener\('DOMContentLoaded', function \(\) \{\s*if \(window\.CapPremiumNav\) CapPremiumNav\.init\([^)]*\);\s*\}\);/,
      `document.addEventListener('DOMContentLoaded', function () {
      if (window.CapPremiumNav) CapPremiumNav.init();
      if (window.CapCinematic) CapCinematic.init({ ${sceneOpt} });
    });`,
    );
    if (!has(out, 'CapCinematic.init')) {
      out = injectBeforeBodyClose(
        out,
        `\n  <script>document.addEventListener('DOMContentLoaded',function(){if(window.CapCinematic)CapCinematic.init({ ${sceneOpt} });});</script>`,
      );
    }
  }
  return out;
}

function patchPresentation(html, jsBase, cssBase, pro) {
  let out = html;
  out = stripInlineDeckScript(out);
  out = ensureCoreCss(out, cssBase);
  out = out.replace(/id="mist-canvas"/g, 'id="cap-scene" class="cap-scene-canvas cap-scene-canvas--subtle"');
  out = out.replace(/#mist-canvas/g, '#cap-scene');
  if (!has(out, 'cap-scroll-progress')) {
    out = out.replace('<body>', '<body>\n<div class="cap-scroll-progress" aria-hidden="true"></div>');
  }
  if (pro) {
    out = out.replace('<div id="deck">', '<div id="deck" data-cap-deck="pro">');
    out = out.replace(/<script src="[^"]*capricorn-deck\.js"><\/script>\n?/g, '');
    if (!has(out, 'capricorn-deck-pro.js')) {
      out = injectBeforeBodyClose(
        out,
        `\n  <script src="${jsBase}vendor/gsap.min.js"></script>\n  <script src="${jsBase}vendor/ScrollTrigger.min.js"></script>\n  <script src="${jsBase}capricorn-scene.js"></script>\n  <script src="${jsBase}capricorn-deck-pro.js"></script>`,
      );
    }
  } else if (!has(out, 'capricorn-deck.js')) {
    out = injectBeforeBodyClose(
      out,
      `\n  <script src="${jsBase}vendor/gsap.min.js"></script>\n  <script src="${jsBase}vendor/ScrollTrigger.min.js"></script>\n  <script src="${jsBase}capricorn-scene.js"></script>\n  <script src="${jsBase}capricorn-deck.js"></script>`,
    );
  }
  return out;
}

function patchPitch(html, jsBase, cssBase) {
  let out = html;
  out = out.replace(/<script src="[^"]*capricorn-deck\.js"><\/script>\n?/g, '');
  out = ensureCoreCss(out, cssBase);
  if (!has(out, 'capricorn-pitch.js')) {
    out = injectBeforeBodyClose(
      out,
      `\n  <script src="${jsBase}vendor/gsap.min.js"></script>\n  <script src="${jsBase}vendor/ScrollTrigger.min.js"></script>\n  <script src="${jsBase}capricorn-scene.js"></script>\n  <script src="${jsBase}capricorn-pitch.js"></script>`,
    );
  }
  return out;
}

function patchMarketing(html, jsBase, cssBase) {
  let out = html;
  out = ensureCoreCss(out, cssBase);
  if (has(out, 'capricorn-cinematic.js')) return out;
  if (!has(out, 'id="cap-scene"') && !has(out, 'id="webgl"')) {
    out = injectBeforeBodyClose(
      out,
      `\n  <canvas id="cap-scene" class="cap-scene-canvas cap-scene-canvas--subtle" aria-hidden="true"></canvas>`,
    );
  }
  if (!has(out, 'cap-scroll-progress')) {
    out = out.replace('<body>', '<body>\n<div class="cap-scroll-progress" aria-hidden="true"></div>');
  }
  out = injectBeforeBodyClose(
    out,
    `\n  <script src="${jsBase}vendor/gsap.min.js"></script>\n  <script src="${jsBase}vendor/ScrollTrigger.min.js"></script>\n  <script src="${jsBase}capricorn-scene.js"></script>\n  <script src="${jsBase}capricorn-motion.js"></script>\n  <script src="${jsBase}capricorn-cinematic.js"></script>\n  <script>document.addEventListener('DOMContentLoaded',function(){if(window.CapCinematic)CapCinematic.init({canvas:'#cap-scene'});});</script>`,
  );
  return out;
}

function patchHubMarketing(html, jsBase, cssBase) {
  let out = html;
  if (has(out, 'home-experience.js')) return out;
  out = ensureCoreCss(out, cssBase);
  if (has(out, 'capricorn-cinematic.js')) return out;
  if (!has(out, 'cap-scene') && !has(out, 'webgl')) {
    out = injectBeforeBodyClose(
      out,
      `\n  <canvas id="cap-scene" class="cap-scene-canvas cap-scene-canvas--subtle" aria-hidden="true"></canvas>`,
    );
  }
  if (!has(out, 'cap-scroll-progress') && !has(out, 'scroll-progress')) {
    out = out.replace('<body>', '<body>\n<div class="cap-scroll-progress" aria-hidden="true"></div>');
  }
  out = injectBeforeBodyClose(
    out,
    `\n  <script src="${jsBase}vendor/gsap.min.js"></script>\n  <script src="${jsBase}vendor/ScrollTrigger.min.js"></script>\n  <script src="${jsBase}capricorn-scene.js"></script>\n  <script src="${jsBase}capricorn-cinematic.js"></script>\n  <script>document.addEventListener('DOMContentLoaded',function(){if(window.CapCinematic)CapCinematic.init({canvas:'#cap-scene'});});</script>`,
  );
  return out;
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage']);

function listHtmlFiles(dir, appRoot = dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...listHtmlFiles(p, appRoot));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function patchFile(htmlPath, appRoot) {
  const jsBase = relJsPath(htmlPath, appRoot);
  const cssBase = relCssPath(htmlPath, appRoot);
  const raw = readFileSync(htmlPath, 'utf8');
  const kind = classify(htmlPath, raw);
  let next = raw;

  switch (kind) {
    case 'react-entry':
      return null;
    case 'hub-home':
      return null;
    case 'app-index':
      next = patchAppIndex(raw, jsBase);
      break;
    case 'presentation-pro':
      next = patchPresentation(raw, jsBase, cssBase, true);
      break;
    case 'presentation':
      next = patchPresentation(raw, jsBase, cssBase, false);
      break;
    case 'pitch':
      next = patchPitch(raw, jsBase, cssBase);
      break;
    case 'marketing':
      next = appRoot.includes(HUB)
        ? patchHubMarketing(raw, jsBase, cssBase)
        : patchMarketing(raw, jsBase, cssBase);
      break;
    default:
      return null;
  }

  if (next === raw) return null;
  writeFileSync(htmlPath, next);
  return kind;
}

let patched = 0;

for (const app of VANILLA_APPS) {
  const appRoot = join(ROOT, app);
  for (const file of listHtmlFiles(appRoot)) {
    const kind = patchFile(file, appRoot);
    if (kind) {
      patched++;
      console.log(`✓ ${relative(ROOT, file)} (${kind})`);
    }
  }
}

for (const { app, base } of REACT_PUBLIC) {
  const appRoot = join(ROOT, app);
  for (const file of listHtmlFiles(join(appRoot, base))) {
    const kind = patchFile(file, appRoot);
    if (kind) {
      patched++;
      console.log(`✓ ${relative(ROOT, file)} (${kind})`);
    }
  }
}

for (const file of listHtmlFiles(join(ROOT, HUB))) {
  const kind = patchFile(file, join(ROOT, HUB));
  if (kind) {
    patched++;
    console.log(`✓ ${relative(ROOT, file)} (${kind})`);
  }
}

console.log(`cinematic applied to ${patched} file(s)`);
