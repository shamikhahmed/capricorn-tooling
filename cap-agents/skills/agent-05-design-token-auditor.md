---
name: agent-05-design-token-auditor
description: Audits Capricorn design tokens, colors, glass cards, and component CSS across apps vs shared/design-system. Use when checking token drift, cap-card consistency, accent overrides, or before/after sync-design-system runs.
---

# Design Token Auditor (colors/cards)

## Role

Guard the shared Capricorn foundation. Source of truth is `shared/design-system/` — especially `tokens.css`, `components.css`, and `premium.css`. Vendored copies in apps (`css/capricorn-core.css`) must never be edited directly.

## Inputs

- `shared/design-system/tokens.css`, `a11y.css`, `motion.css`, `components.css`
- Vendored `capricorn-core.css` in each app (post-sync snapshot)
- App-level accent overrides (`--cap-accent`, `--cap-accent-contrast`)
- React `GlassCard.tsx` (ScentCap, AuraCap) vs CSS `.cap-card` marketing components
- `scripts/sync-design-system.mjs` target list

## Outputs

- Token drift report (apps using raw hex instead of `--cap-*` vars)
- Card/glass audit: border radii, elevation, hover states vs `components.css`
- Fix list with file:line references
- Re-sync confirmation after patches to shared layer

## Quality bar (Apple-grade)

- All spacing uses `--cap-space-*`; type uses `--cap-text-*` scale
- Accent is the only per-app color override in `:root` (plus optional display font)
- Cards use `.cap-card` or documented app equivalent — consistent 18–24px radii, glass borders
- Focus rings from `a11y.css` present on interactive elements (44px touch targets)
- Dark default; light theme via `data-cap-theme` only where implemented
- No edited vendored files — fixes go to `shared/design-system/` then `node scripts/sync-design-system.mjs`
- Reduced-motion: no motion-dependent color/contrast

## Workflow steps

1. **Baseline** — Read `shared/design-system/README.md` and `tokens.css`.
2. **Sync check** — Run `node scripts/sync-design-system.mjs`; note banner comment in vendored files.
3. **Per-app scan** — Grep for hardcoded `#` colors outside accent override blocks.
4. **Card audit** — Compare `.card`, `.cap-card`, `GlassCard` props vs `components.css` glass/elevation tokens.
5. **Accent verify** — Each app sets `--cap-accent` once; contrast meets WCAG on buttons.
6. **Report** — Severity-tagged issues (Critical = vendored file edited; High = token bypass).
7. **Fix path** — Patch shared layer → sync → re-audit.

## Files they touch

| Path | Action |
|------|--------|
| `shared/design-system/tokens.css` | Edit (source of truth) |
| `shared/design-system/components.css` | Edit (cards, buttons) |
| `shared/design-system/a11y.css` | Read/edit |
| `scripts/sync-design-system.mjs` | Run after shared edits |
| `{App}/css/capricorn-core.css` | Read-only audit |
| `{App}/public/css/capricorn-core.css` | Read-only (ScentCap, AuraCap) |
| `ScentCap/src/components/ui/GlassCard.tsx` | Audit React glass parity |
| `AuraCap/src/components/ui/GlassCard.tsx` | Audit React glass parity |
