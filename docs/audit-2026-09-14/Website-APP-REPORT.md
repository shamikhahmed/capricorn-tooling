# Website / Hub — Tier 1 App Report

**Released:** 2026-09-15 · Capricorn OS **1.0.0** · hub package **1.3.0**  
**Canonical source (D-13):** `/Users/shamikhahmed/Projects/Cap/Cap-Apps/capricorn-lab` → `shamikhahmed.github.io`  
**Live:** https://shamikhahmed.github.io/

| Field | Value |
|-------|--------|
| Status | Tier 1 (HUB-P0/P1 complete) |
| Lab branch | `finish/website` |
| Hub branch | `finish/website` → merge `main` |
| Deploy | `npm run deploy:hub` from capricorn-lab |
| Verify | lab `npm test` · hub `node scripts/link-check.mjs` |

## P0 / P1 register

| ID | Severity | What was wrong | What was done | Status |
|----|----------|----------------|---------------|--------|
| HUB-P0-01 | P0 | Catalog versions/copy drifted; missing CookCap/DeeFoodie | Synced from each `VERSION.json` + §4.1 one-liners; DeeFoodie **Private beta** (no install) | ✅ |
| HUB-P1-01 | P1 | os-next was live; lab not canonical | Lab builds hub via `deploy-hub.mjs`; Future OS modules **not** ported (fail Tier 1); os-next README archived (D-13) | ✅ |
| HUB-P1-02 | P1 | three.js on lock path; Google Fonts | Poster/CSS first; three.js after idle on capable devices; G-9 system UI + local JetBrains Mono | ✅ |
| HUB-P1-03 | P1 | Dock max-width too narrow for fleet | Dock/grid CSS widened (≈1280–1480px) for 320–2560 | ✅ |
| HUB-P1-04 | P1 | Legacy `*cap.html` were full pages | Lightweight redirects (meta refresh + canonical + link) incl. `cookcap.html` (P-HUB-1) | ✅ |
| HUB-P1-05 | P1 | No support page; privacy had personal contact | `support.html` → GitHub Issues; `privacy.html` §4.4-style, Contact = support URL (G-4) | ✅ |
| HUB-P1-06 | P1 | Sitemap incomplete; no link gate | Updated `sitemap.xml` / `robots.txt`; `scripts/link-check.mjs`; OG `assets/og.png` present | ✅ |
| HUB-P1-07 | P1 | Investor/pitch on 13 Caps | Fifteen Caps copy; CookCap + DeeFoodie in constellation; private beta without install | ✅ |

## Catalog versions (live truth)

| App | Version | Notes |
|-----|---------|--------|
| SoulCap | 8.2.0 | |
| ScentCap | 2.1.0 | |
| MasteryCap | 51.9.0 | |
| CookCap | 3.5.0 | |
| VaultCap | 5.2.1 | |
| PulseCap | 6.43.0 | |
| SteadyCap | 2.5.1 | |
| TravelCap | 1.0.0 | |
| LedgerCap | 3.57.0 | |
| AuraCap | 5.4.0 | |
| CarCap | 1.0.0 | |
| PrismCap | 4.5.0 | |
| DeePonyCap | 3.8.0 | IP-safe copy |
| DeeFoodie | 1.0.0+3 | Private beta — no public install |
| IdeaCap | 2.0.0 | |

## Decisions applied

D-13, P-HUB-1, G-3 (website keeps “Capricorn OS”), G-4, G-7 §4.1, G-9, D-04 (no third-party IP names in DeePony catalog).

## Verify

- `capricorn-lab`: `npm test` — catalog + no Google Fonts
- `capricorn-lab`: `npm run build` — green; `lock-sphere-*.js` code-split
- `shamikhahmed.github.io`: `node scripts/link-check.mjs` — passed
- Live Cap HTTP 200 smoke — see PROGRESS / release log below


## Live smoke (2026-09-15)

| URL | Status |
|-----|--------|
| https://shamikhahmed.github.io/ | 200 · serves `index-BATYLbi3.js` · no Google Fonts |
| support.html / privacy.html | 200 |
| VaultCap … CookCap (14 public Caps) | **all 200** |
| Hub deploy | `2bc2bc8` |
| Lab release | `d8adcae` / tag `v1.0.0` |


## Remaining / gaps

- Lighthouse ≥ 90 on lock→desktop: run locally after Pages propagate (not blocked)
- Full viewport dock/grid matrix (320–2560 × light/dark): CSS shipped; visual QA optional polish
- CookCap hub screenshot still uses travel placeholder until a dedicated shot is captured
- os-next local folder move to `~/Archive/Cap-Apps/2026-09-15/` after remote archive branch is merged
- Physical VoiceOver on hub: ⛔ BLOCKED-EXTERNAL (no hardware requirement for hub close if link smoke passes)

## Release log

- Lab: Capricorn OS **1.0.0** on `finish/website`
- Hub: deploy copy of Vite build + redirects/support/privacy/catalog
- Tag: `v1.0.0` on capricorn-lab (after merge to main)
- Live root must serve `assets/index-BATYLbi3.js` (no Google Fonts)
