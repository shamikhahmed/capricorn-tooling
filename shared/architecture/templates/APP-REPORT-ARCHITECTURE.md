## Architecture

_Fill via `npm run architecture:app-report -- --app <App>` from capricorn-tooling (ARCH-10), or complete by hand after `architecture:analyze`. Architecture track ≠ product Tier 1._

| Field | Value |
|---|---|
| App | `REPLACE_APP_ID` |
| Analyzer | |
| Map generatedAt | |
| sourceCommit | |
| Map path | `qa/architecture/pilot-<slug>/` or `docs/architecture/` |

### Health (from map)

| Metric | Count |
|---|---:|
| Files | |
| Screens | |
| Functions | |
| Edges (total) | |
| Orphans | |
| Unused | |
| Broken paths | |
| Findings (map) | |
| Features complete | |
| Features incomplete | |

### Feature completeness

| Feature | Overall | UI | Component | Logic | State | Service | Persistence | Display |
|---|---|---|---|---|---|---|---|---|
| `…` | | | | | | | | |

### Findings — resolved / remaining

From ARCH-07 queue: **N** items · **R** resolved · **M** remaining.

Pickup: tooling `qa/architecture/queue/<App>-ARCH-QUEUE.md`.

### SPEC §10 — map answers

| ID | Status | Question | Answer |
|---|---|---|---|
| Q1 | `gap` | What files, screens, components, functions, services and state exist? | _(fill from map / viewer / adapter plan)_ |
| Q2 | `gap` | Where does each piece of data come from and where does it go? | _(fill from map / viewer / adapter plan)_ |
| Q3 | `gap` | What does each screen depend on? | _(fill from map / viewer / adapter plan)_ |
| Q4 | `gap` | What depends on each service? | _(fill from map / viewer / adapter plan)_ |
| Q5 | `gap` | What happens when a user presses each primary control? | _(fill from map / viewer / adapter plan)_ |
| Q6 | `gap` | Where is data stored? | _(fill from map / viewer / adapter plan)_ |
| Q7 | `gap` | Which APIs, hosts, database objects and env vars are used? | _(fill from map / viewer / adapter plan)_ |
| Q8 | `gap` | Which code is disconnected, unused, duplicated or dead? | _(fill from map / viewer / adapter plan)_ |
| Q9 | `gap` | Which displayed values are hardcoded, mock/demo or without a verified source? | _(fill from map / viewer / adapter plan)_ |
| Q10 | `gap` | Which connections are broken or unknown? | _(fill from map / viewer / adapter plan)_ |
| Q11 | `gap` | What would be affected if I changed this? | _(fill from map / viewer / adapter plan)_ |

**Paste location:** `qa/finish-loop/APP-REPORT.md`
