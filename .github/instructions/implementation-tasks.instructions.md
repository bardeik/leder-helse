---
description: "Prioritized implementation tasks from security and quality dry-run"
applyTo: "**/*"
---

# Implementation Tasks for Copilot CLI

Purpose: execute a safe, prioritized hardening and quality pass based on the dry-run audit.

Execution mode:

- Implement one task at a time.
- Open a separate branch/PR per task.
- Do not change product scope; keep both Norwegian Bokmål and English UI text in sync.
- Preserve local-first architecture (Dexie/IndexedDB, no forced cloud sync).
- Follow existing repository instructions in `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`.

Definition of done for every task:

1. `npm run lint` passes.
2. `npm run test` passes.
3. If UI/viewport behavior is touched, run `npm run test:e2e`.
4. Update docs when behavior, policy, or stack details change.
5. Add or update translation parity tests whenever new user-facing strings are introduced.

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

## Next Security Modernization Tasks (2026-10-15)

Execute one task per branch/PR. Do not bundle unrelated dependency, runtime, validation, or CSP changes. Re-check current Node.js support and npm advisories when starting each task; do not rely on this snapshot as current registry state.

### Task 10: Move the container to a supported Node.js LTS (high)

Status: COMPLETE, verified 2026-10-20 on Node.js 24.22.0 and npm 11.13.0. Clean install, lint, typecheck, tests (179 passed), production build, Podman image build, and standalone HTTP smoke test passed. The production dependency audit reported zero vulnerabilities.

Goal:

- Remove the end-of-life Node.js 20 runtime from the production container and align it with CI.
- Target Node.js 24 LTS after confirming the current dependency set and deployment platform support it.

Files to add/update:

- `Dockerfile`
- `.github/workflows/ci.yml`
- `README.md` or `SECURITY.md` only if runtime requirements are documented there

Required changes:

- Use the same supported Node.js major in CI and the Docker build/runtime stages.
- Pin CI to a specific current Node.js 24 patch release; use the corresponding maintained Bookworm slim image for Docker.
- Preserve the existing npm version unless compatibility testing proves it must change.

Acceptance criteria:

- CI and the production container use the selected supported LTS major.
- `npm ci`, lint, typecheck, tests, production build, and Docker image build pass on that runtime.
- The deployed standalone server starts and serves the app from the resulting image.

### Task 11: Reject impossible calendar dates (medium)

Status: COMPLETE, verified 2026-10-20. Runtime validators, Zod schemas, and backup import reject impossible Gregorian dates; ordinary dates and leap days pass. Lint, typecheck, and all 181 tests pass.

Goal:

- Ensure date strings accepted by runtime validators and Zod schemas represent real Gregorian calendar dates, not merely the `YYYY-MM-DD` shape.

Files to add/update:

- `src/domain/validation.ts`
- `src/domain/schemas.ts`
- `src/domain/validation.test.ts`

Required changes:

- Introduce or reuse one semantic calendar-date check for both validation paths.
- Keep the canonical `YYYY-MM-DD` representation and existing public types.
- Reject impossible dates before persistence or backup import.

Acceptance criteria:

- Valid ordinary dates and leap days pass.
- Invalid month/day combinations, non-leap February 29, and dates such as `2026-02-31` fail in both runtime and Zod validation.
- Existing backup, domain, lint, and full test checks pass.

### Task 12: Resolve the development dependency advisory safely (high)

Status: BLOCKED upstream, rechecked 2026-10-22. No patched `braces` release is available; the only npm audit fix offered is an unsafe major downgrade to `eslint-config-next@14.2.35`. The affected development-only chain, owner, recheck date, and passing production audit are documented in `SECURITY.md`.

Goal:

- Address the `braces` stack-exhaustion advisory in the ESLint/Next lint-tool dependency chain without introducing a framework downgrade.

Files to add/update:

- `package.json` only if a compatible remediation is available
- `package-lock.json`
- `SECURITY.md` only if the advisory remains blocked upstream and the accepted residual risk needs documenting

Required changes:

- Start from a clean `npm ci` before evaluating installed versions or `npm outdated` output.
- Re-check the advisory and upstream package versions, then prefer a compatible upstream update or a tested, narrowly scoped override.
- Do not run `npm audit fix --force` or downgrade `eslint-config-next` to an older Next.js major to silence the report.
- If no compatible patched release exists, record the unresolved advisory, affected development-only chain, owner/recheck date, and continue enforcing the production audit gate.

Acceptance criteria:

- A compatible fix makes `npm audit` pass, or the task is explicitly marked blocked with the residual risk documented; an unsafe downgrade is not an acceptable resolution.
- Production audit, clean install, lint, typecheck, tests, and build pass after any dependency change.

### Task 13: Type-check production container builds (medium)

Status: COMPLETE, verified 2026-10-20. The container build runs typecheck before build; a deliberate type error fails at the typecheck step. The valid image builds and serves HTTP 200, with lint and all 179 tests passing at verification.

Goal:

- Prevent a Docker build from succeeding with TypeScript errors when Next.js build-time type validation is disabled.

Files to add/update:

- `Dockerfile`

Required changes:

- Run the existing `npm run typecheck` in the builder stage before `npm run build`.
- Keep the existing standalone output and runtime image behavior.

Acceptance criteria:

- A clean Docker image build runs typecheck and fails on a deliberate type error.
- The normal image build, lint, tests, and app startup pass.

### Task 14: Remove production CSP `unsafe-inline` for scripts (medium)

Status: COMPLETE, verified 2026-10-20. Next.js SHA-256 SRI preserves static rendering; the production container uses the standalone wrapper to hash inline scripts and styles. Production `script-src` has no `unsafe-inline` or `unsafe-eval`. CSP E2E passed in all three browser profiles, and all routes loaded from the image without browser errors. The full E2E suite was 23/24 because an unrelated Mobile Safari manual-timer test failed again in isolation.

Goal:

- Reduce the production XSS execution surface while preserving the app's static routes and current Next.js behavior.

Files to add/update:

- `next.config.ts`
- `tests/e2e/headers.spec.ts`
- `SECURITY.md` only if the effective policy or deployment requirement changes

Required changes:

- First verify the supported nonce/hash approach for the repository's Next.js version and current static rendering model.
- Implement the selected approach without enabling `unsafe-eval` or weakening other production directives.
- Do not silently force routes to dynamic rendering; if the policy cannot be tightened without that product/deployment tradeoff, stop and document the decision before changing rendering behavior.

Acceptance criteria:

- Production `script-src` has no `unsafe-inline` or `unsafe-eval`.
- Production header tests assert the policy and all user-facing routes load without CSP violations in Playwright.
- Existing static rendering, deployed HTTPS behavior, lint, typecheck, tests, and build remain valid.

## Suggested Execution Order for This Pass

Task 12 remains blocked pending an upstream `braces` fix; recheck by 2026-11-20. No other security modernization tasks remain.
