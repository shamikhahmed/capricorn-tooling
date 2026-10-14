# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T11:14:51Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | Builder-TravelCap | 2026-10-14T11:06:35Z | phases G–H gallery+docs |
| PrismCap | — | — | free (Builder pushed perfection/prismcap-v3 · PRS-V3-1/2 FIXED → Auditor) |
| VaultCap | Builder-VaultCap | 2026-10-14T11:13:33Z | Wave B perfection/vaultcap-v3 · P0/P1 FIXED → Auditor |
| SteadyCap | Builder-SteadyCap | 2026-10-14T11:07:49Z | Wave B perfection/steadycap-v3 · STD-V3-1/2/3/4 |
| CookCap | Builder-CookCap | 2026-10-14T11:10:00Z | Wave A CK-V3-1..5 FIXED → Auditor |
| IdeaCap | Builder-IdeaCap | 2026-10-14T10:53:00Z | Wave A perfection/ideacap-v3 · IDA-V3-1/2 FIXED → Auditor |
| DeePonyCap | — | — | free (Builder pushed perfection/deeponycap-v3 · DPY-V3-1/2 FIXED → Auditor) |
| capricorn-tooling/shared/gallery | Gallery-Engineer | 2026-10-14T10:52:00Z | v3 viewer |
| capricorn-tooling/scripts + shared (exc. gallery) | — (released) | 2026-10-14T11:07:19Z | Tooling-Engineer pushed `perfection/tooling-v3` @ 224b76a |
| capricorn-lab | — | — | released (Hub Wave A expand) |
| shamikhahmed.github.io | — | — | released (Hub Wave A expand) |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
