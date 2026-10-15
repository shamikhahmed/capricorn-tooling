# Cursor — Next Loop (after Perfection v3 verify, 2026-10-15)

Work autonomously with multiple agents. No questions. Stop only when every item below is done, verified live, committed and pushed, and CI is green in every touched repo. Obey `docs/audit-2026-09-14/DECISIONS.md` (G-1…G-10, D-*, P-*, §4.1 copy, §4.2 disclaimers): no "OS" for apps (G-3), no "zero servers" where a network call exists, no Google Fonts / third-party requests (G-9), everything free (G-2).

Tooling: `PW_CORE=/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core` (1.63; installed browsers chromium-1243, webkit-2359). Hub source of truth is **capricorn-lab** (D-13): change lab, then `PW_CORE=… node scripts/deploy-hub.mjs`, then in `shamikhahmed.github.io`: `npm test`, `node scripts/check-links.mjs`, `bash scripts/stage-site.sh`, commit, push, watch Hub CI. Never hand-edit hub `apps/` or `assets/` — they are generated.

## Already done (verified live 2026-10-15 — do not redo)
- Mini-sites v4 for 15 Caps at `/apps/<slug>/` (generator `capricorn-lab/scripts/build-minisites.mjs`, assets `scripts/minisite/`). Galleries per device × scheme, lightbox, privacy, FAQ, install, latest release, OG cards. Single-scheme: PrismCap dark-only, CookCap light-only (`schemes` + `schemeNote` in manifest).
- Family icons live. Lock screen 12px labels + iPhone SE layout. Accent contrast WCAG AA (axe 0 on 64 page-views).
- Galleries: Vault 34, Ledger 23, Aura 15, Pulse 14, Prism 11, Steady 6, DeePony 7, CookCap v3 manifest. Honest-copy sweep in 9 repos.
- Live numbers: hub Lighthouse 100×4 mobile+desktop; mini-sites perf 97–100, rest 100; hub matrix 140/140, flows 39/39; fleet `capricorn-tooling/scripts/device-qa.mjs` 98/98.

## Do now (in this order)

### 1 · VaultCap gallery without the install banner
- `VaultCap/scripts/live-gallery-v3.mjs` now sets `vo_install_dismissed` and `vos_integrity_toast` before load. A recapture was started 2026-10-15 (log in Claude scratchpad); if `docs/screenshots/gallery/` is mid-change or incomplete, rerun `node scripts/live-gallery-v3.mjs` from VaultCap (≈204 shots).
- Verify no frame shows "Install VaultCap" or "Vault scan" toast (contact sheets per theme/device). Remove orphan webp files not in the manifest (`git rm`). Commit + push.

### 2 · PulseCap splash (Lighthouse NO_LCP)
- First visit plays a ~4.5 s branded splash before the welcome screen; Lighthouse can't score performance (NO_LCP).
- Fix: returning visitors skip the splash entirely; first visit ≤ 1 s and skippable by tap; respect `prefers-reduced-motion` (no splash). Real content must paint immediately behind it so LCP lands on app content.
- Release as 6.46.0: VERSION.json, package.json, SW cache bump (`sw.js?v=` + cache name), CHANGELOG.md, changelog.html, in-app version, HANDOVER. Run full `npm test` (incl. WebKit). Target Lighthouse mobile perf ≥ 90 on `/PulseCap/`.

### 3 · CookCap dark mode in the Editorial skin
- Today Dark only works in the Modern skin; Editorial (default) stays light paper.
- Design a real "night paper" Editorial dark: warm near-black paper (~#17140f), cream ink (~#efe6d6), muted gold rules, photos unchanged, WCAG AA everywhere (axe 0). Cover every screen: cover, title, contents, chapter, recipe, cook mode, search, shopping, meal planner, pantry, calendar, profiles, appearance, page navigator, sheets/dialogs.
- Appearance → Dark must switch Editorial too; Auto follows system.
- Release 3.7.0 with full version discipline + tests. Then capture dark gallery (iPhone/iPad/Mac, same screen ids as light), set manifest `schemes: ['light','dark']`, remove `schemeNote`.

### 4 · Rebuild hub after 1–3
- In lab: `node scripts/sync-screenshots.mjs` (adds `cookcap-dark.png`; then add `screenshotDark` for cookcap in `js/products.js`), `npm test`, deploy-hub, hub gates, push. Re-run mini-site QA, axe, Lighthouse, device-qa on production.

### 5 · Remaining fleet debt
- Tier 1 kill-list items still open in `FINAL-REPORT-v3.md` — close each with evidence.
- VoiceOver pass (iOS Safari + macOS) on every Cap's main flows; fix labels/order/focus traps.
- TestFlight readiness for ScentCap, VaultCap, DeeFoodie per D-01 (store pack, privacy manifest, Xcode 26 build). Do not submit.
- LedgerCap Commodities screen renders empty without the price Worker: add an honest empty/offline state, then add it back to the gallery.
- Re-scan all repos' README/HANDOVER/FEATURES/pitch/presentation/landing for stale versions and retired claims after every release.

## Small slips to clean up
- Hub commit `0986094` message says "1,000+ gallery frames"; actual is 951. Corrected by a follow-up empty commit; do not force-push.
- Nothing to do in `/tmp`; the owner will clean a stray copy of lab `dist/` there themselves.

## Report
Write `docs/perfection-2026-10/FINAL-REPORT-v4.md`: what changed per repo (commit SHAs), live numbers (Lighthouse, axe, matrix, flows, device-qa), anything not done and why.
