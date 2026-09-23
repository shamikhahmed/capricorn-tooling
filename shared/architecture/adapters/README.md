# Architecture adapters (ARCH-03)

One module per SPEC §3 stack. The analyzer (`analyze.mjs` → `core/pipeline.mjs`) detects stacks, then `runAdapters()` runs every matching adapter (plus `always` adapters).

| Adapter id | Stack(s) | Cap apps |
|---|---|---|
| `vanilla-globals` | classic scripts | SoulCap, PulseCap, VaultCap, CarCap, … |
| `html` | HTML entry/CSP | all web |
| `service-worker` | SW precache | PWAs |
| `es-modules` | import/export + React | AuraCap, ScentCap, TravelCap, … |
| `routes-react` | react-router / Next / RN | AuraCap, ScentCap, TravelCap, IdeaCap |
| `env-config` | env keys only | all (`always`) |
| `cloudflare-worker` | wrangler + worker/ | LedgerCap, VaultCap |
| `nest-prisma` | Nest + Prisma | DeeFoodie `api/` |
| `dart-flutter` | Flutter | DeeFoodie `mobile/` |
| `backend-presence` | supabase/firebase/sqlite | none today — records verified absence |

Adapters never mutate app source. Extraction implementations for mature stacks live under `core/extract/`; this package is the SPEC-facing packaging + new stacks.

```bash
npm run architecture:test
node shared/architecture/analyze.mjs --root /path/to/App
node shared/architecture/analyze.mjs --root /path/to/App --config qa/architecture/pilots/pulsecap.architecture.config.json --out qa/architecture/pilot-pulse
```

ARCH-04 precision notes: PulseCap uses `dispatchPatterns: [{ type: 'reg-go' }]` + `lazyModuleMap: MODULE_CHAIN`; ScentCap uses `excludeStacks: ['vanilla-globals']`. See `qa/architecture/LOG.md`.
