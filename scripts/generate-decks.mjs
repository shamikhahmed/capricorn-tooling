#!/usr/bin/env node
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const APPS = [
  {
    id: 'DisciplineOS',
    name: 'DisciplineOS',
    icon: '🧡',
    tagline: 'Personal Recovery & Daily Discipline OS',
    subtitle: 'Habits · Today routines · SOS · Hourly body healing',
    url: 'https://shamikhahmed.github.io/DisciplineOS/',
    github: 'https://github.com/shamikhahmed/DisciplineOS',
    accent: '#FF6B35',
    accent2: '#4ECDC4',
    ok: '#06D6A0',
    problem: 'Recovery is scattered across habit apps, notes, and willpower.',
    problemPoints: ['Cravings need one tap — not five apps', 'Medicines & skincare live in separate reminders', 'Body healing progress is invisible hour by hour'],
    solution: 'One offline command centre for quitting, routines, and crisis.',
    pillars: [
      { ic: '📅', t: 'Today', d: 'Medicines, skincare, hair, habit checklists' },
      { ic: '🫁', t: 'SOS', d: 'Phased emergency protocol when cravings hit' },
      { ic: '🧬', t: 'Recovery DB', d: 'Hourly body milestones for 72h per habit' },
      { ic: '🔔', t: 'Reminders', d: 'Push + in-app gentle nudges' },
    ],
    features: ['Custom & built-in habits', 'Journal + trigger intelligence', 'Export/import all data', 'Spiritual mode optional'],
    audience: 'Anyone quitting vape, cigarettes, doomscrolling, or building daily discipline.',
    year: '2026',
  },
  {
    id: 'PrismOS',
    name: 'PrismOS',
    icon: '✨',
    tagline: '38 Offline Games · Pass & Play',
    subtitle: 'Solo to large groups · Bots · Eco performance mode',
    url: 'https://shamikhahmed.github.io/PrismOS/',
    github: 'https://github.com/shamikhahmed/PrismOS',
    accent: '#C77DFF',
    accent2: '#FF2D78',
    ok: '#00E5FF',
    problem: 'Party games need props, hosts, and Wi‑Fi — phones should be enough.',
    problemPoints: ['App store games want accounts and ads', 'Pass-and-play is rare on mobile', 'Janky performance kills the fun'],
    solution: 'A pocket arcade — 38 games, one device, zero internet.',
    pillars: [
      { ic: '🎭', t: 'Deception', d: 'Shadow Protocol, Heist, Spy Hunt' },
      { ic: '⚡', t: 'Reflex', d: 'Neon Reflex, Rhythm Pulse, Quick Tap' },
      { ic: '♟️', t: 'Board', d: 'Chess, Ludo, Connect Four + bots' },
      { ic: '👥', t: '1–10+ players', d: 'Solo, duo, party, bot fill' },
    ],
    features: ['Eco mode by default', 'Themes & XP progression', 'Tournament brackets', 'QR device transfer'],
    audience: 'Friends at a table, solo commutes, family game night.',
    year: '2026',
  },
  {
    id: 'DeePonyOS',
    name: 'DeePonyOS',
    icon: '🦄',
    tagline: 'Stable Relationship Tracker',
    subtitle: 'Collection · Wishlist · Shelves · Anniversaries',
    url: 'https://shamikhahmed.github.io/DeePonyOS/',
    github: 'https://github.com/shamikhahmed/DeePonyOS',
    accent: '#FF6B9D',
    accent2: '#C77DFF',
    ok: '#FFD60A',
    problem: 'MLP collections and memories are scattered across photos and spreadsheets.',
    problemPoints: ['Hard to track owned vs wishlist ponies', 'Anniversaries get forgotten', 'No kid-friendly offline home for the fandom'],
    solution: 'A sparkly offline PWA for your Stable — collection, stats, milestones.',
    pillars: [
      { ic: '🏠', t: 'Stable', d: 'Your pony roster at a glance' },
      { ic: '💖', t: 'Wishlist', d: 'Dream ponies with priority tags' },
      { ic: '📚', t: 'Shelves', d: 'Organise by wave, store, or custom' },
      { ic: '🎂', t: 'Dates', d: 'Anniversaries & gen checklists' },
    ],
    features: ['Offline PWA', 'Photo-friendly cards', 'Generation trackers', 'Child-safe local data'],
    audience: 'Collectors, parents, and fans who want a dedicated Stable app.',
    year: '2026',
  },
  {
    id: 'FitnessOS',
    name: 'FitnessOS',
    icon: '💪',
    tagline: 'Intelligent Training Partner',
    subtitle: 'Workouts · Body map · Physique · Offline coach',
    url: 'https://shamikhahmed.github.io/FitnessOS/',
    github: 'https://github.com/shamikhahmed/FitnessOS',
    accent: '#00d5ff',
    accent2: '#6b5fff',
    ok: '#00ffaa',
    problem: 'Generic fitness apps ignore your equipment, injuries, and physique goals.',
    problemPoints: ['Cookie-cutter programs waste gym time', 'Injury history rarely respected', 'Progress photos live outside the workout log'],
    solution: 'A training OS that adapts to your body, gear, and archetype.',
    pillars: [
      { ic: '🏋️', t: 'Workouts', d: '300+ exercises, smart splits' },
      { ic: '🗺️', t: 'Body map', d: 'Muscle coverage & weak points' },
      { ic: '📐', t: 'Physique', d: 'Archetype-driven programming' },
      { ic: '📈', t: 'Progress', d: 'PRs, quests, dashboards' },
    ],
    features: ['Equipment-aware setup', 'Injury modifiers', 'Calculators & hub', 'Fully offline PWA'],
    audience: 'Serious lifters who want a personal coach in their pocket.',
    year: '2026',
  },
  {
    id: 'StundsOS',
    name: 'StundsOS',
    icon: '📈',
    tagline: 'Personal Wealth Operating System',
    subtitle: 'PSX · Meezan funds · Net worth · Financial freedom',
    url: 'https://shamikhahmed.github.io/StundsOS/',
    github: 'https://github.com/shamikhahmed/StundsOS',
    accent: '#FF6B35',
    accent2: '#30D158',
    ok: '#64D2FF',
    problem: 'Pakistani wealth is split across PSX, funds, gold, and spreadsheets.',
    problemPoints: ['No single PSX + Islamic fund view', 'Transactions scattered in notes', 'Freedom date never calculated'],
    solution: 'Bloomberg-terminal clarity for your personal ledger — offline first.',
    pillars: [
      { ic: '📒', t: 'Ledger', d: 'Every buy, sell, dividend logged' },
      { ic: '💼', t: 'Portfolio', d: 'Holdings, allocation, P&amp;L' },
      { ic: '🇵🇰', t: 'PSX', d: 'Live prices via proxy worker' },
      { ic: '🎯', t: 'Freedom', d: 'FI number &amp; runway tracker' },
    ],
    features: ['Meezan fund support', 'Multi-currency', 'Export backup', 'Dashboard widgets'],
    audience: 'Investors tracking PSX, funds, and path to financial independence.',
    year: '2026',
  },
];

function presentationHtml(a) {
  const slides = [
    { label: a.year, h: a.name, sub: a.tagline, body: a.subtitle, cta: true },
    { label: 'The Problem', h: 'Scattered.', h2: 'Overwhelming.', body: a.problem, pains: a.problemPoints },
    { label: 'The Solution', h: a.name, body: a.solution, stats: [['0', 'Servers'], ['100%', 'Offline'], ['PWA', 'Install']] },
    { label: 'Pillars', h: 'Four pillars.', body: '', pillars: a.pillars },
    { label: 'Features', h: 'Built for daily use.', body: '', list: a.features },
    { label: 'Who it\'s for', h: a.audience, body: 'Private. On your device. No account required.' },
    { label: 'Live Now', h: 'Open '+a.name, body: 'Install on iPhone · Add to Home Screen · Works offline', cta: true },
  ];
  const total = slides.length;
  const slideHtml = slides.map((s, i) => {
    let inner = `<div class="anim label">${s.label}</div>`;
    if (s.h) inner += `<h2>${s.h}</h2>`;
    if (s.h2) inner += `<h2 style="color:var(--accent)">${s.h2}</h2>`;
    if (s.sub) inner += `<div class="tagline" style="font-size:1.2rem;color:var(--text);margin-bottom:8px">${s.sub}</div>`;
    if (s.body) inner += `<div class="tagline">${s.body}</div>`;
    if (s.pains) inner += `<div class="pain">${s.pains.map(p=>`<div class="pain-item"><span>•</span>${p}</div>`).join('')}</div>`;
    if (s.stats) inner += `<div class="stat-row">${s.stats.map(([v,k])=>`<div class="stat"><div class="sv">${v}</div><div class="sk">${k}</div></div>`).join('')}</div>`;
    if (s.pillars) inner += `<div class="grid">${s.pillars.map(p=>`<div class="card"><div style="font-size:1.6rem">${p.ic}</div><div class="card-t">${p.t}</div><div class="card-d">${p.d}</div></div>`).join('')}</div>`;
    if (s.list) inner += `<div class="pills">${s.list.map(f=>`<div class="pill">${f}</div>`).join('')}</div>`;
    if (s.cta) inner += `<a class="url-big" href="${a.url}" target="_blank" rel="noopener">${a.url.replace('https://','')}</a>
      <div style="margin-top:16px;display:flex;gap:14px;flex-wrap:wrap;justify-content:center">
        <a href="pitch.html" style="font-size:12px;color:var(--text2)">Pitch deck</a>
        <a href="landing.html" style="font-size:12px;color:var(--text2)">Landing</a>
        <a href="docs/GUIDE.md" style="font-size:12px;color:var(--text2)">Guide</a>
      </div>`;
    return `<div class="slide" id="s${i}">${inner}<div class="credit">by Shamikh Ahmed</div></div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>${a.name} — Presentation</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#000;--accent:${a.accent};--accent2:${a.accent2};--ok:${a.ok};--text:#fff;--text2:#a0a0a0;--text3:#505050;--border:rgba(255,255,255,.08);--sans:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif}
html,body{width:100%;height:100%;background:var(--bg);color:var(--text);font-family:var(--sans);overflow:hidden;user-select:none}
#progress{position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:200;transition:width .4s;box-shadow:0 0 8px var(--accent)}
#counter{position:fixed;bottom:28px;right:28px;font-size:12px;color:var(--text3);z-index:200;font-variant-numeric:tabular-nums}
#dots{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:200}
.dot{width:6px;height:6px;border-radius:50%;background:var(--text3);cursor:pointer;transition:all .3s}
.dot.on{width:18px;border-radius:3px;background:var(--accent)}
#fsBtn{position:fixed;top:20px;right:20px;z-index:200;background:rgba(255,255,255,.07);border:1px solid var(--border);color:var(--text2);padding:6px 12px;border-radius:99px;font-size:11px;cursor:pointer}
.slide{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 48px;text-align:center;opacity:0;pointer-events:none;transform:scale(1.04);transition:opacity .4s,transform .4s}
.slide.active{opacity:1;pointer-events:auto;transform:scale(1)}
.anim{opacity:0;transform:translateY(18px);transition:opacity .5s,transform .5s}
.slide.active .anim{opacity:1;transform:none}
.slide.active .anim:nth-child(2){transition-delay:.08s}
.slide.active .anim:nth-child(3){transition-delay:.16s}
.slide.active .anim:nth-child(4){transition-delay:.24s}
.slide.active .anim:nth-child(5){transition-delay:.32s}
.label{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
h2{font-size:clamp(32px,6vw,64px);font-weight:800;letter-spacing:-.04em;line-height:1.05;margin-bottom:14px}
.tagline{font-size:clamp(14px,2vw,18px);color:var(--text2);line-height:1.55;max-width:620px}
.url-big{font-family:ui-monospace,Menlo,monospace;font-size:clamp(13px,2.2vw,20px);color:var(--accent);text-decoration:none;border-bottom:2px solid var(--accent);padding-bottom:4px;margin-top:20px}
.stat-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:22px}
.stat{background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:14px;padding:14px 20px;min-width:110px}
.sv{font-size:22px;font-weight:800;color:var(--accent)}
.sk{font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
.pain{display:flex;flex-direction:column;gap:10px;max-width:520px;width:100%;margin-top:20px;text-align:left}
.pain-item{display:flex;gap:10px;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;font-size:14px;color:var(--text2)}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:640px;width:100%;margin-top:20px}
.card{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:left}
.card-t{font-weight:700;font-size:14px;margin:8px 0 4px}
.card-d{font-size:12px;color:var(--text2);line-height:1.45}
.pills{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:20px;max-width:560px}
.pill{background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:99px;padding:8px 14px;font-size:12px;font-weight:600;color:var(--text2)}
.credit{position:absolute;bottom:36px;right:32px;font-size:11px;color:var(--text3)}
@media(max-width:600px){.slide{padding:40px 22px}.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div id="progress"></div>
<div id="counter">01 / ${String(total).padStart(2,'0')}</div>
<div id="dots"></div>
<button id="fsBtn" onclick="toggleFS()">⛶ Fullscreen</button>
<div id="deck">${slideHtml}</div>
<script>
const total=${total};let cur=0;
const slides=document.querySelectorAll('.slide'),progress=document.getElementById('progress'),counter=document.getElementById('counter'),dotsEl=document.getElementById('dots');
for(let i=0;i<total;i++){const d=document.createElement('div');d.className='dot';d.onclick=()=>go(i);dotsEl.appendChild(d);}
function go(n){if(n===cur)return;slides[cur].classList.remove('active');cur=Math.max(0,Math.min(total-1,n));slides[cur].classList.add('active');progress.style.width=((cur+1)/total*100)+'%';counter.textContent=String(cur+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===cur));}
document.addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown',' '].includes(e.key)){e.preventDefault();go(cur+1);}if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();go(cur-1);}});
let tx=0;document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{const dx=tx-e.changedTouches[0].clientX;if(Math.abs(dx)>50)go(dx>0?cur+1:cur-1);});
document.addEventListener('click',e=>{if(['BUTTON','A'].includes(e.target.tagName))return;if(e.clientX>innerWidth/2)go(cur+1);else go(cur-1);});
function toggleFS(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();}
go(0);
</script>
</body>
</html>`;
}

function pitchHtml(a) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>${a.name} — Pitch Deck</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--accent:${a.accent};--accent2:${a.accent2};--muted:rgba(255,255,255,.55);--dim:rgba(255,255,255,.25)}
html{scroll-behavior:smooth}
body{font-family:Inter,-apple-system,sans-serif;background:#000;color:#fff;overflow-x:hidden}
.slide{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:72px 40px;position:relative;text-align:center}
@media(max-width:600px){.slide{padding:64px 22px}}
.reveal{opacity:0;transform:translateY(40px);transition:opacity .8s,transform .8s}
.reveal.visible{opacity:1;transform:none}
#nav-dots{position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:100;display:flex;flex-direction:column;gap:8px}
.nav-dot{width:8px;height:8px;border-radius:50%;border:none;background:rgba(255,255,255,.25);cursor:pointer}
.nav-dot.active{background:#fff;transform:scale(1.3)}
#export-btn{position:fixed;top:16px;right:16px;z-index:100;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;padding:8px 16px;border-radius:99px;font-size:12px;cursor:pointer;font-family:inherit}
h1{font-size:clamp(3rem,12vw,7rem);font-weight:900;letter-spacing:-.05em;line-height:1}
h2{font-size:clamp(1.6rem,4.5vw,2.8rem);font-weight:800;letter-spacing:-.03em;margin-bottom:1rem}
.sub{color:var(--muted);font-size:clamp(1rem,2.2vw,1.2rem);max-width:560px;line-height:1.6;margin:0 auto 2rem}
.badges{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.badge{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:10px 18px;font-size:.85rem;font-weight:600}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:720px;width:100%;margin-top:2rem;text-align:left}
@media(max-width:600px){.cards{grid-template-columns:1fr}}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:20px}
.card h3{font-size:1rem;margin-bottom:.4rem}
.card p{font-size:.85rem;color:var(--muted);line-height:1.55}
.btn-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:2rem}
.btn{padding:16px 28px;border-radius:99px;font-weight:700;font-size:.95rem;text-decoration:none;border:none;cursor:pointer;font-family:inherit}
.btn-p{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;box-shadow:0 8px 28px color-mix(in srgb,var(--accent) 40%,transparent)}
.btn-s{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff}
#s1{background:radial-gradient(ellipse 70% 60% at 50% 40%,color-mix(in srgb,var(--accent) 25%,transparent),#000)}
#s2{background:#0a0a0a}
#s3{background:radial-gradient(ellipse 80% 60% at 30% 70%,color-mix(in srgb,var(--accent2) 20%,transparent),#050505)}
#s4{background:#000}
#s5{background:radial-gradient(ellipse 70% 50% at 50% 50%,color-mix(in srgb,var(--accent) 18%,transparent),#000)}
@media print{#nav-dots,#export-btn{display:none!important}.slide{page-break-after:always;min-height:100vh}.reveal{opacity:1!important;transform:none!important}}
</style>
</head>
<body>
<div id="nav-dots"></div>
<button id="export-btn" onclick="window.print()">⬇ Export PDF</button>

<section class="slide" id="s1">
  <div>
    <div style="font-size:4rem;margin-bottom:.5rem" class="reveal">${a.icon}</div>
    <h1 class="reveal delay-1">${a.name}</h1>
    <p class="sub reveal delay-2">${a.tagline}</p>
    <p class="sub reveal delay-3" style="font-size:.9rem">${a.subtitle}</p>
    <p class="reveal delay-4" style="color:var(--dim);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase">Scroll to explore ↓</p>
  </div>
</section>

<section class="slide" id="s2">
  <div style="max-width:800px;width:100%">
    <h2 class="reveal">The problem</h2>
    <p class="sub reveal delay-1">${a.problem}</p>
    <div class="cards">
      ${a.problemPoints.map((p,i)=>`<div class="card reveal delay-${Math.min(i+1,4)}"><h3>Pain ${i+1}</h3><p>${p}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="slide" id="s3">
  <div style="max-width:800px;width:100%">
    <h2 class="reveal">Introducing ${a.name}</h2>
    <p class="sub reveal delay-1">${a.solution}</p>
    <div class="badges reveal delay-2">
      <span class="badge">📱 PWA</span><span class="badge">🔒 Private</span><span class="badge">✈️ Offline</span>
    </div>
  </div>
</section>

<section class="slide" id="s4">
  <div style="max-width:900px;width:100%">
    <h2 class="reveal">Core pillars</h2>
    <div class="cards">
      ${a.pillars.map((p,i)=>`<div class="card reveal delay-${Math.min(i+1,4)}"><div style="font-size:1.8rem;margin-bottom:.5rem">${p.ic}</div><h3>${p.t}</h3><p>${p.d}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="slide" id="s5">
  <div style="max-width:700px;width:100%">
    <h2 class="reveal">Your ${a.name} awaits.</h2>
    <p class="sub reveal delay-1">${a.audience}</p>
    <div class="btn-row reveal delay-2">
      <a class="btn btn-p" href="${a.url}" target="_blank" rel="noopener">Open ${a.name}</a>
      <a class="btn btn-s" href="presentation.html">📊 Presentation</a>
      <a class="btn btn-s" href="landing.html">🌐 Landing</a>
      <a class="btn btn-s" href="docs/GUIDE.md">📖 Guide</a>
      <a class="btn btn-s" href="${a.github}" target="_blank" rel="noopener">GitHub</a>
    </div>
    <p class="reveal delay-3" style="margin-top:2.5rem;font-size:.75rem;color:var(--dim)">© ${a.year} Shamikh Ahmed · ${a.url.replace('https://','')}</p>
  </div>
</section>

<script>
const slides=document.querySelectorAll('.slide'),nav=document.getElementById('nav-dots');
slides.forEach((s,i)=>{const d=document.createElement('button');d.className='nav-dot'+(i?'':' active');d.onclick=()=>s.scrollIntoView({behavior:'smooth'});nav.appendChild(d);});
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.querySelectorAll('.reveal').forEach(r=>r.classList.add('visible'));}),{threshold:.2});
slides.forEach(s=>obs.observe(s));
let cur=0;window.addEventListener('scroll',()=>{slides.forEach((s,i)=>{const r=s.getBoundingClientRect();if(Math.abs(r.top)<innerHeight/2)cur=i;});nav.querySelectorAll('.nav-dot').forEach((d,i)=>d.classList.toggle('active',i===cur));},{passive:true});
document.querySelectorAll('#s1 .reveal').forEach(el=>setTimeout(()=>el.classList.add('visible'),80));
</script>
</body>
</html>`;
}

for (const app of APPS) {
  const dir = join(root, app.id);
  const skipPres = app.id === 'FitnessOS' && existsSync(join(dir, 'presentation.html'));
  if (!skipPres) writeFileSync(join(dir, 'presentation.html'), presentationHtml(app));
  writeFileSync(join(dir, 'pitch.html'), pitchHtml(app));
  console.log('Wrote', app.id, skipPres ? 'pitch.html only' : 'presentation.html + pitch.html');
}

console.log('Done. VaultOS kept manual (corrected in place).');
