# Capricorn Perfection Loop v5 — Final Report

**Program:** `CURSOR-LOOP-v5.md`  
**Completed (conductor close):** 2026-10-19  
**Binding:** `docs/audit-2026-09-14/DECISIONS.md` + v5 brand/perf decisions below  
**Evidence dir:** `capricorn-tooling/docs/perfection-2026-10/live-v5/`

---

## § Do-now completion

| # | Item | Status | Evidence |
|---|---|---|---|
| V5-1 | VaultCap midnight/gold | ✅ | VaultCap `5.3.1`; hub catalog gold; live LH mobile **94** |
| V5-2 | PulseCap Ember everywhere | ✅ | App+hub Ember `#ff7a1a`; decks remapped earlier in loop |
| V5-3 | Sitemap prune | ✅ | Hub/lab sitemap 51→36; redirects/noindex out |
| V5-4 | Cascade restore (Prism/Steady) | ✅ | Specificity restores; live Prism mobile **96** / Steady **91** |
| V5-5 | Ledger plain-language status | ✅ code | Copy shipped; **Worker live deploy = owner** (`wrangler login`) |
| §2 | A11y fleet | ⚠️ partial | Pulse/Vault/Prism/Steady/Aura/Soul/Scent a11y **100**; **Car 96, Cook 96, Idea 89, Mastery 94** still fail honest LH (contrast / ARIA) |
| §3 | Perf ≥90 honest | ⚠️ partial | PulseCap **90–93** CLS **0** after `6.46.9`; most Caps ≥90; **Travel 89, Mastery 85** still under |
| §4 | Ledger Worker | ⛔ owner | Repo ready; live `/news`/`timeseries` still broken until Cloudflare login |
| §5 | Viewport contracts | ✅ | 9 Caps + Ledger dual-workflow; Cook/Mastery/Prism/Idea N/A |
| §6 | Cook dark plate gallery | ✅ | Hub ingest earlier (`2dc29d4` line) |
| §7 | Live re-verify + this report | ✅ | LH file + device-qa + CI SHAs below |

---

## Commits (this resume + tip SHAs)

| Repo | SHA | Summary |
|---|---|---|
| PulseCap | `af197e6` | **6.46.9** — inline fixed splash (async identity.css CLS root); intro/`svh` |
| PulseCap | `716780f` | **6.46.8** — APP_VERSION sync; MODULE_CHAIN skip eager `script[src]` |
| LedgerCap | `9849e68` | **3.58.9** — Analytics+Insights on cold path (CI green) |
| capricorn-lab | `d1d5110` | Catalog Pulse **6.46.9** / Ledger **3.58.9** |
| shamikhahmed.github.io | `18013d9` | OS bundle sync + catalog; Hub CI **success** |
| shamikhahmed.github.io | `97441dd` | Mini-sites Pulse 6.46.9 (earlier deploy) |

---

## Live Lighthouse (`scripts/lighthouse-honest.mjs`, 2026-10-19)

Source: `live-v5/lh-apps.txt` + Pulse triple remesure.

| App | Mobile perf | Desktop perf | Notes |
|---|---|---|---|
| VaultCap | **94** | **98** | a11y/bp/seo 100 |
| PulseCap | **90–93** | **91–94** | CLS **0**; triple remesure after `6.46.9` |
| PrismCap | **96** | **100** | |
| SteadyCap | **91** | **97** | |
| LedgerCap | **99** | **97** | bp **89–93** (console / Worker — owner) |
| DeePonyCap | **97** | **100** | |
| ScentCap | **99** | **100** | |
| SoulCap | **92** | **99** | |
| TravelCap | **89** | **98** | LCP ~3.1s — under gate |
| AuraCap | **100** | **100** | |
| MasteryCap | **85** | **99** | LCP + `.onb-eyebrow` contrast |
| IdeaCap | **97** | **100** | a11y **89** (ARIA + contrast + meta) |
| CarCap | **98** | **100** | a11y **96** (primary btn contrast) |
| CookCap | **99** | **97** | SEO **63** expected (`noindex`); a11y **96** copper text |

Pulse CLS root cause (verified): `.clipboard-splash` lived in **async** `identity.css`, so first visit splash was **in-flow** until the sheet loaded → CLS ~0.128. Fix: inline `position:fixed` in `index.html` (`6.46.9`).

---

## device-qa (targeted)

```
node scripts/device-qa.mjs …/live-v5/device-qa --apps=PulseCap,VaultCap,LedgerCap
→ 21/21 hard=0 pageErr=0; Ledger hub-console warns ×7 (Worker)
```

---

## CI on `main` (touched tips)

| Repo | Latest workflow | Result |
|---|---|---|
| PulseCap | `39229846121` (`af197e6`) | ✅ verify + Pages |
| LedgerCap | `39233819939` (`9849e68`) | ✅ verify + Deploy Pages |
| shamikhahmed.github.io | `39234291333` / `18013d9` | ✅ Hub CI |
| VaultCap / Steady / Travel / Aura / Mastery / Soul / Scent / Car / Cook | tip green (2026-10-16+) | ✅ |
| PrismCap | tip CI **failure** (`38909832390`) — game.setup / timeouts after idle packs | ⚠️ still red |
| DeePonyCap | tip CI **failure** (`38909251503`) after idle-load | ⚠️ still red |
| IdeaCap | tip CI green after expo-doctor align | ✅ |

---

## Not done / why

| Item | Why |
|---|---|
| Ledger Worker deploy | Owner: `npx wrangler login` then deploy; live news/EOD still fail → LH bp + device-qa console warns |
| PrismCap / DeePonyCap CI green | Perf idle-load broke verify (game.setup / timeouts); Pages still deploy; needs follow-up release |
| IdeaCap / CarCap / CookCap / MasteryCap a11y 100 | Honest LH still flags contrast/ARIA/meta; prior §2 patches incomplete or not on Live first screen |
| TravelCap / MasteryCap mobile perf ≥90 | LCP still high on honest first visit |
| Full fleet device-qa 98/98 + hub qa-matrix/flows | Targeted 21/21 done this close; full matrix not re-run in this resume |
| Xcode / TestFlight / physical VoiceOver | Owner-only (unchanged) |
| PulseCap git tag `v6.46.9` | Optional; Pages ships from `main` |

---

## Totals

| Metric | Count |
|---|---|
| V5 brand/sitemap/cascade items | 5/5 shipped |
| PulseCap honest mobile ≥90 | ✅ (CLS 0) |
| LedgerCap CI restored | ✅ `3.58.9` |
| Owner blockers | Worker + Xcode + VoiceOver |
| Remaining eng debt (CI/a11y/perf) | Prism, DeePony, Idea, Car, Cook, Mastery, Travel |

---

*End of FINAL-REPORT-v5.md*
