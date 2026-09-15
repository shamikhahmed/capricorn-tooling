# Cap Fleet Finish Program — Progress

Updated: 2026-09-15 (Step R corrections C-15/C-17/C-18/C-25/C-26) · Prompt: **v2 + §2.3**

## Status reset
The previous entry ("fleet Tier 1 complete") remains **revoked**. **No app is Tier 1 until its `qa/finish-loop/TIER1.json` is PASS and manual evidence is linked.**

Current step: **R — corrections C-09…C-28** (prompt §2.3).

Current app after Step R: **SoulCap** (1/16) — run `npm run tier1`, fix every failure, re-run until PASS.

## Step R — this session (done)

| ID | Status | Evidence |
|---|---|---|
| C-15 Website | **Done** | TravelOS removed from hub `js/products-data.js`; capricorn-lab SoT TravelCap 1.0.1 (`v1.0.1`); Hub redirects use absolute `https://shamikhahmed.github.io/<Cap>/`; Hub CI run [34948208573](https://github.com/shamikhahmed/shamikhahmed.github.io/actions/runs/34948208573) **success**; hub tagged `v1.3.1`; live catalog shows TravelCap copy (no TravelOS). |
| C-17 SteadyCap | **Done** | Product UI streak copy rewritten (linkedRecoveryEngine, onboarding, profile, habit-links, programs); release **2.5.2** / `steadycap-v52` tag `v2.5.2`; live `VERSION.json` + `sw.js` = v52; onboarding live: "Recovery is a system, not a count." |
| C-18 Suppressions | **Done** | DeeFoodieApp: `process.stderr.write` (no eslint-disable); IdeaCap: `Share.share` instead of `console.log`. Both on `main`. |
| C-25 Tags | **Done** | LedgerCap `v3.57.0` → `e5ec9ca` (release commit; did not move tags). Hub `v1.3.1`, lab `v1.0.1`, SteadyCap `v2.5.2`, tooling `v1.0.0`. Fleet scan: no other missing `v<version>` for current VERSION/package. |
| C-26 Tooling | **Done** | `finish/phase-0` merged to `main` (prefer merge) at `59d12f7`; includes `shared/testing/tier1.mjs`; audit docs re-copied; tagged `v1.0.0`; pushed. |

## Step R — still remaining

| ID | Item |
|---|---|
| C-09 | Honesty rules (ongoing — never estimated scores / fake Tier 1) |
| C-10 | Wire `npm run tier1` in every app (runner exists in tooling after C-26) |
| C-11–C-14 | TravelCap CI/SW + DeePonyCap SW (verify if already fixed by parallel work) |
| C-16 | Self-host fonts (G-9) |
| C-19 | Kill-list zeroing per app |
| C-20 | `window.__APP_READY__` + gallery regen |
| C-21 | finish-matrix specs + CI | **Done** (smoke wired; failures drive queue) |
| C-22 | Lighthouse JSON per primary route |
| C-23 | Loop records / APP-REPORTs | **Done** (honest stubs; Tier 1 not verified) |
| C-24 | Docs cleanup + SoulCap SISTER-* out of Pages | **Done** |
| C-27 | Brain notes (Desktop paths + ScentCap entry) |
| C-28 | PROGRESS honesty (this file — partial) |

## Next 5 actions
1. C-16 self-host fonts across listed apps; CSP + privacy; re-release.
2. C-20 `__APP_READY__` (unblocks finish-matrix green).
3. Drive finish-matrix failures → green (`FINISH_MATRIX_FULL=1`).
4. C-22 Lighthouse JSON per primary route.
5. C-10 wire `npm run tier1` in every app; C-27 Brain.

## App status (review 2, 2026-09-15 + Step R deltas)
| App | Released | Status | Notes |
|---|---|---|---|
| SoulCap | 8.2.0 | In progress — not verified | Next after Step R |
| ScentCap | 2.1.0 | In progress — not verified | |
| MasteryCap | 51.9.0 | In progress — not verified | |
| CookCap | 3.5.0 | In progress — not verified | |
| VaultCap | 5.2.1 | In progress — not verified | |
| PulseCap | 6.43.0 | In progress — not verified | |
| SteadyCap | **2.5.2** | In progress — not verified | C-17 streak language fixed live |
| TravelCap | 1.0.1 | In progress — not verified | |
| LedgerCap | 3.57.0 | In progress — not verified | `v3.57.0` tagged (C-25) |
| AuraCap | 5.4.0 | In progress — not verified | |
| CarCap | 1.0.0 | In progress — not verified | |
| PrismCap | 4.5.0 | In progress — not verified | |
| DeePonyCap | 3.8.1 | In progress — not verified | |
| DeeFoodieApp | 1.0.0+3 | In progress — not verified | C-18 done |
| IdeaCap | 2.0.0 | In progress — not verified | C-18 done |
| Website | hub **1.3.1** / lab **1.0.1** | In progress — not verified | C-15 done; Hub CI green |

## BLOCKED-EXTERNAL (legitimate)
- Full Xcode / `xcodebuild` archive (Command Line Tools only): ScentCap, VaultCap, IdeaCap, DeeFoodieApp.
- App Store Connect / TestFlight uploads (owner accounts).
- Physical iPhone/Android VoiceOver/TalkBack (use macOS VoiceOver + Safari meanwhile).

## Last green checkpoints
- Hub CI `main` success: run 34948208573 (C-15).
- SteadyCap live: VERSION 2.5.2 / SW `steadycap-v52` (C-17).
- capricorn-tooling `main` @ `59d12f7` with `tier1.mjs` (C-26).
