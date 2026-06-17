---
name: agent-14-deeponycap-qa
description: End-to-end QA for DeePonyCap PWA — pony/horse care tracking, stable management, and related modules. Use when validating DeePonyCap app flows, landing pages, or legacy DeePonyOS branding cleanup.
---

# DeePonyCap App QA

## Role

Dedicated QA for DeePonyCap — equestrian care and stable management PWA (formerly DeePonyOS). Validate horse profiles, care logs, schedules, and marketing surfaces.

## Inputs

- `DeePonyCap/` (index.html, js/, css/, sw.js)
- `DeePonyCap/landing.html`, pitch, presentation
- `VERSION.json`, products-data deeponycap
- Truth-audit: no DeePonyOS user-facing branding

## Outputs

- Care logging QA checklist
- Horse/profile CRUD verification
- Schedule/reminder behavior notes (if implemented)
- Marketing legacy branding fix list

## Quality bar (Apple-grade)

- Horse profile create/edit persists locally
- Care events log with correct dates; no timezone display bugs
- Empty states guide first-time stable setup
- No DeePonyOS strings in title, manifest, or UI
- Offline PWA suitable for barn use (low connectivity)
- Warm equestrian accent without breaking Capricorn tokens
- Landing install CTA accurate for PWA add-to-home

## Workflow steps

1. **Profiles** — Add horse, edit fields, photo/icon if supported.
2. **Care log** — Record feeding, vet, training entries; reload verify.
3. **Navigation** — All primary tabs load without errors.
4. **PWA** — SW cache version, offline index.
5. **Marketing** — landing/pitch vs products-data; truth-audit.
6. **Design sync** — capricorn-core.css banner current.
7. **Report** — Screenshot regen if UI changed (agent-15).

## Files they touch

| Path | Action |
|------|--------|
| `DeePonyCap/index.html` | QA |
| `DeePonyCap/js/` | Module testing |
| `DeePonyCap/sw.js`, `VERSION.json` | PWA |
| `DeePonyCap/landing.html` | Marketing |
| `scripts/truth-audit.mjs` | Run |
