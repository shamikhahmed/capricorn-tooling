# SoulCap — APP-REPORT (Tier 1)

**Date:** 2026-09-14  
**Version:** 8.2.0 · SW `soulcap-v820` · tag `v8.2.0`  
**Branch merged:** `finish/soulcap` → `main`

## Score
Round 1 finish: **70 → Tier 1 target met for PWA gates worked in this loop** (Help, Now IA, app lock, perf shell budget, privacy, lab exclusion). Residual: gallery regenerate optional; full axe/Lighthouse CI matrix not re-run on every viewport in this session (mobile e2e 185+ passed; 1 chip-selector fix then personas green).

## Items completed
| ID | Result |
|----|--------|
| SOUL-P0-02 | Region-aware Help + age gate (D-05); SAFETY.md sources |
| SOUL-P1-04 | Now Q-3 first-fold |
| SOUL-P1-05 | CapLocalLock + Settings Privacy app lock |
| SOUL-P1-06 | Lazy JSON + route modules; shell JS gzip ~118KB |
| SOUL-P2 | privacy.html, foundation CSS, focus-visible, lab README, sub-11px cleared |

## Verify
- `npm run test:safety` / mobile lock + safety: green
- Full mobile suite: 185 passed, 2 skipped, 1 fixed (personas chip) → personas 5/5
- Live deploy: workflow `34883661430` (queued at release)

## Residual / next human
- Optional: regenerate screen gallery PNGs under `CAPTURE_GALLERY=1`
- Clinical review before any future store submit (G-1: PWA only)

## Next app
**ScentCap** (+ FND-04 React adapters)
