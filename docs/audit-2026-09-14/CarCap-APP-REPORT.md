# CarCap — Tier 1 App Report

**Released:** 2026-09-15 · **v1.0.0** / SW `carcap-v7` · merge `02b6c14` · tag `v1.0.0`

| Field | Value |
|-------|--------|
| Status | Tier 1 (P0/P1 complete) |
| Live | https://shamikhahmed.github.io/CarCap/ |
| Hub deploy | `2f357b9` on shamikhahmed.github.io |
| CI | https://github.com/shamikhahmed/CarCap/actions/runs/34897127540 — **success** |
| Live SW | `curl …/sw.js` → **carcap-v7**; live Playwright cache `["carcap-v7"]`, `__APP_READY__`, Coming up, 0 console errors (2026-09-14) |
| Score (baseline → after) | 48 → ~86 |

## P0 / P1 register

| ID | Severity | What was wrong | What was done | Status |
|----|----------|----------------|---------------|--------|
| CAR-P0-01 | P0 | Splash every load | First-launch only (already on main) | ✅ |
| CAR-P1-01 | P1 | No reduced-motion CSS | `@media (prefers-reduced-motion: reduce)` | ✅ |
| CAR-P1-02 | P1 | 4 native confirms | CapConfirm + Toast `role=status` | ✅ |
| CAR-P1-03 | P1 | Missing states | Economy / overdue / expired / invalid JSON | ✅ |
| CAR-P1-04 | P1 | No privacy page | `privacy.html` §4.4 | ✅ |
| CAR-P1-05 | P1 | Reminders incomplete | Coming up 30d + optional PWA notifications (P-CAR-1) | ✅ |
| CAR-P1-06 | P1 | Docs text-only | IndexedDB photos ≤2 MB + G-6 schema v2 | ✅ |

## Decisions applied
G-4, G-6, G-8 (→ **1.0.0**), P-CAR-1, §4.1 description, §4.4 privacy template.

## Verify
- `npm run verify` — **11 passed** (2 smoke + 9 P1)
- Native dialogs in product path — **0**
- Version single-source: `VERSION.json` / `APP_VERSION` / SW / package — **1.0.0** / `carcap-v7`

## Remaining / gaps
- Physical VoiceOver/TalkBack: ⛔ BLOCKED-EXTERNAL
- Full finish-matrix / Lighthouse suite not yet in CarCap CI (primary journeys covered by Playwright)
- JSON export excludes photo blobs (documented in HANDOVER)

## Release log
- Branch `finish/carcap` → merge `02b6c14` on `main`
- Tag `v1.0.0`
- Hub rsync + commit `2f357b9`
- Live: https://shamikhahmed.github.io/CarCap/
