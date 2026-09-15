# Cap Fleet Finish Program — Decisions (LOCKED)

**Decided:** 2026-09-14 by Claude (Opus 5) under explicit owner delegation: *"make all the decisions, then Cursor executes them."*
**Status of every item below: LOCKED.** Cursor executes these and does not re-open them. If a decision proves technically impossible to implement exactly, Cursor applies the **Fallback** written in that decision, logs the reason in the app's `qa/finish-loop/LOG.md`, and keeps working. Cursor may append new questions at the bottom only for situations not covered here, and must immediately apply its own recommended option (following the principles in §0) instead of waiting.

---

## 0. Principles used for every decision (apply these to anything not listed)
1. **Protect people first:** user safety, user data and privacy beat features and aesthetics.
2. **Honest product:** no claims the code can't back up (no AI, OS, medical, financial or legal overclaims).
3. **Legal hygiene:** no third-party trademarks or copyrighted content presented as ours; attribute sources.
4. **Keep what works:** preserve features, URLs, storage keys and user data; change presentation, not substance, unless a decision says otherwise.
5. **Simplest stable option** that meets Tier 1.

---

## 1. Global decisions

### G-1 · Distribution (answers D-01)
- **All 15 apps + the website are finished to Tier 1 as PWAs** on GitHub Pages. That is the primary distribution for every app.
- **Native-ready (not submitted):** ScentCap (existing Capacitor 8 iOS project) and VaultCap (add Capacitor 8 iOS project, matching ScentCap's setup) get a complete store pack (`docs/store/`), an app-level privacy manifest, correct permission strings and a clean Xcode 26 / iOS 26 SDK build. Submission to App Store Connect is an account action outside this program.
- **DeeFoodieApp:** private TestFlight distribution only (G-1 + D-10). The build and TestFlight pack are prepared; upload needs the owner's Apple account and is outside the program.
- **IdeaCap:** Expo app — web PWA is the live target; iOS and Android native builds must compile locally (`npx expo prebuild` + `xcodebuild`/Gradle debug builds when the toolchain is present) with correct permissions, target API 36 and a store pack prepared. No submission.
- **All other apps with a Capacitor config** (DeePonyCap, LedgerCap, PrismCap, SteadyCap): **PWA-only.** Keep the config file but do not generate native projects or upgrade Capacitor.
- **Google Play:** no submissions. IdeaCap's Android build must still target API 36.
- For Tier 1 scoring, the App Store / Google Play dimensions are **N/A by this decision** for every app except ScentCap, VaultCap (App Store readiness), IdeaCap (both, readiness only) and DeeFoodieApp (App Store/TestFlight readiness). PWA gate G11 applies to every app.
- Future submission order (for the owner, later): ScentCap → VaultCap → others, at least 4 weeks apart, each with a distinct native capability.

### G-2 · Monetization (answers D-11)
**Everything is free. No IAP, no paywalls, no "Pro".** Remove non-functional upgrade UI, "Pro" badges and gates (VaultPro, AuraCap Pro scaffolding, ScentCap `LAUNCH_PREVIEW` and any Pro gating) so every feature is available. Remove `openProUpgrade()` UI entry points; leave no dead code.

### G-3 · Naming (answers D-07)
- Product names always use the **Cap** form in UI, manifests, titles, metadata, website and docs: **TravelCap** (not TravelOS), **PrismCap** (not PrismOS). DeeFoodieApp's user-facing name is **DeeFoodie**.
- Remove "OS" from product descriptions and taglines ("Personal recovery OS" → "Personal recovery companion"; "Fragrance OS" → "Fragrance wardrobe").
- The website experience itself keeps the name **Capricorn OS** (it genuinely is an OS-style website), but it never describes the apps as operating systems.
- Internal code identifiers, storage keys and repo names do not change.

### G-4 · Publisher identity and contact (answers D-12)
- Publisher: **Capricorn Systems**, Karachi, Pakistan.
- Privacy policy: each app hosts `privacy.html` at its own GitHub Pages path and links it from Settings → About. The website hosts `privacy.html` for itself.
- Support: a single support page at `https://shamikhahmed.github.io/support.html` with per-app FAQs and "Report a problem" linking to `https://github.com/shamikhahmed/shamikhahmed.github.io/issues/new` (title prefilled with the app name). Every app links to it from Settings → About. **Do not publish any personal email address or phone number.**
- If that issues URL is not publicly reachable (private repo), fallback: enable Issues on the public hub repo; if impossible, the support page shows FAQs plus "Contact via GitHub: github.com/shamikhahmed".

### G-5 · Dependencies (pre-approved list)
Approved when needed: `expo-audio` (IdeaCap), `jest` + `@testing-library/react-native` + `jest-expo` (IdeaCap dev), `flutter_secure_storage` (DeeFoodieApp), `@axe-core/playwright` (dev, every web repo), `esbuild` (dev, SoulCap, only under Q-5 fallback), `@capacitor/ios` 8 + `@capacitor/haptics` 8 (VaultCap, matching ScentCap), vendored same-origin copies of libraries already in use.
Anything else: prefer a no-dependency solution. If truly required, pick an actively maintained, permissively licensed (MIT/Apache/BSD), network-free package with the smallest footprint, justify it in LOG.md, and proceed.

### G-6 · Data and encryption migrations (approved under rules)
Allowed when every rule holds: (1) before migrating, write a full backup copy under `<app>_premigration_backup_<fromVersion>` (same storage, excluded from exports); (2) migration is idempotent and resumable; (3) on any error, roll back to the backup and keep the old reader working; (4) a test loads a fixture from the previous version and verifies every record survives; (5) the backup is removed only after 2 successful launches on the new version; (6) never alter user-entered text.

### G-7 · Copy authority
The approved strings in §4 are final. All other copy follows the voice rules and glossary in the prompt. Disclaimers, crisis content and privacy pages must use §4 text exactly (fill placeholders only).

### G-8 · Versioning
- Every release bumps version + service-worker cache name + SW register query + CHANGELOG together (including hotfixes).
- Hotfix/correction releases: patch bump (x.y.**z+1**).
- Tier 1 finish release per app: next minor (x.**y+1**.0), except: CarCap → **1.0.0**, TravelCap → **1.0.0**, IdeaCap → **2.0.0**, DeeFoodieApp → **1.0.0+<build>**.

### G-9 · Third-party requests
No analytics anywhere. No third-party runtime scripts. **Self-host all web fonts** (woff2 in the repo, `font-display: swap`) and remove Google Fonts requests and their CSP entries. Every remaining network destination must be necessary, listed in the privacy page, and allowed in CSP.

### G-10 · Sensitive-data lock (shared pattern)
Apps storing sensitive personal data — **SoulCap** (journal/check-ins), **SteadyCap** (medicines/cravings), **TravelCap** (documents only) — get an optional app lock built on one shared module `capricorn-tooling/shared/security/local-lock.js`:
- Off by default; turning it on first offers "Export a backup".
- 6+ digit passcode → PBKDF2-SHA-256 with ≥ 600,000 iterations (random 16-byte salt) wraps a random 256-bit AES-GCM data key; sensitive stores are encrypted with the data key; WebAuthn (platform authenticator) may unlock the wrapped key where available.
- Auto-lock after 5 minutes in background (setting: 1 / 5 / 15 minutes / never).
- 10 wrong attempts → escalating delay (30 s, 1 min, 5 min…); never auto-erase.
- "Forgot passcode" → explains data can't be recovered → option to erase all data (ConfirmDialog).
- Migration per G-6. VaultCap keeps its own existing crypto (see VLT decisions).

---

## 2. Owner decisions register (all LOCKED)

### D-01 · Store submission plan → **G-1**

### D-02 · IdeaCap baseline → **Rebuild from 1.2.1 (current main).**
Evidence: no v2.0.0 on disk, remote or reflog; `~/Desktop/Cap-Apps` is a symlink to the same workspace. The Brain note's 2026-07-21 "2.0.0" entries are unverified.
**Execute:** implement the valuable intent of that note properly on current main — versioned per-record storage with schema migration and corruption quarantine; `expo-audio`; system light/dark; full accessibility; on-device-only dictation that fails closed (typed input on web or when on-device recognition is unavailable); backup export/import; tests. Release as **2.0.0** at Tier 1. Correct the Brain note: mark the 2026-07-21 entries "not found in any repo — superseded by 2026-09-14 rebuild".

### D-03 · PulseCap 102 deletions → **Damage. Restore from HEAD.**
**Execute:** `finish/pulsecap` from `origin/main` (already restored tree). Keep `preserve/pre-finish-2026-09-14` pushed and untouched forever. Do not port the untracked marketing JS (`capricorn-deck-pro.js`, `capricorn-pitch.js`, `capricorn-premium-nav.js`); regenerate device-matrix outputs instead of porting them. Update `docs/CLAUDE.md` / root `CLAUDE.md` version truth.

### D-04 · DeePonyCap IP → **Independent collectible tracker; remove all third-party IP from bundled content.**
**Execute:**
- Remove every bundled reference to "My Little Pony", Hasbro, official character names and official artwork/logos from catalog data, seeds, UI copy, achievements, manifest, website and marketing pages.
- Replace the bundled G1–G5 catalog with **user-defined series/generation fields** (free text + user-created list). Keep the catalog-browsing UX working on the user's own entries.
- **Never modify user-entered data** (a user's own pony named "Rainbow Dash" stays as they typed it). Demo/sample data uses original invented names (e.g. "Clover Gleam", "Midnight Bloom", "Sunny Pebble").
- Keep the product name **DeePonyCap**, URL and storage keys.
- Add the approved non-affiliation line (§4.2) to About.
- Audience: general audience 13+. Remove "COPPA" / child-targeting wording.
**Fallback:** if a bundled image's origin can't be established, remove it and use the generic illustrated placeholder.

### D-05 · SoulCap crisis resources → **Region-aware Help with verified numbers; ship as PWA.**
**Execute:** implement §4.3 exactly. Every phone number must be verified against the official source listed (fetch the page, confirm the number, record URL + date in `SAFETY.md`). **If a number can't be verified from an official source at implementation time, omit it** (emergency services line always remains). `tel:` links only on user tap; no auto-dial; works offline (bundled). Record in `SAFETY.md` that a qualified clinical review is required before any store submission (none planned, G-1).

### D-06 · PrismCap trademarked game names → **Rename and change distinctive elements.**
| Current | New name | Also change |
|---|---|---|
| Connect Four (any spelling) | **Four in a Row** | Use neutral disc colors (not red/yellow); original board art |
| Codenames | **Clue Grid** | Different grid size/labels (e.g. 4×5 grid, "Clue giver"/"Guessers" not "spymaster"/"agents"), original card design |
| Taboo | **Word Dodge** | "Blocked words" terminology, original card design, no buzzer branding |
**Execute:** keep internal game ids; map display names; migrate stats/XP (G-6 rules). Review all 39 game names: any name matching a known commercial game or brand gets a generic descriptive name using the same approach; generic names (Snake, Sudoku, Tic-Tac-Toe, Charades, Truth or Dare, 20 Questions) stay. Update website, pitch pages and docs.

### D-07 · Naming → **G-3**

### D-08 · VaultCap network features → **Opt-in, default off.**
**Execute:**
- Logo engine: local monogram logos by default. Network logos only after Settings → Privacy → "Download bank logos" is switched on, with an explanation sheet listing exactly what is sent (institution name/domain) and where.
- Smart Import with the LLM proxy: off by default; each use shows a consent sheet listing the fields that will be sent, with "Send" / "Cancel". Model id → `claude-haiku-4-5`.
- Migration: existing installs start with both **off** (no prior explicit consent exists).
- Update the privacy page and CSP `connect-src` so the proxy is only contacted after opt-in.
**Fallback:** if the proxy no longer works, remove the LLM import path entirely and keep rules-based Smart Import.

### D-09 · LedgerCap data sources → **Worker-only, PWA-only, clearly labeled indicative data.**
**Execute:** all price data only via the owned Cloudflare Worker (done in LDG-P0-01). Show source attribution in the freshness line and Settings → About ("Prices: PSX and Yahoo Finance via LedgerCap's server. May be delayed."). Add the approved disclaimer (§4.2). No store distribution. Telegram alerts stay optional.

### D-10 · DeeFoodieApp distribution → **Private TestFlight, two users, token auth.**
**Execute:**
- No Clerk/Auth0 now. The API requires a per-user bearer token (random 32+ bytes) issued with a CLI script (`api/scripts/issue-token.ts`), stored hashed (SHA-256) in the database; the app stores its token in the iOS Keychain via `flutter_secure_storage`. Stub auth stays refused in production (DFD-P0-03 done).
- In-app "Delete my data" (Settings → Privacy): deletes the user's visits, photos and collections on the server and locally, with ConfirmDialog.
- Privacy page on the existing web deploy; linked in-app.
- Postgres/Redis never exposed; only the authenticated API may be tunneled.
- Android not built (project spec). Public App Store: no.
**Fallback:** if Keychain storage can't be verified on the toolchain available, keep the build compiling and store the token with `flutter_secure_storage` defaults; record the verification gap.

### D-11 · Monetization → **G-2**

### D-12 · Legal identity → **G-4**

### D-13 · Website source of truth → **capricorn-lab builds the live hub.**
**Execute:** capricorn-lab is canonical for `shamikhahmed.github.io`. Review capricorn-os-next's extra modules (Cap Store, Codex, Activity Monitor, Gallery, Terminal): port only a module that passes the website's Tier 1 gates after porting; drop the rest. Then add a README banner to capricorn-os-next: "Archived on <date> — superseded by capricorn-lab", commit, push, and move the local folder to `~/Archive/Cap-Apps/<date>/`.

---

## 3. Cursor-raised questions (all LOCKED)

### Q-1 · PulseCap deletions → **D-03 (restore).**
### Q-2 · IdeaCap baseline → **D-02 (rebuild from 1.2.1).**
### Q-3 · SoulCap Now screen → **A. Simplify.**
Order on Now: greeting → one-tap check-in → one suggested technique (with Begin) → "Explore" row → persistent "Get help now". "What's new" appears once per version as an inline card below the check-in, dismissible. Everything else (short path, notice what's happening, this week) moves below the fold under "More", unchanged in function.
### Q-4 · SoulCap app lock → **A. Passcode + WebCrypto (G-10), required for Tier 1 (gate G10).** WebAuthn unlock added where available.
### Q-5 · SoulCap minify/split → **B first:** split `app.js` into route modules and `data.js` into lazily loaded JSON per section, with SW precache; no new dependency. Measure Lighthouse. **Fallback:** only if gate G9 still fails, add `esbuild` as a dev dependency and a `npm run build:docs` step that minifies to the deployed `docs/` output while keeping source readable.

---

## 4. Approved copy (use exactly; fill `{placeholders}` only)

### 4.1 One-line descriptions (website, manifests `description`, README first line, store packs)
| App | Description |
|---|---|
| AuraCap | Organize your iPhone, iPad and Mac setup. |
| CarCap | Service, fuel and documents for your cars. |
| CookCap | Your family cookbook, kept like a real book. |
| DeeFoodie | A private journal of where you eat in Karachi. *(website: listed as "Private beta", no install link)* |
| DeePonyCap | Track your collection, shelves and wishlist. |
| IdeaCap | Capture ideas by voice or text. They stay on your device. |
| LedgerCap | Track your PSX stocks and mutual funds in one place. |
| MasteryCap | Learn trading and software step by step, in English or Roman Urdu. |
| PrismCap | Party games for one phone, passed around the room. |
| PulseCap | Plan, log and track your training. Works offline. |
| ScentCap | Your fragrance collection, and what to wear today. |
| SoulCap | Quiet tools to steady yourself. Not therapy. |
| SteadyCap | Routines, medicines and support for recovery. |
| TravelCap | Trips, tickets and travel documents in one place. |
| VaultCap | Everything you own, encrypted on your device. |

### 4.2 Disclaimers (Settings → About, and where noted)
- **SoulCap** (About, age gate, Help footer): "SoulCap offers self-help tools. It isn't therapy, medical advice, a diagnosis or a crisis service."
- **SteadyCap** (About, medicine add screen footnote): "SteadyCap helps you keep track of routines and cravings. It isn't medical advice. Follow your doctor's or pharmacist's instructions for any medicine."
- **PulseCap** (About, onboarding last step, Rehab screen): "PulseCap gives general training guidance, not medical advice. Stop and get medical help if you feel pain, dizziness or chest discomfort."
- **LedgerCap** (About, Research/Signals screens footer): "LedgerCap is for tracking and education. Prices may be delayed or indicative. Nothing here is investment advice."
- **MasteryCap** (About, Markets branch intro, certificate screen): "MasteryCap is educational. Nothing here is financial advice. Certificates are self-issued and not accredited."
- **VaultCap** (About, PIN setup): "Your vault is encrypted on this device with your PIN. If you forget it, your data can't be recovered — keep an export somewhere safe."
- **CookCap** (under nutrition): "Nutrition values are estimates."
- **TravelCap** (About, flight/visa screens footer): "Always check official sources for visas, entry rules and flight times."
- **ScentCap** (About): "Brand names belong to their owners. ScentCap isn't affiliated with any fragrance house."
- **DeePonyCap** (About): "DeePonyCap is an independent collection tracker and isn't affiliated with or endorsed by any toy company."
- **AuraCap** (About): "Apple, iPhone, iPad and Mac are trademarks of Apple Inc. AuraCap isn't affiliated with Apple."
- **App lock** (SoulCap/SteadyCap/TravelCap, enable sheet): "If you forget your passcode, your protected data can't be recovered. Export a backup first."

### 4.3 SoulCap — Help and age gate

**Help screen**
- Title: "Get help now"
- Lead: "If you might hurt yourself or someone else, or you're in danger, contact emergency services now."
- Region control label: "Your region" — options: Pakistan · United Kingdom · United States · United Arab Emirates · Somewhere else. Default: last chosen; first time, ask.
- Section "Emergency":
  - Pakistan: Rescue **1122** · Edhi ambulance **115** · Police **15**
  - United Kingdom: **999** · NHS **111** (urgent, not emergency)
  - United States: **911**
  - United Arab Emirates: Police **999** · Ambulance **998**
  - Somewhere else: "Call your local emergency number."
- Section "Talk to someone" (verify each from the official source before shipping; omit if unverifiable):
  - United Kingdom: Samaritans **116 123** (source: samaritans.org)
  - United States: 988 Suicide & Crisis Lifeline — call or text **988** (source: 988lifeline.org)
  - Pakistan: Umang mental health helpline (verify the current number on the official Umang Pakistan site; omit if not verifiable)
  - United Arab Emirates: verify a government-listed mental-health support line (e.g. on u.ae); omit if not verifiable
  - Somewhere else: "Find a free, confidential helpline near you at findahelpline.com." (verify site is live)
- Footer: "SoulCap isn't a crisis service and can't contact anyone for you."
- Each number is a large button (`tel:` link) labeled e.g. "Call 1122 — Rescue". Numbers readable as text for copying.

**Age gate**
- Title: "Before you start"
- Body: "SoulCap is for adults 18 and over. It offers self-help tools and isn't therapy, a diagnosis or a crisis service."
- Buttons: "I'm 18 or over" (primary) · "I'm under 18"
- Under-18 screen: title "SoulCap isn't made for you yet" · body "If you need support, talk to an adult you trust, or contact emergency services if you're in danger." · shows the Emergency section for the chosen region · button "Back".

### 4.4 Privacy page template (every app; fill from the real network log)
```
<App> Privacy
Effective {date} · Published by Capricorn Systems, Karachi, Pakistan

Summary
<App> works on your device. We don't have accounts, analytics, ads or tracking, and we don't sell data.

What stays on your device
{list of data types stored locally, in plain words}

What leaves your device
{table: Service · What is sent · Why · When}   (write "Nothing" if there are no requests)

Your controls
Export your data: Settings → {path}. Erase all data: Settings → {path}. {App lock: Settings → {path}, if present.}

Children
{SoulCap: "SoulCap is for adults 18 and over." | Others: "<App> is intended for a general audience aged 13 and over."}

Changes
We'll update this page and its effective date if anything changes.

Contact
https://shamikhahmed.github.io/support.html
```
DeeFoodie variant adds: "Your visits, photos and collections are stored on DeeFoodie's private server so your two devices stay in sync. Delete my data: Settings → Privacy."

---

## 5. Product decisions for items previously marked "proposal first" (all LOCKED)

| ID | Decision |
|---|---|
| P-AUR-1 | AuraCap keeps **one headline "Aura Score"** (brand term, explained in an info sheet) with a breakdown list: Focus · Clarity · Organization. The "Digital DNA" page is renamed **"Setup report"** in UI. Title "Control Center" → **"Overview"**. |
| P-AUR-2 | Remove three.js and GSAP; route transitions via CSS / View Transitions with reduced-motion fallback. |
| P-STDY-1 | SteadyCap: **SOS stays as the center tab** (label "SOS", icon in danger color, label in normal text color); remove the SOS card from Today. Today = inline demo banner (when demo) → "Due now" list (Taken/Skip) → check-in → journal prompt. No streak language anywhere. |
| P-TRVL-1 | TravelCap tabs: **Trips · Explore · Documents · More**. Trip detail contains Itinerary, Transit, Stays, Food, Budget, Packing, Party, Memories. More contains Passport & stamps, Wishlist, Emergency mode, Settings. Emergency mode also reachable from Trip detail header. Old routes redirect to new locations. |
| P-SOUL-1 | Q-3 A (above). Desktop ≥ 900px sidebar (done in SOUL-P1-01). |
| P-COOK-1 | CookCap recipe count = the catalog's actual length, from one exported function used by cover, reader, About and website. |
| P-MST-1 | MasteryCap first run asks "What should we call you?" (skippable). Skipped → title "Today", Student ID card hidden until a name is set. Tabs stay on all widths. |
| P-DFD-1 | DeeFoodie: display name "DeeFoodie"; Home H1 "Your Karachi"; eatery count = actual archive count formatted with `Intl.NumberFormat`. |
| P-CAR-1 | CarCap reminders: in-app "Coming up" list on Today (service due, insurance/registration expiry within 30 days). Optional notifications only when installed as a PWA and permission granted, with copy: "Reminders work while CarCap is installed on your Home Screen. Your phone may delay them." |
| P-PRSM-1 | PrismCap: remove the device-select gate; stored device preference is ignored (kept in storage, unused). |
| P-VLT-1 | VaultCap: remove marketing JS (`capricorn-cinematic.js`, `capricorn-scene.js`, `capricorn-pitch.js`, `capricorn-deck-pro.js`, `capricorn-premium-nav.js`) from the app shell; keep them only where used by `landing.html` / `pitch.html` / `presentation.html`. Same rule for every app that ships copies. |
| P-VLT-2 | VaultCap KDF: if PIN wrapping uses PBKDF2 < 600,000 iterations (SHA-256) or a weaker KDF, re-wrap the data key with PBKDF2-SHA-256 600,000 on the next successful unlock (G-6 rules; keep the old path readable for one version). |
| P-HUB-1 | Website legacy product pages (`carcap.html`, `prismcap.html`, `scentcap.html` and similar) become lightweight redirect pages (meta refresh + canonical link + visible link) to the live app. Investor/pitch pages stay, updated to finished apps and §4.1 copy. DeeFoodie listed as "Private beta" without install link. |
| P-SOUL-2 | SoulCap `backend/` and `mobile/` stay in place, documented in README as lab code, excluded from Pages output and from Tier 1 scoring. |
| P-PONY-1 | Remove `DeePonyCap/releases/` from the working tree (git history keeps it). |
| P-LDG-1 | LedgerCap: languages (English · اردو · Roman Urdu), currency and theme move to Settings → General. Fullscreen button removed. |
| P-FONTS | G-9: self-host fonts in every app that loads Google Fonts. |
| P-IDEA-1 | IdeaCap labels: "Cork board" → "Ideas", "Sticky inspector" → "Details", "Chat with this idea" → "Ask about this note", "Smart analysis" → "Summary". Keep the cork visual metaphor as decoration only. |

---

## 6. New questions (Cursor appends here; must apply its recommendation immediately)
_None yet._
