# PulseCap — Tier 1 App Report

**Released:** 2026-09-15 · `v6.43.0` / `pulsecap-v123` on `main`

| ID | Status |
|----|--------|
| PLS-P0-01 Restore (D-03) | ✅ `finish/pulsecap` from `origin/main`; preserve branch untouched; CI + `.gitignore` present; CLAUDE version truth |
| PLS-P1-01 Sentence-case / accent | ✅ Tab labels sentence-case; solid Ember accent + `--on-accent` / `--accent-text` contrast tokens |
| PLS-P1-02 Today | ✅ Sample-data banner; duplicate Progress CTA removed; insight opens Coach |
| PLS-P1-03 Sub-11px | ✅ App CSS/JS floor ≥11px (`capricorn-core.css` left untouched) |
| PLS-P1-04 Safe areas | ✅ Tab bar, toast top-safe, workout bar top-safe, rest sheet bottom-safe |
| PLS-P1-05 Disclaimer §4.2 | ✅ About, onboarding final step, Rehab |
| PLS-P2 Tokens / fonts / privacy | ✅ `tokens.css` accent system; system fonts (pitch no Google Fonts); privacy current (wger + Smart Coach = rules) |

**Verify:** Playwright chromium — smoke + module-smoke + flows + phase36 + onboarding-skip → **45 passed**

**Live:** https://shamikhahmed.github.io/PulseCap/ · SW `pulsecap-v123`
