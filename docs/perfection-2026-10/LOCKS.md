# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T12:04:56Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| DeeFoodieApp | — | — | free (Phase I **1.1.0+4** · tag v1.1.0 · DFD-V3-1 FIXED live verified → Auditor · DFD-V3-2 EXTERNAL) |
| SoulCap | — | — | free (8.4.0 @d05c3f9 · CI green · live 7/7 · gallery helpers vendored) |
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | — | — | free (1.1.1 CI fix) |
| LedgerCap | — | — | free (Phase I 3.58.0 @a8fc996 / v3.58.0 · live verified) |
| PulseCap | — | — | free (released v6.45.0 @4ce8e2e · live 7/7 → Hub PLS-V3-2 / Gallery PLS-V3-3) |
| PrismCap | — | — | free (Phase I 4.6.0 @4b21059 / tag v4.6.0@4014458 · own-Pages live · hub PrismCap/ STALE → Hub) |
| VaultCap | — | — | free (Phase I 5.3.0 @740b7bd / tag v5.3.0@ea8b773 · live verified) |
| SteadyCap | — | — | free (Phase I 2.6.0 @c6c8f23 / v2.6.0 · live verified) |
| CookCap | — | — | free (3.6.1 @e435bba / v3.6.1 · live 7/7 · CK-V3-1 FIXED → Auditor) |
| IdeaCap | — | — | free (Phase I 2.1.0 @4a9560c / v2.1.0 · hub b7b835f) |
| CarCap | — | — | free (Phase I **1.1.0** @b3b2c4e / tag v1.1.0 · hub f1e07bb · **Release-Verifier 7/7** @main) |
| MasteryCap | — | — | free (Phase I 51.10.0 @a2e801b / v51.10.0 · tip 37d7ec5 · live 7/7 · APP-REPORT @f82edce) |
| DeePonyCap | — | — | free (Phase I 3.9.0 · tag v3.9.0 · tip bfca914 · APP-REPORT-v3) |
| capricorn-tooling/shared/gallery | — (released) | 2026-10-14T12:40:00Z | Gallery-Engineer pushed @209ec86 · ScentCap v3 @b3111db |
| capricorn-tooling/scripts + shared (exc. gallery) | — (released) | 2026-10-14T11:07:19Z | Tooling-Engineer pushed `perfection/tooling-v3` @ 224b76a |
| capricorn-lab | — | — | released @da066e3 (perfection/hub-minisites-v3) |
| shamikhahmed.github.io | — | — | released @78b212c |
| AuraCap | — | — | free (5.5.0 released · tag v5.5.0 · APP-REPORT-v3) |
| ScentCap | — | — | free (Phase I 2.2.0 @cea2468 / v2.2.0 · live 7/7 · SCN-V3-4 gallery OPEN) |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
