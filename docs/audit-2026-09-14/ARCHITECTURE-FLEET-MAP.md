# Cap Fleet — Architecture Connection Map (fleet level)

**Status:** ARCH-01–07 ✅ (core + viewer + adapters + Pulse/Scent pilot + fleet roll-out + Pages 404 gate + findings→queue). This document is the **fleet topology** map: how apps, hub, tooling, and shared contracts relate. Per-app interactive maps: `qa/architecture/pilot-*` in tooling (land into each repo’s `docs/architecture/` as follow-up).

**Never published** on GitHub Pages (C-57 / ARCH-06 ✅). Lives only in `capricorn-tooling/docs/audit-*` and each app’s private `docs/architecture/` (SoulCap: `architecture/` at repo root). Live proof: `npm run architecture:pages-404` → `qa/architecture/PAGES-404-ARCH06.json`.

---

## 1. Topology (one diagram)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Capricorn Brain (Obsidian) — decisions / focus (not runtime)            │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │ human + agent context
┌───────────────────────────────────▼──────────────────────────────────────┐
│ Cap-Apps workspace (not a git repo)                                       │
│  sibling clones: *Cap / DeeFoodieApp / capricorn-lab / hub / tooling       │
└───┬───────────────────────┬───────────────────────────┬──────────────────┘
    │                       │                           │
    ▼                       ▼                           ▼
┌───────────────┐   ┌───────────────────┐   ┌─────────────────────────────┐
│ Product apps  │   │ Capricorn OS hub  │   │ capricorn-tooling           │
│ (15 + private)│   │ shamikhahmed.     │   │ shared/* + scripts + agents │
│ each own git  │   │ github.io         │   │ tier1 runner · arch analyze │
└───────┬───────┘   │ (+ capricorn-lab  │   └──────────────┬──────────────┘
        │           │  canonical build) │                  │
        │           └─────────┬─────────┘                  │
        │                     │ Pages (allowlisted)         │
        │                     ▼                            │
        │           https://shamikhahmed.github.io/         │
        │           /{App}/ product PWAs + marketing        │
        └─────────────────────┴────────────────────────────┘
                    shared contracts copied / synced in
```

---

## 2. Product apps (runtime islands)

Each app is an **independent git repo** and (where hosted) a **GitHub Pages project site** under `/<App>/`. No shared production database across Caps. Data stays local (IndexedDB / localStorage / files) unless the app has its own Worker/API.

| App | Stack (short) | Pages artifact | Special backends |
|---|---|---|---|
| AuraCap | React 19 + Vite + Tailwind 4 | `dist/` | — |
| CarCap | Vanilla JS | hub mirror / allowlist (no repo Pages API) | — |
| CookCap | Next 15 static export | `out/` (`NEXT_PUBLIC_BASE_PATH=/CookCap`) | — |
| DeeFoodieApp | Flutter + Nest/Prisma | private / marketing stub | Postgres + API tokens |
| DeePonyCap | Vanilla JS | allowlisted `_site` (C-57) | — |
| IdeaCap | Expo / RN | hub / web export | — |
| LedgerCap | Vanilla + bundle | allowlisted `_site` | Cloudflare Worker + KV |
| MasteryCap | Vanilla JS | allowlisted `_site` | — |
| PrismCap | Vanilla + Vite `src/` | allowlisted `_site` | — |
| PulseCap | Vanilla JS | allowlisted `_site` (CI deploy) | — |
| ScentCap | React 19 + Vite + Cap 8 | `dist/` | — |
| SoulCap | Vanilla PWA in `docs/` | `docs/` (not repo root) | — |
| SteadyCap | Vanilla JS | allowlisted `_site` | — |
| TravelCap | Next 16 static export | export / hub | — |
| VaultCap | Vanilla + WebCrypto | allowlisted `_site` | optional Worker |
| **Hub** Capricorn OS | Vite + three.js (`capricorn-lab` → hub) | allowlisted `_site` via `scripts/stage-site.sh` | support.html → GitHub issues |

**Release truth (vanilla PWAs):** `VERSION.json` ↔ `window.APP_VERSION` ↔ SW cache name ↔ register query in `index.html` (plus changelog / HANDOVER).

---

## 3. Hub — Capricorn OS (`shamikhahmed.github.io`)

- **Canonical product site** for the portfolio brand (“Capricorn OS” stays here only — G-3 / D-13).
- **Build source:** `capricorn-lab` (port modules; archive os-next).
- **Publishes:** marketing pages, app landing shells, catalog/version badges, support entry.
- **Must not publish:** `.cursor/`, `qa/`, worker secrets, architecture maps (C-53 / C-57).
- **App URLs:** `https://shamikhahmed.github.io/<App>/` — either the app’s own Pages project or hub-mirrored paths.

---

## 4. Tooling — `capricorn-tooling`

| Area | Path | Role |
|---|---|---|
| Tier 1 runner | `shared/testing/tier1.mjs` | Gates G1… (kill-list, LH, matrix, axe, brand, live VERSION, …). **PASS only when real evidence exists** (Review 3). |
| Finish matrix | `shared/testing/finish-matrix.js` | Device/viewport shots + `matrix-results.json` |
| Architecture analyzer | `shared/architecture/` | ARCH-01… — graph from source; never auto-fix |
| Design system | `shared/design/`, `shared/design-system/` | Tokens / marks synced into apps |
| Security | `shared/security/local-lock.js` | Optional app lock (G-10) |
| Marketing / copy | `shared/marketing/`, `scripts/release-marketing.mjs` | Voice + release pipeline |
| Agents | `cap-agents/` | Skill packs (not runtime) |
| Cursor rule | `shared/cursor-rules/senior-engineering-mode.mdc` | Copied to every repo `.cursor/rules/` (C-53) |
| Audit program | `docs/audit-2026-09-14/` | PROGRESS, DECISIONS, master prompt |

Apps invoke tooling as siblings: `node ../capricorn-tooling/shared/…` or copied scripts. Tooling is **dev/CI only** — never a production dependency of a Cap PWA.

---

## 5. Shared contracts (what actually couples the fleet)

These are the real cross-repo contracts (not a monorepo package graph):

1. **VERSION / catalog** — `VERSION.json` + hub catalog sync (`scripts/sync-catalog-versions.mjs`, `sync-versions.mjs`).
2. **Design tokens** — accent / typography / marks via design-system sync; Tier 1 `brandOk` kill-list.
3. **PWA shell** — `manifest`, SW precache, `privacy.html`, icons, `changelog.html` patterns.
4. **Tier 1 evidence** — `qa/finish-loop/{TIER1.json,matrix-results.json,axe,LH}` shape enforced by `tier1.mjs`.
5. **Architecture data** — `architecture-data.schema.json` + `architecture.config.json` per app (ARCH-*).
6. **Engineering mode** — `.cursor/rules/senior-engineering-mode.mdc` identical across repos.
7. **Local lock** — optional shared lock module for SoulCap / SteadyCap / TravelCap documents.
8. **Publisher / privacy** — Capricorn Systems, Karachi; per-app `privacy.html`; hub `support.html` (G-4).

There is **no** shared Supabase/Firebase/SQLite fleet backend today (ARCH adapters detect absence).

---

## 6. Data / trust boundaries

```text
User device
  └─ Cap PWA (local storage / IDB / files)
       ├─ optional: Cap Cloudflare Worker (Ledger / Vault) — binding names only in maps
       └─ DeeFoodie only: Nest API + Postgres (bearer tokens hashed server-side)

GitHub Pages CDN
  └─ static allowlisted artifact only (C-57) — no qa/, no HANDOVER, no wrangler.toml, no .cursor/
```

---

## 7. Analyzer → viewer pipeline (per app)

```text
architecture.config.json
        │
        ▼
shared/architecture/analyze.mjs ── adapters (vanilla / react / nest / dart / SW / env …)
        │
        ├─ architecture-data.json (+ .js for file://)
        ├─ AUDIT.md (findings → work items ARCH-07 ✅)
        └─ viewer copy under docs/architecture/ (ARCH-02; never Pages)
                 │
                 ▼
        qa/architecture/queue/<App>-ARCH-QUEUE.{json,md}
        + QUEUE-INDEX.md (Finish Program pickup)
```

Pilot order: PulseCap → ScentCap → roll-out (ARCH-04 ✅ / ARCH-05 ✅).

Outputs (tooling): `qa/architecture/pilot-*/` via `--config qa/architecture/pilots/*.architecture.config.json`. Spot-check: ARCH-04 `SPOT-CHECK.json` 60/60; ARCH-05 `SPOT-CHECK-ARCH05.json` 314/314.

---

## 8. Remaining ARCH work

| ID | Item | Status |
|---|---|---|
| ARCH-01 | Core + schema + fixtures | ✅ Done (`c941978` / merge `c628e40`; tests 16/16) |
| ARCH-02 | Static viewer (`viewer/*`) | ✅ Done (`finish/arch-02` `10d977c`) |
| ARCH-03 | Stack adapters completeness | ✅ Done (`finish/arch-03` `1dddd1a` / merge `a9f587a`; adapters/ + cloudflare + backend-presence; tests 22/22; analyzer 1.1.0) |
| ARCH-04 | Pilot PulseCap + ScentCap | ✅ Done (`finish/arch-04`; analyzer 1.2.0; reg/go + MODULE_CHAIN; routes ROUTES_TO/NAVIGATES_TO; spot-check 60/60; tests 24/24; `qa/architecture/`) |
| ARCH-05 | Roll-out all apps + hub | ✅ Done (`finish/arch-05`; analyzer 1.3.0; 17 apps; spot-check 314/314; tests 27/27; nest nested detect; Next src/app; tabs-id/tuples) |
| ARCH-06 | Never publish maps (C-57 curl 404) | ✅ Done (`finish/arch-06`); `npm run architecture:pages-404` + CI workflow; matrix hosts × apps × artifacts → 404/410 |
| ARCH-07 | Findings → queue items | ✅ Done (`finish/arch-07`); `npm run architecture:queue` → `qa/architecture/queue/` + `QUEUE-INDEX`; proof Pulse+Scent+Car+Vault = **1986** items |
| ARCH-08 | Staleness + `architecture:check` + G15 | ❌ |
| ARCH-09 | Regenerate workflow on structural change | ❌ |
| ARCH-10 | APP-REPORT Architecture section | ❌ |

---

## 9. Related

- Spec: `capricorn-tooling/shared/architecture/SPEC.md`
- Decisions: `DECISIONS.md` G-11
- Pages hygiene: `qa/finish-loop/LOG.md` (C-57 entry) + Review 3 prompt §2.4
