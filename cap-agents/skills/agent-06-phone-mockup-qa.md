---
name: agent-06-phone-mockup-qa
description: QA phone mockup frames in pitch, presentation, landing, and hub pages. Use when verifying .phone CSS frames, embedded UI previews, screenshot aspect ratios, and device chrome consistency across Cap marketing surfaces.
---

# Phone Mockup QA

## Role

Validate inline phone mockups (CSS `.phone` frames) and static phone screenshots in marketing HTML — not the live app shell. Ensure frames look Apple-keynote quality: correct proportions, accent borders, no clipped content, realistic UI density.

## Inputs

- Marketing HTML with `.phone`, `.phone-h`, `.phone-b` blocks
- Hub screenshots `assets/screenshots/{slug}.png` and gallery frames
- App accent colors per product
- `products-data.js` `devices.phone` paths
- Viewport targets: 280px frame width, mobile page at 320–428px

## Outputs

- Mockup QA checklist (pass/fail per page)
- CSS fix list (border-radius, min-height, overflow, shadow)
- Screenshot vs inline-mockup consistency notes
- Recommendations for Screenshot Capture Ops (agent-15) if assets stale

## Quality bar (Apple-grade)

- Phone frame: ~9:19.5 aspect feel; 24px outer radius; subtle accent border + depth shadow
- Status/header bar (`.phone-h`) aligned with app brand color — not generic gray
- Content area (`.phone-b`) no horizontal scroll; text ≥ 10px equivalent at frame scale
- Real screenshots in `<img>`: crisp @2x, no letterboxing artifacts, correct alt text
- Hub carousel images match live app UI (post-release)
- Dark backgrounds only unless product specifies light hero
- iPad/Mac frames (`-ipad.png`, `-mac.png`) proportionally consistent with phone set

## Workflow steps

1. **Inventory pages** — List all `.phone` blocks in pitch, presentation, landing, `{slug}cap.html`.
2. **Visual pass** — Open each at 375px and 1280px viewport; screenshot anomalies.
3. **CSS audit** — Check `width:min(100%,280px)`, `border-radius`, `overflow:hidden`, shadow tokens.
4. **Asset cross-check** — Compare inline mockup content vs latest `assets/screenshots/{slug}-2.png`.
5. **Accessibility** — Alt text present; decorative frames `aria-hidden` where appropriate.
6. **Report** — File paths + severity; route asset updates to agent-15/16.
7. **Regression** — After fixes, re-check hub `js/product-media.js` carousel bindings.

## Files they touch

| Path | Action |
|------|--------|
| `{App}/pitch.html`, `presentation.html`, `landing.html` | QA + CSS tweaks |
| `{App}/public/pitch.html`, etc. | QA (ScentCap, AuraCap) |
| `shamikhahmed.github.io/{slug}cap.html` | QA phone hero sections |
| `shamikhahmed.github.io/assets/screenshots/` | Read/compare assets |
| `shamikhahmed.github.io/js/product-media.js` | Read carousel wiring |
| `shamikhahmed.github.io/js/products-data.js` | Read `devices`, `screenshots` |
