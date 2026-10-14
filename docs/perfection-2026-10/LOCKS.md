# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T12:05:00Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| DeeFoodieApp | Builder-DeeFoodie | 2026-10-14T11:20:00Z | Wave D early · perfection/deefoodie-v3 @9ee5656 · DFD-V3-1 FIXED → Auditor |
| SoulCap | Release-Builder | 2026-10-14T11:56:56Z | Phase I G-8 8.4.0 merge/tag/push + live QA | — | free (Builder pushed perfection/soulcap-v3 @8b7cee9 · SOL-V3-1 FIXED → Auditor; SOL-V3-3 Hub) |
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | — | — | free (1.1.1 CI fix) |
| LedgerCap | — | — | free (Phase I 3.58.0 @a8fc996 / v3.58.0 · live verified) |
| PulseCap | Builder-PulseCap | 2026-10-14T11:45:30Z | Phase I release 6.45.0 |
| PrismCap | — | — | free (Phase I 4.6.0 @4b21059 / tag v4.6.0@4014458 · own-Pages live · hub PrismCap/ STALE → Hub) |
| VaultCap | — | — | free (Phase I 5.3.0 @740b7bd / tag v5.3.0@ea8b773 · live verified) |
| SteadyCap | — | — | free (Phase I 2.6.0 @c6c8f23 / v2.6.0 · live verified) |
| CookCap | Builder-CookCap | 2026-10-14T12:00:00Z | 3.6.1 #418 hotfix · G-8 cookcap-v42 · local+live device-qa |
| IdeaCap | — | — | free (Phase I 2.1.0 @4a9560c / v2.1.0 · hub b7b835f) |
| CarCap | — | — | free (Phase I **1.1.0** @b3b2c4e / tag v1.1.0 · hub f1e07bb · **Release-Verifier 7/7** @main) |
| MasteryCap | — | — | free (Phase I 51.10.0 @a2e801b / v51.10.0 · live 7/7 · APP-REPORT @f82edce) | — | free (51.10.0 / v51.10.0 live · Builder released) | 2026-10-14T11:18:57Z | Wave C perfection/masterycap-v3 · MST-V3-1/2/3 |
| DeePonyCap | — | — | free (Phase I 3.9.0 · tag v3.9.0 · tip bfca914 · APP-REPORT-v3) |
| capricorn-tooling/shared/gallery | Gallery-Engineer | 2026-10-14T10:52:00Z | v3 viewer |
| capricorn-tooling/scripts + shared (exc. gallery) | — (released) | 2026-10-14T11:07:19Z | Tooling-Engineer pushed `perfection/tooling-v3` @ 224b76a |
| capricorn-lab | — | — | released (rsync+Website pushed) |
| shamikhahmed.github.io | — | — | **Hub:** remove stale `PrismCap/` after own-Pages 4.6.0 confirmed |
| AuraCap | — | — | free (5.5.0 released · tag v5.5.0 · APP-REPORT-v3) |
| ScentCap | — | — | free (Phase I 2.2.0 @cea2468 / v2.2.0 · live 7/7 · SCN-V3-4 gallery OPEN) |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
