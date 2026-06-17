---
name: agent-16-screenshot-integration
description: Integrates captured screenshots into Capricorn hub, product pages, pitch decks, and presentation slides. Use when wiring new PNGs into products-data, sw.js precache, HTML img refs, and carousel JS.
---

# Screenshot Integration (hub/decks)

## Role

Wire fresh screenshots from `assets/screenshots/` into every consumer: hub catalog JS, product HTML, app pitch/presentation slides, and service worker precache lists.

## Inputs

- New/changed PNGs from agent-15
- `shamikhahmed.github.io/js/products-data.js` (`screenshot`, `screenshots`, `devices`, `screenshotAlts`)
- `shamikhahmed.github.io/js/product-media.js`, `product-page.js`
- `shamikhahmed.github.io/sw.js` precache entries for screenshots
- App `{pitch,presentation,landing}.html` `<img>` tags

## Outputs

- Updated JS catalog paths and alt arrays
- SW precache list includes new asset filenames
- Deck/hub HTML img src + srcset corrections
- Integration checklist (all 8 slugs × consumers)

## Quality bar (Apple-grade)

- Every `screenshotAlts[i]` matches `screenshots[i]` count — no orphan alts
- Lazy-loading + dimensions prevent CLS on product pages
- Hub carousel uses same canonical paths as products-data (no duplicate copies in app repos unless intentional)
- pitch/presentation slides show current UI — not stale inline CSS mockups when PNG available
- sw.js bumps cache version when screenshot set changes materially
- Accessible alt text describes screen content, not "screenshot 3"

## Workflow steps

1. **Inventory changes** — List PNGs added/changed from capture ops log.
2. **products-data.js** — Update `shotPaths()`, `deviceShotPaths()`, `screenshotAlts` if frames changed.
3. **Hub HTML** — Patch `{slug}cap.html` hero and gallery img refs.
4. **JS media** — Verify `product-media.js` carousel indices match array lengths.
5. **SW precache** — Add new paths to `shamikhahmed.github.io/sw.js`; bump cache name.
6. **App decks** — Update pitch/presentation img tags per app if they reference hub assets or local copies.
7. **Phone mockup QA** — Hand off to agent-06 for visual verification.
8. **Release** — Coordinate cache bust with agent-18.

## Files they touch

| Path | Action |
|------|--------|
| `shamikhahmed.github.io/js/products-data.js` | Primary |
| `shamikhahmed.github.io/js/product-media.js` | Carousel wiring |
| `shamikhahmed.github.io/js/product-page.js` | Product detail |
| `shamikhahmed.github.io/{slug}cap.html` | Hero/gallery imgs |
| `shamikhahmed.github.io/sw.js` | Precache bump |
| `shamikhahmed.github.io/assets/screenshots/` | Read assets |
| `{App}/pitch.html`, `presentation.html` | Deck img refs |
