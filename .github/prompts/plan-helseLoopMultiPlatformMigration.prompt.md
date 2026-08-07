## Plan: Helse Loop Multi-Platform Migration

Build a .NET 10 MAUI Blazor Hybrid and Blazor Web replacement beside the working Next.js app. Port proven contracts first, validate a Web vertical slice with IndexedDB, then reuse the Razor UI in Windows and Android hosts. Keep Apple, authentication, cloud sync, AI, and new product scope outside the parity MVP.

**Outcome artifacts**
- Architectural review: `.github/plans/architecture-review.md`
- Target architecture: `.github/plans/target-architecture.md`
- Issue-ready backlog: `.github/plans/implementation-backlog.md`
- This master execution plan: `.github/plans/migration-plan.md`

**Phase 0 - Decisions and baselines**
1. Record ADRs for side-by-side migration, .NET 10, global Interactive WebAssembly, browser/native persistence split, and no-auth/no-cloud MVP. Confirm the default-daily-log-on-visit behavior with product ownership before porting because it changes adherence data. No implementation phase should bypass this decision.
2. Freeze behavioral baselines from the TypeScript suite into language-neutral examples: week/date arithmetic, thresholds, current-week prorating, dashboard actions, check-in fallback, timer transitions, locale numbers, backup v1, and import limits. Store golden JSON fixtures under `/dotnet/tests/fixtures/backups` and keep the current app green.
3. Define parity gates and cutover criteria: data round-trip, five core workflows, bilingual parity, local-first behavior, accessibility, mobile/desktop layout, security headers, and rollback. This blocks production replacement, not early development.

**Phase 1 - First pull request: domain foundation**
4. Create only the minimal .NET foundation under `/dotnet`: `global.json`, `Directory.Build.props`, `Directory.Packages.props`, `HelseLoop.slnx`, `HelseLoop.Domain`, and `HelseLoop.Domain.Tests`. Target .NET 10, enable nullable/warnings/analyzers, and pin packages.
5. Port domain value semantics and pure calculations from `src/domain/types.ts`, `src/domain/calc.ts`, and `src/domain/workouts.ts`. Use `DateOnly` and UTC `DateTimeOffset`; keep localization out of Domain. Include legacy workout normalization and exact threshold/prorating behavior.
6. Port characterization tests before or with each domain behavior. Add a .NET CI job for restore/build/test without changing the existing Node quality gate. This is PR 1 and must remain independently reviewable.

**Phase 2 - Application boundary and contract safety**
7. Add `HelseLoop.Application` and tests. Define repositories, clock, backup store, typed settings/progress stores, cancellation, and typed errors. Implement daily/check-in/workout/dashboard use cases and navigation rules without Blazor or storage dependencies. Depends on Phase 1.
8. Extract the workout timer into a pure state machine plus application session coordinator. Preserve countdown, work/rest/round-rest/complete transitions, pause, reset, persisted-state normalization, and never-autostart-after-reload behavior.
9. Implement backup v1 DTO serialization/validation in the application boundary. Preserve 5 MB pre-parse limit, 10,000 items per collection, canonical timestamps, legacy type normalization, merge/overwrite semantics, and user-friendly error codes. Run golden fixtures through both TypeScript and .NET readers where automation permits.
10. Add architecture tests that reject references from Domain/Application to UI, browser, MAUI, ASP.NET Core, or concrete persistence. Steps 8 and 9 can run in parallel after application contracts exist.

**Phase 3 - Web vertical slice**
11. Create `HelseLoop.Shared.UI`, `HelseLoop.Infrastructure.Browser`, `HelseLoop.App.Web`, `HelseLoop.App.Web.Client`, and focused tests. Configure global Interactive WebAssembly for app routes and disable prerendering initially to avoid local-storage hydration ambiguity. Depends on Phase 2 contracts.
12. Implement browser adapters with isolated JS modules: IndexedDB repositories, locale/reminder/workout progress settings, import/export file handling, and external links. Start with a new database name or isolated origin; use backup import for migration until in-place Dexie compatibility is proven.
13. Deliver one complete daily-log vertical slice in shared Razor UI: first-run language, `/log`, 14-day bounded navigation, existing/default state, auto-save, localized numeric input, quick workout add/delete, loading/error/empty states, and 1800 ms visible save notice. This is the proof that the same UI/application boundary can serve Web and MAUI.
14. Validate the slice with xUnit, bUnit, real-browser IndexedDB contract tests, Playwright mobile/desktop tests, keyboard/accessibility checks, and a backup round-trip with the TypeScript app. Do not add further pages until this gate passes.

**Phase 4 - Web MVP parity**
15. Port weekly check-in with the three-week bound, previous-weight fallback, localized editing, and auto-save.
16. Port dashboard and history projections, preserving current-week prorating, six-week trends, latest reflection, recent workouts, next actions, loading/empty states, and responsive labels. Keep localization in UI.
17. Port workout UI and session: shared timer components, exercise list, persistence, audio/speech, keep-awake, external media links, pause/reset/complete behavior. Browser capabilities must degrade explicitly.
18. Port settings: language, reminder settings, capability/permission state, storage summary, backup merge/overwrite confirmation, file import/export, and localized validation feedback.
19. Add scoped PWA app-shell caching and update behavior. Test first load, cached reload, offline launch, upgrade, cache ownership, and service-worker retirement. This deliberately restores full offline-shell behavior that the current retired worker does not provide.
20. Recreate production headers/CSP, privacy/security documentation, Fly/container deployment, and Web CI. Align runtime versions and preserve no-server-data behavior. Steps 15-18 can proceed in parallel by feature after the vertical-slice gate; steps 19-20 depend on a stable host.

**Phase 5 - MAUI Windows and Android MVP**
21. Create `HelseLoop.Infrastructure.Native` and `HelseLoop.App.Maui`. Register Shared.UI and native services in the MAUI composition root; keep the native shell minimal.
22. Implement SQLite with explicit schema versions/migrations and execute the same repository/backup contract suite used for IndexedDB. Implement native preferences, file import/export, external URI, and workout-progress adapters.
23. Prove Shared.UI on Windows with the daily-log slice before enabling all routes. Validate WebView CSS, focus, keyboard, safe areas, resize, screen reader labels, startup, and local backup.
24. Prove Shared.UI on Android next. Validate emulator plus physical device for lifecycle/resume, storage retention, file picker, keyboard, rotation, audio/speech, keep-awake, and external links.
25. Implement native scheduled local notifications for Windows/Android with permission/capability states, cancellation, timezone behavior, and delivery caveats. Do not label foreground web reminders as equivalent.
26. Enable all parity routes and run release packaging smoke tests: Windows MSIX/unpackaged decision and Android AAB. Steps 23 and 24 follow storage readiness; platform-specific validation can then proceed in parallel.

**Phase 6 - Apple readiness**
27. Secure a Mac build host, supported Xcode, Apple developer ownership, bundle identifiers, certificates, provisioning profiles, and test devices before committing release dates.
28. Build/test iOS and Mac Catalyst, focusing on WebView, safe areas, lifecycle, file access, notification permissions, audio/speech, external links, and signing. Minimum .NET 10 MAUI Blazor baselines are iOS 16.4+ and macOS 12+.
29. Add macOS CI/build automation and distribution documentation only after signing ownership is sustainable. Apple work is not a blocker for Web/Windows/Android MVP.

**Phase 7 - Stabilization and cutover**
30. Run dual-app backup round trips, migration rehearsals, rollback drills, accessibility review, performance budgets, security/privacy review, dependency scanning, and platform critical-journey E2E.
31. Compare telemetry-free operational signals, crash logs without health payloads, startup/load times, bundle size, and support readiness. Logging must redact notes, weight, sleep, energy, and workout detail by default.
32. Release Web, Windows, and Android in staged order. Keep the Next app deployable until data and workflow parity is demonstrated in production-like environments.
33. Only after explicit approval, retire the Next host, Node workflows, Fly artifacts, and old service-worker cleanup. Archive compatibility fixtures and document support/import windows.

**Relevant current files**
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/types.ts` - source entity and backup shapes.
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/calc.ts` - source calculations and thresholds.
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/validation.ts` - runtime validation/import contract.
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/schemas.ts` - duplicated Zod contract to reconcile.
- `c:/Users/ywc9314/bardeik/leder-helse/src/data/db.ts` - IndexedDB schema/version behavior.
- `c:/Users/ywc9314/bardeik/leder-helse/src/data/backup.ts` - transaction and merge/overwrite behavior.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/logging/hooks/useLogToday.ts` - daily use case currently embedded in React.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/logging/hooks/useWeeklyCheckIn.ts` - check-in use case and fallback.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/dashboard/trends.ts` - dashboard projection behavior.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/workout/hooks/useWorkoutTimer.ts` - timer state machine to extract.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/settings/notifications.ts` - current foreground reminder limitations.
- `c:/Users/ywc9314/bardeik/leder-helse/src/app/settings/page.tsx` - browser file/capability orchestration.
- `c:/Users/ywc9314/bardeik/leder-helse/src/i18n` - bilingual copy and parity tests.
- `c:/Users/ywc9314/bardeik/leder-helse/public/sw.js` - intentionally retired service worker.
- `c:/Users/ywc9314/bardeik/leder-helse/next.config.ts` - security header baseline.
- `c:/Users/ywc9314/bardeik/leder-helse/.github/workflows` - current CI/security gates.

**Verification gates**
1. Every PR: existing `npm run lint`, `npm run test`, and `npm run build` remain green while TypeScript is present; new `dotnet restore`, `dotnet build --no-restore`, and `dotnet test --no-build` pass for affected projects.
2. Domain gate: TypeScript and .NET characterization examples agree exactly for dates, adherence, trends, goals, validation, and timer transitions.
3. Storage gate: repository contract suite passes against IndexedDB and SQLite; backup import is atomic; malformed/oversized payloads perform no writes.
4. Web slice gate: Playwright proves local persistence, reload, auto-save notice visibility, mobile/desktop layout, language switching, and TypeScript/.NET backup round-trip.
5. Web parity gate: all five core workflows operate with no server data dependency; offline app-shell launch is tested after PWA work.
6. Native gate: Windows and Android critical journeys pass on packaged builds; Android also passes on a physical device before release.
7. Apple gate: signed builds on real devices and documented provisioning; not required for earlier MVP.
8. Cutover gate: migration and rollback rehearsed, privacy/security docs current, no critical accessibility defects, and explicit product approval.

**Decisions**
- Include: daily energy/sleep, weekly weight/reflection, workout logs/timer, dashboard/history, settings/reminders, bilingual UI, backup, local persistence.
- Exclude from parity MVP: auth, cloud sync, API clients, AI, focus areas, habits, generalized goals, camera, biometrics, deep links, and health-data telemetry.
- Use .NET 10 and current supported MAUI 10 servicing level; pin and update regularly because MAUI support is shorter than .NET LTS.
- Use global Interactive WebAssembly for the local-first Web app; no Interactive Server dependency for core workflows.
- Use separate Browser and Native infrastructure projects rather than one shared implementation project.
- Preserve Next production until staged cutover; do not rewrite in place.
- Preserve backup v1 and numeric IDs during parity. Any sync identity or backup v2 is a later explicit migration.
- First PR is domain foundation plus tests and CI, not a full solution skeleton with empty hosts.

**First PR**

# PR 1: Establish .NET domain foundation

## Purpose
Create the smallest durable .NET migration boundary and prove that current business rules can be ported without touching production UI or data.

## Changes
- Add `/dotnet` solution-level pinning and build settings.
- Add `HelseLoop.Domain` and `HelseLoop.Domain.Tests` only.
- Port date/value semantics, entities, workout normalization, weekly goals, adherence, and trends.
- Port characterization tests from current Vitest cases.
- Add independent .NET CI restore/build/test job.
- Add ADR for side-by-side migration and .NET 10/global WASM direction.

## Not included
- Blazor, MAUI, IndexedDB, SQLite, UI, backup writes, notifications, auth, cloud, or removal/refactoring of Next code.

## Acceptance criteria
- Existing Node CI remains green.
- .NET restore/build/test pass on a clean checkout.
- Domain project has no UI/storage/framework dependency beyond base .NET.
- Characterization results match TypeScript behavior.
- Date and timestamp semantics are explicit and tested.

## Risk
Rounding/date behavior may diverge between JS and .NET. Mitigate with exact fixtures, UTC/date-only types, and boundary tests.

## Test
Run Node quality commands and .NET restore/build/test in CI; compare fixed examples for Monday boundaries, 49/50/79/80 status thresholds, partial-week denominator, workout caps, trend rounding, and legacy workout normalization.
