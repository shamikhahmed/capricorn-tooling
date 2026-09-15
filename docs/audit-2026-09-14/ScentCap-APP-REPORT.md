# ScentCap — Tier 1 App Report

**Released:** 2026-09-14 · `v2.1.0` / `scentcap-v211` on `main`  
**Branch:** `finish/scentcap` → merged

## Checklist
| ID | Status |
|----|--------|
| FND-04 React UI adapters | ✅ |
| SCNT-P1-01 Monogram | ✅ |
| SCNT-P1-02 Today | ✅ |
| SCNT-P1-03 Native pack | ✅ docs + PrivacyInfo + encryption flag; ⛔ xcodebuild BLOCKED-EXTERNAL |
| SCNT-P1-04 !important | ✅ (~20 a11y-only remain) |
| SCNT-P1-05 Brand art / disclaimer | ✅ |
| SCNT-P1-06 Dirty files | ✅ preserve; OfflineStatusBar kept; splash not ported |
| SCNT-P1-07 Pro gate | ✅ none found |
| SCNT-P2 location/fonts/privacy/photos | ✅ |

## Verify
- lint: 0 errors
- unit: flacon monogram ok
- e2e: 21 passed, 3 skipped (gallery/matrix gated)
- build: green with self-hosted fonts

## Next app
**MasteryCap**
