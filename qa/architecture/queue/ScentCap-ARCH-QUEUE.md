# ScentCap — Architecture queue (ARCH-07)

Generated from analyzer findings. **Observe → queue → human decides.** Never auto-delete.

| Field | Value |
|---|---|
| App | `ScentCap` |
| Items | **935** (1:1 with findings) |
| Priorities | P0=1, P2=934 |
| Severities | info=934, risk=1 |
| Kinds | DUPLICATE=12, ORPHAN=726, SECURITY=1, UNUSED=196 |
| Source commit | `5fcd4f88978a55167f04a6d666eb6d6c30fee5ab` |
| Analyzer | 1.3.0 |
| Source | `qa/architecture/pilot-scent/architecture-data.json` |
| Full register | `ScentCap-ARCH-QUEUE.json` (every finding) |
| Status | all `open` until Finish Program resolves |

## Priority slice (risk + warn) — work these first

| ID | P | Kind | Title | Evidence | Done when | Status |
|---|---|---|---|---|---|---|
| `ScentCap-ARCH-01` | P0 | SECURITY | SECURITY: Client-exposed env name looks secret: VITE_FRAGANTY_API_KEY | env:1 — VITE_FRAGANTY_API_KEY (key only) | Remediate the security finding (client-exposed secret, sink, unprotected store) with evidence. | open |

## Info-level register (sample + pointer)

**934** info items (ORPHAN/UNUSED/DUPLICATE/…). Full 1:1 list with evidence is in `ScentCap-ARCH-QUEUE.json`. Finish Program picks up by ID from JSON.

| ID | P | Kind | Title | Evidence | Status |
|---|---|---|---|---|---|
| `ScentCap-ARCH-02` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): nativeImpact ↔ nativeNotification | src/lib/premium/haptics.ts:5 — { try { const { Haptics, ImpactStyle } = await import('@capacitor/haptics'); awa | open |
| `ScentCap-ARCH-03` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): hapticLight ↔ hapticMedium | src/lib/premium/haptics.ts:30 — { if (Capacitor.isNativePlatform()) { void nativeImpact('Light'); return; } vibr | open |
| `ScentCap-ARCH-04` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): hapticLight ↔ hapticSelection | src/lib/premium/haptics.ts:30 — { if (Capacitor.isNativePlatform()) { void nativeImpact('Light'); return; } vibr | open |
| `ScentCap-ARCH-05` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): hapticMedium ↔ hapticSelection | src/lib/premium/haptics.ts:39 — { if (Capacitor.isNativePlatform()) { void nativeImpact('Medium'); return; } vib | open |
| `ScentCap-ARCH-06` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): hapticSuccess ↔ hapticError | src/lib/premium/haptics.ts:57 — { if (Capacitor.isNativePlatform()) { void nativeNotification('Success'); return | open |
| `ScentCap-ARCH-07` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): formatFilename ↔ genderToBodyVariant | src/lib/shareCard.ts:206 — { if (format === 'story') return 'scentcap-today-story.png'; if (format === 'squ | open |
| `ScentCap-ARCH-08` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): formatFilename ↔ bodyVariantLabel | src/lib/shareCard.ts:206 — { if (format === 'story') return 'scentcap-today-story.png'; if (format === 'squ | open |
| `ScentCap-ARCH-09` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): genderToBodyVariant ↔ bodyVariantLabel | src/lib/sprayZones.ts:78 — { if (gender === 'woman') return 'female'; if (gender === 'man') return 'male';  | open |
| `ScentCap-ARCH-10` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): avgProjectionLabel ↔ avgLongevityLabel | src/lib/stats.ts:73 — { if (!fragrances.length) return '—'; const avg = fragrances.reduce((s, f) => s  | open |
| `ScentCap-ARCH-11` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): shareResult ↔ shareToday | src/pages/Advisor.tsx:160 — async () => { if (!result) return; try { const shareInput = advisorToShareInput( | open |
| `ScentCap-ARCH-12` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 0.94): saveWearEdit ↔ saveWearEdit | src/pages/CalendarPage.tsx:62 — async (rating: number, compliment: boolean, notes?: string) => { if (!editWear)  | open |
| `ScentCap-ARCH-13` | P2 | DUPLICATE | DUPLICATE: Similar function bodies (similarity 1.00): exportData ↔ exportWearCsv | src/pages/Settings.tsx:48 — async () => { const json = await exportAllData(); const blob = new Blob([json],  | open |
| `ScentCap-ARCH-14` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:capacitor.config.ts#capacitor.config.ts | capacitor.config.ts:1 — capacitor.config.ts | open |
| `ScentCap-ARCH-15` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:@capacitor/cli#cli | @capacitor/cli:1 — cli | open |
| `ScentCap-ARCH-16` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:eslint.config.js#eslint.config.js | eslint.config.js:1 — eslint.config.js | open |
| `ScentCap-ARCH-17` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:@eslint/js#js | @eslint/js:1 — js | open |
| `ScentCap-ARCH-18` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:globals#globals | globals:1 — globals | open |
| `ScentCap-ARCH-19` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:eslint-plugin-react-hooks#eslint-plugin-react-hooks | eslint-plugin-react-hooks:1 — eslint-plugin-react-hooks | open |
| `ScentCap-ARCH-20` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:eslint-plugin-react-refresh#eslint-plugin-react-refresh | eslint-plugin-react-refresh:1 — eslint-plugin-react-refresh | open |
| `ScentCap-ARCH-21` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:typescript-eslint#typescript-eslint | typescript-eslint:1 — typescript-eslint | open |
| `ScentCap-ARCH-22` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:eslint/config#config | eslint/config:1 — config | open |
| `ScentCap-ARCH-23` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:playwright.config.ts#playwright.config.ts | playwright.config.ts:1 — playwright.config.ts | open |
| `ScentCap-ARCH-24` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:@playwright/test#test | @playwright/test:1 — test | open |
| `ScentCap-ARCH-25` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:react#react | react:1 — react | open |
| `ScentCap-ARCH-26` | P2 | ORPHAN | ORPHAN: Unreachable from entry points: file:react-router-dom#react-router-dom | react-router-dom:1 — react-router-dom | open |

_… and 909 more in JSON._

## Finish Program notes

- IDs: `<APP>-ARCH-<n>` (stable for this generation order: risk → warn → info, then kind, then finding id).
- Work risk/warn first; orphans/unused are investigate-not-delete (§74).
- Resolving an item = keep/wire/remove with proof, or fix broken/security at root.
- Re-run `npm run architecture:queue` after re-analyzing to refresh this file.
