# Capricorn motion contract (fleet)

Source of truth for shared craft. Brands keep their own color tokens; **timing and behaviour** come from here.

## Primitives

| Primitive | Files | Use |
|-----------|--------|-----|
| Duration / easing tokens | `tokens.css` (`--cap-dur-*`, `--cap-ease*`) | All surfaces |
| Reveal / stagger | `motion.css` + `capricorn-motion.js` | Marketing + optional app |
| Page view transitions | `motion.css` (`cap-page-rise/lift`, `.cap-vt-header`) | Multi-route marketing |
| Splash / gate | `.cap-splash` + `CapricornMotion.bindSplash()` | First visit only, skippable |
| 10-foot focus | `.cap-focus-tv` | TV / leanback remotes |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` | Mandatory |

## Rules

1. **App shells** (`body[data-cap-app="1"]`): instant reveals — no tilt, magnetic, parallax, or pin-scrub.
2. **Never** delay first input on vault / money / workout logging paths.
3. **Never** paste TheSolution360 harbor palette into Cap / MTX / Project 85.
4. Signature scrub stories = **marketing privilege** only (hub, MTX, P85 home).
5. AuraCap: no GSAP (existing lock) — CSS / View Transitions only.
6. Splash must be skippable (any key/click/wheel/swipe) and session-once.

## Adoption

```html
<link rel="stylesheet" href="…/tokens.css">
<link rel="stylesheet" href="…/motion.css">
<script defer src="…/capricorn-motion.js"></script>
```

Optional premium (marketing only): `motion-premium.css`.

## Per-app motion DoD (fleet gate)

An app's **Motion** column is DONE only when `node scripts/motion-audit.mjs --app <App>` passes. Inputs live in `scripts/motion-audit.config.json`.

| # | Check | Web / Next | Expo (RN) | Flutter |
|---|-------|-----------|-----------|---------|
| M1 | Timing/easing from `tokens.css` | Kit vars present (`capricorn-core.css` if the app already loads it, else generated `cap-motion-tokens.css` linked/imported) **and** authored CSS/TS uses `var(--cap-dur-*)` / `var(--cap-ease*)` (or imports `cap-motion.ts`) | generated `capMotion.ts` imported by authored code | generated `cap_motion.dart` imported + `CapMotion.*` used |
| M2 | Reduced motion honoured | authored `@media (prefers-reduced-motion: reduce)` | `AccessibilityInfo.isReduceMotionEnabled` / `useReducedMotion` | `MediaQuery.disableAnimations` |
| M3 | App shell instant | entry `<body data-cap-app="1">`; no tilt / magnetic / hero-3d / parallax / ScrollTrigger / GSAP in the shell entry | no `setTimeout` launch gate in `App.tsx`; shell on kit timing | no `Future.delayed` launch gate in `main.dart`; shell on kit timing |
| M4 | Splash (where one exists) | skippable (pointer/key/click), session-once (`sessionStorage`/`localStorage`), bypassed or opacity-only under reduced motion | OS splash only → n/a | OS splash only → n/a |
| M5 | AuraCap no-GSAP | no `gsap` / `ScrollTrigger` reference or vendor file anywhere shipped; `sync-design-system.mjs` Aura target has `noGsap: true` | — | — |

Never delay first input on vault / money / workout logging paths (rule 2) — the shell marker plus a skippable splash are the static proxies; each app's own e2e remains the behavioural proof.

### Generated tokens (no hand copies)

`node scripts/build-motion-tokens.mjs` parses the Motion block of `tokens.css` into `shared/design-system/generated/{cap-motion-tokens.css,capMotion.ts,cap_motion.dart}`. `--sync` copies them into the app paths in `scripts/motion-targets.json`; `--check` fails on drift. Change timing in `tokens.css` only, then re-run `--sync`.

Static-frame lock: motion adoption may only change durations, easings and reduced-motion behaviour. Aliasing an app's own motion var to a kit var is allowed only when the values are identical, or when only a transition timing changes (static gallery frames stay valid).
