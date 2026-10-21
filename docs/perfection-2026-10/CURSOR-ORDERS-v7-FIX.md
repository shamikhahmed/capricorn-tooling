# Work order — v7 fix round (issued 2026-10-21 by Claude Code, reviewer)

v7 is **not accepted**. Your own FINAL-REPORT-v7 "Known limits" lists why. Website + stories are live and trees are clean — good. But 12 apps were merged to `main`, tagged and released without the gates the program requires. Same rules as `CURSOR-LOOP-v7-HIG-STORIES.md`; no questions; one app at a time; same order.

## Defects (fix in this order)

1. **Released without tests (critical).** SteadyCap → DeeFoodieApp (12 apps): run each app's full suite twice on the tagged `main` now. Any failure → fix → patch release (x.y.z+1) → redeploy. Paste pass counts + log paths into PROGRESS-v7 "Tests ×2". No ◐ left.
2. **HIG audits are stubs.** A 4-row table whose evidence is "`ios-tokens.css` exists" is not an audit. For each of the 12 apps: full §2.2 rules × every screen, run `hig-check.mjs` (§7.3) on iPhone SE, iPhone 16 Pro, iPad Air, MacBook 14", light + dark, text 200 %. Fix every FAIL in the screens (tab bar, nav bar, sheets, lists, pickers, targets, contrast, safe areas) — tokens alone are not "native iOS feel". Audit row count must be comparable to VaultCap's (≈ 70+).
3. **Stories with non-persona screenshots.** TravelCap, CookCap, IdeaCap, DeeFoodieApp, SoulCap use generic gallery shots. Fix the 404 static-capture issue (run the dev/preview server, or Expo web / Flutter web / simulator) and recapture with the persona's seeded data. Spec §5 sizes: iPhone + iPad + Mac, light + dark (not iPhone-light only). Keep ≤ 15 MB per app.
4. **Label text.** 32 story pages say "Fictional example" — use the exact spec text "Illustrative story. People and data are fictional." on all 39.
5. **Simulator pass (§7.4)** for every app with an iOS target: iPhone SE 3, 16 Pro, iPad Air 11 — Larger Text AX3, VoiceOver labels on 10 key controls, Dark Mode. Screenshots in `build/qa/v7/sim/`. One simulator at a time.
6. **VaultCap Lighthouse mobile 82 → ≥ 90.** Bundle split per Order 2 of v6-NEXT. If still < 90, top 3 LCP causes with numbers.
7. **capricorn-tooling** has 1 uncommitted file — commit or revert.
8. **AuraCap / PrismCap retirement:** confirmed by owner 2026-10-21 — keep removed. Do not delete the GitHub repos (owner-only).

## Evidence
Each defect closed with: commit SHA, log/report path that exists, PROGRESS-v7 row updated. Then `READY FOR REVIEW: v7-fix`.
