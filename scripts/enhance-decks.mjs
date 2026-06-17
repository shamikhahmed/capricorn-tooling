#!/usr/bin/env node
/**
 * Full deck enhancement: Apple-grade copy, real screenshots, bug fixes.
 * Source of truth: shamikhahmed.github.io/js/products-data.js
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { WORKSPACE_ROOT as ROOT, SCRIPTS_DIR, SHARED_DIR } from './lib/workspace-root.mjs';
const CATALOG_PATH = join(ROOT, 'shamikhahmed.github.io/js/products-data.js');
const SHOT = 'https://shamikhahmed.github.io/assets/screenshots';

const code = readFileSync(CATALOG_PATH, 'utf8');
const fn = new Function(`${code}; return PRODUCTS;`);
const catalog = fn();

const DECK_CSS = `
.deck-shot{display:block;width:100%;height:auto;margin:0;object-fit:cover;object-position:top center}
.phone-b:has(.deck-shot),.phone-body:has(.deck-shot),.phone-screen:has(.deck-shot),.phone-inner:has(.deck-shot),.term-b:has(.deck-shot){padding:0!important;min-height:0!important;overflow:hidden}
.term-b .deck-shot{border-radius:0 0 12px 12px}
.deck-shot-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:1.5rem 0}
.deck-shot-frame{width:min(100%,280px);border-radius:24px;overflow:hidden;border:2px solid rgba(255,255,255,.12);box-shadow:0 20px 50px rgba(0,0,0,.35)}
`;

const PROBLEM_HEADLINES = {
  vaultcap: 'Finance is fragmented.',
  pulsecap: 'Training apps want your subscription.',
  prismcap: 'Party games need friction.',
  steadycap: 'Recovery tools are fragmented.',
  ledgercap: 'Pakistani wealth is scattered.',
  deeponycap: 'Collectors deserve a stable.',
  scentcap: 'Your wardrobe is scattered.',
  auracap: 'Your ecosystem is fragmented.',
};

const S3_CYCLER = {
  auracap: 'One studio. Every device.',
  scentcap: 'One wardrobe. Every season.',
  deeponycap: 'One stable. Every pony.',
  ledgercap: 'One ledger. Every market.',
  pulsecap: 'One log. Every PR.',
  prismcap: 'One phone. Every game.',
};

const APPS = [
  { slug: 'vaultcap', pitch: 'VaultCap/pitch.html', presentation: 'VaultCap/presentation.html' },
  { slug: 'pulsecap', pitch: 'PulseCap/pitch.html', presentation: 'PulseCap/presentation.html' },
  { slug: 'prismcap', pitch: 'PrismCap/pitch.html', presentation: 'PrismCap/presentation.html' },
  { slug: 'steadycap', pitch: 'SteadyCap/pitch.html', presentation: 'SteadyCap/presentation.html' },
  { slug: 'ledgercap', pitch: 'LedgerCap/pitch.html', presentation: 'LedgerCap/presentation.html' },
  { slug: 'deeponycap', pitch: 'DeePonyCap/pitch.html', presentation: 'DeePonyCap/presentation.html' },
  { slug: 'scentcap', pitch: 'ScentCap/public/pitch.html', presentation: 'ScentCap/public/presentation.html' },
  { slug: 'auracap', pitch: 'AuraCap/public/pitch.html', presentation: 'AuraCap/public/presentation.html' },
];

/** screenshot index → filename suffix (-2 = dashboard/home) */
const PITCH_SHOTS = {
  auracap: [{ section: 's7', n: 2, bar: '◎ Dashboard' }],
  scentcap: [{ section: 's7', n: 2, bar: '🏠 Today' }],
  deeponycap: [
    { section: 's7', n: 2, bar: '🦄 Stable' },
    { section: 's9', n: 4, bar: '⭐ Wishlist' },
  ],
  ledgercap: [
    { section: 's7', n: 2, terminal: true, bar: 'Dashboard · Live', cleanupOrphans: true },
    { section: 's8', n: 3, terminal: true, bar: 'Holdings' },
    { section: 's9', n: 4, terminal: true, bar: '+ Add Transaction' },
    { section: 's10', n: 5, terminal: true, bar: 'Freedom Tracker' },
  ],
  pulsecap: [
    { section: 's8', insertPhone: true, n: 2, bar: 'Readiness' },
    { section: 's8', mock: 'score-ring', n: 5 },
  ],
  prismcap: [{ section: 's20', n: 2, mock: 'phone-inner' }],
  steadycap: [
    { section: 's5', n: 2, scroll: true },
    { section: 's6', mock: 'score-ring', n: 3 },
    { section: 's7', n: 3, scroll: true },
    { section: 's8', n: 4, scrollStyled: true },
  ],
  vaultcap: [{ section: 's7', insertGallery: true, shots: [2, 3, 4] }],
};

const PRES_SHOTS = {
  scentcap: [
    { slide: 's4', n: 2, bar: '🏠 Today', body: 'phone-body' },
    { slide: 's7', n: 5, bar: '🧪 Layering Lab', body: 'phone-body' },
  ],
  auracap: [{ slide: 's4', n: 2, bar: '◎ Dashboard', body: 'phone-body' }],
  deeponycap: [
    { slide: 's4', n: 2, bar: '🦄 Stable', body: 'phone-body' },
    { slide: 's7', n: 4, bar: '⭐ Wishlist', body: 'phone-body' },
    { slide: 's8', n: 5, bar: '📚 Shelves', body: 'phone-body' },
  ],
  ledgercap: [
    { slide: 's4', n: 2, body: 'term-body', bar: 'Dashboard · Live' },
    { slide: 's5', n: 3, body: 'term-body', bar: 'Portfolio' },
    { slide: 's6', n: 4, body: 'term-body', bar: '+ Add Transaction' },
    { slide: 's7', n: 5, body: 'term-body', bar: 'Income · Projection' },
  ],
  pulsecap: [
    { slide: 's8', insertHeadline: true, n: 3 },
    { slide: 's11', insertHeadline: true, mock: 'score-ring', n: 5 },
    { slide: 's12', insertHeadline: true, n: 5 },
  ],
  steadycap: [
    { slide: 's4', n: 2, scroll: true },
    { slide: 's5', mock: 'score-ring', n: 3 },
    { slide: 's6', insertHeadline: true, n: 2 },
  ],
  vaultcap: [
    { slide: 's5', insertSplit: true, n: 2, title: 'Dashboard' },
    { slide: 's7', mock: 'wcard-demo', n: 8 },
  ],
  prismcap: [{ slide: 's6', n: 2, body: 'phone-frame' }],
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function shotUrl(slug, n) {
  return n <= 1 ? `${SHOT}/${slug}.png` : `${SHOT}/${slug}-${n}.png`;
}

function imgTag(slug, n, alt) {
  return `<img class="deck-shot" src="${shotUrl(slug, n)}" alt="${esc(alt)}" width="280" height="606" loading="lazy" decoding="async">`;
}

function cardTitle(prob) {
  const t = prob.split('—')[0].split('.')[0].trim();
  return t.length > 42 ? `${t.slice(0, 39)}…` : t;
}

function injectDeckCss(html) {
  if (html.includes('.deck-shot{')) return html;
  return html.replace('</style>', `${DECK_CSS}\n</style>`);
}

function ensureAccent(html, accent) {
  if (html.includes('--accent:')) {
    return html.replace(/--accent:\s*[^;]+/, `--accent:${accent}`);
  }
  return html.replace(/:root\s*\{/, `:root{--accent:${accent};`);
}

function fixDuplicateRoadmap(html) {
  let n = 0;
  return html.replace(/id="s-roadmap"/g, (m) => {
    n += 1;
    return n === 1 ? m : 'id="s-roadmap-b"';
  });
}

function removeDuplicateDeckScript(html) {
  if (!html.includes('function goTo(')) return html;
  return html.replace(/\s*<script src="js\/capricorn-deck\.js"><\/script>\s*/g, '\n');
}

function fixVaultCounter(html) {
  return html.replace(/01\s*\/\s*25/g, '01 / 26');
}

function fixAiClaims(html) {
  return html
    .replace(/10 AI engines/gi, '10 Smart Assistant engines')
    .replace(/VaultCap AI/g, 'VaultCap Smart Import')
    .replace(/AI Designer/g, 'Smart Designer')
    .replace(/\bAI Adjusts\b/gi, 'Smart Assistant adjusts')
    .replace(/\bAI-powered\b/gi, 'Smart Assistant–powered');
}

function patchVanillaPitch(html, p) {
  const slug = p.slug;
  const headline = PROBLEM_HEADLINES[slug] || 'The status quo is broken.';
  const words = headline.replace(/\.$/, '').split(' ');
  const last = words.pop();
  const lead = words.join(' ');

  html = html.replace(
    /<h2 class="reveal">[\s\S]*?<span style="color:var\(--accent[^"]*\)">[\s\S]*?<\/span>[\s\S]*?<\/h2>/,
    `<h2 class="reveal">${esc(lead)} <span style="color:var(--accent)">${esc(last)}.</span></h2>`,
  );

  html = html.replace(
    /<section class="slide" id="s2">[\s\S]*?<section class="slide" id="s3">/,
    (block) => {
      const icons = ['📱', '🌡️', '🧪', '☁️'];
      const cards = p.problems.slice(0, 3).map((prob, i) => {
        const cls = i % 2 ? 'reveal-right' : 'reveal-left';
        const delay = `delay-${i + 1}`;
        return `<div class="card ${cls} ${delay}"><h3>${icons[i]} ${esc(cardTitle(prob))}</h3><p>${esc(prob)}</p></div>`;
      }).join('\n      ');
      let b = block.replace(
        /<p class="sub reveal delay-1">[^<]*<\/p>/,
        `<p class="sub reveal delay-1">${esc(p.problems[0])}</p>`,
      );
      b = b.replace(
        /<div class="cards">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>\s*<section class="slide" id="s3">/,
        `<div class="cards">\n      ${cards}\n    </div>\n  </div>\n</section>\n\n<section class="slide" id="s3">`,
      );
      return b;
    },
  );

  if (S3_CYCLER[slug]) {
    html = html.replace(
      /<h2 class="reveal section-title" id="s3-cycler">[^<]*<\/h2>/,
      `<h2 class="reveal section-title" id="s3-cycler">${esc(S3_CYCLER[slug])}</h2>`,
    );
  }

  html = html.replace(
    /<p class="sub reveal delay-2" style="color:var\(--blue\)[^"]*">[^<]*<\/p>/,
    `<p class="sub reveal delay-2" style="color:var(--blue);font-weight:700">${esc(p.promise)}</p>`,
  );

  const feats = p.features.slice(0, 4);
  const featCards = feats.map((f, i) =>
    `<div class="card reveal delay-${i + 1}"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></div>`,
  ).join('\n      ');
  html = html.replace(
    /<section class="slide" id="s8">[\s\S]*?<div class="cards">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
    (block) => block.replace(/<div class="cards">[\s\S]*?<\/div>/, `<div class="cards">\n      ${featCards}\n    </div>`),
  );

  if (html.includes('class="trust"')) {
    html = html.replace(
      /<div class="trust reveal delay-2">[\s\S]*?<\/div>/,
      `<div class="trust reveal delay-2">${esc(p.promise)}</div>`,
    );
  }

  return html;
}

function replacePhoneBody(html, innerClass, slug, n, alt) {
  const re = new RegExp(
    `(<div class="${innerClass}"[^>]*>)[\\s\\S]*?(<\\/div>)`,
    'g',
  );
  return html.replace(re, `$1${imgTag(slug, n, alt)}$2`);
}

function replacePhoneScroll(html, slug, n, alt) {
  return html.replace(
    /(<div class="phone-scroll">)[\s\S]*?(<\/div>\s*<div class="phone-nav")/g,
    `$1${imgTag(slug, n, alt)}$2`,
  );
}

function replaceTerminalBody(html, slug, n, alt) {
  return html.replace(
    /(<div class="term-b">)[\s\S]*?(<\/div>)/,
    `$1${imgTag(slug, n, alt)}$2`,
  );
}

function patchPitchScreenshots(html, slug, p) {
  const cfg = PITCH_SHOTS[slug] || [];
  const alts = p.screenshotAlts || [];

  for (const item of cfg) {
    const alt = alts[item.n - 1] || `${p.name} app screen`;
    const sectionRe = new RegExp(
      `(<section class="slide" id="${item.section}">[\\s\\S]*?)(</section>)`,
    );
    html = html.replace(sectionRe, (block, open, close) => {
      let b = block;
      if (item.bar) {
        b = b.replace(/(<div class="phone-h">)[^<]*(<\/div>)/, `$1${esc(item.bar)}$2`);
      }
      if (item.terminal) {
        b = b.replace(/(<div class="term-b">)[\s\S]*?(<\/div>)/, `$1${imgTag(slug, item.n, alt)}$2`);
        if (item.cleanupOrphans) {
          b = b.replace(/\s*<div class="nw"[\s\S]*?<\/div>\s*<div class="ticker-o"[\s\S]*?<\/div>/, '');
        }
      } else if (item.mock === 'score-ring') {
        b = b.replace(
          /<div class="score-ring"[^>]*>[\s\S]*?<\/div>/,
          `<div class="deck-shot-frame">${imgTag(slug, item.n, alt)}</div>`,
        );
      } else if (item.scrollStyled) {
        b = b.replace(
          /(<div class="phone-scroll"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>)/,
          `$1${imgTag(slug, item.n, alt)}$2`,
        );
      } else if (item.scroll) {
        b = b.replace(
          /(<div class="phone-scroll">)[\s\S]*?(<\/div>\s*<div class="phone-nav")/,
          `$1${imgTag(slug, item.n, alt)}$2`,
        );
      } else if (item.mock === 'phone-inner') {
        b = b.replace(
          /(<div class="phone-inner">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>)/,
          `$1${imgTag(slug, item.n, alt)}$2`,
        );
      } else if (item.insertPhone) {
        if (!b.includes('deck-shot')) {
          b = b.replace(
            /(<p class="sub reveal delay-3">)/,
            `<div class="deck-shot-frame reveal delay-2" style="margin:1.5rem auto">${imgTag(slug, item.n, alt)}</div>\n    $1`,
          );
        }
      } else if (item.insertGallery) {
        if (!b.includes('deck-shot-row')) {
          const frames = item.shots.map((n, i) =>
            `<div class="deck-shot-frame">${imgTag(slug, n, alts[n - 1] || alt)}</div>`,
          ).join('');
          b = b.replace(
            /(<h2 class="(?:section-title reveal|reveal section-title)[^"]*">[\s\S]*?<\/h2>)/,
            `$1\n    <div class="deck-shot-row reveal delay-2">${frames}</div>`,
          );
        }
      } else {
        b = b.replace(
          /(<div class="phone-b"[^>]*>)[\s\S]*?(<\/div>)/,
          `$1${imgTag(slug, item.n, alt)}$2`,
        );
      }
      return b;
    });
  }
  return html;
}

function patchPresentation(html, slug, p) {
  const alts = p.screenshotAlts || [];
  const cfg = PRES_SHOTS[slug] || [];

  // Hero slide copy
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${esc(p.name)} — ${esc(p.tagline)}</title>`,
  );

  if (html.includes('class="s1-title"')) {
    html = html.replace(
      /(<div class="sub a3">)[^<]*(<\/div>)/,
      `$1${esc(p.pitch.split('.')[0] + '.')}$2`,
    );
    html = html.replace(
      /(<div class="sub a4"[^>]*>)[^<]*(<\/div>)/,
      `$1${esc(p.hook)}$2`,
    );
  }

  // Pain items from catalog
  if (html.includes('class="pain-item"') && html.includes('class="pain a3"')) {
    const icons = ['📱', '🌡️', '🧪', '☁️'];
    const pains = p.problems.slice(0, 4).map((prob, i) => {
      const title = cardTitle(prob);
      return `<div class="pain-item"><span>${icons[i]}</span><div><strong style="color:#fff">${esc(title)}</strong><br>${esc(prob)}</div></div>`;
    }).join('\n    ');
    html = html.replace(
      /<div class="pain a3">[\s\S]*?<\/div>\s*<\/div>\s*<div class="slide" id="s3">/,
      `<div class="pain a3">\n    ${pains}\n  </div>\n</div>\n\n<div class="slide" id="s3">`,
    );
  }

  for (const item of cfg) {
    const alt = alts[item.n - 1] || `${p.name} screen`;
    if (item.slide) {
      const slideBlock = new RegExp(
        `(<div class="slide" id="${item.slide}"[\\s\\S]*?)(<!-- SLIDE|<div class="slide"|</div>\\s*<script|</body>)`,
      );
      html = html.replace(slideBlock, (block, open, tail) => {
        let b = open;
        if (item.bar) {
          b = b.replace(/(<div class="phone-bar">)[^<]*(<\/div>)/, `$1${esc(item.bar)}$2`);
        }
        if (item.terminal) {
          b = b.replace(/(<div class="term-b">)[\s\S]*?(<\/div>)/, `$1${imgTag(slug, item.n, alt)}$2`);
        } else if (item.mock === 'score-ring') {
          b = b.replace(
            /<div class="score-ring"[^>]*>[\s\S]*?<\/div>/,
            `<div class="deck-shot-frame">${imgTag(slug, item.n, alt)}</div>`,
          );
        } else if (item.mock === 'wcard-demo') {
          b = b.replace(
            /<div class="wcard-demo"[\s\S]*?<\/div>\s*<div class="wcard-demo"[\s\S]*?<\/div>\s*<div class="wcard-demo"[\s\S]*?<\/div>/,
            `<div class="deck-shot-frame anim" style="margin:24px auto;max-width:280px">${imgTag(slug, item.n, alt)}</div>`,
          );
        } else if (item.scroll) {
          b = b.replace(
            /(<div class="phone-scroll">)[\s\S]*?(<\/div>\s*<div class="phone-nav")/,
            `$1${imgTag(slug, item.n, alt)}$2`,
          );
        } else if (item.body === 'phone-frame') {
          b = b.replace(
            /(<div class="phone-screen">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>)/,
            `$1${imgTag(slug, item.n, alt)}$2`,
          );
        } else if (item.insertSplit) {
          if (!b.includes('deck-shot')) {
            b = b.replace(
              /(<div class="anim tagline" style="margin-bottom:24px">[\s\S]*?<\/div>)/,
              `$1\n  <div class="deck-shot-frame anim" style="margin:24px auto;max-width:280px">${imgTag(slug, item.n, alt)}</div>`,
            );
          }
        } else if (item.insertHeadline) {
          if (!b.includes('deck-shot')) {
            b = b.replace(
              /(<div class="headline a2[^"]*"[^>]*>[\s\S]*?<\/div>)/,
              `$1\n  <div class="deck-shot-frame a3" style="margin:20px auto;max-width:280px">${imgTag(slug, item.n, alt)}</div>`,
            );
          }
        } else if (item.body) {
          b = b.replace(
            new RegExp(`(<div class="${item.body}"[^>]*>)[\\s\\S]*?(<\\/div>)`),
            `$1${imgTag(slug, item.n, alt)}$2`,
          );
        }
        return b + tail;
      });
    }
  }

  return html;
}

function patchPremiumPitchHero(html, p) {
  html = html.replace(/<p class="s1-sub">[^<]*<\/p>/, `<p class="s1-sub">${esc(p.tagline)}</p>`);
  html = html.replace(/<p class="s1-tagline">[^<]*<\/p>/, `<p class="s1-tagline">${esc(p.tagline)}</p>`);
  html = html.replace(/<p class="s1-tag">[^<]*<\/p>/, `<p class="s1-tag">${esc(p.hook)}</p>`);
  return html;
}

let count = 0;

for (const app of APPS) {
  const p = catalog[app.slug];
  if (!p) continue;

  for (const [kind, rel] of [['pitch', app.pitch], ['presentation', app.presentation]]) {
    const path = join(ROOT, rel);
    if (!existsSync(path)) continue;

    let html = readFileSync(path, 'utf8');
    html = injectDeckCss(html);
    html = ensureAccent(html, p.accent);
    html = fixDuplicateRoadmap(html);
    html = fixAiClaims(html);
    html = removeDuplicateDeckScript(html);

    if (kind === 'pitch') {
      if (html.includes('s1-text') || html.includes('h1.grad')) {
        html = patchVanillaPitch(html, p);
      } else {
        html = patchPremiumPitchHero(html, p);
      }
      html = patchPitchScreenshots(html, app.slug, p);
    } else {
      html = patchPresentation(html, app.slug, p);
      if (app.slug === 'vaultcap') html = fixVaultCounter(html);
    }

    writeFileSync(path, html);
    count += 1;
    console.log(`✓ ${kind} ${app.slug}`);
  }
}

console.log(`\nEnhanced ${count} deck file(s).`);
