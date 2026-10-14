# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T10:53:53Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | Builder-TravelCap | 2026-10-14T10:53:53Z | perfection loop v3 |
| CookCap | Builder-CookCap | pending | Wave A P0 CK-V3-1 |
| IdeaCap | Builder-IdeaCap | pending | Wave A IDA-V3-1/2 |
| capricorn-tooling/shared/gallery | Gallery-Engineer | 2026-10-14T10:52:00Z | v3 viewer |
| capricorn-tooling/scripts + shared (exc. gallery) | Tooling-Engineer | 2026-10-14T10:54:01Z | Wave A G16–G19 |
| capricorn-lab | Hub-Engineer | 2026-10-14T10:51:00Z | Wave A mini-site skeleton |
| shamikhahmed.github.io | Hub-Engineer | 2026-10-14T10:51:00Z | Wave A mini-site + ?app= |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
