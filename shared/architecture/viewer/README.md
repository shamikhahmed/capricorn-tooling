# Architecture map viewer (ARCH-02)

Static, zero-dependency viewer for `architecture-data.js` (SPEC §5).

## Open (file:// — no server)

From repo root:

```bash
npm run architecture:viewer
open shared/architecture/viewer/index.html
```

Or analyze any app (copies viewer assets beside the data):

```bash
npm run architecture:analyze -- --root /path/to/App --out /path/to/App/docs/architecture
open /path/to/App/docs/architecture/index.html
```

Demo data in this folder is regenerated from the `vanilla-dispatch` fixture by `architecture:viewer`.

## Stress (5k nodes)

```bash
npm run architecture:viewer:stress
open shared/architecture/viewer/index.html
```

Default view is **Focus** at depth 2; large graphs cluster by folder and use Canvas when &gt; 600 visible nodes.

## Never publish

Do not serve `docs/architecture/` (or SoulCap `architecture/`) on GitHub Pages (C-57 / ARCH-06).

Live gate (from capricorn-tooling):

```bash
npm run architecture:pages-404
```

Requires HTTP 404/410 for every fleet map URL (`PAGES-404-ARCH06.json`). CI: `.github/workflows/architecture-pages-404.yml`.
