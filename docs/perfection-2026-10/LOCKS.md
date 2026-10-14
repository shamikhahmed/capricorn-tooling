# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T11:26:00Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| DeeFoodieApp | Builder-DeeFoodie | 2026-10-14T11:20:00Z | Wave D early · perfection/deefoodie-v3 · DFD-V3-1 P0 → Auditor |
| SoulCap | Builder-SoulCap | 2026-10-14T11:25:00Z | Wave C perfection/soulcap-v3 · SOL-V3-1/3 · gallery v3 |
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | Builder-TravelCap | 2026-10-14T11:22:36Z | Phase I release 1.1.0 |
| LedgerCap | — | — | free (Docs-Editor §11 pushed @5e19190 → Auditor) |
| PulseCap | Builder-PulseCap | 2026-10-14T11:17:02Z | Wave C perfection/pulsecap-v3 · PLS-V3-1 |
| PrismCap | — | — | free (Docs-Editor §11 pushed @29d9266 → Auditor) |
| VaultCap | Builder-VaultCap | 2026-10-14T11:13:33Z | Wave B perfection/vaultcap-v3 · P0/P1 FIXED → Auditor |
| SteadyCap | Builder-SteadyCap | 2026-10-14T11:07:49Z | Wave B perfection/steadycap-v3 · STD-V3-1/2/3/4 |
| CookCap | Builder-CookCap | 2026-10-14T11:10:00Z | Wave A CK-V3-1..5 FIXED → Auditor |
| IdeaCap | Builder-IdeaCap | 2026-10-14T10:53:00Z | Wave A perfection/ideacap-v3 · IDA-V3-1/2 FIXED → Auditor |
| CarCap | Builder-CarCap | 2026-10-14T11:17:00Z | Wave D perfection/carcap-v3 · CAR-V3-1 gallery · CAR-V3-3 hub note |
| MasteryCap | Builder-MasteryCap | 2026-10-14T11:18:57Z | Wave C perfection/masterycap-v3 · MST-V3-1/2/3 |
| DeePonyCap | — | — | free (Docs-Editor §11 pushed @957d868 → Auditor) |
| capricorn-tooling/shared/gallery | Gallery-Engineer | 2026-10-14T10:52:00Z | v3 viewer |
| capricorn-tooling/scripts + shared (exc. gallery) | — (released) | 2026-10-14T11:07:19Z | Tooling-Engineer pushed `perfection/tooling-v3` @ 224b76a |
| capricorn-lab | — | — | released (rsync+Website pushed) |
| shamikhahmed.github.io | — | — | released (merged main 72981b7) |
| AuraCap | Builder-AuraCap | 2026-10-14T11:18:00Z | Wave C perfection/auracap-v3 · AUR-V3-1/2/3 |
| ScentCap | — | — | free (Builder pushed perfection/scentcap-v3 · SCN-V3-1/2 FIXED → Auditor) |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
