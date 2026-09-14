# Capricorn Cap Fleet — Product, UX, Platform & Compliance Audit

**Date:** 2026-09-14 · **Auditor:** Claude Code (Opus 5) · **Workspace:** `/Users/shamikhahmed/Projects/Cap/Cap-Apps`
**Companion file:** `CURSOR-MASTER-PROMPT.md` (implementation blueprint — the most important deliverable)

---

## 0. Scope, method, and honest coverage limits

**Products audited (17):** AuraCap, CarCap, CookCap, DeeFoodieApp, DeePonyCap, IdeaCap, LedgerCap, MasteryCap, PrismCap, PulseCap, ScentCap, SoulCap, SteadyCap, TravelCap, VaultCap, and the marketing surface (shamikhahmed.github.io hub + capricorn-lab + capricorn-os-next). capricorn-tooling was reviewed as infrastructure only.

**Method:**
1. Read every Capricorn Brain project note, FEATURES/HANDOVER docs, package manifests, platform configs (manifest, Capacitor, Expo `app.json`, Flutter `pubspec.yaml`, iOS `Info.plist`), CI workflows, git state.
2. Fleet-wide static scans: secrets, CSP, viewport meta, `innerHTML` sinks, native `alert/confirm`, `eval/new Function`, reduced-motion support, sub-12px type, `outline:none`, safe-area usage, storage APIs, third-party hosts, privacy pages, test counts, design-token sprawl (unique colors, radii, font sizes, shadows, z-index, `!important`).
3. Visual review of 20 real screenshots from the committed galleries (one or two key screens per app at 390–430px mobile and one 2560px desktop).
4. Current store rules checked against official sources (Apple SDK minimums, Google Play target API).

**Limits (read this):** the galleries contain ~3,700 screenshots; I visually inspected 20. Screen findings in Section C are **observed defects** on those screens plus a **state/screen inventory** Cursor must walk. Code findings flagged **VERIFY** were inferred from static evidence and must be reproduced before fixing. Nothing was built or run on devices in this pass.

**Classification thresholds:** 🔴 Not ready < 45 · 🟠 Functional, major work 45–64 · 🟡 Good, unfinished 65–79 · 🟢 Production-ready 80–89 · ⭐ Exceptional 90+.

---

## A. Executive summary

The fleet is **design-ambitious and release-poor**. Several apps show genuine craft (SoulCap, CookCap, ScentCap, MasteryCap, PulseCap), but **no product is 🟢**, and **none is App Store-ready today**. The problems are less about individual screens and more about five systemic failures that repeat across every repo:

1. **Repository truth is broken.** Brain notes point to `/Users/shamikhahmed/Desktop/Cap-Apps/...` (and CookCap to `/Users/shamikhahmed/CookBook Website`) while the code lives at `/Users/shamikhahmed/Projects/Cap/Cap-Apps/...`. Nine repos are single-commit "restore snapshots" with zero local tags although notes cite tags. **PulseCap has 102 uncommitted deletions including its CI workflow, PRIVACY.md and README.** **IdeaCap's note says v2.0.0 removed all cloud AI and hardened storage — the code on disk is v1.2.1 and still ships `EXPO_PUBLIC_OPENAI_API_KEY` / `EXPO_PUBLIC_ANTHROPIC_API_KEY` client-side.** AuraCap, PulseCap and the hub do not track an upstream branch. `capricorn-os-next/.git.broken-20260911013611` exists. Three `shamikhahmed.github.io-backup-*` folders sit in the workspace. Any implementation before this is reconciled risks building on the wrong baseline or re-losing work.

2. **Store readiness is near zero, and some blockers are legal, not technical.**
   - Only ScentCap has a generated iOS project; no app has an app-level privacy manifest.
   - DeeFoodieApp's iOS `Info.plist` has **no** `NSLocationWhenInUseUsageDescription` / `NSPhotoLibraryUsageDescription` / `NSCameraUsageDescription` while the code calls Geolocator and ImagePicker → **iOS terminates the app on first permission request.**
   - **DeePonyCap references "My Little Pony" and Hasbro character names** (Rainbow Dash, Twilight Sparkle…); **PrismCap ships games named Connect Four, Codenames and Taboo** (trademarks). Guideline 5.2.1 rejection + legal exposure even on the web.
   - Submitting several same-shell Capacitor wrappers from one account invites **4.3(a) spam** and **4.2 minimum functionality** rejections.
   - Since **28 Apr 2026** uploads must be built with **Xcode 26 / iOS 26 SDK**; since **31 Aug 2026** Google Play updates must **target API 36** (extension to 1 Nov 2026). Capacitor 7 apps (DeePony, Ledger, Prism, Steady) default to API 35.

3. **There is no real design system — each app is its own universe.** Measured sprawl: VaultCap 229 unique hex colors / 72 shadow values / 38 z-index values; PrismCap 86 distinct font sizes / 208 `!important`; ScentCap 209 `!important`; LedgerCap 56 font sizes. The shared "Cap shell" is copy-pasted marketing JS (`capricorn-premium-nav.js`, `capricorn-deck-pro.js`, `capricorn-pitch.js`, `capricorn-cinematic.js`) shipped **inside product bundles** rather than a shared token package.

4. **The same UX defects recur fleet-wide:** overlay demo banners that hide page titles (SteadyCap, DeePony, PulseCap); floating bottom bars that sit over content or become illegible (SteadyCap, AuraCap, DeePony, SoulCap desktop); emoji used as icons (SteadyCap, DeePony, PrismCap, VaultCap); all-caps letter-spaced labels and pixel/handwriting/monospace fonts for UI text (PulseCap, PrismCap, DeeFoodie, AuraCap, MasteryCap); sub-12px type in almost every app (VaultCap 297 declarations, LedgerCap 127, SteadyCap 83, PulseCap 77); internal jargon in UI ("OS", "DNA", "Bureau", "Museum", "Kernel", "Smart ___", version numbers inside headings); **splash screens on every cold load** (TravelCap, CarCap) — so bad that **the committed CarCap and TravelCap galleries captured the splash instead of the Today/Dashboard screens**, meaning the QA evidence those repos rely on is wrong.

5. **Privacy promises and code disagree.** VaultCap says "offline/encrypted" but its logo engine defaults to a `workers.dev` proxy and its import path loads SheetJS 0.18.5 (known CVEs) from public CDNs — which its own CSP (`script-src 'self'`) blocks, so that feature is likely silently broken. LedgerCap fetches Yahoo data through **allorigins.win and corsproxy.io** (third parties can read or tamper with prices). SoulCap commits the owner's real first name in screenshots and e2e fixtures. IdeaCap bundles AI keys client-side.

### Fleet scoreboard

| Product | Platform (actual) | Overall | Status | App Store | Google Play |
|---|---|---:|---|---|---|
| SoulCap | Vanilla PWA (`docs/`); Expo + Nest = lab | **70** | 🟡 | 🔴 not submittable (no native shell, clinical/legal gate) | n/a |
| MasteryCap | Vanilla PWA — owner decision: no store | **68** | 🟡 | n/a by decision | n/a |
| ScentCap | React/Vite PWA + Capacitor 8 iOS project | **66** | 🟡 | 🟠 closest to submittable | n/a |
| CookCap | Next 15 static export PWA | **65** | 🟡 | n/a (PWA) | n/a |
| VaultCap | Vanilla PWA; App Store "later" | **62** | 🟠 | 🔴 no shell | n/a |
| PulseCap | Vanilla PWA — owner decision: PWA only | **61** | 🟠 (repo state) | n/a by decision | n/a |
| SteadyCap | Vanilla PWA + Capacitor 7 config | **56** | 🟠 | 🔴 | 🔴 |
| TravelCap | Next 16 static export PWA | **56** | 🟠 | n/a (PWA) | n/a |
| LedgerCap | Vanilla PWA + Worker + Capacitor 7 config | **50** | 🟠 | 🔴 | 🔴 |
| AuraCap | React/Vite PWA | **49** | 🟠 | 🔴 | n/a |
| PrismCap | Vanilla/Vite PWA + Capacitor 7 config | **49** | 🟠 | 🔴 (IP) | 🔴 (IP) |
| CarCap | Vanilla PWA (MVP) | **48** | 🟠 | n/a (PWA by decision) | n/a |
| DeePonyCap | Vanilla PWA + Capacitor 7 + iOS templates | **44** | 🔴 | 🔴 (IP) | 🔴 (IP) |
| DeeFoodieApp | Flutter (iOS only) + NestJS/PostGIS API | **42** | 🔴 | 🔴 crash on permission | n/a by decision |
| IdeaCap | Expo SDK 57 / RN 0.86 (iOS/Android/web) | **38** | 🔴 | 🔴 | 🔴 |
| Hub / Lab / OS-next | Vite + three.js marketing OS | **54** | 🟠 | n/a | n/a |

### Human decisions required before implementation (Cursor must stop on these)

| ID | Decision | Why it blocks |
|---|---|---|
| D-01 | **Store submission plan.** Owner directive 2026-09-14: *every* app must reach **Tier 1** (🟢 ≥ 80 with hard gates — Cursor prompt §16.1). Remaining decision is only which apps are submitted to App Store / Google Play and in what order. Recommendation: stagger submissions (ScentCap and VaultCap first), give each a distinct native capability, never submit several same-shell wrappers at once. | 4.3 spam / 4.2 risk applies to submissions, not to the quality work |
| D-02 | **IdeaCap baseline**: recover the v2.0.0 "production-overhaul" work (other machine / remote branch?) or redo from 1.2.1. | Brain says it exists; disk doesn't |
| D-03 | **PulseCap**: were the 102 deletions an intentional move into `docs/` or damage? | Can't commit or revert safely without intent |
| D-04 | **DeePonyCap IP**: remove all My Little Pony/Hasbro names & imagery and reposition as a generic collectible tracker, or keep private/unlisted. | Legal + 5.2.1 |
| D-05 | **SoulCap clinical/legal**: crisis-resource policy (region-aware helplines vs "local emergency services" only), qualified reviewer sign-off, 18+ gate wording. | 1.4.1 + user safety |
| D-06 | **PrismCap game names**: rename Connect Four / Codenames / Taboo variants. | Trademark |
| D-07 | **Naming**: TravelOS vs TravelCap; PrismOS remnants; "OS" suffixes in marketing. | Brand consistency, metadata |
| D-08 | **VaultCap network features**: make logo proxy and LLM import strictly opt-in with consent, or remove. | Privacy promise |
| D-09 | **LedgerCap data sources**: licensing for PSX/Yahoo data; drop public CORS proxies; whether LedgerCap is ever a store app (3.2.1(viii), 5.2.2). | Legal + security |
| D-10 | **DeeFoodieApp distribution**: two-user private app → TestFlight/private distribution (recommended) vs public App Store (needs real auth, hosting, moderation, account deletion, SIWA if social login). | Determines all DeeFoodie P0s |
| D-11 | **Monetization**: backlog mentions VaultPro/AuraCap Pro/ScentCap `LAUNCH_PREVIEW`. In native builds, digital unlocks require IAP (3.1.1). Decide free vs IAP. | Store rules |
| D-12 | **Legal identity**: publisher name (Capricorn Systems vs personal), support email, privacy-policy host, data-controller address. | Required for every listing and privacy page |
| D-13 | **Website source of truth**: capricorn-lab or capricorn-os-next builds the live hub (Brain notes contradict each other); retire the other. | Website updates and folder cleanup |

---

## B. Application-by-application audit

### Sub-scores (0–100)

| App | Compl. | UI | UX | Type | A11y | Resp. | Perf | Reliab. | Priv/Sec | Platform | App Store | Play | Polish | **Overall** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SoulCap | 82 | 74 | 72 | 72 | 78 | 62 | 60 | 75 | 80 | 65 | 30 | n/a | 70 | **70** |
| MasteryCap | 75 | 72 | 66 | 70 | 52 | 74 | 75 | 70 | 75 | 65 | n/a | n/a | 68 | **68** |
| ScentCap | 75 | 74 | 68 | 70 | 66 | 70 | 62 | 66 | 70 | 66 | 45 | n/a | 68 | **66** |
| CookCap | 78 | 76 | 62 | 66 | 64 | 66 | 62 | 55 | 70 | 62 | n/a | n/a | 70 | **65** |
| VaultCap | 80 | 68 | 60 | 55 | 62 | 72 | 58 | 60 | 58 | 60 | 35 | n/a | 60 | **62** |
| PulseCap | 78 | 62 | 66 | 55 | 64 | 66 | 70 | 45 | 72 | 60 | n/a | n/a | 60 | **61** |
| SteadyCap | 65 | 55 | 55 | 50 | 55 | 58 | 62 | 58 | 62 | 55 | 30 | 25 | 52 | **56** |
| TravelCap | 62 | 64 | 52 | 66 | 60 | 60 | 50 | 50 | 60 | 55 | n/a | n/a | 58 | **56** |
| LedgerCap | 72 | 50 | 48 | 45 | 52 | 45 | 50 | 48 | 50 | 50 | 25 | 25 | 45 | **50** |
| AuraCap | 60 | 55 | 45 | 50 | 48 | 40 | 50 | 55 | 65 | 50 | 20 | n/a | 45 | **49** |
| PrismCap | 70 | 45 | 42 | 38 | 45 | 55 | 60 | 60 | 70 | 45 | 15 | 15 | 40 | **49** |
| CarCap | 45 | 55 | 45 | 55 | 45 | 55 | 70 | 45 | 70 | 50 | n/a | n/a | 42 | **48** |
| DeePonyCap | 68 | 45 | 50 | 42 | 45 | 52 | 55 | 58 | 60 | 45 | 5 | 5 | 42 | **44** |
| DeeFoodieApp | 55 | 62 | 55 | 45 | 40 | 45 | 50 | 35 | 35 | 45 | 10 | n/a | 50 | **42** |
| IdeaCap | 50 | 55 | 50 | 55 | 40 | 50 | 55 | 30 | 15 | 40 | 15 | 15 | 45 | **38** |
| Hub/Lab/OS-next | 60 | 65 | 50 | 60 | 58 | 58 | 45 | 40 | 70 | 50 | n/a | n/a | 55 | **54** |

---

### SoulCap — 70/100 🟡 Good but unfinished
- **Purpose / user:** private, offline self-regulation skills, check-ins, journal and relationship map for adults under stress. Explicitly "not therapy".
- **Tech:** vanilla JS PWA served from `docs/` (single `app.js` 333 KB + `data.js` 141 KB + `app.css` 98 KB, unminified). v8.1.0, schema 13, 362 passing e2e tests, safety kernel tests. `backend/` (Nest + PostHog) and `mobile/` (Expo) are lab code, not shipped.
- **Complete:** 5-tab IA (Now · Calm · Journal · People · You), 38 techniques, guided path, journal book, constellation map, reflection check (PHQ-9/GAD-7) with item-9 routing, appearance controls, export/delete, 18+ gate, strong a11y (313 ARIA hooks, 37 reduced-motion paths).
- **Partial:** desktop layout (mobile tab bar reused at 2560px), Roman Urdu preview only, crisis flow is number-free.
- **Broken:** "What's new" card has zero inner left padding against its accent bar; tab bar floats over the breathing card on desktop captures.
- **Missing:** at-rest protection for highly sensitive journal/check-in data (localStorage, unencrypted), app lock, native shell, clinical sign-off, region-aware crisis resources.
- **Redundant/confusing:** "Open quietly" orphan link; ambient purple blob sits behind interactive rows and lowers contrast; five parallel entry points on Now (check-in, What's new, saved technique, short path, notice what's happening, Explore, help).
- **Privacy:** real first name "Shamikh" in `docs/app.js` fixtures and `e2e/app.spec.ts` and in committed gallery images.
- **Biggest opportunity:** it is the most "finished-feeling" product; a proper desktop/tablet layout, an optional passcode lock, and a pared-back Now screen would make it genuinely premium.
- **Release readiness:** PWA 🟡 after P0/P1; store 🔴 until D-05.

### MasteryCap — 68/100 🟡
- **Purpose / user:** personal bilingual (EN / Roman Urdu) trading + software-craft school with journal and progress for owner + 1–2 friends. Owner decision: no accounts, no billing, no store.
- **Tech:** vanilla JS PWA, lazy route shell, strict CSP, Lighthouse 0.97/1.00/1.00 claimed, Chromium/Firefox/WebKit CI, 20 tags.
- **Complete:** Today, Campus (3 branches), Practice (charts, daily review, sims), HTTP Lab, Records, themes.
- **Broken:** `<meta name="viewport" ... maximum-scale=1, user-scalable=no>` blocks pinch-zoom (WCAG 1.4.4 fail; iOS ignores it partially, Android honors it).
- **Confusing:** first screen greets "Hello, Learner" with initials "LE" and "ID MRX4" (placeholder identity looks broken); two filled primary buttons in the first viewport ("Open Foundations" and "Start session · 15 min"); "Your standing 0%" repeats the progress bar above it; monospace letter-spaced section labels.
- **Security VERIFY:** `js/institute/code-editor.js` executes learner code via `new Function(...)` — confirm it runs in a sandboxed iframe/worker and the CSP does not grant `unsafe-eval` to the main document.
- **Opportunity:** a named first-run ("What should we call you?") and a single "Today's session" hero would make it feel personal and calm.

### ScentCap — 66/100 🟡
- **Purpose / user:** fragrance wardrobe — weather-aware daily pick, collection, advisor (rules), layering lab, calendar, travel kit.
- **Tech:** React 19 + Vite + Tailwind v4, Capacitor 8 iOS project present (`ios/App`), axe smoke tests, device-matrix harness, v2.0.10 (2 uncommitted files).
- **Complete:** core loop works with sample wardrobe; iOS permission strings exist (camera, photos, location with a good explanation).
- **Broken (observed):** flacon monogram renders **"DL"** for Dolce & Gabbana and the brand label is clipped ("DOLCE & GABBAN").
- **Redundant:** "94% MATCH" and "scored 94/100" on the same card; temperature shown twice; "SCENTCAP" eyebrow above the greeting.
- **Native gaps:** no `PrivacyInfo.xcprivacy`, no `ITSAppUsesNonExemptEncryption`, deployment target 15.0 (fine), stale web assets already copied into `ios/App/App/public` (built bundle committed).
- **Design debt:** 209 `!important`, 94 hex colors, 28 sub-12px declarations; "Atelier/Maison/Museum" names leak into UI component naming and copy.
- **IP:** brand names are factual catalog use (acceptable), but generated bottle art must not mimic trade dress; avoid brand logos.
- **Opportunity:** closest to an App Store candidate — widgets ("Today's scent") and a haptic "Wear" confirmation would feel native.

### CookCap — 65/100 🟡
- **Purpose / user:** heirloom family cookbook — a physical-book metaphor (dresser, cover, page flip), 790-ish recipes, meal plan, shopping list, cook mode.
- **Tech:** Next 15.5 static export, React 19, Motion, IndexedDB; SW `cookcap-v38`; CI builds Pages; **0 unit/e2e specs** (only custom gates: `gate:recipes`, `gate:anti-2d`, `gate:wood`, `smoke:product`).
- **Brain drift:** note path `/Users/shamikhahmed/CookBook Website`; repo is `Cap-Apps/CookCap`.
- **Observed defects:** header subtitle truncates ("— AYESHA'S KITC…"); tracked serif eyebrows over photos ("FROM OUR FAMILY KITCHEN", green "PAKISTANI") are low-contrast; same flame icon for Cook time and Calories; two macro disclaimers stacked; scrubber thumb overlaps the page counter; recipe counts disagree (cover 1/250, recipe 30/826, handover 790); onboarding name sheet competes with "Tap to open" on the cover; "COOKCAP" micro-label collides with the cover frame; copy "Cover title becomes *YourName Cooks*."
- **Content rights:** hero images were rematched from Unsplash/Foodish/MealDB over time — licensing/attribution must be recorded per image.
- **Opportunity:** the book metaphor is distinctive; tightening chrome and typography would lift it to 🟢 as a PWA.

### VaultCap — 62/100 🟠
- **Purpose / user:** private life OS — encrypted offline finance, identity, family vault for PK/UK/UAE expats (BC committees, zakat, multi-currency).
- **Tech:** vanilla JS PWA, AES-256-GCM, PIN-wrapped DEK, WebAuthn, decoy PIN, `.vos` export, 27 specs, device matrix, CSP with `script-src 'self'`.
- **Complete:** broad module set, demo vault, document PDF packs, profile switch.
- **Likely broken (VERIFY):** `js/ui.js:1523/1562` and `js/core/lazy-loader.js:36–48` inject `<script src>` from cdn.jsdelivr.net / cdnjs (SheetJS xlsx 0.18.5, mammoth, qrcodejs, jsQR) — blocked by the page's own `script-src 'self'`. Either import silently fails or a vendor fallback exists; both paths need proof. SheetJS 0.18.5 has CVE-2023-30533 (prototype pollution) and CVE-2024-22363 (ReDoS).
- **Privacy:** `js/modules/logo-engine.js:17` defaults to `https://vaultos-llm-proxy.shamikhahmed.workers.dev` (institution names leave the device); `js/config/llm-bundled.js` references legacy model id `claude-3-5-haiku-latest` (retired family — replace with `claude-haiku-4-5` if the feature stays).
- **Security VERIFY:** 6-digit PIN protects a DEK — confirm KDF cost (PBKDF2 ≥ 600k iterations or Argon2id) and lockout; initial state object has `pin: '123456'` — prove it can never unlock a non-demo vault (e.g., app killed mid-onboarding).
- **Design debt:** 297 sub-12px declarations, 229 hex colors, 72 shadows, 131 `!important`, 38 z-index values, marketing JS in `js/` (cinematic, scene, pitch, deck-pro, premium-nav).
- **Observed:** demo sheet opens with a visible focus ring on Close (focus-visible misuse), emoji 🎭 and ①②③ glyphs, arrow glyph in button labels.
- **Opportunity:** strongest native candidate — Face ID, expiry reminders, secure enclave-backed key, share-sheet document import.

### PulseCap — 61/100 🟠
- **Purpose / user:** offline training companion — today's session, logging, progress, programs, nutrition, rehab cues. Rule-based "Smart Coach". PWA only by decision.
- **Tech:** vanilla JS, module registry, 8 spec files, 176-shot gallery, 205 commits, 12 tags.
- **P0 repo state:** 102 tracked files deleted and uncommitted (`.github/workflows/ci.yml`, `.gitignore`, `CHANGELOG.md`, `CLAUDE.md`, `PRIVACY.md`, `README.md`, `FEATURES.md`…); a `docs/CLAUDE.md` exists claiming v6.34.0 while the app is 6.42.0; new untracked marketing JS.
- **Observed:** ALL-CAPS letter-spaced buttons and tab labels (START WORKOUT, CAN'T TRAIN TODAY?, PROGRAMS); orange gradient primary with dark text; a full-width "PROGRESS" button duplicating the Progress tab; insight card "Add chest volume — 6/12 sets" with no action; textured brown demo bar.
- **Opportunity:** content depth is real; typography and a calmer Today hierarchy would make it feel like a first-party fitness app.

### SteadyCap — 56/100 🟠
- **Purpose / user:** recovery companion — routines (meds/skincare/hair), quit timelines, craving SOS, journal.
- **Tech:** vanilla PWA, Capacitor 7 config (no native project), SOS e2e as release blocker.
- **Observed (Today, demo):** overlay demo banner hides the page title; "0/1 showing up today", "12d showing up" **and** "12-DAY CHECK-IN STREAK" on one screen contradict the product's own "not a streak" principle; unlabeled red pill "1" and "0/1 med slots"; "You missed Nicotine patch. No pressure — tap to check off when ready."; SOS appears as both a card and a tab; emoji check-in faces mixed with line icons; dark translucent floating tab bar over a light page makes underlying text collide with labels.
- **Health risk:** medicine + addiction data unencrypted in localStorage; medical wording must avoid treatment claims.
- **Opportunity:** one calm "Today" list (due items with Take/Skip), SOS in one place, gentle progress without streak language.

### TravelCap — 56/100 🟠
- **Purpose / user:** personal travel organizer — trips, itinerary, transit legs, stamps/passport, documents with OCR, budget splits, packing, food journal, emergency mode.
- **Tech:** Next 16.2.9 static export, Dexie, shadcn/base-ui, leaflet, tesseract.js, react-hook-form/zod, zustand; 1 commit; 2 e2e specs; no privacy page.
- **Observed:** gallery "dashboard" image is the splash (splash plays on **every** cold load by design, `splash-screen.tsx:8`); name is **TravelOS** in app/manifest vs **TravelCap** everywhere else; "Bureau/Bearer · You/Bound in gold" metaphor copy.
- **Security:** passport/doc images and OCR text in IndexedDB unencrypted; user AviationStack key stored in localStorage (free AviationStack plans historically lack HTTPS — VERIFY the https call works).
- **Perf:** tesseract.js + leaflet + recharts + framer-motion must be route/interaction-lazy.
- **Opportunity:** reduce 16 destinations to a clear Trips-centric IA; kill splash for returning users.

### LedgerCap — 50/100 🟠
- **Purpose / user:** Pakistani personal wealth ledger — PSX stocks, Meezan funds, portfolio, research, zakat/IPO, Telegram alerts via Cloudflare Worker.
- **Tech:** vanilla JS + committed `ledgercap.bundle.js`, Worker proxy, Capacitor 7 config, 14 specs, 533 screenshots.
- **Observed (Hub, 390px):** header collision — "Last close · just now" pill wraps into a 4-line column, KSE-100 squeezed, three-language segmented control + PKR + fullscreen + theme all in one row; heading **"Your wealth · v3.27.0"** shows a stale version (app is 3.56.3); stale-price banner in jargon ("100% of holdings on seed/fallback prices (snapshot 2026-07-01)"); **three** refresh controls on one screen; totals with paisa ("Rs2,102,807.99"); "Cash Rs0.00" chip; `$` icon for PKR "Funds" tab; "P&L"/"Analyze"/"Hub" tab jargon.
- **Security:** Yahoo requests via `api.allorigins.win` and `corsproxy.io` (ledgercap.bundle.js ≈ line 5993); 212 `innerHTML` sinks rendering remote strings; 57 `console.log`; Telegram bot token in client storage.
- **Legal:** scraping PSX/Yahoo endpoints; "signals" features border on investment advice (disclaimer + wording).
- **Opportunity:** the data model is valuable; a disciplined header, honest freshness line and one refresh gesture fix most of the pain.

### AuraCap — 49/100 🟠
- **Purpose / user:** Apple-ecosystem organizer — import app lists, "Digital DNA" scores, folders/layout designer, wallpapers, widgets, shortcuts, cleanse routine.
- **Tech:** React 19 + Vite, three.js + GSAP + framer-motion (three/GSAP only used by `CapScene.tsx` / `CapRouteTransition.tsx`), 2 specs; branch not tracking upstream.
- **Observed (Dashboard, 430px):** "Skip to content" link permanently visible; the desktop icon rail renders on mobile and is clipped off the left edge; header chips "Iphone", "iPhone 16promax"; four chips stacked in a column; page title **"Control Center"** (Apple feature name); "Frosted DNA · private on device"; "LIVE" badge on sample data; demo banner says **"demo wardrobe"** (copied from ScentCap); four invented score rings each labeled twice; floating tab bar over score labels; flag emoji; quick-access grid duplicating tabs.
- **Store:** 4.2 (utility with no native integration), trademark proximity (Apple names in UI), cannot actually read a user's device setup — value depends on manual import.
- **Opportunity:** narrow to one job ("Clean up your Home Screen in 10 minutes") with one score.

### PrismCap — 49/100 🟠
- **Purpose / user:** 38–39 offline pass-and-play party games with XP and daily challenges.
- **Tech:** vanilla + Vite, Capacitor 7 config, 5 specs, manifest `public/manifest.webmanifest` still named **"PrismOS"**.
- **Observed (first run):** "Select your device" gate (iPhone / iPad / Mac) adds a step with no user value; iPad row uses a desktop-monitor emoji; "All models supported" repeated; pixel fonts (Press Start 2P / VT323) for body copy; "Change anytime in Profile Settings" nearly invisible (dark gray on black); chevrons misaligned.
- **Design debt:** 181 hex, 86 font sizes, 208 `!important`, 154 `innerHTML`.
- **IP:** Connect Four, Codenames, Taboo naming (D-06).
- **Opportunity:** a clean "Pick a game → how many players → play" flow with large readable cards.

### CarCap — 48/100 🟠
- **Purpose / user:** offline garage — vehicles, service log, fuel economy, document wallet.
- **Tech:** vanilla JS, 2.3k LOC, 1 spec; version drift (package 0.1.1 / VERSION.json 0.2.2 / CLAUDE.md 0.2.0 / Brain 0.1.1).
- **Observed:** both gallery captures show the splash ("CARCAP · GLOVEBOX · KEY FOB") — gallery harness never reaches the app; no reduced-motion support; native `alert/confirm` ×4; docs are text-only (no photo of registration/insurance).
- **Opportunity:** the job is clear and useful — reminders (service due, insurance expiry) are the killer feature and need local notifications.

### DeePonyCap — 44/100 🔴
- **Purpose / user:** collector tracker for pony figures (G1–G5 catalog), shelves, wishlist, achievements, map.
- **Tech:** vanilla PWA, Capacitor 7, `ios-templates/PrivacyInfo.xcprivacy`, 7 specs, `releases/v3.0.0` full copy of old code inside the repo.
- **Legal P0:** "My Little Pony" and Hasbro character names in code/UI; "COPPA local" implies child audience → Kids Category rules.
- **Observed (Settings):** overlay demo banner hides title; ON/OFF text pills instead of switches; pink page behind dark cards in dark mode; FAB overlapping Settings cards and tab bar; emoji tab icons with ~9px labels; US date format for PK users.
- **Opportunity:** if repositioned generically ("collectible figure tracker"), the shelf + wishlist + value-estimate loop is strong.

### DeeFoodieApp — 42/100 🔴
- **Purpose / user:** Karachi food archive — personal visit journal + city archive; designed for two users (owner + friend).
- **Tech:** Flutter (iOS-only ship target) + NestJS/Prisma/PostGIS API (stub auth, ngrok plan), 10k-eatery offline demo archive, iOS build CI; not in Brain project index.
- **P0 crash:** `mobile/ios/Runner/Info.plist` lacks location / photo / camera usage strings while `near_me_provider.dart` requests location and `profile_prefs_provider.dart` uses ImagePicker.
- **Observed (Home):** "Tonight in Karachi" shows **Chai Shai** (tea spot) with a **sushi photo** tagged "Desi"; chip text unreadable on the photo; "117 Karachi eateries" vs README "10,000"; `$` icon on rupee spend; unlabeled anchor stat; Caveat handwriting used for tab labels and stat labels; app name as the page H1; display name "Deefoodie App".
- **Privacy:** no privacy policy, no data deletion, photo EXIF location not stripped (VERIFY), API exposed via tunnel with stub auth.
- **Opportunity:** the notebook aesthetic is lovely when legible; accuracy of venue imagery is the trust foundation.

### IdeaCap — 38/100 🔴
- **Purpose / user:** voice + typed idea capture with local analysis/chat.
- **Tech:** Expo SDK 57, RN 0.86, **expo-av 16.0.8** (expo-av was deprecated and removed from recent SDKs — VERIFY the native build), expo-speech-recognition 56 on SDK 57, `userInterfaceStyle: "dark"` (no light mode), Android `predictiveBackGestureEnabled: false`, 0 tests, 7 accessibility labels total.
- **P0:** `src/services/ai.ts` reads `EXPO_PUBLIC_OPENAI_API_KEY` / `EXPO_PUBLIC_ANTHROPIC_API_KEY` and calls `api.openai.com` / `api.anthropic.com` / Whisper directly — `EXPO_PUBLIC_*` values are inlined into the JS bundle. The web build is live at `shamikhahmed.github.io/IdeaCap` (scan of the hub found no key-shaped strings, but any key ever set for a deployed build must be rotated).
- **Brain drift:** note claims 2.0.0 (cloud AI removed, storage v2, Cork Atelier light/dark, Playwright, EAS) — none on disk (D-02).
- **Opportunity:** a genuinely fast "tap → talk → saved" capture with on-device transcription is a strong native app.

### Hub / capricorn-lab / capricorn-os-next — 54/100 🟠
- **Purpose:** fake-OS marketing experience listing the Caps + investor pages.
- **Issues:** hub root is a single "local restore snapshot" commit with no upstream tracking; lab local v0.10.2 undeployed vs live 0.10.1; os-next has a broken `.git` backup folder; catalog drift is recurring (Soul/Travel were shown WIP after shipping); three.js lock scene and 13 s dev cold start; 16 `100vh` uses; marketing claims must mirror D-04/D-06/D-07 outcomes (don't advertise My Little Pony or trademarked game names).

---

## C. Screen-by-screen audit

Legend: **Observed** = seen in screenshot · **Inventory** = screens Cursor must walk with the state matrix (Section 14 of the Cursor prompt).

### AuraCap
**Dashboard (mobile 430) — Observed**
| # | Problem | Replace with | Why |
|---|---|---|---|
| 1 | "Skip to content" visible at all times | Visually hidden; visible on `:focus-visible` only | Looks broken |
| 2 | Desktop icon rail rendered < 700px and clipped at x=0 | Hide rail below 700px; bottom tabs only | Clipping, duplicate nav |
| 3 | Header chips "Iphone", "iPhone 16promax" | Normalize: "iPhone", "iPhone 16 Pro Max" | Apple naming |
| 4 | Four chips stacked vertically (View DNA / 20 apps / Personal / Dark) | Nav bar: title left, one "…" menu right; theme moves to Settings | Hierarchy |
| 5 | Title "Control Center" | "Overview" | Apple feature name collision |
| 6 | Subtitle "Frosted DNA · private on device" | "Your setup at a glance. Stored only on this device." | Jargon |
| 7 | "LIVE" badge on sample data | Remove; when demo, show "Sample data" in banner only | False signal |
| 8 | Demo banner "demo wardrobe — sample apps with realistic DNA results" | "You're viewing sample data." + button "Use my apps" | Copy-paste error from ScentCap |
| 9 | Monospace 9–10px labels in device diagram (DIGITAL DNA, IPHONE) | Body font 13px semibold, `--text-secondary` | Legibility |
| 10 | Four score rings; each labeled inside ("AURA") and below ("Aura Score") | One headline score + "See breakdown" list | Cognitive load, duplicate labels |
| 11 | Tab bar overlaps "Aura Score/Focus Score" | `padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 16px)` on scroll container | Obscured content |
| 12 | "Active Profile Personal" in purple monospace | Standard list row value style | Consistency |
| 13 | "Ecosystem profiles detected 🇵🇰 Pakistan" | Remove or "Region: Pakistan" row | Unclear meaning |
| 14 | Quick-access grid duplicates Apps/Design tabs | Max 4 shortcuts not in tab bar (Import, Wallpapers, Profiles, Organizer) | Redundancy |

**Inventory:** Welcome, DNA, Import, Import guide, Apps, Organizer, Designer (Smart Assistant), Wallpaper, Lock screen, Widgets, Shortcuts, Cleanse, Routine, Profiles, Settings — desktop + mobile.

### CarCap
**Today / Garage (mobile) — Observed:** the gallery shows only the splash. Fix harness to wait for `#car-splash` removal; show splash only on first launch (≤ 600 ms) or never; replace "GLOVEBOX · KEY FOB" with nothing (logo only).
**Inventory:** First-run sheet (Add car / Try sample), Today, Garage (list/empty/add/edit), Service (log/reminder/overdue), Fuel (<2 fills state, economy), Docs (expiry soon/expired), Settings (export/import/erase).

### CookCap
**Recipe page (mobile 390) — Observed**
1. Header "CookCap — AYESHA'S KITC…" truncates → show book title on its own line only ≥ 600px; on phones show logo + icon buttons; no letter-spacing.
2. Eyebrows on hero photo (tracked serif, green "PAKISTANI") → 12px semibold sans, 0.02em, white at 90% over a bottom gradient scrim `linear-gradient(transparent, rgba(0,0,0,.55))`.
3. Flame icon used for both Cook and Cal → Prep: clock, Cook: timer/pot, Cal: flame.
4. Two disclaimers ("Macros are kitchen estimates — not lab values." + "Estimated macros") → single footnote under macros: "Estimates per serving."
5. Scrubber thumb overlaps "30 / 826" → counter outside the track.
6. Counts disagree (1/250, 30/826, 790) → one derived count from the catalog.
7. "R" avatar unexplained → profile button with `aria-label="Profile: <name>"`.

**Name gate — Observed**
1. Cover "TAP TO OPEN" active while sheet asks for name → disable cover interaction until sheet done.
2. "COOKCAP" micro-label overlaps inner frame line → remove or place outside frame.
3. Copy "Cover title becomes *YourName Cooks*. Change later from the ··· menu." → "We'll call it *Jia Cooks*. You can change this later in Settings." (live-preview the typed name).
4. Sheet eyebrow "COOKCAP" redundant → remove.

**Inventory:** Welcome/dresser, name/profile/mode/reveal, cover open, title, friends, contents, chapter, recipe (light/dark), cook mode, search (results/no results), shopping list (empty/checked), meal planner, tabs sheet, mode chooser, profiles, backup/restore, error/not-found, offline chip.

### DeeFoodieApp
**Home (iPhone) — Observed**
1. Venue photo mismatch (Chai Shai + sushi + "Desi") → only show a photo if it is linked to that venue; else cuisine illustration tile.
2. Chip "Desi" white on translucent white → dark scrim chip `rgba(0,0,0,.55)` + white 13pt semibold.
3. "117 Karachi eateries" vs 10,000 in README → one source.
4. `$` icon on "Rs 118,350" → wallet or rupee glyph.
5. Anchor-icon "10" has no visible label → 2×2 stat grid must fit fully; label every tile.
6. Caveat handwriting for tab labels and stat captions → Inter; handwriting only for one decorative heading per screen.
7. H1 "DeeFoodieApp" on Home → "Your Karachi" (app name belongs in the nav/launch screen only).
8. Display name "Deefoodie App" → "DeeFoodie".
**Inventory:** onboarding (welcome, chains), Home, Explore (filters, no results), Areas, Area page, Eatery profile (open/closed/"Miss it"), Add eatery (duplicate warning), Add/Edit visit (photos, validation), Journal book + timeline, Map (clusters, heat, location denied), Dish detail, Collections, Favorites, Passport, Trails, Dictionary, Order, Profile/settings (language), offline/sync-queue banner.

### DeePonyCap
**Settings (dark, mobile) — Observed**
1. Overlay demo banner hides the page title → inline banner below nav bar.
2. "OFF/ON" pills → switches (`role="switch"`, `aria-checked`), 51×31pt visual, 44pt hit area.
3. Pink page background behind dark cards → dark theme must set page background token.
4. FAB "+" overlaps cards + tab bar on Settings → FAB only on Stable and Wishlist; offset above tab bar + safe area.
5. Emoji tab icons + ~9px labels → SVG icons, 11px min labels, sentence case.
6. "01/01/2020" → `Intl.DateTimeFormat(navigator.language)` ("1 Jan 2020").
7. "Collector Mode — Clean catalog view — less sparkle, more data" → "Compact view — Show more ponies per row with fewer effects."
**Inventory:** onboarding, Stable (grid/list/empty/filter), pony detail, add/edit (photo denied), Logs, Map, Wishlist, Extras (achievements), Settings, sheets.

### IdeaCap (code review; no gallery)
Home "Cork board", Record, Note detail (Analyze, Transcript, Smart analysis, Insights, Action items, Chat). Issues: dark-only theme; "Sticky inspector" jargon; "Chat with this idea" implies AI that is local heuristics ("Smart Assistant") — keep honest labels: "Summary", "Next steps", "Ask about this note"; placeholder "Type your idea here — this is what Smart Assistant analyzes…" → "Type or paste your idea"; 7 accessibility labels total — every icon button needs one; microphone-denied and speech-unavailable states must be designed.

### LedgerCap
**Hub (dark, 390) — Observed**
| # | Problem | Replace with |
|---|---|---|
| 1 | Header row: title + market pill (wraps to 4 lines) + KSE-100 + language control + PKR + fullscreen + theme | Row 1: "LedgerCap" large title left, "…" menu right. Row 2 (single line, 13px): "KSE-100 184,050.10 ▲1.84% · Closed · Updated 2 min ago". Language, currency, theme → Settings. Remove fullscreen button. |
| 2 | "Your wealth · v3.27.0" | "Your wealth" (version only in Settings → About) |
| 3 | Banner "100% of holdings on seed/fallback prices (snapshot 2026-07-01). Tap refresh or open during PSX session." | "Prices are from 1 Jul 2026. They update during market hours (Mon–Fri, 9:30–15:30 PKT)." + "Refresh" |
| 4 | Three refresh controls | Pull-to-refresh + one "Refresh" in the freshness line |
| 5 | "Rs2,102,807.99" | "Rs 2,102,808" (tabular numerals, no paisa on totals) |
| 6 | "Cash Rs0.00" chip | Hide when zero |
| 7 | Tabs Hub · Watch · Funds($) · P&L · Analyze | Home · Watchlist · Funds (pie icon) · Performance · Research |
| 8 | Delta color only | Keep sign + ▲/▼ glyph + color |

**Inventory:** primary (home, funds, market, portfolio + scroll), sheets, tools (zakat, IPO, screener, dividends), settings (worker health, Telegram), marketing pages, Urdu/Roman Urdu variants, stale/offline/worker-down states.

### MasteryCap
**Today (mobile) — Observed**
1. "Hello, Learner" + "LE" + "ID MRX4" → first-run name prompt; if skipped, title "Today" and hide Student ID card.
2. Two filled primaries → primary "Start today's session · 15 min"; "Open Foundations" becomes a list row with chevron.
3. Black text on #C4500A → white text (check ≥ 4.5:1; darken to #A84308 if needed).
4. Monospace tracked labels (CONTINUE, GUIDED SESSION) → 13px semibold sentence case, `--text-secondary`.
5. "Your standing 0%" duplicates progress → hide until > 0.
**Inventory:** Campus, Money, Practice (charts, daily review, Hasil), HTTP Lab (phone Parsons vs desktop editor), Records (export), Settings groups, locked/announced course states, certificate.

### PrismCap
**First run (device select) — Observed**
1. Remove the device gate entirely (use `pointer`/width media queries).
2. Replace emoji device icons (and the wrong iPad = monitor emoji).
3. Pixel fonts → logo only; body `system-ui` 17px.
4. "Change anytime in Profile Settings" contrast (~1.5:1) → gone with the gate.
5. Chevron alignment → 16px right padding, vertically centered.
**Inventory:** Home, Library (filter by players/time), Dashboard/XP, Arcade, Profile, every game: setup → pass-device interstitial → play → round result → exit confirmation; daily challenge; QR share.

### PulseCap
**Today (dark, mobile) — Observed**
1. ALL-CAPS tracked buttons → "Start workout" / "Can't train today?" 17px semibold.
2. Tab labels ALL CAPS → "Today · Train · Progress · Programs · Me", 10–11px medium.
3. Orange gradient + dark text → solid `--accent` with verified contrast label color.
4. "PROGRESS" button duplicates tab → remove.
5. "Add chest volume — 6/12 sets this week." → row with chevron to the plan or "Add sets" action.
6. Textured brown "Demo Mode / Switch" bar → shared inline demo banner: "Sample athlete (Alex)" + "Use my data".
**Inventory:** Train (active logger, rest timer, plate calc), Cardio, Progress (+photos), My plan (+import), Nutrition, Recovery, Rehab, Settings (account, training, fuel, appearance, accessibility, notifications, privacy, about), Profiles, Equipment setup, Split builder, intro + 4 onboarding steps.

### ScentCap
**Today (sample, mobile) — Observed**
1. Monogram "DL" → brand initials ignoring "&", "de", "la" ("D&G" or "DG"); flacon brand text: fit or omit.
2. "94% MATCH" + "scored 94/100" → keep "94% match"; sentence → reason ("Fresh and light — good for a 20° office day.").
3. Temperature twice → keep the chip.
4. "SCENTCAP" eyebrow → remove.
5. "Start mine" → "Use my collection".
6. Tab bar over Mood cards → bottom padding token.
**Inventory:** onboarding, collection (grid/empty/search), add (camera denied, photo library limited), fragrance detail, advisor, calendar, analytics (no data), layering lab, travel kit, settings/backup import errors.

### SoulCap
**Now (desktop 2560) — Observed**
1. Mobile bottom tab bar floats mid-viewport → ≥ 900px: left sidebar (240px) with the 5 destinations; content column 720px; optional right rail for "This week".
2. "What's new" card: text flush against accent bar → 16px padding all sides; "Got it" as right-aligned text button.
3. Ambient blob behind the check-in rows → confine behind the greeting; max 20% opacity under text.
4. "Open quietly" → remove or "See your week".
5. Real first name in greeting capture → fixtures use "Alex".
**Inventory:** Now, Calm (runner: breathing/grounding), Journal (book, picker overlay, photo), People (constellation), You (progress, manual, principles, What SoulCap knows), Settings sheet (all appearance combos), Help flow, age gate, reflection check (item-9 path), export/delete confirmation.

### SteadyCap
**Today (demo, mobile) — Observed** — see Section B list; replacements:
- "0/1 showing up today" → remove; "Medicines" section header shows "0 of 1 taken".
- "12d showing up" / "12-DAY CHECK-IN STREAK" → "Checked in on 12 of the last 14 days".
- "You missed Nicotine patch. No pressure — tap to check off when ready." → "Nicotine patch · due 08:00" + buttons "Taken" / "Skip".
- "One-tap help · Craving protocol · breathe · act · survive" → "Having a craving?" / "Breathe, do one small thing, reach out."
- "Demo mode — Alex recovery profile in isolated storage." → "Sample profile (Alex). Your data isn't affected."
**Inventory:** onboarding, dashboard, recovery (timelines), SOS 5 phases + skip, knowledge, journal, profile, medicine add/edit, notifications permission (future).

### TravelCap
**Dashboard (mobile) — Observed:** splash captured. Splash: first launch only; returning users land on Trips within 300 ms.
**Inventory:** Trips (empty/demo), trip detail, flights/transit (API key missing, API error), hotels (Nominatim no results), explore, packing, budget (split), documents (OCR progress/fail, camera denied), wishlist, memories, emergency mode, passport, party, food, more, settings.

### VaultCap
**Guided demo sheet — Observed:** focus ring on Close at open → focus the sheet title (`tabindex="-1"`) and show rings only for keyboard; 🎭 → shield/sparkle SVG; ①②③ → ordered list; "Start exploring →" → "Start exploring".
**Inventory:** lock (PIN, WebAuthn, lockout, decoy), onboarding (PIN set, skip), dashboard, finance hubs, identity, documents (PDF pack), forms, sheets, tools (zakat, tax, BC), settings (export/import/erase, profile switch), help.

### Hub
Walk: lock screen (three.js + CSS fallback), desktop grid, dock (10 apps), Cap Store, app detail, investor/pitch pages, mobile pages, reduced motion.

---

## D. Design system recommendations — "Cap Foundation"

### D.1 Measured sprawl (CSS/TSX/JS UI sources, excluding vendor/tests)

| App | Unique hex | Radii | Font sizes | Shadows | `!important` | z-index values | Sub-12px decl. |
|---|---:|---:|---:|---:|---:|---:|---:|
| VaultCap | 229 | 20 | 42 | 72 | 131 | 38 | 297 |
| PrismCap | 181 | 27 | 86 | 67 | 208 | 29 | 41 |
| CookCap | 120 | 17 | 12 | 29 | 48 | 14 | 1 |
| SoulCap | 118 | 10 | 28 | 12 | 22 | 16 | 19 |
| DeePonyCap | 117 | 18 | 55 | 37 | 65 | 22 | 25 |
| LedgerCap | 117 | 18 | 56 | 49 | 118 | 23 | 127 |
| ScentCap | 94 | 18 | 32 | 35 | 209 | 13 | 28 |
| AuraCap | 87 | 23 | 27 | 28 | 68 | 13 | 24 |
| SteadyCap | 79 | 20 | 52 | 21 | 47 | 15 | 83 |
| MasteryCap | 69 | 11 | 29 | 13 | 11 | 10 | 39 |
| TravelCap | 52 | 8 | 7 | 8 | 14 | 7 | 1 |
| PulseCap | 36 | 15 | 15 | 3 | 5 | 4 | 77 |
| CarCap | 23 | 9 | 13 | 9 | 0 | 4 | 6 |

Targets after adoption: ≤ 24 color tokens per theme, 5 radii, 11 type styles, 3 elevations, 9 z-index layers, 0 sub-11px text, `!important` only in reduced-motion/forced-colors overrides.

### D.2 Single source of truth
- Location: `capricorn-tooling/shared/design/` (tooling already has `sync:design-system` and `audit:tokens`).
  - `tokens.json` — canonical values.
  - `cap-foundation.css` — generated CSS custom properties + base elements + component classes.
  - `tailwind-theme.css` — generated Tailwind v4 `@theme` block (AuraCap, ScentCap, CookCap, TravelCap).
  - `cap_tokens.dart` — generated `ThemeExtension` (DeeFoodieApp).
  - `tokens.ts` — generated RN theme (IdeaCap).
- Each app keeps only `brand.css` (or equivalent): `--accent`, `--accent-contrast`, optional `--font-display`, optional texture/atmosphere. **No raw hex outside token/brand files** (enforced by `audit:tokens` in CI).

### D.3 Tokens
**Spacing (4-pt):** `--space-0:0; --space-1:2px; --space-2:4px; --space-3:8px; --space-4:12px; --space-5:16px; --space-6:20px; --space-7:24px; --space-8:32px; --space-9:40px; --space-10:48px; --space-11:64px`. Screen side margin: 16px (< 400px wide), 20px (400–699), 24px (≥ 700). Card padding 16. Section gap 24–32. Row min-height 44.

**Radius:** `--radius-xs:6px` (chips, small tags) · `--radius-sm:10px` (buttons, inputs) · `--radius-md:14px` (cards, list groups) · `--radius-lg:20px` (sheets, large media) · `--radius-full:999px` (pills, avatars).

**Type (mobile; px / line-height / weight):**
| Style | Size/LH | Weight | Use |
|---|---|---|---|
| largeTitle | 34/41 | 700 | One per top-level screen |
| title1 | 28/34 | 700 | Detail page title |
| title2 | 22/28 | 600 | Section hero |
| title3 | 20/25 | 600 | Card title |
| headline | 17/22 | 600 | Row title, button |
| body | 17/22 (web may use 16/24) | 400 | Paragraphs |
| callout | 16/21 | 400 | Secondary paragraphs; **all inputs ≥ 16px** (prevents iOS zoom) |
| subhead | 15/20 | 400 | Row subtitle |
| footnote | 13/18 | 400 | Meta, section headers |
| caption1 | 12/16 | 500 | Badges, chart labels |
| caption2 | 11/13 | 500 | Tab labels only |
Desktop ≥ 1024: largeTitle 40/48, body 16/24. Money, stats, timers: `font-variant-numeric: tabular-nums`.
**Families:** UI = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. One optional display face per app for largeTitle/title1 only (SoulCap serif, CookCap Fraunces, ScentCap Newsreader, TravelCap Cormorant, MasteryCap Fraunces, DeeFoodie Fraunces). **Banned for UI text:** pixel fonts, handwriting (Caveat), monospace labels, uppercase with letter-spacing > 0.04em. Section headers: footnote, 600, sentence case (or uppercase ≤ 0.04em, max one per section).
**Dynamic Type (web):** `@supports (font: -apple-system-body) { html { font: -apple-system-body; } }` then size everything in `rem`; keep in-app text-size setting where it exists (SoulCap, VaultCap).

**Color (semantic; both themes):** `--bg`, `--bg-grouped`, `--surface`, `--surface-2`, `--separator`, `--text` (≥ 7:1 target), `--text-secondary` (≥ 4.5:1 on `--surface`), `--text-tertiary` (≥ 3:1, non-essential only), `--accent`, `--accent-contrast`, `--accent-text` (accent usable as text ≥ 4.5:1), `--success`, `--warning`, `--danger` (+ `-text` variants), `--focus` (≥ 3:1 against adjacent colors), `--scrim` (`rgba(0,0,0,.4)`), `--material-bar` (tab/nav bar: 85% opaque surface + `backdrop-filter: saturate(180%) blur(20px)` with `-webkit-` prefix; solid fallback under `prefers-reduced-transparency` / `@supports not`).

**Elevation:** `--elev-0: none` · `--elev-1: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04)` (cards, light only) · `--elev-2: 0 8px 24px rgba(0,0,0,.12)` (sheets, popovers, FAB). Dark theme: elevation by lighter surface, not shadow.

**Z-index:** `--z-base:0; --z-sticky:10; --z-tabbar:20; --z-fab:30; --z-banner:40; --z-sheet:50; --z-modal:60; --z-toast:70; --z-splash:80`.

**Motion:** `--dur-press:120ms; --dur-small:200ms; --dur-sheet:280ms; --dur-page:350ms; --ease-standard:cubic-bezier(.2,.8,.2,1); --ease-exit:cubic-bezier(.4,0,1,1)`. `prefers-reduced-motion: reduce` → opacity-only transitions ≤ 120ms, no parallax/ambient loops, no page curl.

**Touch:** hit target ≥ 44×44 CSS px (iOS) / 48×48 dp (Android native); ≥ 8px between adjacent targets.

### D.4 Components (one implementation each, used everywhere)
| Component | Spec | Replace in |
|---|---|---|
| Button | primary / secondary / tertiary(text) / destructive; heights 44 & 50; sentence case; label ≤ 3 words; icon optional left; **one primary per screen region** | PulseCap caps buttons, MasteryCap dual primaries, VaultCap arrow labels |
| IconButton | 44×44, visible glyph 20–24, `aria-label` mandatory | All headers |
| Switch | `role="switch"` + `aria-checked`; 51×31 track | DeePony ON/OFF pills, all settings |
| SegmentedControl | 2–4 options, 32 high, 44 hit area | LedgerCap language control (moved to Settings) |
| ListRow | leading icon 28, title headline, subtitle subhead, trailing value/chevron; min 44 | Settings everywhere, AuraCap quick stats |
| Card | radius-md, padding 16, elev-1 (light), no nested cards | All dashboards |
| Sheet | grab handle, radius-lg top, max-height 90dvh, safe-area bottom padding, Esc/drag to dismiss, focus trap, returns focus | VaultCap demo, CookCap name gate |
| Banner (inline) | info / warning / danger; icon + one sentence + one action; **never overlays content** | SteadyCap/DeePony/PulseCap/AuraCap demo banners, LedgerCap stale banner |
| Toast | above tab bar + safe area, 4 s, `role="status"`, undo action where destructive | Replace native `alert()` success messages |
| ConfirmDialog | title states consequence, destructive button names action ("Delete trip"), cancel default | Replace `confirm()` (VaultCap 16, LedgerCap 38, MasteryCap 17, DeePony 14, PrismCap 13) |
| EmptyState | 48px icon, title (≤ 5 words), 1 sentence, 1 primary action | Every list |
| ErrorState | what happened, what to do, Retry; never raw error text | Every fetch/import |
| Skeleton | shape-matched, shimmer disabled under reduced motion | Data screens |
| TabBar | ≤ 5 items, SVG icons, labels caption2 sentence case, solid material, height 49 + safe-area, active = accent icon+label | All phones |
| Sidebar | ≥ 700px (fleet decision; MasteryCap keeps tabs by decision) 240px, icons + labels | AuraCap, SoulCap desktop, TravelCap |
| DemoBanner | inline under nav: "Sample data" + "Use my data" | All demo modes |
| Splash | first launch only, ≤ 600 ms, skipped under reduced motion | TravelCap, CarCap |

### D.5 Kill list (fleet)
Emoji as UI icons · pixel/handwriting/monospace UI text · uppercase tracking > 0.04em · version numbers in headings · "OS"/"DNA"/"Kernel"/"Bureau"/"Museum" in user-facing copy · overlay demo banners · splash every cold load · marketing JS (`capricorn-cinematic/scene/pitch/deck-pro/premium-nav.js`) loaded by app `index.html` · native `alert/confirm/prompt` · `user-scalable=no` · `outline: none` without replacement · `100vh` (use `100dvh` with `100vh` fallback).

---

## E. Responsive / device matrix

**Viewports (CSS px, portrait unless noted):**
| Class | Sizes to test | Devices represented |
|---|---|---|
| Tiny | 320×568, **344×882** | iPhone SE 1 / zoomed display; Galaxy Z Fold cover screen |
| Small | 360×780, 375×667 | Galaxy S-series; iPhone SE 2/3 (home button, no notch) |
| Standard | 390×844, 393×852, 402×874 | iPhone 13–16, iPhone 17 |
| Large | 412×915, 430×932, 440×956 | Pixel, Plus/Pro Max |
| Landscape phone | 667×375, 844×390, 932×430 | notch on side — `safe-area-inset-left/right` |
| Foldable open | 600×900 (Pixel Fold half), 673×841, 768×1024 | Z Fold/Pixel Fold inner |
| Tablet | 744×1133 (iPad mini), 820×1180, 1024×1366, 1180×820 landscape, split-view 507 / 694 | iPad family, Android tablets |
| Laptop | 1280×720, 1366×768, 1440×900 | small laptops |
| Desktop | 1920×1080, 2560×1440 | wide monitors (cap content ≤ 1280, reading ≤ 720) |

**Browsers:** iOS Safari (tab + standalone PWA), Chrome Android (tab + installed), macOS Safari, Chrome, Firefox (no View Transitions → SoulCap fallback), Edge on Windows (forced-colors, 125/150% scaling).

**Known failures to reproduce first**
| App | Viewport | Failure |
|---|---|---|
| AuraCap | < 700 | Desktop rail clipped; skip link visible; tab bar over content |
| LedgerCap | 360–393 | Header collision (market pill wraps, controls overlap) |
| SoulCap | ≥ 900 | Mobile tab bar reused on desktop; content not using width |
| CookCap | ≤ 393 | Header subtitle truncation; scrubber overlap |
| SteadyCap, DeePony, PulseCap | all phones | Overlay demo banners hide titles |
| DeePonyCap | all phones | FAB collides with tab bar on Settings |
| MasteryCap | all | Zoom disabled |
| DeeFoodieApp | 320–375 | 2×2 stat tiles clipped; handwriting labels unreadable |
| PrismCap | all | Device gate; pixel-font contrast |
| TravelCap, CarCap | all | Splash on every cold load; galleries capture splash |
| Hub | 320–390 | Dock of 10 icons (previous crescent-slice bug) — re-verify |

**Rules:** iOS standalone PWA has no browser back → every pushed screen needs an in-app back button; Android back gesture must close sheets/dialogs before navigating (`popstate` handling); `viewport-fit=cover` + `env(safe-area-inset-*)` on nav bar, tab bar, sheets, toasts, FAB, lock screens; heights short (667/568) must keep primary CTA visible without scroll on onboarding; keyboard open: focused input scrolled into view, sticky CTAs above keyboard (`visualViewport` resize); landscape phones: do not lock orientation for readers (CookCap) — lock only for games if needed.

---

## F. Accessibility audit

| Finding | Apps (evidence) | Fix |
|---|---|---|
| Pinch-zoom disabled | MasteryCap `index.html` viewport | Remove `maximum-scale=1, user-scalable=no` |
| Sub-12px text | VaultCap 297, LedgerCap 127, SteadyCap 83, PulseCap 77, PrismCap 41, MasteryCap 39, ScentCap 28, DeePony 25, AuraCap 24, SoulCap 19 | Min 11px only for tab labels; 12px captions; 13px+ everything else |
| Handwriting/pixel/mono UI text | DeeFoodie (Caveat tabs/stats), PrismCap (Press Start/VT323), AuraCap/MasteryCap (mono labels) | Token families only |
| Emoji as meaning | SteadyCap check-in faces/pills, DeePony tabs, PrismCap devices, VaultCap sheet | SVG icon + text label; emoji decorative `aria-hidden` |
| Custom toggles without semantics | DeePony ON/OFF pills (likely elsewhere) | `role="switch"` |
| Focus rings on load / skip link visible | VaultCap sheet, AuraCap | `:focus-visible` only; skip link hidden until focused |
| `outline:none` | VaultCap 6, SteadyCap 5, PrismCap 5, CookCap 4, LedgerCap 4 | Replace with `--focus` ring 2px offset 2px |
| Reduced motion missing | CarCap (0), IdeaCap (0), DeeFoodie (0) | Honor OS setting; Flutter `MediaQuery.disableAnimations`; RN `AccessibilityInfo.isReduceMotionEnabled` |
| Screen-reader labels sparse | IdeaCap 7, DeeFoodie 9 Semantics | Label every icon button, image, chart summary |
| Color-only status | score rings (AuraCap), deltas (LedgerCap has sign — keep), SteadyCap red pill | Text + icon + color |
| Native `alert/confirm` | LedgerCap 38, MasteryCap 17, VaultCap 16, DeePony 14, PrismCap 13, IdeaCap 10 | ConfirmDialog/Toast (accessible, themable) |
| Translucent bars over content | SteadyCap, AuraCap, ScentCap | `--material-bar` with solid fallback + `prefers-reduced-transparency` |
| Dynamic Type | all web apps use px | rem + `-apple-system-body`; Flutter text scale to 2.0 without clipping; RN `maxFontSizeMultiplier` ≤ 1.6 on tab labels only |
| Forms | inputs < 16px trigger iOS zoom; errors must be text + `aria-describedby` + `aria-invalid` | Form component |
| Language | LedgerCap/MasteryCap Urdu: `lang="ur" dir="rtl"` on Urdu nodes; Roman Urdu `lang="ur-Latn"` | i18n wrapper |
| Games | PrismCap pass-and-play must announce turn changes (`aria-live`) and avoid timing-only challenges without an option to extend | per game |

Tooling: `@axe-core/playwright` in every web repo (ScentCap already), Lighthouse a11y ≥ 95 per primary route, manual VoiceOver (iOS Safari + standalone) and TalkBack (Chrome) scripts per critical journey, Flutter `flutter test` with `meetsGuideline(textContrastGuideline / androidTapTargetGuideline / iOSTapTargetGuideline / labeledTapTargetGuideline)`.

---

## G. Performance audit

| Issue | App | Recommendation |
|---|---|---|
| 333 KB `app.js` + 141 KB `data.js` + 98 KB CSS, unminified, parsed on every launch | SoulCap | Minify + split: shell (Now) first; lazy Calm/Journal/People/You modules; `data.js` → JSON loaded per section; precache via SW |
| `ui.js` 188 KB + marketing JS in `js/` | VaultCap | Remove marketing JS from app `index.html`; lazy modules by hub |
| Committed `ledgercap.bundle.js`, 57 `console.log`, remote proxies with retries | LedgerCap | Strip logs in production; single Worker endpoint with timeout 8 s + cached last-good prices |
| three.js + GSAP + framer-motion for decorative scene/route transitions | AuraCap | Remove three + GSAP (ScentCap already did); CSS/View Transitions |
| tesseract.js, leaflet, recharts, dnd-kit | TravelCap | `next/dynamic` per route; OCR worker loaded only after user taps "Scan"; show progress + cancel |
| 10k-eatery `archive.json` asset, 169 remote Unsplash images | DeeFoodieApp | Parse in `compute()` isolate; index by area; `cached_network_image` with size-constrained `memCacheWidth`; bundled low-res placeholders |
| Splash delays | TravelCap, CarCap | First launch only |
| Hub OS: three.js lock scene, ~13 s dev cold start | Hub | Poster image first, three.js after idle and only on capable GPUs; `prefers-reduced-motion` = static |
| 60k LOC, page-curl/dresser animation | CookCap | Already measured 60 fps onboard; add budget check for low-end Android (Moto G class) and memory for 790 recipe images (virtualize pages) |
| 154–212 `innerHTML` rebuilds per render | PrismCap, LedgerCap, VaultCap | Update changed nodes only on hot paths (lists, tickers, game boards) |

**Budgets (web):** LCP ≤ 2.5 s and INP ≤ 200 ms on mid-range Android over "Fast 4G"; CLS ≤ 0.1; initial JS for app shell ≤ 170 KB gzip; route JS ≤ 100 KB gzip; images ≤ 200 KB each, AVIF/WebP with explicit width/height; SW precache ≤ 5 MB (except explicit offline packs). **Native:** cold start ≤ 2 s on iPhone 12; no dropped frames on scroll lists (Flutter DevTools raster < 16 ms); memory < 250 MB steady.

---

## H. Security / privacy audit

### Must never ship (P0)
1. **IdeaCap — client-side AI keys.** `EXPO_PUBLIC_OPENAI_API_KEY`, `EXPO_PUBLIC_ANTHROPIC_API_KEY` are inlined into bundles; `ai.ts` calls providers directly. Remove the code path (or proxy behind authenticated server). Rotate any key that has ever been in `.env` for a built/deployed artifact.
2. **LedgerCap — public CORS proxies** (`api.allorigins.win`, `corsproxy.io`) in the price path: third parties can observe holdings interest and inject prices. Route only through the owned Worker; validate response schema; show "price unavailable" instead of trusting unknown sources.
3. **VaultCap — runtime third-party scripts** (jsDelivr/cdnjs, SheetJS 0.18.5 with CVE-2023-30533 / CVE-2024-22363) in an encrypted vault. Vendor pinned, patched builds into the repo (SheetJS ≥ 0.20.2 from the official distribution), load same-origin, parse untrusted files in a Web Worker, keep `script-src 'self'`.
4. **DeeFoodieApp — API exposed via tunnel with stub auth; Postgres/Redis ports.** Never expose DB ports; API requires real auth before any public URL; strip EXIF GPS from uploaded photos unless the user opts in.
5. **Real personal data in committed artifacts** (SoulCap "Shamikh" in fixtures/screenshots). Replace with fictional names across repos; re-generate galleries.

### High
- **VaultCap** — logo proxy default-on (institution names leave device); LLM import consent; legacy model id; verify PIN KDF cost + lockout + the `pin:'123456'` default state; `style-src 'unsafe-inline'`.
- **Sensitive data at rest, unencrypted** — SoulCap (mental-health journal), SteadyCap (addiction/medication), TravelCap (passport scans/OCR), DeeFoodie (location history). Offer optional app lock (WebAuthn / passcode) with WebCrypto-encrypted storage, and make export files clearly labeled as sensitive.
- **XSS surface** — `innerHTML` with remote or user strings: LedgerCap 212, VaultCap 205, PrismCap 154, MasteryCap 77, SteadyCap 32, DeePony 29. Audit each sink; `esc()` for text + attribute contexts; `textContent` where possible; Trusted Types in report-only mode to find sinks.
- **MasteryCap** — `new Function` code runner: sandboxed iframe (`sandbox="allow-scripts"`, no same-origin) or Worker with timeouts.
- **LedgerCap** — Telegram bot token stored client-side; document risk and allow clearing; never log it.
- **TravelCap** — AviationStack user key in localStorage; confirm HTTPS on the user's plan; never include the key in error reports or exports.

### Hygiene
- Root `.env.local` in TravelCap is ignored by git (verified `.gitignore .env*`, 0 tracked) — keep it that way; add secret scanning (gitleaks) to every CI.
- `.cursor/rules/senior-secops-engineer.mdc` contains PEM header examples — fine, but whitelist in the scanner.
- Remove `releases/v3.0.0` code copies from DeePonyCap (stale code shipped to Pages).
- `.DS_Store` untracked in PulseCap; global gitignore.
- Workspace backups (`shamikhahmed.github.io-backup-*`, `.git.broken-*`) must never be deployed; archive outside `Cap-Apps`.
- Privacy pages missing: CarCap, CookCap, TravelCap, IdeaCap, DeeFoodieApp. Existing privacy pages must list every network destination actually contacted (Open-Meteo, Nominatim, restcountries, frankfurter, er-api, Yahoo, PSX, wger, Worker proxies, Google Fonts).
- Data rights: every app needs "Export my data" + "Erase all data" (with confirmation and irreversible wording) — present in some; verify all.

---

## I. App Store / Google Play compliance audit

### Current platform requirements (verified 2026-09-14)
- **Apple:** since **28 Apr 2026** App Store Connect uploads must be built with **Xcode 26+ and the iOS/iPadOS 26 SDK** (deployment target is still your choice). Sources: [Apple — Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/), [Apple Developer News](https://developer.apple.com/news/?id=ueeok6yw).
- **Google Play:** since **31 Aug 2026** new apps and updates must **target Android 16 (API 36)**; existing apps must target API 35+ to remain available to new users on newer Android; extension possible to **1 Nov 2026**. Source: [Play Console Help — Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en).
- Also applicable (verify in console at submission time): Apple privacy manifests + required-reason API declarations for app and SDKs; App Privacy "nutrition" labels; updated age-rating questionnaire (13+/16+/18+ tiers); EU DSA trader status for EU storefronts; export-compliance (`ITSAppUsesNonExemptEncryption`); account deletion in-app when accounts exist (5.1.1(v)); Sign in with Apple or an equivalent privacy-focused option when third-party login is offered (4.8). Google: Data safety form, 16 KB page-size support for native libraries, edge-to-edge enforcement for API 35+, predictive back, Photo Picker instead of broad media permissions, Health apps declaration, Financial features declaration, account-deletion web link, closed test (12 testers × 14 days) for new personal developer accounts, reviewer access instructions.

### Readiness by app
| App | Native project | Build SDK ok | Permission strings | Privacy manifest | Privacy policy URL | Account deletion | IP clean | Verdict |
|---|---|---|---|---|---|---|---|---|
| ScentCap | ✅ Capacitor 8 iOS | Verify Xcode 26 | ✅ camera/photos/location | ❌ | ✅ public/privacy.html | n/a (no accounts) | ⚠️ brand art | 🟠 |
| VaultCap | ❌ | — | — | ❌ | ✅ | n/a | ✅ | 🔴 |
| SoulCap | ❌ (Expo lab only) | — | mic/speech if transcription | ❌ | PRIVACY.md only | n/a | ✅ | 🔴 (D-05) |
| SteadyCap | config only | — | notifications (future) | ❌ | ✅ | n/a | ✅ | 🔴 |
| LedgerCap | config only | — | — | ❌ | ✅ | n/a | ⚠️ data licensing | 🔴 |
| PrismCap | config only | — | camera (QR?) | ❌ | ✅ | n/a | ❌ game names | 🔴 |
| DeePonyCap | config + templates | — | photos/location (map) | template only | ✅ | n/a | ❌ Hasbro | 🔴 |
| IdeaCap | Expo managed | Verify EAS image Xcode 26 / API 36 | ✅ mic/speech | ❌ `ios.privacyManifests` | ❌ | n/a | ✅ | 🔴 |
| DeeFoodieApp | ✅ Flutter iOS | Verify | ❌ **missing** | ❌ | ❌ | ❌ if auth ships | ⚠️ photos | 🔴 |
| AuraCap, CarCap, CookCap, MasteryCap, PulseCap, TravelCap | PWA only | — | — | — | CarCap/CookCap/TravelCap missing | — | CookCap image rights | n/a (PWA) |

---

## J. Rejection risk register

Likelihood/impact: H/M/L. Owner: **C** = Cursor can fix · **H-L** = human legal · **H-B** = human business/product.

### Fleet-level
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Multiple template-similar apps from one account (shared Cap shell, same splash/banner patterns) | 4.3(a) Spam | H | H | Ship ≤ 3 native apps (D-01); distinct value, visuals and metadata per app; consider one app with modules where overlap exists | H-B |
| Web-wrapper apps with no native value | 4.2 Minimum functionality | H | H | Native capabilities that matter (Face ID, notifications, widgets, share extension, camera), offline, native navigation feel | C + H-B |
| Screenshots/metadata show demo/marketing states, "OS" claims | 2.3.3 / 2.3.7 | M | M | Real in-app screenshots; no "OS"/AI claims | C |
| Missing privacy manifests / nutrition labels mismatch | 5.1.1, 5.1.2 | M | H | Xcode privacy report; labels match every network call | C + H-L |
| Built with old SDK / target API | Upload blocked | H | H | Xcode 26 / API 36 toolchains | C |

### IdeaCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Bundled third-party AI keys; undisclosed data to OpenAI/Anthropic | 5.1.1/5.1.2, security | H | H | Remove cloud path or server proxy + consent + disclosure | C / H-B |
| expo-av incompatibility → crash/build failure | 2.1 | H | H | Migrate to `expo-audio` | C |
| No privacy policy / support URL | 5.1.1(i), 1.5 | H | H | Publish policy & support page | H-L + C |
| Speech data sent off-device without disclosure | 5.1.2 | M | H | On-device recognition only, or explicit disclosure | C |
| Dark-only UI, low a11y labels | 2.5 / quality | M | M | System theme; labels | C |
| Android predictive back disabled; target 36 | Play | M | M | Enable and test back | C |

### DeeFoodieApp
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Crash on location/photo request (missing usage strings) | 2.1 / 5.1.1 | H | H | Add purpose strings with specific reasons | C |
| App for two people; stub auth; ngrok backend down during review | 2.1, 4.2, 3.2 (private apps) | H | H | TestFlight/private distribution (D-10) | H-B |
| Social login without SIWA equivalent | 4.8 | M | H | SIWA if Clerk social providers used | C |
| Accounts without in-app deletion | 5.1.1(v) | H (if accounts) | H | Delete account flow + server purge | C |
| Stock photos shown as specific venues | 2.3 / 5.2 | M | M | Only licensed, venue-linked photos; attribution | C + H-L |
| Brand names (Golootlo, Vouch365 deals) | 5.2.1 | L | M | Factual references only, no logos | H-L |

### ScentCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Brand trade-dress in generated bottle art / brand logos | 5.2.1 | M | M | Generic flacon art, text brand names only | C + H-L |
| Missing privacy manifest / encryption key | 5.1.1 / export | M | M | Add `PrivacyInfo.xcprivacy`, `ITSAppUsesNonExemptEncryption=false` (if no custom crypto) | C |
| Location used "once" but copy/timing unclear | 5.1.1(ii) | L | M | Ask only when user taps "Use my location"; manual city fallback | C |
| `LAUNCH_PREVIEW`/Pro unlocks outside IAP | 3.1.1 | M (if paid) | H | D-11 | H-B |
| Minimum functionality vs PWA | 4.2 | M | H | Widgets, haptics, camera add, share | C |

### VaultCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Reviewer cannot pass PIN | 2.1 | H | M | Review notes: demo vault + PIN 123456 | C |
| Encryption export compliance | Export | H | L | Declare standard encryption exemption correctly | H-L |
| Financial data sent to LLM/logo proxy undisclosed | 5.1.2 | M | H | Opt-in consent, labels, policy (D-08) | H-B + C |
| Pro gates without IAP | 3.1.1 | M | H | D-11 | H-B |
| Remote code loading (CDN scripts) | 2.5.2 | M | H | Vendor locally | C |
| "Emergency info on lock screen" wording implies OS integration | 2.3 | L | M | Precise copy | C |

### SoulCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Mental-health app without clear crisis resources | 1.4.1 | M | H | Region-aware resources reviewed by clinician (D-05) | H-L |
| PHQ-9/GAD-7 perceived as diagnosis | 1.4.1 | M | H | Keep "not a diagnosis" wording; reviewer sign-off | H-L |
| 18+ gate vs age rating | Age rating | M | M | 17+/18+ rating aligned | H-B |
| Health data in exports/backups | 5.1.3 | M | H | Encryption option, no cloud | C |
| Web wrapper | 4.2 | M | H | Native reminders (opt-in), widgets, Face ID lock | C |

### SteadyCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Medication/nicotine guidance perceived as medical advice | 1.4.1 | M | H | "Not medical advice", doctor-supervised wording, no dosing advice | H-L + C |
| Substance-related content rating | Age rating | M | M | Correct questionnaire answers | H-B |
| Medicine reminders unreliable on PWA | 2.1 | M | M | Native local notifications or honest copy | C |
| Web wrapper | 4.2 | H | H | See fleet | H-B |

### LedgerCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Unlicensed market data (PSX/Yahoo scraping) | 5.2.2 | H | H | Licensed feed or remove live data from store build (D-09) | H-L |
| "Signals"/research as investment advice | 3.2.1(viii), 1.4 | M | H | Education/tracking wording, disclaimers | H-L + C |
| Telegram bot integration requires user token | 5.1.1 | L | M | Clear explanation, optional | C |
| Header/layout breakage on small iPhones | 2.1 / 4.0 design | H | M | P1 header fix | C |

### PrismCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Trademarked game names (Connect Four, Codenames, Taboo) | 5.2.1 | H | H | Rename + change distinctive rules/visuals (D-06) | H-L + C |
| Pointless onboarding gate, pixel-font legibility | 4.0 design | M | M | Remove gate; readable type | C |
| Manifest/metadata "PrismOS" mismatch | 2.3 | M | L | Rename | C |

### DeePonyCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Hasbro IP (name, characters, catalog imagery) | 5.2.1 | H | H | D-04 | H-L |
| Kids Category/COPPA implications | 1.3, 5.1.4 | M | H | Declare 13+ general audience or full Kids compliance (no third-party SDKs, parental gates) | H-B |
| Stale `releases/` code in bundle | 2.5 | L | L | Remove | C |

### AuraCap
| Risk | Guideline | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| Apple feature names ("Control Center") and Apple imagery | 5.2.5 (Apple trademarks) | M | M | Rename, no Apple device art/logos | C |
| Claims to analyze your device but uses manual import | 2.3.1 | M | H | Honest copy: "Paste or type your apps" | C |
| Minimum functionality | 4.2 | H | H | Keep PWA | H-B |

### CarCap / CookCap / TravelCap / PulseCap / MasteryCap (PWA-only today)
| App | If ever submitted — main risks |
|---|---|
| CarCap | 4.2 (thin utility), reminders need native notifications, no privacy policy |
| CookCap | 5.2.1/5.2.2 recipe image & text rights, no privacy policy, 4.2 |
| TravelCap | Passport/document handling disclosure (5.1.1), OCR camera permission strings, AviationStack key UX, name "TravelOS" metadata |
| PulseCap | 1.4.1 health/fitness advice (rehab/pain flags), HealthKit expectations, 4.2 |
| MasteryCap | Owner decision "no store"; trading education 3.2.1(viii)/1.4 disclaimers if reversed |

---

## K. Prioritized roadmap

IDs match `CURSOR-MASTER-PROMPT.md` Section 15. **Owner directive (2026-09-14): every app must reach Tier 1.** Order of execution: **Phase 0 (fleet truth + must-never-ship hotfixes) → Foundation → one app at a time** (SoulCap → ScentCap → MasteryCap → CookCap → VaultCap → PulseCap → SteadyCap → TravelCap → LedgerCap → AuraCap → CarCap → PrismCap → DeePonyCap → DeeFoodieApp → IdeaCap → Hub) → fleet re-verification → `FINAL-REPORT.md`. Inside each app: P0 → P1 → every P2 needed to pass Tier 1 gates → full-product audit → re-score → repeat until Tier 1. P3 only after the whole fleet is Tier 1 and the owner asks. Closest-to-done apps go first so the shared components are proven early, and decision-heavy apps (IP, clinical, baseline recovery) go last so the owner has time to answer parked questions.

### Phase 0 — Fleet truth (before any feature work)
FLT-00 Baseline snapshot & branch per repo · FLT-01 Reconcile Brain `path_on_disk` · FLT-02 PulseCap deletions (D-03) · FLT-03 IdeaCap baseline (D-02) · FLT-04 Upstream tracking for AuraCap/PulseCap/hub · FLT-05 Quarantine backups/broken git · FLT-06 Version single source per app · FLT-07 Gallery harness waits for app ready · FLT-08 Secret scanning + `audit:tokens` in CI

### P0 — Must fix
- **IdeaCap:** IDEA-P0-01 remove client AI keys · IDEA-P0-02 expo-av → expo-audio · IDEA-P0-03 privacy/support URLs
- **DeeFoodieApp:** DFD-P0-01 iOS usage strings · DFD-P0-02 venue photo integrity · DFD-P0-03 backend exposure/auth guard · DFD-P0-04 privacy policy
- **VaultCap:** VLT-P0-01 vendor import libs / fix CSP-blocked loaders · VLT-P0-02 logo/LLM proxy opt-in (D-08) · VLT-P0-03 PIN KDF + default-PIN proof
- **LedgerCap:** LDG-P0-01 remove public CORS proxies · LDG-P0-02 header collision · LDG-P0-03 innerHTML sink audit
- **DeePonyCap:** PONY-P0-01 IP removal (D-04, blocked)
- **PrismCap:** PRSM-P0-01 trademark renames (D-06, blocked)
- **MasteryCap:** MST-P0-01 enable zoom · MST-P0-02 sandbox code runner
- **SoulCap:** SOUL-P0-01 scrub real names · SOUL-P0-02 crisis resources (D-05, blocked on content)
- **AuraCap:** AUR-P0-01 mobile rail clipping + skip link · AUR-P0-02 "demo wardrobe" + "Control Center" copy
- **CarCap / TravelCap:** CAR-P0-01 / TRVL-P0-01 splash first-launch only
- **PulseCap:** PLS-P0-01 restore CI + commit hygiene (after D-03)
- **Hub:** HUB-P0-01 catalog claims aligned with D-04/D-06/D-07

### P1 — Should fix
Foundation adoption (FND-01…06) · shared components (ConfirmDialog, Banner, Sheet, Switch, EmptyState, ErrorState, TabBar) · per-app screen fixes listed in Section C · state matrix coverage for top 3 journeys per app · sensitive-data app lock (SoulCap, SteadyCap, TravelCap, VaultCap already) · privacy pages for all PWAs · ScentCap native readiness (manifest, encryption key, Xcode 26) · SoulCap desktop layout · LedgerCap freshness model · SteadyCap Today simplification · PulseCap typography · CookCap chrome · DeeFoodie typography/legibility · IdeaCap light mode + a11y labels · TravelCap IA + lazy OCR · CarCap reminders design · PrismCap onboarding removal.

### P2 — Polish
Token migration to zero raw hex · motion tokens · skeletons · haptics (native) · empty-state illustrations (one style) · number/date formatting · landscape/tablet refinements · Lighthouse ≥ 95 perf/a11y on primary routes · removal of marketing JS from app bundles · copy glossary pass.

### P3 — Optional
Widgets (ScentCap/VaultCap), share extensions (IdeaCap), Live Activities (PulseCap if ever native), foldable dual-pane layouts, Trusted Types enforcement, per-app sound design, CookCap page-turn sound.

---

## L. Cursor master prompt
See **`CURSOR-MASTER-PROMPT.md`** in this folder — copy the whole file into Cursor.
