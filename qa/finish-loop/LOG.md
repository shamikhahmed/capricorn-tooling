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

## 2026-09-16 — C-57 GitHub Pages hygiene (Review 3 parallel)

### Problem
Apps whose Pages source was the **repo root** published internals: `qa/finish-loop/SINKS.md`, `TIER1.json`, `SECURITY.md`, `HANDOVER.md`, `CLAUDE.md`, `AUDIT.md`, `worker/wrangler.toml`, `.cursor/rules/*`, etc.

### Root cause
`rsync ./ _site` with a short exclude list (or missing stage script) instead of an **allowlisted** public artifact.

### Live audit (2026-09-16, curl)

| Path | Before / first check | After allowlist deploy |
|---|---|---|
| LedgerCap `qa/…/SINKS.md`, `HANDOVER.md`, `worker/wrangler.toml` | 200 / 200 / 200 | **404** |
| VaultCap `qa/…/SINKS.md`, `TIER1.json`, `SECURITY.md` | 200 | **404** (`b6f1334`) |
| DeePonyCap `CLAUDE.md`, `HANDOVER.md` | 200 | **404** (`4942677`) |
| MasteryCap `AUDIT.md` | 200 | **404** (`f0c8ad2`) |
| SteadyCap `HANDOVER.md`, `CLAUDE.md`, `package.json` | 200 / 200 / 404 | **404** (`62227f2`) |
| PrismCap `HANDOVER.md` | 200 | **404** (`164b927`) |
| PulseCap `CLAUDE.md`, `qa/…/TIER1.json` | 200 | Scripts fixed (`65a037c`); **live 404 pending** CI verify+matrix then deploy-pages |
| `.cursor/rules` on DeePony/Ledger/Prism/Steady | mixed | **404** |
| Aura / Scent / Cook (`dist`/`out`) HANDOVER | — | **404** |
| SoulCap (`docs/` artifact) HANDOVER / architecture | — | **404** |
| Hub `.cursor` | — | **404** (C-53) |

### Fix pattern (smallest correct)
1. `scripts/stage-pages-site.sh` + optional `verify-pages-artifact.cjs` (SW precache ⊆ artifact).
2. Workflow `ALLOW_PATHS=…` → stage `_site` → `upload-pages-artifact`.
3. Forbid `qa`, `docs/architecture`, `worker`, `HANDOVER.md`, `CLAUDE.md`, `SECURITY.md`, `package.json`, `.cursor`, …

### SHAs (C-57 allowlist on main)
- VaultCap `b6f1334`
- DeePonyCap `4942677`
- LedgerCap `355e660`
- MasteryCap `f0c8ad2`
- SteadyCap `62227f2`
- PrismCap `164b927`
- PulseCap merge `65a037c` (script add `2d1e944`; prior allowlist CI `d08c8c2`)

### Remaining hygiene (documented, not all fixed this pass)
- **Custom `404.html`:** none of the sample Caps serve a real `404.html` (GitHub soft-404). Optional follow-up.
- **Cache headers:** GitHub Pages sets CDN `cache-control` / `max-age` (observed ~600s on hub). Apps cannot set custom cache headers on Pages without a Worker/proxy — note only; SW cache names remain the app update lever.
- **PulseCap live:** wait for CI `deploy-pages` after merge; re-curl `CLAUDE.md` + `TIER1.json`.
- **CarCap:** no GitHub Pages API on repo; `/CarCap/` served via hub mirror — already 404 on junk paths; confirm hub stage allowlist covers CarCap tree.
- **DeeFoodieApp:** `/DeeFoodieApp/` returns 200 HTML stub — confirm no secrets; private app.
- **ARCH-06:** after maps exist, curl `…/docs/architecture/index.html` (SoulCap `…/architecture/index.html`) must stay 404.

### ARCH-01
Fleet topology written: `docs/audit-2026-09-14/ARCHITECTURE-FLEET-MAP.md` (+ `shared/architecture/FLEET.md` pointer). Analyzer core already on main (`c941978` / `c628e40`, 16/16 tests). Next: ARCH-02 viewer.

## 2026-09-16 — C-30 product LH (SoulCap + PulseCap)
- Real lighthouse@13.4.1 JSON committed on `finish/soulcap-c30` (`154a515`) and `finish/pulsecap-c30` (`cacae9b`).
- Stub LH dirs still empty for Aura/Car/DeePony/Idea/Ledger/Prism/Travel/DeeFoodie (prior delete commits); no remaining `tier1-evidence-stub` outside test fixtures.
