# Cap Fleet Finish Program — Progress

Updated: 2026-09-15T12:55:00Z · Prompt: **v2**

Current step: **app loops**
Current app: **CarCap** (§14 #11) — in progress (no Tier 1 PASS claimed)

## Closed (automated TIER1 PASS; VO ⛔ — fleet Tier 1 not claimed)
1. SoulCap (8.2.0)
2. ScentCap (2.1.1)
3. MasteryCap (51.9.2)
4. VaultCap (5.2.2)
5. CookCap (3.5.1)
6. PulseCap (6.43.1)
7. SteadyCap (2.5.4)
8. TravelCap (1.0.2)
9. LedgerCap (3.57.2 · CI https://github.com/shamikhahmed/LedgerCap/actions/runs/34967963640)
10. Website workforce widgets live · Browser MCP paired
11. AuraCap (5.4.2 · CI https://github.com/shamikhahmed/AuraCap/actions/runs/34971080491 · `qa/finish-loop/TIER1.json` PASS)

## Hub / catalog (2026-09-15)
- `npm run sync:versions` — removed stale hub package clamp to `1.2.1` in `capricorn-tooling/scripts/sync-versions.mjs` (was downgrading hub `1.3.2`)
- `npm run sync:catalog` → hub `js/products-data.js` + lab `js/products.js` from each Cap `VERSION.json` / `package.json`
  - Closed: Soul 8.2.0 · Scent 2.1.1 · Mastery 51.9.2 · Vault 5.2.2 · Cook 3.5.1 · Pulse 6.43.1 · Steady 2.5.4 · Travel 1.0.2 · Ledger 3.57.2 · Aura 5.4.2
  - In-progress (version only, **not** PASS): CarCap 1.0.1 · PrismCap 4.5.2
- `release:marketing` skipped (pipeline mutates all Cap landings/decks — unsafe mid-loop)
- Capricorn OS redeploy: `capricorn-lab` `npm run deploy:hub` → hub root (Pages = push to `main`)
- Workforce widgets: founder “one person” copy + demo-tease widgets remain honest; DeeFoodie stays `wip` + private beta

## In flight
- CarCap (§14 #11)
- PrismCap — finish loop; do not mark PASS without `TIER1.json`
- Gallery regen (parallel) for closed Caps — screenshot sets may lag UI

## Step R leftovers
- **C-19** — still open fleet-wide. Kill-list table in `CURSOR-MASTER-PROMPT.md` (2026-09-15) remains the G6/G10 queue; per-app Tier 1 PASS may zero product-code counts via SINKS/exclusions, but fleet residual is not closed as a program item.
- **C-22** — still open. Partial evidence: `_workspace/lighthouse-summary-2026-09-15.json` (SoulCap/SteadyCap mobile G5 PASS / G9 FAIL; Ledger/Vault errors; desktop Chrome connect fail) + CookCap `docs/lighthouse-*.report.json` + some per-app `qa/finish-loop/lighthouse/`. Not every primary route; thresholds not met fleet-wide.
- **C-27** — **done**. Brain `path_on_disk` corrected (IdeaCap / MasteryCap historical `Desktop/Cap-Apps` notes marked corrected 2026-09-15); ScentCap note has 2026-09-14/15 finish-program entries. Remaining `Desktop/Cap-Apps` strings are historical “corrected” citations only.

Next: CarCap (§14 #11) → PrismCap. No PASS without `qa/finish-loop/TIER1.json`.

BLOCKED-EXTERNAL: Xcode / TestFlight / physical VO-TB
