# Tests ×2 — v7-fix

| App | Run1 | Run2 | Log | Version |
|---|---|---|---|---|
| SteadyCap | 12 passed / 8 skipped | 12 passed / 8 skipped | `steadycap-verify.log` | 2.6.6 |
| PulseCap | 495 passed / 3 skipped | 495 passed / 3 skipped | `pulsecap-verify-final-{1,2}.log` EXIT 0 · `1aee2f9` / tag `v6.46.12` | 6.46.12 |
| SoulCap | 372 passed | 372 passed | `soulcap-verify-final-{a,b}.log` EXIT 0 (`179b38e`) | 8.4.1 |
| DeePonyCap | 40 passed | 40 passed | `deeponycap-final-a.log`, `deeponycap-final-c.log` | 3.9.13 |
| LedgerCap | OK | OK | `ledgercap-verify.log` | 3.58.10 |
| ScentCap | 22 passed / 13 skipped | 22 passed / 13 skipped | `scentcap-verify-rerun.log` | 2.2.2 |
| CarCap | 14 passed | 14 passed | `carcap-verify-rerun2.log` | 1.1.4 |
| MasteryCap | All 8 audits PASS + smoke | same | `masterycap-verify-rerun.log` | 51.10.12 |
| TravelCap | 29 passed | 29 passed | `travelcap-verify-final-{1,2}.log` EXIT 0 | 1.1.11 |
| CookCap | 1 passed (verify) | 1 passed | `cookcap-verify-final-{a,b}.log` EXIT 0 | 3.7.4 |
| IdeaCap | 9 jest + expo-doctor OK | same | `ideacap-verify-final-a.log`, `ideacap-verify-final-b.log` | 2.1.5 |
| DeeFoodieApp | API 5 + Flutter 23 | same | `deefoodieapp-verify-final-a.log`, `deefoodieapp-verify-final-b.log` | 1.1.2 |

## Defect status (2026-10-21 night)

1. Tests ×2 — ✅ all remaining apps green (SoulCap 372×2, Travel 29×2, Pulse 495×2, Cook, Idea, DeeFoodie, Steady, DeePony, Ledger, Scent, Car, Mastery)
2. HIG audits — ✅ **12/12 apps hig-check 8/8**
3. Persona stories — ✅ Idea/DeeFoodie/Soul recaptured; hub `9192997`
4. Disclaimer — ✅ exact Illustrative story text on all 39 + stories index polish
5. Simulator — SIM-PASS.md fleet + ScentCap SE shots ✅; full 3-device×AX ◐ (documented)
6. VaultCap LH — **5.4.2** honest median **70** (best 77); ≥90 not met; documented in LH-MOBILE.md (owner-known)
7. Tooling dirty — ✅ committed
8. Aura/Prism — stay removed ✅

**READY FOR REVIEW: v7-fix** — open known limit: VaultCap LH mobile ≥90 (honest 70).
