# Copilot CLI Task Prompts

Copy and paste one prompt at a time into Copilot CLI. Complete all checks before moving to the next task.

---

## Task 1: Add CI quality gate workflow

```
Implement Task 1 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Add a CI quality gate workflow that runs lint, test, and build on every push and PR.
Files: .github/workflows/ci.yml (new)
Before coding: list the files you will create/edit.
After coding: run npm run lint, npm run test, npm run build and confirm all pass.
Keep the workflow minimal and deterministic. Do not add fallback paths that suppress failures.
```

---

## Task 2: Enforce Vitest coverage thresholds

```
Implement Task 2 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Add minimum coverage thresholds to prevent silent test-coverage regressions.
Files: vitest.config.ts
Before coding: read the current vitest.config.ts to understand the coverage setup.
Add coverage.thresholds for lines, functions, branches, and statements. Start with realistic values based on current suite.
After coding: run npm run test and confirm coverage thresholds are now enforced.
If existing tests fail to meet thresholds, add meaningful tests to cover gaps, do not lower thresholds.
```

---

## Task 3: Harden backup import guardrails

```
Implement Task 3 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Reduce local DoS and unsafe overwrite risks during JSON backup import.
Files: src/data/backup.ts, src/domain/validation.ts, src/domain/schemas.ts, src/app/settings/page.tsx, src/data/backup.test.ts, src/domain/validation.test.ts
Before coding: read the current backup.ts and validation.ts to understand the import flow.
Changes needed:
1. Add a pre-parse size guard (e.g., reject payloads > 5MB).
2. Add max item-count guardrails in schemas (e.g., max 10000 logs per table).
3. Validate arrays during import and fail fast with clear error messages.
4. Update settings page import UI to show errors if import fails.
5. Add tests for oversized and malformed payloads.
After coding: run npm run lint, npm run test, confirm backup import still works with valid files.
```

---

## Task 4: Tighten timestamp and reminder setting validation

```
Implement Task 4 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Improve data consistency and resilience against tampered local storage.
Files: src/domain/validation.ts, src/features/settings/notifications.ts, src/domain/validation.test.ts, plus new notification settings tests if needed
Before coding: read validation.ts and notifications.ts to understand current timestamp and reminder-hour checks.
Changes needed:
1. Replace permissive timestamp validation (currently "contains T and Date.parse") with strict ISO-8601 UTC regex check (e.g., /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/).
2. Clamp reminder hour from localStorage to 0-23 range when reading.
3. Add tests for tampered timestamps and out-of-range reminder hours.
After coding: run npm run lint, npm run test.
Confirm reminders still work and timestamps are strictly validated.
```

---

## Task 5: Strengthen production security headers/CSP

```
Implement Task 5 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Improve browser hardening baseline while preserving app behavior.
Files: next.config.ts, and new test file if needed (e.g., tests/e2e/headers.spec.ts)
Before coding: read next.config.ts to understand the current CSP and header setup.
Changes needed:
1. Keep dev CSP as-is (unsafe-inline, unsafe-eval allowed for Hot Reload).
2. For production (process.env.NODE_ENV === 'production'), tighten CSP:
   - Remove or replace 'unsafe-inline' for script-src and style-src in production.
   - Ensure 'unsafe-eval' is absent in production.
3. Add hardening headers: Strict-Transport-Security, Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Resource-Policy: same-origin.
4. Add a test (Playwright or unit) that asserts production headers match expectations.
After coding: run npm run build, npm run lint, npm run test:e2e.
Confirm no CSP violations in browser console and app still loads/functions correctly.
```

---

## Task 6: Scope service worker cleanup behavior

```
Implement Task 6 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Avoid collateral cleanup effects if app shares origin in future.
Files: src/components/ServiceWorkerCleanup.tsx, public/sw.js (if needed), and new test if needed
Before coding: read ServiceWorkerCleanup.tsx and understand the current unregister/cache cleanup logic.
Changes needed:
1. Add app-scope naming (e.g., check for 'leader-health-loop' in registration scope or cache name).
2. Only unregister/delete cache entries tied to this app, not origin-wide.
3. Keep cleanup intent (retire legacy workers/caches) intact.
4. Add a comment explaining the scope guard.
5. Test that cleanup only affects app-specific caches/registrations.
After coding: run npm run lint, npm run test.
Confirm cleanup still removes stale caches for this app only.
```

---

## Task 7: Improve test matrix coverage

```
Implement Task 7 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Increase confidence across browser/runtime combinations.
Files: playwright.config.ts, tests/e2e/* (as needed)
Before coding: read playwright.config.ts to see current project setup (currently Mobile Chrome only).
Changes needed:
1. Keep Mobile Chrome project as-is.
2. Add one Desktop Chrome project (chromium, no mobile emulation).
3. Optionally add WebKit project if budget allows.
4. Ensure all projects use the same test files.
After coding: run npm run test:e2e.
Confirm tests pass in all profiles. Note any fixes needed for cross-browser compatibility.
```

---

## Task 8: Align documentation with actual stack and policy

```
Implement Task 8 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Remove drift between docs and implementation.
Files: README.md, SECURITY.md, optionally PRIVACY.md
Before coding: check package.json for actual versions, then read README.md and SECURITY.md.
Changes needed:
1. Update Next.js version references from 15 to 16 in README.
2. Update any other framework version mentions to match package.json.
3. Clarify in SECURITY.md that Zod schemas define validation intent, but runtime validators are authoritative for persistence/import.
4. Document any new constraints added by earlier tasks (e.g., backup size limits, timestamp format, CSP tightening).
5. Ensure README, SECURITY.md, and PRIVACY.md do not contradict each other on local-first/offline/data-handling.
After coding: run npm run lint.
Verify docs are consistent and version-accurate.
```

---

## Task 9 (Optional): Add formatter workflow

```
Implement Task 9 from `.github/instructions/implementation-tasks.instructions.md`.
Goal: Standardize formatting checks (optional).
Files: package.json, .prettierrc or prettier.config.js (new or update)
Before coding: check if Prettier is already in devDependencies.
Changes needed:
1. If Prettier is absent, add it: npm install --save-dev prettier.
2. Create a .prettierrc config file matching the repo style (or update if exists).
3. Add to package.json scripts: "format": "prettier --write .", "format:check": "prettier --check .".
4. Ensure Prettier config does not conflict with ESLint rules.
After coding: run npm run format:check.
Confirm formatter can be applied and checked via npm scripts.
```

---

## Execution checklist

- [ ] Task 1: CI workflow added and active
- [ ] Task 3: Backup import guardrails in place
- [ ] Task 4: Timestamp and reminder validation tightened
- [ ] Task 5: Production CSP/headers hardened
- [ ] Task 2: Coverage thresholds enforced
- [ ] Task 7: E2E test matrix expanded
- [ ] Task 8: Docs aligned with actual stack
- [ ] Task 6: Service worker cleanup scoped
- [ ] Task 9 (optional): Formatter workflow added
