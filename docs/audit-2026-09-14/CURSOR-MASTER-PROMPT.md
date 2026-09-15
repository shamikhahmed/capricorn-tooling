# CURSOR MASTER PROMPT v2 — Capricorn Cap Fleet Finish Program (decisions locked)

> **How to use:** open Cursor (Agent mode) at `/Users/shamikhahmed/Projects/Cap/Cap-Apps`, paste this entire file, and send. Last line: `RESUME` (default — continue from `docs/audit-2026-09-14/PROGRESS.md`) or `START AT: <App>`.
> **This version replaces v1.** All owner decisions are made and locked in `docs/audit-2026-09-14/DECISIONS.md`. There is nothing to wait for. Evidence behind every item: `docs/audit-2026-09-14/FLEET-AUDIT.md`.

---

## 0. Program directive (overrides everything below if anything conflicts)

1. **Goal: every app reaches Tier 1** (§14.1). 15 apps + the Capricorn website. No lower tier, no "good enough", no frozen apps.
2. **All decisions are made.** Read `DECISIONS.md` first and treat it as the owner's word. Do not re-open, question or park any decided item. For a situation not covered, apply `DECISIONS.md` §0 principles, choose the safest simplest option, append it to `DECISIONS.md` §6 with your reasoning, and **proceed immediately**.
3. **One app at a time** in the order of §13.0. Finish (§14.4) → release → report → next app. No interleaving, except shared foundation work the current app needs (then re-verify every finished app).
4. **Never stop, never idle, never ask.** Don't end a turn to ask "continue?", don't wait for replies, don't pause between items. If one item is impossible right now (missing hardware, credentials, external outage), log it as `⛔ BLOCKED-EXTERNAL`, do every part that is possible, and move to the next item (§7). There is always more verified quality work until the app passes Tier 1.
5. **Never compromise quality.** §8.3 forbidden shortcuts are absolute.
6. **Git is automatic:** commit, push, merge to `main`, tag, deploy and live-verify yourself (§17).
7. **Continuity:** keep `PROGRESS.md` current (§8.4); any new session resumes exactly.
8. **Report:** `APP-REPORT.md` per app and `FINAL-REPORT.md` at the end, showing every issue, root cause, fix, evidence and what remains (§15).
9. **Never, under any circumstance:** force-push or rewrite pushed history · delete or alter user data outside G-6 migrations · publish personal contact details · submit to App Store / Google Play / TestFlight (needs owner accounts — prepare everything, record as out of scope) · commit secrets · skip hooks · leave `main` red.

---

## 1. Role and priorities

You are a senior product-engineering team in one agent: staff engineer, product designer, accessibility specialist, QA lead, security reviewer and platform-compliance reviewer. The bar is Apple / Google / Samsung first-party quality: calm, fast, intentional, accessible, consistent, platform-native, stable.

When priorities conflict: **(1)** don't break working functionality or lose user data · **(2)** security and privacy · **(3)** accessibility · **(4)** clarity of the user journey · **(5)** visual polish · **(6)** code elegance.
The smallest correct change wins. Stable at the highest practical quality beats "impressive".

---

## 2. Current state (from the owner's review, 2026-09-14) and mandatory corrections

### 2.1 Already done
- On `main` and live: IDEA-P0-01 (client AI keys removed), LDG-P0-01 (public CORS proxies removed), VLT-P0-01 (SheetJS 0.20.3, mammoth, jsQR, qrcode vendored), SOUL-P0-01 (fixtures use "Alex"), DFD-P0-03 (DB ports on 127.0.0.1, stub auth refused in production), CAR-P0-01 / TRVL-P0-01 (splash first launch only; CarCap gallery shows Today).
- Foundation FND-01…03 (tokens.json, contrast check, secrets/version audits, shared primitives + preview).
- Backups and `.git.broken` moved to `~/Archive/Cap-Apps/2026-09-14/`. Brain `path_on_disk` reconciled; `DeeFoodieApp.md` added.
- SoulCap on `finish/soulcap` (last green `ac36a20`: 364 passed, 4 pre-existing gallery-gated skips): desktop sidebar ≥ 900px, What's new padding, quieter ambient layer, "Open quietly" removed; safety suite 50/50.
- Verified facts: `~/Desktop/Cap-Apps` is a **symlink** to this workspace (not a second copy). IdeaCap v2.0.0 does not exist anywhere.

### 2.2 Corrections — do these first, in order (they are Step R in §13.0)

**C-01 Phase 0 releases skipped release steps.** VaultCap, LedgerCap, CarCap, TravelCap, IdeaCap, SoulCap and DeeFoodieApp shipped without version bump, service-worker cache rename, CHANGELOG or tag. SW cache names are unchanged (`vaultcap-v88`, `ledgercap-v136`, `carcap-v5`; live VaultCap SW still `vaultcap-v88`) → **installed PWAs keep serving old cached code, so the security fixes don't reach existing users.** For each: patch release per DECISIONS G-8 (version + SW cache + register query + `VERSION.json` + `window.APP_VERSION` + CHANGELOG/`changelog.html`), verify, push, tag, deploy, then prove on the live URL that the new SW cache name is served and an old SW updates (Playwright: register old SW from the previous commit locally, then load the new build and assert the cache name and fresh JS). Done when all 7 live apps serve new cache names.

**C-02 VaultCap CI is red on `main`** (run 34851414151, job `quality`, commit `bcd5436`); Pages deployed anyway. `BrokenPipeError` lines are web-server noise — find the real failing test(s), fix the cause, release. Then make deploys depend on CI in every repo where Pages can deploy while CI fails (`needs:` in the same workflow or `workflow_run` with `conclusion == 'success'`). Done when `main` is green in every repo and no deploy can run on red.

**C-03 The website isn't released.** `shamikhahmed.github.io` is still `85c7f3a` on `finish/phase-0` (local restore snapshot). Run §17.1 unrelated-history procedure, publish the CarCap / TravelCap / IdeaCap web builds that live under the hub, commit, push, deploy, smoke-test each live URL.

**C-04 Live smoke evidence missing.** Add live smoke results (URL, HTTP status, SW cache name, `__APP_READY__`, console errors, primary journey) for every release to the repo's LOG.md, retroactively for Phase 0 once C-01 re-releases.

**C-05 No stashing.** IdeaCap has a dangling stash commit `18386ba` (package-lock only, nothing lost). Never use `git stash`; preserve work on `preserve/*` branches.

**C-06 Brain truth.** Mark IdeaCap note 2026-07-21 "2.0.0" entries "not found in any repo — superseded by 2026-09-14 rebuild" (D-02). Check other Brain notes for claims that don't match disk (versions, tags, features); correct them.

**C-07 PROGRESS.md.** Record status of FLT-02 (now: restore per D-03 — do it in the PulseCap app loop), FLT-03 (resolved by D-02), FLT-04, FLT-08, and FND-04…06 (deferred to the first app of each stack: FND-04 with ScentCap, FND-05 with DeeFoodieApp, FND-06 with IdeaCap — record this).

**C-08 Adopt v2.** Add a PROGRESS.md entry "Prompt v2 adopted — decisions locked" and rebuild the queue for SoulCap using §13 SoulCap items (which now include decided items that were parked).

---

### 2.3 Review 2 (2026-09-15) — Tier 1 claims revoked; corrections C-09…C-28 (Step R now covers C-01…C-28)

The 2026-09-15 PROGRESS.md claim "fleet Tier 1 complete" is **false**. Independent checks of code, CI and live sites found gate failures in every app. The P0/P1 decision work that was done is real and stays; what is missing is the gate evidence and the gate work that was labeled "optional" or "deferred". **Every app's status is reset to "In progress — Tier 1 not verified."** Work Step R (C-09 first), then re-run the app loop in §13.0 order, starting each app from `npm run tier1` failures instead of from scratch.

**C-09 Honesty rules (new, absolute).** Never write estimated scores ("~88"). Never label a gate item "optional", "deferred", "not a release blocker" or "polish". BLOCKED-EXTERNAL applies only to missing hardware or owner accounts, never to Lighthouse, galleries, matrix runs, token migration or tests. macOS VoiceOver with Safari and Xcode-less WebKit runs are available on this machine and count as screen-reader evidence for web apps.

**C-10 Tier 1 gate runner (build first, use for every Tier 1 claim).** Create `capricorn-tooling/shared/testing/tier1.mjs` (plain Node, no new dependencies beyond G-5) and `npm run tier1` in every repo. It writes `qa/finish-loop/TIER1.json` and exits non-zero on any failure. Automated checks:
1. build / typecheck / lint pass; all tests pass; no `.skip`/`.only`/`fixme`, `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, analyzer ignores added since the BASELINE commit;
2. latest CI run on `main` succeeded (`gh run list -b main`);
3. `finish-matrix` spec exists and passed (15 viewports × 2 themes, 0 overflow, 0 obscured);
4. axe 0 serious/critical on every primary route in both themes;
5. Lighthouse JSON per primary route stored in `qa/finish-loop/lighthouse/` meeting G5/G9 thresholds;
6. kill-list counts = 0 in product code: raw hex outside token/brand files; font sizes < 11px (11px only for tab labels); `!important` outside reduced-motion/forced-colors blocks; native `alert/confirm/prompt` (web); bare `outline:none`; `user-scalable=no`; `fonts.googleapis`/`fonts.gstatic`; production `console.log`; every `innerHTML` listed as safe in `SINKS.md`;
7. `window.__APP_READY__` set by the app;
8. gallery manifest committed after the last UI-affecting commit, with no splash captures;
9. Playwright network log across primary journeys equals the privacy page's destination list;
10. service-worker cache name in the SW file equals `VERSION.json.swCache` equals the live SW; live `VERSION.json` equals the repo;
11. a `v<version>` tag exists on the release commit;
12. `qa/finish-loop/{BASELINE,LOG,STATES,APP-REPORT,DOCS-INVENTORY}.md` exist and APP-REPORT follows §15.1 with numeric scores computed by the §14.2 rubric.
Manual gates (VoiceOver pass, visual gallery review) must link evidence in APP-REPORT. **An app is Tier 1 only when TIER1.json is PASS and manual evidence exists.**

**C-11 TravelCap CI red on `main` (3 runs since 2026-09-14): `npm error 404 … @jridgewell/trace-mapping-0.3.41.tgz`.** The lockfile references a version not in the public registry. Regenerate the lockfile against registry.npmjs.org (remove the bad entry, `npm install`, verify `npm ci` on a clean clone), get CI green, re-release. v1.0.0 was released on red CI — record the violation in the report.

**C-12 TravelCap forbidden suppressions:** 9× `/* eslint-disable react-hooks/set-state-in-effect */` plus `// eslint-disable-next-line @typescript-eslint/ban-ts-comment` + `// @ts-ignore` were added. Remove them all; fix the causes (derive state during render, `useSyncExternalStore` for storage, move updates into event handlers, correct types).

**C-13 TravelCap service worker is broken live.** The live `sw.js` precaches root-relative URLs (`/_next/static/chunks/…`, `/vendor-local-lock.js`, `/privacy.html`) that return 404 under `/TravelCap/` (verified: `/vendor-local-lock.js` 404, `/TravelCap/vendor-local-lock.js` 200; a referenced chunk 404s at both prefixes). A precache 404 fails SW install → no offline support and no updates. Make the PWA config basePath-aware; add a test that requests every precache URL from the exported `out/` with the `/TravelCap` prefix and expects 200; verify offline live.

**C-14 DeePonyCap service worker never updated.** `VERSION.json` says `deeponycap-v60`; repo and live `sw.js` still say `deeponycap-v55`. Installed users are stuck on old code. Fix, release, prove live. Add the SW-truth check (C-10.10) to every repo's verify.

**C-15 Website.** Latest "Hub CI" run on `main` failed (job `links`). `shamikhahmed.github.io/js/products-data.js` (~lines 582–607) still says "TravelOS" in user-facing copy (G-3). Fix links and copy, add version tags to capricorn-lab and the hub, re-release, smoke-test live.

**C-16 Self-host fonts (G-9) not done.** Google Fonts still referenced in `DeePonyCap/index.html` + `pitch.html`, `LedgerCap/index.html` + `pitch.html`, `PrismCap/index.html` + `pitch.html`, `SteadyCap/index.html` + `pitch.html`, `VaultCap/index.html` + `widget.html` + `pitch.html`, `MasteryCap/index.html`, `AuraCap/public/pitch.html`, `ScentCap/public/pitch.html`; remove `CookCap/scripts/tmp-ff/`. Live index pages still request Google Fonts (DeePonyCap, VaultCap, LedgerCap, PrismCap, SteadyCap, MasteryCap). Self-host woff2, update CSP and privacy pages, re-release.

**C-17 SteadyCap streak language remains** (P-STDY-1 says none anywhere): `js/engines/linkedRecoveryEngine.js:229` ("Your {habit} streak is …"), `:306` ("… is your shortest streak …"), onboarding copy in `js/modules/onboarding.js:33–34`. Rewrite ("{habit}: {duration} so far", "shortest stretch so far"; onboarding: "Recovery is a system, not a count.").

**C-18 More forbidden suppressions:** `// eslint-disable-next-line no-console` added in DeeFoodieApp and IdeaCap. Remove the logs or route them through a production no-op logger.

**C-19 Kill-list counts measured 2026-09-15 (product code; Tier 1 requires 0 or SINKS-classified safe):**

| App | raw hex | <12px | !important | innerHTML | native dialogs | outline:none | console.log | Google Fonts refs |
|---|---|---|---|---|---|---|---|---|
| VaultCap | 181 | 297 | 128 | 176 | 4 | 6 | 6 | 13 |
| LedgerCap | 293 | 127 | 118 | 202 | 0 | 4 | 39 | 7 |
| PulseCap | 227 | 144 | 107 | 28 | 1 | 11 | 5 | 0 |
| PrismCap | 204 | 41 | 196 | 153 | 11 | 5 | 0 | 9 |
| DeePonyCap | 211 | 25 | 67 | 23 | 15 | 2 | 1 | 9 |
| SteadyCap | 113 | 98 | 47 | 30 | 0 | 5 | 0 | 9 |
| MasteryCap | 55 | 39 | 11 | 73 | 0 | 3 | 2 | 3 |
| CookCap | 296 | 1 | 48 | 0 | 3 | 4 | 0 | 3 |
| SoulCap | 299 | 19 | 28 | 2 | 3 | 3 | 0 | 0 |
| AuraCap | 150 | 24 | 68 | 1 | 0 | 3 | 0 | 1 |
| ScentCap | 142 | 18 | 22 | 1 | 2 | 3 | 0 | 1 |
| TravelCap | 127 | 1 | 14 | 0 | 2 | 0 | 0 | 0 |
| CarCap | 21 | 6 | 5 | 6 | 0 | 1 | 0 | 0 |
| capricorn-lab | 188 | 0 | 44 | 23 | 0 | 3 | 0 | 0 |
(IdeaCap: 22 `Alert.alert` calls are native React Native dialogs and are allowed.) These are the G6/G10 work queues; C-10 re-measures exactly.

**C-20 `window.__APP_READY__` (FLT-07) missing** in CookCap, LedgerCap, MasteryCap, PrismCap, PulseCap, ScentCap, SteadyCap, VaultCap and IdeaCap (web). Add it, then regenerate and visually review galleries (§16.1) for every app whose gallery predates its last UI change: AuraCap, CookCap, DeePonyCap, LedgerCap, MasteryCap, PrismCap, PulseCap, SteadyCap, TravelCap and VaultCap (last gallery commits July–August 2026).

**C-21 finish-matrix not wired anywhere.** `capricorn-tooling/shared/testing/finish-matrix.js` exists but no repo has a finish-matrix spec or CI job. Add a spec + CI job to every web repo; a Flutter golden/responsive widget test (320/375/430 widths, text scale 1.0/2.0) to DeeFoodieApp; RN web matrix for IdeaCap.

**C-22 No Lighthouse measurements recorded** (Website report: "run locally after Pages propagate"). Run Lighthouse mobile + desktop on every primary route, store JSON, meet thresholds.

**C-23 Loop records incomplete.** IdeaCap has no `qa/finish-loop/` at all; AuraCap and PrismCap have only a report; LedgerCap only `SINKS.md`; DeePonyCap only `STATES.md`; CookCap/PulseCap/SteadyCap/TravelCap LOGs are one or two lines. Several APP-REPORTs are under 1 KB (CookCap 598 B, MasteryCap 629 B, ScentCap 827 B). Rebuild records per §15.1 in each repo (`<repo>/qa/finish-loop/APP-REPORT.md`, not only in the audit folder), including every FLEET-AUDIT §C row.

**C-24 Documentation and cleanup not done.** Still at repo roots: `CookCap/CURSOR_PROMPT.md`, `FINAL_PROMPT.md`, `MASTER_PROMPT.md`; `MasteryCap/CURSOR-PROMPT-2-AUDIT-AND-BACKLOG.md` (and siblings); `PulseCap/CURSOR-PERFECTION.md` (and siblings); `SoulCap/SPEC-v*.md`. Still in the workspace: `_workspace/cap-agents 2`, `_workspace/shared 2`, root `.DS_Store`, `docs/AUDIT_REPORT.md`, `docs/APP_STORE_CHECKLIST.md`. **Privacy:** `SoulCap/docs/SISTER-REPLY-guided-path.md` and `SISTER-REVIEW-KIT-guided-path.md` are personal review correspondence served publicly by GitHub Pages — move them out of `docs/` into `archive/` (not Pages-served), release.

**C-25 Tags.** LedgerCap 3.57.0 has no `v3.57.0` tag (only `ledgercap-v138`). capricorn-lab/hub releases must be tagged. Tag every release commit `v<version>`.

**C-26 capricorn-tooling not merged.** Foundation, `local-lock.js`, finish-matrix and reports sit on `finish/phase-0` (4 commits ahead of `main`). Verify, merge to `main`, tag, and re-copy the current audit docs (the mirrored copies are stale).

**C-27 Brain.** Two project notes still reference `Desktop/Cap-Apps`; ScentCap's note has no 2026-09-14/15 entry. Fix both.

**C-28 PROGRESS.md** must reflect this review: all apps "In progress — Tier 1 not verified", current step R (C-09…C-28), then SoulCap. No app may be marked Tier 1 again without a PASS `TIER1.json`.

---

## 3. Workspace

Root `/Users/shamikhahmed/Projects/Cap/Cap-Apps` (not a git repo; each folder is its own repo). Brain notes: `~/Capricorn-Brain/01 Projects/<Name>.md` (CookCap → `Jia-Cooks.md`; SoulCap → `SoulCap-Therapy-App.md`). Read each repo's `CLAUDE.md` / `AGENTS.md` / `HANDOVER.md` before editing it (TravelCap: read `node_modules/next/dist/docs/` before writing Next code). Shared tooling: `capricorn-tooling/` (symlinked `shared/`, `scripts/`, `cap-agents/`).

| Repo | Product | Stack | Run | Verify |
|---|---|---|---|---|
| AuraCap | Apple setup organizer | React 19, Vite, Tailwind 4 | `npm run dev` | `npm run lint && npm run build && npm run verify` |
| CarCap | Garage: service, fuel, documents | Vanilla JS | `npm start` (:8790) | `npm run check && npm run verify` |
| CookCap | Family cookbook | Next 15 static export | `npm run dev` | `npm run typecheck && npm run lint && npm run gate:recipes && npm run gate:anti-2d && npm run gate:wood && npm run pages:build && npm run smoke:product` |
| DeeFoodieApp | Karachi food journal (private) | Flutter iOS + NestJS/Prisma/PostGIS | `docker compose up -d`; `cd api && pnpm start:dev`; `cd mobile && flutter run` | `cd mobile && flutter analyze && flutter test && flutter build ios --no-codesign`; `cd api && pnpm lint && pnpm test` |
| DeePonyCap | Collection tracker | Vanilla JS | `npm run serve` | `npm test && npm run verify` |
| IdeaCap | Idea capture | Expo SDK 57, RN 0.86 | `npm run start` / `npm run web` | `npm run typecheck && npm run verify && npx expo-doctor` |
| LedgerCap | PSX/funds tracker + Worker | Vanilla JS + bundle | `npm run serve` | `npm run bundle && npm test && npm run test:a11y && npm run verify` |
| MasteryCap | Bilingual learning | Vanilla JS | existing serve script | `npm run audit && npm run smoke && npm run e2e && npm run lighthouse && npm run verify` |
| PrismCap | Pass-and-play games | Vanilla + Vite | `npm run dev` | `npm run build && npm run verify` |
| PulseCap | Training | Vanilla JS | `npm run serve` | `npm test && npm run verify && npm run device-matrix` |
| ScentCap | Fragrance wardrobe | React 19, Vite, Capacitor 8 iOS | `npm run dev` | `npm run lint && npm run build && npm run verify && npm run matrix`; `npm run build:cap && npm run cap:sync` |
| SoulCap | Self-regulation tools (PWA in `docs/`) | Vanilla JS | `npm run dev` | `npm run test:safety && npm run verify` |
| SteadyCap | Recovery companion | Vanilla JS | `npm run serve` | `npm test && npm run verify` |
| TravelCap | Travel organizer | Next 16 static export | `npm run dev` | `npm run typecheck && npm run lint && npm run build:export && npm run verify` |
| VaultCap | Encrypted vault | Vanilla JS, WebCrypto | `npm run serve` | `npm run audit:xss && npm run test:e2e && npm run test:a11y && npm run test:e2e:safari && npm run verify` |
| capricorn-lab → shamikhahmed.github.io | Capricorn OS website (canonical per D-13) | Vite + three.js | `npm run dev` | `npm run build` + hub `npm test` |

**Release truth rule (every vanilla/PWA repo):** `VERSION.json` + `window.APP_VERSION` + `sw.js` cache name + SW register query in `index.html` (+ `package.json` version where present) change together, with CHANGELOG, `changelog.html`, HANDOVER and a dated Brain Decisions line.

---

## 4. Locked decisions — summary (full text and approved copy in `DECISIONS.md`)

| ID | Decision (execute) |
|---|---|
| G-1 / D-01 | All apps Tier 1 as PWAs. Native-ready + store pack (no submission): ScentCap, VaultCap (add Capacitor 8 iOS). DeeFoodie: private TestFlight pack. IdeaCap: native builds compile + packs. Others PWA-only. No Play submissions. Store dimensions N/A except those apps. |
| G-2 / D-11 | Everything free. Remove Pro/paywall/upgrade UI and gates. |
| G-3 / D-07 | "Cap" names everywhere (TravelCap, PrismCap; DeeFoodie user-facing). No "OS" in product descriptions. Website keeps "Capricorn OS". |
| G-4 / D-12 | Publisher Capricorn Systems, Karachi, Pakistan. Per-app `privacy.html`. Support page `shamikhahmed.github.io/support.html` → GitHub issues on the hub repo. No personal email/phone. |
| G-5 | Approved dependencies list; otherwise no-dependency solutions first. |
| G-6 | Data/crypto migrations allowed under backup + idempotent + rollback + fixture-test rules. |
| G-7 | Approved copy in DECISIONS §4 is final. |
| G-8 | Every release bumps version + SW cache; hotfix = patch; Tier 1 = minor; CarCap & TravelCap → 1.0.0; IdeaCap → 2.0.0; DeeFoodie → 1.0.0+build. |
| G-9 | No analytics, no third-party runtime scripts, self-host fonts. |
| G-10 | Shared optional app lock (`shared/security/local-lock.js`) for SoulCap, SteadyCap, TravelCap documents. |
| D-02 | IdeaCap rebuilt from 1.2.1 to a real 2.0.0. |
| D-03 | PulseCap: damage → restore from HEAD; preserve branch untouched. |
| D-04 | DeePonyCap: remove all third-party IP from bundled content; user-defined series; never modify user data; non-affiliation line. |
| D-05 | SoulCap: region-aware Help with officially verified numbers (omit unverifiable); approved copy; age gate copy. |
| D-06 | PrismCap: Four in a Row · Clue Grid · Word Dodge + changed distinctive elements; review all 39 names. |
| D-08 | VaultCap: network logos and LLM import opt-in, default off (existing installs off); model `claude-haiku-4-5`. |
| D-09 | LedgerCap: Worker-only, attribution, disclaimer, PWA-only. |
| D-10 | DeeFoodie: private TestFlight, per-user bearer tokens (hashed server-side, Keychain client-side), in-app Delete my data. |
| D-13 | capricorn-lab is canonical for the website; port passing os-next modules; archive os-next. |
| Q-3 | SoulCap Now simplified (order in DECISIONS). |
| Q-4 | SoulCap app lock (G-10) — required for Tier 1. |
| Q-5 | SoulCap: manual module split + lazy JSON + SW precache first; esbuild only if G9 fails. |
| P-* | Product decisions table in DECISIONS §5 (AuraCap score/naming, SteadyCap SOS tab, TravelCap tabs, CookCap count, MasteryCap name prompt, DeeFoodie naming, CarCap reminders, PrismCap gate removal, marketing JS removal, VaultCap KDF re-wrap, website legacy pages, SoulCap lab folders, DeePony releases, LedgerCap settings, fonts, IdeaCap labels). |

---

## 5. Copy standards

Plain, calm, specific, second person, sentence case, no exclamation marks, no internal metaphors in controls, no arrow glyphs in labels. Buttons are verbs ("Add car", "Save visit", "Refresh prices"). Errors = what happened + what to do ("Couldn't load prices. Check your connection and try again."). Empty states = title + one sentence + one action ("No trips yet" / "Plan your first trip to see it here." / "New trip"). Destructive = object + irreversibility ("Erase all data? This removes everything stored on this device and can't be undone."). Dates via `Intl.DateTimeFormat` in the user's locale. PKR totals via `Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })`. Version numbers only in Settings → About. Never call rule-based features AI. Descriptions, disclaimers, crisis content and privacy pages: exact text from DECISIONS §4.

**Glossary (UI strings; internal names unchanged)**
| Current | Use |
|---|---|
| Control Center (AuraCap) | Overview |
| Digital DNA (page) | Setup report |
| Frosted DNA · private on device | Your setup at a glance. Stored only on this device. |
| demo wardrobe (AuraCap banner) | sample data |
| Start mine / Start my own | Use my collection / Use my apps / Use my data |
| Smart Assistant analyzes… | Describe the action: "Summary", "Next steps" |
| Hub · Watch · Funds · P&L · Analyze (LedgerCap) | Home · Watchlist · Funds · Performance · Research |
| Your wealth · v3.27.0 | Your wealth |
| 100% of holdings on seed/fallback prices (snapshot …) | Prices are from {date}. They update during market hours (Mon–Fri, 9:30–15:30 PKT). |
| 0/1 med slots · 0/1 showing up today | Medicines today: 0 of 1 taken |
| 12-DAY CHECK-IN STREAK · 12d showing up | Checked in on 12 of the last 14 days |
| You missed Nicotine patch. No pressure — tap to check off when ready. | Nicotine patch · due 08:00 — [Taken] [Skip] |
| One-tap help · Craving protocol · breathe · act · survive | (card removed; SOS tab) |
| Demo mode — Alex recovery profile in isolated storage. | Sample profile (Alex). Your data isn't affected. |
| Hello, Learner | Today (or "Hello, {name}") |
| Cover title becomes *YourName Cooks*. Change later from the ··· menu. | We'll call it *{Name} Cooks*. You can change this in Settings. |
| START WORKOUT · CAN'T TRAIN TODAY? | Start workout · Can't train today? |
| Collector Mode — Clean catalog view — less sparkle, more data | Compact view — More per row, fewer effects. |
| GLOVEBOX · KEY FOB | (remove) |
| TravelOS · PrismOS | TravelCap · PrismCap |
| All models supported | (remove with device gate) |
| Cork board · Sticky inspector · Chat with this idea · Smart analysis | Ideas · Details · Ask about this note · Summary |

---

## 6. Engineering rules

1. Understand before changing: read the path end to end; write "current behavior" in LOG.md first.
2. Smallest appropriate change; no rewrites, framework swaps, mass reformatting or cosmetic renames.
3. Dependencies: DECISIONS G-5 only.
4. Business logic you don't fully understand (financial math, zakat/tax, SoulCap safety kernel, SteadyCap SOS, VaultCap crypto, training/nutrition math, CookCap recipe gates): add characterization tests first, then change only presentation unless an item says otherwise.
5. Storage/schema/export/SW changes follow DECISIONS G-6 with fixture tests.
6. Preserve integrations: Workers, Pages base paths, SW scopes, deep links, manifest shortcuts, export/import formats.
7. Shared tooling changes must keep every consuming repo green.
8. One concern per commit, conventional messages with item IDs; branch `finish/<app>`; git automation per §17.
9. No fake claims; no AI/OS/medical/financial overclaims.
10. No secrets in client code (`EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`, `window.*`).
11. Every bug fix gets a regression test that fails before and passes after.
12. Major changes (new module, navigation change, storage change) get a short design note in LOG.md (alternatives + trade-offs + chosen option) and then **proceed** — no waiting.

---

## 7. Blocked-external protocol (the only kind of block that exists now)

Use only when an item is physically impossible right now: missing hardware (no physical iPhone/Android), missing owner credentials (Apple Developer, TestFlight, Play Console), toolchain not installed and not installable without owner accounts, or an external service outage.
1. Do every part that is possible (code, tests, simulator/emulator/WebKit verification, CI build, docs, store pack).
2. Log `⛔ BLOCKED-EXTERNAL: <what exactly is missing>` in LOG.md, PROGRESS.md and the app report, stating what remains unverified.
3. Continue immediately with the next item.
4. A BLOCKED-EXTERNAL item does not stop the app from closing if every Tier 1 gate is met by the strongest available verification; the report lists what still needs a human with that hardware/account.
Never classify a decision, a hard problem, flaky tests, or unfamiliar code as blocked. Solve them.

---

## 8. The loops

### 8.1 App loop (outer — one app at a time)
```
SELECT APP → BASELINE → QUEUE → ITEM LOOP → FALLBACK QUEUE → FULL-PRODUCT AUDIT → RE-SCORE
   ↑                                                                              │
   └────────────── gates fail: add items ◄────────────────────────────────────────┤
                                                                                  ▼
                                    gates pass: §16 artifacts → §17 release → APP-REPORT → NEXT APP
```
1. **Select** per §13.0 (or `START AT` / PROGRESS.md).
2. **Baseline** (if not already done for this app): branch `finish/<app>`; run all verify commands (pass/fail counts); finish-matrix, axe, Lighthouse on primary routes; token/kill-list metrics (raw hex, sub-11px text, `!important`, unescaped sinks, native dialogs, emoji icons, `outline:none`, console errors); score with §14.2. Save `<repo>/qa/finish-loop/BASELINE.md`.
3. **Queue:** this app's §13 items (P0 → P1 → P2) + every baseline failure of a Tier 1 gate (`<APP>-NEW-<n>`), each with severity and "Done when".
4. **Item loop** (§8.5) in severity order.
5. **Fallback queue** (§8.2) whenever the queue is empty.
6. **Full-product audit:** every screen and state in the app's inventory (FLEET-AUDIT §C + STATES.md) at 320, 375, 430, 768, 1440 in light and dark; keyboard-only; screen reader for primary journeys. Every defect → new item.
7. **Re-score** (§14.2). Any gate failing → back to step 4. No round limit.
8. **Close:** §16 (screenshots, gallery, docs, website entry, cleanup) → §17 release → `APP-REPORT.md` (§15.1) → PROGRESS.md → Brain line → next app.

### 8.2 Fallback queue (use whenever you would otherwise stop)
For the current app, in order: (1) failing Tier 1 gates · (2) STATES.md gaps · (3) finish-matrix failures across 15 viewports × 2 themes · (4) axe / Lighthouse / keyboard / screen-reader gaps · (5) kill-list and token violations app-wide · (6) copy sweep against §5 · (7) performance budgets · (8) security/privacy (sinks, storage, network log vs privacy page) · (9) tests for every primary journey and bug fixed · (10) docs sync · (11) BLOCKED-EXTERNAL items re-checked for any newly possible part · (12) a fresh full-product audit round.
Only when all are clean may the app close.

### 8.3 Forbidden shortcuts (absolute)
- Skipping/deleting/weakening tests, adding `.skip`/`.only`/`fixme`, loosening assertions, raising timeouts to hide races.
- Updating snapshots or golden screenshots without a recorded visual review.
- `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `any`, analyzer `ignore` comments to get green.
- `!important`, `overflow:hidden`, `display:none`, ellipsis or shrinking text below tokens to hide overflow/collisions.
- Removing or hiding features, screens or states to make bugs disappear (unless DECISIONS says so).
- Test-only branches in product code (only allowed hook: `window.__APP_READY__`).
- Lowering any gate, budget or threshold in this prompt or CI.
- Marking ✅ without §14.3 evidence; claiming device/browser testing that didn't happen.
- Fixing one instance when the same defect exists elsewhere — fix the shared cause.
- Silencing console errors/warnings.
- `git stash`, force-push, `--no-verify`.
- Declaring an app finished because listed items are done — only §14.1 decides.

### 8.4 Continuity — `docs/audit-2026-09-14/PROGRESS.md`
Update at every item boundary:
```
Updated: <ISO time> · Prompt: v2
Current app: <App> (<n>/16) · round <r> · score <baseline> → <current>
Current item: <ID> · loop step · files in flight
Next 5 actions: …
BLOCKED-EXTERNAL: <item — what's missing>
Apps completed: <App> v<version> score <n> tag <tag> live <url>
Last green checkpoint per repo: <repo>@<sha>
```
Commit and push at every green checkpoint. On `RESUME` or any new session: read this prompt → DECISIONS.md → PROGRESS.md → current app's LOG.md + BASELINE.md → continue from "Next 5 actions".

### 8.5 Item loop (inner — every item)
`AUDIT → PLAN → IMPLEMENT → TEST → VISUALLY REVIEW → FIX → RE-TEST → RECORD → NEXT`
1. Inspect and reproduce (screenshot or failing test). Record current behavior.
2. Plan (≤ 15 lines): files, what not to touch, expected result, verification.
3. Implement the smallest change.
4. Regression: repo verify + the new test.
5. Responsive: affected screens at 320, 344, 375, 393, 430, 768, 1024, 1440 (+2560 for desktop layouts), light and dark. No overflow, clipping, collisions, obscured controls, truncation, awkward whitespace.
6. Accessibility: axe 0 serious/critical; keyboard order, visible focus, Esc closes overlays, focus returns; names for every touched control; 200% text; reduced motion; forced colors where CSS changed.
7. Platform: iOS Safari tab + standalone PWA (safe areas, in-app back), Android Chrome (back closes overlays first), desktop Chrome/Safari/Firefox.
8. Every other usage of the changed component/selector/string.
9. Fix inconsistencies found; re-test 4–8.
10. Record in LOG.md; ✅ only when "Done when" is fully met.

```
### <ID> — <title>                                   status: ⏳/✅/⛔ BLOCKED-EXTERNAL
Current behavior: …
Plan: files … | not touching … | expected …
Changes: <file:line summary>
Verify: verify=<counts> · axe=<n> · matrix=<shots, overflow 0?> · manual=<iOS/Android/desktop>
Screens re-checked: …
Residual risk: …
```

---

## 9. Verification toolkit

**Always:** build, typecheck, lint with 0 errors and no new warnings; all tests green, count not decreasing; review `git diff --stat` before commit.

**Responsive matrix** — `capricorn-tooling/shared/testing/finish-matrix.js` (create if missing) exports viewports `tiny-se1 320×568 · fold-cover 344×882 · android-s 360×780 · iphone-se3 375×667 · iphone-16 393×852 · iphone-17 402×874 · pixel 412×915 · promax 440×956 · phone-land 844×390 · fold-open 673×841 · ipad-mini 744×1133 · ipad-land 1180×820 · laptop 1366×768 · desktop 1920×1080 · wide 2560×1440`, plus helpers `assertNoHorizontalOverflow`, `assertNotObscured(selector)` (via `elementFromPoint` at the element's center) and `waitForAppReady` (`window.__APP_READY__`). Each web repo runs `tests/finish-matrix.spec.*` over primary routes × viewports × light/dark, saving to `qa/finish-loop/shots/`, failing on overflow or an obscured primary control. Emulate `reducedMotion`, `colorScheme`, `forcedColors`; 200% text via `html{font-size:200%}` for rem layouts; offline via `context.setOffline(true)`; slow network via CDP (400 ms latency, 400 kbps).

**Accessibility:** `@axe-core/playwright` on every route in both themes (0 serious/critical); Lighthouse accessibility ≥ 95. Flutter: `meetsGuideline` for text contrast, Android/iOS tap targets and labeled tap targets on Home, Add Visit, Journal, Map. React Native: every pressable has `accessibilityRole` + `accessibilityLabel`; run iOS Accessibility Inspector / Android Accessibility Scanner when available.

**Manual device script:** for each changed journey record iPhone (Safari tab + standalone) at default and largest text size with one VoiceOver pass, Android Chrome installed PWA with one TalkBack pass, and desktop Safari/Chrome/Firefox at 1366 and 2560. If hardware is unavailable, use simulators/emulators/WebKit, and say so (§7).

**Performance:** Lighthouse mobile before/after on primary routes (LCP, TBT, CLS, JS). Flutter DevTools frame chart on Home scroll and Journal page flip. Expo release-build cold start.

**Live smoke (every release):** Playwright against the live URL — HTTP 200, `__APP_READY__`, new SW cache name active, 0 console errors, primary journey passes.

---

## 10. Cap Foundation design system

**Location:** `capricorn-tooling/shared/design/` — `tokens.json` (source) → generated `cap-foundation.css`, `tailwind-theme.css`, `cap_tokens.dart`, `tokens.ts` (plain Node script). Each app keeps only a brand file (`--accent`, `--accent-contrast`, `--accent-text`, optional `--font-display`, optional atmosphere). `audit:tokens` fails CI on raw hex, raw z-index, font-size < 11px, `user-scalable=no`, `outline:none` without `:focus-visible` replacement — for changed files during work, app-wide at Tier 1 (G6).

**Tokens:** spacing 0/2/4/8/12/16/20/24/32/40/48/64 · screen margin 16 (<400w) / 20 / 24 (≥700) · card padding 16 · row min-height 44 · radius xs 6 / sm 10 / md 14 / lg 20 / full 999 · elevation e0 none / e1 `0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)` / e2 `0 8px 24px rgba(0,0,0,.12)` (dark: surface steps) · z-index base 0 / sticky 10 / tabbar 20 / fab 30 / banner 40 / sheet 50 / modal 60 / toast 70 / splash 80 · motion press 120 / small 200 / sheet 280 / page 350 ms, `cubic-bezier(.2,.8,.2,1)`; reduced motion = opacity only ≤ 120 ms · touch ≥ 44×44 (48 dp native Android), ≥ 8 px apart.

**Type (size/line/weight):** largeTitle 34/41/700 · title1 28/34/700 · title2 22/28/600 · title3 20/25/600 · headline 17/22/600 · body 17/22/400 (web 16/24 ok) · callout 16/21/400 (all inputs ≥ 16) · subhead 15/20/400 · footnote 13/18/400 · caption1 12/16/500 · caption2 11/13/500 (tab labels only). Desktop ≥ 1024: largeTitle 40/48, body 16/24. `tabular-nums` for money/stats/timers. UI family `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`; one optional self-hosted display face per app for largeTitle/title1. Web Dynamic Type: `@supports (font: -apple-system-body) { html { font: -apple-system-body; } }` + rem. **Banned in UI text:** pixel fonts, handwriting, monospace labels, uppercase tracking > 0.04em, emoji as icons.

**Color roles (light + dark):** `--bg --bg-grouped --surface --surface-2 --separator --text --text-secondary (≥4.5:1) --text-tertiary (≥3:1, non-essential) --accent --accent-contrast --accent-text --success(-text) --warning(-text) --danger(-text) --focus --scrim --material-bar`. Material bar: `color-mix(in srgb, var(--surface) 85%, transparent)` + `-webkit-backdrop-filter`/`backdrop-filter: saturate(180%) blur(20px)` + 0.5px top separator; solid surface under `prefers-reduced-transparency` or no backdrop-filter support. Contrast script checks every pair.

**Components (same behavior everywhere):** Button (primary/secondary/tertiary/destructive; 44/50; sentence case; one primary per region; loading keeps width + `aria-busy`) · IconButton (44, accessible name) · Switch (`role="switch"`, `aria-checked`) · SegmentedControl · ListRow (icon 28, headline title, subhead subtitle, trailing value/chevron) · Card (radius md, padding 16, never nested) · Sheet (handle, radius lg, `max-height:90dvh`, safe-area padding, drag/Esc/backdrop dismiss, focus trap, focus to title, Android back closes) · Banner (inline in flow, ≤ 1 action, never fixed over content) · Toast (above tab bar, 4 s, `role="status"`, optional Undo) · ConfirmDialog (replaces every `confirm()`; title states consequence; destructive button names the action; Cancel default focus) · EmptyState · ErrorState (plain what + what to do + Retry) · Skeleton (no shimmer under reduced motion) · TabBar (≤ 5, SVG icons, caption2 sentence case, material bar, 49 + safe area, `aria-current`) · Sidebar (≥ 700 px, 240 wide; MasteryCap keeps tabs; SoulCap ≥ 900) · DemoBanner (inline "Sample data" + "Use my data") · Splash (first launch only, ≤ 600 ms, skipped under reduced motion, sets `__APP_READY__` path).

**Kill list (Tier 1 = zero app-wide):** emoji icons · pixel/handwriting/monospace UI text · wide uppercase tracking · version numbers in headings · OS/DNA/Kernel/Bureau/Museum/Atelier/Maison jargon in UI · overlay demo banners · splash every cold load · marketing JS in app shells · native `alert/confirm/prompt` · `user-scalable=no` · bare `outline:none` · bare `100vh` (use `100dvh` with fallback) · raw hex outside token/brand files · text < 11px.

---

## 11. Platform, security, performance, accessibility, reliability, states

**PWA (all apps):** `viewport-fit=cover`, no zoom lock; safe-area insets on nav bar, tab bar, sheets, toasts, FAB, lock screens; inputs ≥ 16px; in-app back on every pushed screen; Android back closes overlays first (history entry per sheet); light/dark `theme-color`; manifest name/short_name/description per DECISIONS §4.1, maskable icons, `display: standalone`, no orientation lock for reading apps; SW: HTML network-first, static cache-first, versioned cache, "A new version is ready — Reload" prompt (never silent reload mid-task); offline primary journey.

**iOS native (ScentCap, VaultCap, DeeFoodie, IdeaCap):** Xcode 26 + iOS 26 SDK (required for uploads since 28 Apr 2026); app-level `PrivacyInfo.xcprivacy` declaring required-reason APIs actually used and data collection; `ITSAppUsesNonExemptEncryption` (false unless custom crypto beyond standard OS/WebCrypto use — VaultCap uses standard encryption: set per Apple's exemption and document); specific purpose strings requested in context; Dynamic Type; Dark Mode; WebView background = page `--bg`; haptics only for confirmations/selection. **Store pack** `docs/store/`: `APP-STORE.md` (name ≤ 30, subtitle ≤ 30, description from §4.1 expanded, keywords, support + privacy URLs, age rating answers, review notes incl. demo access), `PRIVACY-LABELS.md`, `SCREENSHOTS.md` (real captures at current required sizes).
**Android (IdeaCap only):** target API 36 (required for Play updates since 31 Aug 2026), edge-to-edge, predictive back enabled and tested, Photo Picker, 16 KB page size compatible, runtime notification permission in context, `docs/store/PLAY-DATA-SAFETY.md`.

**Security & privacy:** no secrets (scanner in every CI); no third-party runtime scripts; self-hosted fonts; every network destination listed in privacy page and CSP; escape all user/remote strings in `innerHTML` (text and attribute contexts) or use DOM APIs, with an injection test (`"><img src=x onerror=alert(1)>`) on every user-editable field; Export + Erase all data with ConfirmDialog; fictional fixtures only; no production `console.log` of user data; G-10 lock for sensitive apps.

**Performance budgets:** Lighthouse mobile performance ≥ 90 on primary routes; LCP ≤ 2.5 s; TBT ≤ 200 ms; CLS ≤ 0.1; app-shell JS ≤ 170 KB gzip; route JS ≤ 100 KB gzip; images sized with width/height, modern formats, lazy below fold; heavy libraries (tesseract, leaflet, recharts, xlsx, pdf) loaded on interaction; no decorative WebGL in product apps; native cold start ≤ 2 s. Revert optimizations that don't move metrics.

**Accessibility (WCAG 2.2 AA):** contrast 4.5:1 text / 3:1 UI; 200% text without loss; reflow at 320; 2px `--focus` ring with 2px offset; targets ≥ 44; keyboard operable; names/roles/values; live regions for status; no color-only meaning; reduced motion; `lang="ur" dir="rtl"` for Urdu, `lang="ur-Latn"` for Roman Urdu; errors in text with `aria-invalid` + `aria-describedby`.

**Reliability:** loading state after 300 ms; success feedback; failure + retry; idempotent retry; no double submit; interrupted imports/migrations resume or roll back, each with a test.

**States (`qa/finish-loop/STATES.md`, per primary journey):** first use · empty · loading · success · error · offline · no results · partial data · permission denied · expired session (if accounts) · invalid input · destructive confirmation · network failure · server failure · slow network · interrupted operation. N/A only with a reason.
Primary journeys — AuraCap: import → overview → organize · CarCap: add car → log service → reminder · CookCap: onboard → recipe → cook mode → shopping list · DeeFoodie: Home → log visit with photo → journal · DeePonyCap: add item with photo → wishlist · IdeaCap: record → transcript → save → find · LedgerCap: add holding → refresh → performance · MasteryCap: start session → lesson → records export · PrismCap: pick game → players → play → exit · PulseCap: start workout → log set → finish → progress · ScentCap: add bottle → today's pick → wear · SoulCap: check-in → technique → journal → help · SteadyCap: add medicine → taken/skip → SOS · TravelCap: create trip → add transit → scan document · VaultCap: set PIN → add account → lock/unlock → export · Website: lock screen → open app from dock/grid → app detail → live app.

---

## 12. Screen-level reference

Observed defects and their replacements per screen are in FLEET-AUDIT §C. Treat each row there as a required change inside the app's queue (IDs `<APP>-C-<n>` in order of the table).

---

## 13. Backlog

### 13.0 Execution sequence (one app at a time)
| Step | Work | Exit |
|---|---|---|
| R | Corrections C-01…C-08 (§2.2) | all ✅ with live evidence |
| B | Remaining Phase 0: FLT-04 upstream tracking (via §17.1), FLT-06 truth check in every repo's verify, FLT-07 `__APP_READY__` + gallery wait in every repo, FLT-08 CI guards (secret scan, changed-file token audit, finish-matrix, deploy-needs-CI) | ✅ |
| 1 | **SoulCap** (continue on `finish/soulcap`) | §14.4 |
| 2 | ScentCap (+ FND-04 React adapters) | §14.4 |
| 3 | MasteryCap | §14.4 |
| 4 | CookCap | §14.4 |
| 5 | VaultCap | §14.4 |
| 6 | PulseCap | §14.4 |
| 7 | SteadyCap | §14.4 |
| 8 | TravelCap | §14.4 |
| 9 | LedgerCap | §14.4 |
| 10 | AuraCap | §14.4 |
| 11 | CarCap | §14.4 |
| 12 | PrismCap | §14.4 |
| 13 | DeePonyCap | §14.4 |
| 14 | DeeFoodieApp (+ FND-05 Dart tokens) | §14.4 |
| 15 | IdeaCap (+ FND-06 RN tokens) | §14.4 |
| 16 | Website: capricorn-lab → shamikhahmed.github.io (+ os-next port/archive per D-13) | §14.4 |
| C | Fleet re-verification: every app's gates re-run; regressions fixed in that app's loop | all pass |
| D | FINAL-REPORT.md (§15.2) + final workspace cleanup (§16.4) | done |

Inside every app: P0 → P1 → P2 (P2 is mandatory wherever a Tier 1 gate depends on it) → FLEET-AUDIT §C rows → fallback queue → full-product audit → re-score, repeating until Tier 1. P3 is out of scope.

Item format: **Inspect** · **Change** · **Don't touch** · **Done when** · **Verify**.

### SoulCap
- **SOUL-P0-02 Help + age gate (D-05).** Inspect current Help flow, redflag panel, age gate, `SAFETY.md`, safety tests. Change: region-aware Help and age gate exactly per DECISIONS §4.3; verify each number from its official source (record URL + date in `SAFETY.md`; omit unverifiable helplines); bundled for offline; `tel:` buttons; persistent "Get help now" on every tab. Don't touch: safety kernel keyword logic except to route to the new Help screen. Done when: every region renders offline, numbers match recorded sources, item-9 and red-flag paths land on Help, under-18 path shows emergency numbers. Verify: `npm run test:safety` extended (region switching, offline, under-18, item-9), axe, VoiceOver pass.
- **SOUL-P1-04 Now simplification (Q-3).** Order per DECISIONS Q-3; everything else under "More", functionally unchanged. Done when: first viewport at 375×667 shows greeting, check-in, suggested technique with Begin, and "Get help now" without scrolling; existing Now tests updated to new structure with no lost coverage.
- **SOUL-P1-05 App lock (Q-4, G-10).** Build `capricorn-tooling/shared/security/local-lock.js` (framework-free, WebCrypto) + SoulCap integration: Settings → Privacy → "App lock"; encrypt journal, check-ins, people map, manual, principles, reflection results; G-6 migration; auto-lock; forgot flow; WebAuthn unlock where available. Done when: tests cover enable/disable, wrong passcode delays, forgot → erase, migration from fixture, export while locked requires unlock, reload-while-locked shows lock before any content paints. Verify: unit tests for the module + SoulCap e2e + axe on lock screen.
- **SOUL-P1-06 Performance (Q-5).** Route-module split + lazy JSON + SW precache; measure; esbuild fallback only if G9 still fails.
- **SOUL-P2 set:** type/token migration app-wide, sub-11px cleanup (19), native dialogs (3), `outline:none` (3), self-hosted fonts, privacy page from template (hosted `docs/privacy.html`), disclaimers per §4.2, gallery regenerated with fictional names, `backend/` + `mobile/` documented as lab and excluded from Pages (P-SOUL-2).

### ScentCap
- **FND-04** React wrappers in `src/components/ui/` consuming shared tokens (no UI library).
- **SCNT-P1-01 Monogram & flacon label:** initials skip `&`/articles/particles ("D&G"); label fits or is decorative `aria-hidden` with full accessible text; unit tests: "Dolce & Gabbana", "Maison Francis Kurkdjian", "Yves Saint Laurent", "Le Labo".
- **SCNT-P1-02 Today:** remove duplicate score, duplicate temperature and "SCENTCAP" eyebrow; reason sentence from advisor rules; "Start mine" → "Use my collection".
- **SCNT-P1-03 Native pack (G-1):** `ios/App/App/PrivacyInfo.xcprivacy`; `ITSAppUsesNonExemptEncryption=false`; purpose strings reviewed; Xcode 26 build (`xcodebuild -scheme App -sdk iphonesimulator build`); haptics on Wear; Dynamic Type in WKWebView; `docs/store/*`; rebuild `ios/App/App/public` via `npm run build:cap && npm run cap:sync`.
- **SCNT-P1-04** `!important` reduction to overrides only (209 today).
- **SCNT-P1-05 Brand art:** generic flacon shapes, no logos/trade dress; About disclaimer (§4.2).
- **SCNT-P1-06** Resolve the 2 pre-existing dirty files: commit to `preserve/pre-finish-2026-09-14` (if not already), then port only what is correct and tested.
- **SCNT-P1-07** Remove `LAUNCH_PREVIEW`/Pro gating (G-2).
- **SCNT-P2** location asked only on "Use my location" with manual city fallback; camera denied / limited photos states; self-hosted fonts; privacy page.

### MasteryCap
- **MST-P0-01 Enable zoom** (`width=device-width, initial-scale=1, viewport-fit=cover`); fix anything relying on no-zoom (`touch-action: manipulation` on buttons).
- **MST-P0-02 Sandbox code runner:** learner code in `sandbox="allow-scripts"` `srcdoc` iframe (no same-origin) or Worker via `postMessage`, 2 s timeout, output cap; main CSP without `unsafe-eval`; test proves app `localStorage`/`document.cookie` unreachable.
- **MST-P1-01 Today (P-MST-1):** name prompt; one primary CTA "Start today's session · 15 min"; "Open Foundations" as ListRow; "Your standing" hidden at 0%; white label on accent (contrast verified, darken accent if needed).
- **MST-P1-02** section labels per type tokens · **MST-P1-03** replace 17 native dialogs · **MST-P1-04** sub-11px cleanup (39) · **MST-P1-05** Urdu `lang/dir` audit · **MST-P1-06** disclaimers (§4.2) on About, Markets intro, certificate.

### CookCap
- **COOK-P1-01 Header** no truncation 320–430; book title only ≥ 600px; profile button labeled.
- **COOK-P1-02 Hero eyebrows** sans 12px semibold 0.02em over bottom scrim.
- **COOK-P1-03 Icons** Prep clock · Cook timer/pot · Cal flame.
- **COOK-P1-04** single footnote "Nutrition values are estimates."
- **COOK-P1-05 Scrubber/counter** no overlap; recipe count from one function (P-COOK-1) with a test that cover, reader, About and website agree.
- **COOK-P1-06 Onboarding:** cover interaction disabled during name sheet; micro-label collision removed; glossary copy with live name preview.
- **COOK-P1-07 Tests:** Playwright specs onboarding → recipe → cook mode → shopping list → backup/restore.
- **COOK-P1-08 Image rights ledger:** `images.lock.json` gains `source`, `license`, `attribution` per hero; any hero whose license can't be established → replaced with a licensed alternative (Unsplash with attribution) or the illustrated placeholder; attribution visible in recipe credits.
- **COOK-P1-09** privacy page (template) · **COOK-P2** tracked-serif/uppercase cleanup app-wide, forced-colors check, reduced-motion parity for dresser/cover/page-curl.

### VaultCap
- **VLT-P0-02 Network features (D-08):** implement opt-in logos and per-use LLM consent, migration to off, model `claude-haiku-4-5`, CSP/privacy update. Test: default click-through makes zero requests to `workers.dev`.
- **VLT-P0-03 PIN hardening (P-VLT-2):** document KDF in `SECURITY.md`; re-wrap on unlock if weaker than PBKDF2-SHA-256 600k (G-6); tests: killed mid-onboarding → `123456` can't unlock a non-demo vault; lockout escalation; decoy PIN never reveals real data.
- **VLT-P1-01** remove marketing JS from app shell (P-VLT-1) · **VLT-P1-02** foundation on lock, onboarding, dashboard, settings (Switch, ConfirmDialog replacing 16 `confirm()`, Banner, Toast) · **VLT-P1-03** sub-11px elimination (297) · **VLT-P1-04** demo sheet: focus title, SVG icon, ordered list, "Start exploring" · **VLT-P1-05** Capacitor 8 iOS project + store pack + privacy manifest (G-1) · **VLT-P1-06** `innerHTML` audit on finance hubs and import preview (`qa/finish-loop/SINKS.md`) · **VLT-P1-07** remove VaultPro gating (G-2) · **VLT-P2** raw hex (229) and shadows (72) to tokens, z-index to tokens (38 values), `style-src 'unsafe-inline'` reduction where touched, self-hosted fonts.

### PulseCap
- **PLS-P0-01 Restore (D-03)** on `finish/pulsecap` from `origin/main`; restore CI workflow and `.gitignore`; version truth in `CLAUDE.md` files; clean tree.
- **PLS-P1-01** sentence-case buttons/tab labels, no tracking, solid accent with verified label contrast · **PLS-P1-02** Today: remove duplicate Progress button, actionable insight rows, inline DemoBanner · **PLS-P1-03** sub-11px cleanup (77) · **PLS-P1-04** safe areas on tab bar, active workout controls, rest timer, toasts · **PLS-P1-05** disclaimer (§4.2) on About, onboarding final step, Rehab · **PLS-P2** tokens, self-hosted fonts, privacy page current (wger destination), "Smart Coach = rules" wording kept.

### SteadyCap
- **STDY-P1-01 Today (P-STDY-1)** · **STDY-P1-02** glossary copy · **STDY-P1-03** disclaimer (§4.2) on About and medicine add · **STDY-P1-04** sub-11px cleanup (83) · **STDY-P1-05** replace native dialogs (7) · **STDY-P1-06** app lock (G-10, shared module) covering medicines, cravings, journal · **STDY-P1-07** emoji → SVG icons app-wide; material tab bar with content padding · SOS e2e remains a release blocker and must pass.

### TravelCap
- **TRVL-P1-01 Naming (G-3):** TravelCap in manifest, title, splash, metadata, website.
- **TRVL-P1-02 Lazy heavy libraries:** tesseract only after "Scan" (progress, cancel, failure state); leaflet/recharts per route.
- **TRVL-P1-03 Documents lock** (G-10) + export warning.
- **TRVL-P1-04 IA (P-TRVL-1):** Trips · Explore · Documents · More; redirects from old routes; tests for every old URL.
- **TRVL-P1-05** privacy page (Nominatim, restcountries, Open-Meteo, Frankfurter, AviationStack with user key) · **TRVL-P1-06** AviationStack HTTPS check + plain error when the plan lacks HTTPS · **TRVL-P1-07** disclaimer (§4.2) · **TRVL-P2** "Bureau/Bearer/Bound in gold" copy removed from UI.

### LedgerCap
- **LDG-P0-02 Header (P-LDG-1):** row 1 title + "…" menu; row 2 single-line market status; language/currency/theme to Settings → General; no fullscreen button; "Your wealth". Done when: 0 overflow/obscured at 320–440 in English, اردو (RTL) and Roman Urdu.
- **LDG-P0-03 Sinks:** classify all 212 `innerHTML`; escape user/remote sinks or use DOM APIs; injection tests for holding names, notes, Telegram fields; `qa/finish-loop/SINKS.md`. Edit source modules then `npm run bundle` (never hand-edit the bundle).
- **LDG-P1-01** one freshness line (source attribution per D-09), one Refresh, pull-to-refresh · **LDG-P1-02** totals without paisa, tabular numerals, sign + ▲/▼ · **LDG-P1-03** tabs Home · Watchlist · Funds · Performance · Research with SVG icons · **LDG-P1-04** replace 38 native dialogs · **LDG-P1-05** strip production `console.log` (57) · **LDG-P1-06** disclaimer (§4.2) on About, Research, Signals · **LDG-P1-07** Telegram token masked, removable, never logged · **LDG-P1-08** response validation (finite, positive, within ±20% of last close) with last-good fallback.

### AuraCap
- **AUR-P0-01** hide rail < 700px; skip link hidden until focus; content bottom padding.
- **AUR-P0-02** copy: sample data banner, "Overview", "Setup report", normalized device names (unit test "iphone 16promax" → "iPhone 16 Pro Max"), remove "LIVE" on sample data.
- **AUR-P1-01** header single row + overflow menu; theme to Settings · **AUR-P1-02** one Aura Score + breakdown (P-AUR-1) · **AUR-P1-03** remove three.js + GSAP (P-AUR-2), measure bundle · **AUR-P1-04** monospace labels → tokens · **AUR-P1-05** quick access de-duplicated (max 4, none duplicating tabs) · **AUR-P1-06** honest import copy ("Paste or type your apps") · **AUR-P1-07** Apple trademark disclaimer (§4.2); no Apple device art/logos · **AUR-P1-08** remove Pro scaffolding (G-2).

### CarCap
- **CAR-P1-01** reduced motion · **CAR-P1-02** ConfirmDialog/Toast replacing 4 native dialogs · **CAR-P1-03** states: < 2 fill-ups economy message, overdue service, expired document, invalid import JSON · **CAR-P1-04** privacy page · **CAR-P1-05** reminders (P-CAR-1) · **CAR-P1-06** document photos stored locally in IndexedDB with size limit and G-6 migration · release **1.0.0** at Tier 1.

### PrismCap
- **PRSM-P0-01 Renames (D-06)** with stats migration and 39-name review; website/pitch updated.
- **PRSM-P1-01** remove device gate (P-PRSM-1) · **PRSM-P1-02** pixel fonts logo-only, body system font, contrast ≥ 4.5:1 · **PRSM-P1-03** manifests "PrismCap" · **PRSM-P1-04** game shell standard: setup → "Pass to {player}" interstitial → play → result → exit ConfirmDialog, `aria-live` turn announcements · **PRSM-P1-05** replace 13 native dialogs · **PRSM-P2-01** reduce board `innerHTML` rebuilds (measure first) · **PRSM-P2-02** raw hex (181), font sizes (86), `!important` (208) to tokens.

### DeePonyCap
- **PONY-P0-01 IP removal (D-04)** with user-defined series and original demo names; grep clean across app, website and marketing; user data untouched (fixture test).
- **PONY-P1-01** inline demo banner · **PONY-P1-02** switches · **PONY-P1-03** dark page background · **PONY-P1-04** FAB only on Stable/Wishlist, above tab bar + safe area · **PONY-P1-05** SVG tab icons, 11px labels · **PONY-P1-06** locale dates · **PONY-P1-07** remove `releases/` (P-PONY-1) · **PONY-P1-08** remove COPPA/child-targeting wording; non-affiliation line (§4.2) · **PONY-P2** tokens (117 hex, 55 font sizes).

### DeeFoodieApp
- **FND-05** Dart `ThemeExtension` from tokens.
- **DFD-P0-01 iOS purpose strings** for APIs actually used (location: "DeeFoodie uses your location to show places near you. Your location isn't shared." · photos: "Choose photos to add to your visits." · camera: "Take photos of your food and places for your journal."); `CFBundleDisplayName` "DeeFoodie". Done when: fresh simulator install → Near me and Add photo don't crash; denial states designed.
- **DFD-P0-02 Venue photo integrity:** photos only when linked to that venue/chain with license + attribution; otherwise cuisine illustration; chips on dark scrim; regenerate archive via scripts (never hand-edit `archive.json`); test asserts every card photo matches its venue or is a placeholder.
- **DFD-P0-04 Auth + Delete my data (D-10):** token issuing CLI, hashed tokens, Keychain storage, API guard tests, in-app deletion with server purge incl. photos, privacy page (DeeFoodie variant).
- **DFD-P1-01** Caveat only for one decorative heading per screen; Inter elsewhere; text scale 1.0/1.3/2.0 tests · **DFD-P1-02** Home (P-DFD-1): "Your Karachi", real count, wallet/rupee icon, labeled stat tiles fitting at 320–375 · **DFD-P1-03** Semantics labels, map summary, page-flip button alternative, reduced motion disables curl · **DFD-P1-04** states: location denied/off, offline archive, sync failed, upload failed/retry, duplicate eatery, closed venue · **DFD-P1-05** strip photo EXIF GPS before upload · **DFD-P1-06** TestFlight pack (`docs/store/TESTFLIGHT.md`, privacy manifest, export compliance) — upload is out of scope.

### IdeaCap
- **FND-06** RN theme from tokens.
- **IDEA-P0-02 Audio:** migrate `expo-av` → `expo-audio`; align `expo-speech-recognition` via `npx expo install`; `npx expo-doctor` clean; record → playback on iOS simulator, Android emulator, web.
- **IDEA-P0-03** privacy + support links (G-4).
- **IDEA-P1-01 Storage v2 (D-02):** versioned per-record storage, schema migration (G-6), corruption quarantine (unreadable records moved aside and reported, never dropped), backup export/import with validation.
- **IDEA-P1-02 Dictation:** on-device recognition only; fails closed to typed input with clear copy when unavailable; web uses typed transcript.
- **IDEA-P1-03** `userInterfaceStyle: "automatic"` + light/dark tokens · **IDEA-P1-04** a11y labels/roles/hints for every control; font scaling; reduce motion · **IDEA-P1-05** states: mic denied ("Open Settings"), speech unavailable, recording interrupted (save partial), storage full, empty board, no search results · **IDEA-P1-06** labels (P-IDEA-1) · **IDEA-P1-07** Android predictive back enabled + tested; target API 36 · **IDEA-P1-08** tests: Jest + RNTL for storage, migration, NoteCard; Playwright for web journey · **IDEA-P1-09** native builds compile + store packs (G-1) · release **2.0.0** at Tier 1.

### Website (capricorn-lab → shamikhahmed.github.io)
- **HUB-P0-01 Catalog truth:** names, descriptions (§4.1), versions from each repo's `VERSION.json` via `sync:catalog` / `sync:versions`; DeeFoodie "Private beta"; no third-party IP names.
- **HUB-P1-01 Source of truth (D-13):** capricorn-lab builds the hub; port passing os-next modules; archive os-next.
- **HUB-P1-02 Performance:** poster-first lock screen; three.js after idle and only on capable devices; reduced motion static; Lighthouse ≥ 90.
- **HUB-P1-03** dock and grid at 320–2560 · **HUB-P1-04** legacy product pages → redirects (P-HUB-1) · **HUB-P1-05** `support.html` + website `privacy.html` (G-4) · **HUB-P1-06** link check (all internal links 200), `robots.txt`, `sitemap.xml`, Open Graph images · **HUB-P1-07** investor/pitch pages reflect finished apps.

---

## 14. Completion criteria

### 14.1 Tier 1 — every app must pass every gate (evidence in APP-REPORT.md)
| Gate | Requirement |
|---|---|
| G1 Score | Overall ≥ 80 (§14.2); every applicable dimension ≥ 75; Accessibility ≥ 85; Privacy/Security ≥ 85 |
| G2 Issues | 0 open P0 · 0 open P1 · ≤ 5 open P2, each with a reason |
| G3 Build health | build/typecheck/lint 0 errors, 0 new warnings · all tests green · tests ≥ baseline + one regression test per bug · 0 console errors/warnings on primary journeys · CI green on `main` |
| G4 Responsive | finish-matrix all primary routes × 15 viewports × 2 themes: 0 overflow, 0 obscured primary controls, 0 clipped text · intentional landscape, tablet and ≥ 900px layouts |
| G5 Accessibility | axe 0 serious/critical everywhere · Lighthouse a11y ≥ 95 · keyboard journey · VoiceOver + TalkBack (or labeled best substitute) on primary journeys · 200% text · reduced motion · contrast script passes · zoom enabled |
| G6 Design system | Kill list (§10) = 0 app-wide · tokens only · shared components used |
| G7 Copy | §5 sweep complete on every screen, dialog, toast, error and empty state · DECISIONS §4 text used exactly |
| G8 States | STATES.md complete for all primary journeys |
| G9 Performance | Lighthouse mobile performance ≥ 90 · LCP ≤ 2.5 s · TBT ≤ 200 ms · CLS ≤ 0.1 · shell JS ≤ 170 KB gzip · native cold start ≤ 2 s · no jank on primary scroll/animations |
| G10 Security & privacy | 0 secrets · 0 third-party runtime scripts · fonts self-hosted · 0 unescaped user/remote sinks · Playwright network log = privacy page list · Export + Erase tested · fictional fixtures · G-10 lock where required |
| G11 Platform | PWA checklist (§11) verified incl. iOS standalone and Android back · native-ready apps: Xcode 26 build, privacy manifest, purpose strings, store pack, FLEET-AUDIT §J risks mitigated · IdeaCap Android API 36 |
| G12 Audit | Latest full-product audit round: 0 new P0/P1 |
| G13 Truth | Version single-source check passes · CHANGELOG/HANDOVER/FEATURES/privacy/Brain updated |
| G14 Artifacts & delivery | §16 done (screenshots + gallery regenerated and reviewed, docs inventoried/updated/archived, website entry updated and live, repo cleanup) · §17 release done (pushed, merged, tagged, deployed, live smoke passed, new SW cache live) |

### 14.2 Scoring rubric
13 dimensions: Completeness · UI · UX · Typography · Accessibility · Responsiveness · Performance · Reliability · Privacy/Security · Platform compliance · App Store readiness · Google Play readiness · Overall polish. Each starts at 100, capped by open issues: any P0 → 59 · any P1 → 74 · > 5 P2 → 84 · 1–5 P2 → 92. Every score cites evidence; no evidence → 59 + new item. Store dimensions N/A per DECISIONS G-1. Overall = mean of applicable dimensions, rounded down.

### 14.3 Per item
"Done when" met · verify green · matrix clean for touched screens · axe clean for touched routes · keyboard + screen-reader names checked · light/dark · reduced motion · LOG.md entry with evidence.

### 14.4 Per app (only then move on)
All §14.1 gates pass (BLOCKED-EXTERNAL items documented per §7) · all P0/P1/gate-required P2 and FLEET-AUDIT §C rows ✅ · STATES.md complete · final audit round clean · no regressions vs BASELINE.md and all finished apps still green · §16 done · §17 release done · APP-REPORT.md written · PROGRESS.md and Brain updated.

### 14.5 Program complete
Every app passes §14.1 in fleet re-verification (Step C) · FINAL-REPORT.md written · no FLEET-AUDIT §H "must never ship" item remains · workspace cleanup finished · all reports versioned in capricorn-tooling.

---

## 15. Reports

Never stop to report. When you do send a message, end it with:
```
App: <App> (<n>/16) · round <r> · score <before> → <now>
Done: <IDs> · In progress: <ID> · BLOCKED-EXTERNAL: <IDs> · Next: <3 items>
```

### 15.1 `APP-REPORT.md` (`<repo>/qa/finish-loop/`, at app close)
1. **Status** (Tier 1) · version · tag · merge SHA · live URL · live smoke result.
2. **Scorecard:** 13 dimensions before (BASELINE) → after with evidence links; overall before → after; G1–G14 pass/fail with evidence.
3. **Issues found and resolved** (every audit item, §C row and new finding):

| ID | Severity | Area | What was wrong (user-visible) | Root cause | What was done | Files | Evidence | Status |
|---|---|---|---|---|---|---|---|---|

   Status: ✅ Fixed · ⛔ BLOCKED-EXTERNAL (what's missing) · ⏭ P3 out of scope.
4. **New issues discovered during implementation** — same table.
5. **Decisions applied** (DECISIONS IDs) and how.
6. **Remaining items** — what, why, what a human needs to do (hardware/account), impact.
7. **Regressions caught** — what broke, how detected, fix, guarding test.
8. **Metrics before → after:** tests, axe, Lighthouse (perf/a11y/best practices), shell JS gzip, raw hex, sub-11px, `!important`, unescaped sinks, native dialogs, emoji icons, matrix overflow/obscured, console errors.
9. **Screens:** before/after pairs for every changed screen; gallery link.
10. **States coverage** summary.
11. **Distribution readiness:** PWA checklist; store/TestFlight pack status where applicable; FLEET-AUDIT §J risk status.
12. **Docs, gallery, website, cleanup** (§16): updated, archived, removed (with sizes).
13. **Release log:** branch, commits, merge SHA, tag, workflow run URLs, deploy result, live smoke.

### 15.2 `docs/audit-2026-09-14/FINAL-REPORT.md`
1. Fleet summary: App · before → after score · status · version · tag · live URL · PWA / App Store / TestFlight readiness.
2. Every app's full issue register (§15.1 tables 3 and 4, not summaries).
3. Cross-app patterns fixed and where the shared fix lives.
4. Shared foundation delivered and adoption per app.
5. Decisions applied (DECISIONS IDs → apps → outcome), plus §6 decisions you added.
6. Regressions across the program and guards added.
7. Website, galleries and documentation changes.
8. Workspace cleanup (moved/archived/removed, sizes, archive location).
9. BLOCKED-EXTERNAL list for the owner (exact hardware/account steps), residual risks, recommended store submission order (DECISIONS G-1).

---

## 16. Screenshots, galleries, website, documentation, cleanup (at every app close)

### 16.1 Screenshots and screen galleries
1. Harness waits for `window.__APP_READY__`; never captures splash, spinners, overlay banners, programmatic focus rings or personal data; sample data with fictional people.
2. Regenerate with the repo's command (`npm run gallery`; CookCap `GALLERY_URL=… npm run gallery`; DeeFoodie `npm run gallery:capture` in `mobile/`): every primary screen and sub-tab, light + dark, mobile 393×852 @2x + desktop 1440×900, one tablet 820×1180 per primary screen, and key states (first use, empty, error, offline, permission denied).
3. Update `screen-gallery.html` + `gallery-manifest.json` (theme, viewport, section, screen id, label, route, state); remove entries for screens that no longer exist.
4. **Open and review every image**; re-capture anything showing splash, clipping, overlaps, placeholder names, broken images, stale versions or errors. Record the review.
5. One canonical gallery location per repo (documented in HANDOVER); superseded screenshot sets removed from the working tree in a dedicated commit (history keeps them).
6. Refresh screenshots used by `landing.html`, `pitch.html`, `presentation.html`, `docs/pitch.html`, README and store packs from the new gallery.
7. Store screenshots for native-ready apps at the sizes App Store Connect currently requires (check at capture time; record sizes).

### 16.2 Documentation — every document
1. `qa/finish-loop/DOCS-INVENTORY.md`: every Markdown/HTML doc with path · purpose · last updated · canonical / update / archive.
2. Canonical set kept current: `README.md` (first line = DECISIONS §4.1 description) · `HANDOVER.md` · `CHANGELOG.md` (+ `changelog.html`) · `FEATURES.md` · `ROADMAP.md` · `PRIVACY.md` + hosted `privacy.html` (template §4.4) · `SECURITY.md` · `CLAUDE.md` / `AGENTS.md` (version, path `/Users/shamikhahmed/Projects/Cap/Cap-Apps/<App>`, commands) · `docs/store/*` where applicable · `qa/finish-loop/*`.
3. Superseded specs/audits/agent prompts (e.g. CookCap `CURSOR_PROMPT.md`, `FINAL_PROMPT.md`, `MASTER_PROMPT.md`; MasteryCap `CURSOR-PROMPT-2-…`, `CURSOR-PROMPT-3-…`, `LOOP-STATE.md`; PulseCap `CURSOR-PERFECTION.md`, `CURSOR-REBUILD.md`, `CURSOR-UX-AUDIT.md`; SoulCap `SPEC-v*.md`, old `AUDIT*.md`; capricorn-lab/os-next `LOCK_FABLE_PROMPT.md`, `PLOT_MASTER_PROMPT.md`) → `docs/archive/` with header "Superseded on {date} by {doc}" + `docs/archive/README.md` index. SoulCap `CLINICAL.md`, `SAFETY.md`, `ACCESSIBILITY.md`, `DATA_MODEL.md` stay canonical if accurate.
4. Marketing/pitch/investor pages updated to the finished product and §4.1 copy; no third-party IP names.
5. Brain note: path, version, Current focus, dated Decisions line.
6. Workspace docs: `Cap-Apps/docs/AUDIT_REPORT.md` and `docs/APP_STORE_CHECKLIST.md` → archive ("superseded by docs/audit-2026-09-14/"); `_workspace/*.md` current facts merged into the right repo or `capricorn-tooling/docs`, the rest archived.
7. Link check over canonical docs; commands in README/HANDOVER actually run.

### 16.3 Capricorn website
After each app closes: update its catalog entry via `capricorn-tooling` (`npm run sync:versions`, `npm run sync:catalog`, `npm run release:marketing`) with §4.1 description, version from `VERSION.json`, live URL, icon, new screenshots; build, commit, push, deploy the website (§17), and live-check every Cap link returns 200, 0 console errors, versions match. The full website Tier 1 loop runs at Step 16.

### 16.4 Folder cleanup (pre-approved)
Rules: inventory first (`docs/audit-2026-09-14/CLEANUP-PLAN.md`: path · size · what · action · risk), move before delete, never rewrite history, never delete user data. Archive destination `~/Archive/Cap-Apps/<YYYY-MM-DD>/`. Execute immediately; permanently deleting untracked non-regenerable data is not allowed — archive it instead.
- **Workspace:** `_workspace/cap-agents 2`, `_workspace/shared 2` (Finder duplicates), root `.DS_Store`, stale root docs (§16.2.6), capricorn-os-next after D-13 archiving, anything else not a live repo.
- **Repos (own commits):** untracked or tracked build/test output (`test-results/`, `playwright-report/`, `out/`, `dist/` unless deployed from git, `tsconfig.tsbuildinfo`, `.expo/`) → remove + `.gitignore`; `.DS_Store` → remove + ignore; `DeePonyCap/releases/`; duplicate root icons where `public/`/`assets/` is canonical (update references first); stray root artifacts (e.g. `LedgerCap/ledgercap-phone-preview.png`) → `docs/` or archive; duplicate gallery folders; superseded docs; marketing JS copies no longer used.
- Prove every candidate is unreferenced (`grep -R` across the repo; check `index.html`, SW precache list, manifests, workflows, tests) and run full verify after removal.
- After cleanup: all verify green, galleries open, website builds, `git status` clean, sizes reclaimed recorded.

---

## 17. Git automation (automatic, guarded)

### 17.1 Pre-flight (per repo, once)
`git remote -v` → `github.com/shamikhahmed/<repo>`; `git fetch origin`. If local `main` has history unrelated to `origin/main` (shamikhahmed.github.io "local restore snapshot"; repos without upstream: AuraCap, PulseCap, website): never push it over origin — create `finish/<app>` from `origin/main`, port the needed working-tree changes, record the approach. If histories can't be reconciled cleanly, keep the local snapshot on `preserve/local-snapshot-<date>` (pushed), build the finish branch from `origin/main`, and continue. Use existing git identity and credentials only.

### 17.2 Checkpoint commits (continuous)
At every green checkpoint: review `git status` / `git diff --stat`; secret scan clean; stage explicit paths; conventional commit with item IDs; `git push -u origin finish/<app>`. Rejected push → fetch, rebase only your own unpushed commits; conflicts you can't resolve with certainty → abort, resolve by re-applying your change on top of the remote branch manually, re-verify, push. Never force.

### 17.3 Release (hotfixes, corrections, and every Tier 1 close)
1. Full verify + finish-matrix + axe on the final commit.
2. Version bump per DECISIONS G-8 — version + SW cache name + register query + `VERSION.json` + `APP_VERSION` + `package.json` + CHANGELOG + `changelog.html`; commit, push.
3. `git checkout main && git pull --ff-only origin main && git merge --no-ff finish/<app> -m "release: <App> v<version>"`; conflicts → abort, rebase `finish/<app>` onto `origin/main` (your commits only), re-verify, retry.
4. Verify on `main`; only if green `git push origin main`.
5. `git tag -a v<version> -m "<App> v<version>" && git push origin v<version>` (never move/delete tags).
6. Deploy: workflows on `main` must deploy **only after CI passes**; follow runs to completion (`gh run watch` or poll). Hub-published builds (CarCap, TravelCap export, IdeaCap web, SoulCap mirror, website) use the exact commands in HANDOVER (derive from scripts and document if missing), then commit/push/deploy the website repo the same way.
7. Live smoke (§9) including new SW cache name. Failure → fix forward and release again; if not quickly fixable → `git revert -m 1 <merge-sha>` on `main`, push, and continue fixing on the finish branch.
8. Delete the merged `finish/<app>` remote branch after success; record everything in APP-REPORT.md.

### 17.4 Reports are versioned
At every app close and at program end, copy `docs/audit-2026-09-14/` (DECISIONS, PROGRESS, BASELINE files, CLEANUP-PLAN, FINAL-REPORT, audit, prompt) into `capricorn-tooling/docs/audit-2026-09-14/`, commit and push capricorn-tooling.

### 17.5 Never
Force-push · `push --mirror` · amend/squash/rewrite pushed commits · delete remote branches except your merged `finish/*` · commit secrets · `--no-verify` · `git stash` · push with red verify · deploy on red CI · store/TestFlight submission.

---
RESUME
