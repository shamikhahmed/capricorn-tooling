# ARCH-05 — Fleet roll-out (beyond Pulse/Scent)

**Date:** 2026-09-23  
**Tooling branch:** `finish/arch-05`  
**Analyzer:** 1.3.0 (was 1.2.0)  
**Base:** `origin/main` @ `f9cd538` (ARCH-04 merge)

## Scope

Roll-out `architecture:analyze` + pilot configs for every Cap app and hub sources listed in ARCHITECTURE-FLEET-MAP / master prompt §2.6 ARCH-05. Outputs stay under `qa/architecture/` in capricorn-tooling (large `architecture-data.*` gitignored). Per-app `docs/architecture/` landing remains a follow-up (copy configs into each repo).

## Apps covered (17)

| Slug | Root | Config | Notes |
|---|---|---|---|
| pulse | PulseCap | pulsecap.* | ARCH-04 re-run on 1.3.0 |
| scent | ScentCap | scentcap.* | ARCH-04 re-run on 1.3.0 |
| aura | AuraCap | auracap.* | React routes |
| car | CarCap | carcap.* | TABS + go + data-go |
| cook | CookCap | cookcap.* | Next `src/app` (single page) |
| deefoodie | DeeFoodieApp | deefoodie.* | Flutter + Nest/Prisma (`api/`) |
| deepony | DeePonyCap | deeponycap.* | Nav.go; `releases/` skipped |
| idea | IdeaCap | ideacap.* | Expo Stack.Screen (multiline) |
| ledger | LedgerCap | ledgercap.* | Navigation + TABS/MORE; `*.bundle.js` skipped |
| mastery | MasteryCap | masterycap.* | tabs-tuples + navigate |
| prism | PrismCap | prismcap.* | js/ + src/ |
| soul | SoulCap/docs | soulcap.* | data-tab; Pages root = docs/ |
| steady | SteadyCap | steadycap.* | Navigation.go + TABS |
| travel | TravelCap | travelcap.* | Next `src/app/(app)/**` |
| vault | VaultCap | vaultcap.* | ALL_MODULES + worker |
| lab | capricorn-lab | capricorn-lab.* | Hub canonical source |
| hub | shamikhahmed.github.io | hub-pages.* | Mirrors skipped; marketing shell |

## Commands

```bash
git fetch origin && git checkout -b finish/arch-05 origin/main
npm run architecture:test   # 27/27

# per-app (example)
node shared/architecture/analyze.mjs \
  --root ../CarCap \
  --config qa/architecture/pilots/carcap.architecture.config.json \
  --out qa/architecture/pilot-car
```

## Adapter fixes (with tests)

1. **Next `src/app/**/page`** — CookCap/TravelCap routes were invisible (`app/` only).  
   Fix: match `(src/)?app/**/page`. Test: `next-src-app` fixture.

2. **Multiline `Stack.Screen`** — IdeaCap `name="Record"` on following line.  
   Fix: multiline name capture. Test: `expo-nav-multiline`.

3. **tabs-id / Nav.go / Navigation.go / data-go / data-tab** — Car/Steady/Ledger/DeePony/Soul.  
   Fix: new dispatch pattern types + HTML data-tab. Test: `vanilla-nav-tabs`.

4. **tabs-tuples** — MasteryCap `[['today', …], …]`.  
   Fix: first string of each inner array → screen.

5. **ALL_MODULES** — VaultCap module registry → screens via tabs-id names.

6. **Skip noise** — `releases`, `_site`, `out`, `*.bundle.js`, hub mirrored Cap folders.

7. **Nested Nest detect** — DeeFoodieApp `api/package.json` + `api/prisma/schema.prisma`.

## Spot-check

Automated structural verification (evidence file exists + snippet/name in source), ≥15 claims/app where graph allows:

| Combined | Precision |
|---|---|
| **314/314** | **100%** |

Evidence: `qa/architecture/SPOT-CHECK-ARCH05.json`.  
Pulse/Scent ARCH-04 hand spot-check (60/60) remains in `SPOT-CHECK.json`.

Backend presence (supabase/firebase/sqlite): **absent** on all 17 AUDIT runs.

## Honest gaps (→ later ARCH)

- Journey traces from `primaryJourneys` still not auto-materialized (`traces.actions`) — analyzer coverage gap (not ARCH-08; ARCH-08 is staleness/check).
- Findings triage → queue items — ARCH-07 ✅.
- Per-app `docs/architecture/` + `architecture:analyze` script in each repo — follow-up.
- CookCap is a single Next page (accurate); deeper recipe IA is component-graph only.
- Hub Pages shell has few “screens”; product maps live in lab + each Cap.
- LedgerCap still has many Navigation.go targets beyond primary tabs (noise screens, structurally true).

## Remaining ARCH items

| ID | Item | Status |
|---|---|---|
| ARCH-01…04 | Core / viewer / adapters / Pulse+Scent pilot | ✅ |
| ARCH-05 | Roll-out all apps + hub | ✅ this PR |
| ARCH-06 | Never publish maps (curl 404) | ✅ PR #10 `bc7227c` |
| ARCH-07 | Findings → queue items | ✅ (see ARCH-07 section below) |
| ARCH-08 | Staleness + `architecture:check` + G15 | ✅ (see ARCH-08 section below) |
| ARCH-09 | Regenerate workflow | ❌ |
| ARCH-10 | APP-REPORT Architecture section | ❌ |

---

# ARCH-06 — Never publish architecture maps (curl 404)

**Date:** 2026-09-23  
**Tooling branch:** `finish/arch-06`  
**Base:** `origin/main` @ `ac4c933` (ARCH-05 merge)

## Scope

Align with C-57 Pages allowlists: architecture map artifacts must never be served on GitHub Pages. Add a **live curl gate** (script + CI) that requires HTTP 404/410 for every fleet map URL.

C-57 already stages allowlisted `_site` / `dist` / `out` / SoulCap `docs/` (maps belong at SoulCap repo-root `architecture/`, outside the Pages root). ARCH-06 closes the verification gap called out in SPEC §1.2 and master prompt §2.6.

## Gate

| Piece | Path |
|---|---|
| URL matrix + classifier | `shared/architecture/pages-unpublished.mjs` |
| Live curl CLI | `scripts/verify-architecture-unpublished.mjs` |
| npm | `npm run architecture:pages-404` |
| Offline tests | `shared/architecture/__tests__/pages-unpublished.test.mjs` |
| CI | `.github/workflows/architecture-pages-404.yml` (unit + live; weekly cron) |
| Evidence | `qa/architecture/PAGES-404-ARCH06.json` |

**Matrix:** 2 hosts × 16 targets (15 Caps/stubs + hub) × 3 artifacts  
`index.html`, `architecture-data.json`, `architecture-data.js`  
SoulCap path: `/SoulCap/architecture/…` (not `/docs/architecture/`).

**Pass:** every URL → HTTP 404 or 410. Status 200 (or architecture payload in body) fails the gate. Network errors fail (no silent skip).

**Verified (this branch):** **96/96** → HTTP 404 (`PAGES-404-ARCH06.json`). Hosts: `shamikhahmed.github.io` (apps live) + `cap-apps.github.io` (currently 404 site-wide; still gated).

## Commands

```bash
git fetch origin && git checkout -b finish/arch-06 origin/main
npm run architecture:test          # includes pages-unpublished offline tests
npm run architecture:pages-404     # live curl; writes PAGES-404-ARCH06.json
```

## Remaining ARCH items

| ID | Item | Status |
|---|---|---|
| ARCH-01…05 | Core / viewer / adapters / pilots / fleet | ✅ |
| ARCH-06 | Never publish maps (curl 404) | ✅ this PR |
| ARCH-07 | Findings → queue items | ✅ (see ARCH-07 section below) |
| ARCH-08 | Staleness + `architecture:check` + G15 | ✅ (see ARCH-08 section below) |
| ARCH-09 | Regenerate workflow | ❌ |
| ARCH-10 | APP-REPORT Architecture section | ❌ |

---

# ARCH-07 — Findings → Finish Program queue items

**Date:** 2026-09-23  
**Tooling branch:** `finish/arch-07`  
**Base:** `origin/main` @ `402aab6` (post ARCH-06 progress wave)

## Scope

Turn analyzer **findings** into durable, actionable Finish Program items `<APP>-ARCH-<n>` with evidence and "Done when" text. Never auto-delete / auto-fix (SPEC §0.5, DECISIONS G-11, master prompt §2.6 ARCH-07).

## Interpretation (smallest coherent)

| Decision | Choice |
|---|---|
| Mapping | **1:1** — every finding → one queue item (stable sort: risk → warn → info, then kind, then finding id) |
| Pickup path | Tooling `qa/architecture/queue/` + fleet `QUEUE-INDEX.{md,json}` (Finish Program reads here; not a parallel process). Per-app `qa/finish-loop/ARCH-QUEUE.md` copy is deferred — same IDs when apps land maps. |
| Human MD vs machine JSON | JSON = full register; Markdown = priority slice (risk/warn) + info sample + pointer to JSON |
| Priority | risk→P0, warn→P1, info→P2 (Finish Program works P0/P1 first) |
| Proof apps | PulseCap + ScentCap + CarCap + VaultCap (CLI can scan all `pilot-*`) |

## Deliverables

| Piece | Path |
|---|---|
| Core | `shared/architecture/findings-to-queue.mjs` |
| CLI | `scripts/architecture-findings-to-queue.mjs` |
| npm | `npm run architecture:queue` |
| Tests | `shared/architecture/__tests__/findings-to-queue.test.mjs` (in `architecture:test`) |
| Index | `qa/architecture/QUEUE-INDEX.md` + `.json` |
| Queues | `qa/architecture/queue/<App>-ARCH-QUEUE.{json,md}` |

## Proof generation (committed)

```bash
npm run architecture:test          # 36/36
npm run architecture:queue -- --apps PulseCap,ScentCap,CarCap,VaultCap
```

| App | Items | P0 | P1 | P2 |
|---|---:|---:|---:|---:|
| PulseCap | 444 | 0 | 15 | 429 |
| ScentCap | 935 | 1 | 0 | 934 |
| CarCap | 14 | 0 | 0 | 14 |
| VaultCap | 593 | 0 | 153 | 440 |
| **Total** | **1986** | **1** | **168** | **1817** |

Example IDs: `PulseCap-ARCH-01` (BROKEN), `ScentCap-ARCH-01` (SECURITY / `VITE_FRAGANTY_API_KEY`).

## Remaining ARCH items

| ID | Item | Status |
|---|---|---|
| ARCH-01…06 | Core / viewer / adapters / pilots / fleet / Pages 404 | ✅ |
| ARCH-07 | Findings → queue items | ✅ this PR |
| ARCH-08 | Staleness + `architecture:check` + G15 | ✅ (see ARCH-08 section below) |
| ARCH-09 | Regenerate workflow | ❌ |
| ARCH-10 | APP-REPORT Architecture section | ❌ |

---

# ARCH-08 — Staleness + `architecture:check` + G15

**Date:** 2026-09-23  
**Tooling branch:** `finish/arch-08`  
**Base:** `origin/main` @ `777f0dc` (ARCH-07 merge PR #12)

## Scope

SPEC §1.3 + master prompt §2.6 ARCH-08: CI / check fails when a map's **viewer copy drifts** from `shared/architecture/viewer/` or when `architecture-data.json` **`sourceCommit` is behind** the latest commit touching mapped source files (node `file` paths). Never fails on findings.

Wire **G15** into `tier1.mjs` as the ARCH-08 subset (hard-fail only when a map is present).

## Deliverables

| Piece | Path |
|---|---|
| Core | `shared/architecture/check-staleness.mjs` |
| CLI | `scripts/architecture-check.mjs` |
| npm | `npm run architecture:check` (default: all `qa/architecture/pilot-*`) |
| Tests | `shared/architecture/__tests__/check-staleness.test.mjs` (in `architecture:test`) |
| G15 | `shared/testing/tier1.mjs` → `g15:architecture` (+ `TIER1_SKIP_ARCH=1`) |
| Evidence | `qa/architecture/CHECK-ARCH08.json` |

## Commands

```bash
git fetch origin && git checkout -b finish/arch-08 origin/main
npm run architecture:test          # 46/46
npm run architecture:check         # pilots × Cap siblings; writes CHECK-ARCH08.json
# single app:
npm run architecture:check -- --root ../PulseCap --map qa/architecture/pilot-pulse
```

## Proof (this branch)

`architecture:test` **46/46**.  
`architecture:check` on tooling pilots vs Cap-Apps siblings: **12/17 PASS**, **5 FAIL** (stale sourceCommit — Cook/Ledger/Pulse/Scent/Travel). Viewer sync OK on all present pilots. Failures are **correct** gate behavior until ARCH-09 regenerate.

## Honesty / not covered here

| Covered by ARCH-08 | Not covered (deferred) |
|---|---|
| Viewer asset byte-sync vs shared viewer | `traces.actions` / journey auto-materialization (analyzer gap; earlier LOG mis-labeled as ARCH-08 — belongs with analyzer completeness, not this gate) |
| `sourceCommit` freshness vs mapped sources | Unexplained `BROKEN` edge count = 0 |
| G15 soft-warn when map absent; hard-fail when map present + stale/drift | `NO_VERIFIED_SOURCE` on primary screens |
| | Full AUDIT.md “every finding resolved or queued” (ARCH-07 queues; triage is human) |
| | Live Pages 404 (ARCH-06) |
| | Per-app CI scripts (add when `docs/architecture/` lands in each repo) |

## Remaining ARCH items

| ID | Item | Status |
|---|---|---|
| ARCH-01…07 | Core / viewer / adapters / pilots / fleet / Pages 404 / findings→queue | ✅ |
| ARCH-08 | Staleness + `architecture:check` + G15 | ✅ |
| ARCH-09 | Regenerate workflow | ✅ (see ARCH-09 section below) |
| ARCH-10 | APP-REPORT Architecture section | ❌ |

---

# ARCH-09 — Regenerate workflow

**Date:** 2026-09-23  
**Tooling branch:** `finish/arch-09`  
**Base:** `origin/main` @ `16f3555` (ARCH-08 merge PR #14)

## Scope

SPEC §9 / §1.3 + master prompt §2.6 ARCH-09: after structural change (or when `architecture:check` reports stale `sourceCommit`), regenerate pilot maps from Cap-Apps sibling checkouts. Never fake success when siblings are missing. CI runs unit tests + dry-run discovery; live regen is local / optional when `CAP_APPS_ROOT` is set.

## Deliverables

| Piece | Path |
|---|---|
| Core | `shared/architecture/regenerate.mjs` |
| CLI | `scripts/architecture-regenerate.mjs` |
| npm | `npm run architecture:regen` / `architecture:regenerate` (`--stale`, `--slugs`, `--dry-run`) |
| Tests | `shared/architecture/__tests__/regenerate.test.mjs` (in `architecture:test`) |
| CI | `.github/workflows/architecture-regenerate.yml` (unit + dry-run; live regen is local) |
| Evidence | `qa/architecture/REGEN-ARCH09.json` + refreshed `CHECK-ARCH08.json` |

## Commands

```bash
git fetch origin && git checkout -b finish/arch-09 origin/main
npm run architecture:test          # 51/51
npm run architecture:regen -- --dry-run
npm run architecture:regen -- --stale
# or explicit stale set from ARCH-08:
npm run architecture:regen -- --slugs cook,ledger,pulse,scent,travel
npm run architecture:check         # expect 17/17 after regen
```

## Proof (this branch)

`architecture:test` **51/51**.  
`architecture:regen -- --slugs cook,ledger,pulse,scent,travel` → **ok=5 failed=0** (siblings present).  
`architecture:check` → **17/17 PASS** (was 12/17; Cook/Ledger/Pulse/Scent/Travel refreshed).  
Pilot `architecture-data.*` remain gitignored under `pilot-*/`; evidence JSON committed.

## Honesty / not covered here

| Covered by ARCH-09 | Not covered (deferred) |
|---|---|
| Discover pilots + analyze → `pilot-*` outs | ARCH-10 APP-REPORT Architecture section |
| `--stale` uses ARCH-08 check | Auto-commit of regenerated maps into Cap app repos |
| Honest skip when Cap sibling missing | Live CI regen without Cap-Apps checkout (dry-run only) |
| Does not fail on findings | Re-queue after regen (re-run `architecture:queue` separately) |

## Remaining ARCH items

| ID | Item | Status |
|---|---|---|
| ARCH-01…08 | Core … staleness/G15 | ✅ |
| ARCH-09 | Regenerate workflow | ✅ |
| ARCH-10 | APP-REPORT Architecture section | ✅ this PR |

---

# ARCH-10 — APP-REPORT Architecture section

**Date:** 2026-09-23  
**Branch:** `finish/arch-10`  
**Base:** ARCH-09 merge `cbbc25c`

## Scope

Emit a paste-ready `## Architecture` block for Cap Finish `qa/finish-loop/APP-REPORT.md` from pilot maps (+ optional ARCH-07 queue). Also ship a blank shared template.

## Pieces

| Piece | Path |
|---|---|
| Generator | `shared/architecture/app-report-section.mjs` |
| CLI | `npm run architecture:app-report` (`scripts/architecture-app-report.mjs`) |
| Blank template | `shared/architecture/templates/APP-REPORT-ARCHITECTURE.md` |
| Tests | `shared/architecture/__tests__/app-report-section.test.mjs` |
| Proof | `qa/architecture/APP-REPORT-ARCH10-PulseCap.md` + `qa/architecture/proof/` |

## Commands

```bash
npm run architecture:app-report -- --app PulseCap
npm run architecture:app-report -- --app PulseCap --out qa/architecture/APP-REPORT-ARCH10-PulseCap.md
npm run architecture:app-report -- --app PulseCap --insert ../PulseCap/qa/finish-loop/APP-REPORT.md
npm run architecture:app-report -- --template
```

## Honesty

Map-derived SPEC §10 answers only; gaps stated. Does **not** claim product Tier 1. Architecture track ARCH-01…10 complete on tooling.
