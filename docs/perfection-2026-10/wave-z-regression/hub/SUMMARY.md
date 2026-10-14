# Wave Z Hub regression — verifier summary

**When:** 2026-10-14 (UTC+5)  
**Fleet:** Cap-Apps / capricorn-lab + shamikhahmed.github.io  
**Toolchain:** `PW_CORE=MasteryCap/node_modules/playwright-core`, `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`

## Targets

| Surface | Base URL |
|---------|----------|
| Capricorn OS (qa-matrix, qa-flows) | `https://shamikhahmed.github.io` |
| Mini-site catalog + samples (curl) | `https://shamikhahmed.github.io/apps/` |

## Results

| Gate | Result | Evidence |
|------|--------|----------|
| `npm test` (smoke-hub.mjs) | **PASS** (exit 0) | `smoke-test.log` |
| `qa-flows.mjs` | **PASS** 39/39 | `qa-flows.log`, `flows/flows.json` |
| `qa-matrix.mjs` | **PASS** 140/140 (10×7×2) | `qa-matrix.log`, `matrix/report.json` |
| Live curl hub index `/apps/` | **PASS** HTTP 200 | verifier curl |
| Live curl vaultcap, cookcap, pulsecap | **PASS** HTTP 200 | verifier curl |
| Live curl Capricorn OS `/` | **PASS** HTTP 200 | verifier curl |
| Stale `PrismCap/` mirror at Pages root | **PASS** absent | local tree |
| Stale `SoulCap/` mirror at Pages root | **PASS** absent | local tree |
| `scripts/link-check.mjs` (catalog, redirects, bundle parity) | **PASS** | `link-check.log` |
| Mini-site index card hrefs (15) | **PASS** all HTTP 200 | verifier curl sweep |

## Artifacts

- Logs: `smoke-test.log`, `qa-flows.log`, `qa-matrix.log`, `link-check.log`
- Playwright: `flows/`, `matrix/report.json` (+ PNG screenshots)
