# Scripts

Run from workspace root or from `capricorn-tooling/`:

```bash
node scripts/release-marketing.mjs   # full marketing release train
npm run release:marketing            # same, from capricorn-tooling/
```

| Script | Purpose |
|--------|---------|
| `capture-story.mjs` | Persona story shots from `qa/v7/personas/*.steps.json`; overlays story display name; soft-hides DEMO banner |
| `recapture-stories-v7.mjs` | Batch capture (concurrency 3) + `make-story-videos.py`; start with `vaultcap`, then other slugs |
| `device-qa.mjs` | Fleet device QA (overflow, tap&lt;32, text&lt;11, page/hub console) → `device-qa.json` for **G16** |
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

## Story recapture (persona-aligned screenshots)

Gallery recycle in `rebuild-stories-v7.py` left Alex Khan / DEMO banners in VaultCap story shots. Prefer live capture:

```bash
export PW_CORE=/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core
# Proof (3 personas) — ~few minutes
CONCURRENCY=3 node scripts/recapture-stories-v7.mjs vaultcap
# Rest of fleet when idle (39 personas × 3 devices; slow)
CONCURRENCY=3 node scripts/recapture-stories-v7.mjs
```

`capture-story.mjs` loads the persona name from `*.steps.json` / `*.seed.json` / `capricorn-lab/content/stories/<slug>.json`, then `page.evaluate` overwrites visible demo names (VaultCap: `S.user.name`, `holderName`, family head) and hides `#demoBanner` for the shot. Product demo seeders stay unchanged.

## Device QA + Playwright (`PW_CORE`)

Installed browsers (chromium-1243 / webkit-2359) match **playwright-core 1.63**. Set:

```bash
export PW_CORE=/Users/shamikhahmed/Projects/Cap/Cap-Apps/MasteryCap/node_modules/playwright-core
node scripts/device-qa.mjs docs/perfection-2026-10/baseline --apps=VaultCap
```

If browsers fail under Cursor sandbox, also set `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`.

If `PW_CORE` is unset, the script falls back to that MasteryCap path when present. Align any app `@playwright/test` to 1.63 rather than downloading new browsers.

## Tier 1 v3 gates

`npm run tier1` → `shared/testing/tier1.mjs` runs G1–G15 plus:

| Gate | Module | Evidence |
|------|--------|----------|
| G16 | `shared/testing/v3/device-qa-gate.mjs` | `qa/perfection/device/device-qa.json` |
| G17 | `shared/testing/v3/gallery-v3-gate.mjs` | gallery-manifest + INVENTORY (delegates to `shared/gallery/check-completeness.mjs` if present) |
| G18 | `shared/testing/v3/docs-truth-gate.mjs` | docs scan |
| G19 | `shared/testing/v3/minisite-lh-gate.mjs` | mini-site LH JSON or N/A if `/apps/<slug>/` missing |

Portable roots: `scripts/lib/workspace-root.mjs` (`WORKSPACE_ROOT`, `SCRIPTS_DIR`, `SHARED_DIR`).

Set `CAP_WORKSPACE_ROOT` if app repos are not siblings of `capricorn-tooling/`.
