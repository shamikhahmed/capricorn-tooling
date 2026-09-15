# Cap Fleet Finish Program — Progress

Updated: 2026-09-15 (owner review 2) · Prompt: **v2 + §2.3 corrections**

## Status reset
The previous entry ("fleet Tier 1 complete; no next implementable item") was **not accurate** and is revoked by review 2 (prompt §2.3). The P0/P1 decision work already merged remains valid. **No app is Tier 1 until its `qa/finish-loop/TIER1.json` is PASS and manual evidence is linked.**

Current step: **R — corrections C-09…C-28** (prompt §2.3), starting with C-10 (tier1 gate runner), C-11 (TravelCap red CI), C-13 (TravelCap broken SW), C-14 (DeePonyCap stale SW).

Current app after Step R: **SoulCap** (1/16) — run `npm run tier1`, fix every failure, re-run until PASS.

Next 5 actions:
1. C-10 build `capricorn-tooling/shared/testing/tier1.mjs` + `npm run tier1` wiring (start with SoulCap, TravelCap, DeePonyCap).
2. C-11 TravelCap lockfile regenerated against the public registry; CI green on `main`.
3. C-13 TravelCap basePath-aware precache; precache-URL test; live offline proof.
4. C-14 DeePonyCap `sw.js` cache = `VERSION.json.swCache`; release; live proof.
5. C-26 merge capricorn-tooling `finish/phase-0` → `main` after verify.

## App status (review 2, 2026-09-15)
| App | Released | Status | Main gaps found in review |
|---|---|---|---|
| SoulCap | 8.2.0 | In progress — not verified | tier1 runner, matrix, Lighthouse, kill-list (299 raw hex, 28 !important), gallery review, public SISTER-* docs |
| ScentCap | 2.1.0 | In progress — not verified | matrix, Lighthouse, `__APP_READY__`, kill-list, records |
| MasteryCap | 51.9.0 | In progress — not verified | `__APP_READY__`, Google Fonts, 39 sub-12px, 73 innerHTML to classify, gallery, records, root prompt docs |
| CookCap | 3.5.0 | In progress — not verified | `__APP_READY__`, 3 native dialogs, Google Fonts temp page, gallery, records, root prompt docs |
| VaultCap | 5.2.1 | In progress — not verified | `__APP_READY__`, 297 sub-12px, 128 !important, 176 innerHTML, Google Fonts, gallery |
| PulseCap | 6.43.0 | In progress — not verified | `__APP_READY__`, 144 sub-12px, 107 !important, 11 outline:none, gallery, root prompt docs |
| SteadyCap | 2.5.1 | In progress — not verified | streak language in UI, `__APP_READY__`, 98 sub-12px, Google Fonts, gallery |
| TravelCap | 1.0.0 | In progress — not verified | **CI red**, **broken live SW**, 11 added suppressions, "TravelOS" on website, gallery |
| LedgerCap | 3.57.0 | In progress — not verified | `__APP_READY__`, 202 innerHTML, 127 sub-12px, 39 console.log, Google Fonts, no v3.57.0 tag, gallery |
| AuraCap | 5.4.0 | In progress — not verified | matrix, Lighthouse, kill-list, gallery, records |
| CarCap | 1.0.0 | In progress — not verified | matrix, Lighthouse, kill-list small |
| PrismCap | 4.5.0 | In progress — not verified | `__APP_READY__`, 196 !important, 153 innerHTML, 11 native dialogs, Google Fonts, gallery, records |
| DeePonyCap | 3.8.0 | In progress — not verified | **SW cache not bumped (v55 vs v60)**, 15 native dialogs, Google Fonts, gallery, records |
| DeeFoodieApp | 1.0.0+3 | In progress — not verified | added `no-console` suppression, Flutter responsive tests, records |
| IdeaCap | 2.0.0 | In progress — not verified | no `qa/finish-loop/` at all, added `no-console` suppression, web matrix |
| Website | hub `2bc2bc8` | In progress — not verified | **Hub CI red (links)**, "TravelOS" copy, no tags, Lighthouse |

## BLOCKED-EXTERNAL (legitimate)
- Full Xcode / `xcodebuild` archive (Command Line Tools only on this machine): ScentCap, VaultCap, IdeaCap, DeeFoodieApp.
- App Store Connect / TestFlight uploads (owner accounts).
- Physical iPhone/Android VoiceOver/TalkBack (use macOS VoiceOver + Safari and emulators meanwhile).

## Last green checkpoints
Record per repo as work resumes.
