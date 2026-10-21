# Cursor — Perfection Loop v5 (final)

Work autonomously with multiple agents. No questions: every design decision you need is made below. Stop only when every item is done, verified **live**, committed, pushed, and **every GitHub Actions workflow on `main` is green in every repo you touched**. Then write `docs/perfection-2026-10/FINAL-REPORT-v5.md`.

Binding: `docs/audit-2026-09-14/DECISIONS.md` (G-1…G-10, D-*, P-*, §4.1 copy, §4.2 disclaimers) **plus the v5 decisions below**. Add the v5 decisions to DECISIONS.md as a dated section first. No "OS" for apps (G-3). No "zero servers" where a network call exists. No third-party requests or Google Fonts (G-9). Everything free (G-2).

Tooling: `PW_CORE=/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core`. The hub's source of truth is **capricorn-lab** (D-13). Change lab, run `node scripts/deploy-hub.mjs`, then in `shamikhahmed.github.io` run `npm test`, `node scripts/check-links.mjs` and `bash scripts/stage-site.sh`, then commit, push and watch Hub CI. Never hand-edit hub `apps/` or `assets/`. When an app version changes, bump it in **both** `capricorn-lab/js/products.js` and hub `js/products-data.js`; hub `npm test` enforces this.

Every app change is a release: VERSION.json, package.json (+ lock), SW cache name + register query, CHANGELOG.md + changelog.html, in-app version string, README/HANDOVER/CLAUDE.md `Version:` lines, the full test suite green, and a git tag.

---

## Hard rules (learned from v4 — breaking any of these means the item is not done)

1. **Never special-case measurement.** No `navigator.webdriver`, user-agent, headless or Lighthouse checks that change app behaviour. Measure with `capricorn-tooling/scripts/lighthouse-honest.mjs`, which uses a fresh Chrome per run with the automation flag hidden. v4's PulseCap "mobile 91" came from a webdriver bypass; it was removed in 6.46.1.
2. **CI is part of "done".** Before claiming anything, run `gh run list -R shamikhahmed/<Repo> --branch main --limit 5` and confirm every workflow passed on your last commit. In v4, VaultCap CI was red (Deploy Pages skipped for 4 commits) and LedgerCap CI had been red since 2026-10-14, and neither was reported.
3. **Guard tests encode decisions.** Follow them, or change the decision in DECISIONS.md first. The hub follows the apps; never repaint an app to match a stale hub colour.
4. **Removing `!important` means proving the cascade still wins.** Run `node scripts/audit-important-loss.mjs <Repo> <revBeforeCleanup> <liveUrl> [navJS…]`. Exit 1 means a removed rule no longer wins on a visible element. Fix it with specificity, never by restoring `!important`. v4's cleanup silently removed LedgerCap's desktop sidebar.
5. **Numbers before claims.** Every "✅" in the report needs a command output or a file path beside it.

---

## v5 design decisions (made — apply them, don't revisit)

**V5-1 · VaultCap is midnight & gold.** The app UI already is: dark `--accent:#D4A017`, light `--accent:#0a1220`. Only the icon, the hub tile and the hub colours are still the old blue `#5b8dee`.
- New icon (family spec): 512 tile, `rx112`. Midnight diagonal gradient `#121a2a` → `#04070d`. Shield glyph with a gold gradient `#F3D27A` → `#D4A017` → `#9A7410` (`gradientUnits="userSpaceOnUse" x1="96" y1="140" x2="416" y2="420"`). Ivory keyhole `#f4f0e8`. Standard gold flick `M380 96 L420 108 L408 148` + `circle(408,118,r6)` `#c9a227`.
- Replace it everywhere: `VaultCap/icon.svg`, `favicon.svg`, every PNG (`apple-touch-icon*`, `icon-1024/512/192`, maskable with a safe zone), the Capacitor iOS app icon set, `capricorn-lab/assets/icons/vaultcap.svg` + PNGs.
- Catalog in both hubs: `accent:'#d4a017'`, `accent2:'#9a7410'`. Decks (`pitch.html`, `presentation.html`, `landing.html`): `--accent:#D4A017` in dark sections, `#0a1220` in light ones; the satellite-pages guard stays (still no blue). README badges become midnight/gold.
- Remove the `vaultcap` entry from `DECK_OVERRIDE` in `scripts/audit-design-tokens.mjs`; the deck and catalog now agree. Release VaultCap 5.3.1.

**V5-2 · PulseCap is Ember orange everywhere.** The app, icon and `theme-color` are already `#FF7A1A` (press `#E86A0E`). The hub catalog (`#00f2ff`/`#0e7bff`), hub icon, mini-site and both decks are still pre-Ember cyan.
- Hub icon in the family spec: warm near-black tile `#2a1206` → `#0b0503`, pulse glyph gradient `#FFB066` → `#FF7A1A` → `#E86A0E` (`userSpaceOnUse`), standard gold flick. Regenerate the PNGs.
- Catalog in both hubs: `accent:'#ff7a1a'`, `accent2:'#e86a0e'`. Recolour `PulseCap/pitch.html` and `presentation.html` completely: every cyan, not just `--accent`.

**V5-3 · Search engines see canonical pages only.** CookCap stays `noindex, nofollow` (a private family book; its public face is `/apps/cookcap/`).
- `sitemap.xml` currently lists 14 legacy `<slug>.html` redirect pages and `/CookCap/`. Remove all 15 and make `build-minisites.mjs` prune them on every build: redirects and noindex URLs never belong in a sitemap.
- Keep `/`, `/support.html`, `/privacy.html`, `/about.html`, `/sovereignty.html`, `/investor.html`, `/pitch.html`, every indexable app URL, `/apps/` and `/apps/<slug>/`.

**V5-4 · Restore every designed value lost in the `!important` cleanup, except the 12 px text minimum.** Use specificity for each:
- VaultCap `@media (min-width:700px) body .page.on > .pb { padding-bottom:24px }` (now 68 px on `#dashBody`).
- PrismCap `.lcard { box-shadow: 0 10px 24px rgba(16,7,38,.45), inset 0 1px 0 rgba(255,255,255,.12) }`.
- PrismCap `@media (min-width:1024px) and (hover:hover) and (pointer:fine) #app { max-width:min(520px,100vw) }` (now 560 px).
- PrismCap `.sec { letter-spacing:.04em }`.
- SteadyCap `@media (min-width:769px) and (hover:hover) and (pointer:fine) .screen { padding-bottom:24px }` (now 0 on onboarding).
Keep the 11 → 12 px bumps (LedgerCap `.lc-portfolio-pnl`, PrismCap `.sec` / `#home-greeting`).

**V5-5 · Status messages speak to people, not developers.** LedgerCap shows this on every screen: "PSX origin (dps.psx.com.pk) flakes — 100% on EOD snapshot (2026-07-01). Paid feed needed for terminal-grade live."
- Replace it with one calm, dismissible line, shown only on market screens and only while it's true: **"Prices are from the last close on 1 Jul. Live prices aren't available right now."** The date is computed from the snapshot.
- The Home KSE-100 tile that stays on "Loading…" shows the last close with its date, or "Unavailable". Never an endless spinner.
- Sweep every Cap for the same kind of internal wording in banners, toasts and empty states (worker names, "origin", "proxy", "EOD", "seed", stack-ish errors) and rewrite it in plain language.

---

## Already done and verified on 2026-10-16 (don't redo)
- VaultCap `8742fe3`: monochrome deck restored (this becomes gold under V5-1); generated `ios/App/App/public/index.html` untracked. CI and Deploy green.
- PulseCap 6.46.1 `5f153f8`: honest first paint (`html.pc-booting`), webdriver bypass removed. Live mobile 89, desktop LCP 0.6 s.
- LedgerCap 3.58.2 `7f20005`: desktop sidebar back. CI green for the first time since 2026-09-16.
- Hub `4fa276c`: Pulse 6.46.1 / Ledger 3.58.2; OG cards regenerated.
- Verified: VaultCap gallery 204 frames, no install banner; CookCap night paper follows system Dark; Commodities empty state; DeeFoodie web gated (`main.dart.js` 404); fleet device-qa 98/98; mini-sites axe 0 on 64 page-views.

---

## Do now (in order)

### 1 · Apply V5-1 … V5-5
Order: brand (V5-1, V5-2), then sitemap (V5-3), cascade (V5-4), copy (V5-5). After V5-1/V5-2, redeploy the hub. Then check the VaultCap and PulseCap tiles in Capricorn OS (light, dark and every skin), `/apps/vaultcap/` and `/apps/pulsecap/` (axe 0, light and dark), the app icons on an iPhone home-screen-size render (60/120/180 px), and the OG cards.

### 2 · Accessibility: Lighthouse a11y 100 and axe 0 serious/critical, light **and** dark, phone and desktop
- **CookCap** (96): in light Editorial, white on `#c2683c` is 3.93:1 (onboarding "Begin" and every copper button). Darken the light-skin copper fill until white text passes 4.5:1 (about `#a9542c`); dark night paper is already fine. Also fix `p.font-serif.text-sm.font-semibold.italic` and `p.text-[0.75rem].tabular-nums`.
- **CarCap** (96): `.btn.btn-primary` text contrast (`data-go="garage"`, `data-action="first-add"`).
- **LedgerCap** (95–96): a `<label>` contrast fail.
- **MasteryCap** (94): `.onb-eyebrow` contrast.
- **IdeaCap** (89):
  - `aria-allowed-role` on the "Search ideas" input.
  - `aria-required-children` on the tablist (children need `role="tab"` + `aria-selected`).
  - Two text-contrast styles (`r-1bmwzmo`, `r-8y998g`).
  - Web `<meta name="description">` missing.
- **AuraCap** (96): `.cap-skip-link` targets `#main`, which is missing or not focusable on the landing route.
- **TravelCap** (SEO 91): `link-text` — give every link descriptive text.

### 3 · Performance: mobile ≥ 90 and desktop ≥ 90 on a real first visit (`lighthouse-honest.mjs`), no bypasses
| App | Mobile now | Culprit → fix |
|---|---|---|
| LedgerCap | 40–43 | TBT 1.7 s, main thread 13.9 s, 866 KB bundle. LCP is the count-up hero `.lc-dash-hero-val` at 5.6 s. Render the real number first (no count-up from 0 on load), defer non-Home modules, split the bundle. |
| PrismCap | 63–70 | CLS 0.396: `#feat` (0.263) and `aside.home-cab-rail` (0.114) shift after load. Reserve their size before data arrives. TBT 510 ms. |
| MasteryCap | 78–83 | LCP 3.7 s on `.onb-sub`; render-blocking CSS ~400 ms. Inline critical CSS, defer the rest. |
| TravelCap | 80–83 | LCP 3.6 s on the hero paragraph; ~43 KiB unused JS. |
| PulseCap | 89 | 7 render-blocking stylesheets; ~200 KiB unused JS (engines.js, settings.js, progress.js). |
| DeePonyCap | 89 | LCP 2.2 s; render-blocking resources. |
| AuraCap | NO_LCP | First content starts at `opacity:0` (same pattern PulseCap had). Make the first paint contentful. |
Desktop borderline: SteadyCap 91, MasteryCap 90, TravelCap 91. Lift them to ≥ 95.

### 4 · LedgerCap Worker (`LedgerCap/worker/`, `ledgercap-psx-proxy.shamikhahmed.workers.dev`)
- `/news/google?q=…` returns **502** on every call. `/timeseries/eod/{HINO,LUCK,PIBTL,PICT}` return **404**. The EOD snapshot is from **2026-07-01**, more than 3 months old: the refresh (cron) isn't running.
- Fix the Worker. In the app, a missing series means "no history" with no console error, and news isn't requested on first load.
- If `npx wrangler whoami` shows the owner is logged in, deploy the Worker and verify live. Otherwise leave it ready and list it under owner actions.
- Target: zero console errors on load (Lighthouse best-practices 100).

### 5 · Layout contract tests in every app with a desktop layout
Copy the pattern of `LedgerCap/tests/viewport.spec.js`: at 1280 px the desktop navigation is visible and the phone tab bar hidden; at 375 px the reverse; and nothing is clipped behind the tab bar. Wire it into each repo's CI. The next cascade regression must fail CI, not users.

### 6 · CookCap dark gallery
Dark `cook--plate-view--default` (iPhone + Mac) is byte-identical to `cook--recipe--default`: the capture never switched to plate view in dark. Recapture, check with an md5 dupe check, and confirm `/apps/cookcap/` shows Plate view in dark.

### 7 · Re-verify everything, live, and write the report
- `gh run list` green for every touched repo.
- `lighthouse-honest.mjs` on all 14 apps, plus hub `/`, `/apps/` and 3 mini-sites.
- axe light + dark on each app's first screen and every mini-site.
- `scripts/device-qa.mjs` 98/98.
- Hub `qa-matrix.mjs` 140/140 and `qa-flows.mjs` 39/39 against production.
- `audit-important-loss.mjs` exit 0 for each repo you touched.
- `npm run audit:tokens` 8/8 with no overrides.
- Docs scan: every `Version:` line matches VERSION.json; no retired claims.

`FINAL-REPORT-v5.md` must contain:
- Before/after Lighthouse (mobile + desktop) per app.
- axe, device-qa, matrix and flows results.
- CI status per repo, with commit SHAs.
- Screenshots of the new VaultCap and PulseCap icons.
- Anything not done, and why.

---

## Owner-only (list them in the report; don't attempt)
- Install Xcode 26, archive and upload TestFlight builds (ScentCap, VaultCap, DeeFoodie). Do not submit for review.
- Physical VoiceOver pass on an iPhone and a Mac.
- A Cloudflare login, if item 4 needs a deploy and wrangler isn't authenticated.
