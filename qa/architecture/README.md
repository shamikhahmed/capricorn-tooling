# Architecture pilot outputs (ARCH-04)

Regenerate (do not commit large `architecture-data.*` / viewer copies):

```bash
# from capricorn-tooling/
npm run architecture:test

node shared/architecture/analyze.mjs \
  --root ../PulseCap \
  --config qa/architecture/pilots/pulsecap.architecture.config.json \
  --out qa/architecture/pilot-pulse

node shared/architecture/analyze.mjs \
  --root ../ScentCap \
  --config qa/architecture/pilots/scentcap.architecture.config.json \
  --out qa/architecture/pilot-scent
```

Open locally (file://): `qa/architecture/pilot-pulse/index.html` or `qa/architecture/pilot-scent/index.html` after regenerate.

Committed here: pilot configs, `LOG.md`, and `SPOT-CHECK.json`. Regenerate for local AUDIT.md + viewer.
