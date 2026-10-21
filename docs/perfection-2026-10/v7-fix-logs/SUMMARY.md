# Tests ×2 — v7-fix

| App | Run1 | Run2 | Log | Version |
|---|---|---|---|---|
| SteadyCap | 12 passed / 8 skipped | 12 passed / 8 skipped | `steadycap-verify.log` | 2.6.6 |
| PulseCap | pending re-verify after 6.46.11 | | `pulsecap-verify.log` | 6.46.11 |
| SoulCap | run1 211 passed (3.9h); run2 aborted | pending | `soulcap-verify.log*` | 8.4.1 |
| DeePonyCap | 40 passed | 40 passed | `deeponycap-final-a.log`, `deeponycap-final-c.log` | 3.9.13 |
| LedgerCap | OK | OK | `ledgercap-verify.log` | 3.58.10 |
| ScentCap | 22 passed / 13 skipped | 22 passed / 13 skipped | `scentcap-verify-rerun.log` | 2.2.2 |
| CarCap | 14 passed | 14 passed | `carcap-verify-rerun2.log` | 1.1.4 |
| MasteryCap | All 8 audits PASS + smoke | same | `masterycap-verify-rerun.log` | 51.10.12 |
| TravelCap | pending | | | |
| CookCap | pending | | | |
| IdeaCap | pending | | | |
| DeeFoodieApp | pending | | | |

## Defect status (2026-10-21 night)

1. Tests ×2 — in progress (Steady/DeePony/Ledger/Scent/Car/Mastery green; Pulse/Soul/Travel/Cook/Idea/DeeFoodie remain)
2. HIG audits — expanded ~70 rows/app (stubs replaced)
3. Persona stories — recapture script ready; subagent connection failed; pending
4. Disclaimer — ✅ exact Illustrative story text on all 39 (hub 9756628)
5. Simulator — pending
6. VaultCap LH — honest median ~79–82; ≥90 not met; LH-MOBILE.md documented
7. Tooling dirty — ✅ committed
8. Aura/Prism — stay removed ✅
