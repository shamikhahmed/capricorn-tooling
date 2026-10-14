# Baseline device-qa — Phase 0

**Captured:** 2026-10-14  
**Command:** `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright PW_CORE=…/MasteryCap/node_modules/playwright-core node capricorn-tooling/scripts/device-qa.mjs docs/perfection-2026-10/baseline`  
**Result:** 71/98 runs without hard failures (exit 1). JSON: `device-qa.json`. Log: `run.log`. PNGs kept on disk only (not committed).

## Hard FAILs (Wave A tickets)
| App | Issue | Ticket |
|---|---|---|
| TravelCap | pageerror `reading 'waiting'` on `/trips` (all engines) | TRV-V3-1 |
| IdeaCap | overflow-x + `div.css-g5y9jx` 17px (WebKit + Chromium Mac) | IDA-V3-1 |
| CookCap | React hydration #418 (all devices) | CK-V3-1 |

## Soft warns (sample)
AuraCap tap<32px ×5; PrismCap/DeePony/Ledger/Steady/Scent text/tap soft issues — see run.log / Wave B–C ITEMS.
