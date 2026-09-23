# Cap Fleet Finish Program — Progress

## ⚠️ Owner review 3 (2026-09-16) — read first
Hardened runner v2 on tooling — `TIER1.json` PASS only when real gates pass. Every app until then: **In progress — not verified.** Review 3 does **not** verify fleet Tier 1.

Updated: 2026-09-23T13:25:00Z · Prompt: **v2** + Review 3 + Engineering mode + ARCH

Current step: **Step R** — CarCap+SoulCap+PulseCap Tier1 PASS; ScentCap LH gates clear (closing tag/kill); **ARCH-01…10 ✅**

## Done
- **C-29…C-33 ✅** hardened `tier1.mjs` + tests (tooling)
- **C-53 ✅** eng-mode rule on origin/main all 18 repos; hub Pages `.cursor` → 404 (allowlisted deploy)
- **C-34 ✅ CI** SW offline e2e (`serviceWorkers:allow`) green [35083274385](https://github.com/shamikhahmed/SoulCap/actions/runs/35083274385); cache-clear `a80b825`
- **ARCH-01 ✅** analyzer core + schema + §8 fixtures (`c941978` / merge `c628e40`; tests **16/16**) + fleet topology `ARCHITECTURE-FLEET-MAP.md`
- **ARCH-02 ✅** static viewer `shared/architecture/viewer/{index.html,viewer.js,viewer.css}` + fixture demo data + `npm run architecture:viewer` / `architecture:viewer:stress`; `analyze` copies viewer assets into `--out` (`10d977c` / tip `17b6959`, PR #3)
- **ARCH-03 ✅** SPEC §3 adapters on main (PR #4 `a9f587a`); analyzer was **1.1.0**; tests **22/22**
- **ARCH-04 ✅** PulseCap + ScentCap precision pilot (`finish/arch-04` / PR #6): analyzer **1.2.0**; `reg`/`go` + `MODULE_CHAIN`; routes `ROUTES_TO`/`NAVIGATES_TO`; `--config` + `excludeStacks`; spot-check **60/60 (100%)**; `qa/architecture/`; tests **24/24**
- **ARCH-05 ✅** Fleet roll-out (`finish/arch-05`): analyzer **1.3.0**; 17 apps (all Caps + lab + hub); Next `src/app`, tabs-id/tuples, multiline Stack.Screen, nested Nest detect, skip releases/bundle/hub mirrors; spot-check **314/314 (100%)**; tests **27/27**
- **ARCH-06 ✅** Never publish maps — PR #10 merge `bc7227c` (`d82364c`); CI unit+live-404 green; evidence **96/96** → 404 in `qa/architecture/PAGES-404-ARCH06.json`
- **ARCH-07 ✅** Findings → queue — `finish/arch-07`; `npm run architecture:queue`; proof Pulse+Scent+Car+Vault = **1986** `<App>-ARCH-<n>` items under `qa/architecture/queue/` + `QUEUE-INDEX`; tests **36/36**
- **ARCH-08 ✅** Staleness + check + G15 — `finish/arch-08`; `npm run architecture:check`; viewer sync + `sourceCommit` freshness; `tier1` `g15:architecture`; tests **46/46**; evidence `CHECK-ARCH08.json`
- **ARCH-09 ✅** regenerate workflow (`cbbc25c`)
- **ARCH-10 ✅** APP-REPORT Architecture section — `npm run architecture:app-report`; template + PulseCap proof Regenerate workflow — `finish/arch-09`; `npm run architecture:regen` (`--stale` / `--slugs`); CI dry-run; refreshed Cook/Ledger/Pulse/Scent/Travel; `architecture:check` **17/17**; tests **51/51**; evidence `REGEN-ARCH09.json`
- **C-57 🟡→mostly ✅** allowlisted Pages: Vault `b6f1334`, DeePony `4942677`, Ledger `355e660`, Mastery `f0c8ad2`, Steady `62227f2`, Prism `164b927`; Pulse scripts merge `65a037c`. Aura/Scent/Cook/Soul/hub already non-root artifacts.
- **C-35 partial** CarCap+ScentCap contrast on main (CI green); SoulCap axe on stepR
- **CarCap ✅** hardened Tier1 **PASS** on main after stepR merge `dcfa383` (re-verified 2026-09-23; LH+matrix+axe+kill-list green)
- **SoulCap ✅** hardened Tier1 **PASS** on main via PR #11 (`32c6961`) — v8.3.2 Review 3 gates (LH desktop 99 / mobile 98)
- **PulseCap ✅** hardened Tier1 **PASS** on main (`a1e865a` / PR #6) — live mobile LH **P90** / LCP **2.1s** / TBT **~35–40ms**; desktop **P100**; MODULE_CHAIN defer + SW `pulsecap-v125`. Re-verified `npm run tier1` → PASS (ci:main warn until tip CI finishes).
- **ScentCap stepR** kill-list cleared (`raw-hex`/`sub-11` → 0) v2.1.3; Tier1 **FAIL** only live mobile LH (retry P62 / LCP~18s; local preview earlier P74). `live:VERSION.json` 404 until main deploy
- **Cook/Travel/Ledger/Prism stepR** axe/gallery/matrix cleared; all **FAIL** LH only (Cook P51/68, Travel P62/74, Ledger P33, Prism P12/29)

## Honest
CarCap + SoulCap + **PulseCap** **PASS** on main (hardened runner). Most other Caps still **FAIL** — primary remaining gate is **Lighthouse thresholds**. C-34 ≠ Tier 1 fleet-wide. C-57 ≠ Tier 1. ARCH-01…10 ✅ on tooling. Remaining product Caps primarily LH thresholds (ScentCap near PASS).

BLOCKED-EXTERNAL: Xcode / TestFlight / physical VO-TB (macOS VO+Safari OK for web)

Do not claim fleet Tier 1.
