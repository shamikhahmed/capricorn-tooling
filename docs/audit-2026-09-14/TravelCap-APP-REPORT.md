# TravelCap — Tier 1 App Report

**Released:** 2026-09-15 · `v1.0.0` on `main`

| ID | Status |
|----|--------|
| TRVL-P1-01 Naming (G-3) | ✅ TravelCap in manifest, tokens, chrome, metadata (Dexie class `TravelOSDB` kept for storage stability) |
| TRVL-P1-02 Lazy OCR | ✅ Tesseract only on Scan; progress % + cancel + failure copy |
| TRVL-P1-03 Documents lock | ✅ CapLocalLock vendored; Settings enable + Documents gate |
| TRVL-P1-04 IA (P-TRVL-1) | ✅ Tabs Trips · Explore · Documents · More; `/` → `/trips`; legacy routes kept |
| TRVL-P1-05 Privacy | ✅ `public/privacy.html` (Nominatim, restcountries, Open-Meteo, Frankfurter, AviationStack) |
| TRVL-P1-06 AviationStack | ✅ Plain CORS/HTTPS plan errors |
| TRVL-P1-07 Disclaimer §4.2 | ✅ Settings Privacy card |
| TRVL-P2 Jargon | ✅ Bureau/Bearer/TravelOS user-facing removed |

**Verify:** typecheck ✅ · lint --quiet ✅ · e2e ia+smoke **24 passed** · `build:export` ✅

**Live:** https://shamikhahmed.github.io/TravelCap/
