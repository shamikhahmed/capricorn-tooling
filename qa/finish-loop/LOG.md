# Capricorn-tooling finish-loop log

## 2026-09-16 — C-29…C-33 mini-plan (hardening tier1)

### C-29 brandOk
- **Problem:** Broad `brandOk` regex skipped hex / sub-11px / `!important` / `outline:none` across most product CSS.
- **Root cause:** Exemption list treated “brand-ish” stylesheets as token files.
- **Files:** `shared/testing/tier1.mjs`
- **Smallest change:** Hex-only allowlist (`shared/design/**`, `tokens.*`, `brand.css`, `brand-palette.*`, `js/brand/colors.js`). Always count sizes (px + rem/em &lt; 0.6875), `!important`, outline. Drop `background-color` line skip; keep theme-color / TileColor / stop-color only.
- **Risks:** Apps that previously “passed” will fail kill-list until tokens are migrated.
- **Verification:** `__tests__/tier1.test.mjs` fixtures + `npm test`.

### C-30 Lighthouse
- Parse JSON; reject stub UA / null scores; require run after last UI commit; enforce perf≥90 a11y≥95 BP≥95 LCP≤2.5s TBT≤200ms CLS≤0.1.
- Stub files deleted in app repos (parallel C-30 chore).

### C-31 Matrix
- Require `qa/finish-loop/matrix-results.json` (0 failures, shot count, freshness).
- Document `FINISH_MATRIX=1` in `FINISH-MATRIX-CI.md`; add CI jobs on SoulCap + PulseCap.
- Extend `finish-matrix.js` with live-audit probes + `writeMatrixResults`.

### C-32 Gaps
- Named workflow + main SHA for CI; test `.skip`/`.only`/`fixme` + allowlist; axe JSON; gallery freshness; live VERSION warn→fail; `__APP_READY__` in product code.

### C-33
- `shared/testing/__tests__/tier1.test.mjs` + `npm test`.
