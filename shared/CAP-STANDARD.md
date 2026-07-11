# Cap Standard — every Cap app ships like this

Pilot: **ScentCap v1.3.0** (2026-07-11). Copy its patterns; adapt paths per stack.

## The 7 items

| # | Item | Definition of done | Reference impl |
|---|------|--------------------|----------------|
| 1 | **Docs pack** | README (features, quick start, deploy, screenshots), CHANGELOG (keep-a-changelog style), LICENSE (MIT, Shamikh Ahmed / Capricorn Systems), CLAUDE.md (points at Capricorn-Brain project note) | ScentCap root |
| 2 | **Screen gallery** | Playwright spec captures EVERY screen, mobile + desktop, into `docs/screenshots/gallery/` + `gallery-manifest.json`; browsable `screen-gallery.html` at repo root with viewport filter + lightbox; gated behind `CAPTURE_GALLERY=1` so routine e2e doesn't churn PNGs | `ScentCap/e2e/gallery.spec.ts`, `ScentCap/screen-gallery.html` |
| 3 | **Version discipline** | `VERSION.json` (version + swCache + updated) — package.json version must match; SW cache bump on every asset change; git tag `vX.Y.Z` per release | ScentCap, MasteryCap SW discipline |
| 4 | **QA** | Playwright e2e (smoke + viewport contract minimum); single `npm run verify` = lint + build + e2e | `ScentCap/e2e/` |
| 5 | **CI gate** | Pages deploy workflow has `test` job running `npm run verify` before `build` → `deploy`; playwright-report uploaded on failure | `ScentCap/.github/workflows/deploy.yml` |
| 6 | **PWA polish** | manifest shortcuts, 192/512/1024 icons, offline banner, install path documented | ScentCap, VaultCap install.html |
| 7 | **Demo mode** | Seeded demo data reachable from onboarding or `?demo=1`; used by gallery + screenshots specs | ScentCap demo wardrobe, AuraCap `?demo=1` |

## Per-app npm scripts (names are the contract)

```
verify         lint + build + full e2e   (CI runs this)
test:e2e       build + playwright test
gallery        build + CAPTURE_GALLERY=1 playwright test e2e/gallery.spec.ts
gallery:view   python3 -m http.server <port>   then open /screen-gallery.html
screenshots    App Store curated shots (where applicable)
```

## Rollout order (decided 2026-07-11)

ScentCap ✅ → AuraCap → PulseCap → SteadyCap → PrismCap → DeePonyCap (gallery ✅, needs CI gate) → LedgerCap → TravelCap → VaultCap (mostly done; align script names) → MasteryCap (align) → SoulCap → IdeaCap (Expo — adapt: EAS/Maestro instead of Playwright) → CarCap (when started).

## Rules

- Never commit `.env` — every repo gitignores `.env` / `.env.*` except examples.
- Regenerate gallery on every release, in the release commit.
- CI must be green before tag.
- Bump swCache with any asset change or users get stale builds.
