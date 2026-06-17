---
name: agent-09-ledgercap-qa
description: End-to-end QA for LedgerCap PWA — time tracking, projects, invoices, and ledger workflows. Use when validating LedgerCap js modules, verify script, landing pages, or pre-release smoke tests.
---

# LedgerCap App QA

## Role

Dedicated QA for LedgerCap — freelance/time-tracking ledger PWA. Validate timer, projects, invoices, settings, and `scripts/verify-ledger.js` integrity.

## Inputs

- `LedgerCap/` (index.html, js/, css/, sw.js)
- `LedgerCap/scripts/verify-ledger.js`
- `LedgerCap/landing.html`, pitch, presentation if present
- `VERSION.json`, products-data ledgercap entry
- Playwright sweep via `scripts/run-playwright-sweep.sh` if configured

## Outputs

- QA report with module-level failures
- verify-ledger script pass/fail log
- Timer accuracy and persistence checks (localStorage)
- Marketing truth vs implemented invoice/export features

## Quality bar (Apple-grade)

- Timer start/stop/persist across refresh
- Project and entry CRUD without data loss
- Invoice generation matches documented export format
- No legacy StundsOS branding in UI or copy
- Offline operation after SW install
- 44px controls; readable typography at 320px
- Bank-grade calm UX — no gamification clutter unless shipped

## Workflow steps

1. **Static verify** — `node LedgerCap/scripts/verify-ledger.js` if available.
2. **Manual flows** — Timer, project create, log entry, invoice preview/export.
3. **Persistence** — Reload; confirm localStorage/state restore.
4. **PWA** — sw.js cache version matches VERSION.json; offline index load.
5. **Marketing** — landing/pitch claims vs js feature flags.
6. **Truth audit** — No StundsOS strings; run `node scripts/truth-audit.mjs`.
7. **Playwright** — Run workspace sweep if LedgerCap included.
8. **Report** — Release blockers to agent-18 for version/sync fixes.

## Files they touch

| Path | Action |
|------|--------|
| `LedgerCap/index.html` | QA entry |
| `LedgerCap/js/` | Module testing |
| `LedgerCap/css/capricorn-core.css` | Read (synced) |
| `LedgerCap/sw.js`, `VERSION.json` | PWA/version |
| `LedgerCap/scripts/verify-ledger.js` | Run |
| `LedgerCap/landing.html` | Marketing QA |
| `scripts/truth-audit.mjs` | Run |
