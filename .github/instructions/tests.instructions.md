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
- `src/domain/validation.test.ts` — 7 tests: valid domain objects, canonical timestamp rejection, backup parsing, collection-limit enforcement, workout type normalization
- `src/domain/workouts.test.ts` — 2 tests: workout type normalization, bilingual workout labels
- `src/features/dashboard/trends.test.ts` — 3 tests: weekly trend point calculation + prorated snapshot + highlights
- `src/features/settings/notifications.test.ts` — 9 tests: reminder-hour clamping, defaults/fallback, permission flow, scheduled reminder dispatch
- `src/data/backup.test.ts` — 6 tests: export, storage summary, merge import, overwrite import, malformed JSON rejection, oversized payload rejection
- `tests/e2e/save-message-mobile.spec.ts` — Mobile Chrome + Desktop Chrome viewport checks for save-toast visibility on `/log` and `/check-in`
- `tests/e2e/dashboard-trends-mobile.spec.ts` — Mobile Chrome + Desktop Chrome checks for dashboard trend display
- `tests/e2e/headers.spec.ts` — production security headers and CSP smoke test (no `unsafe-inline`/`unsafe-eval`, HSTS, COOP, CORP)

## Adding new tests

- Place domain tests in `src/domain/`.
- Place feature calculation tests next to the file they test (same folder).
- Use Playwright specs under `tests/e2e/` for real viewport, scroll, and interaction checks.
- Run `npm run test` after changes. Run `npm run test:e2e` when changing user flows, save-toast behavior, or mobile layout.
