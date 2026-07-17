## Plan: iPhone Swift App Migration

Build a native iPhone app with full feature parity by reusing the current domain contracts (dates, adherence math, backup schema, reminder behavior, i18n parity) and implementing an iOS-native architecture (SwiftUI + SwiftData) in a new `ios/` folder in this repository. Keep local-first behavior and preserve JSON backup compatibility with the current web format/version 1.

**Steps**
1. Phase 0: Repository and branch setup
2. Create a migration branch from `master` (suggested name: `ios/swiftdata-full-parity-v1`) and keep all iOS work scoped to a new `ios/` folder to avoid regressions in the existing web app.
3. Add `ios/README.md` with architecture decisions, compatibility guarantees (backup schema v1), and feature-parity checklist. This becomes the source of truth for migration progress.
4. Phase 1: Domain contract extraction (blocks UI/data implementation)
5. Document immutable domain rules in an iOS contract doc by mapping from existing symbols: `getWeekStartDate`, `addDays`, `calculateWeeklyWorkoutProgress`, `calculateWeeklyAdherence`, `buildWeeklyTrends`, and `getRecentWeekStarts` from `src/domain/calc.ts`.
6. Port these pure domain rules into Swift module(s) (no UI/framework dependencies) with strict tests matching current behavior boundaries (Monday week start, 14-day log navigation window, weekly check-in 2 weeks back, adherence thresholds green/yellow/red).
7. Port validation constraints from `src/domain/validation.ts` and `src/domain/schemas.ts` into Swift validators: ISO date (`YYYY-MM-DD`), strict UTC timestamp (`YYYY-MM-DDTHH:mm:ss.SSSZ`), energy range 1..5, weight <= 400, sleepHours <= 24, duration <= 300, text length caps, backup item cap per table.
8. Phase 2: iOS persistence and repository layer (depends on Phase 1)
9. Define SwiftData models mirroring current entities: DailyLog, WeeklyCheckIn, WorkoutLog, including indexed/query-friendly fields (date, weekStartDate, dateTime, type).
10. Implement repository protocols and concrete SwiftData repos analogous to `src/data/repositories/*` to preserve separation of concerns (domain vs persistence).
11. Implement migration/version policy for local schema changes with deterministic upgrade handling and no cloud dependency.
12. Phase 3: Backup compatibility layer (parallel with late Phase 2)
13. Implement BackupData v1 Codable models matching current JSON structure from `src/domain/types.ts` and parsing behavior from `src/data/backup.ts` + `src/domain/validation.ts`.
14. Add pre-parse payload-size guard (5 MB) and max-item guard (10,000 per collection), preserving user-friendly error messages and explicit merge vs overwrite import modes.
15. Add export/import service that wraps repository operations in transactional semantics (all-or-nothing where possible) equivalent to current behavior.
16. Add compatibility tests using golden JSON fixtures exported from web app to guarantee bidirectional import/export parity.
17. Phase 4: SwiftUI app shell and navigation (depends on Phases 1-2)
18. Build tab/navigation structure equivalent to web routes: Overview, Log Today, Check-In, Workout, Settings.
19. Implement first-open language selection flow and settings language switch, matching bilingual behavior and persistence semantics.
20. Implement save confirmation UX equivalent to web transient message (about 1800ms), adapted to iOS-native presentation (toast/banner) without changing save semantics.
21. Phase 5: Feature parity screens (depends on Phase 4; can run in parallel by feature)
22. Log Today screen: date navigation (today back to 13 days), auto-save on field changes, quick workout add/delete, localized numeric input handling for sleep hours.
23. Weekly Check-In screen: Monday-based week navigation (current week + 2 prior), inherited default weight logic from previous week, auto-save on edit completion.
24. Dashboard screen: weekly adherence status, 6-week trends, next actions, and recent workouts using same domain-calculation outputs.
25. Workout screen: preserve existing workout types and logging semantics.
26. Settings screen: reminder toggles/hour, notification permission handling, backup export/import JSON, storage summary, language switching.
27. Phase 6: Reminder engine and notifications (depends on Phase 5 settings)
28. Implement local notification scheduler matching current intent: energy reminder at 15:00 and strength reminder at configurable hour, with once-per-day dedup keys.
29. Normalize/clamp reminder hour to 0..23 on read/write to handle tampered persisted values.
30. Phase 7: Localization parity and accessibility hardening (parallel with Phases 5-6)
31. Create `no` and `en` localization resources mirroring translation keys from `src/i18n/types.ts` and locale dictionaries.
32. Add localization parity tests to ensure key-tree symmetry and format-function coverage analogous to `src/i18n/locales.test.ts`.
33. Validate Dynamic Type, VoiceOver labels/traits, minimum touch target sizes, and contrast.
34. Phase 8: Test strategy and release readiness (depends on all prior phases)
35. Unit tests: domain math, validators, backup parser/limits, reminder settings normalization.
36. Integration tests: repository CRUD + import overwrite/merge semantics + migration behavior.
37. UI tests (XCTest/XCUITest): critical flows for logging, check-in navigation bounds, backup import error messaging, language switch, and notifications settings.
38. Add CI lane for iOS build/test (simulator) while keeping existing web CI unchanged.
39. Add go-live checklist: data-loss risk review, backup roundtrip validation, and user migration notes.

**Relevant files**
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/calc.ts` — Source of truth for week/date/adherence/trend algorithms to port 1:1.
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/validation.ts` — Runtime validation boundaries and strict timestamp/date rules.
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/schemas.ts` — Zod schema limits to mirror in Swift validators.
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/backupLimits.ts` — Backup payload/item guardrails (5 MB, 10,000 items).
- `c:/Users/ywc9314/bardeik/leder-helse/src/domain/types.ts` — Canonical backup/entity shapes for Codable contract.
- `c:/Users/ywc9314/bardeik/leder-helse/src/data/backup.ts` — Import/export behavior, merge/overwrite semantics, and user-facing error mapping.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/logging/hooks/useLogToday.ts` — Date bounds, autosave, workout add/delete semantics.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/logging/hooks/useWeeklyCheckIn.ts` — Week navigation bounds and save semantics.
- `c:/Users/ywc9314/bardeik/leder-helse/src/features/settings/notifications.ts` — Reminder hour clamping, permission flow, dedup behavior.
- `c:/Users/ywc9314/bardeik/leder-helse/src/app/settings/page.tsx` — Settings UX behavior for import/export mode and messages.
- `c:/Users/ywc9314/bardeik/leder-helse/src/i18n/locales.test.ts` — Translation parity/testing pattern to replicate in iOS tests.

**Verification**
1. Domain parity tests: run same scenario matrices in TS and Swift; assert exact outputs for week-start math, adherence %, trend deltas, and status colors.
2. Backup compatibility tests: import web-exported JSON into iOS, then export back and validate schema/value parity (including legacy workout type normalization).
3. Guardrail tests: oversized JSON (>5 MB), malformed JSON, and >10,000-item collections must fail with clear user-facing messages.
4. UI behavior tests: enforce navigation bounds (14-day log window; current + 2 weeks for check-in), autosave confirmation appearance, and delete-workout behavior.
5. Localization tests: key parity for NO/EN resources and formatting function outputs.
6. Notification tests: reminder hour clamping (invalid values fallback/clamp), daily dedup semantics, and correct fire times.
7. CI validation: web pipeline still passes; iOS simulator build+tests pass in dedicated workflow.

**Decisions**
- Included scope: full parity with current web feature set for iPhone only (Swift + SwiftData).
- Included scope: JSON backup compatibility with current BackupData version 1.
- Included scope: keep local-first architecture and no forced cloud sync.
- Excluded scope: Android, Apple Watch, iPad-optimized layouts beyond responsive SwiftUI defaults.
- Excluded scope: backend/cloud sync, push-notification server infrastructure.

**Further Considerations**
1. Migration path for existing users: Option A export/import via JSON only (recommended v1), Option B direct one-time bridge tooling (higher complexity).
2. iOS minimum target: Option A iOS 17+ (best for SwiftData simplicity), Option B iOS 16 support using Core Data fallback layer.
3. Design system parity: Option A preserve current information architecture with native iOS look (recommended), Option B pixel-level visual parity (higher effort, lower native feel).