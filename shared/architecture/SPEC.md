# Cap Architecture Connection Map — Specification v1

**Adopted:** 2026-09-16 (owner request: "a living, Supabase-style visual connection map of the entire application — for all our apps").
**Implements:** the owner's *Universal Application Connection Map* and *Living Application Architecture & Connection Map* briefs, consolidated and adapted to the Cap fleet stacks.
**Built by:** Cursor, under `.cursor/rules/senior-engineering-mode.mdc` (minimal, dependency-light, no fake data). Work items: `docs/audit-2026-09-14/CURSOR-MASTER-PROMPT.md` §2.6 (ARCH-01…ARCH-10).

---

## 0. Principles (non-negotiable)

1. **The codebase is the only source of truth.** Map real relationships, never what the app "should" look like.
2. **No false connections.** Never link things because names look alike, files sit in the same folder, or they seem conceptually related. Every edge is `VERIFIED`, `INFERRED` or `UNKNOWN`, with evidence.
3. **Evidence for everything.** Every edge and every finding carries at least one `{file, line, snippet}` reference (snippet ≤ 120 chars, secrets redacted).
4. **Show uncertainty instead of inventing certainty.** Unresolved = `UNKNOWN`. Missing source = `⚠ NO VERIFIED DATA SOURCE`.
5. **Observe → map → report.** The analyzer never deletes, refactors, merges, migrates or changes behavior. Findings become work items; the developer decides.
6. **Not a runtime dependency.** Nothing in the production app imports, loads or ships the map.
7. **Lightweight.** Viewer: zero runtime dependencies, static files, opens from `file://`. Analyzer: plain Node plus the TypeScript compiler API (dev-only, in `capricorn-tooling`; decision G-11). No graph frameworks unless measured need and written justification.
8. **Never expose secrets.** Environment variables and config are shown by **name** only. `.env*` files are parsed for keys only; values are never read into memory beyond key extraction, never stored, never printed.
9. **Private by default.** The map reveals internal architecture. It must never be served by GitHub Pages (see §1.3, prompt C-57).
10. **Every statistic is computed.** No hand-typed numbers anywhere in the viewer or reports.

---

## 1. Deliverables and locations

### 1.1 Shared (capricorn-tooling)
```
capricorn-tooling/shared/architecture/
├── SPEC.md                    ← this file
├── analyze.mjs                ← CLI entry: detects stack, runs adapters, runs analyses, writes outputs
├── core/                      ← graph model, id rules, evidence, status, analyses, stats, audit writer
├── adapters/                  ← one file per stack (see §3)
├── viewer/                    ← index.html, viewer.js, viewer.css (static, zero deps)
├── schema/architecture-data.schema.json
└── __tests__/                 ← fixture mini-apps + expected graphs (see §8)
```

### 1.2 Per repo
```
<repo>/docs/architecture/
├── index.html                 ← copied viewer (identical to shared; sync-checked)
├── viewer.js / viewer.css     ← copied viewer assets
├── architecture-data.json     ← generated graph (machine-readable)
├── architecture-data.js       ← same data as `window.ARCH_DATA = …` so index.html works from file:// (browsers block fetch() of local JSON)
├── AUDIT.md                   ← generated architecture audit report (§7)
└── README.md                  ← how to regenerate/open; repo-specific notes (short)
<repo>/architecture.config.json ← small declarative config: entry points, feature list, custom router/dispatch patterns, primary journeys, dashboard screens, known demo/mock sources
```
`package.json` script: `"architecture:analyze": "node ../capricorn-tooling/shared/architecture/analyze.mjs"` (DeeFoodieApp: run from repo root; the Dart dumper is invoked by the adapter).

**Exceptions**
- **SoulCap:** `docs/` is the GitHub Pages root. Use `architecture/` at the repo root instead of `docs/architecture/`.
- Any repo whose Pages artifact would include `docs/architecture/` must exclude it (C-57 allowlist). Add a test/CI check that `https://shamikhahmed.github.io/<App>/docs/architecture/index.html` (and SoulCap `…/architecture/index.html`) return 404.

### 1.3 Commit policy
Commit generated outputs (so the map can be opened from a fresh clone) together with `analyzerVersion` and the source commit SHA inside the JSON. CI regenerates and fails **only** on analyzer errors or staleness (the JSON's `sourceCommit` is older than the last commit touching mapped source files) — never on findings.

---

## 2. Data model (`architecture-data.json`)

```jsonc
{
  "schemaVersion": 1,
  "analyzerVersion": "1.x.y",
  "app": "PulseCap", "appVersion": "6.43.1",
  "sourceCommit": "<sha>", "generatedAt": "<ISO>",
  "stacks": ["vanilla-globals", "service-worker"],
  "stats": { /* §6 — computed */ },
  "nodes": [ {
    "id": "fn:js/core/profile.js#deriveContext",          // stable: <type>:<file>#<symbol>
    "type": "function",                                   // §2.1
    "name": "deriveContext", "file": "js/core/profile.js", "line": 42, "endLine": 88,
    "layer": "logic",                                     // app|screen|component|event|logic|state|service|data-access|data|external|config
    "feature": "training",                                // from architecture.config.json or folder inference (status noted)
    "flags": ["UNUSED"],                                  // §2.3 node-level flags
    "meta": { "params": ["profile"], "returns": "context", "exported": true, "props": [], "columns": [], "httpMethod": null }
  } ],
  "edges": [ {
    "id": "e:…", "from": "…", "to": "…",
    "type": "CALLS",                                      // §2.2
    "status": "VERIFIED",                                 // §2.3
    "evidence": [ { "file": "js/app.js", "line": 120, "snippet": "const ctx = Profile.deriveContext(p)" } ],
    "label": "optional human label (e.g. storage key, HTTP method + path, column)"
  } ],
  "trees": { "files": {}, "components": {}, "routes": {}, "services": {}, "state": {} },
  "storage": [ { "kind": "localStorage", "key": "fos_profiles_<id>", "keyPattern": true, "readers": [], "writers": [] } ],
  "network": [ { "host": "wger.de", "paths": [], "consumers": [], "inCSP": true, "inPrivacyPage": true } ],
  "database": { "engine": "postgres|indexeddb|sqlite|…", "tables": [ { "name": "", "columns": [], "pk": [], "fks": [], "indexes": [], "readers": [], "writers": [] } ] },
  "env": [ { "name": "AVIATIONSTACK_ACCESS_KEY", "definedIn": [".env.local (key only)"], "referencedBy": [], "clientExposed": false, "looksSecret": true } ],
  "features": [ { "name": "", "chain": { "ui": true, "component": true, "state": true, "logic": true, "service": true, "persistence": false, "display": true }, "overall": "INCOMPLETE", "evidence": [] } ],
  "traces": {
    "data":    [ { "name": "Workout log", "direction": "down", "path": ["…node ids…"], "status": "VERIFIED|PARTIAL|BROKEN" } ],
    "actions": [ { "name": "Log set button", "direction": "up", "path": [], "status": "" } ],
    "display": [ { "screen": "", "element": "", "shown": "sets this week", "source": "DERIVED|HARDCODED|MOCK|DEMO|NO_VERIFIED_SOURCE", "path": [] } ]
  },
  "findings": [ { "id": "F-001", "kind": "ORPHAN", "severity": "info|warn|risk", "nodes": [], "explanation": "", "evidence": [] } ]
}
```

### 2.1 Node types (icon + text label; never color alone)
`app` 🧭 · `entry` ▶ · `config` ⚙ · `route` 🔀 · `screen` 📱 · `layout` ▦ · `component` ⚛ · `primitive` ◻ · `event` ⚡ · `function` ƒ · `hook` 🪝 · `class` ◈ · `logic` 🧠 · `validator` ✔ · `state` ● · `store` ◉ · `context` ◎ · `service` ⚙︎ · `worker` ⛭ (service worker / web worker / Cloudflare Worker) · `api-endpoint` 🌐 · `external` ☁ · `auth` 🔐 · `database` 🗄 · `table` ▤ · `column` ┆ · `storage` 📦 (localStorage key, IndexedDB store, AsyncStorage key, SharedPreferences key, Cache API cache, KV binding, file) · `static-data` 📄 · `env` 🔑 · `file` 📄 · `dependency` 📚.

### 2.2 Edge types
`IMPORTS` · `EXPORTS` · `LOADS` (script tag / lazy module load) · `RENDERS` · `CALLS` · `USES` · `HANDLES` (event → handler) · `TRIGGERS` · `ROUTES_TO` · `NAVIGATES_TO` · `READS` · `WRITES` · `UPDATES` · `DERIVES_FROM` · `STATE` (reads/updates state) · `PERSISTS_TO` · `STORES_IN` · `CACHES` · `FETCHES_FROM` · `QUERIES` · `MUTATES` · `AUTHENTICATES_THROUGH` · `AUTHORIZES` · `EXTERNAL` · `CONFIG` · `ENV` · `DEPENDS_ON` (package).
Line styles: structural (IMPORTS/LOADS/EXPORTS) thin dotted · UI (RENDERS/ROUTES_TO/NAVIGATES_TO) solid · behavior (CALLS/HANDLES/TRIGGERS/USES) solid with small arrow · data (READS/WRITES/QUERIES/MUTATES/STORES_IN/PERSISTS_TO/FETCHES_FROM/CACHES) thick with double arrow for writes · config/env dashed · auth/external dash-dot. Every edge has a text label on hover/selection.

### 2.3 Statuses and flags
Edge status: `VERIFIED` (resolved symbol / literal evidence) · `INFERRED` (strong pattern, e.g. string-dispatched action, dynamic key with prefix) · `UNKNOWN` (reference found, target unresolved) · `BROKEN` (target missing: handler name not defined, route to missing screen, precache URL 404, fetch host blocked by CSP, storage key read but never written).
Node flags: `ORPHANED` (unreachable from any entry point) · `UNUSED` (exported/defined, no consumer) · `DEAD` (unreachable code path) · `DUPLICATED` · `SUSPICIOUS` · `HARDCODED` · `MOCK` · `DEMO` (Cap sample/demo data — legitimate, labeled) · `SECURITY` (e.g. secret-looking literal, client-exposed secret env, unescaped sink from SINKS.md).

---

## 3. Analyzer adapters (fleet stacks)

The core detects stacks from files present and runs every matching adapter. Adapters emit nodes/edges with evidence; the core resolves cross-adapter links (e.g. client `fetch('/api/x')` → NestJS `@Get('x')`).

| Adapter | Used by | What it extracts |
|---|---|---|
| **es-modules** (TS compiler API, `allowJs`, uses `tsconfig.json` when present for symbol resolution) | AuraCap, ScentCap, CookCap, TravelCap, IdeaCap, PrismCap (`src/`), capricorn-lab/os-next, DeeFoodie `api/`, tooling | imports/exports, JSX `RENDERS` (component identity via symbol resolution → VERIFIED), hooks, calls, event props (`onClick`, `onSubmit`, `onPress`), `useState`/`useReducer`/context/zustand stores, derived values, `fetch`/URL literals, `process.env.*`/`import.meta.env.*` names, `localStorage`/`sessionStorage`, `idb`/`openDB` upgrade stores, Dexie `.stores({…})` schema, AsyncStorage keys, `expo-*` permission/file APIs, unused exports/files, unused `package.json` dependencies |
| **routes-react** | AuraCap, ScentCap (react-router), TravelCap & CookCap (Next app dir `app/**/page.tsx`, `layout.tsx`, route groups), IdeaCap (React Navigation `Stack.Screen`) | route tree, route → screen, screens without routes, unreachable screens, duplicate paths, redirects |
| **vanilla-globals** (TS parser on classic scripts) | CarCap, DeePonyCap, LedgerCap (source modules, not `ledgercap.bundle.js`), MasteryCap, PulseCap, SoulCap `docs/`, SteadyCap, VaultCap | script load order from `index.html` `<script src>`; lazy loaders (PulseCap `MODULE_SRC`, VaultCap `js/core/lazy-loader.js`, MasteryCap route shell); global symbols (top-level declarations in classic scripts, `window.X =`, IIFE namespaces); references → `USES`/`CALLS` (unique global → VERIFIED; ambiguous → INFERRED); template renders (`innerHTML = \`…${expr}…\``, `el('div', …)` helpers) → display expressions; event wiring (`addEventListener`, inline `onclick`, `data-act="…"` string dispatch → INFERRED with the dispatcher as evidence); repo-specific router patterns from `architecture.config.json` (e.g. PulseCap `reg('<screen>', fn)` + `go('<screen>')`, SoulCap `data-tab`, SteadyCap/DeePonyCap nav modules, LedgerCap tab router) |
| **html** | all web apps | entry HTML, manifest, CSP `connect-src`/`script-src` (cross-check network nodes → BROKEN if blocked), inline handlers, `<template>` blocks |
| **service-worker** | all PWAs | cache names, precache lists (flag entries that don't exist in the built artifact as BROKEN), fetch strategies per route, update flow (`skipWaiting`, messages) |
| **cloudflare-worker** | LedgerCap `worker/`, VaultCap `worker/` | request routes, upstream hosts, KV/Secrets **binding names** from `wrangler.toml` (never values), client consumers matched by worker URL |
| **nest-prisma** | DeeFoodieApp `api/` | `schema.prisma` models/fields/`@id`/`@relation`/`@@index` → tables, columns, PK/FK; raw SQL (`$queryRaw`) → QUERY with SQL snippet; `prisma.<model>.<op>` → QUERY/MUTATE; `@Controller`/`@Get|Post…` → API endpoints; guards/middleware → AUTH/AUTHORIZES; storage driver (local/S3) with env names; mobile client calls matched to endpoints |
| **dart-flutter** | DeeFoodieApp `mobile/` | via `mobile/tool/arch_dump.dart` using `package:analyzer` (dev dependency; decision G-11): imports, widget classes, `build()` child constructors → RENDERS, `GoRoute` tree, Riverpod providers + `ref.watch/read` → STATE, `SharedPreferences`/`flutter_secure_storage` keys (names only), `http` calls, asset loads (`archive.json`), `Geolocator`/`ImagePicker` → permission nodes. Fallback without Dart SDK: regex for imports/routes only, all `INFERRED`, and the report says so. |
| **supabase / firebase / sqlite** | none today (verified absence recorded in AUDIT.md) | generic detection (`createClient`, `.from('t')`, auth calls, storage buckets, RLS SQL files, `sqflite`/`expo-sqlite`) so future use is mapped; keep small |
| **env-config** | all | env var names from code references and `.env*` **keys**, `app.json`/`app.config` extras, `next.config`, `vite.config`, Capacitor/Expo config; flags `EXPO_PUBLIC_*`/`NEXT_PUBLIC_*`/`VITE_*` as client-exposed; secret-looking names flagged `SECURITY` when client-exposed |

Adapters must record what they could **not** resolve (dynamic imports with variables, computed property calls, `eval`/`new Function`) as `UNKNOWN` edges or findings — never silently drop them.

---

## 4. Analyses and findings (all with evidence; never auto-fixed)

1. **Reachability & orphans:** traverse from entry points (HTML entry, `main.tsx`, app router roots, service worker, workers, CLI scripts listed in config). Unreached files/symbols → `ORPHANED`.
2. **Unused:** exports without importers; globals without references; components never rendered; hooks never called; services without callers; routes without links/navigation; storage keys written but never read (and read but never written → `BROKEN`); env vars defined but unreferenced (and referenced but undefined → `BROKEN`); `package.json` dependencies never imported.
3. **Duplication:** normalized AST fingerprints of function bodies (identifiers renamed, literals bucketed) — similarity ≥ 0.85 over ≥ 6 statements → `DUPLICATED` with side-by-side snippets; same business concept computed in multiple places (e.g. currency formatting, date formatting, calorie/volume/zakat math) found via shared called-API/expression patterns → `SUSPICIOUS`. **Name similarity alone never produces a finding.**
4. **Hardcoded application data:** numeric/string literals rendered into UI text that are not constants, i18n strings, tokens or config — e.g. counts, money, names, IDs, URLs → `HARDCODED` with the display trace. Legitimate constants (units, labels, limits with names) are excluded.
5. **Mock / sample / demo data:** files and identifiers matching `mock|fixture|fake|sample|seed|demo|placeholder|stub` and their consumers. Cap demo modes are legitimate product features → flag `DEMO` (informational) unless demo data leaks into non-demo paths (→ `SUSPICIOUS`).
6. **Broken paths:** handler names referenced but undefined; dispatch strings with no target; routes to missing screens; fetch hosts not allowed by CSP; SW precache entries missing from the build; UI display values whose upstream chain ends without a data source.
7. **Data traces (downstream)** for each data source (storage key/store/table/API/static data): source → access → logic → state → component → screen → user.
8. **Action traces (upstream)** for each primary journey in `architecture.config.json` (mirror of `qa/finish-loop/STATES.md` journeys): user → screen → control → event → handler → function/service → data source → state update → UI refresh.
9. **Display traces ("dashboard trace")** for every dynamic value on configured dashboard/home screens: shown value expression → component/template → function → state/storage/API; classify `DERIVED` / `HARDCODED` / `MOCK` / `DEMO` / `NO_VERIFIED_SOURCE`.
10. **Feature completeness** per feature in config: UI · component · state · logic · service · persistence · display — each ✓/✗ with evidence; overall `COMPLETE` only if every applicable link is VERIFIED.
11. **State map:** each state holder with writers and readers; duplicated sources of truth (same data persisted in two keys/stores and both written) → `SUSPICIOUS`; data ownership labels: source of truth / derived / cached / UI-only / persisted.
12. **Auth & authorization map** (DeeFoodie API guards, app locks via `local-lock.js`, VaultCap PIN/WebAuthn): which data paths require unlock/auth; unprotected sensitive stores → `SECURITY` (or `UNVERIFIED` when not inspectable).
13. **Security cross-checks:** client-exposed secret-looking env names; secret-looking literals (report location only, redact value); unescaped `innerHTML` sinks cross-referenced with `qa/finish-loop/SINKS.md`; network destinations vs privacy page list.
14. **Business logic map:** functions containing domain calculations (configured keywords per app, e.g. zakat, NAV, P&L, volume, 1RM, calories, recipe scaling) with callers and displayed outputs.

---

## 5. Viewer (`index.html`) — developer-grade, static, zero dependencies

**Layout:** top bar (app, version, commit, generatedAt, health summary, global search, mode + depth + filters) · left panel (architecture explorer by category, searchable file tree, feature list) · center (interactive graph) · right panel (node details) · bottom panel (evidence list with copyable `path:line` and `cursor://file/<abs>:<line>` / `vscode://file/<abs>:<line>` links — absolute paths are computed at open time from a user-set workspace root stored in `localStorage`, never embedded in the JSON).

**Graph:** SVG for ≤ 600 visible nodes, Canvas beyond; layered left→right layout by `layer` (app → screens → components → events → logic → state → services → data access → data/external), grouped in labeled zones; pan (drag, arrow keys), zoom (wheel, +/−), fit, reset; click select; double-click expand/collapse; folders collapse into cluster nodes when the graph is large. Default view for large apps is **Focus** on the app entry at depth 2 — never render an unreadable hairball.

**Modes:** Full · Focus (selected node + connections) · Feature · Data (data edges only) · UI (render/route edges) · Backend (API/DB/worker). **Depth:** 1 · 2 · 3 · Full. **Trace upstream / Trace downstream** buttons highlight the path and list it textually. **Impact analysis** lists everything downstream grouped by type with counts ("affects 3 screens, 5 components, 1 table").

**Tabs:** Graph · Routes · Component tree · Services · Hooks/Functions · State · Storage · Network/APIs · Database · Env/config · Features · Traces (data / actions / displays) · Findings · Audit.

**Node details:** identity (name, type, file, lines), relationships grouped by edge type (imports / imported by / calls / called by / renders / rendered by / reads / writes / depends on / used by), data (source, destination, transformations, state), flags, evidence, and **"How this works"** — a templated plain-English paragraph generated only from the node's actual edges (no LLM, no invented steps; unknown links are stated as unknown).

**Filters:** node types, edge types, statuses/flags (Orphans, Unused, Dead, Broken, Duplicated, Suspicious, Hardcoded, Mock, Demo, Unknown, Security), layers, features, folders.

**Search:** name, file/path (supports `path:line` for CODE → GRAPH), function, component, hook, service, route, state, storage key, table, column, host, env var. Selecting a result focuses it.

**Legend:** node icons + labels, edge line styles + arrowheads + labels, status badges. Nothing relies on color alone.

**Quality:** keyboard operable (tab order, Enter to select, Esc to clear), visible focus, screen-reader summaries for the selected node and trace lists, `prefers-reduced-motion` (no animated layout), light/dark, axe clean, loads `architecture-data.js` (no network), works offline from `file://`.

---

## 6. Health overview (computed)

Files · Screens · Routes · Components · Hooks · Functions · Classes · Services · State holders · Storage keys/stores · Tables · API endpoints · External hosts · Env vars · Dependencies · Edges (by status) · Orphans · Unused · Dead · Duplicates · Broken paths · Hardcoded · Mock · Demo · Unknown · Security items · Features complete/incomplete. Each number links to the filtered list.

---

## 7. `AUDIT.md` (generated)

Sections: Structure · Dependencies (used/unused) · Data flow (traceable UI values %, broken/partial traces) · Storage & database (used/unused keys, stores, tables; duplicated sources of truth) · APIs & external services (consumers, CSP/privacy alignment) · Authentication/authorization · State · UI data completeness (hardcoded/mock/no-source displays) · Orphans · Unused · Duplication · Broken connections · Security items · Risks · Feature completeness table · Analyzer coverage (what could not be analyzed and why). Every line links to evidence. The Finish Program turns these into items `<APP>-ARCH-<n>` (orphans are investigated, not deleted automatically).

---

## 8. Analyzer tests (required)

Fixture mini-apps under `__tests__/fixtures/`: vanilla globals with script order + string dispatch; React + react-router; Next app dir; Expo + React Navigation + AsyncStorage; Dexie/idb; NestJS + Prisma; Dart/Flutter sample (skipped with a clear message if Dart SDK missing, but the regex fallback test always runs); service worker with a missing precache file; env names with a fake secret value (assert the value never appears in output); two similarly named but unrelated functions (assert **no** edge and **no** duplicate finding); a genuine duplicate (assert finding); a hardcoded dashboard number (assert `HARDCODED`); a handler referencing an undefined function (assert `BROKEN`). Snapshot the expected nodes/edges/statuses.

---

## 9. Workflow

```
WRITE CODE → RUN TESTS → npm run architecture:analyze → OPEN docs/architecture/index.html
→ CHECK CONNECTIONS / ORPHANS / DUPLICATION / DATA FLOW / FEATURE COMPLETENESS → REVIEW
```
Regenerate after every structural change and at every app close. Before calling a feature integrated, verify both directions in the map: UI → … → data source, and data source → … → UI.

---

## 10. Final test (the map must answer all of these; otherwise keep improving)

What files, screens, components, functions, services and state exist? Where does each piece of data come from and where does it go? What does each screen depend on? What depends on each service? What happens when a user presses each primary control? Where is data stored? Which APIs, hosts, database objects and env vars are used? Which code is disconnected, unused, duplicated or dead? Which displayed values are hardcoded, mock/demo or without a verified source? Which connections are broken or unknown? What would be affected if I changed this?
