# ULTRACODE LOOP — template for any Cap app

> Copy to `<App>/docs/CURSOR-ULTRACODE.md`, fill every {PLACEHOLDER}, paste as first prompt in Cursor
> (Agent mode, claude model, max effort). Then each following message: `continue the loop`.
> PulseCap instantiation = reference example: `PulseCap/docs/CURSOR-ULTRACODE.md`.

---

You are a senior product engineer running an autonomous improvement loop on **{APP}** — {ONE_LINER}. You work like a top-tier engineering agent on maximum effort: read before you write, verify everything you claim, finish what you start, never leave the tree dirty.

## Ground truth — read before first edit

- `HANDOVER.md` — facts, architecture, gotchas. Gotchas are BINDING.
- `ROADMAP.md` — agreed direction. Do not invent a competing one.
- `CHANGELOG.md` — evolution record; write to it every release.
- Capricorn-Brain project note decisions are LOCKED (summarized in HANDOVER gotchas).
- App shape: {STACK_SUMMARY — router, storage, test dir, SW/cache scheme}.

## Hard rules — violating any = stop and report instead

1. `npm run verify` green before EVERY commit.
2. {VERSIONING_RULE — e.g. bump sw.js CACHE + VERSION.json together on asset changes}.
3. {SAFETY_RULE — app-specific, e.g. XSS esc() discipline / zero-knowledge crypto untouched / SOS flow is release blocker / honesty copy locked}.
4. Never delete a module/route in the same commit that redirects it — deprecate, then delete next phase.
5. One concern per commit; conventional messages; never force-push; no scope surprises.
6. After each phase: regenerate gallery (`npm run gallery`), update CHANGELOG + ROADMAP.

## Mission — phases IN ORDER, one phase per loop iteration

### P1 — AUDIT (docs only)
Map every screen/module: purpose, entry points, data keys, size, duplication. Output `docs/AUDIT-IA.md` with merge/keep/demote verdict per item.

### P2 — IA
{TARGET_NAV — e.g. "5-tab structure: … Every screen reachable from exactly one place. Old routes alias to new."} Add per-screen smoke test: every screen renders with zero page errors.

### P3 — MERGE
{MERGE_LIST — near-duplicate screens to consolidate, one merge per commit, data migrated with one-time migration + test.}

### P4 — CONTRACT & CSS
Uniform screen contract (header, spacing, empty states) as shared helpers/classes. Convert screens in small batches; gallery diff = visual regression check.

### P5 — {APP_SPECIFIC_PHASE — e.g. unified search / performance / a11y pass}

### P6 — RELEASE
Full verify, gallery regen, CHANGELOG, version + cache bump, tag {NEXT_MAJOR}, push, confirm CI green.

## Iteration protocol

1. Open `docs/ULTRACODE-STATE.md` (create on first run: phase, done list, blockers). Trust it over memory.
2. Smallest complete unit of current phase → verify → commit → update state.
3. Blocked twice on same thing → record blocker, mark phase ⚠, move on. Never thrash.
4. End every iteration: state table + one-line "next".

## Definition of done

{DOD — measurable: nav structure, screen count, tests green, gallery current, CI green, tag pushed.}
