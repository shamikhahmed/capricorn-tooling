# LedgerCap — Tier 1 App Report

**Released:** 2026-09-15 · `v3.57.0` / SW `ledgercap-v138` on `main`

| ID | Status |
|----|--------|
| LDG-P0-02 Header (P-LDG-1) | ✅ “Your wealth” + ticker + ⋯ → Settings; lang/currency/theme in Settings; no fullscreen |
| LDG-P0-03 Sinks | ✅ `qa/finish-loop/SINKS.md`; esc() on journal/watchlist/import/research; news/announcements already escaped |
| LDG-P1-01 Freshness | ✅ One ticker freshness line with “via LedgerCap server”; one Refresh; pull-to-refresh |
| LDG-P1-02 Totals | ✅ Whole ₨ for totals/signed P&L; tabular-nums; ▲/▼ on signed money |
| LDG-P1-03 Tabs | ✅ Home · Watchlist · Funds · Performance · Research (EN / اردو / Roman) |
| LDG-P1-04 Dialogs | ✅ CapConfirm / CapPrompt / CapAlert; native confirm/prompt removed |
| LDG-P1-05 console.log | ✅ Production console.log cleared from price-clean path |
| LDG-P1-06 Disclaimer | ✅ §4.2 on About, Research, Signals |
| LDG-P1-07 Telegram | ✅ Masked input, Remove token, encrypted vault; never logged |
| LDG-P1-08 Price validation | ✅ Finite/positive/±20% of last close; last-good / fallback kept |

**Verify:** unit + worker ✅ · Playwright smoke+viewport+ledger **24 passed**

**Live:** https://shamikhahmed.github.io/LedgerCap/
