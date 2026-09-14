# Cap Fleet Finish Program — Baseline (FLT-00)

Captured: 2026-09-14T13:35:00Z  
Workspace: `/Users/shamikhahmed/Projects/Cap/Cap-Apps`  
Raw dump: `BASELINE-raw.txt`

## Repo matrix

| Repo | Branch | HEAD | Dirty | Upstream | Origin | Notes |
|------|--------|------|------:|----------|--------|-------|
| AuraCap | main | e2b947f | 0 | NONE | github.com/shamikhahmed/AuraCap | Restore-like; no upstream tracking |
| CarCap | main | 85df8c7 | 0 | origin/main | CarCap | Clean |
| CookCap | main | a56ddc9 | 0 | origin/main | CookCap | Clean |
| DeeFoodieApp | main | 70a9b7c | 0 | origin/main | DeeFoodieApp | Clean |
| DeePonyCap | main | 2995124 | 0 | origin/main | DeePonyCap | Clean |
| IdeaCap | main | 3ddd88f | 0 | origin/main | IdeaCap | v1.2.1 on disk (D-02) |
| LedgerCap | main | ba9c350 | 0 | origin/main | LedgerCap | Clean |
| MasteryCap | main | 386bd1a | 0 | origin/main | MasteryCap | 20 local tags |
| PrismCap | main | 03fd9b9 | 0 | origin/main | PrismCap | Clean |
| PulseCap | main | 6c78172 | 109 | NONE | PulseCap | 102 D + 7 ??; no upstream; D-03 |
| ScentCap | main | 88dd116 | 2 | origin/main | ScentCap | Untracked BoutiqueSplash, OfflineBanner |
| SoulCap | main | 311574a | 0 | origin/main | SoulCap | Clean |
| SteadyCap | main | 17d9a95 | 0 | origin/main | SteadyCap | Clean |
| TravelCap | main | d7bbc3b | 0 | origin/main | TravelCap | Clean |
| VaultCap | main | 2447ed6 | 0 | origin/main | VaultCap | Clean |
| capricorn-lab | main | cdb24c4 | 0 | origin/main | capricorn-lab | Clean |
| capricorn-os-next | main | e9b9a2a | 0 | origin/main | capricorn-os-next | `.git.broken-*` present |
| capricorn-tooling | main | ea1df97 | 1 | origin/main | capricorn-tooling | Untracked CLAUDE.md |
| shamikhahmed.github.io | main | 85c7f3a | 0 | NONE | shamikhahmed.github.io | "local restore snapshot" commit |

## Dirty file lists (pre-preserve)

### PulseCap (109)
102 deletions including `.github/workflows/ci.yml`, `.gitignore`, `CHANGELOG.md`, `CLAUDE.md`, `PRIVACY.md`, `README.md`, `VERSION.json`, most of `js/`, `css/`, assets, icons.  
Untracked: `.DS_Store`, `js/capricorn-deck-pro.js`, `js/capricorn-pitch.js`, `js/capricorn-premium-nav.js`, `qa/device-matrix/{browser,ipad,iphone}/`.  
Diagnosis: **likely damage**, not a completed move into `docs/` (docs has notes only). Parked under D-03 / Q-1.

### ScentCap (2 untracked)
- `src/components/layout/BoutiqueSplash.tsx`
- `src/components/layout/OfflineBanner.tsx`

### capricorn-tooling (1 untracked)
- `CLAUDE.md`

## Workspace clutter (FLT-05 candidates)

| Path | Action |
|------|--------|
| `shamikhahmed.github.io-backup-2026-07-10` | Archive → `~/Archive/Cap-Apps/2026-09-14/` |
| `shamikhahmed.github.io-backup-pre-os-live-2026-07-10-v0101` | Archive |
| `shamikhahmed.github.io-backup-pre-os-live-2026-07-10-v096` | Archive |
| `capricorn-os-next/.git.broken-20260911013611` | Archive |

## Branch plan (executed in FLT-00)

1. Dirty repos → commit exact dirty state on `preserve/pre-finish-2026-09-14` (never merge to main).
2. Clean / restored trees → `finish/phase-0` from `origin/main` (or local main if histories match).
3. PulseCap finish work uses restored tree from HEAD/`origin/main` after preserve; do not port deletions until D-03.

## Must-never-ship evidence (Phase 0 hotfixes)

| ID | Evidence | Plan |
|----|----------|------|
| IDEA-P0-01 | `IdeaCap/src/services/ai.ts` EXPO_PUBLIC_* + api.openai/anthropic | Remove cloud path |
| LDG-P0-01 | `LedgerCap/js/engines/prices.js` allorigins/corsproxy | Worker-only |
| VLT-P0-01 | `VaultCap/js/ui.js` + `lazy-loader.js` CDN SheetJS 0.18.5 | Vendor local |
| SOUL-P0-01 | `docs/app.js` profile name Shamikh; e2e regex | → Alex |
| DFD-P0-03 | docker-compose `5435:5432`, `6380:6379` unbound | Bind 127.0.0.1 |
