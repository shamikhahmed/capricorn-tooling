# Install the shared gallery viewer into an app

Copy these three files into the **app repo root** (same folder as `package.json`):

```text
capricorn-tooling/shared/gallery/screen-gallery.html  →  <app>/screen-gallery.html
capricorn-tooling/shared/gallery/screen-gallery.css   →  <app>/screen-gallery.css
capricorn-tooling/shared/gallery/screen-gallery.js    →  <app>/screen-gallery.js
```

One-liner from an app repo:

```bash
cp ../capricorn-tooling/shared/gallery/screen-gallery.{html,css,js} .
```

## Expected layout

```text
<app>/
  screen-gallery.html
  screen-gallery.css
  screen-gallery.js
  docs/screenshots/gallery/
    gallery-manifest.json          # schema v2
    light/iphone/….webp
    dark/iphone/….webp
    …
```

The viewer loads `docs/screenshots/gallery/gallery-manifest.json` first, then `gallery-manifest.json` beside the HTML. Shot `file` paths are relative to the gallery folder.

## View

```bash
npm run gallery:view
# or: python3 -m http.server 4173
# open http://127.0.0.1:4173/screen-gallery.html
```

URL filters: `?theme=dark&device=ipad&state=filled&q=banks#money`

Optional accent: `?accent=#0a84ff` or `"accent"` on the manifest.

## Capture + G17

See `CAPTURE.md`. Completeness:

```bash
node ../capricorn-tooling/shared/gallery/check-completeness.mjs --app-dir=.
```

## Mini-site / embedded mode

```text
screen-gallery.html?manifest=./gallery-manifest.json&base=./&theme=both&device=iphone
```

No network, no framework, no CDN (G-9).
