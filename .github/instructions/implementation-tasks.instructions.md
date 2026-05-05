---
description: "Prioritized implementation tasks from security and quality dry-run"
applyTo: "**/*"
---

# Implementation Tasks for Copilot CLI

Purpose: execute a safe, prioritized hardening and quality pass based on the dry-run audit.

Execution mode:

- Implement one task at a time.
- Open a separate branch/PR per task.
- Do not change product scope or language (Norwegian Bokmal UI text).
- Preserve local-first architecture (Dexie/IndexedDB, no forced cloud sync).
- Follow existing repository instructions in `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`.

Definition of done for every task:

1. `npm run lint` passes.
2. `npm run test` passes.
3. If UI/viewport behavior is touched, run `npm run test:e2e`.
4. Update docs when behavior, policy, or stack details change.

## Task 1: Add CI quality gate workflow (high)

Goal:

- Ensure every PR and push is validated with install, lint, test, and build.

Files to add/update:

- `.github/workflows/ci.yml` (new)

Required changes:

- Trigger on `push` and `pull_request` for `master`.
- Use Node 22.
- Run in order: `npm ci`, `npm run lint`, `npm run test`, `npm run build`.
- Fail fast on any failing step.
- Keep workflow minimal and deterministic.

Acceptance criteria:

- CI workflow exists and is active for normal development flow.
- No fallback path that suppresses test failures.

## Task 2: Enforce Vitest coverage thresholds (medium)

Goal:

- Prevent silent test-coverage regressions.

Files to add/update:

- `vitest.config.ts`

Required changes:

- Keep existing coverage provider/reporters.
- Add minimum coverage thresholds (lines/functions/branches/statements).
- Start with realistic thresholds for current suite, then raise later.

Acceptance criteria:

- Coverage thresholds are enforced in test runs.
- Existing test suite still passes or is adjusted with meaningful tests.

## Task 3: Harden backup import guardrails (high)

Goal:

- Reduce local DoS and unsafe overwrite risks during JSON import.

Files to add/update:

- `src/data/backup.ts`
- `src/domain/validation.ts`
- `src/domain/schemas.ts` (if needed)
- `src/app/settings/page.tsx`
- `src/data/backup.test.ts`
- `src/domain/validation.test.ts`

Required changes:

- Add pre-parse size guard for import payload.
- Add max item-count guardrails for imported collections.
- Return user-friendly errors in settings import flow.
- Keep import transaction semantics and overwrite behavior explicit.

Acceptance criteria:

- Oversized payloads fail safely with clear messaging.
- Normal backup import/export behavior remains intact.
- New tests cover failure paths for malformed/oversized imports.

## Task 4: Tighten timestamp and reminder setting validation (medium)

Goal:

- Improve data consistency and resilience against tampered local storage.

Files to add/update:

- `src/domain/validation.ts`
- `src/features/settings/notifications.ts`
- `src/domain/validation.test.ts`
- add/update notification settings tests (create if missing)

Required changes:

- Validate timestamps against a strict canonical ISO-8601 UTC profile used by the app.
- Clamp/validate reminder hour to 0-23 when reading persisted settings.
- Preserve existing defaults and graceful fallback behavior.

Acceptance criteria:

- Non-canonical timestamps are rejected by validators.
- Invalid reminder-hour values do not break reminder behavior.
- Tests cover edge and tampered input cases.

## Task 5: Strengthen production security headers/CSP (medium)

Goal:

- Improve browser hardening baseline while preserving app behavior.

Files to add/update:

- `next.config.ts`
- add/update header/CSP tests (create if missing)

Required changes:

- Keep separate dev vs production CSP behavior.
- Reduce `unsafe-inline` exposure in production where possible.
- Ensure `unsafe-eval` is not present in production policy.
- Add additional hardening headers where safe for current deployment model (for example HSTS/COOP/CORP).

Acceptance criteria:

- Production header set is stricter than current baseline.
- No runtime breakage from CSP/header changes.
- Tests assert expected production headers.

## Task 6: Scope service worker cleanup behavior (low)

Goal:

- Avoid collateral cleanup effects if app shares origin in future.

Files to add/update:

- `src/components/ServiceWorkerCleanup.tsx`
- `public/sw.js` (only if needed)
- related tests (add if missing)

Required changes:

- Only unregister/delete cache entries tied to this app scope.
- Keep current cleanup intent (retire legacy workers/caches) unless product direction changes.

Acceptance criteria:

- Cleanup still works for this app.
- Logic avoids broad origin-wide deletion where practical.

## Task 7: Improve test matrix coverage (medium)

Goal:

- Increase confidence across browser/runtime combinations.

Files to add/update:

- `playwright.config.ts`
- `tests/e2e/*` (as required)

Required changes:

- Keep mobile profile.
- Add at least one desktop profile.
- Add WebKit profile if runtime budget allows.

Acceptance criteria:

- E2E runs in at least two distinct profiles.
- Existing viewport-sensitive tests remain stable.

## Task 8: Align documentation with actual stack and policy (low)

Goal:

- Remove drift between docs and implementation.

Files to add/update:

- `README.md`
- `SECURITY.md`
- optionally `PRIVACY.md` if behavior text changes

Required changes:

- Update framework/version references (for example Next.js major version).
- Clarify runtime validation approach (Zod schemas + runtime validation boundary).
- Document any new import-size or security-header constraints added in earlier tasks.

Acceptance criteria:

- Docs match current code behavior and toolchain.
- No conflicting statements across README/SECURITY/PRIVACY.

## Optional Task 9: Add formatter workflow (low)

Goal:

- Standardize formatting checks.

Files to add/update:

- `package.json`
- formatter config files (if introducing Prettier)

Required changes:

- Add `format` and `format:check` scripts.
- Ensure formatter does not fight existing lint setup.

Acceptance criteria:

- Formatting can be applied and checked via npm scripts.

## Suggested execution order

1. Task 1 (CI gate)
2. Task 3 (import guardrails)
3. Task 4 (validation hardening)
4. Task 5 (headers/CSP)
5. Task 2 (coverage thresholds)
6. Task 7 (E2E matrix)
7. Task 8 (docs alignment)
8. Task 6 (service worker scope)
9. Task 9 (optional formatter)

## Copilot CLI run prompt template

Use this template when asking Copilot CLI to implement one task:

"Implement Task <N> from `.github/instructions/implementation-tasks.instructions.md`.
Follow repository instructions files. Keep changes minimal and scoped.
Before coding: list files to edit.
After coding: run required checks and summarize results.
If tests fail, fix relevant issues before finishing."
