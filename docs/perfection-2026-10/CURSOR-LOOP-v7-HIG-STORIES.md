# Cursor Loop v7 — Apple HIG native feel + "Real people" stories (all apps + website)

Issued 2026-10-21 by Claude Code (reviewer / CEO). Owner: Shamikh. You (Cursor) are the engineer.

**You do not ask questions.** Every decision you would ask about is answered in this file. If something is truly undecidable, pick the option that is most honest, most accessible and most reversible, write the decision in `PROGRESS-v7.md → Decisions`, and keep going.

**You do not stop until §11 "Done" is true for every app and the website.** Work one app at a time, in order, in a loop (§3).

---

## 0. Read first (every new session, in this order)

1. This file.
2. `CURSOR-LOOP-v6-APPSTORE.md` (gates A–K, device matrix, simulator protocol, app briefs) — **still in force**. v7 adds to it; it does not replace it.
3. `CURSOR-LOOP-v6-EXPERIENCE-LAB.md`, `CURSOR-ORDERS-v6-NEXT.md`, `PROGRESS-v6.md`, `LOCKS.md`.
4. The app's Brain note: `~/Capricorn-Brain/01 Projects/<App>.md` (Decisions, Current focus, path_on_disk). Never mix company contexts.
5. Apple HIG — read the real pages yourself (§2.1). Do not work from memory.

## 1. Owner decisions (final — do not re-ask)

| Topic | Decision |
|---|---|
| Design depth | **Native iOS feel.** Keep each app's brand colours, logo and personality; adopt iOS conventions: system font stack, standard tab bar, navigation bar with large title, sheets, grouped/inset lists, standard controls, SF-style iconography, system spacing, haptics, Dark Mode, Dynamic Type. Not a from-scratch redesign. |
| Personas | **Fictional and diverse.** 3 per app. Mix of ages (19–72), genders, cities (Karachi, Lahore, Islamabad, Dubai, London, Manchester + at least one outside these per app, e.g. Toronto, Riyadh, Kuala Lumpur, Nairobi, Berlin), jobs, family situations, tech comfort and accessibility needs (at least 1 persona per app uses large text, VoiceOver, or one-handed use). Every story page carries: *"Illustrative story. People and data are fictional."* |
| Story format | **All four:** (a) story page per persona, (b) day-in-the-life timeline with a real screenshot at each step, (c) before / after with concrete numbers, (d) 20–40 s screen-recorded video. |
| Autonomy | **Commit, merge to `main`, push, tag releases and deploy the live website without asking.** Bound by §9 safety rules. |

## 2. Apple HIG → what you implement

### 2.1 How to read the HIG (it is client-rendered)
`https://developer.apple.com/design/human-interface-guidelines` renders with JavaScript. Read the JSON instead:
`https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`
Read at least these pages and save a dated digest to `capricorn-tooling/docs/perfection-2026-10/hig-digest-2026-10.md` (rules + numbers + URL per rule, mark "Never/Don't/Always" as HARD):

Foundations: `accessibility`, `app-icons`, `branding`, `color`, `dark-mode`, `icons`, `images`, `inclusion`, `layout`, `materials`, `motion`, `privacy`, `right-to-left`, `sf-symbols`, `typography`, `writing`
Patterns: `launching`, `onboarding`, `loading`, `feedback`, `entering-data`, `searching`, `settings`, `modality`, `managing-accounts`, `charting-data`, `undo-and-redo`, `playing-haptics`, `offering-help`
Components: `buttons`, `lists-and-tables`, `sheets`, `tab-bars`, `navigation-bars`, `toolbars`, `text-fields`, `pickers`, `toggles`, `alerts`, `action-sheets`, `menus`, `segmented-controls`, `search-fields`, `progress-indicators`, `charts`
Platforms: `designing-for-ios`, `designing-for-ipados`, `designing-for-macos`
Also: `https://developer.apple.com/design/` (SF Symbols, Icon Composer, Design Resources, Liquid Glass).

### 2.2 Rules already verified by the reviewer (from HIG JSON, 2026-10-21) — these are acceptance criteria

**Typography**
- iOS/iPadOS body default **17 pt**, minimum **11 pt** anywhere. macOS default 13 / min 10.
- Use the iOS text-style ramp (default size): Large Title 34, Title1 28, Title2 22, Title3 20, Headline 17 semibold, Body 17, Callout 16, Subhead 15, Footnote 13, Caption1 12, Caption2 11. In web stacks express these as `rem` tokens scaled by `--dt-scale` (VaultCap pattern: `applyDynamicType`, `-apple-system-body`).
- Avoid Ultralight/Thin/Light weights for UI text. Max 2 typefaces per app (brand display face + system).
- Do not embed/bundle SF Pro font files (HARD). Use `-apple-system, BlinkMacSystemFont, system-ui` stack; Flutter/Expo use the platform default.
- Dynamic Type: layout must work from xSmall to **AX5** (Body ≈ 53 pt). At large sizes: stack horizontal rows vertically, single-line rows grow to multi-line, reduce columns, no truncation of primary content, icons scale with text. Tab labels may stay fixed.
- Offer text enlargement to **≥ 200 %**.

**Accessibility**
- Contrast: text ≤ 17 pt **4.5:1**; ≥ 18 pt or bold **3:1**. Both light and dark. Provide a higher-contrast variant under `prefers-contrast: more` / Increase Contrast.
- Hit targets: **44 × 44 pt** default, **28 × 28 pt** absolute minimum (only for dense secondary controls). Spacing ~12 pt around bezeled controls, ~24 pt around unbezeled ones.
- Never convey state by colour alone (add icon/shape/text).
- Every gesture (swipe-to-delete, swipe-back, pull-to-refresh, long-press) has an on-screen button alternative.
- VoiceOver: every control labelled, images have alt, decorative images hidden, logical focus order, headings marked.
- Reduce Motion: replace slides/zooms/parallax/blur transitions with fades; no autoplay loops. Respect `prefers-reduced-motion`.
- Videos: captions (WebVTT) + transcript; no autoplay with sound; visible controls; poster frame.
- Destructive, hard-to-undo actions (delete vault, reset, delete trip) ask for confirmation; offer Undo where possible.
- Prefer explicit dismissal over timers.

**Layout**
- Respect safe areas (`env(safe-area-inset-*)`, `viewport-fit=cover`) — HARD around Dynamic Island, home indicator, notch, camera housing.
- Layout by size class (compact/regular width), not device name. Functionality must be **identical** across size classes (HARD) — iPad may show more at once, never less features.
- Important content top-leading. Group with spacing/containers, not lines everywhere. Standard margins: 16 pt compact, 20 pt regular (iPad), readable content width ≤ ~672 pt for long text.
- Test smallest (iPhone SE 375 pt) and largest (iPad Pro 13" landscape, MacBook 16") layouts.

**Navigation & components**
- Tab bar = navigation only, never actions (use toolbar / `+` button for actions). 3–5 tabs on iPhone; iPad default ≤ 5, may become a sidebar. Tabs never hidden or disabled; empty sections explain why and offer the first action. Single-word labels + filled SF-style icons. Badges only for critical info. Tab bar visible across sections except under a modal.
- Navigation bar: large title on top-level screens, inline title on pushed screens, back button shows previous title, ≤ 2–3 trailing actions.
- Sheets for focused tasks (add/edit). Medium + large detents where content allows; grabber visible; Cancel (leading) / Done or Save (trailing, bold); confirm before discarding edits.
- Lists: inset-grouped style for settings/forms, section headers in sentence case, chevron only when row pushes, swipe actions mirrored by Edit mode/buttons.
- Pickers/dates/selects: native controls (`<select>`, `<input type="date">`, ComboPicker for long lists — VaultCap pattern). Never a free-text field where a closed list exists.
- Text fields: correct `inputmode`/`autocomplete`/`enterkeyhint`, visible label (not placeholder-only), inline validation, keyboard never covers the active field.
- Alerts: rare, short title, ≤ 2 buttons ideally, destructive button red and not default.
- Search: search field at top of long lists, live filtering, clear button, empty-results message.
- Charts: title + accessible summary text, axis labels, not colour-only, data table alternative.
- Loading: skeletons/progress for > 1 s, never a blank screen; content appears progressively.
- Feedback: haptics on success/error/selection (native builds), toasts brief and non-blocking.

**Launch & onboarding**
- Launch screen = plain background + logo mark matching the first screen; **no text, no ads, no "loading"** (HARD for iOS review).
- Onboarding is after launch, fast, skippable, ≤ 3 screens; teach by doing (inline tips near the control) rather than long tours. Skipped tour is never forced again; reachable later in Settings → Help.
- Ask for permissions (camera, photos, notifications, location) only at first use of the feature, with a one-line benefit before the system prompt.
- Ask for ratings only after engagement, never on first launch.
- Sensible defaults; postpone non-essential setup.
- Demo/sample mode is clearly labelled and exits in one tap (VaultCap pattern).

**Privacy & writing**
- Collect the minimum; explain each data use in plain words; privacy policy matches code (v6 rule: network ⊆ policy ⊆ CSP).
- Writing: sentence case, short, active voice, "you", no jargon, no exclamation marks in UI errors, buttons are verbs ("Save trip", not "OK"). Errors say what happened + how to fix.

**Dark Mode / colour / materials**
- Every screen designed in light and dark; no pure #000 text on #FFF large areas in dark (use elevated surfaces). Semantic colour tokens only (`--label`, `--secondary-label`, `--system-background`, `--grouped-background`, `--separator`, `--tint`). One tint colour per app = brand accent.
- Translucent bars (`backdrop-filter`) only when contrast stays ≥ 4.5:1 behind them; fall back to solid when `prefers-reduced-transparency`.

**Icons / branding**
- App icon: single focused glyph, no text, no photos, no transparency, works small; light/dark/tinted variants for iOS 18+. Logo appears at most once per screen; branding never displaces content.
- UI icons: SF Symbols inside native iOS/macOS code only (licence). On web layers and the website use one consistent outline icon set already in the repo (or Lucide, MIT), matched weight to text.

### 2.3 Per-stack implementation recipe
- **Capacitor / vanilla web (VaultCap, SteadyCap, DeePonyCap, LedgerCap, PrismCap, ScentCap, CarCap, MasteryCap, PulseCap, SoulCap):** add/extend `css/ios-tokens.css` (type ramp in rem, semantic colours light/dark/high-contrast, spacing 4/8/12/16/20/24/32, radii 10/12/16/22, hit-target utility `.hit44`), components `ios-tabbar`, `ios-navbar` (large-title collapse on scroll), `ios-sheet` (detents, grabber, swipe-down + Cancel button), `ios-list` (inset grouped). Reuse VaultCap `luxe.css` / `combo-picker.js` / `applyDynamicType` instead of re-inventing. Capacitor: `@capacitor/haptics`, `@capacitor/status-bar` style sync with theme.
- **AuraCap (Vite/React), TravelCap & CookCap (Next 16):** same tokens as CSS variables + small components; keep TravelCap persist key `travelos-app` untouched.
- **IdeaCap (Expo SDK 57):** native components (`expo-router` tabs, native stack large titles, `@expo/ui` / platform pickers, `expo-haptics`), `allowFontScaling` everywhere, `accessibilityLabel` on every touchable.
- **DeeFoodieApp (Flutter):** Cupertino widgets on iOS (`CupertinoNavigationBar` large title, `CupertinoTabScaffold`, `CupertinoListSection.insetGrouped`, `showCupertinoModalPopup`), `MediaQuery.textScaler` respected, `Semantics` labels. API on ports 5435/6380 must be up for screenshots.

### 2.4 Locks you must not break
- **SoulCap:** crisis copy and helpline numbers are locked; disclaimer text exact. Personas about stress/grief must be gentle, non-clinical, never imply the app treats or diagnoses.
- **SteadyCap:** no medical claims; disclaimer visible; personas show routines/support, never "cured".
- **PulseCap:** stays PWA-only (no `cap add ios`).
- **MasteryCap:** paper design language stays; apply HIG to structure, type, targets, contrast — not a glass/iOS skin.
- **LedgerCap:** no investment advice in stories ("tracks", never "recommends" or "beats the market").
- **Brand:** VaultCap light accent stays navy (theme-audit rule). Approved descriptions in `capricorn-lab/scripts/build-minisites.mjs → DESC` / `DECISIONS.md §4.1–4.2` are not rewritten.
- **Website hub `index.html` is never hand-edited** — always `capricorn-lab` → `npm run build` → `npm run deploy:hub`.

## 3. The loop (run until §11)

```
for app in ORDER:
  A. Claim:   LOCKS.md row → "Cursor v7 · <UTC time> · HIG+stories". git switch -c perfection/v7-hig-stories (from fresh main, pulled).
  B. Baseline: run the app's tests + v6 gates. Record numbers in PROGRESS-v7 (before).
  C. HIG audit: fill qa/v7/HIG-AUDIT.md — one row per §2.2 rule × every screen: PASS / FAIL / N/A + evidence (screenshot path or test name).
  D. Fix every FAIL. Commit in small logical commits (§8). Re-run tests after each group.
  E. Personas: write qa/v7/personas/<id>.json (3 personas, §4) + seed files the app can import (sample-data format the app already supports; else add a dev-only seed loader excluded from production bundles).
  F. Capture: screenshots + videos per persona from the REAL app with seeded data (§5). No mock-ups, no Figma, no editing features in.
  G. Stories: write capricorn-lab/content/stories/<slug>.json (§6). Build pages. Test (§7).
  H. Gates: v6 gates A–K still green + v7 gates (§7). Run full suite twice.
  I. Ship: merge --no-ff to main, bump version (VERSION.json = package.json = SW cache = CHANGELOG top entry), tag vX.Y.Z, push branch + main + tag. Release app web build if it has one (existing deploy path). Then website: capricorn-lab build → build:minisites → deploy:hub → push hub repo.
  J. Live verify: open live URLs (app + /apps/<slug>/ + every story page) on phone/iPad/Mac widths, light + dark; Lighthouse + axe on live. If anything fails → fix forward within the same iteration or `git revert` the merge and redeploy; never leave live broken.
  K. Close: PROGRESS-v7 row all ✅ with evidence paths, Brain note dated line ("2026-10-xx v7 HIG + stories shipped vX.Y.Z"), LOCKS row freed, working tree clean (`git status --porcelain` empty). Write "READY FOR REVIEW: <App>" in PROGRESS-v7 and **continue to the next app** (do not wait). Fix any defects the reviewer adds to PROGRESS-v7 → "Reviewer defects" before starting the app after next.
```

**ORDER:** first, in `capricorn-tooling` on `main`: commit the program docs (`CURSOR-LOOP-v6-*.md`, `CURSOR-ORDERS-v6-NEXT.md`, this file) as `docs(perfection): v6 + v7 programs`, and finish-or-revert the two modified files there (`CURSOR-LOOP-v5.md`, `shared/design-system/marks/pulsecap.svg`). Then finish `CURSOR-ORDERS-v6-NEXT.md` Orders 1–2 (dirty trees, VaultCap J/K). Then:
VaultCap → SteadyCap → PulseCap → SoulCap → DeePonyCap → LedgerCap → PrismCap → ScentCap → AuraCap → CarCap → MasteryCap → TravelCap → CookCap → IdeaCap → DeeFoodieApp → **Website (Capricorn hub, §6.4)** → Wave Z (fleet regression).
For apps after VaultCap, run the v6 A–K pass and this v7 pass **together in one iteration** (one branch, one release).

Machine rules (8 GB Mac): one simulator at a time; never run two Playwright suites at once; QA artifacts go to `build/qa/` (Playwright wipes `test-results/`); `build/` in `.gitignore` as the first commit if missing; kill dev servers and simulators when an iteration ends.

## 4. Personas — spec

File: `<App>/qa/v7/personas/<id>.json`
```json
{
  "id": "vaultcap-ayesha",
  "name": "Ayesha Siddiqui",
  "age": 41,
  "city": "Lahore, Pakistan",
  "role": "Pharmacist, mother of two",
  "tech": "medium",
  "accessibility": "uses Larger Text (AX2)",
  "device": "iPhone 15",
  "goal": "Keep the family's passports, bank accounts and school documents in one safe place",
  "pain_before": ["Documents in 3 drawers and WhatsApp chats", "Missed a passport renewal by 2 months"],
  "how_she_uses_it": ["Family vault with husband", "Expiry reminders", "Zakat summary every Ramadan"],
  "numbers": { "before": {"time_to_find_doc_min": 20}, "after": {"time_to_find_doc_min": 1} },
  "quote": "I stopped digging through drawers.",
  "seed": "qa/v7/personas/vaultcap-ayesha.seed.json",
  "fictional": true
}
```
Rules:
- 3 personas per app, each showing a **different** main use (not three versions of the same story). At least one family/shared or multi-device case where the app supports it; at least one accessibility case; at least one older user (55+) or first-time-smartphone-heavy user.
- Names realistic for their city, not celebrities, not real public figures, no surnames of known families/brands. Avatars: illustrated or abstract initials (no AI photos of "real-looking" people, no stock faces).
- Numbers are plausible, small and labelled "illustrative". Never claim savings the app cannot cause.
- Every feature mentioned **exists in the shipped build**. Grep/test-name evidence in HIG-AUDIT or STORIES.md.
- Seed data fictional: fake account numbers in the app's test format (e.g. `PK00 TEST 0000 ...`), no real IBANs, card numbers, CNICs or phone numbers (use 0300-0000xxx style).

**Suggested personas (use or improve, keep diversity):**
| App | Persona 1 | Persona 2 | Persona 3 |
|---|---|---|---|
| VaultCap | Ayesha, 41, pharmacist, Lahore — family vault, expiries | Omar, 29, freelance dev, Dubai — multi-currency accounts, encrypted backup before phone change | Margaret, 68, retired teacher, Manchester — large text, one place for pension + insurance docs for her son |
| SteadyCap | Bilal, 34, Karachi — daily recovery routine + meds reminders | Priya, 47, Toronto — caring for her father, med schedule for him | Hamza, 22, student, Islamabad — streaks + support contacts (gentle tone) |
| PulseCap (gym) | Sara, 26, Karachi — gym beginner, 3-day split, logs offline at a basement gym | Daniel, 38, London — runner + strength, progress charts | Khalid, 55, Riyadh — doctor-approved walking + light weights, large text |
| SoulCap | Zainab, 31, Lahore — breathing + journaling before work | Tom, 44, Berlin — evening wind-down, sleep routine | Amina, 19, Nairobi — exam stress, grounding tool (shows crisis info exactly as locked) |
| DeePonyCap | Ali, 27, Karachi — sneaker collection + wishlist | Fatima, 36, Dubai — kids' book shelves | George, 61, Manchester — vinyl records, condition notes |
| LedgerCap | Usman, 45, Karachi — PSX portfolio tracking | Nida, 30, Islamabad — mutual funds + monthly SIP log | Raza, 63, Lahore — retirement holdings, dividend log, large text |
| PrismCap | The Khans, Karachi — family game night (4 players) | Mei, 24, Kuala Lumpur — party with friends | Asad, 35, teacher, Islamabad — classroom icebreakers |
| ScentCap | Hira, 28, Lahore — what to wear today by weather | James, 40, London — collection + decants | Saad, 33, Dubai — gift ideas, occasion notes |
| AuraCap | Imran, 37, Islamabad — sets up new MacBook + iPhone | Leila, 29, Toronto — iPad for study layout | Nasreen, 58, Karachi — first iPhone, step-by-step |
| CarCap | Faisal, 42, Karachi — two family cars, service + fuel | Sophie, 33, Manchester — EV charging + MOT reminders | Rashid, 50, Riyadh — fleet of 3 for small business, documents |
| MasteryCap | Ahmed, 20, Lahore — learns trading basics in Roman Urdu | Ruth, 35, Nairobi — career switch to software, English | Bilqees, 45, Karachi — teacher upskilling, progress tracking |
| TravelCap (travel) | Sana & Kamran, Karachi → Istanbul honeymoon — tickets, hotel, docs | Hassan, 39, consultant, Dubai — monthly business trips, visas | The Malik family (5), London → Lahore — Umrah + family visit, kids' passports |
| CookCap | Nani (Shahida), 70, Karachi — family recipes preserved for grandchildren | Rohan, 31, London — weeknight meal plan | Mariam, 26, Islamabad — learning to cook, shopping list |
| IdeaCap | Zara, 32, designer, Lahore — voice ideas while commuting | Kevin, 45, founder, Toronto — product ideas tagged by project | Hamid, 60, writer, Karachi — story ideas, offline only |
| DeeFoodieApp | Dee, 27, Karachi food blogger — journal + ratings | Arsalan, 35, Karachi — family dinner spots, kid-friendly notes | Noor, 24, Karachi student — budget eats list |

## 5. Capture — screenshots and video (real app only)

- Tooling: extend `capricorn-tooling` gallery v3 / `device-qa.mjs` with `scripts/capture-story.mjs <app> <personaId>`: loads seed → runs the step script `qa/v7/personas/<id>.steps.json` (route, taps, waits) → saves PNG + WebP per step for iPhone 16 Pro (402×874 @3x), iPad Air 11" (820×1180 @2x), MacBook 14" (1512×982 @2x), light + dark.
- Native-only screens (launch screen, privacy cover, share sheet, haptics moments): capture in the iOS Simulator one device at a time with `xcrun simctl io <udid> screenshot` / `recordVideo`.
- Video: 20–40 s per persona, 1080p max, H.264 MP4 + WebM, ≤ 4 MB each, no audio or silent track, WebVTT captions describing each step, poster JPG. Status bar clean (simctl `status_bar override` 9:41, full battery).
- Images: WebP (q≈80) with PNG fallback only if needed, `width`/`height` attributes, `loading="lazy"` below the fold, `srcset` for 1x/2x, alt text describing what the screen shows for that persona ("Ayesha's vault home showing 3 documents expiring this month").
- Store under `capricorn-lab/content/stories/<slug>/<personaId>/` (source) → builder copies to `shamikhahmed.github.io/apps/<slug>/stories/…`. Total added weight per app ≤ 15 MB.
- No real personal data on any frame. Run a check: OCR/grep step labels for anything that matches real CNIC/IBAN/card patterns → must be 0.

## 6. Website integration

### 6.1 Content model
`capricorn-lab/content/stories/<slug>.json`:
```json
{ "slug": "vaultcap", "personas": [ {
  "id": "vaultcap-ayesha", "headline": "How Ayesha keeps her family's documents in one place",
  "summary": "…2 sentences…",
  "day": [ {"time": "07:40", "title": "…", "text": "…", "shot": "ayesha/01-home", "alt": "…"} ],
  "before": [ {"label": "Time to find a passport", "value": "20 min"} ],
  "after":  [ {"label": "Time to find a passport", "value": "1 min"} ],
  "video": {"mp4": "ayesha/story.mp4", "webm": "ayesha/story.webm", "vtt": "ayesha/story.vtt", "poster": "ayesha/poster.jpg", "transcript": "…"},
  "features_used": ["family-vault", "expiry-reminders", "zakat"],
  "quote": "I stopped digging through drawers."
} ] }
```
Validate with a JSON schema (`capricorn-lab/content/stories/schema.json`) in `npm test`; every `features_used` id must map to a feature listed in `js/products.js` for that app.

### 6.2 Pages (generated by `build-minisites.mjs`, no frameworks, no third-party requests)
- `/apps/<slug>/` — new section **"Who uses <App>"** right after the hero: 3 persona cards (avatar initials, name, age, city, one-line goal, quote) → link to story.
- `/apps/<slug>/stories/<personaId>/` — story page:
  1. Hero: headline, persona card, "Illustrative story" label, device-framed key screenshot.
  2. **Before / After**: two columns (stack on compact width), numbers large, labels plain.
  3. **A day with <Name>**: vertical timeline (time → step → screenshot in device frame); on iPad/Mac alternate left/right; on phone single column; tap screenshot → existing lightbox.
  4. **Watch it**: `<video controls playsinline preload="none" poster>` + captions track + "Read transcript" disclosure. Never autoplay with sound; muted autoplay only if `prefers-reduced-motion: no-preference` AND in view, and it pauses off-screen.
  5. **Features <Name> uses**: chips linking to the app page's feature tour anchors.
  6. Next/previous persona + "Try <App>" CTA (existing install guide link).
- `/stories/` — index of all 45 stories, filter chips by app and by need (family, health, money, travel, learning, fun), search field. Linked from hub nav and every mini-site footer.
- Hub (capricorn-lab app launcher): when someone opens an app card/window, show a "Real stories" tab or button that opens that app's stories. Use existing `app-demos.js` / `window-manager.js` patterns; on mobile (`mobile-ios.js`) it is a sheet with medium/large detents.

### 6.3 Website design bar (HIG applied to web)
Same tokens as §2.2 (type ramp, contrast, 44 pt targets, safe areas, Dark Mode via `prefers-color-scheme` + manual toggle, Reduce Motion, Reduce Transparency, readable width ≤ 672 px for body text, 16/20 px gutters, sentence case). Each app page uses that app's accent (already contrast-checked in builder — extend check to new components). Looks premium: generous whitespace, real screenshots, restrained motion (fade/translate ≤ 12 px, ≤ 250 ms).

### 6.4 Website iteration (after DeeFoodieApp)
Full HIG audit of hub + all mini-sites + `/stories/` on iPhone SE, iPhone 16 Pro, iPad mini, iPad Pro 13", 8 MacBook sizes (v6 list), light/dark, text 100/130/160/200 %. `npm test`, `qa:matrix`, `qa:flows`, link check (0 broken), Lighthouse ≥ 90 perf / 100 a11y / 100 best-practices / 100 SEO on `/`, `/apps/vaultcap/`, `/apps/vaultcap/stories/<first>/`, `/stories/`. Sitemap + OG images for every story page (og:title = headline).

## 7. Tests and gates (v7, on top of v6)

Per app (all must pass, twice):
1. Existing unit/e2e suites: 0 fail, 0 new skips.
2. **HIG-AUDIT.md**: 0 FAIL rows; every N/A has a reason.
3. Automated checks (add to the app's test suite or `capricorn-tooling/scripts/hig-check.mjs`, run on every screen at iPhone SE, iPhone 16 Pro, iPad Air, MacBook 14", light + dark):
   - every interactive element ≥ 44×44 CSS px (or ≥ 28 with documented reason)
   - computed font-size ≥ 11 px everywhere; body ≥ 17 px at default
   - contrast per §2.2 (axe `color-contrast` + custom check for text on images/glass)
   - axe: 0 serious / critical
   - no horizontal scroll at any width; nothing under safe-area insets (test with simulated insets 59/34 px)
   - text 200 %: no clipped/overlapping primary text (screenshot diff + overflow check)
   - `prefers-reduced-motion`: no transform animations > 0 ms on route changes
   - tab bar: 3–5 items, none disabled, labels present
   - every `<input>` has a label; closed lists use select/ComboPicker
4. Simulator pass (Capacitor/Expo/Flutter apps with iOS target): iPhone SE 3, iPhone 16 Pro, iPad Air 11 — launch screen, onboarding, main flow per persona, Larger Text AX3, VoiceOver spot check (labels read correctly on 10 key controls), Dark Mode. Screenshots in `build/qa/v7/sim/`.
5. Stories: schema valid; every screenshot file exists and is from this release's build (manifest records git SHA); every video has VTT + transcript; Lighthouse/axe on the story page; story page passes the website matrix.
6. Honesty check: each persona's `features_used` ↔ test or code reference; "Illustrative story" label present; no disallowed claims (grep: "cure", "guarantee", "beat the market", "therapy", "diagnos", "100% secure").

Evidence for every gate = a path that exists or a test name + run log in `build/qa/v7/` summarised in `qa/v7/APP-REPORT-v7.md` (committed; raw artifacts stay ignored).

## 8. Git rules

- Branch `perfection/v7-hig-stories` per repo, from up-to-date `main`.
- Small commits, Conventional Commits: `feat(hig): inset-grouped settings list`, `fix(a11y): 44pt targets in tab bar`, `feat(stories): VaultCap personas + capture steps`, `docs(v7): HIG audit VaultCap`, `chore(release): 6.2.0`. Body says what and why. Never forge another author.
- Never commit: secrets, `.env*`, `node_modules`, `build/`, `test-results/`, raw video masters > 10 MB, simulator data.
- Before merge: rebase/merge latest `main`, full suite green twice, `git status --porcelain` empty.
- Merge `--no-ff` into `main`, tag `vX.Y.Z` (semver: minor for HIG/UI changes), push `main`, branch and tag. Website: commit in `capricorn-lab` (source) and the deploy commit in `shamikhahmed.github.io` (`deploy(hub): v7 stories <slug>`).
- Never `push --force` to `main`. Never rewrite published tags. Never delete branches you did not create.

## 9. Safety rules (autonomy has limits)

- You may deploy the **website** (GitHub Pages hub) and the apps' existing web deploy targets. You may **not** submit to App Store Connect / TestFlight, change certificates, provisioning, bundle IDs, App Store metadata, pricing, DNS, Cloudflare Workers secrets, or GitHub repo settings. Those go to `PROGRESS-v7 → Owner-only`.
- Do not change encryption, PIN hashing, data formats or storage keys in a way that can lose existing user data. Any migration needs a test that loads the previous version's data.
- Do not add analytics, trackers, fonts or scripts from third-party hosts (CSP `script-src 'self'` stays).
- If live verification fails and you can't fix it in 30 minutes, revert and redeploy the previous good build, then record it.
- Do not delete user-facing features to pass a gate.

## 10. Docs to update per app
`README.md` (screens + stories link), `CHANGELOG.md`, `VERSION.json`, `qa/v7/HIG-AUDIT.md`, `qa/v7/APP-REPORT-v7.md`, `qa/v7/STORIES.md` (personas, features evidence, capture SHA), privacy policy if any data use changed, App Store text drafts in `qa/v6/APP-STORE.md` (screenshot captions may reuse persona moments — still no fictional claims), Brain note dated line, `PROGRESS-v7.md` row, `LOCKS.md`.

Create `capricorn-tooling/docs/perfection-2026-10/PROGRESS-v7.md` on first run:
| App | v6 A–K | HIG audit | HIG fixes | Personas | Capture | Stories live | Tests ×2 | Live verify | Version/tag | Status |
plus sections: Decisions, Owner-only, Reviewer defects, Blockers.

## 11. Done (stop condition)

All true:
- Every app row in PROGRESS-v7 ✅ in every column with evidence, tagged and pushed, clean trees.
- 15 apps × 3 = **45 story pages live**, `/stories/` index live, every app page has "Who uses <App>".
- Website iteration (§6.4) ✅, Wave Z regression ✅ (all live apps + hub re-checked after the last deploy).
- `FINAL-REPORT-v7.md` written: per app before/after numbers (Lighthouse, a11y, HIG FAILs fixed count, tests), links to every live story, owner-only list, known limits stated plainly.
- Brain: `~/Capricorn-Brain/AI/Claude-Code/` pointer updated and each project note has its v7 line.

Then write `READY FOR FINAL REVIEW: v7` and stop.

Honesty: never mark ✅ without evidence. If something can't be done (e.g. a simulator runtime missing, an API down), write it under Blockers with what you tried and continue with the next item. The reviewer checks every claim.
