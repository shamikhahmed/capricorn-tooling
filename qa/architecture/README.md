# Architecture analyze outputs (ARCH-04 pilot + ARCH-05 roll-out + ARCH-06 gate)

Configs: `qa/architecture/pilots/*.architecture.config.json`  
Spot-checks: `SPOT-CHECK.json` (ARCH-04 Pulse/Scent 60/60), `SPOT-CHECK-ARCH05.json` (fleet 314/314)  
Pages 404: `PAGES-404-ARCH06.json` (ARCH-06 live curl; regenerate with `npm run architecture:pages-404`)  
Log: `LOG.md`

Regenerate (do not commit large `architecture-data.*` / viewer copies — gitignored under `pilot-*/`):

```bash
# from capricorn-tooling/
npm run architecture:test

# example
node shared/architecture/analyze.mjs \
  --root ../CarCap \
  --config qa/architecture/pilots/carcap.architecture.config.json \
  --out qa/architecture/pilot-car

# ARCH-06 — maps must not be on GitHub Pages
npm run architecture:pages-404
```

Open locally (file://): `qa/architecture/pilot-<slug>/index.html` after regenerate.

| Out dir | App |
|---|---|
| pilot-pulse / pilot-scent | PulseCap / ScentCap (ARCH-04) |
| pilot-aura … pilot-vault | remaining Caps |
| pilot-lab / pilot-hub | capricorn-lab / shamikhahmed.github.io |
