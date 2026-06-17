#!/usr/bin/env node
/** Generate privacy.html + changelog.html from PRIVACY.md / CHANGELOG.md per app */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apps = ['VaultOS', 'FitnessOS', 'PrismOS', 'DisciplineOS', 'StundsOS', 'DeePonyOS'];

const themes = {
  VaultOS: { accent: '#5b8dee', bg: '#080808', text: '#f0f0f0', dim: '#adadad' },
  FitnessOS: { accent: '#00d5ff', bg: '#0d0d0f', text: '#e8e8f0', dim: '#888899' },
  PrismOS: { accent: '#a855f7', bg: '#0a0a12', text: '#eee', dim: '#888' },
  DisciplineOS: { accent: '#30d158', bg: '#0a0f0a', text: '#e8f0e8', dim: '#8a9a8a' },
  StundsOS: { accent: '#FF6B35', bg: '#0B0E11', text: '#EAECEF', dim: '#848E9C' },
  DeePonyOS: { accent: '#ff6b9d', bg: '#1a1020', text: '#fff5f8', dim: '#c4a0b0' },
};

function mdToHtml(md) {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/^(?!<[hul])(.+)$/gm, (m) => m.trim() ? `<p>${m}</p>` : '')
    .replace(/\n{2,}/g, '\n');
}

function page(app, title, bodyHtml) {
  const t = themes[app];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="${t.accent}">
<title>${title} — ${app}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:${t.bg};color:${t.text};line-height:1.65;padding:24px;max-width:720px;margin:0 auto}
a{color:${t.accent}}
nav{margin-bottom:28px;font-size:14px}
nav a{margin-right:12px;color:${t.dim}}
h1{font-size:1.75rem;margin:24px 0 12px;letter-spacing:-.02em}
h2{font-size:1.15rem;margin:20px 0 8px;color:${t.accent}}
h3{font-size:1rem;margin:16px 0 6px}
p,li{font-size:15px;color:${t.dim};margin-bottom:10px}
ul{margin:8px 0 16px 20px}
code{background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-size:.9em}
footer{margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:${t.dim}}
</style>
</head>
<body>
<nav>
  <a href="landing.html">← ${app}</a>
  <a href="index.html">App</a>
  <a href="presentation.html">Presentation</a>
  <a href="pitch.html">Pitch</a>
</nav>
<article>${bodyHtml}</article>
<footer>© 2026 Shamikh Ahmed · <a href="https://github.com/shamikhahmed/${app}">GitHub</a></footer>
</body>
</html>`;
}

for (const app of apps) {
  const base = join(root, app);
  for (const [src, out, label] of [
    ['PRIVACY.md', 'privacy.html', 'Privacy Policy'],
    ['CHANGELOG.md', 'changelog.html', 'Changelog'],
  ]) {
    const path = join(base, src);
    if (!existsSync(path)) continue;
    const html = page(app, label, mdToHtml(readFileSync(path, 'utf8')));
    writeFileSync(join(base, out), html);
    console.log('wrote', `${app}/${out}`);
  }
}
