---
applyTo: "**/*.{test,spec}.{ts,tsx}"
description: "Testing rules"
---

# Testing instructions

## Rules
- Prefer fast unit tests for domain logic.
- Use clear test names that reflect behavior (e.g. `"returns green when adherence is 80%"`).
- Avoid snapshot tests unless needed.
- For date-sensitive logic, freeze time using `vi.setSystemTime()` in a `beforeEach` / `afterEach`.

## Existing test files
- `src/domain/calc.test.ts` — 7 tests: adherence percent + status (green/yellow/red) + prorated adherence + workout progress + weekly trends
- `src/domain/localeNumber.test.ts` — locale-aware number parsing and formatting
- `src/features/dashboard/trends.test.ts` — 3 tests: weekly trend point calculation + prorated snapshot
- `src/data/backup.test.ts` — 2 tests: export and import roundtrip
- `tests/e2e/save-message-mobile.spec.ts` — mobile viewport checks for save-toast visibility on `/log` and `/check-in`

## Adding new tests
- Place domain tests in `src/domain/`.
- Place feature calculation tests next to the file they test (same folder).
- Use Playwright specs under `tests/e2e/` for real viewport, scroll, and interaction checks.
- Run `npm run test` after changes. Run `npm run test:e2e` when changing user flows, save-toast behavior, or mobile layout.
