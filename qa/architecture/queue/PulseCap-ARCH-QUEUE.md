# PulseCap — Architecture queue (ARCH-07)

Generated from analyzer findings. **Observe → queue → human decides.** Never auto-delete.

| Field | Value |
|---|---|
| App | `PulseCap` |
| Items | **444** (1:1 with findings) |
| Priorities | P1=15, P2=429 |
| Severities | info=429, warn=15 |
| Kinds | BROKEN=15, DUPLICATE=7, ORPHAN=365, UNUSED=57 |
| Source commit | `38687cb553067cacf87705291d127629e17ebb17` |
| Analyzer | 1.3.0 |
| Source | `qa/architecture/pilot-pulse/architecture-data.json` |
| Full register | `PulseCap-ARCH-QUEUE.json` (every finding) |
| Status | all `open` until Finish Program resolves |

## Priority slice (risk + warn) — work these first

| ID | P | Kind | Title | Evidence | Done when | Status |
|---|---|---|---|---|---|---|
| `PulseCap-ARCH-01` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/app.js#m → function:js/app.js#Math | js/app.js:569 — 'm':Math | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-02` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/coach-kernel.js#over → function:js/coach-kernel.js#pct | js/coach-kernel.js:132 — 'over' : pct | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-03` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/core/equipment.js#low_back → function:js/core/equip… | js/core/equipment.js:53 — 'low_back' : j | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-04` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/core/nutrition-math.js#muscle → function:js/core/nu… | js/core/nutrition-math.js:73 — 'muscle' : goal | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-05` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/data/exercise-db.js#bw → function:js/data/exercise-… | js/data/exercise-db.js:4 — "bw":false | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-06` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/data/exercise-db.js#bw → function:js/data/exercise-… | js/data/exercise-db.js:10 — "bw":true | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-07` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/data/exercise-db.js#warmup → function:js/data/exerc… | js/data/exercise-db.js:121 — "warmup":true | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-08` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/data/exercise-db.js#assistanceRequired → function:j… | js/data/exercise-db.js:137 — "assistanceRequired":true | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-09` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/data/exercise-db.js#custom → function:js/data/exerc… | js/data/exercise-db.js:272 — "custom":false | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-10` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/engines.js#Deadlift → function:js/engines.js#f | js/engines.js:564 — 'Deadlift' : f | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-11` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/engines.js#Deadlift → function:js/engines.js#isMale | js/engines.js:1236 — 'Deadlift': isMale | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-12` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/modules/coach.js#t → function:js/modules/coach.js#r… | js/modules/coach.js:284 — 't' : report | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-13` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/modules/onboarding.js#spine → function:js/modules/o… | js/modules/onboarding.js:130 — 'spine' : id | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-14` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/modules/workout.js#Advanced → function:js/modules/w… | js/modules/workout.js:770 — 'Advanced' : p | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |
| `PulseCap-ARCH-15` | P1 | BROKEN | BROKEN: Edge target node is missing: HANDLES event:js/modules/workout.js#t → function:js/modules/workout.… | js/modules/workout.js:1175 — 't':totalVol | Fix the broken connection at the root (handler/route/precache/CSP/storage) — do not paper over. | open |

## Info-level register (sample + pointer)

**429** info items (ORPHAN/UNUSED/DUPLICATE/…). Full 1:1 list with evidence is in `PulseCap-ARCH-QUEUE.json`. Finish Program picks up by ID from JSON.

| ID | P | Kind | Title | Evidence | Status |
|---|---|---|---|---|---|
| `PulseCap-ARCH-16` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): weightFromKg ↔ weightToKg | js/app.js:576 — const value = Number(kg) \|\| 0; return usesImperial(user) ? Math.round(value * 2. | open |
| `PulseCap-ARCH-17` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 0.95): weightFromKg ↔ heightFromCm | js/app.js:576 — const value = Number(kg) \|\| 0; return usesImperial(user) ? Math.round(value * 2. | open |
| `PulseCap-ARCH-18` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): weightFromKg ↔ heightToCm | js/app.js:576 — const value = Number(kg) \|\| 0; return usesImperial(user) ? Math.round(value * 2. | open |
| `PulseCap-ARCH-19` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 0.95): weightToKg ↔ heightFromCm | js/app.js:580 — const amount = Number(value) \|\| 0; return usesImperial(user) ? Math.round(amount | open |
| `PulseCap-ARCH-20` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): weightToKg ↔ heightToCm | js/app.js:580 — const amount = Number(value) \|\| 0; return usesImperial(user) ? Math.round(amount | open |
| `PulseCap-ARCH-21` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 0.95): heightFromCm ↔ heightToCm | js/app.js:584 — const value = Number(cm) \|\| 0; return usesImperial(user) ? Math.round(value / 2. | open |
| `PulseCap-ARCH-22` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): _pStat ↔ _recStat | js/modules/progress.js:113 — return '<div style="text-align:center;background:var(--bg4);border-radius:12px;p | open |
| `PulseCap-ARCH-23` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:js/cap-desktop-nav.js#cap-desktop-nav.js | js/cap-desktop-nav.js:1 — cap-desktop-nav.js | open |
| `PulseCap-ARCH-24` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/cap-desktop-nav.js#sync | js/cap-desktop-nav.js:8 — sync | open |
| `PulseCap-ARCH-25` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/coach-kernel.js#exChromeIcon | js/coach-kernel.js:364 — exChromeIcon | open |
| `PulseCap-ARCH-26` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/core/equipment.js#availableExercises | js/core/equipment.js:329 — availableExercises | open |
| `PulseCap-ARCH-27` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/core/equipment.js#canPerform | js/core/equipment.js:330 — canPerform | open |
| `PulseCap-ARCH-28` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/core/profile.js#bootOwnerSeed | js/core/profile.js:122 — bootOwnerSeed | open |
| `PulseCap-ARCH-29` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/equipment-db.js#expandEquipmentCatalog | js/data/equipment-db.js:142 — expandEquipmentCatalog | open |
| `PulseCap-ARCH-30` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:js/data/exercise-library.js#exercise-library.js | js/data/exercise-library.js:1 — exercise-library.js | open |
| `PulseCap-ARCH-31` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#_writeGlobal | js/data/exercise-library.js:28 — _writeGlobal | open |
| `PulseCap-ARCH-32` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#_grpFromInfo | js/data/exercise-library.js:50 — _grpFromInfo | open |
| `PulseCap-ARCH-33` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#_inferJoint | js/data/exercise-library.js:66 — _inferJoint | open |
| `PulseCap-ARCH-34` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#_eqFromInfo | js/data/exercise-library.js:85 — _eqFromInfo | open |
| `PulseCap-ARCH-35` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#_toExDB | js/data/exercise-library.js:101 — _toExDB | open |
| `PulseCap-ARCH-36` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#formGuideUrl | js/data/exercise-library.js:151 — formGuideUrl | open |
| `PulseCap-ARCH-37` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#getMedia | js/data/exercise-library.js:156 — getMedia | open |
| `PulseCap-ARCH-38` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#mediaHTML | js/data/exercise-library.js:169 — mediaHTML | open |
| `PulseCap-ARCH-39` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#_fetchJson | js/data/exercise-library.js:196 — _fetchJson | open |
| `PulseCap-ARCH-40` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: function:js/data/exercise-library.js#_fetchPaginated | js/data/exercise-library.js:228 — _fetchPaginated | open |

_… and 404 more in JSON._

## Finish Program notes

- IDs: `<APP>-ARCH-<n>` (stable for this generation order: risk → warn → info, then kind, then finding id).
- Work risk/warn first; orphans/unused are investigate-not-delete (§74).
- Resolving an item = keep/wire/remove with proof, or fix broken/security at root.
- Re-run `npm run architecture:queue` after re-analyzing to refresh this file.
