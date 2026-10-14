# Perfection Loop v3 — Progress
Updated: 2026-10-14T11:12:00Z · Wave: A · Hub mini-sites expanded + pushed

| App | Phase (A–J) | Branch | P0 | P1 | P2 | P3 | Matrix % | Gallery L/D | Mini-site | Docs | Live ver | Auditor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| VaultCap | A–E | perfection/vaultcap-v3 | 0 | 1 | 0 | 0 | 0 | — | — | — | 5.2.2+stepR | — |
| PulseCap | — | main | 0 | 1 | 0 | 0 | 0 | — | — | — | 6.44.0 | — |
| PrismCap | A–E | perfection/prismcap-v3 | 0 | 2 | 0 | 0 | 0 | — | — | — | 4.5.3+stepR | — |
| SteadyCap | A–E | perfection/steadycap-v3 | 0 | 2 | 0 | 0 | 0 | — | — | — | stepR | — |
| LedgerCap | A–E | perfection/ledgercap-v3 | 0 | 3 | 0 | 0 | 0 | — | — | — | stepR | — |
| DeePonyCap | A–E | perfection/deeponycap-v3 | 0 | 2 | 0 | 0 | 0 | — | — | — | stepR | — |
| ScentCap | — | main | 0 | 3 | 0 | 0 | 0 | — | — | — | 2.1.4 | — |
| SoulCap | — | main | 0 | 0 | 0 | 0 | 0 | — | — | — | 8.3.2 | — |
| TravelCap | F→G | perfection/travelcap-v3 | 0✅ | 0✅ | 0 | 0 | seeded | in progress | — | H | 1.0.2 | verifying |
| AuraCap | — | main | 0 | 2 | 0 | 0 | 0 | — | — | — | stepR | — |
| MasteryCap | — | main | 0 | 0 | 0 | 0 | 0 | — | — | — | 51.9.2 | — |
| IdeaCap | F | perfection/ideacap-v3 | 0 | 0✅ | 0 | 0 | seeded | — | — | — | 2.0.1 | verifying |
| CarCap | — | main | 0 | 0 | 0 | 0 | 0 | — | — | — | 1.0.1 | — |
| CookCap | F | perfection/cookcap-v3 | 0✅ | 0✅ | 0 | 0 | seeded | prep | — | — | stepR | verifying |
| DeeFoodie | — | main | 1 | 0 | 0 | 0 | 0 | — | — | — | 1.0.0+3 | — |
| Hub | A+ | perfection/hub-minisites-v3 | 0 | 0 | 0 | 0 | — | — | gen+expand | — | 1.1.0/1.4.0 | — |
| Tooling | A | perfection/tooling-v3 | G16–19 | — | — | — | — | gallery-v3 ready | — | — | — | — |
| Gallery | A done | perfection/gallery-v3 | viewer | — | — | — | — | 00a6928 | — | — | — | — |


## Hand-off — Tooling Engineer (G16–G19)
- **When:** 2026-10-14T11:06:35Z
- **Repo:** capricorn-tooling
- **Branch:** `perfection/tooling-v3` @ `224b76a`
- **Items closed:** G16 device-qa · G17 gallery v3 · G18 docs truth · G19 mini-site LH wired into `shared/testing/tier1.mjs` (`npm run tier1`)
- **Evidence:** `npm test -- shared/testing/__tests__/tier1*.mjs` → 20/20 pass; device-qa CarCap smoke with `PW_CORE=…/MasteryCap/node_modules/playwright-core` → 7/7 clean, summary JSON shape for G16
- **How invoked:** app `npm run tier1` → `node ../capricorn-tooling/shared/testing/tier1.mjs` runs G1–G15 then G16–G19
- **G17:** calls `shared/gallery/check-completeness.mjs --app-dir=… --json` when present (Gallery Engineer); else local fallback in `shared/testing/v3/gallery-v3-gate.mjs`
- **Open:** none for tooling Wave A; release lock after push
- **Next:** Conductor merge/review; Builders produce `qa/perfection/device/device-qa.json` + inventory/gallery for G16/G17

## Done (newest first)
- **Hub-Engineer Wave A expand:** regenerated all 15 `/apps/<slug>/` + `apps/index.html`; legacy `<slug>.html` → mini-sites (N-1); DeeFoodie private-beta (no install); `?app=<slug>` confirmed (Playwright: `vaultcap` window after boot with `?nolock=1&app=vaultcap&view=desktop`). lab tip `e334cf5`, hub tip `979020e`. PrismCap/SoulCap hub copies retained (Wave D). — 2026-10-14T11:12:00Z
- Tooling Engineer: G16–G19 gates on `perfection/tooling-v3` (see hand-off).
- Phase 0 finish/* → main pushed: Travel, Cook, Idea, Vault, Steady, Ledger, Aura, Prism, DeePony; Car+Soul on main.
- Baseline device-qa: 71/98 hard-clean; JSON+SUMMARY in `docs/perfection-2026-10/baseline/` (N-2 browsers path).
- Gallery Engineer: shared viewer on `perfection/gallery-v3` (`90d5212`/`00a6928`).
- Hub Engineer: `build-minisites.mjs` + `?app=` on `perfection/hub-minisites-v3` (`2409229`).
- Wave A Builders claim FIXED: Travel TRV-V3-1..4/6; Cook CK-V3-1..3; Idea IDA-V3-1/2 — Auditor verifying.
- N-1 mini-sites, N-2 Playwright browsers path in DECISIONS §6.

## In flight
- PrismCap → Builder-PrismCap lock; branch `perfection/prismcap-v3` from `fd25c5d`; baseline + PRS-V3-1/2.
- Auditor: verify Travel/Cook/Idea branches.
- Wave B Builders: VaultCap, SteadyCap, LedgerCap, PrismCap, DeePonyCap.
- Tooling: G16–G19 on `perfection/tooling-v3` (hand-off above); awaiting Conductor merge.
- Hub: generate all mini-sites + redirects.
- TravelCap: gallery capture + docs while awaiting VERIFIED.

## Blocked-external
_(none yet)_

## Decisions taken (N-…)
- N-1 · Mini-sites → `/apps/<slug>/` … — v3, 2026-10-14
- N-2 · PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright … — v3, 2026-10-14

## Phase 0 merge SHAs (main)
TravelCap 0bc9718 · CookCap c43a70c · IdeaCap 3bc61f6 · VaultCap ec839d8 · SteadyCap b9d31a4 · LedgerCap ce92c06 · AuraCap cca19e4 · PrismCap fd25c5d · DeePonyCap 716beb7 · CarCap 8cd0c11 · SoulCap 32c6961
