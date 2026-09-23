# Architecture queue index (ARCH-07)

Finish Program pickup: per-app files under `qa/architecture/queue/`.
Mapping: **1:1** analyzer finding → `<APP>-ARCH-<n>` (never auto-delete).

| App | Items | P0/P1/P2 | Queue |
|---|---:|---|---|
| CarCap | 14 | P0=0 · P1=0 · P2=14 | [`CarCap-ARCH-QUEUE.md`](queue/CarCap-ARCH-QUEUE.md) |
| PulseCap | 444 | P0=0 · P1=15 · P2=429 | [`PulseCap-ARCH-QUEUE.md`](queue/PulseCap-ARCH-QUEUE.md) |
| ScentCap | 935 | P0=1 · P1=0 · P2=934 | [`ScentCap-ARCH-QUEUE.md`](queue/ScentCap-ARCH-QUEUE.md) |
| VaultCap | 593 | P0=0 · P1=153 · P2=440 | [`VaultCap-ARCH-QUEUE.md`](queue/VaultCap-ARCH-QUEUE.md) |

**Fleet total:** 1986 items across 4 apps.

Regenerate: `npm run architecture:queue`
