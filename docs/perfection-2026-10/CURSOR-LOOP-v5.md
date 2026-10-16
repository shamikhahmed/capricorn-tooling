# Cursor — Perfection Loop v5 (after independent verify, 2026-10-16)

Work autonomously with multiple agents. No questions. Stop only when every item below is done, verified **live**, committed, pushed, and **every GitHub Actions workflow on `main` is green in every repo you touched**. Then write `docs/perfection-2026-10/FINAL-REPORT-v5.md`.

Binding: `docs/audit-2026-09-14/DECISIONS.md` (G-1…G-10, D-*, P-*, §4.1 copy, §4.2 disclaimers). No "OS" for apps (G-3). No "zero servers" where a network call exists. No third-party requests or Google Fonts (G-9). Everything free (G-2).

Tooling: `PW_CORE=/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core`. Hub source of truth is **capricorn-lab** (D-13): change lab → `node scripts/deploy-hub.mjs` → in `shamikhahmed.github.io`: `npm test`, `node scripts/check-links.mjs`, `bash scripts/stage-site.sh`, commit, push, watch Hub CI. Never hand-edit hub `apps/` or `assets/`. When an app version changes, bump it in **both** `capricorn-lab/js/products.js` and hub `js/products-data.js` (hub `npm test` enforces this).

## New hard rules (learned from v4)

1. **Never special-case measurement.** No `navigator.webdriver`, user-agent, headless or Lighthouse checks that change what the app does. v4 shipped a webdriver splash bypass in PulseCap to get "mobile 91"; it was removed in 6.46.1. Measure with `capricorn-tooling/scripts/lighthouse-honest.mjs` (fresh Chrome per run, automation flag hidden).
2. **CI is part of "done".** Before claiming an item, run `gh run list -R shamikhahmed/<Repo> --branch main --limit 5` and confirm every workflow passed on your last commit. v4 reported success while VaultCap CI was red (so Deploy Pages was skipped for 4 commits) and LedgerCap CI had been red since 2026-10-14.
3. **A guard test is a decision, not an obstacle.** If a test forbids something (e.g. VaultCap's `tests/satellite-pages.spec.js` forbids blue on its decks), follow it or record a decision change in DECISIONS.md first. Do not "align" the app to the hub catalog when the app's own brand differs. The hub follows the apps.
4. **Removing `!important` means proving the cascade still wins.** After any `!important` cleanup run:
   `node scripts/audit-important-loss.mjs <Repo> <revBeforeCleanup> <liveUrl> [navJS…]`
   Exit code 1 means a removed declaration no longer wins on a visible element. Fix it with specificity, not by putting `!important` back. In v4 this cleanup silently removed LedgerCap's desktop sidebar (fixed in 3.58.2).

## Already verified or fixed on 2026-10-16 (do not redo)

- **VaultCap** `8742fe3`: pitch deck back to monochrome (`--accent:#ffffff`); `ios/App/App/public/index.html` untracked (already gitignored). CI and Deploy Pages green again. `audit-design-tokens.mjs` records the VaultCap deck exception.
- **PulseCap 6.46.1** `5f153f8`: first screen paints without its `.screen` entry fade (`html.pc-booting`), so Chrome records LCP. Webdriver bypass removed. Honest live numbers: mobile 89 (LCP 2.1 s), desktop FCP 0.5 s / LCP 0.6 s.
- **LedgerCap 3.58.2** `7f20005`: desktop sidebar restored at ≥900 px, tab bar hidden. CI green for the first time since 2026-09-16.
- Hub `4fa276c`: catalog Pulse 6.46.1 / Ledger 3.58.2; OG cards regenerated.
- Verified good: VaultCap gallery 204 frames without the install banner; CookCap Editorial night paper (system Dark switches it); LedgerCap Commodities empty state; DeeFoodie web still gated (`main.dart.js` 404).
- Live gates: fleet device-qa 98/98 (hard 0, tap<32 0, text<11 0); mini-sites axe 0 on 64 page-views; mini-site QA 96 page-views clean.

## Do now (in order)

### 1 · PulseCap brand: hub and decks still show the pre-Ember cyan
App icon, `theme-color` and `css/tokens.css` are Ember orange (`--accent:#FF7A1A`, press `#E86A0E`). The hub catalog (`accent:'#00f2ff'`, `accent2:'#0e7bff'`), hub family icon `capricorn-lab/assets/icons/pulsecap.svg` (+ PNG sizes), mini-site palette and `PulseCap/pitch.html` / `presentation.html` are still cyan.
- Recolour the hub icon in the family spec: keep the 512 tile, `rx112`, dark diagonal gradient, gold flick `M380 96 L420 108 L408 148` + `circle(408,118,r6)` `#c9a227`. Glyph gradient becomes orange: `#FFB066` → `#FF7A1A` → `#E86A0E`, `gradientUnits="userSpaceOnUse"`. Tile gradient becomes warm near-black (`#2a1206` → `#0b0503`). Regenerate the PNGs.
- Set catalog `accent:'#ff7a1a'`, `accent2:'#e86a0e'` in both catalogs, recolour both decks (all cyan, not just `--accent`), and run `npm run audit:tokens` in tooling.
- Redeploy the hub. Check `/apps/pulsecap/` in light and dark (axe 0) and the PulseCap window in Capricorn OS.

### 2 · Accessibility — Lighthouse a11y must be 100, axe 0 serious/critical, light **and** dark
From `lighthouse-honest.mjs` / axe on 2026-10-16:
- **CookCap** (a11y 96 mobile): light-mode primary CTA white on `#c2683c` = 3.93:1 (onboarding "Begin" and every copper button). Also `p.font-serif.text-sm.font-semibold.italic` and `p.text-[0.75rem].tabular-nums`. Darken the copper fill to ≥4.5:1 with white, in the Editorial light skin only. v4 checked dark only.
- **CarCap** (96): `.btn.btn-primary` text contrast (`data-go="garage"`, `data-action="first-add"`).
- **LedgerCap** (95–96): a `<label>` colour-contrast fail.
- **MasteryCap** (94): `.onb-eyebrow` contrast.
- **IdeaCap** (89): `aria-allowed-role` on the "Search ideas" input; `aria-required-children` on the tablist (tabs need `role="tab"`); two text-contrast fails (`r-1bmwzmo`, `r-8y998g` styles); SEO `meta-description` missing on web.
- **AuraCap** (96): the `.cap-skip-link` target `#main` is missing or not focusable on the landing route.
- **TravelCap** (SEO 91): `link-text` — links with non-descriptive text.
Each fix is an app release: VERSION.json, package.json, SW cache bump, CHANGELOG.md / changelog.html, in-app version, README/HANDOVER, tests green.

### 3 · Performance — mobile ≥ 90 on a real first visit (`lighthouse-honest.mjs`), no bypasses
| App | Mobile now | Culprit |
|---|---|---|
| LedgerCap | 40–43 | TBT 1.7 s, main thread 13.9 s, bootup 2.4 s, 866 KB bundle. LCP is the count-up hero `.lc-dash-hero-val` at 5.6 s. Defer non-home modules, don't animate the LCP number from 0, split the bundle. |
| PrismCap | 63–70 | CLS 0.396: `#feat` (`GL.launchFeat`) 0.263 and `aside.home-cab-rail` 0.114 shift after load. Reserve their space. TBT 510 ms. |
| MasteryCap | 78–83 | LCP 3.7 s on `.onb-sub`; render-blocking CSS ~400 ms. |
| TravelCap | 80–83 | LCP 3.6 s on the hero paragraph; unused JS 43 KiB. |
| PulseCap | 89 | 7 render-blocking stylesheets; ~200 KiB unused JS (engines.js, settings.js, progress.js). |
| DeePonyCap | 89 | LCP 2.2 s; check render-blocking. |
| AuraCap | NO_LCP (perf unmeasurable) | Probably the same pattern as PulseCap: first content starts at `opacity:0`. Make the first paint contentful. |
Desktop targets ≥ 90 as well (SteadyCap 91, MasteryCap 90, TravelCap 91 are borderline).

### 4 · LedgerCap Worker errors on every load
`ledgercap-psx-proxy.shamikhahmed.workers.dev`:
- `/news/google?q=…` returns **502** on every call.
- `/timeseries/eod/{HINO,LUCK,PIBTL,PICT}` return **404**.
The console shows errors (Lighthouse best-practices 96). Fix the Worker if it's in `LedgerCap/worker/`; otherwise stop requesting news on first load and treat 404 series as "no history" without a network error. Owner deploys Workers: if a Worker deploy is needed, prepare it and list it under owner actions.

### 5 · `!important` cleanup review (run `audit-important-loss.mjs`, base = last commit before the cleanup)
Live deltas still worth a decision. Fix by specificity if they're regressions; record them as intended if not:
- VaultCap `@media (min-width:700px) body .page.on > .pb { padding-bottom:24px }` → now 68 px on `#dashBody` (desktop).
- PrismCap `.lcard` box-shadow lost; `@media (min-width:1024px) and (hover:hover) and (pointer:fine) #app { max-width:min(520px,100vw) }` → now 560 px; `.sec` letter-spacing.
- SteadyCap `@media (min-width:769px) and (hover:hover) and (pointer:fine) .screen { padding-bottom:24px }` → 0 on onboarding.
- The 11 → 12 px text bumps (LedgerCap `.lc-portfolio-pnl`, PrismCap `.sec`, `#home-greeting`) are intended (12 px minimum). Leave them.
Then add a **layout contract test** to every app that has a desktop layout, like `LedgerCap/tests/viewport.spec.js`: desktop navigation visible and phone tab bar hidden at 1280 px; the reverse at 375 px. This makes the next cascade regression fail CI.

### 6 · Small gallery fix
CookCap dark `cook--plate-view--default` (iPhone + Mac) is byte-identical to `cook--recipe--default`: the capture didn't switch to plate view in dark. Recapture, then check with the md5 dupe check and confirm the mini-site shows Plate view in dark.

### 7 · Re-verify everything, live
- `gh run list` green for every touched repo.
- `lighthouse-honest.mjs` on all 14 apps + hub `/`, `/apps/`, 3 mini-sites.
- axe light + dark on each app's first screen and the mini-sites.
- `scripts/device-qa.mjs` 98/98.
- Hub `qa-matrix.mjs` 140/140 and `qa-flows.mjs` 39/39 against production.
- Docs scan: every `**Version:**` line matches VERSION.json; no retired claims.

## Owner decisions / actions (list them in the report; don't decide)
- **VaultCap brand:** the hub tile and app icon are blue `#5b8dee`, but the app UI and decks are monochrome by decision (gold accent in dark). Pick one.
- **CookCap is `noindex, nofollow`** by design ("intentional private book"), yet it has a public mini-site and sitemap entry. Confirm both.
- Xcode 26 install, native archives and TestFlight upload (ScentCap, VaultCap, DeeFoodie). Physical VoiceOver pass on iPhone and Mac.
- Any Cloudflare Worker deploy from item 4.

## Report
Write `FINAL-REPORT-v5.md`: per repo commits (SHA), honest live numbers before/after (Lighthouse mobile/desktop per app, axe, device-qa, matrix, flows), CI status per repo, and anything not done and why. Put measurements first and claims second.
