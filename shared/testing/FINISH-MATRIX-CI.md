# Finish-matrix CI (C-31)

Every app's `finish-matrix` Playwright spec starts with `test.skip(!RUN)` unless **`FINISH_MATRIX=1`** (or `FINISH_MATRIX_FULL=1`). Routine `npm test` / `verify` must stay fast — CI is responsible for running the matrix.

## Required CI job shape

1. Set `FINISH_MATRIX: "1"` (use `FINISH_MATRIX_FULL: "1"` for all 15 viewports).
2. Run the repo's finish-matrix spec (e.g. `npm run test:matrix`).
3. Ensure the spec writes **`qa/finish-loop/matrix-results.json`** via `writeMatrixResults()` from `shared/testing/finish-matrix.js` with:
   - `failures` — array (empty on green)
   - `shotCount` / `expectedShots` — `routes × viewports × themes`
   - `generatedAt` — ISO timestamp after the last UI-affecting commit
   - `routes`, `viewports`, `themes` — arrays used for the expected count
4. Upload `qa/finish-loop/shots/` and `matrix-results.json` as workflow artifacts.

## Release / Tier 1 note

Artifacts alone do **not** satisfy a local or release `tier1` gate. After a green matrix run, **commit the latest `qa/finish-loop/matrix-results.json`** into the app repo (shots may stay gitignored / artifact-only). Release commits that claim Tier 1 must include that file.

## Template (SoulCap / PulseCap)

See:

- `SoulCap/.github/workflows/deploy.yml` — job `finish-matrix`
- `PulseCap/.github/workflows/ci.yml` — job `finish-matrix`

Snippet to copy into other Cap apps:

```yaml
  finish-matrix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Finish matrix
        env:
          FINISH_MATRIX: "1"
        run: npm run test:matrix
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: finish-matrix-shots
          path: qa/finish-loop/shots/
          retention-days: 14
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: matrix-results
          path: qa/finish-loop/matrix-results.json
          retention-days: 14
```

The Tier 1 runner (`tier1.mjs`) **fails** if `matrix-results.json` is missing or reports failures / insufficient shots.
