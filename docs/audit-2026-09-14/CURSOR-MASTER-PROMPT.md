# CURSOR MASTER PROMPT — Capricorn Cap Fleet "Finish Program"

> **How the owner uses this file:** open Cursor (Agent mode) at `/Users/shamikhahmed/Projects/Cap/Cap-Apps` and paste this entire file. No scope line is needed — Cursor runs the whole Finish Program **one app at a time until every app reaches Tier 1** (§0, §16.1). Optional last line `START AT: <App>` to begin at a specific app. In any later session paste the file again with `RESUME` as the last line — Cursor continues from `docs/audit-2026-09-14/PROGRESS.md`. The owner answers parked questions by editing `docs/audit-2026-09-14/DECISIONS.md`; Cursor never waits for those answers.
>
> Evidence and scores behind every item: `docs/audit-2026-09-14/FLEET-AUDIT.md` (read the section for your scope before starting).

---

## 0. Program directive — read first (overrides anything below that conflicts)

1. **Goal: every app reaches Tier 1.** Tier 1 is defined in §16.1 (🟢 production-ready, hard numeric gates, evidence required). There are no lower tiers, no "good enough", no "frozen" apps. Aim above the bar (⭐) wherever it costs no stability.
2. **One app at a time.** Work the sequence in §15.0. Do not interleave apps. An app is finished only when §16.4 is met and its `APP-REPORT.md` is written; then move to the next app. The only cross-app work allowed while an app is in progress: shared foundation changes the current app needs (then re-run the verify command of every already-finished app and fix any regression before continuing).
3. **Never stop. Never idle.** Do not end a turn to ask "shall I continue?", do not wait for answers, do not pause after an item. When something is blocked, **park it and continue** (§4). When the listed backlog for the current app is exhausted, use the fallback queue (§5.2) — there is always more verified quality work until the app passes Tier 1. Wherever older text in this document says *stop*, *wait*, *ask*, *approval* or *proposal first*, it means **park and continue**. Wherever it says *SCOPE* / *in scope*, read *the current app*.
4. **Never compromise quality.** The forbidden shortcuts in §5.3 are absolute. If a gate can't be met honestly, the app is not Tier 1 yet — keep working or park with evidence; never fake, weaken or skip.
5. **Continuity.** Keep `docs/audit-2026-09-14/PROGRESS.md` current (§5.4) so any new session resumes exactly where you left off.
6. **Report.** Per-app `APP-REPORT.md` when each app completes; `docs/audit-2026-09-14/FINAL-REPORT.md` at the end, showing every issue found, what caused it, what was done, the evidence, and what remains (§17).
7. **Git is automatic (owner directive 2026-09-14).** Commit, push, merge to `main`, tag and trigger the existing GitHub Pages deploys yourself, following §19 — no asking. Wherever older text in this document says "do not push / tag / deploy / publish unless the owner says so" or "deploy only on owner command", §19 replaces it.
8. **The only actions you never take without the owner** (park them, keep working): App Store / Google Play submission, force-push or any history rewrite of pushed commits, deleting user data, permanently deleting anything outside a repo (moving to the archive is allowed, §18.4), irreversible data/encryption migrations, and final wording of legal / medical / mental-health / financial-advice / crisis content.

---

## 1. Your role and the quality bar

You are a senior product-engineering team in one agent: staff engineer, product designer, accessibility specialist, QA lead and platform-compliance reviewer. You are finishing a family of personal-product apps ("Caps") so each one feels designed, built, reviewed and tested by a world-class team (Apple / Google / Samsung quality bar) — **calm, fast, intentional, accessible, consistent, platform-native, and stable**.

Priorities, in order, when they conflict:
1. **Do not break working functionality or lose user data.**
2. Security and privacy correctness.
3. Accessibility.
4. Clarity of the user journey.
5. Visual polish.
6. Code elegance.

"Stable at the highest practical quality" beats "impressive". The smallest correct change wins. You are not paid by lines of code.

---

## 2. Workspace context

Root: `/Users/shamikhahmed/Projects/Cap/Cap-Apps` (not a git repo; each product folder is its own git repo).
Project memory ("Capricorn Brain", Obsidian): `~/Capricorn-Brain/01 Projects/<Name>.md`. **Warning:** `path_on_disk` values there currently say `/Users/shamikhahmed/Desktop/Cap-Apps/...` — the real path is the root above (fixed by FLT-01). CookCap's note is `Jia-Cooks.md`; SoulCap's note is `SoulCap-Therapy-App.md`; DeeFoodieApp has no note yet.
Each repo may have its own `CLAUDE.md` / `AGENTS.md` / `HANDOVER.md` — read them for the repo you touch; they contain repo-specific rules (e.g. TravelCap: "This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing Next code").
Shared tooling: `capricorn-tooling/` (symlinked as `shared/`, `scripts/`, `cap-agents/`) — includes `shared/testing/viewport-helpers.js`, `sync:design-system`, `audit:tokens`, `audit:truth`, `sync:versions`.

| Repo | What it is | Stack | Run | Verify / tests |
|---|---|---|---|---|
| AuraCap | Apple-ecosystem organizer PWA | React 19, Vite, Tailwind 4, three/GSAP/framer | `npm run dev` | `npm run lint && npm run build && npm run verify` (`test:e2e`, `gallery`) |
| CarCap | Offline garage PWA (MVP) | Vanilla JS, no bundler | `npm start` → :8790 | `npm run check && npm run verify` |
| CookCap | Family cookbook PWA | Next 15 static export, Motion, IndexedDB | `npm run dev` | `npm run typecheck && npm run lint && npm run gate:recipes && npm run gate:anti-2d && npm run gate:wood && npm run pages:build && npm run smoke:product` |
| DeeFoodieApp | Karachi food journal | Flutter (iOS target) + NestJS/Prisma/PostGIS | `docker compose up -d`; `cd api && pnpm start:dev`; `cd mobile && flutter run` | `cd mobile && flutter analyze && flutter test && flutter build ios --no-codesign`; `cd api && pnpm test && pnpm lint` |
| DeePonyCap | Collectible tracker PWA | Vanilla JS, Capacitor 7 | `npm run serve` | `npm test && npm run verify` |
| IdeaCap | Voice/typed idea capture | Expo SDK 57, RN 0.86 | `npm run start` / `npm run web` | `npm run typecheck && npm run verify`; `npx expo-doctor` |
| LedgerCap | PK wealth ledger PWA + Worker | Vanilla JS + bundle, Capacitor 7 | `npm run serve` | `npm run bundle && npm test && npm run test:a11y && npm run verify` |
| MasteryCap | Bilingual learning PWA (no store by owner decision) | Vanilla JS | `npx serve` or existing script | `npm run audit && npm run smoke && npm run e2e && npm run lighthouse && npm run verify` |
| PrismCap | Pass-and-play games PWA | Vanilla + Vite, Capacitor 7 | `npm run dev` | `npm run build && npm run verify` |
| PulseCap | Training PWA (PWA-only by owner decision) | Vanilla JS | `npm run serve` | `npm test && npm run verify && npm run device-matrix` |
| ScentCap | Fragrance wardrobe | React 19, Vite, Tailwind 4, Capacitor 8 iOS | `npm run dev` | `npm run lint && npm run build && npm run verify && npm run matrix`; `npm run build:cap && npm run cap:sync` |
| SoulCap | Self-regulation PWA in `docs/` (backend/mobile = lab, do not ship) | Vanilla JS | `npm run dev` | `npm run test:safety && npm run verify` |
| SteadyCap | Recovery PWA | Vanilla JS, Capacitor 7 | `npm run serve` | `npm test && npm run verify` |
| TravelCap | Travel organizer PWA | Next 16 static export, Dexie, shadcn | `npm run dev` | `npm run typecheck && npm run lint && npm run build:export && npm run verify` |
| VaultCap | Encrypted life-vault PWA | Vanilla JS, WebCrypto | `npm run serve` | `npm run audit:xss && npm run test:e2e && npm run test:a11y && npm run test:e2e:safari && npm run verify` |
| capricorn-lab / capricorn-os-next / shamikhahmed.github.io | Marketing "Capricorn OS" hub | Vite + three.js | `npm run dev` | `npm run build` (+ hub `npm test`) |

Version rule used by every vanilla/PWA repo (from their CLAUDE.md files): bump **`VERSION.json` + `window.APP_VERSION` + `sw.js` cache name + the SW register query string in `index.html` together**. Update `CHANGELOG.md` (and `changelog.html` where present), `HANDOVER.md`, and append a dated line to the Brain note's **Decisions** section after meaningful work.

---

## 3. Non-negotiable engineering rules

1. **Understand before changing.** Read the code path end to end (entry → state → render → persistence) before editing. Write a 3–6 line "current behavior" note in the loop log first.
2. **Smallest appropriate change.** No rewrites, no framework swaps, no architecture replacement, no mass reformatting, no renaming files "for cleanliness".
3. **No new dependencies** unless the item explicitly calls for one (e.g. replacing deprecated `expo-av` with `expo-audio`, vendoring SheetJS). If you believe one is needed, stop and ask (§4).
4. **Never change business logic you don't understand** — financial math (LedgerCap, VaultCap zakat/tax), safety kernels (SoulCap), SOS flows (SteadyCap), crypto (VaultCap), training/nutrition math (PulseCap), recipe gates (CookCap).
5. **Preserve data.** Any change to storage keys, IndexedDB schema, localStorage shape, export format or SW caching requires: migration code, a backward-compatible reader, a test that loads a fixture from the previous version, and an explicit note in the log. Never delete user data during migration.
6. **Preserve integrations**: Cloudflare Workers, GitHub Pages base paths (`/AppName/`), SW scopes, deep links, manifest shortcuts, export/import files.
7. **Backward compatibility** for shared tooling: changes in `capricorn-tooling/shared` must not break other repos; run at least the verify command of every repo that consumes the changed file.
8. **One concern per commit.** Conventional commit messages. Work on branch `finish/<app>` in each repo; commit at every green checkpoint and push automatically; merge to `main`, tag and deploy automatically when the §19 conditions are met. Never force-push, never commit directly to `main` outside the §19 merge step.
9. **No fake claims.** No "AI" wording for rule-based features; no invented metrics, testimonials or availability claims; no "OS" naming added to UI.
10. **Secrets:** never print, commit, or move secrets; never put keys in client code (`EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`, `window.*`).
11. **Tests are part of the change.** If you fix a bug, add a regression test that fails before and passes after (Playwright for web, `flutter test` for Flutter, Jest/RTL or Detox-free unit tests for RN where test infra exists; otherwise add the minimal harness and say so).
12. **Explain before any major change** (new module, new shared component, storage change, navigation change, removing a feature): write the proposal with alternatives + trade-offs in the log and in DECISIONS.md, **park it and continue** with other work (§4); implement once the owner answers.

---

## 4. Park-and-continue (never guess, never idle)

When any trigger below fires:
1. Write the question in `docs/audit-2026-09-14/DECISIONS.md` under **Open questions** using this format: `Q-<n> · <App> · <Item ID> · question · options A/B/C with trade-offs · your recommendation · what it blocks · what you did meanwhile`.
2. Do every safe preparatory part of the item that doesn't depend on the answer (reproduction, tests that capture current behavior, structure behind a feature flag defaulting to current behavior, draft copy clearly marked DRAFT). Never ship a guess as the final behavior.
3. Mark the item `⛔ PARKED (Q-<n>)` in the app's LOG.md and in PROGRESS.md.
4. **Immediately** continue with the next unblocked item for the same app (fallback queue §5.2). Do not end your turn.
5. At every item boundary, re-read DECISIONS.md; when an answer appears, un-park the item and finish it before the app is closed.
6. If, after the fallback queue is exhausted, the **only** remaining gaps for the app are parked items, write the app report with status `Tier 1 — pending owner decisions (Q-…)` and move to the next app; return to it the moment answers arrive.

Triggers:
- The item is marked **BLOCKED by D-xx** (see decision register below) and the decision is not recorded in `docs/audit-2026-09-14/DECISIONS.md`.
- A change would delete or migrate user data, change an export format, or change encryption.
- You find behavior that contradicts the audit (the audit may be wrong — report it, don't force the fix).
- A fix needs a new dependency, a new service, a paid API, or a network destination not already disclosed in the app's privacy page.
- Copy touches medical, mental-health, financial-advice, legal, or crisis content.
- You cannot reproduce a reported defect after two honest attempts.
- Tests fail for reasons unrelated to your change (pre-existing red) — report, don't "fix" by deleting tests.
- Anything would be submitted to a store, sent to an external service other than the git remotes and GitHub Pages deploys covered by §19, force-pushed, or would rewrite pushed history.
- A push is rejected (non-fast-forward with real conflicts, unrelated histories, auth failure) — never force; keep committing locally and park.

**Decision register** (owner fills answers into `docs/audit-2026-09-14/DECISIONS.md`; create the file with these headings if missing):
D-01 store submission plan (all apps reach Tier 1 regardless) · D-02 IdeaCap baseline (recover v2.0.0 or redo) · D-03 PulseCap 102 deleted files intent · D-04 DeePonyCap IP strategy · D-05 SoulCap crisis resources + clinical review · D-06 PrismCap game renames · D-07 TravelOS vs TravelCap, PrismOS remnants · D-08 VaultCap logo/LLM proxy opt-in or removal · D-09 LedgerCap data sources & store intent · D-10 DeeFoodieApp distribution (TestFlight private vs public) + auth provider · D-11 monetization / IAP · D-12 publisher identity, support email, privacy-policy host · D-13 website source of truth (capricorn-lab vs capricorn-os-next).

---

## 5. The loops

### 5.1 App loop (outer — one app at a time)

```
SELECT APP (§15.0) → BASELINE → ITEM LOOP until queue empty → FALLBACK QUEUE → FULL-PRODUCT AUDIT
→ RE-SCORE (§16.2) → gates pass? ── no ──► new items → ITEM LOOP again
                                 └─ yes ─► APP-REPORT.md → update PROGRESS.md → NEXT APP
```

1. **Select** the next app in §15.0 (or `START AT`, or the app recorded in PROGRESS.md on `RESUME`).
2. **Baseline** before touching code: branch `finish/<app>`; run every verify command and record pass/fail counts; run finish-matrix, axe and Lighthouse on primary routes; capture token/kill-list metrics (raw hex, sub-11px text, `!important`, `innerHTML` with user/remote data, native dialogs, emoji icons, `outline:none`); score the app with the §16.2 rubric. Save to `<repo>/qa/finish-loop/BASELINE.md` (these become the "before" numbers in the final report).
3. **Build the queue** for this app: its §15 items (P0 → P1 → P2), plus every baseline finding that fails a Tier 1 gate, each with an ID (`<APP>-NEW-<n>` for new findings), severity and "Done when".
4. **Run the item loop** (§5.5) on the queue in severity order.
5. **Fallback queue** (§5.2) when the queue is empty or everything left is parked.
6. **Full-product audit**: walk every screen and state in the app's inventory (FLEET-AUDIT §C + STATES.md) at 320, 375, 430, 768, 1440 in light/dark, keyboard-only and with a screen reader for primary journeys. Every defect found becomes a new item.
7. **Re-score** with §16.2. If any Tier 1 gate fails → add items → back to step 4. Repeat as many rounds as needed. There is no round limit.
8. **Close the app**: write `<repo>/qa/finish-loop/APP-REPORT.md` (format §17.1), commit on the finish branch, update PROGRESS.md, append the Brain Decisions line, then select the next app.

### 5.2 Fallback queue (use whenever you would otherwise stop)

Work these in order for the **current app**; each finding becomes an item run through §5.5:
1. Un-parked items whose answers arrived in DECISIONS.md.
2. Failing Tier 1 gates from the latest score (§16.1).
3. `STATES.md` gaps for primary journeys (§14).
4. finish-matrix failures (overflow, obscured controls, clipping) across all 15 viewports × 2 themes.
5. axe / Lighthouse / keyboard / screen-reader gaps.
6. Kill-list and token violations (FLEET-AUDIT §D.5) anywhere in the app, not just touched screens.
7. Copy sweep against §8 glossary and voice rules — every screen, dialog, toast, error and empty state.
8. Performance budget gaps (§6.5, §11).
9. Security/privacy gaps (§10): sinks, storage, network destinations vs privacy page.
10. Test coverage for every primary journey and every bug fixed.
11. Docs sync (CHANGELOG, HANDOVER, FEATURES, privacy page, store/PWA readiness pack).
12. A fresh full-product audit round (§5.1 step 6).

Only when all twelve are clean (or only parked items remain) may the app be closed.

### 5.3 Forbidden shortcuts (absolute — "no compromise")

- Skipping, deleting, weakening or `.skip`/`.only`-ing tests; loosening assertions; raising timeouts to hide flakiness (fix the race instead).
- Updating snapshots or golden screenshots without a recorded visual review of the diff.
- `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `any`, `// @flow off` or equivalent to get green.
- `!important`, `overflow: hidden`, `display: none`, `text-overflow: ellipsis` or shrinking text below tokens to make an overflow or collision "disappear" instead of fixing layout.
- Removing or hiding a feature, screen, or state to make a bug go away (unless the owner decided it in DECISIONS.md).
- Test-only branches in product code (the single allowed hook is `window.__APP_READY__`).
- Lowering a gate, budget or threshold in this document or in CI.
- Marking an item ✅ without the evidence required by §16.3, or claiming device/browser testing that didn't happen.
- Copy-pasting a fix into one screen when the same defect exists elsewhere in the app — fix the shared cause.
- Silencing console errors/warnings instead of fixing them.
- Declaring the app finished because the listed items are done — only the §16.1 gates decide.

### 5.4 Session continuity (so the program never loses its place)

Maintain `docs/audit-2026-09-14/PROGRESS.md` and update it at every item boundary and before any long operation:
```
Updated: <ISO time>
Current app: <App> (<n> of 16) · round <r>
Current item: <ID> · loop step <n of §5.5> · files in flight: …
Next 5 actions: 1… 2… 3… 4… 5…
Parked: Q-… (item IDs)
Apps completed: <App> (score, date) …
Apps pending decisions: <App> (Q-…)
Last green checkpoint commit per repo: <repo>@<sha>
```
Commit to the finish branch at every green checkpoint (verify passing) so no work is lost. On `RESUME` or any new session: read this prompt → PROGRESS.md → DECISIONS.md → the current app's LOG.md and BASELINE.md → continue from "Next 5 actions". If the environment lacks a tool (no Xcode, no simulator, no device, no network): record it, use the strongest available alternative (web build, CI workflow, `flutter build ios --no-codesign`, Playwright WebKit), mark exactly what remains unverified, and keep going.

### 5.5 Item loop (inner — mandatory for every item)

Keep a log per repo at `<repo>/qa/finish-loop/LOG.md` (create it). For **every** backlog item run:

```
AUDIT → PLAN → IMPLEMENT → TEST → VISUALLY REVIEW → FIX → RE-TEST → RECORD → NEXT
```

1. **Inspect** the current implementation (files, functions, CSS selectors, tests). Record "current behavior" and reproduce the defect (screenshot or failing test). If you cannot reproduce → §4.
2. **Choose** the next highest-priority unblocked item inside SCOPE (P0 before P1 before P2; Phase 0 first).
3. **Plan**: list files to change, what not to touch, the expected result, and the verification you will run. Keep the plan ≤ 15 lines.
4. **Implement** the smallest change.
5. **Regression check**: run the repo's verify command (§2) + the specific new test.
6. **Responsive check**: capture the affected screens at 320, 344, 375, 390, 430, 768, 1024, 1440 (and 2560 for desktop layouts) in light and dark. Use the Playwright matrix (§6.2). Look for overflow, clipping, collisions, overlapping fixed bars, truncated text, awkward whitespace.
7. **Accessibility check**: axe (0 serious/critical), keyboard walk (Tab order, visible focus, Esc closes sheets, focus returns), screen-reader names for every control you touched, 200% text size, reduced motion, forced colors (Windows) where CSS changed.
8. **Platform check**: iOS Safari tab + standalone PWA (safe areas, no browser back → in-app back present), Android Chrome (back gesture closes overlays first), desktop Chrome/Safari/Firefox.
9. **Check all affected screens and related components** (search for every usage of the component/selector/copy string you changed).
10. **Fix** any inconsistency you introduced or uncovered in the touched area.
11. **Re-test** steps 5–8.
12. **Record** in LOG.md: item ID, files changed, before/after screenshots paths, commands run with pass counts, remaining risks. Mark ✅ only when "Done when" is fully met.
13. **Next item.**
14. After the scope's items are done: run the **full-product audit** (§16) for each repo in scope, add any new findings as items, and continue.
15. **Never declare an application finished just because the listed changes were implemented. Perform another audit after implementation and continue fixing issues until the quality bar in §16 is reached or a stop-and-ask trigger fires.**

Log entry template:
```
### <ID> — <title>                                   status: ⏳/✅/⛔
Current behavior: …
Plan: files … | not touching … | expected …
Changes: <file:line summary>
Verify: verify=<pass/fail counts> · axe=<n violations> · matrix=<shots, overflow=0?> · manual=<iOS/Android/desktop notes>
Screens re-checked: …
Residual risk / follow-ups: …
```

---

## 6. Verification toolkit

### 6.1 Always
- Build + typecheck + lint (where the repo has them) must pass with **no new warnings**.
- Existing test suites must stay green; test count must not decrease.
- `git diff --stat` reviewed before each commit: no unrelated files, no generated bundles unless the repo commits them intentionally (LedgerCap `ledgercap.bundle.js`, ScentCap `ios/App/App/public` after `cap:sync`).

### 6.2 Responsive matrix (add once, reuse everywhere)
Create `capricorn-tooling/shared/testing/finish-matrix.js` exporting:
```js
export const FINISH_VIEWPORTS = [
  { name: 'tiny-se1', width: 320, height: 568 },
  { name: 'fold-cover', width: 344, height: 882 },
  { name: 'android-s', width: 360, height: 780 },
  { name: 'iphone-se3', width: 375, height: 667 },
  { name: 'iphone-16', width: 393, height: 852 },
  { name: 'iphone-17', width: 402, height: 874 },
  { name: 'pixel', width: 412, height: 915 },
  { name: 'promax', width: 440, height: 956 },
  { name: 'phone-land', width: 844, height: 390 },
  { name: 'fold-open', width: 673, height: 841 },
  { name: 'ipad-mini', width: 744, height: 1133 },
  { name: 'ipad-land', width: 1180, height: 820 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'wide', width: 2560, height: 1440 },
];
```
and a helper `assertNoHorizontalOverflow(page)` (`document.documentElement.scrollWidth <= innerWidth + 1`), `assertNotObscured(page, selector)` (element's center point `elementFromPoint` returns the element or a descendant — use to catch tab bars/banners covering content), and `waitForAppReady(page)` (waits for splash removal / app-specific ready flag; each repo exposes `window.__APP_READY__ = true` once the first real screen renders).
Each web repo adds `tests/finish-matrix.spec.*` iterating primary routes × viewports × light/dark, saving to `qa/finish-loop/shots/<route>/<viewport>-<theme>.png`, failing on overflow or obscured primary CTA.
Emulation: `page.emulateMedia({ reducedMotion: 'reduce' })`, `{ colorScheme: 'dark' }`, `{ forcedColors: 'active' }`; 200% text: `page.addStyleTag({ content: 'html{font-size:200%!important}' })` for rem-based layouts.
Slow/offline: Playwright `context.setOffline(true)`; slow network via CDP `Network.emulateNetworkConditions` (latency 400 ms, 400 kbps down) in Chromium projects.

### 6.3 Accessibility
`@axe-core/playwright` on every primary route in both themes (ScentCap already has it — copy its pattern). Zero serious/critical. Lighthouse accessibility ≥ 95 on primary routes (MasteryCap already has a lighthouse script — copy its pattern).
Flutter: widget tests with `meetsGuideline(textContrastGuideline)`, `androidTapTargetGuideline`, `iOSTapTargetGuideline`, `labeledTapTargetGuideline` for Home, Add Visit, Journal, Map.
React Native: every `Pressable`/`TouchableOpacity` has `accessibilityRole` + `accessibilityLabel`; run the app with iOS Accessibility Inspector and Android Accessibility Scanner; list results in the log.

### 6.4 Manual device script (when no device lab is available)
For each changed journey, record in LOG.md: iPhone (Safari tab + Add to Home Screen standalone) at default and largest text size with VoiceOver on for one pass; Android Chrome (installed PWA) with TalkBack for one pass; desktop Safari + Chrome + Firefox at 1366 and 2560. If a device is unavailable, say so explicitly — never claim it was tested.

### 6.5 Performance
Web: Lighthouse mobile (simulated Moto G Power, Slow 4G) on primary route before/after; record LCP, INP (or TBT proxy), CLS, JS transferred. Budgets: LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.1, initial app-shell JS ≤ 170 KB gzip. Flutter: `flutter run --profile` + DevTools frame chart on Home scroll and Journal page flip (no frames > 16 ms steady). Expo: cold start measured on a release build.

---

## 7. Cap Foundation design system (implement once, adopt per app)

### 7.1 Where it lives
`capricorn-tooling/shared/design/`:
- `tokens.json` (source of truth) → generated `cap-foundation.css`, `tailwind-theme.css`, `cap_tokens.dart`, `tokens.ts` via a small Node script `scripts/build-design-tokens.mjs` (no new dependency; plain Node).
- Per app: `brand.css` (or Tailwind `@theme` override / Dart extension / TS override) containing only `--accent`, `--accent-contrast`, `--accent-text`, optional `--font-display`, optional atmosphere. Nothing else.
- Extend existing `audit:tokens` to fail CI on raw hex colors, raw `z-index` numbers, `font-size` < 11px, `user-scalable=no`, and `outline: none` without a `:focus-visible` replacement, **only for files changed on the branch** (so legacy code migrates incrementally without blocking).

### 7.2 Tokens (exact values)
- **Spacing:** 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px → `--space-0 … --space-11`. Screen margin 16 (<400w) / 20 (400–699) / 24 (≥700). Card padding 16. Section gap 24–32. Row min-height 44.
- **Radius:** `--radius-xs 6` · `--radius-sm 10` · `--radius-md 14` · `--radius-lg 20` · `--radius-full 999`.
- **Type** (size/line-height/weight): largeTitle 34/41/700 · title1 28/34/700 · title2 22/28/600 · title3 20/25/600 · headline 17/22/600 · body 17/22/400 (web may use 16/24) · callout 16/21/400 (all inputs ≥ 16px) · subhead 15/20/400 · footnote 13/18/400 · caption1 12/16/500 · caption2 11/13/500 (tab labels only). Desktop ≥1024: largeTitle 40/48, body 16/24. Numbers: `font-variant-numeric: tabular-nums`.
- **Families:** `--font-ui: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Optional `--font-display` for largeTitle/title1 only. Web Dynamic Type: `@supports (font: -apple-system-body) { html { font: -apple-system-body; } }` and rem units.
- **Banned in UI text:** pixel fonts, handwriting fonts, monospace labels, uppercase letter-spacing > 0.04em, emoji as icons.
- **Color roles (light + dark):** `--bg --bg-grouped --surface --surface-2 --separator --text --text-secondary (≥4.5:1 on surface) --text-tertiary (≥3:1, non-essential) --accent --accent-contrast --accent-text --success --success-text --warning --warning-text --danger --danger-text --focus --scrim --material-bar`. Verify every pair with a contrast script (add `scripts/contrast-check.mjs` in tooling; WCAG formula, no dependency).
- **Elevation:** `--elev-0 none` · `--elev-1 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)` · `--elev-2 0 8px 24px rgba(0,0,0,.12)`. Dark: surface steps instead of shadows.
- **Z-index:** base 0 · sticky 10 · tabbar 20 · fab 30 · banner 40 · sheet 50 · modal 60 · toast 70 · splash 80.
- **Motion:** press 120ms · small 200ms · sheet 280ms · page 350ms · `--ease-standard cubic-bezier(.2,.8,.2,1)` · `--ease-exit cubic-bezier(.4,0,1,1)`. Reduced motion: opacity-only ≤120ms, no parallax/ambient/page-curl.
- **Touch:** ≥44×44 CSS px (web/iOS), ≥48×48 dp (Android native), ≥8px between targets.
- **Material bar:** `background: color-mix(in srgb, var(--surface) 85%, transparent); -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px); border-top: 0.5px solid var(--separator)`; solid `var(--surface)` under `@media (prefers-reduced-transparency: reduce)` and `@supports not (backdrop-filter: blur(1px))`.

### 7.3 Components (framework-appropriate implementations; same behavior everywhere)
- **Button** — variants primary/secondary/tertiary/destructive; heights 44/50; sentence case; ≤3-word label; no arrow glyphs in labels; one primary per screen region; loading state keeps width and shows spinner + `aria-busy`.
- **IconButton** — 44×44, glyph 20–24, required accessible name.
- **Switch** — `role="switch"`, `aria-checked`, label click toggles.
- **SegmentedControl**, **ListRow** (leading icon 28, title headline, subtitle subhead, trailing value/chevron, min 44), **Card** (radius-md, padding 16, elev-1 light, never nested).
- **Sheet** — handle, radius-lg top, `max-height: 90dvh`, bottom safe-area padding, drag/Esc/backdrop dismiss (except destructive-in-progress), focus trap, focus moves to sheet title (`tabindex=-1`) and returns to invoker, Android back closes it (history state).
- **Banner (inline)** — info/warning/danger; icon + one sentence + ≤1 action; sits in flow under the nav bar; never `position: fixed` over content.
- **Toast** — above tab bar + safe area; 4 s; `role="status"`; optional Undo.
- **ConfirmDialog** — replaces every `window.confirm`; title states the consequence ("Delete this trip?"); body says what is lost; destructive button names the action ("Delete trip"); Cancel is default focus.
- **EmptyState** — icon 48, title ≤5 words, one sentence, one action.
- **ErrorState** — what happened (plain), what to do, Retry; technical detail only behind "Details".
- **Skeleton** — shape-matched; no shimmer under reduced motion.
- **TabBar** — ≤5 items, SVG icons, caption2 labels sentence case, material bar, height 49 + safe area, active = accent icon + label, `aria-current="page"`.
- **Sidebar** — ≥700px (fleet decision; MasteryCap keeps tabs by owner decision), width 240, icons + labels.
- **DemoBanner** — inline: "Sample data" + button "Use my data" (app-specific noun allowed: "Use my collection").
- **Splash** — first launch only, ≤600 ms, skipped under reduced motion; sets `window.__APP_READY__` when first real screen renders.

### 7.4 Adoption order per app
1. Import tokens + brand file (no visual change intended; screenshot diff should be near-identical).
2. Replace shared primitives in touched screens only (TabBar, Banner, ConfirmDialog, Switch, Button).
3. Remove kill-list patterns in touched screens (§FLEET-AUDIT D.5).
4. Migrate remaining screens in P2, file by file, with before/after screenshots.

---

## 8. Copy standards

Voice: plain, calm, specific, second person, sentence case, no exclamation marks, no internal metaphors in controls. Buttons are verbs ("Add car", "Save visit", "Refresh prices"). Errors: *what happened* + *what to do* ("Couldn't load prices. Check your connection and try again."). Empty states: title + one sentence + action ("No trips yet" / "Plan your first trip to see it here." / "New trip"). Destructive: name the object and irreversibility ("Erase all data? This removes everything stored on this device and can't be undone."). Dates: `Intl.DateTimeFormat` with the user locale ("1 Jul 2026"). Money: `Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })` for totals; show paisa only for unit prices. Never show app version outside Settings → About. Never label rules-based features as AI.

Replacement glossary (apply wherever the string appears in UI; keep internal code names):
| Current | Use |
|---|---|
| Control Center (AuraCap) | Overview |
| Frosted DNA · private on device | Your setup at a glance. Stored only on this device. |
| Digital DNA / Aura Score (UI labels) | Setup score (explain in info sheet) — only after owner approves naming |
| demo wardrobe (AuraCap) | sample data |
| Start mine / Start my own | Use my collection / Use my apps / Use my data |
| Smart Assistant analyzes… | (describe the action) "Summarize", "Find next steps" |
| Hub / P&L / Analyze (LedgerCap tabs) | Home / Performance / Research |
| Your wealth · v3.27.0 | Your wealth |
| 100% of holdings on seed/fallback prices (snapshot …) | Prices are from {date}. They update during market hours (Mon–Fri, 9:30–15:30 PKT). |
| 0/1 med slots · 0/1 showing up today | Medicines today: 0 of 1 taken |
| 12-DAY CHECK-IN STREAK / 12d showing up | Checked in on 12 of the last 14 days |
| You missed Nicotine patch. No pressure — tap to check off when ready. | Nicotine patch · due 08:00 — [Taken] [Skip] |
| One-tap help · Craving protocol · breathe · act · survive | Having a craving? · Breathe, do one small thing, reach out. |
| Demo mode — Alex recovery profile in isolated storage. | Sample profile (Alex). Your data isn't affected. |
| Hello, Learner (no name) | Today |
| Cover title becomes *YourName Cooks*. Change later from the ··· menu. | We'll call it *{Name} Cooks*. You can change this in Settings. |
| START WORKOUT / CAN'T TRAIN TODAY? | Start workout / Can't train today? |
| Collector Mode — Clean catalog view — less sparkle, more data | Compact view — More per row, fewer effects. |
| GLOVEBOX · KEY FOB (CarCap splash) | (remove) |
| TravelOS | BLOCKED by D-07 |
| PrismOS (manifest) | PrismCap |
| All models supported (PrismCap) | (remove with the device gate) |

---

## 9. Platform requirements

**All web apps (PWA):** `viewport-fit=cover`; no zoom lock; `env(safe-area-inset-*)` on nav bar, tab bar, sheets, toasts, FAB, lock screens; `100dvh` with `100vh` fallback; inputs ≥16px; in-app back on every pushed screen (standalone iOS has no browser back); Android back closes overlays before navigating (push a history entry when a sheet opens); `theme-color` for light + dark; manifest `name`/`short_name` match the product name, maskable icons present, `display: standalone`, no `orientation` lock for reading apps; SW: HTML network-first, static cache-first, versioned cache, update prompt ("A new version is ready — Reload") instead of silent reload mid-task.

**iOS native (Capacitor / Expo / Flutter):** build with **Xcode 26 + iOS 26 SDK** (required for uploads since 28 Apr 2026); deployment target stays as configured unless a dependency requires more; `PrivacyInfo.xcprivacy` at app level declaring required-reason APIs actually used (UserDefaults, file timestamps, disk space, boot time) and data collection (none, unless stated); `ITSAppUsesNonExemptEncryption` set correctly (VaultCap: uses standard encryption → owner confirms exemption, D-12 legal); every permission string specific ("ScentCap uses your location once to show today's weather. Your location isn't stored."), requested in context only; Dynamic Type honored; Dark Mode; no web-view pinch/bounce artifacts (`contentInset: automatic`, disable overscroll background mismatch by setting `backgroundColor` to page `--bg`); haptics via `@capacitor/haptics` / `expo-haptics` / `HapticFeedback` only for confirmations and selection changes.

**Android native (if D-01 includes Android):** `targetSdk 36` (required for updates since 31 Aug 2026; Capacitor 7 defaults to 35 → upgrade path must be approved), edge-to-edge with insets, predictive back enabled and tested (IdeaCap currently disables it), Photo Picker instead of `READ_MEDIA_IMAGES`, 16 KB page-size compatible native libs, notification permission (API 33+) in context, Data safety form inputs documented in `docs/store/PLAY-DATA-SAFETY.md`.

**Store metadata pack** per native app in `docs/store/`: `APP-STORE.md` (name ≤30, subtitle ≤30, promotional text, description, keywords, support URL, privacy URL, age-rating answers, review notes incl. demo credentials), `PRIVACY-LABELS.md` (every data type × purpose × linked/tracking), `SCREENSHOTS.md` (6.9" and 13" iPad sizes captured from the real app, no marketing overlays claiming features that don't exist).

---

## 10. Security & privacy requirements
- No secrets in client bundles; add `gitleaks` (or a Node regex scanner in tooling, no dependency) to every repo's CI.
- No third-party runtime scripts in product apps; vendor with pinned version + integrity note; keep `script-src 'self'`.
- All external network destinations listed in the app's privacy page; any new destination → §4.
- Escape all user/remote strings rendered via `innerHTML` (text and attribute contexts) or switch to `textContent`/DOM APIs; add a test that injects `"><img src=x onerror=alert(1)>` into each user-editable field of touched screens and asserts no script execution.
- Sensitive-data apps (SoulCap, SteadyCap, TravelCap documents, VaultCap) get "Export my data" and "Erase all data" with ConfirmDialog; exports labeled sensitive.
- Fixtures, galleries and tests use fictional names only.
- Logs: no `console.log` of user data in production builds.

## 11. Performance requirements
Budgets from §6.5. Lazy-load heavy libraries on interaction (tesseract, leaflet, recharts, three, xlsx, pdf). No decorative WebGL in product apps. Images with explicit width/height, modern formats, lazy below the fold. Measure before and after every perf item; if an optimization doesn't move the metric, revert it.

## 12. Accessibility requirements
WCAG 2.2 AA: contrast (4.5:1 text, 3:1 UI/large text), text resize 200% without loss, reflow at 320px, focus visible (2px `--focus` ring, 2px offset), target size ≥24px minimum (fleet rule 44px), keyboard operability, names/roles/values, status messages via live regions, no color-only meaning, motion respects reduced motion, languages marked (`lang="ur"` + `dir="rtl"` for Urdu nodes, `lang="ur-Latn"` for Roman Urdu), error identification with text + `aria-invalid` + `aria-describedby`.

## 13. Reliability requirements
Every async action: loading state (after 300 ms), success feedback, failure message + retry, idempotent retry, no double-submit (disable while pending). Interrupted operations (tab closed mid-import/migration) must resume or roll back cleanly — add a test for each import/migration you touch.

## 14. State coverage matrix (a feature is not finished until these are designed and tested)
For each **primary journey** of each app in scope, create `qa/finish-loop/STATES.md` with a row per state and a screenshot or test reference: first use · empty · loading · success · error · offline · no results · partial data · permission denied · expired session (if accounts) · invalid input · destructive confirmation · network failure · server failure (5xx / Worker down) · slow network · interrupted operation. Mark N/A with a reason.
Primary journeys (minimum):
AuraCap: import apps → see overview → organize. CarCap: add car → log service → reminder. CookCap: onboard → open recipe → cook mode → shopping list. DeeFoodie: open Home → log visit with photo → see journal. DeePony: add pony with photo → wishlist. IdeaCap: record → transcript → save → find later. LedgerCap: add holding → refresh prices → performance. MasteryCap: start session → complete lesson → records export. PrismCap: pick game → players → play → exit. PulseCap: start workout → log set → finish → progress. ScentCap: add bottle → today's pick → wear. SoulCap: check-in → technique → journal → help flow. SteadyCap: add medicine → take/skip → SOS flow. TravelCap: create trip → add flight/transit → scan document. VaultCap: set PIN → add account → lock/unlock → export.

---

## 15. Backlog

### 15.0 Execution sequence (one app at a time)

| Step | Work | Exit condition |
|---|---|---|
| A | **Phase 0 — fleet truth + must-never-ship hotfixes** (the only fleet-wide step, because these are security/data-loss risks): FLT-00…FLT-08, IDEA-P0-01 (client AI keys), LDG-P0-01 (public CORS proxies), VLT-P0-01 (runtime CDN scripts), SOUL-P0-01 (real names in fixtures), DFD-P0-03 (bind DB ports to localhost / production auth guard). | Each item ✅ or ⛔ PARKED with evidence |
| B | **Foundation** FND-01…FND-06 (tokens, contrast check, shared components, framework adapters). | preview page passes axe in light/dark/reduced motion |
| 1 | SoulCap | §16.4 met |
| 2 | ScentCap | §16.4 met |
| 3 | MasteryCap | §16.4 met |
| 4 | CookCap | §16.4 met |
| 5 | VaultCap | §16.4 met |
| 6 | PulseCap | §16.4 met |
| 7 | SteadyCap | §16.4 met |
| 8 | TravelCap | §16.4 met |
| 9 | LedgerCap | §16.4 met |
| 10 | AuraCap | §16.4 met |
| 11 | CarCap | §16.4 met |
| 12 | PrismCap | §16.4 met |
| 13 | DeePonyCap | §16.4 met |
| 14 | DeeFoodieApp | §16.4 met |
| 15 | IdeaCap | §16.4 met |
| 16 | Hub / capricorn-lab / capricorn-os-next (catalog must reflect the finished apps) | §16.4 met |
| C | **Fleet re-verification**: re-run every app's Tier 1 gates (shared foundation evolved during the program); fix any regression inside the affected app's loop; revisit apps marked "pending owner decisions" whose answers have arrived. | every app passes §16.1 again |
| D | **FINAL-REPORT.md** (§17.2). | report complete |

Rules: within an app, work P0 → P1 → every P2 item needed for a Tier 1 gate → fallback queue → full-product audit → re-score, repeating until Tier 1. P2 is **not optional** when a gate depends on it. P3 only after step D and only if the owner asks. The per-app item lists below are the starting queue, not the finish line.

Format per item — **Inspect** · **Change** · **Don't touch** · **Done when** · **Verify**.

### Phase 0 — Fleet truth (do first, in every repo)

**FLT-00 Baseline.** Inspect `git status`, `git log -1`, `git remote -v`, upstream tracking for every repo. Change: create branch `finish/phase-0` in each clean repo; for dirty repos (PulseCap, ScentCap: 2 files, capricorn-tooling: 1 file) do **not** stash, discard or merge — record the dirty file list in `docs/audit-2026-09-14/BASELINE.md`, then preserve the exact pre-existing state by committing it on a separate branch `preserve/pre-finish-2026-09-14` and pushing that branch (never merged; `main` untouched). Start `finish/<app>` from `origin/main`; for PulseCap park D-03 before porting anything from the preserve branch. Don't touch: remotes, tags, history. Done when: BASELINE.md lists every repo with branch, HEAD, dirty files, upstream status. Verify: re-run commands, diff against file.

**FLT-01 Brain paths.** Inspect each Brain note's `path_on_disk` and `Path:`/`cd` lines. Change (vault edits allowed only for paths, versions, "Current focus" and appended Decisions lines — never delete or rewrite existing notes): replace `/Users/shamikhahmed/Desktop/Cap-Apps/` with `/Users/shamikhahmed/Projects/Cap/Cap-Apps/`; CookCap (`Jia-Cooks.md`) → `/Users/shamikhahmed/Projects/Cap/Cap-Apps/CookCap`; add `01 Projects/DeeFoodieApp.md` and index line. Don't touch: Decisions history. Done when: every note resolves to an existing folder (`test -d`). Verify: script loop over notes.

**FLT-02 PulseCap deletions (BLOCKED by D-03).** Inspect `git -C PulseCap status`, compare deleted root files with `PulseCap/docs/*`. Change after D-03: either restore (`git restore <files>`) or commit the move with `git mv` semantics and update references; restore `.github/workflows/ci.yml` and `.gitignore` in any case. Done when: clean tree, CI workflow present, `docs/CLAUDE.md`/root `CLAUDE.md` version = VERSION.json. Verify: `npm test && npm run verify`.

**FLT-03 IdeaCap baseline (BLOCKED by D-02).** Inspect: `git -C IdeaCap branch -a`, `git ls-remote --heads origin`, search other machines/backups named in D-02. Change: check out the approved baseline; update `app.json` version, Brain note "Current focus" to match reality. Done when: code, `app.json`, FEATURES.md and Brain note agree on version and capabilities.

**FLT-04 Upstream tracking.** AuraCap, PulseCap, shamikhahmed.github.io: set upstream to `origin/main` only if `git fetch` shows histories match; if the local repo is a restore snapshot with unrelated history, stop and report (never force-push). Done when: `git status -sb` shows tracking or a documented exception.

**FLT-05 Quarantine.** Move (don't delete) `shamikhahmed.github.io-backup-*` and `capricorn-os-next/.git.broken-20260911013611` to `~/Archive/Cap-Apps/2026-09-14/` (pre-approved by owner directive; follow §18.4 inventory rules first). Remove `DeePonyCap/releases/` from Pages output (keep in git history if needed). Done when: workspace contains only live repos; deploy scripts don't reference backups.

**FLT-06 Version single source.** For each vanilla repo add a check to `npm run verify` (or tooling `audit:truth`) that asserts `VERSION.json.version === window.APP_VERSION === sw.js cache suffix === register query === package.json version (where present) === CLAUDE.md "Version"`. Fix drift found today: CarCap (package 0.1.1 / VERSION 0.2.2 / CLAUDE 0.2.0), PulseCap docs/CLAUDE.md 6.34.0, LedgerCap heading shows v3.27.0, IdeaCap app.json vs Brain. Done when: check passes in all repos.

**FLT-07 Gallery harness truth.** Inspect CarCap and TravelCap gallery specs (they captured splash). Change: add `window.__APP_READY__` in each app after first real screen renders; `waitForAppReady` in gallery/matrix specs of all repos. Done when: regenerated CarCap `mobile-01-today.png` and TravelCap `mobile-01-dashboard.png` show real screens. Verify: open images.

**FLT-08 CI guards.** Add secret scan + changed-file token audit (§7.1) + `finish-matrix` (§6.2) to each repo's CI workflow (create workflow where missing: PulseCap after FLT-02, hub). Don't make legacy violations block; only changed files. Done when: CI config present and passing locally via `act` or equivalent dry run documented.

**FND-01…06 Foundation.** FND-01 create `capricorn-tooling/shared/design/tokens.json` + build script + generated outputs (§7.1–7.2). FND-02 contrast-check script, run on every app's brand colors, write report. FND-03 shared web primitives as framework-free CSS + tiny JS (Sheet focus trap/back handling, ConfirmDialog, Toast, Banner, Switch) in `shared/design/components/` usable by vanilla apps. FND-04 React wrappers for AuraCap/ScentCap/CookCap/TravelCap (inside each app's `src/components/ui/`, consuming the same tokens — no new UI library). FND-05 Dart `ThemeExtension` for DeeFoodie. FND-06 RN theme for IdeaCap. Done when: each output builds, a demo page `shared/design/preview.html` shows all components in light/dark/reduced-motion, axe passes on it.

### IdeaCap
**IDEA-P0-01 Remove client-side AI keys.** Inspect `src/services/ai.ts` (lines ~3–4, 225, 252, 376–402), `.env.example`, any UI toggles for cloud AI. Change: delete cloud provider calls and `EXPO_PUBLIC_*_API_KEY` usage; keep deterministic local analysis; remove keys from `.env.example`; update FEATURES.md honesty line; if owner later wants cloud AI it must be a server proxy with auth (separate proposal). Don't touch: note storage, recording. Done when: `grep -R "EXPO_PUBLIC_.*KEY\|api.openai.com\|api.anthropic.com" src App.tsx` returns nothing; web export bundle grep returns nothing. Verify: `npm run typecheck`, `npx expo export --platform web` then grep `dist/`. Note in log: owner must rotate any key ever used.
**IDEA-P0-02 Audio library.** Inspect expo-av usage in `RecordScreen.tsx`, `NoteDetailScreen.tsx`, `dictation.ts`. Change: migrate to `expo-audio` (SDK 57-compatible version via `npx expo install expo-audio`), align `expo-speech-recognition` to the SDK-compatible version via `npx expo install`; keep permission copy. Done when: `npx expo-doctor` clean; record → playback works on iOS simulator, Android emulator and web. Verify: manual script + typecheck.
**IDEA-P0-03 Privacy & support.** Add `docs/privacy.html` (data stays on device, microphone/speech purpose, no analytics, no third parties after P0-01, contact = D-12) and support page; link both from Settings/About. Done when: pages exist and are reachable in-app.
**IDEA-P1-01 Theme:** `userInterfaceStyle: "automatic"`; light + dark tokens (FND-06); verify contrast. **IDEA-P1-02 A11y:** labels/roles/hints for every control; Dynamic Type (`allowFontScaling` default, `maxFontSizeMultiplier` 1.6 only on tab/segment labels); reduce motion. **IDEA-P1-03 States:** mic denied (explain + "Open Settings"), speech unavailable (type instead), recording interrupted by call (save partial), storage full, empty board, search no results. **IDEA-P1-04 Copy:** "Cork board" → "Ideas"; "Sticky inspector" → "Details"; "Chat with this idea" → "Ask about this note"; placeholder → "Type or paste your idea". **IDEA-P1-05 Android:** remove `predictiveBackGestureEnabled: false` and test back on every screen. **IDEA-P1-06 Tests:** minimal Jest + RN Testing Library for storage and NoteCard (propose first — new dev deps).

### DeeFoodieApp
**DFD-P0-01 iOS purpose strings.** Inspect `mobile/ios/Runner/Info.plist`, `near_me_provider.dart`, `profile_prefs_provider.dart`, any camera/file picker/audio use. Change: add `NSLocationWhenInUseUsageDescription` ("DeeFoodie uses your location to show places near you. Your location isn't shared."), `NSPhotoLibraryUsageDescription` ("Choose photos to add to your visits."), `NSCameraUsageDescription` ("Take photos of your food and places for your journal.") — only for APIs actually used; `CFBundleDisplayName` → "DeeFoodie" (confirm with owner). Done when: fresh install on simulator → tap Near me and add photo → no crash; denial shows designed state. Verify: `flutter build ios --no-codesign`, simulator run.
**DFD-P0-02 Venue photo integrity.** Inspect `build-static-photo-map.mjs`, `build-mobile-archive.mjs`, Home "Tonight" card widget. Change: a photo may render for a venue only if it is linked to that venue id (or its chain) with a license/attribution field; otherwise render a cuisine illustration tile; chips on photos use dark scrim. Don't hand-edit `archive.json` (regenerate via scripts). Done when: a test asserts every Home/Explore card photo has `venueId` match or is a placeholder; attribution visible in eatery gallery. Verify: `flutter test`, screenshots.
**DFD-P0-03 Backend exposure (BLOCKED partly by D-10).** Inspect `docker-compose.yml` port bindings, auth middleware. Change: bind Postgres/Redis to `127.0.0.1`; refuse to start API with stub auth when `NODE_ENV=production`; document tunnel rules. Done when: compose binds localhost; e2e/unit test for guard.
**DFD-P0-04 Privacy policy + data deletion design.** Privacy page (location, photos, visits, who can see them), in-app link; if accounts ship (D-10): delete-account flow (Settings → Account → Delete account → ConfirmDialog → server purge incl. photos) + test.
**DFD-P1-01 Typography:** Caveat only for one decorative heading per screen; tab labels/stat captions Inter; test Text scale 1.0/1.3/2.0 on Home, Add Visit, Journal. **DFD-P1-02 Home copy/data:** H1 "Your Karachi"; reconcile eatery count; rupee/wallet icon; label every stat tile; 2×2 grid fits at 320–375. **DFD-P1-03 Semantics:** labels for icon buttons, map pins summary, page-flip alternative navigation (buttons) + reduced motion disables curl. **DFD-P1-04 States:** location denied/services off, offline (demo archive), sync queue failed, photo upload failed/retry, duplicate eatery warning, closed venue. **DFD-P1-05 EXIF:** strip GPS from photos before upload unless user opts in.

### VaultCap
**VLT-P0-01 Import libraries.** Inspect `js/ui.js:1515–1570`, `js/core/lazy-loader.js:30–60`, `vendor/`, CSP in `index.html:10`. Reproduce: import an .xlsx and a .docx and scan a QR with CSP active in Chromium + WebKit; record console CSP errors. Change: vendor pinned builds (SheetJS ≥0.20.2 from the official SheetJS distribution — confirm license note; mammoth; jsQR; qrcode) into `vendor/` with version + SHA-256 in `vendor/README.md`; load same-origin; move parsing of untrusted files into a Web Worker with size limit (e.g. 10 MB) and timeout; show ErrorState on failure. Don't touch: CSP `script-src 'self'`. Done when: import works in Chromium/WebKit/Firefox; no external script requests (Playwright request log assertion). Verify: `npm run test:e2e`, `npm run audit:xss`, new import spec.
**VLT-P0-02 Network features opt-in (BLOCKED by D-08).** Inspect `js/modules/logo-engine.js:17–110`, `js/config/llm-bundled.js`, `js/modules/ai-import.js`, `js/modules/llm-assist.js`. Change per D-08: default logo engine to local monograms; network logo fetch only after Settings toggle with explanation; LLM import behind explicit per-import consent sheet listing what is sent; replace legacy model id with `claude-haiku-4-5` if kept; update privacy page + CSP `connect-src`. Done when: with defaults, a full click-through makes zero requests to `workers.dev` (Playwright assertion).
**VLT-P0-03 PIN hardening proof.** Inspect `js/core/pin.js`, `vault-db`/crypto modules, onboarding-flow, store-engine default state. Change: document KDF algorithm + parameters in `SECURITY.md`; if PBKDF2 < 600,000 iterations (SHA-256) propose an upgrade with migration (§4 stop — crypto change); add tests: (a) fresh profile killed mid-onboarding → PIN 123456 must not unlock a non-demo vault; (b) lockout escalation after failures; (c) decoy PIN never reveals real data. Don't change crypto without approval. Done when: tests green and SECURITY.md accurate.
**VLT-P1-01 Remove marketing JS from app shell** (`capricorn-cinematic.js`, `capricorn-scene.js`, `capricorn-pitch.js`, `capricorn-deck-pro.js`, `capricorn-premium-nav.js`) from `index.html` if unused by product screens (prove via coverage). **VLT-P1-02 Foundation adoption on lock, onboarding, dashboard, settings** (tokens, Switch, ConfirmDialog replacing 16 `confirm()`, Banner, Toast). **VLT-P1-03 Type floor:** eliminate sub-11px declarations on those screens (297 fleet-high). **VLT-P1-04 Demo sheet:** focus title not Close; SVG icon; ordered list; "Start exploring". **VLT-P1-05 Reviewer notes + App Store pack** (§9) — draft only. **VLT-P1-06 innerHTML audit** on finance hubs and import preview.

### LedgerCap
**LDG-P0-01 Remove public CORS proxies.** Inspect `js/ledgercap.bundle.js` ~5985–6350 and the source modules that generate it (`npm run bundle`). Change: delete `api.allorigins.win` / `corsproxy.io` usage; route Yahoo/PSX through the owned Worker only; validate numeric fields (finite, positive, sane range vs last close ±20%) before persisting; on failure keep last-good price and show freshness line. Edit source modules, then rebuild the bundle — never hand-edit the bundle only. Done when: grep shows no public proxy hosts; offline and Worker-down tests pass. Verify: `npm run bundle && npm test && npm run verify`.
**LDG-P0-02 Header collision.** Inspect Hub header markup/CSS. Change: row 1 large title + "…" menu; row 2 single-line market line (§FLEET-AUDIT C LedgerCap table); move language, currency, theme into Settings; remove fullscreen button; heading "Your wealth" (no version). Done when: no overflow/obscured elements at 320–440 in EN, اردو (RTL) and Roman Urdu; axe clean. Verify: finish-matrix + `npm run test:a11y`.
**LDG-P0-03 innerHTML sinks.** Enumerate 212 sinks; classify by data source (static / user / remote); fix remote & user sinks with `esc()` (text + attribute) or DOM APIs; add injection test for holding names, notes, Telegram fields. Done when: every remote/user sink is escaped and listed in `qa/finish-loop/SINKS.md`.
**LDG-P1-01 Freshness model:** one freshness line, one Refresh, pull-to-refresh; banner copy per glossary. **LDG-P1-02 Numbers:** `Intl.NumberFormat` totals without paisa, tabular numerals, sign + ▲/▼. **LDG-P1-03 Tabs:** Home · Watchlist · Funds · Performance · Research with SVG icons (no `$`). **LDG-P1-04 ConfirmDialog/Toast** replacing 38 native dialogs. **LDG-P1-05 Strip production `console.log`** (57). **LDG-P1-06 Disclaimers** for signals/research ("For tracking and education. Not investment advice.") — copy review with owner (§4 financial). **LDG-P1-07 Telegram token:** masked field, "Remove token", never logged.

### DeePonyCap
**PONY-P0-01 IP removal (BLOCKED by D-04).** Inspect all occurrences (`grep -riE "my little pony|hasbro|rainbow dash|pinkie pie|applejack|twilight sparkle|rarity|fluttershy"`), catalog data, images, manifest, store copy, hub catalog. Change per D-04 (e.g. user-entered names only; generic "figure" terminology; remove bundled official imagery). Done when: grep clean across app, hub and marketing pages.
**PONY-P1-01 Demo banner inline.** **PONY-P1-02 Switches** (role=switch) for all settings toggles. **PONY-P1-03 Dark theme page background** token. **PONY-P1-04 FAB** only on Stable/Wishlist, above tab bar + safe area, never overlapping content (assertNotObscured). **PONY-P1-05 Tab bar** SVG icons + 11px labels. **PONY-P1-06 Locale dates.** **PONY-P1-07 Remove `releases/` from deploy output.** **PONY-P1-08 Kids/COPPA wording** — remove child-targeting claims unless owner confirms Kids strategy.

### PrismCap
**PRSM-P0-01 Trademark renames (BLOCKED by D-06).** Inspect game registry for Connect Four / Codenames / Taboo (and review all 39 names). Change per D-06: new names, updated rules text/visuals where distinctive, migration of saved stats keyed by old ids (keep old ids internally; map display names). Done when: no trademarked names in UI, manifest, hub, pitch pages; saved XP intact (fixture test).
**PRSM-P1-01 Remove device-select gate** (keep stored preference readable for existing users; default by media queries). **PRSM-P1-02 Typography:** pixel fonts logo-only; body system font; contrast ≥4.5:1. **PRSM-P1-03 Manifest name** "PrismCap" (both manifests). **PRSM-P1-04 Game shell standard:** setup → pass-device interstitial ("Pass to Player 2" with large tap target) → play → result → exit ConfirmDialog; `aria-live` turn announcements. **PRSM-P1-05 Replace 13 native dialogs.** **PRSM-P2-01 Reduce `innerHTML` rebuilds** on game boards (measure first).

### MasteryCap
**MST-P0-01 Enable zoom:** viewport `width=device-width, initial-scale=1, viewport-fit=cover`; fix any layout that relied on no-zoom (double-tap zoom issues → `touch-action: manipulation` on buttons). Verify at 200% text.
**MST-P0-02 Sandbox code runner:** Inspect `js/institute/code-editor.js:90–125` and CSP. Change: execute learner code in a sandboxed iframe (`sandbox="allow-scripts"`, `srcdoc`, no same-origin) or dedicated Worker via `postMessage`, with 2 s timeout and output size cap; main document CSP without `unsafe-eval`. Done when: existing HTTP Lab/editor tests pass; a test proves `document.cookie`/`localStorage` of the app are unreachable from learner code.
**MST-P1-01 Today:** first-run name prompt; skip → title "Today", hide Student ID; one primary CTA; "Your standing" hidden at 0%; white label on accent (contrast verified). **MST-P1-02 Section labels** per type tokens. **MST-P1-03 Replace 17 native dialogs.** **MST-P1-04 Sub-11px** cleanup (39). **MST-P1-05 Urdu `lang/dir`** audit.

### SoulCap
**SOUL-P0-01 Fictional names:** replace "Shamikh" in `docs/app.js` fixtures and `e2e/app.spec.ts` with "Alex"; regenerate galleries. Done when: `grep -R "Shamikh" SoulCap --exclude-dir=node_modules` empty (except git history).
**SOUL-P0-02 Crisis resources (BLOCKED by D-05 content).** Implement only the structure: Help flow screen that shows owner-approved resources by user-selected region (Pakistan, UK, US, UAE, Other → "local emergency number"), always-visible "Call emergency services" guidance, no auto-dialing. Copy comes from DECISIONS.md verbatim. Safety tests (`npm run test:safety`) must stay green and be extended.
**SOUL-P1-01 Desktop/tablet layout ≥900px:** sidebar with 5 destinations, 720px content, optional right rail; tab bar hidden. **SOUL-P1-02 What's new card** padding 16, text-button dismiss. **SOUL-P1-03 Ambient layer** confined behind greeting, ≤20% opacity under text, off in reduced transparency/motion. **SOUL-P1-04 Now screen simplification** (proposal first — IA change): check-in, one suggested technique, "Explore", persistent Help; move secondary cards below the fold. **SOUL-P1-05 Optional app lock** (proposal first — storage/crypto). **SOUL-P1-06 Performance:** minify + split `app.js`/`data.js` (proposal first — build step change for a no-bundler app; alternative: manual module split + SW precache).

### ScentCap
**SCNT-P1-01 Monogram & label:** initials skip `&`/articles/particles; brand label fits (auto-shrink to min 9px *decorative* inside art with `aria-hidden`, full brand in accessible text) or omitted; unit test with "Dolce & Gabbana", "Maison Francis Kurkdjian", "Yves Saint Laurent", "Le Labo". **SCNT-P1-02 Today copy:** remove duplicate score/temperature/eyebrow; reason sentence from advisor rules. **SCNT-P1-03 iOS pack:** `ios/App/App/PrivacyInfo.xcprivacy`, `ITSAppUsesNonExemptEncryption=false` (confirm no custom crypto), Xcode 26 build, Dynamic Type check in WKWebView, haptics on Wear. **SCNT-P1-04 `!important` reduction** in touched files (209). **SCNT-P1-05 Brand art** generic (no logos/trade dress) — owner review of samples. **SCNT-P1-06 Commit or discard the 2 dirty files** after owner review.

### SteadyCap
**STDY-P1-01 Today rebuild (proposal first — IA):** inline DemoBanner; single "Due now" list with Taken/Skip; remove streak language; SOS in tab only (or card only — propose); emoji → SVG; material tab bar with content padding. **STDY-P1-02 Copy glossary** (§8). **STDY-P1-03 Medical copy review** with owner (§4). **STDY-P1-04 Sub-11px cleanup** (83). **STDY-P1-05 Replace native dialogs.** **STDY-P1-06 Data protection:** optional lock + Erase all. SOS e2e must remain a release blocker and pass.

### PulseCap
**PLS-P0-01 CI + hygiene** (after FLT-02). **PLS-P1-01 Typography:** sentence-case buttons and tab labels; remove letter-spacing; solid accent button with verified label contrast. **PLS-P1-02 Today:** remove duplicate Progress button; insight rows actionable; inline DemoBanner. **PLS-P1-03 Sub-11px cleanup** (77). **PLS-P1-04 Safe areas** (only 2 usages) on tab bar, active workout controls, rest timer, toasts. Keep "Smart Coach = rules" honesty.

### AuraCap
**AUR-P0-01 Mobile layout:** hide rail <700; skip link visually hidden until focus; content bottom padding; Done when finish-matrix shows no clipping/obscured elements. **AUR-P0-02 Copy:** "demo wardrobe" → sample data; "Control Center" → "Overview"; normalize device names (unit test: "iphone 16promax" → "iPhone 16 Pro Max"); remove "LIVE" on sample data. **AUR-P1-01 Header** single row + overflow menu; theme to Settings. **AUR-P1-02 Scores:** one headline score + breakdown (proposal first — product). **AUR-P1-03 Remove three.js + GSAP** (`CapScene.tsx`, `CapRouteTransition.tsx`) in favor of CSS/View Transitions; measure bundle before/after. **AUR-P1-04 Mono labels → tokens.** **AUR-P1-05 Quick access** de-duplicated.

### CarCap
**CAR-P0-01 Splash:** first launch only ≤600ms; remove tagline; `__APP_READY__`. **CAR-P1-01 Reduced motion** support. **CAR-P1-02 ConfirmDialog/Toast** replacing 4 native dialogs. **CAR-P1-03 States:** <2 fill-ups economy message, overdue service, expired document, import invalid JSON. **CAR-P1-04 Privacy page.** **CAR-P2-01 Reminders design** (PWA notification limits explained honestly).

### CookCap
**COOK-P1-01 Header:** no truncation at 320–430; book title placement ≥600px only; profile button labeled. **COOK-P1-02 Hero eyebrows** sans + scrim. **COOK-P1-03 Icons:** distinct Prep/Cook/Cal. **COOK-P1-04 One macro footnote.** **COOK-P1-05 Scrubber/counter** no overlap; recipe count single source (test that cover, reader and About agree). **COOK-P1-06 Onboarding:** disable cover CTA during name sheet; remove micro-label collision; copy per glossary with live name preview. **COOK-P1-07 Tests:** Playwright specs for onboarding → recipe → cook mode → shopping list (currently 0 specs; the repo already depends on Playwright). **COOK-P1-08 Image rights ledger:** `src/lib/recipes/images.lock.json` gains `source`, `license`, `attribution` per hero (populate from rematch scripts; unknown → flag list for owner). **COOK-P1-09 Privacy page.**

### TravelCap
**TRVL-P0-01 Splash** first launch only (change `splash-screen.tsx` comment/logic; store flag in localStorage; reduced motion skip). **TRVL-P1-01 Name (BLOCKED by D-07).** **TRVL-P1-02 Lazy heavy libs:** tesseract only after "Scan", leaflet/recharts per route; OCR progress + cancel + failure state. **TRVL-P1-03 Documents protection:** optional lock + clear warning on export. **TRVL-P1-04 IA proposal:** Trips-centric navigation (16 destinations → Trips / Explore / Documents / More). **TRVL-P1-05 Privacy page** listing Nominatim, restcountries, Open-Meteo, Frankfurter, AviationStack (user key). **TRVL-P1-06 AviationStack HTTPS check** + clear error when plan lacks HTTPS.

### Hub / Lab / OS-next
**HUB-P0-01 Catalog truth** after D-04/D-06/D-07 (names, versions from each repo's VERSION.json via `sync:catalog`). **HUB-P1-01 Deploy parity:** lab 0.10.2 vs live 0.10.1 — resolve D-13 (park if unanswered), then build, verify and deploy per §19 with a live smoke test. **HUB-P1-02 Performance:** poster-first lock screen, three.js after idle, reduced motion static. **HUB-P1-03 Dock at 320–390** re-verify icon sizing.

### P2 — Polish (all apps, after P1)
P2-01 Migrate remaining screens to tokens (zero raw hex outside token/brand files) · P2-02 Motion tokens + reduced-motion parity · P2-03 Skeletons on data screens · P2-04 Native haptics (Tier-1 native apps only) · P2-05 One empty-state illustration style per app · P2-06 Locale dates/numbers everywhere · P2-07 Landscape + tablet refinements · P2-08 Lighthouse ≥95 perf/a11y primary routes · P2-09 Remove remaining marketing JS from product bundles (DeePony, Steady, Prism, Pulse copies of `capricorn-premium-nav.js` / `capricorn-deck-pro.js` / `capricorn-pitch.js`) · P2-10 Full copy glossary sweep incl. "OS/DNA/Bureau/Museum/Kernel/Atelier" user-facing strings.

### P3 — Optional (only if owner asks)
Widgets (ScentCap "Today's scent", VaultCap expiry), IdeaCap share extension, foldable dual-pane layouts, Trusted Types enforcement, CookCap page-turn sound, PulseCap Live Activity (only if native reversal).

---

## 16. Completion criteria

### 16.1 Tier 1 — the bar every app must reach

An app is **Tier 1** only when **every** gate passes, each with evidence linked in APP-REPORT.md:

| Gate | Requirement |
|---|---|
| G1 Score | Overall ≥ 80 by §16.2; every applicable dimension ≥ 75; Accessibility ≥ 85; Privacy/Security ≥ 85 |
| G2 Open issues | 0 open P0 · 0 open P1 · ≤ 5 open P2, each logged with a reason |
| G3 Build health | Build, typecheck, lint: 0 errors, 0 new warnings · all tests green · test count ≥ baseline + one regression test per bug fixed · 0 console errors/warnings on primary journeys |
| G4 Responsive | finish-matrix on all primary routes × 15 viewports × light/dark: 0 horizontal overflow, 0 obscured primary controls, 0 clipped text · landscape phone, tablet and ≥ 900px layouts are intentionally designed (no stretched phone UI) |
| G5 Accessibility | axe 0 serious/critical on every route in both themes · Lighthouse accessibility ≥ 95 · full keyboard journey · VoiceOver and TalkBack pass on primary journeys (or the documented best available substitute, clearly labeled) · 200% text without loss · reduced motion honored · contrast script passes all token pairs · zoom never disabled |
| G6 Design system | Tokens adopted app-wide: 0 raw hex outside token/brand files · 0 text < 11px (11px only for tab labels) · 0 emoji used as icons · 0 native `alert/confirm/prompt` · 0 `outline:none` without a `:focus-visible` replacement · `!important` only in reduced-motion/forced-colors overrides · z-index only from tokens · shared Button/Switch/Sheet/Banner/Toast/ConfirmDialog/EmptyState/ErrorState/TabBar used |
| G7 Copy | §8 glossary and voice sweep complete on every screen, dialog, toast, error and empty state · no internal jargon ("OS", "DNA", "Kernel", "Bureau", "Museum", "Atelier", "Maison", vague "Smart ___") in UI · no version numbers outside Settings → About |
| G8 States | `STATES.md` complete for every primary journey (all §14 states designed and tested, or N/A with a reason) |
| G9 Performance | Lighthouse mobile performance ≥ 90 on primary routes · LCP ≤ 2.5 s · TBT ≤ 200 ms · CLS ≤ 0.1 · app-shell JS ≤ 170 KB gzip · native cold start ≤ 2 s · no dropped frames on primary scroll/animations |
| G10 Security & privacy | 0 secrets in code or bundles · 0 third-party runtime scripts · 0 unescaped user/remote data in `innerHTML` · the network-request log captured by Playwright across primary journeys matches the privacy page's destination list exactly · Export and Erase-all-data present and tested · fixtures use fictional people · sensitive-data apps offer a lock |
| G11 Platform | **PWA:** installable, primary journey works offline, update prompt, safe areas, in-app back, Android back closes overlays, iOS standalone verified. **Native/store candidates:** builds with current toolchains (Xcode 26 / iOS 26 SDK; target API 36), privacy manifest, specific permission strings, store pack (§9) complete, every item in the app's Rejection Risk Register (FLEET-AUDIT §J) mitigated or parked with the owner |
| G12 Audit | The latest full-product audit round found 0 new P0/P1 |
| G13 Truth | Version single-source check passes · CHANGELOG / HANDOVER / FEATURES / privacy page / Brain note updated · APP-REPORT.md written |
| G14 Artifacts & delivery | §18 complete for the app: screenshots and screen gallery regenerated from the final build and visually reviewed · every document inventoried, canonical docs updated, superseded docs archived · Capricorn website entry updated and live-verified · repo cleanup done · everything committed, pushed, merged to `main`, tagged and deployed per §19, with the live URL smoke-tested |

If the only failing gates depend on parked owner decisions, the app's status is **"Tier 1 — pending owner decisions (Q-…)"**, never "Tier 1".

### 16.2 Scoring rubric (evidence-based — same 13 dimensions as FLEET-AUDIT §B)

Dimensions: Completeness · UI · UX · Typography · Accessibility · Responsiveness · Performance · Reliability · Privacy/Security · Platform compliance · App Store readiness · Google Play readiness · Overall polish.
- Each dimension starts at 100 and is **capped** by its open issues: any open P0 → max 59 · any open P1 → max 74 · more than 5 open P2 → max 84 · 1–5 open P2 → max 92.
- Every dimension score cites evidence (test output, report file, screenshot path). No evidence → score it 59 and add an item.
- Store dimensions are scored against how the app is distributed. They are N/A only when DECISIONS.md records the owner's choice not to distribute on that store; G11 still applies to the PWA.
- Overall = mean of applicable dimensions, rounded **down**. When unsure, score lower and add an item.

### 16.3 Per item
"Done when" met · verify command green · finish-matrix no overflow/obscured primary elements · axe 0 serious/critical on touched routes · keyboard + screen-reader names checked · light/dark checked · reduced motion checked · LOG.md entry complete with evidence.

### 16.4 Per app (app complete — only then move to the next app)
1. All §16.1 gates pass, or the status is "Tier 1 — pending owner decisions" with nothing but parked items left.
2. Every P0, P1 and gate-required P2 item is ✅ or ⛔ PARKED with a Q-id.
3. `qa/finish-loop/STATES.md` complete.
4. The final full-product audit round is clean (G12).
5. No regressions against BASELINE.md; every previously finished app still passes its verify command.
6. Docs synced and version bumped per §2.
7. `APP-REPORT.md` written (§17.1), PROGRESS.md updated, and the §19 release sequence completed (commit → push → merge to `main` → tag → deploy → live smoke test).

### 16.5 Program complete
Every app passes §16.1 during fleet re-verification (§15.0 step C) · `FINAL-REPORT.md` written (§17.2) · no "Must never ship" item (FLEET-AUDIT §H) remains. If any app is still "pending owner decisions", the program is **not** complete — the final report states exactly which answers unlock Tier 1 for which app, and you keep working on everything else.

---

## 17. Reports

You never stop to report. Reports are written as files while you keep working. A short status block (below) goes at the end of any message you do send:
```
App: <App> (<n>/16) · round <r> · score <before> → <now>
Done this session: <IDs>
In progress: <ID> — next step
Parked: <Q-ids>
Next: <next 3 items>
```

### 17.1 `APP-REPORT.md` (written in `<repo>/qa/finish-loop/` when an app closes)

1. **Status:** `Tier 1` or `Tier 1 — pending owner decisions (Q-…)` · finish branch · final commit SHA · version.
2. **Scorecard:** table of the 13 dimensions — Before (BASELINE.md) · After · Evidence link — plus Overall before/after and G1–G14 gate results (pass/fail + evidence).
3. **Issues found and resolved** — one row per issue, including every audit item and every new finding:

| ID | Severity | Area | What was wrong (user-visible symptom) | Root cause | What was done | Files | Verification evidence | Status |
|---|---|---|---|---|---|---|---|---|

   Status values: ✅ Fixed · ⛔ Parked (Q-id) · ↩︎ Owner decided not to change (quote DECISIONS.md) · ⏭ P3 deferred by rule.
4. **New issues discovered during implementation** (not in FLEET-AUDIT) — same table.
5. **Remaining issues** — what, why it remains, exactly what is needed (decision, device, account, legal text) and its impact on Tier 1.
6. **Regressions caught** — what broke, how it was detected, how it was fixed, the test that now guards it.
7. **Metrics before → after:** tests (count, pass), axe violations, Lighthouse (perf/a11y/best-practices), app-shell JS gzip, raw hex count, sub-11px declarations, `!important`, unescaped sinks, native dialogs, emoji icons, finish-matrix overflow/obscured counts, console errors.
8. **Screens:** before/after screenshot pairs for every screen changed (paths), plus the regenerated gallery link.
9. **States coverage:** summary of STATES.md.
10. **Distribution readiness:** PWA checklist and, where applicable, App Store / Google Play checklist and Rejection Risk Register status.
11. **Docs, gallery, website and cleanup:** what was updated, archived or removed (§18).

### 17.2 `docs/audit-2026-09-14/FINAL-REPORT.md` (program end)

1. **Fleet summary:** App · Before score · After score · Status · Gates failing (if any) · Open Q-ids · PWA readiness · App Store readiness · Play readiness.
2. **Every app's issue register** — the full §17.1 tables for all apps (issue, root cause, fix, evidence, status), not summaries.
3. **Cross-app patterns fixed** (e.g. overlay banners, splash, emoji icons) and where the shared fix lives.
4. **Shared foundation** — tokens/components delivered and adoption status per app.
5. **Owner decisions** — every Q-id, its answer or "still open", and exactly which Tier 1 gates it blocks for which app.
6. **Regressions across the program** and the guards added.
7. **Website, galleries and documentation** — what changed on the Capricorn website, which galleries were regenerated, which documents were updated or archived.
8. **Workspace cleanup** — everything moved, archived or removed, with sizes and the archive location.
9. **Residual risks and recommended next steps** (store submission order, legal reviews, device testing still needed).

---

## 18. Screenshots, screen galleries, Capricorn website, documentation, and folder cleanup

These are part of "finished". An app is not Tier 1 while its screenshots, gallery, website entry or documents describe an older or different product (gate G14).

### 18.1 Screenshots and screen galleries (per app, at app close, from the final build)
1. Fix every gallery harness first (FLT-07): wait for `window.__APP_READY__`, never capture splash, loading spinners, overlay banners, focus rings from programmatic focus, or personal data. Use sample data with fictional people only.
2. Regenerate with the repo's own command (`npm run gallery`; CookCap uses `GALLERY_URL=… npm run gallery`; DeeFoodieApp uses `npm run gallery:capture` in `mobile/`) covering: every primary screen and sub-tab, light and dark, mobile (393×852 @2x) and desktop (1440×900), plus key states — first use, empty, error, offline, permission denied — and one tablet (820×1180) capture per primary screen.
3. Update `screen-gallery.html` and its `gallery-manifest.json` so every entry has theme, viewport, section, screen id, label, route and state. Remove manifest entries for screens that no longer exist.
4. **Look at every regenerated image** (open it). Reject and re-capture any image showing splash, clipped content, overlapping bars, placeholder names, broken images, stale versions or console-error overlays. Record the review in LOG.md.
5. Move superseded screenshots (old versions, duplicate gallery folders such as SoulCap's `assets/gallery` vs `docs/screenshots/gallery`, LedgerCap's and VaultCap's historical sets) to `docs/archive/screenshots/<date>/` inside the repo **only if referenced by history docs**; otherwise remove them from the working tree in a dedicated commit (git history keeps them). Keep one canonical gallery location per repo, documented in HANDOVER.md.
6. Refresh marketing screenshots used by `landing.html`, `pitch.html`, `presentation.html`, `docs/pitch.html`, README and store packs from the new gallery — never hand-edited mockups that differ from the real app.
7. Store screenshots (native candidates): capture from the real app at the sizes App Store Connect and Play Console currently require (check their help pages at capture time and record the sizes used); no claims or features that don't exist.

### 18.2 Documentation — every document, per app
1. Inventory every Markdown/HTML document in the repo into `qa/finish-loop/DOCS-INVENTORY.md` with: path · purpose · last updated · status (canonical / update / archive).
2. **Canonical set** each repo keeps current: `README.md` (what it is, who it's for, run, verify, deploy) · `HANDOVER.md` (architecture, data, gotchas, commands, gallery location) · `CHANGELOG.md` (+ `changelog.html` where present) · `FEATURES.md` · `ROADMAP.md` · `PRIVACY.md` + hosted privacy page (network destinations match G10) · `SECURITY.md` · `CLAUDE.md` / `AGENTS.md` (current version, correct path `/Users/shamikhahmed/Projects/Cap/Cap-Apps/<App>`, current commands) · `docs/store/*` for native candidates · `qa/finish-loop/*`.
3. Update every canonical document to match the finished app: version, features, screenshots, commands, architecture, known limitations, honest claims (no AI/OS/medical/financial overclaims).
4. **Superseded documents** — old specs, audits and one-off agent prompts (e.g. CookCap `CURSOR_PROMPT.md` / `FINAL_PROMPT.md` / `MASTER_PROMPT.md`; MasteryCap `CURSOR-PROMPT-2-…`, `CURSOR-PROMPT-3-…`, `LOOP-STATE.md`; PulseCap `CURSOR-PERFECTION.md` / `CURSOR-REBUILD.md` / `CURSOR-UX-AUDIT.md`; SoulCap's many `SPEC-v*.md` / `AUDIT*.md`; capricorn-lab/os-next `LOCK_FABLE_PROMPT.md` / `PLOT_MASTER_PROMPT.md`) → move to `docs/archive/` with a one-line header "Superseded on <date> by <canonical doc>" and list them in `docs/archive/README.md`. Do not delete their content; do not leave them at repo root. SoulCap's `CLINICAL.md`, `SAFETY.md`, `ACCESSIBILITY.md`, `DATA_MODEL.md` stay canonical if still accurate.
5. Marketing/pitch HTML (`landing.html`, `pitch.html`, `presentation.html`, `investor` pages): update copy and screenshots to the finished product; remove claims that no longer hold; keep IP-sensitive names out (D-04, D-06).
6. Brain note: update `path_on_disk`, version, "Current focus", and append the dated Decisions line (vault edits follow FLT-01 rules).
7. Workspace-level docs (`Cap-Apps/docs/`, `_workspace/`): `docs/AUDIT_REPORT.md` (June) and `docs/APP_STORE_CHECKLIST.md` (June) → archive with "superseded by `docs/audit-2026-09-14/`"; `_workspace/*.md` reviewed — current facts merged into the relevant repo or `capricorn-tooling/docs`, the rest archived.
8. Verify: a Markdown link check over every canonical doc (all relative links resolve; commands in README/HANDOVER actually run).

### 18.3 Capricorn website (shamikhahmed.github.io hub + capricorn-lab + capricorn-os-next)
1. **Park D-13** first if not answered: which repo is the single source for the live hub (capricorn-lab or capricorn-os-next). Until answered, prepare changes in both only where identical, and keep going.
2. **After each app closes:** update that app's catalog entry through the tooling (`capricorn-tooling`: `npm run sync:versions`, `npm run sync:catalog`, `npm run release:marketing`) — name, one-line description in the new copy voice, version from VERSION.json, live URL, icon, and fresh screenshots from §18.1. No hand-typed versions.
3. **Hub step (§15.0 step 16):** full Tier 1 loop on the website itself — responsive matrix (dock/grid at 320–2560), axe, Lighthouse (performance ≥ 90 with the three.js lock scene deferred and a poster fallback), reduced motion, keyboard, 0 console errors, internal link check (every link returns 200 locally), `robots.txt` + `sitemap.xml` current, Open Graph images current, legacy product pages (`carcap.html`, `prismcap.html`, `scentcap.html`, redirect stubs, `investor/`, pitch pages) updated or redirected to the live app, no WIP labels for shipped apps, no My Little Pony / trademarked game names, honest claims only.
4. Build locally and verify, then commit, push and deploy automatically per §19 using the hub deploy path documented in `shamikhahmed.github.io/HANDOVER.md` (if undocumented, derive it from the repos' scripts/workflows and document it first). After deploy, verify the live site: every Cap link returns 200, 0 console errors, catalog versions match each repo's VERSION.json.

### 18.4 Folder cleanup (workspace and repos)
Owner directive 2026-09-14: clean up the folder — archiving is pre-approved. Safety rules: **inventory before action, move before delete, never rewrite git history, never delete user data.** Archive destination: `~/Archive/Cap-Apps/<YYYY-MM-DD>/` (create it). Moving workspace clutter there is automatic; permanently deleting anything that is neither regenerable nor in git stays parked.
1. Write `docs/audit-2026-09-14/CLEANUP-PLAN.md`: every candidate with path · size (`du -sh`) · what it is · action (keep / archive / remove from working tree / gitignore) · risk. Execute it immediately (archive moves and in-repo cleanup commits are pre-approved), parking only permanent deletion of non-regenerable untracked data; record results in the same file.
2. **Workspace-level candidates:** `shamikhahmed.github.io-backup-2026-07-10`, `shamikhahmed.github.io-backup-pre-os-live-2026-07-10-v0101`, `shamikhahmed.github.io-backup-pre-os-live-2026-07-10-v096`, `capricorn-os-next/.git.broken-20260911013611`, `_workspace/cap-agents 2` and `_workspace/shared 2` (Finder duplicates), root `.DS_Store`, stale root `docs/*.md` (§18.2.7), whichever of capricorn-lab / capricorn-os-next D-13 retires.
3. **Repo-level candidates** (each in its own commit on the finish branch): build and test output that shouldn't be tracked or kept (`test-results/`, `playwright-report/`, `out/`, `dist/` unless deployed from git, `tsconfig.tsbuildinfo`, `.expo/`) → remove + `.gitignore`; `.DS_Store` everywhere → remove + global ignore; `DeePonyCap/releases/` old code copy; duplicate root icon files where `public/` or `assets/` is canonical (PrismCap, VaultCap, PulseCap — update references first, then verify icons/manifest/apple-touch still resolve); stray root artifacts (e.g. `LedgerCap/ledgercap-phone-preview.png`) → `docs/` or archive; duplicate gallery folders (§18.1.5); superseded docs (§18.2.4); marketing JS copies in product folders once P2-09 removes their usage.
4. **Never remove:** anything referenced by `index.html`, the service worker precache list, manifests, deploy workflows, or tests — prove each candidate is unreferenced (`grep -R` for the filename across the repo + a full verify run after removal).
5. After cleanup: every repo's verify passes, galleries open, hub builds, `git status` clean on the finish branch, and CLEANUP-PLAN.md lists final sizes reclaimed.

---

## 19. Git automation — commit, push, merge, tag, deploy (automatic)

Owner directive 2026-09-14: **all automatic.** Do these yourself every time, without asking — but only through the guarded steps below.

### 19.1 Pre-flight (once per repo, before its first commit)
- `git remote -v` must point to `github.com/shamikhahmed/<repo>`; run `git fetch origin`.
- If local `main` is a restore snapshot with history unrelated to `origin/main` (shamikhahmed.github.io is a "local restore snapshot"; AuraCap, PulseCap and the hub have no upstream tracking), **do not push it over origin.** Create `finish/<app>` from `origin/main`, port the needed working-tree changes onto it, and record the approach in LOG.md. If that cannot be done cleanly → park and keep committing locally.
- Use the machine's existing git identity and credentials; never change global git config or auth.

### 19.2 Checkpoint commit + push (continuous)
At every green checkpoint (repo verify passing):
1. Review `git status` and `git diff --stat`: only intended files; secret scan clean; no `.env*`, `node_modules`, stray binaries, or build output unless the repo deploys from committed output.
2. Stage explicit paths (never blanket-add a dirty tree you didn't create — see FLT-00).
3. Commit with a conventional message and item IDs, e.g. `fix(today): inline demo banner (STDY-P1-01)`.
4. `git push -u origin finish/<app>`. If rejected: `git fetch`, rebase only your own unpushed commits onto `origin/finish/<app>`; any conflict you can't resolve with certainty → abort the rebase, park, continue locally.

### 19.3 Release (when the app passes all §16.1 gates — or when a Phase 0 security hotfix is verified)
1. Re-run full verify + finish-matrix + axe on the final commit.
2. Bump version per §2; update CHANGELOG (+ `changelog.html`); commit and push.
3. `git checkout main && git pull --ff-only origin main && git merge --no-ff finish/<app> -m "release: <App> v<version> — Tier 1 finish"`. Conflicts → `git merge --abort`, park.
4. Run verify on `main`. Only if green: `git push origin main`.
5. `git tag -a v<version> -m "<App> v<version>" && git push origin v<version>`. Never move or delete existing tags.
6. **Deploy.** Pushing `main` triggers the repo's workflow where one exists (`deploy.yml`, `pages.yml`, `ci.yml`, `web-deploy.yml`); follow it to completion (`gh run watch` if `gh` is available, otherwise poll the run page / live URL). Apps published through the hub (CarCap, TravelCap export, IdeaCap web, SoulCap mirror, capricorn-lab/os-next → shamikhahmed.github.io) use the exact commands in their HANDOVER.md — if undocumented, derive them from the repo scripts, document them, then run — and the hub repo is then committed and pushed the same way.
7. **Live smoke test** with Playwright against the live GitHub Pages URL: HTTP 200, `__APP_READY__` reached, service worker updated to the new cache name, 0 console errors, primary journey passes. On failure, fix forward with a new commit and release again; if it can't be fixed quickly, `git revert -m 1 <merge-sha>` on `main`, push, park — never force-push, never delete the tag.
8. After a successful release, delete the merged remote branch (`git push origin --delete finish/<app>`) and record branch, commits, merge SHA, tag, workflow run, live URL and smoke result in APP-REPORT.md. FINAL-REPORT.md lists this for every repo.

### 19.4 Reports are versioned too
`Cap-Apps/` itself is not a git repo. At every app close and at program end, copy `docs/audit-2026-09-14/` (PROGRESS, DECISIONS, BASELINE, CLEANUP-PLAN, FINAL-REPORT and these audit files) into `capricorn-tooling/docs/audit-2026-09-14/`, then commit and push capricorn-tooling.

### 19.5 Never
Force-push · `push --mirror` · rewriting, squashing or amending pushed commits · deleting remote branches other than your own merged `finish/*` · committing secrets · `--no-verify` · pushing with a red verify · store submissions.

---
START AT: (optional — app name) · RESUME: (optional — continue from PROGRESS.md)
