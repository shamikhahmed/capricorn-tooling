# Architecture analyze outputs (ARCH-04…09)

Configs: `qa/architecture/pilots/*.architecture.config.json`  
Spot-checks: `SPOT-CHECK.json` (ARCH-04 Pulse/Scent 60/60), `SPOT-CHECK-ARCH05.json` (fleet 314/314)  
Pages 404: `PAGES-404-ARCH06.json` (ARCH-06 live curl; regenerate with `npm run architecture:pages-404`)  
**Findings → queue (ARCH-07):** `QUEUE-INDEX.md` + `queue/<App>-ARCH-QUEUE.{json,md}`  
**Staleness check (ARCH-08):** `CHECK-ARCH08.json` via `npm run architecture:check`  
**Regenerate (ARCH-09):** `REGEN-ARCH09.json` via `npm run architecture:regen` (Cap-Apps siblings required)  
Log: `LOG.md`

Regenerate (do not commit large `architecture-data.*` / viewer copies — gitignored under `pilot-*/`):

```bash
# from capricorn-tooling/
npm run architecture:test

# ARCH-09 — refresh pilots from Cap siblings (after structural change / stale check)
npm run architecture:regen -- --stale
npm run architecture:regen -- --slugs cook,ledger,pulse,scent,travel
npm run architecture:regen -- --dry-run

# example analyze (single app)
node shared/architecture/analyze.mjs \
  --root ../CarCap \
  --config qa/architecture/pilots/carcap.architecture.config.json \
  --out qa/architecture/pilot-car

# ARCH-06 — maps must not be on GitHub Pages
npm run architecture:pages-404

# ARCH-07 — findings → Finish Program queue items
npm run architecture:queue
# proof set:
npm run architecture:queue -- --apps PulseCap,ScentCap,CarCap,VaultCap

# ARCH-08 — viewer sync + sourceCommit freshness (fails on stale; never on findings)
npm run architecture:check
```

Open locally (file://): `qa/architecture/pilot-<slug>/index.html` after regenerate.

| Out dir | App |
|---|---|
| pilot-pulse / pilot-scent | PulseCap / ScentCap (ARCH-04) |
| pilot-aura … pilot-vault | remaining Caps |
| pilot-lab / pilot-hub | capricorn-lab / shamikhahmed.github.io |
| queue/ | `<App>-ARCH-<n>` items (ARCH-07) |
