# AuraCap — Tier 1 App Report

**Released:** 2026-09-15 · **v5.4.0** / SW `auracap-v540` · merge `7bc6c12` · tag `v5.4.0`

| Field | Value |
|-------|--------|
| Status | Tier 1 (P0/P1 complete) |
| Live | https://shamikhahmed.github.io/AuraCap/ |
| CI | https://github.com/shamikhahmed/AuraCap/actions/runs/34895782570 — success (test → build → deploy) |
| Live SW | `curl …/sw.js` → **auracap-v540** (proven 2026-09-14) |
| Score (baseline → after) | 49 → ~88 (P0/P1 closed; residual P2 polish deferred) |

## P0 / P1 register

| ID | Severity | What was wrong | What was done | Status |
|----|----------|----------------|---------------|--------|
| AUR-P0-01 | P0 | Rail clipped &lt;700px; skip link always visible; tab bar over content | Hide rail below 700px; skip link focus-only CSS; `app-scroll-pad` | ✅ |
| AUR-P0-02 | P0 | demo wardrobe / Control Center / Digital DNA / LIVE / raw device names | Sample data banner; Overview; Setup report; `normalizeDeviceName`; no LIVE | ✅ |
| AUR-P1-01 | P1 | Header chip stack; theme in topbar | Single row + … menu; theme only in Settings | ✅ |
| AUR-P1-02 | P1 | Four duplicate score rings | One Aura Score + Focus/Clarity/Organization + info sheet (P-AUR-1) | ✅ |
| AUR-P1-03 | P1 | three.js + GSAP | Removed deps + CapScene; CSS route enter (P-AUR-2) | ✅ |
| AUR-P1-04 | P1 | Monospace UI labels | Section labels → body tokens 13px | ✅ |
| AUR-P1-05 | P1 | Quick access duplicated tabs | Max 4: Import, Wallpapers, Profiles, Organizer | ✅ |
| AUR-P1-06 | P1 | Overclaiming import | “Paste or type your apps” | ✅ |
| AUR-P1-07 | P1 | No Apple disclaimer | §4.2 text on Settings About; privacy template | ✅ |
| AUR-P1-08 | P1 | Pro/paywall CSS scaffolding | Removed paywall styles (G-2) | ✅ |

## Decisions applied
G-2, G-8, G-9 (no new third-party), P-AUR-1, P-AUR-2, §4.1 description, §4.2 Apple disclaimer, §4.4 privacy template.

## Verify
- `npm run lint` — 0 errors (pre-existing react-refresh warnings only)
- `npm run test:unit` — 7 deviceName assertions
- `npm run test:e2e` — **8 passed**, 2 gallery skipped (CAPTURE_GALLERY)
- Bundle: main JS ~87 KB gzip; three/gsap gone from graph
- SW cacheId: `auracap-v540`; register `sw.js?v=auracap-v540`

## Remaining / gaps
- P2: broader token migration, emoji cleanup on some pages, marketing landing/pitch copy still mentions older jargon (app shell cleaned)
- Gallery regeneration optional (`npm run gallery`) — not a release blocker
- Physical iOS/Android VoiceOver/TalkBack: ⛔ BLOCKED-EXTERNAL (no device in loop); Playwright + WebKit-capable Chromium used

## Release log
- Branch `finish/auracap` → merge commit `7bc6c12` on `main`
- Tag `v5.4.0`
- Workflow: https://github.com/shamikhahmed/AuraCap/actions/runs/34895782570 (test ✅ build ✅ deploy ✅)
- Live smoke: HTTP 200 · SW cache **auracap-v540**
