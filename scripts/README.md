# Scripts

Run from workspace root or from `capricorn-tooling/`:

```bash
node scripts/release-marketing.mjs   # full marketing release train
npm run release:marketing            # same, from capricorn-tooling/
```

| Script | Purpose |
|--------|---------|
| `release-marketing.mjs` | Full pipeline: patches → catalog → versions → copy → decks |
| `apply-copy-patches.mjs` | Apply JSON search/replace copy patches |
| `sync-catalog-versions.mjs` | Hub `products-data.js` ← app `VERSION.json` |
| `sync-versions.mjs` | App sw.js, landing badges, changelog, package.json |
| `sync-marketing-copy.mjs` | Catalog hero/tagline → decks + landings |
| `enhance-decks.mjs` | Screenshot embeds, problem slides, feature cards |
| `audit-design-tokens.mjs` | Accent alignment vs catalog |
| `sync-design-system.mjs` | Vendor shared CSS/JS into all apps |
| `sync-sw-cinematic.mjs` | GSAP cinematic precache in service workers |
| `truth-audit.mjs` | Flag legacy branding / marketing drift |
| `generate-capricorn-icons.mjs` | PNG icons for hub + apps |

Portable roots: `scripts/lib/workspace-root.mjs` (`WORKSPACE_ROOT`, `SCRIPTS_DIR`, `SHARED_DIR`).

Set `CAP_WORKSPACE_ROOT` if app repos are not siblings of `capricorn-tooling/`.
