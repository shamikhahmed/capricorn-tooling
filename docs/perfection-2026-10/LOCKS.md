# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T11:29:29Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| DeeFoodieApp | Builder-DeeFoodie | 2026-10-14T11:20:00Z | Wave D early · perfection/deefoodie-v3 @9ee5656 · DFD-V3-1 FIXED → Auditor |
| SoulCap | — | — | free (Builder pushed perfection/soulcap-v3 @8b7cee9 · SOL-V3-1 FIXED → Auditor; SOL-V3-3 Hub) |
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | — | — | free (1.1.0 released) |
| LedgerCap | — | — | free (Docs-Editor §11 pushed @5e19190 → Auditor) |
| PulseCap | — | — | free (Builder pushed perfection/pulsecap-v3 · PLS-V3-1 FIXED @a5c4b8f → Auditor) |
| PrismCap | — | — | free (Docs-Editor §11 pushed @29d9266 → Auditor) |
| VaultCap | Builder-VaultCap | 2026-10-14T11:13:33Z | Wave B perfection/vaultcap-v3 · P0/P1 FIXED → Auditor |
| SteadyCap | — | — | free (Builder pushed perfection/steadycap-v3 tip `645d6c7` · STD-V3-1..4 FIXED → Auditor) |
| CookCap | Builder-CookCap | 2026-10-14T11:10:00Z | Wave A CK-V3-1..5 FIXED → Auditor |
| IdeaCap | — | — | free (Phase I 2.1.0 @4a9560c / v2.1.0 · hub b7b835f) |
| CarCap | Builder-CarCap | 2026-10-14T11:17:00Z | Wave D perfection/carcap-v3 · CAR-V3-1 gallery · CAR-V3-3 hub note |
| MasteryCap | Builder-MasteryCap | 2026-10-14T11:18:57Z | Wave C perfection/masterycap-v3 · MST-V3-1/2/3 |
| DeePonyCap | — | — | free (Docs-Editor §11 pushed @957d868 → Auditor) |
| capricorn-tooling/shared/gallery | Gallery-Engineer | 2026-10-14T10:52:00Z | v3 viewer |
| capricorn-tooling/scripts + shared (exc. gallery) | — (released) | 2026-10-14T11:07:19Z | Tooling-Engineer pushed `perfection/tooling-v3` @ 224b76a |
| capricorn-lab | — | — | released (rsync+Website pushed) |
| shamikhahmed.github.io | — | — | released (IdeaCap 2.1.0 @b7b835f) |
| AuraCap | — | — | free (Builder pushed perfection/auracap-v3 · AUR-V3-1/2/3 FIXED → Auditor) |
| ScentCap | — | — | free (Builder pushed perfection/scentcap-v3 · SCN-V3-1/2/3 FIXED @62244bd → Auditor) |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
