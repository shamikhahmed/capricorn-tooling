# Cap Agents Orchestrator

**Last completed train:** 2026-06-17 — Full deck enhancement: real screenshots in pitch/presentation, Apple copy rewrite, duplicate-ID fixes, design token audit, release pipeline (`scripts/release-marketing.mjs`).

Maps Capricorn workspace tasks to sub-agents and defines execution order for release trains, copy updates, QA sweeps, and screenshot refreshes.

**Workspace root:** sibling folder containing app repos (e.g. `Projects/`)  
**Tooling repo:** `capricorn-tooling/` — scripts, shared design system, agent skills  
**Skills path:** `capricorn-tooling/cap-agents/skills/agent-{NN}-{slug}.md`

---

## Agent Index

| ID | Skill file | Agent | Primary domain |
|----|------------|-------|----------------|
| 01 | `agent-01-pitch-writer.md` | Pitch Deck Copywriter | `pitch.html` |
| 02 | `agent-02-presentation-writer.md` | Presentation Copywriter | `presentation.html` |
| 03 | `agent-03-landing-writer.md` | Landing Page Copywriter | `landing.html` |
| 04 | `agent-04-hub-product-writer.md` | Hub Product Page Writer | `products-data.js`, hub HTML |
| 05 | `agent-05-design-token-auditor.md` | Design Token Auditor | `shared/design-system/` |
| 06 | `agent-06-phone-mockup-qa.md` | Phone Mockup QA | `.phone` frames, screenshot frames |
| 07 | `agent-07-scentcap-qa.md` | ScentCap App QA | ScentCap repo |
| 08 | `agent-08-auracap-qa.md` | AuraCap App QA | AuraCap repo |
| 09 | `agent-09-ledgercap-qa.md` | LedgerCap App QA | LedgerCap repo |
| 10 | `agent-10-vaultcap-qa.md` | VaultCap App QA | VaultCap repo |
| 11 | `agent-11-pulsecap-qa.md` | PulseCap App QA | PulseCap repo |
| 12 | `agent-12-prismcap-qa.md` | PrismCap App QA | PrismCap repo |
| 13 | `agent-13-steadycap-qa.md` | SteadyCap App QA | SteadyCap repo |
| 14 | `agent-14-deeponycap-qa.md` | DeePonyCap App QA | DeePonyCap repo |
| 15 | `agent-15-screenshot-capture-ops.md` | Screenshot Capture Ops | Playwright capture |
| 16 | `agent-16-screenshot-integration.md` | Screenshot Integration | Hub + decks wiring |
| 17 | `agent-17-motion-cinematic-qa.md` | Motion/Cinematic QA | GSAP + capricorn motion |
| 18 | `agent-18-release-integrator.md` | Release Integrator | Sync scripts + push |

---

## Task → Agent Mapping

### Copy & marketing

| Task | Primary agent | Supporting agents |
|------|---------------|-------------------|
| Rewrite investor pitch slides | **01** | 04 (catalog sync), 06 (mockups) |
| Demo / stakeholder presentation | **02** | 01, 16 (screenshots), 17 (motion) |
| App landing page hero/FAQ | **03** | 04, 18 (version badge) |
| Hub product catalog / `{slug}cap.html` | **04** | 03 (per-app landings), 01–02 |
| Fix marketing claim drift | **04** | 18 (`truth-audit.mjs`) |
| SEO title/description pass | **04** | 03 |

### Design system & visual QA

| Task | Primary agent | Supporting agents |
|------|---------------|-------------------|
| Token / color / card drift | **05** | 18 (sync-design-system) |
| Inline phone mockup broken | **06** | 15, 16 |
| GSAP / scroll reveal regressions | **17** | 05, 18 (sync-sw-cinematic) |
| GlassCard vs `.cap-card` mismatch | **05** | 07, 08 |

### Per-app QA

| App | Agent |
|-----|-------|
| ScentCap | **07** |
| AuraCap | **08** |
| LedgerCap | **09** |
| VaultCap | **10** |
| PulseCap | **11** |
| PrismCap | **12** |
| SteadyCap | **13** |
| DeePonyCap | **14** |

### Screenshots & release

| Task | Primary agent | Supporting agents |
|------|---------------|-------------------|
| Regenerate marketing PNGs | **15** | 10 (Vault unlock), 18 (deploy first) |
| Wire PNGs into hub/decks | **16** | 04, 06, 01–02 |
| Full release train | **18** | 05, 07–17 as gates |
| Version bump only | **18** | 03 (landing badges) |

---

## Execution Orders

### A. Full release train (all apps + hub)

Run sequentially; parallelize only where noted.

```
Phase 1 — Truth & design foundation
  05 Design Token Auditor     → fix shared/design-system, no vendored edits
  18 Release Integrator       → node scripts/sync-design-system.mjs

Phase 2 — Copy (parallel OK per app)
  04 Hub Product Page Writer  → products-data.js canonical update
  01 Pitch Copywriter         → per changed app
  02 Presentation Copywriter  → per changed app
  03 Landing Copywriter       → per changed app

Phase 3 — App QA (parallel per repo)
  07 ScentCap QA
  08 AuraCap QA
  09 LedgerCap QA
  10 VaultCap QA
  11 PulseCap QA
  12 PrismCap QA
  13 SteadyCap QA
  14 DeePonyCap QA

Phase 4 — Motion & mockups
  17 Motion/Cinematic QA
  06 Phone Mockup QA

Phase 5 — Integrate & ship
  18 Release Integrator       → sync-versions, sync-sw-cinematic, truth-audit
  [push deploy — user request only]
  15 Screenshot Capture Ops    → after live deploy
  16 Screenshot Integration  → hub SW + decks
  06 Phone Mockup QA           → final visual gate
  18 Release Integrator       → hub commit/push if needed
```

### B. Copy-only update (single app)

```
04 Hub Product Page Writer (if catalog fields change)
  → 03 Landing Copywriter
  → 01 Pitch Copywriter
  → 02 Presentation Copywriter
  → 18 truth-audit.mjs (gate)
  → 06 Phone Mockup QA (if mockups on page)
```

### C. UI change → screenshots refresh

```
{App QA agent 07–14}          → sign off UI
  → 18 sync + push (deploy)
  → 15 Screenshot Capture Ops
  → 16 Screenshot Integration
  → 06 Phone Mockup QA
  → 04 Hub Product Page Writer (screenshotAlts if UI changed materially)
```

### D. Design system change

```
05 Design Token Auditor       → patch shared/design-system/
  → 18 sync-design-system.mjs
  → 17 Motion/Cinematic QA
  → 07–14 spot QA (apps with visual regressions)
  → 18 release integrator
```

### E. Hotfix (single app, no marketing)

```
{App QA agent}                → repro + verify fix
  → 18 sync-versions + truth-audit
  → push on user request
```

---

## Gates (block release)

| Gate | Owner | Command / check |
|------|-------|-----------------|
| Marketing truth | 18 | `node scripts/truth-audit.mjs` — zero Critical |
| Design system synced | 18 | `capricorn-core.css` banner present, not hand-edited |
| SW cinematic stack | 17, 18 | `node scripts/sync-sw-cinematic.mjs` |
| Version consistency | 18 | `node scripts/sync-versions.mjs` |
| VaultCap security UX | 10 | Locked-by-default; no leak when locked |
| Reduced motion | 17 | `prefers-reduced-motion` disables reveals |

---

## Parallelization rules

- **Safe in parallel:** App QA agents 07–14 on different repos; copy writers 01–03 on different apps after 04 updates catalog.
- **Must be sequential:** 05 before 18 design sync; 18 deploy before 15 capture; 15 before 16 integration; 16 before final 06 pass.
- **Single writer of truth:** `shamikhahmed.github.io/js/products-data.js` owned by agent **04** — downstream agents read, propose diffs, do not fork catalog truth.

---

## Invoking agents

In Cursor, attach the skill file or reference by name:

```
Read cap-agents/skills/agent-10-vaultcap-qa.md and run VaultCap pre-release QA.
```

For orchestrated runs, start here and dispatch phases in order.
