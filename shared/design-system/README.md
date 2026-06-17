# Capricorn Design System

One foundation, eight personalities. This is the source of truth for tokens, motion, accessibility, and marketing components shared across all Cap apps. Quality bar: Linear / Stripe / Vercel — premium, restrained, fast.

## Principle

> Apps keep their own visual world (fonts, accent, component styles).
> The **foundation** — spacing, type scale, motion curves, focus rings,
> touch targets, glass, elevation — is shared and identical everywhere.

Per-app identity is a two-line override:

```css
:root {
  --cap-accent: #ff6b35;          /* SteadyCap orange */
  --cap-accent-contrast: #1a0e06;
}
```

## Files

| File | Layer | Required? |
|---|---|---|
| `tokens.css` | Color, type, spacing, radii, elevation, glass, dark/light | Yes |
| `a11y.css` | Focus rings, skip link, sr-only, 44px touch targets | Yes |
| `motion.css` | Reveals, stagger, hover physics, skeletons, reduced-motion kill switch | Yes |
| `components.css` | Buttons, cards, inputs, toast, empty states, badges | Marketing pages / hub |
| `capricorn-motion.js` | Reveal observer, magnetic hover, pointer tilt (~1.5 KB) | Optional |

## Distribution

Apps deploy as independent GitHub Pages repos, so they **cannot** link `/shared/` at runtime. Instead the sync script concatenates `tokens.css + a11y.css + motion.css` into a vendored file in each app:

```bash
node scripts/sync-design-system.mjs        # writes css/capricorn-core.css into each app
```

Then each app links it **before** its own styles:

```html
<link rel="stylesheet" href="css/capricorn-core.css">
<link rel="stylesheet" href="css/app.css">
```

Never edit `capricorn-core.css` in an app — edit here and re-sync.

## Motion usage

```html
<section class="cap-reveal">…</section>            <!-- fade-up on scroll -->
<div class="cap-reveal" style="--cap-stagger-i:2"> <!-- manual stagger slot -->
<a class="cap-btn cap-btn-primary cap-magnetic">   <!-- magnetic CTA -->
<article class="cap-card" data-cap-tilt="6">       <!-- pointer tilt card -->
<h1 class="cap-gradient-text">Kinetic headline</h1>
```

All motion is transform/opacity only (60fps, compositor-driven) and fully disabled under `prefers-reduced-motion: reduce`.

## Dark / light

Dark is the Capricorn default. `<html data-cap-theme="light">` forces light; `data-cap-theme="auto"` follows the OS.
