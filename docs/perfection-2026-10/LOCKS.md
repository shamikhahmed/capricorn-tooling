# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T11:07:19Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | Builder-TravelCap | 2026-10-14T11:06:35Z | phases G–H gallery+docs |
| VaultCap | Builder-VaultCap | 2026-10-14T11:05:50Z | Wave B perfection/vaultcap-v3 · VLT-V3-1 + wip review |
| CookCap | Builder-CookCap | pending | Wave A P0 CK-V3-1 |
| IdeaCap | Builder-IdeaCap | 2026-10-14T10:53:00Z | Wave A perfection/ideacap-v3 · IDA-V3-1/2 FIXED → Auditor |
| capricorn-tooling/shared/gallery | Gallery-Engineer | 2026-10-14T10:52:00Z | v3 viewer |
| capricorn-tooling/scripts + shared (exc. gallery) | — (released) | 2026-10-14T11:07:19Z | Tooling-Engineer pushed `perfection/tooling-v3` @ 224b76a |
| capricorn-lab | Hub-Engineer | 2026-10-14T11:06:00Z | Wave A mini-site expand |
| shamikhahmed.github.io | Hub-Engineer | 2026-10-14T11:06:00Z | Wave A mini-site expand |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
