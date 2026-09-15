# Cap Fleet Finish Program — Progress

Updated: 2026-09-15T10:48:26Z · Prompt: **v2** (Review 2 — Tier 1 claims revoked)

Current step: **app loops** (Step R largely complete; C-19/C-22/C-27 remaining as fleet work)
Current app: **ScentCap** (2/16) — driving `npm run tier1` to PASS after kill-list / dialogs / LH / SINKS

## Closed
- **SoulCap** (1/16): `TIER1.json` PASS · VO ⛔ **BLOCKED-EXTERNAL** (macOS Safari VO / device) — fleet Tier 1 **not** claimed · warn: matrix:shots
- **Website / Capricorn OS**: full Cap workforce widgets live (15 apps); founder copy updated; BrowserStack + Playwright MCP authenticated

## ScentCap this slice
- Palette hex → `src/design/tokens.ts` (brandOk)
- Native `alert`/`confirm` → ConfirmDialog
- Suppressions removed; SINKS.md + Lighthouse JSON landed
- CI unblock: finish-matrix `any` typing
- Next: main CI green → regenerate TIER1.json PASS → native pack leftovers (G-1) → close → VaultCap

## Step R status
| ID | Status |
|----|--------|
| C-09 Honesty | ✅ recorded |
| C-10 tier1.mjs | ✅ wired in all 15 apps + DeeFoodieApp root; VitePWA SW match |
| C-11 TravelCap lockfile | ✅ 1.0.1 CI green |
| C-12 TravelCap suppressions | ✅ |
| C-13 TravelCap SW basePath | ✅ live /TravelCap/ precache |
| C-14 DeePony SW | ✅ 3.8.1 / deeponycap-v61 |
| C-15 Website TravelOS + Hub CI | ✅ |
| C-16 Self-host fonts | ✅ live indexes 0 Google Fonts |
| C-17 SteadyCap streak | ✅ 2.5.2 / steadycap-v52 |
| C-18 no-console suppressions | ✅ |
| C-19 Kill-list → 0 | ⏳ SoulCap 0; ScentCap product kill-list cleared this slice; fleet remaining |
| C-20 __APP_READY__ + galleries | ✅ APP_READY set (galleries regen still open) |
| C-21 finish-matrix wired | ✅ specs+CI smoke (full 15×2 pending green) |
| C-22 Lighthouse JSON | ⏳ SoulCap + ScentCap have JSON; fleet remaining |
| C-23 Loop records | ✅ stubs in every app qa/finish-loop/ |
| C-24 Docs cleanup | ✅ SISTER/prompts archived; workspace clutter moved |
| C-25 Tags | ✅ LedgerCap v3.57.0 etc. |
| C-26 tooling merge | ✅ |
| C-27 Brain | ⏳ |
| C-28 PROGRESS reset | ✅ |

Next 5 actions:
1. ScentCap: wait main CI green → `npm run tier1` PASS → APP-REPORT
2. ScentCap native pack leftovers (G-1) if not already present
3. Close ScentCap → VaultCap loop
4. C-22 Lighthouse JSON for remaining apps
5. C-27 Brain path reconciliation

BLOCKED-EXTERNAL: Xcode full / TestFlight upload / physical phone VO-TB (macOS VO+Safari counts for web)

Apps: **SoulCap** automated TIER1 PASS (VO blocked). **ScentCap** in progress. All others **In progress — Tier 1 not verified**.
