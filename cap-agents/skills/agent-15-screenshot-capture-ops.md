---
name: agent-15-screenshot-capture-ops
description: Operates Playwright screenshot capture for all Cap apps into shamikhahmed.github.io/assets/screenshots. Use when regenerating marketing phone, iPad, and Mac shots after UI changes or before hub/deck updates.
---

# Screenshot Capture Ops

## Role

Run and maintain the automated screenshot pipeline. Produce canonical PNGs per slug naming convention for hub carousel, product pages, and deck embeds.

## Inputs

- `shamikhahmed.github.io/scripts/capture-screenshots.mjs`
- `shamikhahmed.github.io/scripts/generate-placeholder-screenshots.mjs` (fallback)
- Live deploy URLs: `https://shamikhahmed.github.io/{App}/`
- App-specific unlock flows (VaultCap PIN, modal dismissals)
- `assets/screenshots/README.md` naming spec (11 files × 8 slugs)

## Outputs

- Updated PNGs in `shamikhahmed.github.io/assets/screenshots/`
- Capture log: slug, frame, success/fail, timestamp
- Diff summary of changed hashes vs prior run
- Blockers list (deploy not live, unlock script broken)

## Quality bar (Apple-grade)

- Resolution crisp @2x; no browser chrome or devtools visible
- Consistent device framing: phone hero, gallery -2…-8(-9), ipad, mac
- UI state representative — real data, not lorem where app supports it
- VaultCap unlocked state for finance screenshots (test PIN path)
- File naming exact: `{slug}.png`, `{slug}-2.png`, `{slug}-ipad.png`, `{slug}-mac.png`
- ScentCap/AuraCap include `-9.png` gallery frame when spec requires
- No personal/sensitive real user data in captures

## Workflow steps

1. **Preflight** — Confirm target apps deployed to GitHub Pages.
2. **Deps** — `cd shamikhahmed.github.io && npm install` (Playwright chromium).
3. **Capture** — `node scripts/capture-screenshots.mjs` (full or slug filter if supported).
4. **Verify output** — Count 88+ files; spot-check visual quality per slug.
5. **Hash diff** — Note which slugs changed for integration agent.
6. **Fallback** — If live capture fails, document before using placeholder generator.
7. **Handoff** — Agent-16 integrates into hub SW + decks; agent-06 validates mockups.

## Files they touch

| Path | Action |
|------|--------|
| `shamikhahmed.github.io/scripts/capture-screenshots.mjs` | Run/maintain |
| `shamikhahmed.github.io/scripts/generate-placeholder-screenshots.mjs` | Fallback only |
| `shamikhahmed.github.io/assets/screenshots/*.png` | Write |
| `shamikhahmed.github.io/assets/screenshots/README.md` | Read spec |
| `VaultCap/index.html` | Unlock targets for capture script |
| Per-app deployed URLs | Capture source |
