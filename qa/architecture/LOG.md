# ARCH-04 — PulseCap + ScentCap precision pilot

**Date:** 2026-09-23  
**Tooling branch:** `finish/arch-04`  
**Analyzer:** 1.2.0 (was 1.1.0)  
**Base:** `origin/main` @ `a9f587a` (ARCH-03)

## Commands run

```bash
git fetch origin
git checkout -b finish/arch-04 origin/main

npm run architecture:test   # 24/24

node shared/architecture/analyze.mjs \
  --root /Users/shamikhahmed/Projects/Cap/Cap-Apps/PulseCap \
  --config qa/architecture/pilots/pulsecap.architecture.config.json \
  --out qa/architecture/pilot-pulse

node shared/architecture/analyze.mjs \
  --root /Users/shamikhahmed/Projects/Cap/Cap-Apps/ScentCap \
  --config qa/architecture/pilots/scentcap.architecture.config.json \
  --out qa/architecture/pilot-scent
```

## Spot-check (30 edges/nodes per app)

| App | Sample | Precision | Notes |
|---|---|---|---|
| PulseCap | 30/30 | **100%** | After MODULE_CHAIN + literal screen-id filter |
| ScentCap | 30/30 | **100%** | Routes + ROUTES_TO + NAVIGATES_TO |
| Combined | 60/60 | **100%** | ≥95% gate met |

Evidence: `qa/architecture/SPOT-CHECK.json`.

## Bugs found → fixed (with tests)

1. **PulseCap screens missing** — `reg()`/`go()` never extracted.  
   Fix: `dispatchPatterns: [{ type: 'reg-go' }]` in vanilla extractor; stable `screen:<id>` nodes; `ROUTES_TO` / `NAVIGATES_TO`.  
   Test: `vanilla-reg-go` fixture.

2. **False screen from `console.error('go(' + id + ')')`** — string concat matched as `go('+ id +')`.  
   Fix: `isLiteralScreenId()` (kebab/alphanumeric only).

3. **MODULE_SRC empty object** — PulseCap now builds `MODULE_SRC` from `MODULE_CHAIN` arrays (+ const refs like `WORKOUT_CHAIN`).  
   Fix: parse `MODULE_CHAIN` / array literals / same-file const arrays → `LOADS`.  
   Test: fixture updated to MODULE_CHAIN shape.

4. **ScentCap routes without ROUTES_TO / NAVIGATES_TO** — route nodes only.  
   Fix: `element={<Comp}` → `ROUTES_TO` (prefer `pages/`); `navigate()` / `to=` / `<Navigate to=` → `NAVIGATES_TO`; stable `route:<path>` ids.

5. **Noise stacks** — PulseCap falsely `es-modules` (tests/scripts); ScentCap falsely `vanilla-globals` (public/js + vendor).  
   Fix: skip `tests`/`e2e`/`qa`/`scripts`/`vendor` in walk; `config.excludeStacks`; CLI `--config`.

## Pilot stats (post-fix)

| | PulseCap | ScentCap |
|---|---|---|
| Stacks | html, vanilla-globals, service-worker, env-config | html, es-modules, routes-react, env-config |
| Nodes | ~512 | ~813 |
| Edges | ~912 | ~721 |
| Screens / routes | 18 screens | 12 routes |
| Backend presence | supabase/firebase/sqlite **absent** | same |

## SPEC §10 answers (pilot)

| Question | PulseCap | ScentCap |
|---|---|---|
| What files/screens/components/functions exist? | Yes — files + 18 `reg` screens + functions; components N/A (vanilla) | Yes — files, 12 routes, components, functions |
| Where does data come from / go? | Partial — storage/SW keys + CALLS; display traces incomplete | Partial — Dexie/storage + IMPORTS/RENDERS; full action traces not yet wired from `primaryJourneys` |
| What does each screen depend on? | ROUTES_TO + MODULE_CHAIN LOADS + go() callers | ROUTES_TO → page component; NAVIGATES_TO inbound |
| What depends on each service? | Weak — few explicit service nodes | Weak — context/services via IMPORTS only |
| Primary control → handler? | Partial — data-act + go(); not every onclick template | Partial — Link/navigate; onClick props via es-modules RENDERS/CALLS uneven |
| Where is data stored? | SW cache names + storage nodes | storage + Dexie when present |
| APIs / hosts / DB / env? | env keys; no remote API mapped as primary | env; local-first |
| Disconnected / unused / duplicate / dead? | Findings present (orphans/unused) — need ARCH-07 triage | Same |
| Hardcoded / mock / demo / no source? | Demo flag on demo files; HARDCODED when matched | Same |
| Broken / unknown connections? | Some BROKEN HANDLES remain (template string-dispatch noise reduced) | Low BROKEN after excluding vanilla |
| Impact if I change X? | Viewer impact mode works on extracted graph | Same |

**Honest gap:** journey traces from `primaryJourneys` in config are not yet auto-materialized into `traces.actions` (ARCH-05/08 follow-up). Spot-check precision on structural edges is ≥95%.

## Remaining ARCH items

| ID | Item | Status |
|---|---|---|
| ARCH-01…03 | Core / viewer / adapters | ✅ |
| ARCH-04 | Pilot PulseCap + ScentCap | ✅ this PR |
| ARCH-05 | Roll-out all apps + hub | ❌ next |
| ARCH-06 | Never publish maps (curl 404) | Partial (C-57) |
| ARCH-07 | Findings → queue items | ❌ |
| ARCH-08 | Staleness + `architecture:check` + G15 | ❌ |
| ARCH-09 | Regenerate workflow | ❌ |
| ARCH-10 | APP-REPORT Architecture section | ❌ |

## App-repo follow-up (not in this PR)

Landing `architecture.config.json` + `docs/architecture/` into PulseCap / ScentCap themselves (copy from `qa/architecture/pilots/`) belongs with ARCH-05 per-app roll-out or a small follow-up commit in each app.
