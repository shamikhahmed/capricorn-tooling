# Cap Fleet Finish Program — Progress

## ⚠️ Owner review 3 (2026-09-16) — read first
`TIER1.json` PASS from gate runner v1 does **not** prove Tier 1. Every app: **In progress — Tier 1 not verified.**

Updated: 2026-09-16T10:10:00Z · Prompt: **v2** + Review 3

Current step: **Step R** — hardened runner on tooling `a760cb4` (+ live-slug follow-up); apps FAIL honestly; next product fixes (C-34, real LH, kill-list, matrix evidence)

Current item: C-34 merge watching · real LH · axe JSON · matrix-results · kill-list

Next 5 actions:
1. C-34 SoulCap: serviceWorkers allow on offline suites (687597c) — watching CI
2. Real Lighthouse (SoulCap perf 30 / TBT 6341; PulseCap perf 58 / LCP 8.3s) + commit fresh JSON
3. Run `FINISH_MATRIX=1` → commit `matrix-results.json` + shots
4. Kill-list under C-29 (PulseCap 188 hex / 82 !important / 4 sub-11)
5. Propagate finish-matrix CI + axe evidence to remaining Caps

## Done (Review 3 runner)
- **C-53 ✅** — eng-mode rule fleet-wide
- **C-29 ✅** — hex-only allowlist; rem/em &lt; 0.6875; no `background-color` skip — tooling `6fd06cf`…`a760cb4`
- **C-30 ✅** — stubs deleted; runner rejects stub/null + thresholds + UI-commit freshness
- **C-31 ✅** — `matrix-results.json` gate + `FINISH-MATRIX-CI.md` + SoulCap/PulseCap CI jobs with `FINISH_MATRIX=1`
- **C-32 ✅** — named workflow + `origin/main` SHA; test-skip allowlist; axe dir; gallery freshness; live VERSION warn→fail; `__APP_READY__` in product code
- **C-33 ✅** — `npm test` / `npm run test:tier1` — **8/8** fixture gates

## Honest remeasure (hardened runner `a760cb4`) — 2026-09-16

### PulseCap — **TIER1 FAIL** (19 pass / 10 fail)
| Gate | Result |
|---|---|
| test-skip | FAIL — `tests/device-matrix.spec.js` `.skip` (not gallery-allowlisted) |
| ci:workflow-name | FAIL — missing `qa/finish-loop/CI-WORKFLOW.txt` (add `PulseCap CI`) |
| matrix:results | FAIL — missing |
| lighthouse | FAIL — fetchTime before UI commit; also perf **58** LCP **8276ms** (need ≥90 / ≤2500) |
| axe:dir | FAIL — missing |
| gallery:freshness | FAIL — gallery before last UI commit |
| kill:raw-hex | **188** |
| kill:sub-11px | **4** |
| kill:important | **82** |

### SoulCap — **TIER1 FAIL** (21 pass / 7 fail / 1 warn) @ tooling `da5e3e4`
| Gate | Result |
|---|---|
| test-skip | FAIL — gallery `.skip` without committed allowlist (`qa/finish-loop/skip-allowlist.json`) |
| ci:workflow-name | FAIL — need `qa/finish-loop/CI-WORKFLOW.txt` = `Verify and deploy` |
| matrix:results | FAIL — missing |
| lighthouse | FAIL — fetchTime before UI commit; also perf **30** LCP **5779ms** TBT **6341ms** |
| axe:dir | FAIL — missing |
| gallery:freshness | FAIL — gallery before last UI commit |
| live:VERSION.json | WARN — `https://shamikhahmed.github.io/SoulCap/VERSION.json` → **404** |

Kill-list on SoulCap currently **0** hex / sub-11 / important (token split done).

## Automated gate v1 passed — superseded by review 3; not verified
1–15 apps + website. **Not Tier 1.**

## In flight
- C-34 SoulCap CI (finish/soulcap-c34)
- Product remediation for FAIL gates above
- C-19 / C-22 / C-57 / ARCH-01 — queued

## BLOCKED-EXTERNAL
Xcode / TestFlight / physical VO-TB (macOS VO+Safari available for web)

Do not claim fleet Tier 1.
