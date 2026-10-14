# Gallery capture — v3 helpers

Gate: `CAPTURE_GALLERY=1` (CAP-STANDARD). Routine e2e must **not** rewrite shots.

## Deterministic rules (§9.2)

| Rule | How |
|---|---|
| Fixed clock | `2026-10-14T09:41:00` via `galleryClockInitScript()` on the browser context |
| Demo data | `?demo=1` or the app’s demo entry |
| Motion | Inject `GALLERY_FREEZE_CSS` (or `prepareGalleryPage`) |
| Fonts | `await page.evaluate(() => document.fonts.ready)` |
| Network | `waitForLoadState('networkidle')` |
| Theme | Playwright `colorScheme` **and** the app’s own theme setting |
| Build | Production build only |
| Toasts | Hide unless the shot is about a toast |

## Import

```js
import {
  isGalleryCapture,
  galleryClockInitScript,
  prepareGalleryPage,
  shotEntry,
  shotRelativePath,
  GALLERY_VIEWPORTS,
  GALLERY_CLOCK_ISO,
} from '../../capricorn-tooling/shared/gallery/capture-helpers.mjs';

test.skip(!isGalleryCapture(), 'Run via npm run gallery (CAPTURE_GALLERY=1)');

test.beforeEach(async ({ context }) => {
  await context.addInitScript(galleryClockInitScript());
});
```

## Output layout

```
docs/screenshots/gallery/
  light/iphone/money--banks--filled.webp
  dark/iphone/money--banks--filled.webp
  …
gallery-manifest.json   # schema v2
```

## Completeness (G17)

```bash
node ../capricorn-tooling/shared/gallery/check-completeness.mjs --app-dir=.
```

Fails if any inventory entry lacks light/dark for required devices, a manifest file is missing, a shot is older than the app version, or a shot is ≥98% one colour.
