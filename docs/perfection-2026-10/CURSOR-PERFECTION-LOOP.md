# CURSOR MASTER PROMPT v3 — Capricorn Perfection Loop

**Program:** Apple-grade finish for every Cap app, every screen, every document, the hub, and a mini-site per app.
**Written:** 2026-10-14 (after the hub 1.4.0 / Capricorn OS 1.1.0 release and a live device scan of all 14 public Caps).
**Supersedes:** nothing — it *extends* `capricorn-tooling/docs/audit-2026-09-14/CURSOR-MASTER-PROMPT.md` (v2) and keeps `DECISIONS.md` **locked and binding**.

---

## 0. How to start (read this first, then the whole file)

You are the **Conductor** of a multi-agent team running inside Cursor. Read this entire file, then:

1. Read, in order: `capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md` (binding), `…/PROGRESS.md`, `…/ARCHITECTURE-FLEET-MAP.md`, `capricorn-tooling/shared/CAP-STANDARD.md`, `shamikhahmed.github.io/docs/DESIGN_IDENTITY.md`, `capricorn-lab/HANDOVER.md`.
2. Create `capricorn-tooling/docs/perfection-2026-10/PROGRESS-v3.md` (template in §16.1) and `…/LOCKS.md` (§4.3). If they already exist, **resume from them** — never restart finished work.
3. Run **Phase 0** (§6) once.
4. Spawn agents per §4 and run the loops in §5 **without asking the owner anything**. The owner has pre-approved every decision in this file. When you would ask a question, apply the recommendation in §2.4 instead, log it, and keep going.
5. **Stop only when §15 (completion criteria) is fully true and the final regression loop (§5.5) is clean.** Not before. Running out of obvious work is not "done" — use the fallback queue (§5.6).

All paths are relative to the fleet root **`/Users/shamikhahmed/Projects/Cap/Cap-Apps`** unless absolute.

---

## 1. Mission — what "perfection" means here

Every Cap must feel like a first-party Apple app on iPhone, iPad and Mac **in its own identity** (each Cap looks different on purpose — `DESIGN_IDENTITY.md`). Concretely, for **every** app, **every** screen, tab, sheet, dialog, form, state, in **light and dark**, on **phone, iPad (portrait + landscape) and desktop**, in **WebKit (Safari) and Chromium**:

- Nothing clips, overflows, overlaps, jitters, flashes, or hides under a notch / home indicator / keyboard.
- Typography is deliberate: one type scale, real hierarchy, comfortable measure, tabular figures for numbers, no text under 11px, no orphaned single words in headings.
- Colour is tokenised, contrast-compliant (WCAG 2.2 AA minimum) and *designed* for dark mode — not inverted.
- Every control is reachable by touch (44×44pt target), pointer (hover + cursor) and keyboard (visible focus, logical order).
- Every flow has a designed empty, loading, error, offline, first-run, demo and "lots of data" state.
- Motion is purposeful (≤ 350 ms, eased, interruptible) and fully respects reduced motion.
- Copy is honest, short, consistent, and uses the approved strings in `DECISIONS.md §4`.
- Performance: Lighthouse ≥ 95 Performance (mobile) and 100 Accessibility / Best Practices / SEO wherever technically possible; CLS < 0.05; no long tasks > 200 ms on interaction.
- The **screen gallery** for every app covers every screen and state in **both colour modes**, on all three device classes, and is a beautiful, scrollable, filterable viewer.
- Every app has a **mini-site** inside the hub (`https://shamikhahmed.github.io/apps/<slug>/`) that is as polished as the app.
- **Every document** in every repo, the hub, the tooling and the Brain vault notes is true, current and runnable.

"Done" is evidence, not belief: screenshots, reports, passing gates (§8, §15).

---

## 2. Non-negotiables

### 2.1 Binding decisions
`DECISIONS.md` is locked. Principles 1–5, G-1…G-10, D-01…D-13, Q-1…Q-5, P-* and the approved copy in §4 override anything else (including this file) except safety. Highlights you will hit constantly:
- **G-2** everything free — no Pro, no paywalls, no dead upgrade UI.
- **G-3** product names always "…Cap" (TravelCap, PrismCap); **never describe an app as an "OS"** (today TravelCap's sidebar still says "Passport OS" — fix).
- **G-4** support = hub `support.html`; never publish personal email/phone.
- **G-8** every release bumps version + SW cache name + SW register query + CHANGELOG together.
- **G-9** no analytics, no third-party runtime scripts, self-hosted fonts only, every network destination listed in the app's privacy page and allowed in CSP.
- **G-10** optional app lock for SoulCap, SteadyCap, TravelCap via `capricorn-tooling/shared/security/local-lock.js`.
- **D-04** DeePonyCap is an independent tracker — no third-party IP. **D-06** PrismCap uses renamed games. **D-09** LedgerCap prices are Worker-only, labelled indicative. **D-10** DeeFoodie is private (TestFlight, token auth).

### 2.2 Safety, honesty, data
- Protect people first: crisis content (SoulCap Help, SteadyCap SOS) is never weakened, hidden or restyled into ambiguity.
- No claims the code can't back up. "0 servers" is false for LedgerCap (price Worker), DeeFoodie (sync) and TravelCap (optional flight lookup, Nominatim hotel search). Say what is measured.
- **Preserve user data**: storage keys, IndexedDB schemas, export formats and URLs never break. Migrations only under G-6.
- Never delete a user-facing feature to make a gate pass.

### 2.3 Never
- Never `git push --force`, never rewrite published history, never delete branches you didn't create in this program (`wip/*` and `finish/*` included — see §6).
- Never commit secrets, `.env`, tokens or API keys. Never add a third-party script, font, CDN or tracker.
- Never mark your own work verified — only the Auditor agent can (§4).
- Never ask the owner a question. Never stop to "check in".

### 2.4 Decision protocol (instead of asking)
1. Find the answer in `DECISIONS.md`, this file, the app's docs, or its git history.
2. Otherwise choose the option that best satisfies, in order: safety → user data → honesty → Apple HIG conventions → the app's own identity → simplest stable implementation.
3. Append to `DECISIONS.md §6` as `N-<n> · <question> → <decision> (<one-line why>) — v3, <date>` and apply it immediately.

### 2.5 Blocked-external (the only legitimate block)
Only items that physically need the owner (Apple Developer account, App Store Connect, TestFlight upload, physical-device VoiceOver sign-off, paid API keys) are `⛔ BLOCKED-EXTERNAL`. Prepare everything up to that line (builds, packs, scripts, exact steps in `qa/perfection/BLOCKED.md`), mark it, and move on. Nothing else is ever blocked.

---

## 3. Workspace map (state as of 2026-10-14)

### 3.1 Repos

| App | Path | Stack | Live URL (entry for QA) | Served from | Live ver | Branch state at handover |
|---|---|---|---|---|---|---|
| **Hub / Capricorn OS** | `capricorn-lab` → `shamikhahmed.github.io` | Vite + vanilla JS; static hub | `/?nolock=1` | hub repo Pages (Actions `_site`) | OS 1.1.0 / hub 1.4.0 | both on `main`, clean |
| VaultCap | `VaultCap` | static JS PWA | `/VaultCap/?demo=1` (PIN `123456`) | own Pages | 5.2.2 | `finish/vaultcap-stepR` +13 unmerged; WIP saved `wip/vaultcap-2026-09` |
| PulseCap | `PulseCap` | static JS PWA | `/PulseCap/?demo=1` | own Pages | 6.44.0 | `main`, clean |
| PrismCap | `PrismCap` | Vite + TS | `/PrismCap/` (`?e2e=1` for harness) | own Pages (hub also has a stale `PrismCap/` copy) | 4.5.3 | `finish/prismcap-stepR` +11 unmerged |
| SteadyCap | `SteadyCap` | static JS PWA | `/SteadyCap/?demo=1` | own Pages | 2.5.4 (2.5.6 on branch, unreleased) | `finish/steadycap-stepR` +15; WIP saved `wip/steadycap-2026-09` |
| LedgerCap | `LedgerCap` | static JS PWA + CF Worker | `/LedgerCap/?demo=1` | own Pages | 3.57.2 | `finish/ledgercap-stepR` +15 |
| DeePonyCap | `DeePonyCap` | static JS PWA | `/DeePonyCap/?demo=1` | own Pages | 3.8.3 | `finish/deeponycap-stepR` +11 |
| ScentCap | `ScentCap` | React + Vite + Capacitor 8 (iOS project exists) | `/ScentCap/?demo=1` | own Pages | 2.1.4 | `main`, clean — **last main CI run failed** |
| SoulCap | `SoulCap` | static JS PWA (`backend/`, `mobile/` = lab code, P-SOUL-2) | `/SoulCap/?demo=1` | own Pages (legacy branch build; hub also has a stale `SoulCap/` copy) | 8.3.2 | `finish/soulcap-stepR-v832` merged; switch to `main` |
| TravelCap | `TravelCap` | Next.js static export | `/TravelCap/trips` | **hub repo** `TravelCap/` (no own Pages) | 1.0.2 | `finish/travelcap-stepR` +12 |
| AuraCap | `AuraCap` | React + Vite + TS | `/AuraCap/?demo=1` | own Pages | 5.4.2 | `finish/auracap-stepR` +7; WIP saved `wip/auracap-2026-09` |
| MasteryCap | `MasteryCap` | static JS PWA | `/MasteryCap/` (demo via Settings → Enter demo mode) | own Pages | 51.9.2 | `main`, clean |
| IdeaCap | `IdeaCap` | Expo (RN web export) | `/IdeaCap/?demo=1` | **hub repo** `IdeaCap/` | 2.0.1 | `finish/ideacap-r3` +1 (C-36 chip-rail fix); **last main CI failed** |
| CarCap | `CarCap` | static JS PWA | `/CarCap/?demo=1&tab=today` | **hub repo** `CarCap/` | 1.0.1 | branch merged; switch to `main` |
| CookCap | `CookCap` | Next.js static export | `/CookCap/?demo=1` | own Pages | 3.5.1 (no live `VERSION.json`) | `finish/cookcap-stepR` +14 |
| DeeFoodie | `DeeFoodieApp` | Flutter (iOS + web) | — (private beta) | **publicly reachable** at `/DeeFoodieApp/` via legacy gh-pages | 1.0.0+3 | `main`, clean |

Base URL for every "Live URL": `https://shamikhahmed.github.io`. Shared tooling: `capricorn-tooling` (`shared/`, `scripts/`, `cap-agents/`). Brain vault (notes only, never code): `~/Capricorn-Brain/01 Projects/<Project>.md`.

### 3.2 Tooling you must use (all exist today)
- **Device QA (new):** `capricorn-tooling/scripts/device-qa.mjs` — every Cap × iPhone SE / iPhone / iPad portrait / iPad landscape / MacBook (WebKit) + MacBook / Android (Chromium): overflow, off-screen content, tap targets < 32px, text < 11px, console + page errors, screenshots. `--url=<App>=<localURL>` to test a local build.
- **Hub QA:** `capricorn-lab/scripts/qa-matrix.mjs` (10 themes × 7 devices × 2 engines) and `qa-flows.mjs` (windows, Run here, Appearance, Spotlight, sheets, lock screens); `npm test` smoke gate.
- **Tier 1 runner:** `capricorn-tooling/shared/testing/tier1.mjs` (hardened; per-app `npm run tier1` = `node ../capricorn-tooling/shared/testing/tier1.mjs`; wire that script into any app that lacks it) → `TIER1.json`. Gates G1…G15 as defined in v2 §14.1.
- **Audits (run from `capricorn-tooling`):** `npm run audit:tokens` (design-token kill-list: raw hex, sub-11px), `npm run contrast:check` (WCAG contrast of each app's **token pairs** — per-screen contrast comes from axe's `color-contrast` rule in both themes), `npm run audit:versions -- --strict` (VERSION.json / package.json / CLAUDE.md / APP_VERSION / SW cache alignment), `npm run audit:truth` (marketing claims vs code; run from the fleet root), `npm run audit:secrets`, architecture analyzer (`npm run architecture:check|regen|queue`).
- **Lighthouse:** `_workspace/run-lighthouse-puppeteer.mjs` (puppeteer-core + Lighthouse in `_workspace/node_modules`).
- **Playwright builds:** installed browsers are chromium-1243 / webkit-2359. They match `playwright-core` 1.63 at `MasteryCap/node_modules/playwright-core` (also CookCap / IdeaCap / TravelCap). Run any script with `PW_CORE=/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core`. If an app's own `@playwright/test` expects other builds, align that app's devDependency to 1.63 (allowed under G-5 as a version alignment) rather than downloading new browsers.
- Cursor's built-in browser may report `document.hidden=true` (backgrounded) → animations freeze in screenshots. **Never judge motion or rendering from a backgrounded browser; use Playwright.**

### 3.3 Live device scan — 2026-10-14 (your first tickets; IDs in §13)
98 runs across 14 Caps: 78 clean of hard failures. Hard failures: **TravelCap** page error on `/trips` (`Cannot read properties of undefined (reading 'waiting')` — SW registration guard) on every device; **IdeaCap** 17px horizontal overflow on iPhone/iPad/Mac (WebKit) from a react-native-web container (`div.css-g5y9jx`) — likely fixed by unmerged C-36; **CookCap** React hydration error #418 on every device. Soft: PrismCap ~200 text nodes < 11px and small tap targets ("Change", "+ Add", favourite stars); DeePonyCap 36 tiny glyphs; LedgerCap tab labels < 11px, 8 small targets ("Txs", "Dismiss", KSE-100 chip, "Refresh snapshot") and a 404; SteadyCap check-in mood chips < 11px; ScentCap brand captions < 11px; AuraCap 5 small targets; PulseCap + DeePonyCap call `navigator.vibrate` before user activation; VaultCap "Skip to content" target < 32px. AuraCap + CookCap publish no `VERSION.json`. Hub screenshots are stale (PulseCap shot shows v4.5.1 / "300+ exercises"; app is 6.44.0 with 1,872 exercises; CookCap uses a TravelCap placeholder).

---

## 4. Agent topology (Cursor multi-agent)

Run agents in parallel. **One writer per repo at a time** — this is what keeps parallel work safe.

### 4.1 Roles

| Agent | Owns (write access) | Responsibilities |
|---|---|---|
| **Conductor** (you) | `capricorn-tooling/docs/perfection-2026-10/*` | Plans waves, assigns apps, maintains `PROGRESS-v3.md` + `LOCKS.md`, resolves decisions (§2.4), merges reports, runs the final regression loop. Never edits app code. |
| **App Builder ×N** (one per app, up to 5 concurrently) | exactly one app repo | Runs the per-app loop (§5.2) end to end: inventory → audit → fix → gallery capture → docs → release. Requests verification from the Auditor. |
| **Auditor** (independent, ≥1 always running) | `<repo>/qa/perfection/AUDIT-*.md` only | Re-runs every gate on the Builder's commit **from a clean checkout**, reviews screenshots by eye against §7, files findings back. Only the Auditor sets an item to ✅ VERIFIED. Must not have written the code it verifies. |
| **Gallery Engineer** | `capricorn-tooling/shared/gallery/*` | Builds the shared gallery viewer + capture helpers (§9) first, then supports Builders. |
| **Hub & Mini-site Engineer** | `capricorn-lab`, `shamikhahmed.github.io` | Mini-site generator + pages (§10), Capricorn OS integration, hub screenshots, hub docs, hub-hosted Cap copies (CarCap, IdeaCap, TravelCap). |
| **Docs Editor** | docs in any repo **only when that repo's lock is free or with the Builder's hand-off** | Applies §11 to every document; fleet docs; Brain vault notes. |
| **Tooling Engineer** | `capricorn-tooling/scripts`, `shared/` (except gallery) | Fixes/extends QA scripts, tier1 gates for v3 (§8.3), shared modules (local-lock, tokens). |

Suggested waves (adjust by load; always keep the Auditor busy):
- **Wave A (parallel):** Gallery Engineer (viewer), Tooling Engineer (v3 gates), Hub Engineer (mini-site generator skeleton), Builders for the three hard-failure apps: TravelCap, IdeaCap, CookCap.
- **Wave B:** VaultCap, LedgerCap, PrismCap, SteadyCap, DeePonyCap.
- **Wave C:** PulseCap, ScentCap, SoulCap, AuraCap, MasteryCap.
- **Wave D:** CarCap, DeeFoodie, hub-hosted copies, mini-sites for all, Capricorn OS gallery integration, docs sweep.
- **Wave Z:** final regression loop (§5.5).

### 4.2 Hand-off contract (every agent → Conductor)
Each finished unit posts to `PROGRESS-v3.md`: repo, commit SHA, items closed (IDs), evidence paths, open findings, next action. A Builder hands an app to the Auditor with: `qa/perfection/STATE.md` (§16.2) + the exact commands to reproduce.

### 4.3 Locks
`LOCKS.md` lists `repo → agent → since → purpose`. Take a lock before writing; release it after push. Stale lock (> 2 h without a commit) → Conductor reassigns. Shared files (`DECISIONS.md`, `CAP-STANDARD.md`) are edited only by the Conductor.

### 4.4 Git hygiene per agent
Work on `perfection/<app>-v3` branches cut from the up-to-date `main` (after Phase 0 merges). Commit small and often (`type(scope): message`), with the co-author trailer your environment requires. Release = merge to `main` with `--no-ff`, tag, push (§12). Never commit generated junk (`test-results/`, `playwright-report/`, `node_modules/`, `.DS_Store`).

---

## 5. The loops

### 5.1 Outer fleet loop (Conductor)
```
while not all(§15):
    pick next app/unit by: hard failures → safety-critical apps (SoulCap, SteadyCap, VaultCap) → most users (PulseCap, VaultCap, LedgerCap) → rest
    assign to a free Builder (respect locks), keep ≤5 Builders + ≥1 Auditor running
    collect hand-offs → update PROGRESS-v3 → requeue anything the Auditor rejected
after all apps verified → §5.5 final regression loop → if anything regressed → loop again
```

### 5.2 Per-app loop (Builder) — phases A–J, each with an exit criterion
- **A · Sync** — lock repo; fetch; branch `perfection/<app>-v3` from `main`; `npm ci` (or stack equivalent); read the app's HANDOVER, FEATURES, CHANGELOG, privacy page, last TIER1.json and APP-REPORT. *Exit:* app builds and runs locally; baseline device-qa run saved to `qa/perfection/baseline/`.
- **B · Inventory** — produce `qa/perfection/INVENTORY.md`: every route/screen/tab/sub-tab/sheet/modal/drawer/dialog/toast, every form (with each field, its type, validation and keyboard), every state (§7.9), every setting, every external link, every network destination. Seed it from §13 (your app's section) **and** from code (router config, nav components, `data-tab`/`data-screen` attributes, the architecture analyzer: `capricorn-tooling/qa/architecture/pilot-<app>/architecture-data.json`). *Exit:* no route in code is missing from the inventory; the Auditor spot-checks 10 random entries.
- **C · Coverage matrix** — `qa/perfection/MATRIX.md`: rows = inventory entries × states; columns = {light, dark} × {iPhone SE 375, iPhone 390, iPad portrait 820, iPad landscape 1180, MacBook 1440, wide 1920} × {WebKit, Chromium}. Every cell must end ✅ with an evidence screenshot path, or N/A with a reason.
- **D · Audit** — run every tool in §8 plus a manual pass of §7 per screen. File each defect as `<APP>-V3-<n>` in `qa/perfection/ITEMS.md` (§16.3) with severity: **P0** crash, data loss, safety, privacy, broken flow · **P1** visible layout/contrast/overflow/clip, broken state, a11y serious · **P2** polish (rhythm, alignment, motion, copy) · **P3** delight.
- **E · Fix** — P0 → P1 → P2 → P3. Each fix: smallest change in the app's own design system (tokens, components), test added where behaviour changed, screenshot before/after. Don't fork styles per screen.
- **F · Verify** — rerun §8 on the branch; then hand to the Auditor. Auditor rejections go back to E. *Exit:* Auditor marks every P0/P1/P2 ✅ VERIFIED; P3 ✅ or logged as L with reason.
- **G · Gallery** — capture the full v3 gallery (§9) in both colour modes on all device classes; build the viewer; hand to Hub Engineer for mini-site ingestion.
- **H · Docs** — every document in the repo per §11; app privacy page regenerated from the real network log (§4.4 template in DECISIONS).
- **I · Release** — §12 (version per G-8, SW cache, CHANGELOG, tag, push, CI green, live verification with device-qa against the live URL).
- **J · Report** — `qa/perfection/APP-REPORT-v3.md` (§16.4); Brain vault note dated decision; release lock; hand-off to Conductor.

### 5.3 Inner item loop (every item)
`reproduce (screenshot + exact steps) → root cause → fix in the right layer → unit/e2e test if behaviour → re-run the specific check on all devices × themes it touches → before/after evidence → commit → mark ✅ FIXED (Builder) → ✅ VERIFIED (Auditor)`.

### 5.4 Continuity
State lives in files, never in chat memory: `PROGRESS-v3.md`, `LOCKS.md`, each repo's `qa/perfection/{STATE,INVENTORY,MATRIX,ITEMS,APP-REPORT-v3}.md`. Any agent restarted mid-task reads these and resumes.

### 5.5 Final regression loop (Wave Z)
From clean clones of every `main`: run device-qa on all live URLs, hub qa-matrix + qa-flows, tier1 for every app, Lighthouse for every app + every mini-site, link check across the hub, gallery completeness check (§9.6), docs truth audit (§11.4). Any failure → reopen that app at phase D. Repeat until one full pass is clean. Only then write `FINAL-REPORT-v3.md`.

### 5.6 Fallback queue (never idle)
If blocked or waiting: (1) Auditor backlog, (2) another app's P2/P3 items, (3) gallery gaps, (4) docs truth gaps, (5) mini-site polish, (6) test coverage for untested flows, (7) Lighthouse/perf headroom, (8) reduced-motion / high-contrast / 200% zoom passes, (9) Urdu/RTL passes, (10) dead code and unused assets removal (behaviour-neutral, tested).

### 5.7 Forbidden shortcuts
Hiding elements to pass overflow checks; lowering thresholds; `!important` sprees instead of fixing tokens; screenshots from a dev server that differs from the production build; marking cells N/A to save time; disabling tests; stubbing data to make a screen look full in production; copying another Cap's look (identities stay distinct); weakening crisis/safety copy; deleting features.

---

## 6. Phase 0 — fleet pre-flight (Conductor + Tooling, once)

1. **Inventory branches** (`git branch -a`, ahead/behind `origin/main`) for all 16 repos; record in PROGRESS-v3.
2. **Merge the `finish/*` branches (owner-approved 2026-10-14)** — for each of VaultCap, PrismCap, SteadyCap, LedgerCap, DeePonyCap, TravelCap, AuraCap, IdeaCap, CookCap: checkout `main`, `git merge --no-ff finish/<…>`, resolve conflicts preserving both sides' intent, build, run that app's `verify`/e2e + device-qa against a local production build, then push `main`. If a merged branch makes something worse, fix forward on the same app's perfection branch — don't revert the a11y/contrast fixes. CarCap and SoulCap: their finish branches are already in `main`; just switch to `main`.
3. **`wip/*` branches** (`wip/auracap-2026-09`, `wip/steadycap-2026-09`, `wip/vaultcap-2026-09`) are untested snapshots of uncommitted work found on 2026-10-14. During that app's phase B, diff each against `main`, cherry-pick only hunks that are clear improvements and pass every gate (SteadyCap's includes a `demo-seed.js` and a 2.5.6 bump — reconcile with G-8). Never delete these branches.
4. **CI health:** ScentCap and IdeaCap `main` CI are red — fix first in their app loop (phase A).
5. **Toolchain:** confirm `PW_CORE` path works for device-qa, qa-matrix, tier1; align app Playwright versions to 1.63 where needed.
6. **Baseline:** run `node capricorn-tooling/scripts/device-qa.mjs capricorn-tooling/docs/perfection-2026-10/baseline` with `PW_CORE` set; commit the JSON (not the PNGs) as the starting point.

---

## 7. The Apple-grade rubric (apply to every screen; thresholds are hard)

### 7.1 Coverage
Every inventory entry × every state × {light, dark} × {375, 390, 820, 1180, 1440, 1920} × {WebKit, Chromium}. Plus: 200% browser zoom (desktop), iOS "Larger Text" equivalent (root font-size 125%), landscape phone (844×390), iPad split-view widths (507 and 694 px), and Stage-Manager-like 1024×768.

### 7.2 Typography
- One type scale per app in tokens (e.g. 11 / 12 / 13 / 15 / 17 / 20 / 24 / 28 / 34 / 40) — no ad-hoc sizes in components (`audit-design-tokens` kill-list must be 0).
- **No text < 11px** anywhere (device-qa `text<11px` = 0). Phone body copy 15–17px; secondary 13px; captions ≥ 12px; tab-bar labels ≥ 11px (iOS uses 10pt only with SF — we use 11px minimum).
- Line height: body 1.4–1.55, headings 1.1–1.25; measure 45–75 characters on desktop (`max-width: 68ch` for reading surfaces).
- `font-variant-numeric: tabular-nums` for every changing number (money, timers, stats, tables); proper minus sign (−) and thin spaces where the app's locale needs them; `Intl.NumberFormat` for currency and counts (PKR, GBP, etc.).
- Headings `text-wrap: balance`; paragraphs `text-wrap: pretty`; no single-word last lines in titles at any width.
- Truncation uses `text-overflow: ellipsis` on a single line or `line-clamp` with a full-text affordance — never hard clipping.
- Weights: max 3 weights per app; no faux bold; self-hosted fonts with `font-display: swap` and `size-adjust` fallbacks so there is no layout shift (G-9).
- Emoji used as icons must be ≥ 16px and have text labels (DeePonyCap, PrismCap).

### 7.3 Colour, light and dark
- Every colour comes from tokens; light and dark are **both designed** (dark uses elevated surface tints, not pure #000 slabs unless that's the identity, e.g. PulseCap).
- Contrast: text ≥ 4.5:1 (≥ 3:1 for ≥ 24px or 19px bold), UI components and focus indicators ≥ 3:1, disabled states still legible. axe `color-contrast` must pass on every INVENTORY screen in both modes, and `npm run contrast:check` must pass for the app's token pairs.
- System-following by default (`prefers-color-scheme`), with an in-app override where the app already has one; `<meta name="theme-color">` for **both** schemes (`media="(prefers-color-scheme: dark)"`), status-bar style correct in standalone PWA.
- Accent colour usage limited to interactive and key data; semantic colours (success/warn/error/info) consistent across the app and accessible in both modes.
- Images, charts, maps and illustrations are legible in both modes (provide dark variants or appropriate backgrounds).
- `forced-colors` / `prefers-contrast: more` must not break layouts.

### 7.4 Layout, spacing, safe areas
- 4/8-pt spacing grid via tokens; consistent card padding; aligned baselines; no 1–3px misalignments between siblings.
- `viewport-fit=cover` + `env(safe-area-inset-*)` on every fixed header, tab bar, FAB, sheet and toast. Nothing under the notch or home indicator; nothing hidden by the on-screen keyboard (use `visualViewport` / `interactive-widget=resizes-content` where needed).
- Responsive structure, not a stretched phone: phone = tab bar; iPad portrait = tab bar or compact sidebar; iPad landscape + desktop ≥ 900px = sidebar / split view with readable max widths. Every app must look intentional at 1440 and 1920.
- Zero horizontal overflow (`scrollWidth ≤ innerWidth`) and zero unintended off-screen content at every width ≥ 320.
- Horizontal scrollers have snap, momentum, visible affordance (fade or peek), and keyboard access.

### 7.5 Input: touch, pointer, keyboard
- Touch targets ≥ 44×44 CSS px for primary controls; nothing interactive < 32px, and small icons get padded hit areas (device-qa `tap<32px` = 0).
- `:hover` states on pointer devices only (`@media (hover: hover)`); `cursor: pointer` on clickable non-links; `:active` feedback on touch (≤ 100 ms).
- Full keyboard path on desktop: logical tab order, visible `:focus-visible` ring meeting 3:1, Escape closes sheets/dialogs, Enter submits, arrow keys in tab bars/segmented controls/lists (roving tabindex), shortcuts documented in Help where the app has them.
- No double-tap zoom delays (`touch-action: manipulation` on controls), no accidental text selection on controls, `user-select` allowed on content.
- `navigator.vibrate` / audio only after user activation (PulseCap, DeePonyCap fix).

### 7.6 Motion
- Durations 150–350 ms with ease-out / spring curves; enter and exit both designed; interruptible; no animation on initial content paint that delays LCP.
- `prefers-reduced-motion: reduce` → transitions become instant or cross-fades; no parallax, no auto-playing loops.
- 60 fps on interaction (no long tasks > 50 ms during scrolling/transitions on a mid-range profile); no layout thrash; CLS < 0.05 including font swap and image load.

### 7.7 Forms (every form in every app)
- Visible labels (not placeholder-only); correct `type`, `inputmode`, `autocomplete`, `enterkeyhint`; numeric fields use `inputmode="decimal"` with locale-aware parsing.
- Inline validation on blur and on submit, human messages next to the field, error summary for long forms, focus moves to the first error.
- Required/optional marked consistently; sensible defaults; units shown (kg/lb, L/100km, PKR).
- Destructive actions use the app's ConfirmDialog (never `window.confirm`), with undo where feasible.
- Keyboard: Next/Done move through fields; the active field is never covered; submit by Enter on desktop.
- Date/time pickers native where possible; file/photo inputs show progress, size limits and failure states; camera/microphone permission **denied** states designed (IdeaCap, TravelCap OCR, DeePonyCap photos).
- Every form tested with: empty submit, max-length input, emoji, Urdu/RTL text, pasted whitespace, very large numbers, negative numbers, and rapid double-submit.

### 7.8 Navigation
- Back works everywhere (browser back, swipe-back in standalone, in-app back) and restores scroll position.
- Deep links to every top-level route work on cold load (static export routes need `index.html` per route or a 404 fallback that routes correctly).
- Tab bars are ARIA tabs (or nav landmarks) with `aria-current`/`aria-selected`; the active tab is visually and programmatically clear.
- Sheets/modals: focus trap, Escape, backdrop tap, swipe-down on touch where the app uses sheets, `inert` background, scroll lock without layout jump.

### 7.9 States (each screen designs all that apply)
first-run/onboarding · demo (`?demo=1` or app's demo entry) · empty · loading (skeletons, not spinners, for > 300 ms) · partial · error (with retry) · offline (banner + what still works) · permission denied · update available (SW "new version" toast that never crashes — TravelCap) · locked (app lock / PIN) · long content (long names, 500+ items, 10-year histories) · zero/one/many plurals · RTL / Urdu where supported.

### 7.10 Accessibility
axe: 0 serious/critical on every screen in both modes; landmarks + one `h1` per screen + ordered headings; every icon button named; images have alt or are decorative; live regions for toasts/timers; reduced motion; 200% zoom without loss; VoiceOver rotor sanity (macOS VoiceOver + Safari — physical-device VO is BLOCKED-EXTERNAL).

### 7.11 Performance
Lighthouse (mobile, simulated throttling): Performance ≥ 95 target (fleet floor stays the tier1 gate), Accessibility 100, Best Practices 100, SEO 100 for public pages. Initial JS ≤ 200 KB gz where feasible, code-split heavy routes, images responsive (AVIF/WebP, `width/height` set), fonts subset, SW precache only the shell.

### 7.12 PWA & platform
Manifest (name per G-3, §4.1 description, maskable 192/512/1024 icons, `theme_color` + dark, shortcuts, `display: standalone`, `scope`/`start_url` correct for the subpath); Apple touch icon + splash; offline launch; SW update flow safe; install guide (Add to Home Screen) in Settings → About or onboarding; `privacy.html` + support link in Settings → About (G-4).

### 7.13 Copy & honesty
§4 strings verbatim; voice = short, warm, plain; sentence case; no "AI" unless it is (rules engines are "Smart Assistant"/"Smart Coach" per decisions); no "OS" for apps; numbers shown are real or clearly labelled demo; dates/times localised; no lorem, no TODO, no placeholder images in production.

### 7.14 Privacy & security
Network log per app (Playwright HAR on a full click-through) → every destination listed in `privacy.html` and in CSP `connect-src`; no third-party requests otherwise; secrets never in client code; `audit-secrets` clean; XSS audit for any user-text rendering (`audit:xss` where present); G-10 lock where required.

### 7.15 Data safety
Export → wipe → import round-trip test for every app with data; migrations per G-6 with fixtures; quota handling (localStorage/IndexedDB full) designed with a clear message.

### 7.16 Localisation
LedgerCap (English · اردو · Roman Urdu) and MasteryCap (EN · Roman Urdu) get full passes in every language including RTL mirroring for Urdu, Urdu font self-hosted, numerals and line-height tuned for Nastaliq if used; all other apps survive Urdu/RTL user input in text fields.

---

## 8. Verification toolkit (commands and gates)

### 8.1 Per-app commands (Builder runs, Auditor re-runs from clean checkout)
```bash
export PW_CORE=/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core
npm ci && npm run verify            # or the app's equivalent (lint + build + e2e)
npm run tier1                       # hardened Tier 1 runner → TIER1.json (must PASS)
node ../capricorn-tooling/scripts/device-qa.mjs qa/perfection/device --apps=<App> --url=<App>=http://127.0.0.1:<port>/<entry>
(cd ../capricorn-tooling && npm run audit:tokens && npm run contrast:check && npm run audit:versions -- --strict && npm run audit:secrets)
npm run axe                          # where present; otherwise an @axe-core/playwright spec (G-5) over every INVENTORY screen × {light, dark}
npm run gallery && npm run gallery:view   # v3 gallery (§9)
```
Serve **production builds** for QA (static: `python3 -m http.server`; Vite: `vite preview`; Next: serve `out/` under the real subpath; Expo: `npx expo export -p web` then serve `dist/` under `/IdeaCap/`). The subpath matters — test under `/<App>/`.

### 8.2 Gates per app (all must be green; evidence in APP-REPORT-v3)
1. device-qa: 0 hard failures, 0 `tap<32px`, 0 `text<11px`, 0 page errors, 0 hub-origin console errors — on the local prod build **and** on live after release.
2. MATRIX.md 100% ✅ (or justified N/A) with screenshots.
3. tier1 PASS (existing G1–G15).
4. Lighthouse mobile + desktop meeting §7.11 on the app's main routes (≥ 3 routes per app, listed in §13).
5. axe 0 serious/critical on every inventory screen, both modes.
6. Contrast (axe per screen + token pairs) and design-token audits: 0 violations.
7. Network log ⊆ privacy page ⊆ CSP.
8. Export/import round-trip test (data apps).
9. Gallery completeness check (§9.6) PASS.
10. Docs truth audit (§11.4) PASS.
11. Auditor sign-off with ≥ 20 randomly sampled matrix cells re-inspected by eye.

### 8.3 Tooling Engineer: add v3 gates to tier1
Add gate **G16 device-qa** (thresholds above), **G17 gallery v3 completeness**, **G18 docs truth**, **G19 mini-site Lighthouse** so `npm run tier1` enforces this program. Keep G1–G15 behaviour unchanged.

---

## 9. Screen galleries v3 (both colour modes, scrollable, complete)

### 9.1 Capture scope
For every INVENTORY entry and each designed state: **light + dark** × **iPhone (390×844 @3x → store 1170 wide), iPad landscape (1180×820 @2x), desktop (1440×900 @2x)**; plus iPhone SE and iPad portrait for screens whose layout changes there. Sheets/dialogs captured open; forms captured empty, filled, and with validation errors; long-content state captured once per list screen.

### 9.2 Capture rules
Gated behind `CAPTURE_GALLERY=1` (CAP-STANDARD). Deterministic: demo seed data, fixed clock (`2026-10-14T09:41:00`), animations disabled, fonts loaded (`document.fonts.ready`), network idle, no toasts unless the shot is about a toast. Emulate colour scheme via Playwright `colorScheme` **and** set the app's own theme setting where the app has one. Production build only.

### 9.3 Files and manifest v2
`docs/screenshots/gallery/<theme>/<device>/<group>--<screen>--<state>.webp` (WebP q≈82, plus PNG originals only for App Store packs). `gallery-manifest.json` (schema v2):
```json
{ "app": "VaultCap", "version": "5.3.0", "capturedAt": "2026-10-14T09:41:00Z",
  "shots": [ { "id": "banks--list--filled", "group": "Money", "screen": "Banks", "state": "filled",
               "theme": "dark", "device": "iphone", "w": 1170, "h": 2532,
               "file": "dark/iphone/money--banks--filled.webp", "route": "#/banks", "caption": "Every bank account, encrypted on this device." } ] }
```
Every INVENTORY entry must appear in the manifest for both themes (completeness check).

### 9.4 Shared viewer (Gallery Engineer builds once, every app uses it)
`capricorn-tooling/shared/gallery/screen-gallery.{html,css,js}`, copied into each repo as `screen-gallery.html` + assets (no network, no framework). Requirements:
- Reads `gallery-manifest.json`; groups by `group` → horizontal **scroll-snap rails** per group, momentum scrolling, peek of the next card, arrow buttons on pointer devices, swipe on touch, keyboard ←/→ within a rail and ↑/↓ between rails.
- Toolbars: **Light / Dark / Both (side-by-side pairs)**, device filter (iPhone · iPad · Mac · All), state filter, search by screen name; selections reflected in the URL (`?theme=dark&device=ipad#banks`).
- Device frames drawn in CSS (no images of Apple hardware, no trademarks); lightbox with pinch-zoom, swipe between shots, Escape to close, caption + route + version.
- Viewer chrome itself follows light/dark and the app's accent; lazy-loads images (`loading="lazy"`, `decoding="async"`), fits Lighthouse ≥ 95.
- Accessible: buttons named, rails are lists, lightbox is a dialog with focus trap.

### 9.5 Where galleries show up
Each app repo root (`screen-gallery.html`), each app's mini-site (§10), and Capricorn OS app windows/sheets (Hub Engineer replaces the single screenshot with a light/dark carousel fed from the manifest).

### 9.6 Completeness check (gate G17)
Script fails if: any INVENTORY entry lacks a light or dark shot for any required device; any file in the manifest is missing; any shot is older than the app's current version; any shot is visually blank (≥ 98% one colour).

---

## 10. Mini-sites — one per app, inside the hub

### 10.1 Decision to record (Conductor writes into DECISIONS §6)
`N-1 · Mini-sites → every Cap gets https://shamikhahmed.github.io/apps/<slug>/ (DeeFoodie: private-beta page without install). The legacy <slug>.html redirect now points to the mini-site instead of the app (amends P-HUB-1; the mini-site's primary CTA opens the app). — v3, 2026-10-14.`

### 10.2 Source of truth and build
Generator in `capricorn-lab/scripts/build-minisites.mjs` (Hub Engineer), run by `npm run deploy:hub`. Inputs per app: catalog entry (`js/products.js`), live `VERSION.json`, `FEATURES.md` (S items), `CHANGELOG.md` (latest 5), privacy page network list, §4.1 description + §4.2 disclaimer, `gallery-manifest.json` + WebP shots (copied, size-budgeted: ≤ 8 MB per app, responsive `srcset`), support FAQs from hub `support.html`. Output: `shamikhahmed.github.io/apps/<slug>/index.html` (+ `assets/`), plus `apps/index.html` (all Caps). Static, no framework, no third-party anything, self-hosted fonts per the app's identity.

### 10.3 Page anatomy (each section designed in the app's own identity, light + dark)
1. **Hero** — app icon, name, §4.1 line, live version badge (from VERSION.json at runtime with fallback), primary CTA **Open <App>**, secondary **Try it in Capricorn OS** (`/?app=<slug>` opens its window/sheet with Run here), tertiary **Add to Home Screen** guide.
2. **Screen gallery** — the shared viewer (embedded mode): Light/Dark toggle, device filter, scrollable rails, lightbox.
3. **What it does** — 4–8 feature tiles from FEATURES S (honest wording; no feature that isn't shipped).
4. **Privacy, plainly** — what stays on device, every network destination (from the privacy page) with why, "no analytics, no ads, no account".
5. **How to install** — iPhone/iPad Safari, Mac Safari/Chrome, Android Chrome (PWA), with screenshots from the gallery.
6. **FAQ** — app-specific (from support.html, extended), including the §4.2 disclaimer where applicable.
7. **What's new** — latest 5 CHANGELOG entries, linking to the full changelog.
8. **Footer** — Capricorn Systems, support, privacy, GitHub repo, other Caps rail.

### 10.4 Quality bar
Lighthouse 100/100/100/100 (mobile + desktop) target, ≥ 95 floor on Performance; device-qa clean on all devices; perfect in both colour schemes (system-following + toggle); `<title>`, description, canonical, OG + Twitter card with a generated per-app OG image (1200×630, from the gallery hero shot); JSON-LD `SoftwareApplication` (price 0, operatingSystem "Web, iOS, iPadOS, macOS, Android (PWA)" — this describes where it runs, not what it is); added to `sitemap.xml`; `<slug>.html` redirects updated; hub `check-links.mjs` + `stage-site.sh` pass; Capricorn OS app windows and iOS sheets gain a **Website** button to the mini-site; `?app=<slug>` deep link opens that Cap in Capricorn OS.

---

## 11. Documentation — every document

### 11.1 Per-repo documents (each app; create if missing, fix if stale)
`README.md` (§4.1 first line, live URL, features, screenshots from the v3 gallery in both modes, quick start, scripts that actually exist, deploy, support/privacy links) · `CHANGELOG.md` (keep-a-changelog; this release) · `HANDOVER.md` (current state, gotchas, how to verify — commands copy-paste-runnable) · `ROADMAP.md` (Now/Next/Later, honest) · `FEATURES.md` (S/W/L/R updated) · `PRIVACY.md` + `privacy.html` (DECISIONS §4.4 template, filled from the real network log) · `SECURITY.md` · `CLAUDE.md` / `AGENTS.md` (point at Brain note + this program) · `IA-RATIONALE.md`, `QA-MATRIX.md`, `PERF.md`, `AUDIT.md` where present (update with v3 results, don't leave September numbers as "current") · `docs/store/*` for ScentCap, VaultCap, IdeaCap, DeeFoodie (G-1) · `LICENSE` (MIT, Shamikh Ahmed / Capricorn Systems).

### 11.2 Fleet + hub documents
`capricorn-tooling/README.md`, `shared/CAP-STANDARD.md` (add v3: gallery v3, device-qa gate, mini-site, docs truth), `docs/perfection-2026-10/*`, `shamikhahmed.github.io/{README,HANDOVER,ROADMAP,CHANGELOG,ANNOUNCE}.md`, `docs/DESIGN_IDENTITY.md` (add each app's type scale, palette tokens light/dark, motion signature), hub `support.html` (per-app FAQ refreshed), `privacy.html`, `terms.html`, classic pages (`about`, `sovereignty`, `solutions`, `pitch`, `investor`, `enterprise` — numbers and screenshots current, same no-third-party rule), `capricorn-lab/{README,HANDOVER,CHANGELOG}.md`.

### 11.3 Brain vault (notes only)
For each project touched: `~/Capricorn-Brain/01 Projects/<Project>.md` — update front-matter (`version`, `updated`), append a dated **Decisions** line with SHA/tag; update `05 Companies/Capricorn-Systems.md` and the Software Catalog if names/versions changed. Never copy code or secrets into the vault.

### 11.4 Docs truth audit (gate G18)
Script checks: versions in docs = VERSION.json = package.json = SW cache tag; every fenced `bash` command referencing an npm script names a script that exists; every relative link resolves; every screenshot referenced exists and comes from the current gallery; no "TravelOS/PrismOS/… OS" for apps; no stale counts ("ten apps", "thirteen Caps", "300+ exercises").

---

## 12. Release & deploy protocol (per app, every release)

1. Version per G-8 — v3 finish release for each app = **next minor** (e.g. VaultCap 5.3.0, PulseCap 6.45.0, MasteryCap 51.10.0, CarCap 1.1.0, TravelCap 1.1.0, IdeaCap 2.1.0, CookCap 3.6.0, DeeFoodie 1.1.0+<build>); hotfixes patch.
2. Bump together: `VERSION.json` (+ publish it on Pages — AuraCap and CookCap currently don't), `package.json`, SW cache name, SW register query, CHANGELOG, in-app About version.
3. Gallery regenerated in the release commit. README screenshots updated.
4. Merge `perfection/<app>-v3` → `main` (`--no-ff`), tag `vX.Y.Z`, push `main` + tag.
5. Deploy path: own Pages → wait for the app's CI green. **Hub-hosted** (CarCap, IdeaCap, TravelCap) → Hub Engineer rebuilds and rsyncs into `shamikhahmed.github.io/<App>/`, then hub CI. For PrismCap and SoulCap, confirm the own-Pages copy is what's served and remove the stale hub copies (`shamikhahmed.github.io/PrismCap/`, `/SoulCap/`) once confirmed — keep redirects working.
6. Live verification: device-qa against the live URL, Lighthouse on live, `VERSION.json` live = tag, hub Capricorn OS shows the new version (live catalog).
7. If live verification fails: fix forward within the hour or revert the merge commit (not force-push) and reopen.

---

## 13. App specifications (app-specific — inventory seeds, flows, focus, tickets)

Each app's inventory below is the **minimum**; phase B must add everything else found in code. Ticket IDs start each app's `ITEMS.md`.

### 13.1 VaultCap — "Swiss vault command center" (indigo glass, mono numerics)
- **Path / stack / deploy:** `VaultCap`, static JS PWA (`js/bundle-order.json` build), own Pages. Demo `/VaultCap/?demo=1`, PIN `123456` (demo only).
- **Screens (27 in the analyzer):** lock/PIN · onboarding · home/net worth · banks · cash · cards · credit · loans · investments · bonds · digital assets · currency · assets · documents · emails · sims · family · friends · bc (committees) · expenses · reminders · alerts · tax · zakat · timeline · trash · recovery-center · import · emergency · help · settings/profile switch · decoy vault.
- **Forms:** PIN setup + confirm + change, WebAuthn enrol, add/edit each record type (bank account with IBAN, card with masked number + expiry, loan schedule, investment lot, document with photo/PDF, committee with members/rounds, reminder with date/repeat), Smart Import (paste/statement), Zakat calculator (nisab, holdings), tax, export `.vos` (passphrase), import `.vos`, family profile create/switch, decoy PIN.
- **Flows to exercise:** first-run → PIN → empty vault → add each type → net worth updates → lock/unlock → profile switch (flush-safe) → export → erase → import → everything back. Document PDF pack (single/multi/visible).
- **Apple-finish focus:** money typography (tabular, currency via `Intl` per profile currency, negative values with true minus), lock-screen polish (keypad 44px+, haptic-free on web, shake on wrong PIN with reduced-motion fallback), glass legibility in light mode, long bank names, 50+ accounts list performance, decoy vault indistinguishable visually.
- **Decisions:** P-VLT-1 (no marketing JS in app shell), P-VLT-2 (PBKDF2 ≥ 600k re-wrap), D-08 (network features opt-in, default off), G-1 (Capacitor 8 iOS project + store pack, BLOCKED-EXTERNAL at submission).
- **Tickets:** VLT-V3-1 "Skip to content" link target < 32px (make it a proper 44px skip link). VLT-V3-2 merge `finish/vaultcap-stepR` (+13) and review `wip/vaultcap-2026-09` (identity.css, tokens.css, demo-boot.js, bundle-order.json). VLT-V3-3 gallery manifest currently lists 0 parseable shots in v2 schema — full v3 capture. VLT-V3-4 residual `style-src 'unsafe-inline'` (~800 inline styles) — reduce where it doesn't risk regressions; document the rest.
- **Lighthouse routes:** `/VaultCap/` (lock), `/VaultCap/?demo=1` (home after unlock), banks list.

### 13.2 PulseCap — "Kinetic performance lab" (cyan gradients, athletic motion)
- **Path / stack / deploy:** `PulseCap`, static JS PWA (MODULE_CHAIN defer), own Pages. Demo `?demo=1` (demo personas).
- **Screens (18):** intro · onboarding · equipment-setup · dashboard/briefing · workout (logger) · active session · my-plan · plan-import · split-builder · progress · recovery/readiness · rehab · cardio · nutrition · photos (physique) · profiles · settings · Training Guide (6.44.0) · exercise library (1,872 exercises: search, filters, muscle map, detail).
- **Forms:** onboarding profile (units kg/lb, goals, experience), equipment checklist, set logging (weight, reps, RPE, rest timer, notes), plan import (PDF text / JSON / paste with review), custom split builder, cardio entry, nutrition food entry + barcode stub, body measurements, photo add, profile create/switch.
- **Flows:** onboarding → plan → start workout → log sets with rest timer → finish → progress/PRs update → recovery score → Smart Coach suggestions (rules) → export.
- **Apple-finish focus:** the logger is the product — big numeric steppers, one-thumb reach on iPhone SE, rest-timer as a live, accessible timer (live region), wake-lock during sessions, library search speed with 1,872 items (virtualised list, instant filter), muscle-map legibility in light mode, charts with dark variants.
- **Disclaimer:** §4.2 PulseCap on About, last onboarding step, Rehab.
- **Tickets:** PLS-V3-1 `navigator.vibrate` called before user activation (Chrome intervention; gate behind `navigator.userActivation.hasBeenActive`). PLS-V3-2 hub screenshot stale (v4.5.1 / "300+ exercises") — new gallery → hub. PLS-V3-3 gallery has 176 shots in light+dark already — extend to every new 6.44 surface (Training Guide, library detail, filters) and migrate to v3 viewer.
- **Lighthouse routes:** dashboard, workout logger, exercise library.

### 13.3 PrismCap — "Neon party arcade" (holographic purple/pink)
- **Path / stack / deploy:** `PrismCap`, Vite + TS, own Pages (stale copy in hub repo — resolve per §12.5). Harness `?e2e=1`.
- **Screens:** home (daily challenge, XP/level) · library (all games, categories, favourites, search) · game (each game: setup → pass-the-phone handoff screens → play → results) · player setup · settings · achievements · QR share.
- **Every game** (registry in `js/app.js` — enumerate all 38/39; names renamed per D-06): start → at least one full round → exit, on iPhone and iPad, both themes. Handoff screens must hide private info until the next player taps.
- **Forms:** player names (add/remove/reorder, emoji avatars), game options (rounds, timers, categories), custom word lists where a game has them.
- **Apple-finish focus:** the arcade identity is loud — keep it, but text must be ≥ 11px (today ~200 nodes under 11px: "LV1", "REFLEX", category chips, "Today's Challenge"), tap targets ≥ 44px for in-game controls passed between people, landscape support on phones for games that benefit, reduced-motion versions of neon/glitch effects, no flashing > 3 Hz (photosensitivity).
- **Decisions:** D-06, P-PRSM-1 (no device-select gate).
- **Tickets:** PRS-V3-1 tiny text (~200 nodes) across home/library/game. PRS-V3-2 small targets: "Change", "+ Add", favourite buttons on cards. PRS-V3-3 merge `finish/prismcap-stepR` (+11). PRS-V3-4 game-session gallery shots (FEATURES L item) — capture every game's setup, play, results in both themes. PRS-V3-5 Lighthouse (stepR recorded P12/P29 locally) — bring to §7.11.
- **Lighthouse routes:** home, library, one heavy game.

### 13.4 SteadyCap — "Clinical warmth" (orange + teal, breathing space)
- **Path / stack / deploy:** `SteadyCap`, static JS PWA, own Pages. Demo `?demo=1`.
- **Screens (6 tabs + sheets):** Today/dashboard · Recovery (quit timelines, milestones) · **SOS** (centre tab, 5-phase flow) · Journal · Knowledge · Profile/settings · routine detail · medicine detail · check-in sheet · app lock (G-10).
- **Forms:** routine add/edit (meds/skincare/hair; schedule, dose, reminders), medicine add (with §4.2 footnote), check-in (mood chips "Strong/Okay/Hard/Slipped", cravings, notes), journal entry, quit timeline start date, trigger log, app-lock passcode setup.
- **Flows:** demo → Today "Due now" (Taken/Skip) → check-in → journal prompt (P-STDY-1) · SOS from any screen in ≤ 1 tap → all 5 phases → exit back to where you were · lock on background → unlock.
- **Apple-finish focus:** calm, never alarming except SOS; **no streak language anywhere** (P-STDY-1); SOS readable at 200% zoom and in both themes; check-in chips ≥ 11px text and 44px targets (today "Strong/Okay/Hard/Slipped" are < 11px; "Open journal" target < 32px).
- **Disclaimer:** §4.2 SteadyCap on About + medicine add footnote.
- **Tickets:** STD-V3-1 mood chip text < 11px. STD-V3-2 "Open journal" target. STD-V3-3 merge `finish/steadycap-stepR` (+15) and reconcile `wip/steadycap-2026-09` (2.5.6 bump, `js/modules/demo-seed.js`, navigation/profile changes) with G-8. STD-V3-4 G-10 app lock via shared module + migration per G-6 + fixtures.
- **Lighthouse routes:** Today, SOS, Journal.

### 13.5 LedgerCap — "Terminal finance" (gold on charcoal, ticker density)
- **Path / stack / deploy:** `LedgerCap`, static JS PWA + Cloudflare Worker (prices), own Pages. Demo `?demo=1`.
- **Screens (58 screen nodes):** Home/net worth · Watchlist · Market (KSE-100, advancing/declining, intraday) · Portfolio (holdings, CAGR, performance, dividends calendar) · Funds (mutual funds, Meezan/Islamic) · Transactions (buy/sell/dividend/deposit/salary/USD/crypto/intl) · Research / screener / signals / insights / announcements / commodities · Zakat · IPO · Import · Paper-trade · Settings → General (languages English · اردو · Roman Urdu, currency, theme — P-LDG-1).
- **Forms:** add transaction (all types, fees, dates, broker), CSV import with mapping preview, watchlist add/search, fund units, Zakat inputs, paper trade order, settings.
- **Flows:** demo → holdings → add buy → portfolio updates → dividend → Zakat → export/import → language switch to اردو (full RTL) → Roman Urdu → back to English without layout breakage.
- **Apple-finish focus:** dense data done beautifully — tabular figures everywhere, aligned decimal columns, up/down colours accessible in both themes (not colour-only: ▲/▼ glyphs), PKR via `Intl.NumberFormat('ur-PK'/'en-PK')`, readable charts in light mode, Urdu typography (self-hosted Urdu font, line-height for Nastaliq if used), "indicative / delayed" labels on every price (D-09), §4.2 footer on Research/Signals.
- **Tickets:** LDG-V3-1 tab-bar labels and KSE chip text < 11px. LDG-V3-2 small targets: "Txs", "Dismiss", KSE-100 chip, "Refresh snapshot". LDG-V3-3 404 resource on load (find and fix or remove the reference). LDG-V3-4 merge `finish/ledgercap-stepR` (+15). LDG-V3-5 Lighthouse (stepR P33 locally) to §7.11. LDG-V3-6 full Urdu/RTL pass on every screen.
- **Lighthouse routes:** Home, Portfolio, Research.

### 13.6 DeePonyCap — "Toy-shelf joy" (pastel pink, bouncy radii)
- **Path / stack / deploy:** `DeePonyCap`, static JS PWA, own Pages. Demo `?demo=1`.
- **Screens (6 tabs):** Stable (collection) · Wishlist (tiers) · Map (collection map / shelf organize) · Stats (achievements, insights) · Logs · Accessories · item detail · add/edit item · series manager · settings (compact view, dark mode, app lock PIN, export/import, CSV).
- **Forms:** add item (photo capture/upload, series, name, condition, price, date), define series, wishlist tier, shelf assignment, CSV import/export, PIN setup.
- **Flows:** demo → add with photo → appears on shelf/map → wishlist → acquired → stats update → export → wipe → import (photos survive).
- **Apple-finish focus:** joyful but legible — emoji decorations (✨⭐💫🌟💖) are currently rendered < 11px (36 nodes); make them decorative (`aria-hidden`) at ≥ 16px or remove; photo grid performance with 300+ photos (lazy, object-fit, aspect ratios); pastel contrast in light mode; D-04 no third-party IP in bundled content or screenshots.
- **Tickets:** DPY-V3-1 tiny emoji/text nodes. DPY-V3-2 `navigator.vibrate` before user activation. DPY-V3-3 merge `finish/deeponycap-stepR` (+11, a11y contrast + sheet dialog fixes). DPY-V3-4 gallery manifest v3 (current manifest has no v2-parseable shots).
- **Lighthouse routes:** Stable, Wishlist, item detail.

### 13.7 ScentCap — "Perfume wardrobe" (warm amber on espresso, serif) — Cap Standard pilot
- **Path / stack / deploy:** `ScentCap`, React + Vite, Capacitor 8 iOS project (native-ready per G-1), own Pages. Demo `?demo=1`.
- **Routes (12):** `/` Today (weather picks) · `/collection` · `/fragrance/:id` · `/add` · `/advisor` (Smart Advisor, rules) · `/layering` (Layering Lab) · `/calendar` · `/analytics` · `/travel` (Travel Kit) · `/onboarding` · `/settings` · `*` 404.
- **Forms:** add fragrance (catalog search + manual), bottle level, wear log (time, occasion, notes), layering combos, travel kit builder, settings.
- **Flows:** onboarding → "Use my collection" → Today pick → wear → calendar/analytics → layering → travel kit → export.
- **Apple-finish focus:** brand captions in catalog cards are < 11px ("DOLCE & GABBA…", "Prada"…) — increase and truncate gracefully; serif typography scale; bottle imagery legible in both themes; native-ready: iOS project builds clean on Xcode 26 / iOS 26 SDK (BLOCKED-EXTERNAL only at submission), store pack in `docs/store/`.
- **Disclaimer:** §4.2 ScentCap on About.
- **Tickets:** SCN-V3-1 `main` CI red since the Sept 23 merge — fix first. SCN-V3-2 brand caption text < 11px. SCN-V3-3 "Use my collection" target < 32px. SCN-V3-4 gallery: 20 shots → full v3.
- **Lighthouse routes:** Today, Collection, Fragrance detail.

### 13.8 SoulCap — "Quiet room" (soft violet, slow motion) — safety-critical
- **Path / stack / deploy:** `SoulCap`, static JS PWA (`backend/`, `mobile/` are lab code, excluded — P-SOUL-2), own Pages (stale `SoulCap/` copy in hub — resolve per §12.5). Demo `?demo=1`.
- **Tabs (5):** Now (simplified — Q-3 A) · Calm (techniques: breathing, grounding, timers) · Journal · Map · Me (settings, Help, app lock, export).
- **Forms:** check-in, journal entry, technique timers, age gate, Help region selection, app lock passcode (G-10, required for Tier 1 G10), export/import.
- **Flows:** age gate → Now → check-in → technique → journal → Help from anywhere (region-aware verified numbers, D-05) → lock/unlock → export.
- **Apple-finish focus:** slow, soft motion with reduced-motion parity; Help is always one tap and never styled as promotional; desktop ≥ 900 sidebar (P-SOUL-1); journal editor comfort (line length, autosave indicator).
- **Disclaimer & copy:** §4.2 SoulCap + §4.3 Help/age gate verbatim. Never "therapy", never "AI", never "Living Mind" (retired overclaim).
- **Tickets:** SOL-V3-1 device scan clean — focus on matrix completeness in both themes (gallery has 380 shots; migrate to v3 viewer, ensure dark parity). SOL-V3-2 switch local repo to `main` (finish branch merged). SOL-V3-3 confirm served copy and remove stale hub copy.
- **Lighthouse routes:** Now, Calm, Journal.

### 13.9 TravelCap — "Passport desk" (cream + burgundy, stamped details)
- **Path / stack / deploy:** `TravelCap`, Next.js static export (basePath `/TravelCap`), **hosted in the hub repo** (`shamikhahmed.github.io/TravelCap/`).
- **Tabs (P-TRVL-1):** Trips · Explore · Documents · More. Trip detail: Itinerary, Transit (air + car/bus/train/ship/cruise/ferry; optional AviationStack key), Stays (Nominatim search — third-party: privacy page + CSP), Food, Budget (paidBy/split), Packing, Party, Memories. More: Passport & stamps (world map), Wishlist, Emergency mode, Settings. Modes: departure / arrival / emergency. Smart Assistant (rules). Routes in code: `/`, `/trips`, `/trips/[id]`, `/explore`, `/documents`, `/more`, `/passport`, `/wishlist`, `/emergency`, `/settings`, `/flights`, `/transit`, `/hotels`, `/food`, `/budget`, `/packing`, `/family`, `/memories`, `/arrival`, `/departure`, `/assistant`, `/offline` — old routes must redirect to P-TRVL-1 locations.
- **Forms:** create trip (dates, destinations, party), itinerary item, transit leg (with seat map picker), stay, food entry, expense with split, packing item, document upload + OCR, party member, memory photo, emergency contacts, settings (API key field, app lock G-10 for documents).
- **Flows:** create trip → add flight → boarding pass ticket view → hotel → budget split → packing → departure mode → arrival mode → emergency mode → memories → stamps map updates.
- **Apple-finish focus:** boarding-pass tickets pixel-perfect in both themes; world map legibility in dark; documents vault behind lock; offline page designed; §4.2 TravelCap footer on flight/visa screens.
- **Tickets:** TRV-V3-1 **P0** page error on `/trips` on every device: `Cannot read properties of undefined (reading 'waiting')` — guard SW registration/update code when `getRegistration()` resolves `undefined` or SW is unavailable. TRV-V3-2 **G-3 violation:** sidebar shows "Passport OS" (`src/components/layout/sidebar.tsx:40` and built hub copy) → "Passport desk" or similar non-OS label. TRV-V3-3 text < 11px in sidebar/ticket labels ("Official document", "Travel document"). TRV-V3-4 "Collapse sidebar" target < 32px. TRV-V3-5 merge `finish/travelcap-stepR` (+12). TRV-V3-6 404 resource on load. TRV-V3-7 Lighthouse (stepR P62/P74) to §7.11. TRV-V3-8 rsync release into hub copy (Hub Engineer).
- **Lighthouse routes:** /trips, /trips/[demo id], /documents.

### 13.10 AuraCap — "Setup studio" (indigo/violet glass)
- **Path / stack / deploy:** `AuraCap`, React + Vite + TS, own Pages. Demo `?demo=1`.
- **Routes (26):** dashboard (title "Overview" — P-AUR-1) · apps · dna ("Setup report" in UI) · import · import-guide · organizer · profiles · settings · lockscreen · designer · wallpaper · widgets · routine · cleanse · shortcuts · history · `*`.
- **Forms:** device select (iPhone/iPad/Mac), region, app-list import (paste/file), profile create, designer/wallpaper studio controls, routine builder, shortcuts, settings.
- **Flows:** onboarding (device + region) → import app list → Overview with Aura Score (Focus · Clarity · Organization breakdown + info sheet "What is Aura Score?") → Setup report → organizer → designer → export.
- **Apple-finish focus:** P-AUR-2 no three.js/GSAP — CSS/View Transitions with reduced-motion; glass legibility in light mode; trademark-safe visuals (no Apple device images; §4.2 AuraCap disclaimer).
- **Tickets:** AUR-V3-1 small targets on touch: device selector pill ("Device: iPhone. Tap to switch"), "More", "Full setup report", "What is Aura Score?", "Region: Pakistan". AUR-V3-2 **publish `VERSION.json` on Pages** (hub live catalog can't read AuraCap today). AUR-V3-3 merge `finish/auracap-stepR` (+7) and review `wip/auracap-2026-09` (17 files: AppShell, MobileTabBar, Sidebar, WelcomeScreen, premium components, index.css, motion.ts, Dashboard). AUR-V3-4 gallery 32 shots → full v3 both themes.
- **Lighthouse routes:** Overview, Setup report, Organizer.

### 13.11 MasteryCap — "Night school" (mint on near-black, bilingual)
- **Path / stack / deploy:** `MasteryCap`, static JS PWA, own Pages. Demo via Settings → Enter demo mode (no query param). Themes: Light / Sepia / Dark — **all three** are in scope for the gallery (treat Sepia as a third column).
- **Tabs (5):** Today (guided daily session, continuity, Student ID card — P-MST-1 name prompt) · Campus (3 branches: Software Craft, Markets, Money; Open/Locked/Announced courses) · Learn (institute reader, lessons, quizzes, Parsons on phone / typed code editor ≥ 900px, HTTP Lab simulated) · Practice (Charts hub, Daily review, Hasil, Mistake museum, paper sim + process graduation) · Records (certificates — self-issued, export).
- **Forms:** first-run name (skippable), quiz answers (MCQ, Parsons drag/tap, code editor), paper-trade sim orders, settings (theme, language EN / Roman Urdu, age band), records export/import.
- **Flows:** first run (named and skipped variants) → Today session → lesson → quiz → mistake → daily review → certificate → export.
- **Apple-finish focus:** reading comfort in the reader (measure, line height, Sepia contrast), code editor ergonomics on iPad with hardware keyboard, Parsons on touch with 44px handles, bilingual depth bars, ARIA tabs (keep), §4.2 MasteryCap on About/Markets/certificates.
- **Tickets:** MST-V3-1 device scan clean — matrix completeness for 3 themes × 2 languages. MST-V3-2 gallery 12 shots → full v3. MST-V3-3 CONTENT-GAPS.md / URDU-REVIEW.md items triaged into ITEMS.
- **Lighthouse routes:** Today, Campus, a lesson.

### 13.12 IdeaCap — "Idea board" (gold on midnight)
- **Path / stack / deploy:** `IdeaCap`, Expo (React Native web export under `/IdeaCap/`), **hosted in the hub repo**; native iOS/Android must compile locally (G-1, API 36, predictive back, privacy manifest).
- **Screens (4 + sheets):** Home / Ideas board (≥ 900px Details rail) · Record (voice, on-device STT; text always) · NoteDetail (Summary, tags, "Ask about this note") · Settings (folders, soft reminders, backup export/import, erase all data, privacy/support).
- **Forms:** text capture, voice capture (permission prompt / denied / unsupported-browser states), folder create/rename, reminder set, ask-about-note input, import file.
- **Flows:** capture text → appears on board → open detail → Summary → ask → folder → reminder → export → erase → import.
- **Apple-finish focus:** P-IDEA-1 labels; mic states designed for Safari (web) vs native; board layout at 1180/1440 with Details rail; react-native-web quirks (`div.css-*` overflow).
- **Tickets:** IDA-V3-1 **P1** 17px horizontal overflow on iPhone/iPad/Mac WebKit (`div.css-g5y9jx`) — merge `finish/ideacap-r3` (C-36 chip rails) first, then re-test; fix any remainder. IDA-V3-2 `main` CI red — fix first. IDA-V3-3 no gallery/manifest — build v3 gallery (Playwright on web export; native screenshots via simulator if toolchain present, else BLOCKED-EXTERNAL for native only). IDA-V3-4 rsync release into hub copy.
- **Lighthouse routes:** Home, Record, NoteDetail.

### 13.13 CarCap — "Garage" (coral on charcoal)
- **Path / stack / deploy:** `CarCap`, static JS PWA (`carcap-v8` SW), **hosted in the hub repo**. Demo `?demo=1&tab=today`.
- **Tabs (6):** Today (Coming up 30 days + overdue banners — P-CAR-1) · Garage (vehicles) · Service (log + reminder dates) · Fuel (odometer, L/100 after ≥ 2 full tanks) · Docs (wallet: text/meta + expiry + optional photos) · Settings (sample data, JSON export/import, erase, privacy/support, notifications).
- **Forms:** add/edit vehicle (make/model/year/plate/nickname), service entry (date, odometer, cost, next due), fuel entry (litres, price, full tank flag, odometer), document (type, number, expiry, photo), notification permission flow (P-CAR-1 copy verbatim).
- **Flows:** sample data → Today coming up → add fuel ×2 → L/100 shows → service due → doc expiry banner → export → erase → import.
- **Apple-finish focus:** units and number formatting (L/100km, km, PKR), ConfirmDialog everywhere, multi-vehicle switcher ergonomics, empty states that invite the first car.
- **Tickets:** CAR-V3-1 device scan clean — gallery has only 4 shots → full v3 both themes. CAR-V3-2 switch local repo to `main`. CAR-V3-3 rsync release into hub copy.
- **Lighthouse routes:** Today, Garage, Fuel.

### 13.14 CookCap — "Family cookbook" (terracotta, paper texture)
- **Path / stack / deploy:** `CookCap`, Next.js static export, own Pages. Demo `?demo=1`.
- **Surfaces (book metaphor):** Splash · Onboarding / NameGate / Dresser onboarding · Book cover · chapters & leaves (LeafView, BookmarkRail) · recipe reader (servings scaling, nutrition estimates) · **Cooking mode** (step-by-step, timers, keep-awake) · Favorites drawer · Meal planner drawer (breakfast/lunch/dinner/snack) · Shopping drawer · Profiles (family members, goals: cut/maintain/bulk) · Search · Appearance · Import modal · About · What's new sheet · Install banner · Offline chip · SW update toast · Guest mode.
- **Forms:** name gate, profile create (diet, goals), search, servings, meal plan assignment, shopping list add/check, import recipes, appearance settings.
- **Flows:** first run → cover → open chapter → recipe → scale servings → cooking mode end-to-end → add to shopping → meal plan week → favourites → offline reopen.
- **Apple-finish focus:** page-turn motion with reduced-motion cross-fade; paper texture legibility in dark; cooking mode readable at arm's length (large type, 44px+ controls, screen wake); P-COOK-1 recipe count from one exported function everywhere; "Nutrition values are estimates." under nutrition.
- **Tickets:** CK-V3-1 **P0** React hydration error #418 on every device (SSR/export text mismatch — typically dates, `Math.random`, locale formatting or storage-dependent text rendered during export; render client-only values after mount). CK-V3-2 small target (an `INPUT`). CK-V3-3 **publish `VERSION.json` on Pages**. CK-V3-4 merge `finish/cookcap-stepR` (+14). CK-V3-5 add `screen-gallery.html` (manifest has 52 light-only shots) → v3 both themes. CK-V3-6 hub uses a TravelCap placeholder screenshot for CookCap — replace from gallery.
- **Lighthouse routes:** cover, a recipe, cooking mode.

### 13.15 DeeFoodie — "Karachi food diary" (gold on deep green) — private beta
- **Path / stack / deploy:** `DeeFoodieApp`, Flutter (iOS + web). D-10: private TestFlight, two users, token auth. Display name "DeeFoodie"; Home H1 "Your Karachi"; counts via `Intl.NumberFormat` (P-DFD-1).
- **Routes (28):** `/` · `/onboarding` · `/explore` · `/map` · `/areas` · `/area/:name` · `/eatery/:id` · `/add-eatery` · `/add-visit` · `/visit/:id` · `/edit-visit/:id` · `/journal` · `/favorites` · `/wishlist` · `/collections` · `/collections/:id` · `/dishes` · `/dish/:name` · `/dictionary` · `/trails` · `/seasonal/:id` · `/taste-profile` · `/passport` · `/my-cards` · `/order` · `/miss-it` · `/wrapped` · `/profile`.
- **Forms:** add eatery, add/edit visit (photos, dishes, rating, spend), collections, taste profile, profile/token entry.
- **Apple-finish focus:** Flutter web/iOS parity with Cupertino conventions, typography and dark mode via ThemeData, map legibility.
- **Tickets:** DFD-V3-1 **P0 privacy/D-10:** the Flutter web build is publicly reachable at `https://shamikhahmed.github.io/DeeFoodieApp/` (legacy gh-pages). Bring it in line with D-10: require the beta token before any content loads, or stop publishing the web build (keep `web-deploy.yml` but disabled), and keep the hub listing as "Private beta" without an install link. DFD-V3-2 TestFlight pack ready (BLOCKED-EXTERNAL at upload). DFD-V3-3 gallery (iOS simulator if Xcode present; else web build behind token in a local run) for the mini-site's private-beta page (no install CTA).

### 13.16 Hub & Capricorn OS (Hub & Mini-site Engineer)
- **Source:** `capricorn-lab` (Capricorn OS 1.1.0 — ten themes, iPad mode, Run here, live catalog, Privacy Monitor). Gates: `npm test`, `npm run qa:matrix`, `npm run qa:flows`, Lighthouse 100s. Hub repo gates: `npm test`, `check-links.mjs`, `stage-site.sh`.
- **Work:** mini-site generator + all 15 mini-sites (§10) · `?app=<slug>` deep link · **Website** button in app windows/sheets · replace single screenshots with light/dark gallery carousels from each manifest · refresh `assets/screenshots/` from v3 galleries (fixes stale PulseCap / placeholder CookCap) · classic pages (`about`, `sovereignty`, `solutions`, `pitch`, `investor`, `enterprise`) restyled with OS tokens and current numbers · `support.html` per-app FAQs · per-theme OG images (ROADMAP #4) · remove stale `PrismCap/` + `SoulCap/` copies after confirming own-Pages serving · rsync releases of CarCap, IdeaCap, TravelCap · `sitemap.xml` with mini-sites.
- **Capricorn OS polish candidates (P2/P3):** theme-aware app icons where an app ships light/dark icons; Appearance previews for the iPad surface; keyboard shortcut overlay (`?`); gallery inside Run-here windows when an app is offline.

---

## 14. Severity & ordering
P0 (crash, data loss, safety, privacy, broken flow) → P1 (visible layout/contrast/overflow/clip, broken state, a11y serious) → P2 (polish: rhythm, alignment, motion, copy) → P3 (delight). Within a severity: safety-critical apps first (SoulCap, SteadyCap, VaultCap), then by usage (PulseCap, VaultCap, LedgerCap), then the rest. Today's known P0s: TRV-V3-1, CK-V3-1, DFD-V3-1. Known P1s: IDA-V3-1, TRV-V3-2, PRS-V3-1, LDG-V3-1/2, DPY-V3-1, STD-V3-1/2, SCN-V3-1/2, AUR-V3-1/2, CK-V3-3.

---

## 15. Completion criteria (stop only when all are true)
1. Every app (15) + hub: all gates in §8.2 green on the **live** deployment, Auditor-signed, `APP-REPORT-v3.md` committed.
2. Every app: MATRIX.md 100% ✅; gallery v3 complete in light **and** dark (MasteryCap: light, sepia, dark) on iPhone, iPad and Mac; shared scrollable viewer in repo root.
3. Every app has a live mini-site at `/apps/<slug>/` meeting §10.4; `/apps/` index live; legacy `<slug>.html` redirect to mini-sites; Capricorn OS links to them.
4. Every document in §11 updated and passing the docs truth audit; Brain vault notes updated with dated decisions.
5. Every `finish/*` branch merged; every `wip/*` branch reviewed (integrated or explicitly left with a reason in ITEMS); no repo has uncommitted changes; every release tagged; all CI green.
6. Final regression loop (§5.5) produced one full clean pass.
7. `FINAL-REPORT-v3.md` written (§16.5). Only BLOCKED-EXTERNAL items remain open, each with exact owner steps.

---

## 16. Report formats

### 16.1 `PROGRESS-v3.md` (Conductor)
```
# Perfection Loop v3 — Progress
Updated: <ISO> · Wave: <A–Z> · Agents: <list with current unit>
| App | Phase (A–J) | Branch | P0 | P1 | P2 | P3 | Matrix % | Gallery L/D | Mini-site | Docs | Live ver | Auditor |
## Done (newest first)        ## In flight        ## Blocked-external        ## Decisions taken (N-…)
```

### 16.2 `<repo>/qa/perfection/STATE.md` (Builder)
Phase, branch, last commit, what's running, next 3 actions, how to reproduce the current check.

### 16.3 `<repo>/qa/perfection/ITEMS.md`
```
### <APP>-V3-<n> — <title>          severity: P0|P1|P2|P3     status: ⏳ OPEN | ✅ FIXED | ✅ VERIFIED | ⛔ BLOCKED-EXTERNAL | L (later, reason)
Where: <screen/state/theme/device/engine>  ·  Evidence: <before.png> → <after.png>
Cause: …   Fix: <commit>   Test: <spec/test name>   Auditor: <name/date/notes>
```

### 16.4 `<repo>/qa/perfection/APP-REPORT-v3.md`
Version/tag, live URL, gates table (§8.2 with numbers), Lighthouse table (routes × mobile/desktop × 4 categories), device-qa summary, matrix stats, gallery stats (shots per theme/device), items closed by severity, decisions applied, docs updated (list), remaining L items, BLOCKED-EXTERNAL steps.

### 16.5 `capricorn-tooling/docs/perfection-2026-10/FINAL-REPORT-v3.md`
Fleet table (all apps: version, gates, LH, matrix %, gallery, mini-site URL), before/after highlights (screenshots), totals (items by severity, screens audited, shots captured), decisions log, blocked-external owner checklist, recommended next program.

---

## 17. First actions (do these now, in this order)
1. Create PROGRESS-v3.md + LOCKS.md; write N-1 (mini-sites) into DECISIONS §6.
2. Phase 0 (branch merges, wip review plan, CI health, toolchain, baseline device-qa).
3. Launch Wave A in parallel: Gallery Engineer (viewer), Tooling Engineer (G16–G19), Hub Engineer (mini-site generator skeleton + `?app=` deep link), Builders on **TravelCap (TRV-V3-1 P0)**, **CookCap (CK-V3-1 P0)**, **IdeaCap (IDA-V3-1/2)**, plus an Auditor.
4. Keep the loop running until §15 is true. No questions. No early stop.
