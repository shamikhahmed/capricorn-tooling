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

- Journey traces from `primaryJourneys` still not auto-materialized (`traces.actions`) — ARCH-08.
- Findings triage → queue items — ARCH-07.
- Per-app `docs/architecture/` + `architecture:analyze` script in each repo — follow-up.
- CookCap is a single Next page (accurate); deeper recipe IA is component-graph only.
- Hub Pages shell has few “screens”; product maps live in lab + each Cap.
- LedgerCap still has many Navigation.go targets beyond primary tabs (noise screens, structurally true).

## Remaining ARCH items

| ID | Item | Status |
|---|---|---|
| ARCH-01…04 | Core / viewer / adapters / Pulse+Scent pilot | ✅ |
| ARCH-05 | Roll-out all apps + hub | ✅ this PR |
| ARCH-06 | Never publish maps (curl 404) | Partial (C-57); curl gate TBD |
| ARCH-07 | Findings → queue items | ❌ |
| ARCH-08 | Staleness + `architecture:check` + G15 | ❌ |
| ARCH-09 | Regenerate workflow | ❌ |
| ARCH-10 | APP-REPORT Architecture section | ❌ |
