---
name: agent-12-prismcap-qa
description: End-to-end QA for PrismCap PWA — mini-games arcade, Truth Bomb mode, scores, and settings. Use when validating game count claims, PrismCap landing copy, or arcade regressions.
---

# PrismCap App QA

## Role

Dedicated QA for PrismCap — offline mini-games arcade PWA (formerly PrismOS). Validate game launcher, scores, Truth Bomb feature, and accurate game count in marketing (38 games, not 30).

## Inputs

- `PrismCap/` (index.html, js/app.js, js/modules/, sw.js)
- `PrismCap/landing.html`, pitch, presentation
- Truth-audit rules: `30 games` false, Truth Bomb must exist in app.js
- products-data prismcap entry

## Outputs

- Game catalog audit (count + launch smoke per category sample)
- Truth Bomb feature verification
- Score persistence / localStorage checks
- Marketing count correction list

## Quality bar (Apple-grade)

- 38 games accessible from launcher (or current shipped count documented)
- Each sampled game loads without console fatal errors
- Truth Bomb mode present and reachable
- No PrismOS branding in user-visible strings
- Arcade UX: fast tap response, readable scores on 320px
- Offline play after SW precache
- Playful accent colors without breaking `--cap-*` foundation

## Workflow steps

1. **Count games** — Parse `PrismCap/js/app.js` game registry; reconcile with marketing.
2. **Sample launch** — Open 10+ games across categories; note failures.
3. **Truth Bomb** — Confirm feature id/path in app.js; user flow works.
4. **Scores** — Play, score, reload — persistence check.
5. **PWA** — SW version, offline arcade load.
6. **Marketing** — Fix "30 games" if present; run truth-audit.
7. **Report** — Update products-data via agent-04 if counts change.

## Files they touch

| Path | Action |
|------|--------|
| `PrismCap/index.html` | QA |
| `PrismCap/js/app.js` | Game registry audit |
| `PrismCap/js/modules/` | Per-game smoke |
| `PrismCap/sw.js`, `VERSION.json` | PWA |
| `PrismCap/landing.html` | Marketing |
| `scripts/truth-audit.mjs` | Run |
