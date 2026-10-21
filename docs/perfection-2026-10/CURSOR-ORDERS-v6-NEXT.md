# Work order — v6, round 2 (issued 2026-10-20 by Claude Code, reviewer)

Read `CURSOR-LOOP-v6-APPSTORE.md`, `CURSOR-LOOP-v6-EXPERIENCE-LAB.md` and `PROGRESS-v6.md` first. Same rules. Execute these orders **in order**. Do not start an order until the previous one is closed with evidence.

## Review of round 1 (what I checked)
- VaultCap v6: accepted except J/K. Spot-checked: qa/v6 files exist, pptx + webm exist, build/qa ignored, smoke 8/8. Good work.
- Not acceptable: **uncommitted, half-finished work left in 4 repos** (DeePonyCap 8 files, MasteryCap 8, IdeaCap 11, shamikhahmed.github.io 308 = a TravelCap deploy staged but never committed). Version files are modified in all of them — a version bump with no release is exactly the "docs truth" failure G18 forbids.
- Fleet work on 2026-10-19 landed directly on `main` (v5 tail). From now on **v6 work goes only on `perfection/v6-appstore`**.

## Order 1 — Close the open working trees (today, before anything else)
For each of DeePonyCap, MasteryCap, IdeaCap, shamikhahmed.github.io:
1. `git diff` and decide: finish → verify → commit, or revert with a one-line reason in PROGRESS-v6. No third option.
2. Website: the TravelCap `_next/` + route folders must match the TravelCap commit `16021de` (1.1.9) build; rebuild from TravelCap, run `npm test` (link check), commit as `deploy(TravelCap): 1.1.9`. Never hand-edit hub `index.html`.
3. VERSION.json = package.json = SW cache = CHANGELOG top entry for each repo, or the bump is reverted.
**Evidence:** `git status --porcelain` empty in all four; versions table pasted into PROGRESS-v6.

## Order 2 — VaultCap: finish J and K
1. **Lighthouse mobile ≥ 90 honestly.** Bundle is 887 KB (908,642 bytes on disk). Split it: boot shell + lock/onboarding in the first chunk; modules (tax, zakat, smart-db, family, documents, import) lazy-loaded through the existing `VaultLazy` loader; keep `script-src 'self'`. Target first-load JS < 250 KB. Re-run `lighthouse-honest.mjs` 3× and report the median. If < 90 after the split, list the top 3 remaining LCP causes with numbers.
2. WebKit 38-viewport matrix re-run on the final build: 0 FAIL, list every remaining WARN with a decision (fix / accept with reason).
3. Lighthouse a11y 96 → 100 (the contrast item it flags).
4. Phase K: PROGRESS row all ✅, Brain note dated line, owner list.
**Evidence:** LH JSON paths, matrix REPORT path, commit SHAs.

## Order 3 — SteadyCap (app #2) full v6 A→K
Follow the program brief exactly. Extra acceptance bar (health app):
- SOS/emergency flow: simulator video on iPhone SE, 16 Pro, iPad Air 11 — light + dark + accessibility-extra-large.
- `npx cap add ios`, then Prompt 1A in full; privacy cover + LaunchMark + Info.plist checked in the BUILT app.
- No medical claims; disclaimer visible; crisis numbers verified per region with source links in `qa/v6/APP-STORE.md`.
- Presentations + demo video like VaultCap (Experience Lab).
**Evidence:** APP-REPORT-v6.md with every gate ✅ or owner-only.

## Order 4 onward — continue the fleet in program order
PulseCap → SoulCap → DeePonyCap → LedgerCap → PrismCap → ScentCap → AuraCap → CarCap → MasteryCap → TravelCap → CookCap → IdeaCap → DeeFoodieApp → website → wave Z.
After **each** app: update PROGRESS-v6, then stop and write `READY FOR REVIEW: <App>` as the last line of your message. The owner forwards that to Claude Code for §12 verification. Claude Code will return any defects as a numbered list; fix them before the next app.

## Definition of "perfect" I will verify against (no exceptions)
- 0 failing tests, run twice; 0 skipped tests added by you.
- 0 FAIL cells in the device matrix (phones, iPads, 8 MacBook sizes, light + dark, text 1 / 1.3 / 1.6).
- Lighthouse ≥ 90 mobile and desktop on 3 routes, measured honestly; axe 0 serious/critical.
- Every claim in privacy policy traced to code; network ⊆ policy ⊆ CSP.
- Clean working tree, version truth, docs updated, evidence paths that exist.
- Anything you cannot reach: say so plainly. Never mark ✅ without evidence — I check.
