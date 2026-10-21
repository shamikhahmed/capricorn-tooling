# Cursor — Perfection Loop v6: App Store, every device, luxury finish (2026-10-19)

**Scope:** all 15 Cap apps + the Capricorn website (hub). **One app at a time.** Nothing ships until it passes on every device class below.
**Reference implementation:** VaultCap, branch `fix/ios-native-shell` (`/Users/shamikhahmed/Projects/Cap/Cap-Apps/VaultCap`). Every pattern in this file exists there — open the file named and adapt it; do not invent a new approach.
**Prompt library (exact prompts 0–9, 1B, 3B, 6B, V):** `~/Capricorn-Brain/AI/Claude-Code/2026-10-17 Cap iOS App Store Playbook (Cursor).md`
**Inherits (still binding):** v3 `CURSOR-PERFECTION-LOOP.md` §2 non-negotiables, §7 Apple-grade rubric, §8 toolkit + gates, §9 gallery v3, §11 docs truth; v5 `CURSOR-LOOP-v5.md` hard rules and decisions; `docs/audit-2026-09-14/DECISIONS.md`; each app's HANDOVER gotchas and Capricorn-Brain project note Decisions.

---

## 0. How to run this in Cursor

1. Open the **Cap-Apps** workspace. New Agent chat **per app**. Mode: Agent. Model: the strongest available (Claude Fable 5.1 / Opus class), max effort / Max mode, long context. This is "ultracode" mode: read before writing, verify every claim with a command or screenshot, never stop at "should work".
2. First message of each app chat — paste exactly:

```
Run Cursor Perfection Loop v6 for <APP>.
Program: capricorn-tooling/docs/perfection-2026-10/CURSOR-LOOP-v6-APPSTORE.md (read ALL of it, then §7 "<APP>" brief).
Prompt library: ~/Capricorn-Brain/AI/Claude-Code/2026-10-17 Cap iOS App Store Playbook (Cursor).md
Reference implementation: VaultCap branch fix/ios-native-shell.
Work phase by phase (§4 A→K). After each phase: run the phase gate, show evidence (commands + pass/fail counts + screenshot paths), commit, then continue automatically.
Stop only for: owner-only items (§11), a failing gate you cannot fix in 3 attempts (report root cause), or a decision that contradicts a locked Decision.
```
3. Follow-up messages: `continue v6`. When the app is done, Cursor writes `qa/v6/APP-REPORT-v6.md` and you start the next app's chat.
4. After every app: ask **Claude Code** to run §12 verification on that app before moving on (one line: "verify <APP> against Cursor loop v6").

---

## 1. Order (one at a time — do not parallelise apps)

| # | App | Track | Why here |
|---|---|---|---|
| 1 | VaultCap | Capacitor ✅ | Reference — finish + verify only (commit pending batch, gallery, docs, iPad sweep tail) |
| 2 | SteadyCap | Capacitor (no ios/ yet) | Closest to App Store; health-sensitive → high bar |
| 3 | PulseCap | Web → Capacitor | Health/fitness; PWA-only decision (see brief) |
| 4 | SoulCap | Web → Capacitor | Mental-health; crisis copy locked |
| 5 | DeePonyCap | Capacitor (no ios/) | Has `<input list>` (3) |
| 6 | LedgerCap | Capacitor (no ios/) | Finance; Worker owner-blocked |
| 7 | PrismCap | Capacitor (no ios/), Vite | Games |
| 8 | ScentCap | Capacitor ✅ ios/, React | Pilot for Cap Standard |
| 9 | AuraCap | Web (Vite/React) | |
| 10 | CarCap | Web (vanilla) | `<input list>` (1) |
| 11 | MasteryCap | Web (vanilla) | Paper design system locked |
| 12 | TravelCap | Web (Next 16) | Static export |
| 13 | CookCap | Web (Next) | |
| 14 | IdeaCap | **Expo / React Native** | Native track, not Capacitor |
| 15 | DeeFoodieApp | **Flutter + API** | Native track; API localhost only |
| 16 | Capricorn website | capricorn-lab → shamikhahmed.github.io | Last, so it shows every app's final state |
| Z | Fleet wave Z | all | Cross-app regression + hub links |

---

## 2. Binding rules (v6 additions to v3 §2 / v5 hard rules)

1. **Branch** `perfection/v6-appstore` per repo. One concern per commit. `npm run verify` (or the app's equivalent) green before every commit. Never force-push, never `git stash` (use `preserve/*` branches — C-05).
2. **Artifacts** (screens, harnesses, logs, staged builds) live in `build/qa/v6/` — **never** `test-results/` (every Playwright run deletes it). **First commit in every repo:** add `build/qa/` to `.gitignore` and prove it with `git check-ignore build/qa/v6/x` (as of 2026-10-19 only VaultCap, PulseCap, SoulCap, TravelCap ignore it). Curated evidence that belongs in git goes to `qa/v6/`.
3. **One iOS simulator at a time** (8 GB Mac). Before simulator work: `xcrun simctl shutdown all`. If load avg > 60, stop and wait. Ask the owner once to exclude `/Library/Developer/CoreSimulator` from Spotlight (System Settings → Spotlight → Search Privacy).
4. **Simulator.app is not installed on this Mac** — drive simulators headlessly with `xcrun simctl` (boot/install/launch/`io screenshot`/`io recordVideo`/`ui appearance`/`ui content_size`/`pbpaste`). Evidence = screenshots + videos in `build/qa/v6/sim/`.
5. **Never weaken a test.** If a test encodes a brand rule (e.g. VaultCap light accent navy), follow the rule. Updating a test helper for renamed copy is allowed (say so in the commit).
6. **Truth over labels:** before writing any privacy text, read the code/Worker that actually makes the request (VaultCap's UI said "claude-haiku" but the proxy uses Cloudflare Workers AI).
7. **Health apps (SteadyCap, PulseCap, SoulCap):** no medical claims; disclaimers visible; crisis/SOS paths are release blockers — test them on every device.
8. **Finance apps (VaultCap, LedgerCap):** "not financial advice", no trading, indicative prices labelled, encryption claims match code.
9. **Locked brand per app** (project note "brand lock"): adapt the luxe *system*, keep each app's own colours/type. No "…OS" product names for Caps (G18). No emoji chrome where locked (MasteryCap).
10. **Owner-only** items (§11) are listed, never attempted.

---

## 3. Device & condition matrix (every app, every screen class)

**iOS simulators (native apps / Capacitor shells)** — runtimes available: iOS 27.1 (Duo only), 27.0, 18.1. Minimum set, one at a time:
iPhone SE (3rd gen) · iPhone 13 mini · iPhone 15 · iPhone 16 Pro · iPhone 17 Pro Max (or 18 Pro Max) · iPhone Air · iPhone Duo (27.1) · iPhone Xs (18.1, oldest runtime) · iPad mini (A17 Pro) · iPad Air 11 (M3) · iPad Pro 13 (M5, 12 GB — the 16 GB variants cannot boot on this host).
Per device: light + dark (`xcrun simctl ui <udid> appearance light|dark`), text size default + `accessibility-medium` + `accessibility-extra-large` (`ui content_size`), iPad portrait + landscape (rotate via `xcrun simctl io <udid> ...` not available → verify landscape layouts in WebKit matrix; note it).

**WebKit / Chromium / Firefox viewport matrix (all apps incl. web-only)** — reuse VaultCap's 38-viewport harness approach (`VaultCap/build/qa/webkit-matrix/devices.js` + `matrix.spec.js`; copy into `build/qa/v6/matrix/`):
- iPhones: 320×568 (SE1) · 375×667 · 375×812 · 390×844 · 393×852 · 402×874 · 414×896 · 420×912 (Air) · 428×926 · 430×932 · 440×956 · Duo 360×780 folded / 466×678 open — with real safe-area insets.
- iPads portrait + landscape: 744×1133 · 768×1024 · 810×1080 · 820×1180 · 834×1194 · 834×1210 · 1024×1366 · 1032×1376; Split View 320 / 375 / 507 / 678 × 1024.
- **MacBook / desktop (new in v6):** 1280×800 · 1440×900 · 1470×956 (MacBook Air 13 default) · 1512×982 (MacBook Pro 14) · 1710×1107 (MacBook Air 15) · 1728×1117 (MacBook Pro 16) · 1920×1080 · 2560×1440; browser zoom 100 % / 150 % / 200 %; Safari (WebKit) + Chrome + Firefox.
- Themes light + dark everywhere; `--dt-scale` 1 / 1.3 / 1.6 on phones.

---

## 4. Per-app phases (A→K). Each phase ends with its gate; do not start the next phase until it passes.

**A · Ground truth & inventory.** Read project note, HANDOVER (gotchas binding), ROADMAP, CHANGELOG, FEATURES, `qa/` reports. Write `qa/v6/INVENTORY.md`: every screen, sheet, form, setting, empty/loading/error state, demo path, network call (with destination read from code). *Gate:* inventory reviewed against the router/registry — no screen missing.

**B · Baseline.** Build prod, run existing `verify` + `tier1`, capture the §3 matrix "before" (light+dark) into `build/qa/v6/before/`. *Gate:* baseline numbers recorded in APP-REPORT.

**C · Native shell (by track).**
- Capacitor with ios/: Playbook **Prompt 1A** (contentInset never, brand bg, StatusBar, Filesystem/Share/Browser/Haptics, VaultNativePlugin print + copySecure, MainViewController, SceneDelegate privacy cover, LaunchMark launch screen, Info.plist hygiene, native staging without marketing pages).
- Capacitor without ios/ (SteadyCap, DeePonyCap, LedgerCap, PrismCap): `npx cap add ios` first, then 1A.
- Web-only apps: Playbook **1B** only if the owner's project note says the app goes to the App Store; otherwise skip C and record "web-only by decision" (PulseCap PWA-only decision is binding unless reversed).
- Expo (IdeaCap): no Capacitor. Verify `npx expo prebuild -p ios` + `npx expo run:ios --device "<sim>"`; Info.plist via `app.json`/`app.config` (usage strings, ITSAppUsesNonExemptEncryption, launch screen = brand); expo-sharing/expo-print/expo-clipboard for the same behaviours; privacy cover via `AppState` blur view.
- Flutter (DeeFoodieApp): `cd mobile && flutter run -d <udid>`; `flutter analyze` + `flutter test`; Info.plist in `ios/Runner`; app-switcher privacy via `WidgetsBindingObserver`; API on localhost — test with the documented ports (Postgres 5435, Redis 6380).
*Gate:* simulator build + launch on iPhone 16 Pro and iPad Air 11; launch screen shows brand; app switcher shows cover; built Info.plist checked.

**D · Platform-correct behaviour** — Playbook **Prompt 2**: downloads → share sheet (status only after real save), print/PDF → native print, external links → in-app browser, secure clipboard with expiry, legal pages in-app, status bar follows theme, haptics, no PWA/website wording in the app, no pinch-zoom in native. *Gate:* each action tried on the simulator with evidence (file in Files app container, print sheet screenshot, `pbpaste` before/after expiry).

**E · Inputs & pickers** — Playbook **Prompt 3** (+3B on device) for every `<input list>`; every form: labels, input types/keyboards, validation copy, keyboard never hides the primary action, return-key flow, autofill doesn't overwrite user choices (VaultCap bank → country bug). *Gate:* form-coverage test + device check per form.

**F · Dynamic Type & zoom** — Playbook **Prompt 4** (px→rem script, `--dt-scale`, caps for chrome). Desktop: 200 % browser zoom usable. *Gate:* `dt.spec` 0 overflow at 1 / 1.3 / 1.6; simulator at `accessibility-extra-large` with screenshots of 5 key screens; desktop zoom screenshots.

**G · Luxury design & alignment pass** — Playbook **Prompt 5** (luxe layer with the app's own brand) + §5 alignment rubric below, screen by screen, every device class. *Gate:* before/after contact sheets (light+dark, phone/iPad/MacBook) reviewed by eye; 0 rubric violations; WebKit matrix 0 FAIL.

**H · Structure, states & sample mode** — Playbook **Prompt 6** + **6B**: shortest first-run path, value-first home, settings fully visible on phones, compact empty state, demo/sample mode that looks professional (no credentials on screen, one-tap sample PIN, healthy sample data, no false warnings). *Gate:* first-run and sample flows recorded as simulator videos.

**I · App Store pack** — Playbook **Prompt 7** (+**8** for vault/health/finance): truthful privacy policy reachable in-app and on the website, support URL page, App Store Connect sheet (`qa/v6/APP-STORE.md`: name, subtitle, description, keywords, category, age-rating answers, privacy-label answers, review notes incl. sample/demo access), screenshot set (6.9", 6.5", 13" iPad; light; captions) from the gallery pipeline. *Gate:* every claim in the policy traced to code; network log ⊆ policy ⊆ CSP (v3 gate 7).

**J · Verification** — all v3 §8.2 gates + v6: simulator matrix (§3) screenshots light/dark/large-text for every key screen; WebKit/Chromium/Firefox matrix 0 FAIL incl. MacBook sizes; Lighthouse mobile+desktop ≥ 90 (v5); axe 0 serious/critical both themes; full e2e green twice in a row (flakes fixed, not retried away). *Gate:* all green; Auditor pass by Claude Code (§12).

**K · Docs & release** — update **all** docs (§9), gallery v3 regenerated, version bump everywhere (package.json = VERSION.json = SW cache = MARKETING_VERSION/CFBundleVersion), CHANGELOG entry, tag, push (owner approves push), hub catalog synced (`capricorn-tooling` `sync-catalog-versions.mjs`). *Gate:* docs-truth audit (G18) PASS.

---

## 5. Alignment & finish rubric (apply to every screen, every device; on top of v3 §7)

- **Grid:** 8-pt spacing scale only (4 for hairlines). Screen gutters: 16 (phone) / 20 (Pro Max, Air) / 24–32 (iPad) / content max-width 720–960 on MacBook with centred column or sidebar layout — never full-bleed text lines > 80 ch.
- **Edges:** every card, row, header and button on a screen shares the same left/right edges; icons in list rows share one column; trailing chevrons/values right-aligned on one column.
- **Vertical rhythm:** section header → card gap identical on every screen; equal-height tiles in a row (grid `align-items: stretch`); no orphan words in titles (use `text-wrap: balance` for headings).
- **Optical alignment:** icons centred optically with adjacent text (cap-height, not box); single-icon buttons are circles/squares with the glyph centred; numbers use `tabular-nums`.
- **Safe areas:** nothing under the status bar / Dynamic Island / home indicator at rest or scroll end; fixed bars account for `env(safe-area-*)` once (not twice under banners — VaultCap bug).
- **Hit targets:** ≥ 44×44 pt on touch (visual can be smaller with an expanded hit area); ≥ 8 pt between adjacent targets; floating buttons never cover row actions.
- **Text:** no truncation of primary labels at any matrix size (secondary lines may clamp to 2 lines with full value available on tap); no text < 11 pt; contrast AA (4.5:1 body, 3:1 large) in both themes.
- **Consistency:** one radius scale (12 controls / 16–20 cards / 24–28 sheets), one shadow scale, one primary button style, one close icon (×), one chevron. Sheets: grabber, centred title, round close, primary action pinned above the home indicator.
- **iPad & MacBook:** use the space — sidebar or two-column layouts where the app has lists + details; keyboard focus rings visible; hover states on pointer devices; no phone layout stretched to 1440 px.
- **Motion:** one spring for screens, one fade for content, respects reduced motion; no layout shift on load (CLS < 0.05).

---

## 6. Simulator protocol (copy-paste)

```bash
xcrun simctl shutdown all
U=$(xcrun simctl create "V6 iPhone 16 Pro" "iPhone 16 Pro" com.apple.CoreSimulator.SimRuntime.iOS-27-0)
xcrun simctl boot $U && xcrun simctl bootstatus $U -b
xcrun simctl ui $U appearance dark          # light | dark
xcrun simctl ui $U content_size large       # accessibility-medium | accessibility-extra-large
xcrun simctl install $U path/to/App.app && xcrun simctl launch --console-pty $U <bundle.id>   # console = JS errors
xcrun simctl io $U screenshot build/qa/v6/sim/<screen>-dark.png
xcrun simctl io $U recordVideo build/qa/v6/sim/<flow>.mov   # Ctrl-C to stop
xcrun simctl pbpaste $U                                         # clipboard expiry check
xcrun simctl shutdown $U && xcrun simctl delete $U
```
Capacitor build: `npm run cap:sync && xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath build/qa/v6/dd build` → app at `build/qa/v6/dd/Build/Products/Debug-iphonesimulator/App.app`.
Cold launch is ~13 s on the simulator (WebKit spin-up) — not a bug; the launch screen must cover it.

---

## 7. App-specific briefs

> Format: purpose · stack/track · serve/test · locked rules · v6 focus · App Store notes. Counts from the 2026-10-19 survey (`<input list>` = dl, literal px font sizes = px).

### 1 · VaultCap — private life vault (finance, identity, family)
Capacitor ✅ (`fix/ios-native-shell`, 66 uncommitted files = batch 3–4). Serve 8765. `npm run verify`.
Locked: zero-knowledge (no accounts/cloud), XSS audit in pipeline, light accent navy, demo PIN 123456 only inside sample mode.
v6 focus: commit pending batch; finish iPad sweep tail (`build/qa/ios-sweep/`); gallery v3 regenerate (welcome/sample/luxe changed); App Store pack (Finance category; review notes: "Explore a sample vault → Use sample PIN"); Face ID + Keychain-wrapped key = **design doc only** (encryption change needs owner sign-off). Status: `qa/ios-appstore-audit-2026-10-16/FIXED-LIST.md` (45 items).

### 2 · SteadyCap — recovery companion (habits, medicines, SOS)
Capacitor, **no ios/** → `npx cap add ios`. Vanilla PWA, desktop sidebar shell. Serve 8768. dl 0 · px 187.
Locked: **SOS/emergency flow is a release blocker** — e2e + simulator video on every device; recovery data local-only, no analytics.
v6 focus: full 1A; health review notes (not medical advice, crisis numbers per region verified); medicine reminders → local notifications only if the app needs them (WKWebView has no Notification API — VaultCap AS lesson); Dynamic Type; iPad sidebar.

### 3 · PulseCap — Smart Coach fitness (offline PWA)
Web only by decision (**PWA-only — no HealthKit/Live Activity/WidgetKit unless owner reverses**). Serve 8766. dl 0 · px **742** (largest Dynamic Type job). 27 tests.
Locked: Smart Coach = rules not LLM; My Plan/Rehab educational; rest notifications only after Add to Home Screen; never `requestPermission` mid-workout; dates via `localISO()`/`today()`.
v6 focus: Phases D–K for the PWA (skip C unless owner reverses); v6.44.0 uncommitted work noted in Brain — confirm state before editing; exercise sheet drag-to-dismiss + keyboard on iPhone sizes; MacBook layout.

### 4 · SoulCap — self-regulation skills, journal (mental health)
Web (served from `docs/`, port 8788). dl 0 · px 110. 8 tests.
Locked: **help/crisis copy unchanged** (owner-approved wording); offline/private.
v6 focus: if App Store bound → 1B + health review notes; crisis path reachable in ≤ 2 taps on every device; journal privacy (app-switcher cover, no notification previews with content); calm luxe (no aggressive gold — use SoulCap's own palette `#6D5DD3`).

### 5 · DeePonyCap — collection, shelves, wishlist
Capacitor, **no ios/**. Vanilla, IndexedDB. Serve 8770. dl **3** · px 87. `verify` includes `check-sw-truth.js`.
v6 focus: 1A; ComboPicker for the 3 datalists; photo capture/attach (camera + photo-library usage strings truthful); export via share sheet.

### 6 · LedgerCap — personal wealth ledger (PSX stocks, Meezan funds)
Capacitor, **no ios/**. Vanilla + Cloudflare Worker price proxy. 16 tests (node). dl 0 · px **438**. Widget page `widget-glance.html`.
Locked: "0 servers" is false — the price Worker is required; Urdu + LH later; **Worker deploy is owner-only** (`wrangler login`).
v6 focus: 1A; privacy policy names the Worker + upstream market data; "indicative prices, not financial advice" visible; PIN vault (`pin-vault.test.js`) untouched unless tests prove a bug; charts legible at large text; MacBook two-column portfolio.

### 7 · PrismCap — 38 offline pass-and-play games
Capacitor, **no ios/**, Vite + vanilla registry. Serve 8767. dl 0 · px 177.
Locked: toast recursion fix (never toast from toast dismiss); keyboard tab cycling is deliberate a11y.
v6 focus: 1A; every game launches and is playable on SE + iPad (tap targets, landscape); game-session gallery shots (PRS-V3-4) close; haptics on game events.

### 8 · ScentCap — fragrance wardrobe, weather picks, layering
Capacitor ✅ ios/, React 19 + Vite 8 + Tailwind v4. dl 0 · px 56. Pilot of Cap Standard.
Locked: completely free (no IAP/Pro gates/limits); Playwright mocks geolocation + Open-Meteo + fraganty.ai — new network calls need mocks.
v6 focus: bring existing ios/ to 1A parity (privacy cover, LaunchMark, Info.plist hygiene, staging); location usage string truthful; weather/fraganty in privacy policy table; Tailwind luxe tokens.

### 9 · AuraCap — organise your iPhone, iPad and Mac setup
Web, React 19 + TS + Vite, vite-plugin-pwa, CSS motion only (P-AUR-2). dl 0 · px 77.
v6 focus: D–K (1B only if App Store bound); this app is *about* Apple devices — MacBook and iPad layouts must be exemplary; no framer/three/GSAP reintroduced.

### 10 · CarCap — service, fuel, documents for your cars
Web vanilla. `npm start` 8790. dl **1** · px 32.
Locked: L/100 needs ≥ 2 consecutive full-tank entries; sample data REPLACES local data (ConfirmDialog); export JSON excludes photo blobs.
v6 focus: ComboPicker; sample mode per 6B (but keep the replace-confirmation); documents expiry; MacBook layout.

### 11 · MasteryCap — learning institute (courses, practice, certificates)
Web vanilla, Fraunces + IBM Plex + Geist Mono. dl **1** · px 246. Version 51.x (docs truth: disk tags top at v51.9.2 — verify before claiming).
Locked: paper institute design (no Inter, no purple gradients, no emoji chrome); certificates keep `CERT_DISCLAIMER`; announced courses non-enrollable; no Welcome Update sheet.
v6 focus: the luxe layer here = paper/editorial luxury, not midnight/gold; sepia theme in gallery; Dynamic Type on long-form reading; MacBook reading measure ≤ 75 ch.

### 12 · TravelCap — passport bureau, tickets, Explore→Transit
Next.js 16 App Router + TS, Dexie, next-pwa. Playwright 1.63. dl **1** · px 2.
Locked: persist key `travelos-app` (G-6 — do not rename); AviationStack may fail CORS (plain error UI).
v6 focus: static export under the real subpath; ComboPicker equivalent as a React component (same behaviour as VaultCap); open-splash timing; MacBook ticket layouts.

### 13 · CookCap — recipes / editorial kitchen
Next.js + React. 3 tests (`e2e/finish.spec.ts`). dl 0 · px 39. Editorial dark (night paper) shipped 3.7.0.
v6 focus: expand e2e beyond finish.spec (every route renders, forms); dark gallery (v5 item 6) complete; editorial luxe; MacBook two-column recipe view; Brain project note missing status/live — fill it.

### 14 · IdeaCap — private voice/typed idea capture (local Smart Assistant)
**Expo SDK 57 / React Native 0.86 / TS**, AsyncStorage v2. `npm test` (jest), `expo-doctor`, web export for gallery.
Locked: web capture typed-only (IDEA-P1-02); on-device STT only; never `git stash` (C-05).
v6 focus: native track C (Expo): microphone + speech usage strings, on-device only claim verified; Dynamic Type via RN `allowFontScaling` + max multipliers; iPad layouts; privacy cover on background; App Store pack (Productivity).

### 15 · DeeFoodieApp — eatery app (Flutter mobile + Node/Prisma API)
**Flutter** (`mobile/`) + API (`api/`, pnpm, Prisma v5 pinned, PostGIS). `verify`: `cd api && pnpm test && cd ../mobile && flutter analyze && flutter test`.
Locked: non-default ports (Postgres 5435, Redis 6380); Prisma 5 (not 7); `geo`/`boundary` are `Unsupported` (raw SQL); no hosting yet (ngrok stopgap planned); iOS CI builds `--no-codesign`.
v6 focus: native track C (Flutter): Simulator run on the device set; Dynamic Type (`MediaQuery.textScaler` respected, layouts don't overflow — run `flutter test` golden checks at 1.0/1.3/2.0); iPad adaptive layouts; App Store pack is **owner-blocked until hosting exists** (app needs a reachable API for review) — write the pack, mark the blocker.

### 16 · Capricorn website — hub + classic pages + per-app mini-sites
Source of truth: **capricorn-lab** (`npm run dev | build | build:minisites | deploy:hub | qa:matrix | qa:flows`) → deploys to **shamikhahmed.github.io** (static, no build). Locked: never hand-edit `index.html` / `assets/index-*` in the site repo (overwritten by deploy:hub); `js/products-data.js` versions must equal capricorn-lab `js/products.js`; test every Cap link after renames (`check-links.mjs` / `npm test` = link-check); `.cursor/` never published.
v6 focus:
- **Every page × every device class in §3** (phones, iPads, all MacBook sizes, 1920/2560, zoom 200 %, light+dark if themed), Safari + Chrome + Firefox: alignment rubric §5, hero/typography rhythm, nav/footers, product cards equal height, no horizontal scroll, images crisp (2x/3x), CLS < 0.05, Lighthouse ≥ 90 mobile/desktop on hub + 3 mini-sites.
- **Per-app mini-site** `/apps/<slug>/` (v3 item 10) for all 15 apps with: final screenshots from each app's v6 gallery, version from VERSION.json, **Privacy policy URL** and **Support URL** pages (App Store Connect requires both), App Store badge only when live.
- Classic product pages (`vaultcap.html`, `scentcap.html`, …) redirect to mini-sites; `support.html`, `terms.html`, `about.html` consistent with app policies.
- Run after all apps (row 16) so every screenshot/version is final; then `deploy:hub` (owner approves push).

---

## 8. Generic checks Cursor must run on EVERY app (in addition to its brief)

- `grep -rniE "add to home screen|pwa|any browser|visit .*github\.io|install (the )?app|lorem|todo|coming soon|beta"` in app UI copy → fix or justify.
- `grep -rnE "window\.open\(|\.print\(\)|download\s*=|navigator\.vibrate|clipboard\.writeText|<datalist|list=\""` → each routed through the native-correct helper (Playbook Prompt 2/3).
- `grep -rnoE "font-size:\s*[0-9]+px"` → 0 after Prompt 4 (except `clamp()` chrome caps).
- Every network destination in code ⊆ privacy policy table ⊆ CSP `connect-src`.
- Sample/demo data passes the app's own integrity/duplicate checks with 0 warnings.
- Security/health/score values computed only from persisted state (VaultCap 47↔67 bug).
- Theme switch preserves non-theme body classes (VaultCap N2 bug).
- No element wider than viewport; no primary label truncated at 320 / 375 / Split 320.

---

## 9. Docs to update per app (all, every release)

README (features, screenshots from v6 gallery, quick start, devices supported) · HANDOVER (facts, stack, new gotchas from v6) · CHANGELOG (keep-a-changelog entry listing every v6 fix) · FEATURES.md · ROADMAP.md (v6 done, next) · CLAUDE.md (points to Brain note) · `privacy.html` (truthful) · `qa/v6/APP-REPORT-v6.md` · `qa/v6/APP-STORE.md` · `qa/v6/INVENTORY.md` · gallery v3 + manifest · VERSION.json/package.json/SW cache/MARKETING_VERSION aligned · **Capricorn-Brain** `01 Projects/<App>.md`: append dated decision line + update Current focus/status/live · fleet: `capricorn-tooling/docs/perfection-2026-10/PROGRESS-v6.md` row per app · hub catalog versions synced.

---

## 10. APP-REPORT-v6.md template (per app)

```
# <App> — Perfection Loop v6 report
Version: x.y.z (tag) · Branch · Commits (SHA list)
## Gates      (table: gate · result · evidence path)
## Device matrix (table: device class × light/dark × text size → ✅/❌ + screenshot)
## Fixed     (numbered list, like VaultCap FIXED-LIST.md: problem → fix → verified how)
## App Store pack status (privacy URL, support URL, screenshots, review notes, blockers)
## Not done / owner-only (exact next step for the owner)
```

---

## 11. Owner-only (list in every report; never attempt)

Apple Developer account sign-in + signing team · App Store Connect app records, privacy labels submission, upload · TestFlight on a physical iPhone · `wrangler login` + LedgerCap Worker deploy · DeeFoodie hosting/ngrok · pushing to `main` / tagging releases (Cursor prepares, owner approves) · Spotlight exclusion · any reversal of locked decisions (PulseCap PWA-only, zero-knowledge, crisis copy, brand locks) · Face ID/Keychain encryption change for VaultCap.

---

## 12. Final verification by Claude Code (after each app and after wave Z)

Claude Code runs the Playbook's **Prompt V** for the app: simulator with the panel visible (launch screen, first run, sample mode, lock/unlock + haptics, app switcher cover, background lock, export/print/share produce real output, clipboard expiry, privacy policy in-app, light-mode status bar, pickers, Dynamic Type accessibility sizes, iPad), WebKit matrix incl. MacBook sizes, full test suite, docs truth. Output: `build/qa/v6/verify/` + a pass/fail table; anything failing goes back to Cursor as a numbered list.
