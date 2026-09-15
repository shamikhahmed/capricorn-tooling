# Cap Fleet Finish Program — Progress

Updated: 2026-09-15T12:40:00Z · Prompt: **v2**

Current step: **app loops**
Current app: **AuraCap** (§14 #10)

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

## Hub / catalog (2026-09-15)
- `npm run sync:versions` → 0 file(s) updated
- `npm run sync:catalog` → hub `products-data.js` + lab `products.js` versions aligned to closed Caps
- `release:marketing` skipped (full pipeline mutates all Cap landings/decks — unsafe mid-loop)
- sync-catalog fix: lab array `{ slug, ver }` format now patched (was no-op before)
- Capricorn OS catalog deploy via `capricorn-lab` → hub (Pages = push to `main`)
- **Galleries regenerating in parallel** — screenshot sets may lag UI until gallery jobs finish

## In flight
- AuraCap: next
- Gallery regen (parallel) for closed Caps

## Step R leftovers
- C-19 / C-22 fleet remaining · C-27 Brain ⏳

Next: AuraCap → CarCap (§14 #11).

BLOCKED-EXTERNAL: Xcode / TestFlight / physical VO-TB
