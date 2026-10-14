# Perfection Loop v3 — Progress
Updated: 2026-10-14T11:10:00Z · Wave: A · Hub mini-sites skeleton pushed

| App | Phase (A–J) | Branch | P0 | P1 | P2 | P3 | Matrix % | Gallery L/D | Mini-site | Docs | Live ver | Auditor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| VaultCap | — (finish merged) | main | 0 | 1 | 0 | 0 | 0 | — | — | — | 5.2.2 | — |
| PulseCap | — | main | 0 | 1 | 0 | 0 | 0 | — | — | — | 6.44.0 | — |
| PrismCap | — (finish merged) | main | 0 | 2 | 0 | 0 | 0 | — | — | — | 4.5.3 | — |
| SteadyCap | — (finish merged) | main | 0 | 2 | 0 | 0 | 0 | — | — | — | 2.5.4→stepR | — |
| LedgerCap | — (finish merged) | main | 0 | 3 | 0 | 0 | 0 | — | — | — | 3.57.2→stepR | — |
| DeePonyCap | — (finish merged) | main | 0 | 2 | 0 | 0 | 0 | — | — | — | 3.8.3→stepR | — |
| ScentCap | — | main | 0 | 3 | 0 | 0 | 0 | — | — | — | 2.1.4 | — |
| SoulCap | — (on main) | main | 0 | 0 | 0 | 0 | 0 | — | — | — | 8.3.2 | — |
| TravelCap | A–E (Builder) | perfection/travelcap-v3 | 1 | 1 | 0 | 0 | 0 | — | — | — | 1.0.2 | waiting |
| AuraCap | — (finish merged) | main | 0 | 2 | 0 | 0 | 0 | — | — | — | 5.4.2→stepR | — |
| MasteryCap | — | main | 0 | 0 | 0 | 0 | 0 | — | — | — | 51.9.2 | — |
| IdeaCap | A–E (Builder) | perfection/ideacap-v3 | 0 | 2 | 0 | 0 | 0 | — | — | — | 2.0.1 | waiting |
| CarCap | — (on main) | main | 0 | 0 | 0 | 0 | 0 | — | — | — | 1.0.1 | — |
| CookCap | A–E (Builder) | perfection/cookcap-v3 | 1 | 1 | 0 | 0 | 0 | — | — | — | 3.5.1→stepR | waiting |
| DeeFoodie | — | main | 1 | 0 | 0 | 0 | 0 | — | — | — | 1.0.0+3 | — |
| Hub / Capricorn OS | A ✓ skeleton | perfection/hub-minisites-v3 | 0 | 0 | 0 | 0 | 0 | — | skeleton ✓ (15) | — | OS 1.1.0 / hub 1.4.0 | — |
| Tooling | A (G16–G19) | perfection/tooling-v3 | — | — | — | — | — | — | — | — | — | — |
| Gallery | Done (viewer) | perfection/gallery-v3 @ 90d5212 | — | — | — | — | — | shared ready | — | — | — | — |

## Done (newest first)
- **Hub-Engineer Wave A:** `build-minisites.mjs` → `/apps/<slug>/` (15 Caps; DeeFoodie private-beta, no install) + `apps/index.html`; legacy `<slug>.html` → mini-site; `npm run build:minisites` / `deploy:hub`; `?app=<slug>` deep link. Branch `perfection/hub-minisites-v3` — lab `2409229`, hub `8b4007d` (sites `8ca4f03` + OS bundle). Wave D deferred: PrismCap/SoulCap copies, CarCap/IdeaCap/TravelCap rsync, gallery embed, Website button, sitemap/OG.
- **Gallery Engineer** — shared gallery v3 viewer + helpers + G17 check on `perfection/gallery-v3` **90d5212**.
  - Paths: `shared/gallery/screen-gallery.{html,css,js}`, `capture-helpers.mjs`, `check-completeness.mjs`, `INSTALL.md`, `CAPTURE.md`, `README.md`, `fixtures/sample-manifest.json`.
  - Builders install: from app root run `cp ../capricorn-tooling/shared/gallery/screen-gallery.{html,css,js} .` (full notes in `shared/gallery/INSTALL.md`). Manifest at `docs/screenshots/gallery/gallery-manifest.json` (schema v2). G17: `node ../capricorn-tooling/shared/gallery/check-completeness.mjs --app-dir=.`.
  - Lock released. Open gaps: none for viewer; app captures still Builder phase G.
- Phase 0 finish/* merges pushed to main: TravelCap, CookCap, IdeaCap, VaultCap, SteadyCap, LedgerCap, AuraCap, PrismCap, DeePonyCap.
- CarCap + SoulCap switched to main.
- N-1 recorded in DECISIONS §6 (mini-sites).
- PROGRESS-v3.md + LOCKS.md + PHASE0-BRANCHES.md created.
- PW_CORE confirmed 1.63.0; browsers at `~/Library/Caches/ms-playwright` (use `PLAYWRIGHT_BROWSERS_PATH`).

## In flight
- Wave A agents: Tooling Engineer, Hub Engineer, Builders (Travel/Cook/Idea), Auditor. Gallery Engineer hand-off complete (viewer ready for Builders).
- Baseline device-qa (needs PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright).
- wip/* review deferred to each app's phase B (VaultCap, SteadyCap, AuraCap).
- N-note for Conductor (do not edit DECISIONS from Gallery): optional — wire `npm run gallery:check` alias in CAP-STANDARD when Conductor updates it.

## Blocked-external
_(none yet)_

## Decisions taken (N-…)
- N-1 · Mini-sites → `/apps/<slug>/` (DeeFoodie private-beta, no install). Legacy `<slug>.html` → mini-site. — v3, 2026-10-14

## Phase 0 merge SHAs (main)
| App | Merge tip |
|---|---|
| TravelCap | 0bc9718 |
| CookCap | c43a70c |
| IdeaCap | 3bc61f6 |
| VaultCap | ec839d8 |
| SteadyCap | b9d31a4 |
| LedgerCap | ce92c06 |
| AuraCap | cca19e4 |
| PrismCap | fd25c5d |
| DeePonyCap | (resolving push) |
| CarCap | 8cd0c11 (switch) |
| SoulCap | 32c6961 (switch) |
