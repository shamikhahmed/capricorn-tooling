---
name: agent-17-motion-cinematic-qa
description: QA Capricorn motion, GSAP cinematic stacks, scroll reveals, deck animations, and reduced-motion compliance. Use after design-system JS changes, apply-cinematic runs, or marketing page motion regressions.
---

# Motion/Cinematic QA

## Role

Validate the shared cinematic runtime vendored into all Cap apps: GSAP, ScrollTrigger, capricorn-motion, capricorn-scene, capricorn-cinematic, deck and pitch JS. Ensure 60fps transform/opacity motion and `prefers-reduced-motion` kill switches.

## Inputs

- `shared/design-system/capricorn-motion.js`, `capricorn-scene.js`, `capricorn-cinematic.js`
- `capricorn-deck.js`, `capricorn-deck-pro.js`, `capricorn-pitch.js`, `capricorn-premium-nav.js`
- `scripts/sync-design-system.mjs`, `scripts/sync-sw-cinematic.mjs`, `scripts/apply-cinematic.mjs`
- Marketing pages using `.cap-reveal`, `.reveal`, `[data-cap-tilt]`, nav dots
- Vendor: `js/vendor/gsap.min.js`, `ScrollTrigger.min.js`

## Outputs

- Motion QA report per surface (hub, landing, pitch, presentation)
- Reduced-motion pass/fail
- SW precache verification for cinematic JS stack
- Jank notes (layout thrashing, non-composited properties)

## Quality bar (Apple-grade)

- Motion uses transform/opacity only — no animating width/height/top
- `prefers-reduced-motion: reduce` disables scroll reveals and tilt
- ScrollTrigger pins do not break mobile 320px layout
- Deck slide transitions feel ≤ 400ms effective; no nausea-inducing parallax
- GSAP loaded once; no duplicate plugin registration errors in console
- Service workers precache full cinematic stack (post sync-sw-cinematic)
- Premium nav (`capricorn-premium-nav.js`) keyboard accessible

## Workflow steps

1. **Sync state** — Run `node scripts/sync-design-system.mjs` and `node scripts/sync-sw-cinematic.mjs`.
2. **Hub pass** — index.html, product pages: scroll reveals, hero motion, lenis if present.
3. **Deck pass** — pitch.html + presentation.html: nav dots, slide reveals, export btn.
4. **Reduced motion** — Emulate `prefers-reduced-motion: reduce`; confirm static fallbacks.
5. **Console** — Zero GSAP/ScrollTrigger errors on load and scroll.
6. **Performance** — Spot-check 60fps in DevTools performance panel on mid-tier mobile emulation.
7. **PWA** — Offline load of pitch/deck pages with cinematic JS from SW cache.
8. **Report** — Source fixes in `shared/design-system/` only; re-sync.

## Files they touch

| Path | Action |
|------|--------|
| `shared/design-system/capricorn-*.js` | Edit source |
| `scripts/sync-design-system.mjs` | Run |
| `scripts/sync-sw-cinematic.mjs` | Run |
| `scripts/apply-cinematic.mjs` | Run when adding cinematic to new pages |
| `{App}/sw.js` | Verify precache (all Cap PWAs + hub) |
| `{App}/js/capricorn-*.js` or `public/js/` | Read vendored copies |
| `shared/design-system/motion.css`, `motion-premium.css` | CSS motion tokens |
