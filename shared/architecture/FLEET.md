# Fleet topology

See `docs/audit-2026-09-14/ARCHITECTURE-FLEET-MAP.md` (Cap Finish Program).

Per-app maps: ARCH-05 ✅ roll-out configs + analyze under `qa/architecture/` (analyzer 1.3.0).
Adapters: `shared/architecture/adapters/` (vanilla Cap static + routes-react + cloudflare + …).
Pilot/roll-out outputs: `qa/architecture/` (see `LOG.md`).
**Never published:** ARCH-06 ✅ `npm run architecture:pages-404` (curl 404 gate; C-57 allowlists).
**Findings → queue:** ARCH-07 ✅ `npm run architecture:queue` → `qa/architecture/queue/<App>-ARCH-QUEUE.*` + `QUEUE-INDEX.md`.
**Staleness / G15:** ARCH-08 ✅ `npm run architecture:check` (viewer sync + `sourceCommit` freshness; `tier1` gate `g15:architecture`).
**Regenerate:** ARCH-09 ✅ `npm run architecture:regen` (`--stale` / `--slugs`; Cap siblings required; CI dry-run).
- ARCH-10: `npm run architecture:app-report`
