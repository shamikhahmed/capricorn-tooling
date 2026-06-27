# Capricorn Best Practices Registry

*Version 1.7 · June 2026 · In-scope apps: VaultCap, PulseCap, ScentCap, SteadyCap, LedgerCap, DeePonyCap*

Central reference for patterns discovered across the portfolio. Update after each approved implementation cycle.

**Related audits:** [workspace-audit/FULL_PORTFOLIO_AUDIT_2026-06-26.md](../../workspace-audit/FULL_PORTFOLIO_AUDIT_2026-06-26.md)

---

## 1. Demo mode contract

| Rule | Implementation |
|------|----------------|
| URL entry | `?demo=1` on first visit |
| Session flag | `sessionStorage cap_demo_mode=1` via `CapDemo.markActive()` |
| Storage isolation | Separate keys/profiles — never overwrite user data (see SteadyCap `useDemoStorage`) |
| Onboarding | Skip or auto-complete onboarding in demo |
| Banner | Visible `.cap-demo-banner` until dismissed per app |
| Live APIs | Pause or clearly label degraded live feeds in demo (LedgerCap PSX) |

**Special cases:**

| App | Notes |
|-----|-------|
| VaultCap | Lock PIN **123456** (6 digits); show in banner |
| LedgerCap | Seed NAVs; skip auto price refresh |
| ScentCap | Offline bundled wardrobe — no Fraganty API required |
| PulseCap | `S.createDemo(true)` + Alex Khan profile |

**Source files:**

- `shared/design-system/cap-demo-mode.js` (vendored to `js/cap-demo-mode.js`)
- `shared/design-system/demo-contract.css` (in `capricorn-core.css`)
- SteadyCap: `js/modules/state.js` (`useDemoStorage`)
- ScentCap: `src/services/demo.ts`, `src/data/demoFragrances.ts`

---

## 2. Onboarding patterns

| Pattern | Best source | Rule |
|---------|-------------|------|
| Skip button | LedgerCap `js/modules/onboarding.js` | Top-right Skip on step 1 |
| Route guard | ScentCap `src/App.tsx` `Guard` | Redirect incomplete onboarding |
| Demo bypass | PulseCap `bootDemoIfRequested` | `?demo=1` skips setup |
| Max steps | LedgerCap | ≤3 steps for utility apps |

---

## 3. Design tokens & appearance

- **Vanilla apps:** `--cap-*` from `capricorn-core.css` + two-line accent override in `index.html`
- **ScentCap:** Tailwind `@theme` bridged to `--cap-*` in `src/index.css`
- **Never** edit vendored `css/capricorn-core.css` in app repos — run `node capricorn-tooling/scripts/sync-design-system.mjs`

### Theme policy (in-scope apps except DeePonyCap)

| Rule | Detail |
|------|--------|
| Allowed modes | **Dark** and **Light** only — no accent/color theme pickers |
| System follow | VaultCap may offer **System** (`auto`) that tracks `prefers-color-scheme` |
| Migration | Legacy color theme IDs map to `dark` on load (`normalizeVaultTheme`, `normalizePulseTheme`) |
| Excluded | **DeePonyCap** keeps its own palette/theming |

| Token | Purpose |
|-------|---------|
| `--cap-accent` | Brand accent |
| `--cap-touch-target` | 44px minimum |
| `--cap-ease` / `--cap-dur-*` | Motion timing |

---

## 4. Accessibility checklist

- [ ] `:focus-visible` rings (capricorn-core `a11y.css`)
- [ ] No `user-scalable=no`
- [ ] `prefers-reduced-motion` respected
- [ ] Interactive controls are `<button>` or `role="button"` + keyboard path
- [ ] `aria-label` on icon-only controls
- [ ] `role="switch"` + `aria-checked` on toggles (medicine rows, settings)
- [ ] Landmarks: `nav`, `main`, `role="status"` on toasts/banners
- [ ] Article overlays above nav (`z-index: 200+`) — SteadyCap `reader-overlay`

---

## 5. Forms & validation

**VaultCap pattern:** `js/core/validators.js` — entity validators + `Validators.run(entity, type)`

**Shared subset:** `shared/validation/cap-validators.js` → vendored as `js/cap-validators.js`

```js
CapValidators.run([
  CapValidators.required(name, 'Name'),
  CapValidators.positiveNumber(amount, 'Amount'),
], (msg) => showToast(msg, 'error'));
```

**ScentCap / TravelCap-style:** Zod + react-hook-form for multi-field React flows (future).

---

## 6. Error handling

| Layer | Pattern | Source |
|-------|---------|--------|
| React root | Error boundary + reload | ScentCap `src/components/ErrorBoundary.tsx` |
| Vanilla router | try/catch → inline error screen | PulseCap `go()` in `js/app.js` |
| Toasts | `CapDemo.toast()` or `.cap-toast-inline` | `cap-demo-mode.js` |
| Live data | Graceful fallback + user message | LedgerCap `prices.js` → seed NAVs |

---

## 7. Navigation

- **Vanilla:** `Navigation.go()` / `Nav.go()` + bottom tab bar with `.cap-tab-bar`
- **Desktop (≥900px):** `#cap-nav-sidebar` + `cap-desktop-nav.js`; hide bottom nav via `body.cap-desktop-nav`
- **ScentCap:** Floating tab pill + desktop sidebar in `AppShell.tsx`
- **LedgerCap / VaultCap:** Native sidebar layouts — no phone-column lock on wide viewports
- **LedgerCap:** Prefer single primary nav on mobile; avoid duplicate sidebar + tabs for same destinations

---

## 8. Testing

| App | Command | Notes |
|-----|---------|-------|
| VaultCap–DeePonyCap | `npx playwright test` | Smoke + `tests/viewport.spec.js` (375px / 1280px) |
| ScentCap | `npx playwright test` | `e2e/helpers.ts` mocks APIs; includes `e2e/viewport.spec.ts` |
| LedgerCap | `node scripts/verify-ledger.js` | Financial reconciliation |
| Workspace | `node capricorn-tooling/scripts/workspace-audit.mjs` | 6 in-scope apps |
| Truth | `node capricorn-tooling/scripts/truth-audit.mjs` | Marketing ↔ code |

---

## 9. Security

- CSP meta on vanilla shells (tune `connect-src` per external API)
- No secrets in client; LLM via worker proxy only (VaultCap)
- Label rules-based features **Smart Coach / Smart Assistant** — not "AI" unless LLM integrated
- PulseCap dashboard: **Smart Coach** (not "Ask AI")

---

## 10. Performance

- `data-cap-app="1"` on `<body>` — disables heavy GSAP/scene on shells
- ScentCap: route-level `React.lazy` for Analytics/recharts
- Service worker: versioned cache names synced via `sync-versions.mjs`
- Demo load: offline-first seed data (ScentCap `demoFragrances.ts`)

---

## 11. Version & truth

- Single source: each app `VERSION.json`
- Sync: `node capricorn-tooling/scripts/sync-versions.mjs`
- Audit: `node capricorn-tooling/scripts/truth-audit.mjs` (in-scope apps only)
- Drift check: `node capricorn-tooling/scripts/workspace-audit.mjs` compares `VERSION.json` ↔ `sw.js` CACHE (and ScentCap `package.json` / vite PWA `cacheId`)

---

## 12. Cross-reference index

| Pattern | Leader app | File |
|---------|------------|------|
| Demo storage isolation | SteadyCap | `SteadyCap/js/modules/state.js` |
| Demo offline wardrobe | ScentCap | `ScentCap/src/data/demoFragrances.ts` |
| Demo banner JS | Shared | `capricorn-tooling/shared/design-system/cap-demo-mode.js` |
| Entity validation | VaultCap | `VaultCap/js/core/validators.js` |
| Shared validation | Shared | `capricorn-tooling/shared/validation/cap-validators.js` |
| Router error surface | PulseCap | `PulseCap/js/app.js` |
| Lazy module loading | VaultCap | `VaultCap/js/core/lazy-loader.js` |
| Crypto + schema migration | VaultCap | `VaultCap/js/core/{crypto,migrate}.js` |
| Skip link | Shared | `a.cap-skip-link` in `a11y.css` — first child of `<body>` |
| Theme engine (light/dark) | VaultCap | `VaultCap/js/core/theme.js` |
| Router / lock / profiles | VaultCap | `VaultCap/js/core/{router,pin,vault-profiles,demo-boot}.js` |
| State + persistence | VaultCap | `VaultCap/js/core/store-engine.js` |
| Smart autocomplete DB | VaultCap | `VaultCap/js/core/smart-db.js` |
| First-run onboarding | VaultCap | `VaultCap/js/core/onboarding-flow.js` |
| Legacy empty state bridge | Shared | `.empty-ios` maps to `.cap-empty` in `demo-contract.css` |
| Empty state primitive | Shared | `capricorn-tooling/shared/design-system/demo-contract.css` (`.cap-empty`) |
| Offline in-app banner | ScentCap | `ScentCap/src/components/layout/OfflineBanner.tsx` |
| Recovery-day dashboard UX | PulseCap | `PulseCap/js/modules/dashboard.js` |
| Error boundary | ScentCap | `ScentCap/src/components/ErrorBoundary.tsx` |
| Onboarding skip | LedgerCap | `LedgerCap/js/modules/onboarding.js` |
| Onboarding guard | ScentCap | `ScentCap/src/App.tsx` |
| Financial verify | LedgerCap | `LedgerCap/scripts/verify-ledger.js` |
| E2E API mocks | ScentCap | `ScentCap/e2e/helpers.ts` |
| Design system sync | Tooling | `capricorn-tooling/scripts/sync-design-system.mjs` |
| Desktop shell (≥900px) | Shared | `cap-desktop-shell.css` + `cap-desktop-nav.js` — sidebar + full-width main |
| Desktop sidebar nav | PulseCap / SteadyCap / DeePonyCap | `#cap-nav-sidebar` + `.cap-side-btn`; bottom nav hidden via `body.cap-desktop-nav` |
| Workspace health | Tooling | `capricorn-tooling/scripts/workspace-audit.mjs` |
| Viewport contract tests | Tooling | `capricorn-tooling/shared/testing/viewport-helpers.js` |
| Trigger intelligence | SteadyCap | `SteadyCap/js/engines/triggerEngine.js` |
| Body map | PulseCap | `PulseCap/js/modules/bodymap.js` |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-06-27 | 1.7 | Viewport Playwright contract (375px + 1280px) all 6 apps; DeePonyCap ultra-wide grid (≥1600px); shared `viewport-helpers.js` |
| 2026-06-27 | 1.6 | Desktop-adaptive pass: shared `cap-desktop-shell.css` + `cap-desktop-nav.js`; PulseCap/SteadyCap/DeePonyCap sidebar at ≥900px; LedgerCap wide sheets; VaultCap `100dvh`; ScentCap PWA meta |
| 2026-06-27 | 1.5 | Cycle 7: VaultCap SMART_DB + OB extraction, COUNTRY_CUR in constants, empty-ios CSS bridge, ScentCap e2e hardening |
| 2026-06-27 | 1.4 | Cycle 6: VaultCap crypto/migrate split, script load order fix, ScentCap CSP, portfolio skip links, PulseCap cap-empty, sync-versions → DeePonyCap version.js |
| 2026-06-27 | 1.3 | Cycle 5: VERSION drift in workspace-audit, VaultCap store-engine split, PulseCap recovery-day session UX, `.cap-empty` + offline banner primitives, ScentCap OfflineBanner |
| 2026-06-27 | 1.2 | Cycle 4: VaultCap module split (router, pin, profiles, demo-boot), VaultLazy loader, ScentCap premium dedup, LedgerCap nav sections, Phase 4 Playwright smoke |
| 2026-06-27 | 1.1 | Light/dark-only theme policy; VaultCap `theme.js` extraction; PulseCap appearance simplification; ScentCap offline fallback; DeePonyCap demo photos |
| 2026-06-27 | 1.0 | Initial registry; Cycle 1 P0 fixes; demo contract CSS/JS; ScentCap offline demo; LedgerCap demo PSX handling |
