# Locks — Perfection Loop v3
Format: `repo → agent → since → purpose`

Updated: 2026-10-14T12:28:00Z

| Repo | Agent | Since | Purpose |
|---|---|---|---|
| DeeFoodieApp | — | — | free (Phase I **1.1.0+4** · tag v1.1.0 · DFD-V3-1 FIXED live verified → Auditor · DFD-V3-2 EXTERNAL) |
| SoulCap | — | — | free (Phase I **8.4.0** merge `c214447` / tag `v8.4.0` · tip `fe4e86d` · CI green · live 7/7 · Help unchanged) |
| capricorn-tooling/docs/perfection-2026-10 | Conductor | 2026-10-14T10:50:00Z | PROGRESS/LOCKS ownership |
| capricorn-tooling/docs/audit-2026-09-14/DECISIONS.md | Conductor | 2026-10-14T10:50:00Z | N-1 append |
| TravelCap | — | — | free (MATRIX @eb9cb78 · 93% · TRV-V3-9 OPEN) |
| LedgerCap | — | — | free (Phase I 3.58.0 @a8fc996 / v3.58.0 · live verified) |
| PulseCap | — | — | free (released v6.45.0 @4ce8e2e · live 7/7 → Hub PLS-V3-2 / Gallery PLS-V3-3) |
| PrismCap | — | — | free (MATRIX @09e31b2 · 51% · PRS-V3-4/5/6 OPEN) |
| VaultCap | — | — | free (Phase I 5.3.0 @740b7bd / tag v5.3.0@ea8b773 · live verified) |
| SteadyCap | — | — | free (Phase I 2.6.0 @c6c8f23 / v2.6.0 · live verified) |
| CookCap | — | — | free (MATRIX @8220895 · 54% · CK-V3-5/7 OPEN) |
| IdeaCap | Gallery-Builder | 2026-10-14T12:20:00Z | v3 gallery manifest + capture |
| CarCap | — | — | free (Phase I **1.1.0** @d31c666 · CI fix gallery helpers · tag v1.1.0 · hub f1e07bb · live 7/7) |
| MasteryCap | — | — | free (Phase I 51.10.0 @a2e801b / v51.10.0 · tip 37d7ec5 · live 7/7 · APP-REPORT @f82edce) |
| DeePonyCap | — | — | free (Phase I 3.9.0 · tag v3.9.0 · tip bfca914 · APP-REPORT-v3) |
| capricorn-tooling/shared/gallery | — (released) | 2026-10-14T12:40:00Z | Gallery-Engineer pushed @209ec86 · ScentCap v3 @b3111db |
| capricorn-tooling/scripts + shared (exc. gallery) | — (released) | 2026-10-14T11:07:19Z | Tooling-Engineer pushed `perfection/tooling-v3` @ 224b76a |
| capricorn-lab | — | — | released @da066e3 (perfection/hub-minisites-v3) |
| shamikhahmed.github.io | — | — | released @78b212c |
| AuraCap | — | — | free (5.5.0 released · tag v5.5.0 · APP-REPORT-v3) |
| ScentCap | — | — | free (MATRIX @61dafb2 · 94% · SCN-V3-5 OPEN) |

## Rules
- Take a lock before writing; release after push.
- Stale lock (> 2 h without a commit) → Conductor reassigns.
- Shared files (DECISIONS.md, CAP-STANDARD.md) edited only by Conductor.
- One writer per repo at a time.
