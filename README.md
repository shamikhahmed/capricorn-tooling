# Capricorn Tooling

Cross-repo automation for the Capricorn Systems portfolio: marketing release pipeline, design-system sync, version alignment, copy patches, and agent orchestration skills.

## Layout

| Path | Purpose |
|------|---------|
| `scripts/` | Node CLI tools (release, sync, audit) |
| `shared/design-system/` | Source of truth for Capricorn CSS/JS design tokens |
| `shared/marketing/` | Voice and copy guidelines |
| `cap-agents/` | 18 agent skill files + orchestrator playbook |

## Prerequisites

Clone this repo **next to** your app repos (sibling layout):

```
Projects/
  capricorn-tooling/     ← this repo
  shamikhahmed.github.io/
  VaultCap/
  PulseCap/
  …
  ScentCap/
  AuraCap/
```

Optional: set `CAP_WORKSPACE_ROOT` if your apps live elsewhere.

## Quick start

```bash
cd capricorn-tooling
npm run release:marketing   # full pipeline: patches → versions → copy → decks
npm run sync:versions       # VERSION.json → sw.js, landing badges, changelog
npm run audit:tokens        # accent token alignment vs hub catalog
```

## Marketing release pipeline

`scripts/release-marketing.mjs` runs in order:

1. `apply-copy-patches.mjs` — search/replace copy patches (lifestyle + engineering JSON)
2. `sync-catalog-versions.mjs` — hub `products-data.js` versions from each app `VERSION.json`
3. `sync-versions.mjs` — app `sw.js`, landing badges, `package.json`, `changelog.html`
4. `sync-marketing-copy.mjs` — hero/tagline from catalog into decks + landings
5. `enhance-decks.mjs` — Apple-grade problem slides, feature cards, real screenshot embeds

## Agent orchestration

See [`cap-agents/ORCHESTRATOR.md`](cap-agents/ORCHESTRATOR.md) for the 18-agent release train map (pitch, presentation, landing, QA, screenshots, release integrator).

## Design system

```bash
npm run sync:design-system
```

Vendors `shared/design-system/` into each app as `css/capricorn-core.css` and motion JS bundles. **Never edit the copies in app repos** — change the shared source and re-sync.

## Symlinked workspace (legacy)

If you keep a `Projects/scripts` symlink → `capricorn-tooling/scripts`, you can still run from the portfolio root:

```bash
node scripts/release-marketing.mjs
```

## License

Private — Capricorn Systems internal tooling.
