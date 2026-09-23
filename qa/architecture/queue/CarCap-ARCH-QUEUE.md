# CarCap — Architecture queue (ARCH-07)

Generated from analyzer findings. **Observe → queue → human decides.** Never auto-delete.

| Field | Value |
|---|---|
| App | `CarCap` |
| Items | **14** (1:1 with findings) |
| Priorities | P2=14 |
| Severities | info=14 |
| Kinds | ORPHAN=5, UNUSED=9 |
| Source commit | `234702a5fd72f68364027494532d349d2fd54655` |
| Analyzer | 1.3.0 |
| Source | `qa/architecture/pilot-car/architecture-data.json` |
| Full register | `CarCap-ARCH-QUEUE.json` (every finding) |
| Status | all `open` until Finish Program resolves |

## Priority slice (risk + warn) — work these first

_No risk/warn findings — info-level orphans/unused remain in the JSON register._

## Info-level register (sample + pointer)

**14** info items (ORPHAN/UNUSED/DUPLICATE/…). Full 1:1 list with evidence is in `CarCap-ARCH-QUEUE.json`. Finish Program picks up by ID from JSON.

| ID | P | Kind | Title | Evidence | Status |
|---|---|---|---|---|---|
| `CarCap-ARCH-01` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:playwright.config.js#playwright.config.js | playwright.config.js:1 — playwright.config.js | open |
| `CarCap-ARCH-02` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:sw.js#sw.js | sw.js:1 — sw.js | open |
| `CarCap-ARCH-03` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: worker:sw.js#sw.js | sw.js:1 — sw.js | open |
| `CarCap-ARCH-04` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: storage:sw.js#carcap-v8 | sw.js:3 — carcap-v8 | open |
| `CarCap-ARCH-05` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:manifest.json#manifest.json | manifest.json:1 — manifest.json | open |
| `CarCap-ARCH-06` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: renderToday | js/app.js:147 — renderToday | open |
| `CarCap-ARCH-07` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: renderGarage | js/app.js:222 — renderGarage | open |
| `CarCap-ARCH-08` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: renderService | js/app.js:261 — renderService | open |
| `CarCap-ARCH-09` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: renderFuel | js/app.js:305 — renderFuel | open |
| `CarCap-ARCH-10` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: renderDocs | js/app.js:351 — renderDocs | open |
| `CarCap-ARCH-11` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: renderSettings | js/app.js:410 — renderSettings | open |
| `CarCap-ARCH-12` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: onClick | js/app.js:828 — onClick | open |
| `CarCap-ARCH-13` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: onChange | js/app.js:993 — onChange | open |
| `CarCap-ARCH-14` | P2 | UNUSED | UNUSED: Exported/defined with no consumers: boot | js/app.js:1022 — boot | open |

## Finish Program notes

- IDs: `<APP>-ARCH-<n>` (stable for this generation order: risk → warn → info, then kind, then finding id).
- Work risk/warn first; orphans/unused are investigate-not-delete (§74).
- Resolving an item = keep/wire/remove with proof, or fix broken/security at root.
- Re-run `npm run architecture:queue` after re-analyzing to refresh this file.
