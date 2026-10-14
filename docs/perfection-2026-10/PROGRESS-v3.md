# Perfection Loop v3 — Progress
Updated: 2026-10-14T11:05:00Z · Wave: A · Agents: Gallery, Tooling, Hub, TravelCap, CookCap, IdeaCap Builders, Auditor (parallel)

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
| Hub / Capricorn OS | A (Hub Eng) | perfection/hub-minisites-v3 | 0 | 0 | 0 | 0 | 0 | — | skeleton | — | OS 1.1.0 / hub 1.4.0 | — |
| Tooling | A (G16–G19) | perfection/tooling-v3 | — | — | — | — | — | — | — | — | — | — |
| Gallery | A (viewer) | perfection/gallery-v3 | — | — | — | — | — | — | — | — | — | — |

## Done (newest first)
- Phase 0 finish/* merges pushed to main: TravelCap, CookCap, IdeaCap, VaultCap, SteadyCap, LedgerCap, AuraCap, PrismCap, DeePonyCap.
- CarCap + SoulCap switched to main.
- N-1 recorded in DECISIONS §6 (mini-sites).
- PROGRESS-v3.md + LOCKS.md + PHASE0-BRANCHES.md created.
- PW_CORE confirmed 1.63.0; browsers at `~/Library/Caches/ms-playwright` (use `PLAYWRIGHT_BROWSERS_PATH`).

## In flight
- Wave A agents: Gallery Engineer, Tooling Engineer, Hub Engineer, Builders (Travel/Cook/Idea), Auditor.
- Baseline device-qa (needs PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright).
- wip/* review deferred to each app's phase B (VaultCap, SteadyCap, AuraCap).

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
